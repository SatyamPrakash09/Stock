import React, { useState } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card, CardContent } from "./ui/card";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(API_KEY);

// Backend URL
const BASE_URL = "http://127.0.0.1:8000";

interface ChatMessage {
  role: "user" | "assistant";
  text: string;
}

export default function ChatBox() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [text, setText] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  /* ----------------------------------------------------------------
      STEP 1 — INTENT DETECTION USING GEMINI
  ---------------------------------------------------------------- */
  async function detectIntent(message: string) {
    const prompt = `
You are an INTENT CLASSIFIER for an INVENTORY SYSTEM.
You DO NOT answer normally. You ONLY output JSON.

❗IMPORTANT:
The word "stock" ALWAYS refers to INVENTORY items.
It NEVER means stock market, shares, trading, portfolio, NSE, NYSE, crypto, etc.

---------------------------------------------
INVENTORY API MODE (intent = "api")
Trigger if user says ANY of these (in English or Hinglish):

• get all items
• get all item details
• get all details of item
• get all stock
• list all items
• show all items
• check my stock
• inventory batao
• sab items dikhao
• sara stock dikhao
• item details
• check <item>
• show <item>
• update <item> <qty>
• add <item> <qty>

If message contains ANYTHING related to items / stock / inventory —
→ ALWAYS classify as API mode.

---------------------------------------------
CHAT MODE (intent = "chat")
Trigger ONLY IF:
• greetings (hi, hello, how are you)
• jokes
• emotions
• normal talking
• stock market related words (shares, market, NSE, BSE, crypto, investment)
• ANYTHING NOT related to inventory items

---------------------------------------------
OUTPUT FORMAT (STRICT JSON)
For chat:
{
  "intent": "chat"
}

For API:
{
  "intent": "api",
  "action": "<getAll | checkItem | addItem | updateItem | listLowStock>",
  "item": "<item name or empty string>",
  "qty": "<qty or empty string>"
}

NO explanation, NO extra text. JSON ONLY.
`;

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const result = await model.generateContent(prompt + "\nUser: " + message);

    try {
      let raw = result.response.text();     // string
      raw = raw.replace(/```json|```/g, "").trim();
      console.log("RAW:", raw);

      // Convert string → JSON object
      const data = JSON.parse(raw);

      // console.log(data.intent);   // "api"
      console.log(data);
      return { intent: data, action: data.action };
    } catch {
      return { intent: "chat", action: "chat" };
    }
  }


  /* ----------------------------------------------------------------
      STEP 2 — CALL BACKEND BASED ON ACTION
  ---------------------------------------------------------------- */
  async function callBackend(intent: any, action: any) {
    console.log(intent)
    if (action.action === "getAll") {
      const res = await fetch(BASE_URL + "/");
      const data = await res.json();

      return `Here are all items:\n${formatItems(data)}`;
    }

    if (action.action === "checkItem") {
      console.log(intent.intent.item)
      const res = await fetch(BASE_URL + "/checkItem/" + intent.intent.item, {
        method: "PUT",
        headers: { "Content-Type": "application/json" }
      });
      const data = await res.json();

      return summarizeItem(intent.intent.item, data);
    }

    if (action.action === "addItem") {
      const body = {
        name: intent.intent.item,
        stock: intent.intent.qty || 1,
        expiry_date: "2026-01-01"
      };

      const res = await fetch(BASE_URL + "/addItem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });

      return `${intent.intent.item} added successfully! 🎉`;
    }

    if (action.action === "updateItem") {
      const body = {
        name: intent.item,
        stock: intent.qty || 1
      };

      const res = await fetch(BASE_URL + "/updateItem/" + intent.item, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });

      return `${intent.item} updated successfully! 🔄`;
    }

    if (action.action === "listLowStock") {
      const res = await fetch(BASE_URL + "/listLessIt");
      const data = await res.json();

      return `Low stock items:\n${formatItems(data)}`;
    }

    return "I understood your request but no backend action matched.";
  }

  /* ----------------------------------------------------------------
      HELPERS (Formatter + Summaries)
  ---------------------------------------------------------------- */
  function formatItems(items: any[]) {
    return items
      .map(
        (i) =>
          `${i.name} — stock: ${i.stock}, expires: ${i.expiry_date.split("T")[0]}`
      )
      .join("\n");
  }

  async function summarizeItem(name: string, itemData: any) {
    if (!itemData || itemData.error)
      return `No item named "${name}" was found.`;

    const promp = `
Summarize this (Note - this user stock details!)
Item: ${itemData.name}
Stock: ${itemData.stock}
Expires: ${itemData.expiry_date}
Added On: ${itemData.created_at}
  `;

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const result = await model.generateContent(promp);

    return result.response.text();   // ✅ FIXED
  }


  /* ----------------------------------------------------------------
      MAIN HANDLER
  ---------------------------------------------------------------- */
  const sendMessage = async () => {
    if (!text.trim()) return;

    const userMsg = text;
    setMessages((prev) => [...prev, { role: "user", text: userMsg }]);
    setText("");
    setIsLoading(true);

    try {
      const intent = await detectIntent(userMsg);
      const action = await detectIntent(userMsg);

      console.log(intent.intent.intent)

      if (intent.intent.intent === "chat") {
        // normal chat response
        const chatModel = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
        const chatRes = await chatModel.generateContent(userMsg);

        setMessages((prev) => [
          ...prev,
          { role: "assistant", text: chatRes.response.text() },
        ]);
        setIsLoading(false);
        return;
      }

      // API MODE → call backend & summarize
      const responseText = await callBackend(intent, action);

      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: responseText },
      ]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: "⚠️ Error: " + err.message },
      ]);
    }

    setIsLoading(false);
  };

  /* ----------------------------------------------------------------
      UI
  ---------------------------------------------------------------- */
  return (
    <div className="w-full max-w-lg mx-auto mt-6">
      <Card className="bg-neutral-900 border-neutral-700">
        <CardContent className="p-4">

          <div className="h-96 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`p-3 rounded-xl max-w-[80%] whitespace-pre-wrap ${m.role === "user"
                    ? "ml-auto bg-blue-600 text-white"
                    : "mr-auto bg-neutral-800 text-gray-200"
                  }`}
              >
                {m.text}
              </div>
            ))}

            {isLoading && (
              <div className="mr-auto bg-neutral-800 text-gray-400 p-3 rounded-xl">
                Thinking...
              </div>
            )}
          </div>

          <div className="flex items-center mt-4 gap-2">
            <Input
              className="flex-1 bg-neutral-800 border-neutral-700 text-gray-200"
              placeholder="Type message..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            />

            <Button onClick={sendMessage} className="bg-blue-600">
              Send
            </Button>
          </div>

        </CardContent>
      </Card>
    </div>
  );
}
