import { useState } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import AIButton from './components/AIButton';
import AIModal from './components/AIModal';
import { startAssistant, stopAssistant } from './components/AggorA';

function App() {
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [transcript, setTranscript] = useState('');

  const handleMicClick = async () => {
    if (isAIModalOpen) {
      // If already listening, stop it
      await stopAssistant();
      setIsAIModalOpen(false);
      setTranscript('');
    } else {
      // Start listening
      setIsAIModalOpen(true);
      setTranscript('');
      
      try {
        await startAssistant();
        console.log('✅ Assistant started successfully');
      } catch (error: any) {
        console.error('❌ Error starting assistant:', error);
        setIsAIModalOpen(false);
        setTranscript('');
        
        // Provide user-friendly error message
        const errorMessage = error?.message || String(error);
        if (errorMessage.includes('Invalid App ID Configuration')) {
          alert(
            'Configuration Error: Invalid App ID\n\n' +
            'The App ID from the backend is not valid for Agora RTC.\n\n' +
            'Please set ACTUAL_RTC_APP_ID in Backend/stockkk/views.py\n' +
            'with your actual RTC App ID from Agora Console.\n\n' +
            'Check the browser console for more details.'
          );
        } else {
          alert('Failed to start assistant. Please check the console for details.');
        }
      }
    }
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
