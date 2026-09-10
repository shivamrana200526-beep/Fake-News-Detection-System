import { useState, useRef, useCallback } from "react";
export function useVoiceInput(onResult) {
    const [isListening, setIsListening] = useState(false);
    const [isSupported] = useState(() => "webkitSpeechRecognition" in window || "SpeechRecognition" in window);
    const recognitionRef = useRef(null);
    const start = useCallback(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition)
            return;
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = "en-US";
        recognition.onstart = () => setIsListening(true);
        recognition.onend = () => setIsListening(false);
        recognition.onerror = () => setIsListening(false);
        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            onResult(transcript);
        };
        recognitionRef.current = recognition;
        recognition.start();
    }, [onResult]);
    const stop = useCallback(() => {
        recognitionRef.current?.stop();
        setIsListening(false);
    }, []);
    return { isListening, isSupported, start, stop };
}
