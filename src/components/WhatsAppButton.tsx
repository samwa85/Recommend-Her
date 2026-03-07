import { MessageCircle } from 'lucide-react';

const WhatsAppButton = () => {
  const phoneNumber = '255789990330';
  const message = 'Hello! I would like to learn more about Recommend Her.';
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 group"
      aria-label="Chat on WhatsApp"
    >
      {/* Tooltip */}
      <div className="absolute bottom-full right-0 mb-3 px-4 py-2 bg-white rounded-lg shadow-lg 
                      text-sm font-medium text-gray-700 whitespace-nowrap
                      opacity-0 group-hover:opacity-100 transform group-hover:translate-y-0 
                      translate-y-2 transition-all duration-300 pointer-events-none">
        Chat with us
        <div className="absolute top-full right-6 w-0 h-0 border-l-8 border-r-8 border-t-8 
                        border-transparent border-t-white"></div>
      </div>
      
      {/* Button */}
      <div className="w-14 h-14 bg-[#25D366] rounded-full flex items-center justify-center
                      shadow-lg shadow-green-500/30 hover:shadow-xl hover:shadow-green-500/40
                      transform hover:scale-110 transition-all duration-300
                      hover:-translate-y-1">
        <MessageCircle className="w-7 h-7 text-white" fill="white" />
      </div>
      
      {/* Pulse animation ring */}
      <div className="absolute inset-0 rounded-full bg-[#25D366] animate-ping opacity-20"></div>
    </a>
  );
};

export default WhatsAppButton;
