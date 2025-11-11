import { useState } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import AIButton from './components/AIButton';
import AIModal from './components/AIModal';

function App() {
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [transcript, setTranscript] = useState('');

  const handleMicClick = () => {
    setIsAIModalOpen(true);
    setTranscript('');

    setTimeout(() => {
      setTranscript('Show me all high-priority support tickets');

      setTimeout(() => {
        setIsAIModalOpen(false);
      }, 2000);
    }, 1500);
  };

  const handleCloseModal = () => {
    setIsAIModalOpen(false);
    setTranscript('');
  };

  return (
    <div className="min-h-screen bg-[#1A202C]">
      <Sidebar />
      <Header />

      <main className="ml-20 mt-16 h-[calc(100vh-64px)] flex items-center justify-center p-8">
        <div className="text-center">
          <h2 className="text-5xl font-light text-[#E2E8F0] mb-4 tracking-wide">
            Welcome to <span className="text-[#BDB1A1]">InventoryX</span>
          </h2>
          <p className="text-[#A0AEC0] text-lg font-light mb-16">
            Manage your business with conversational AI
          </p>

          <AIButton onClick={handleMicClick} isListening={isAIModalOpen} />
        </div>
      </main>

      <AIModal isOpen={isAIModalOpen} onClose={handleCloseModal} transcript={transcript} />
    </div>
  );
}

export default App;
