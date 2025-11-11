import { Mic } from 'lucide-react';

interface AIButtonProps {
  onClick: () => void;
  isListening: boolean;
}

export default function AIButton({ onClick, isListening }: AIButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`w-24 h-24 rounded-full bg-[#BDB1A1] hover:bg-[#C0A062] flex items-center justify-center shadow-2xl transition-all duration-300 ${
        isListening ? 'scale-110' : 'hover:scale-110'
      }`}
      style={{
        animation: isListening ? 'none' : 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }}
    >
      <Mic className={`w-12 h-12 text-[#1A202C] ${isListening ? 'animate-pulse' : ''}`} />
      <style>{`
        @keyframes pulse {
          0%, 100% {
            box-shadow: 0 0 0 0 rgba(189, 177, 161, 0.7);
          }
          50% {
            box-shadow: 0 0 0 30px rgba(189, 177, 161, 0);
          }
        }
      `}</style>
    </button>
  );
}
