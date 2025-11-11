import { Square } from 'lucide-react';
import { useEffect, useState } from 'react';

interface AIModalProps {
  isOpen: boolean;
  onClose: () => void;
  transcript: string;
}

export default function AIModal({ isOpen, onClose, transcript }: AIModalProps) {
  const [bars, setBars] = useState<number[]>(Array(40).fill(2));

  useEffect(() => {
    if (!isOpen) return;

    const interval = setInterval(() => {
      setBars(Array(40).fill(0).map(() => Math.random() * 40 + 10));
    }, 100);

    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn">
      <div className="bg-[#2D3748] border border-[#BDB1A1] rounded-2xl p-8 max-w-2xl w-full mx-4 shadow-2xl">
        <div className="text-center mb-8">
          <h2 className="text-[#E2E8F0] text-2xl font-light mb-2">
            {transcript ? 'Processing...' : "I'm listening..."}
          </h2>
          <p className="text-[#A0AEC0] text-sm font-light">
            Speak naturally to interact with your dashboard
          </p>
        </div>

        <div className="flex items-center justify-center gap-1 h-32 mb-8">
          {bars.map((height, index) => (
            <div
              key={index}
              className="w-1.5 bg-gradient-to-t from-[#BDB1A1] to-[#C0A062] rounded-full transition-all duration-100"
              style={{ height: `${height}px` }}
            />
          ))}
        </div>

        {transcript ? (
          <div className="bg-[#1A202C] rounded-lg p-4 mb-6 min-h-[80px] border border-[#374151]">
            <p className="text-[#E2E8F0] font-light">{transcript}</p>
          </div>
        ) : (
          <div className="bg-[#1A202C] rounded-lg p-4 mb-6 min-h-[80px] border border-[#374151]">
            <p className="text-[#A0AEC0] text-sm font-light italic">
              Try saying: "Show me all stock levels for SKU 405-B" or "What are my new leads from
              today?"
            </p>
          </div>
        )}

        <button
          onClick={onClose}
          className="w-full py-3 bg-[#BDB1A1] hover:bg-[#C0A062] rounded-lg text-[#1A202C] font-light transition-colors flex items-center justify-center gap-2"
        >
          <Square className="w-5 h-5 fill-current" />
          Stop Listening
        </button>
      </div>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}
