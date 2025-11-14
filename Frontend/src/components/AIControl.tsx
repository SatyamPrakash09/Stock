import { useState } from "react";
import AIButton from "./AIButton";     // <-- THIS CONNECTS THEM
import { startAssistant, stopAssistant } from "./AggorA";

export default function AIControl() {
    const [isListening, setIsListening] = useState(false);

    const handleClick = async () => {
        if (!isListening) {
            await startAssistant();   // Start first
            setIsListening(true);     // THEN update UI
        } else {
            await stopAssistant();    // Stop first
            setIsListening(false);    // THEN update UI
        }
    };

    return (
        <AIButton 
            onClick={handleClick}
            isListening={isListening}
        />
    );
}
