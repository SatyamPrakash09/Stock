import { useState } from "react";
import AIButton from "./AIButton";     // <-- THIS CONNECTS THEM
import { startAssistant, stopAssistant } from "./AggorA";

export default function AIControl() {
    const [isListening, setIsListening] = useState(false);

    const handleClick = async () => {
        console.log("Button clicked, isListening:", isListening);
        if (!isListening) {
            await startAssistant();
            setIsListening(true);
        } else {
            await stopAssistant();
            setIsListening(false);
        }
    };


    return (
        <AIButton
            onClick={handleClick}
            isListening={isListening}
        />
    );
}
