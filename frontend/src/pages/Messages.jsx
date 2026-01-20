import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';

const Messages = () => {
  const conversations = [
    {
      id: 1,
      name: "Priya S.",
      lastMessage: "Thank you for your interest! I would love to know more about your hobbies.",
      time: "2 hours ago",
      unread: true,
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBW1mAT0UcUVnYF2ccMiKr_5WGPwRF8vCGNfRoubk1aBSvEBDOis4n9AON_s72RSRW8tyinX8mplLrPJMeE0XSwYjr6jwLH9Pf5jJXNN1_F3JF1r68qj9Y5RG17fzxSQ2sE1pUMQC3OFiHUimD-GJ2jJ2xBx-PqDGHZ_3qHko_t_lCrR8X4WlKi0lnP8kvmNpjZQJYtFC-fSNMUphIIMbCmiTqfHx50heZWkNsZjev_t1j_U_OqyhyP9mwCS-ZyfVMFikzuehCcjC2Y",
      matchScore: 94
    },
    {
      id: 2,
      name: "Rohan K.",
      lastMessage: "That sounds wonderful! Are you open to meeting in person?",
      time: "1 day ago",
      unread: false,
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuC89ut01yTgADvam3KjU8fg9T2nnF7-2SQtSBP-NAgbDSfGfnT56aJNeJLa9im3uGvEGDNOkpD9HA93bKXHj6JbPsYTMZWyndHs94HEjAa8aOTiGhOeg57fWTxv3b-fYjbhQ7e7ga7lyBhp4sn-6ZG6z6AexaIK_VGqAU3vG5ttMZWMKA9fy5Jcb1LURPDWEuLfxRHekXnJvRSMUkEctO5D0zoEUwt_cXMIVlJJAQLX5N1J1qPUikIi7Qo0IkHFhiOK73cCmm58s9Cx",
      matchScore: 94
    },
    {
      id: 3,
      name: "Ananya M.",
      lastMessage: "I appreciate the thoughtful introduction. Looking forward to connecting!",
      time: "3 days ago",
      unread: false,
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBP2Y3C_piHzfWpAVEt9-JoAUOjxVRRijpeBqnWV38n_DUeJTsZwu1vKeM3luNY42ps53UEitEgKKXyM9yyr8HbWj7FMDZDnr1td826Pzkd3KPgwwV_JPrVJGjqRkVKeziHzuwWDwBYkqSWuMU_cbzrkiJqc19OnyXpieU0RaGMpgWisRqpci2BNia0MdfGprATsLfHu7Pk8fsIojJO_Sy0CkG5lW7w2TvUtwCVtEyxMadgk9UCXknykv7UY-rGlSu2UHCWh1UTFTCw",
      matchScore: 88
    }
  ];

  const [selectedConversation, setSelectedConversation] = React.useState(conversations[0]);

  return (
    <div className="min-h-screen bg-background-light flex flex-col">
      <Header variant="authenticated" userName="Sarah" />
      
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 md:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-text-charcoal font-serif">Messages</h1>
          <p className="text-text-muted mt-2">Connect with your matches through our secure messaging platform.</p>
        </div>

        <div className="bg-white rounded-2xl shadow-soft border border-stone-100 overflow-hidden flex h-[600px]">
          {/* Conversation List */}
          <div className="w-full md:w-1/3 border-r border-stone-100 overflow-y-auto">
            <div className="p-4 border-b border-stone-100">
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-xl">search</span>
                <input 
                  type="text" 
                  placeholder="Search conversations..." 
                  className="w-full pl-10 pr-4 py-2 bg-stone-50 border border-stone-200 rounded-full text-sm focus:outline-none focus:border-primary"
                />
              </div>
            </div>
            
            {conversations.map((conv) => (
              <div 
                key={conv.id}
                onClick={() => setSelectedConversation(conv)}
                className={`p-4 border-b border-stone-50 cursor-pointer transition-colors ${
                  selectedConversation?.id === conv.id ? 'bg-primary/5' : 'hover:bg-stone-50'
                }`}
              >
                <div className="flex gap-3">
                  <div 
                    className="size-12 rounded-full bg-cover bg-center shrink-0 border-2 border-white shadow-sm"
                    style={{ backgroundImage: `url('${conv.image}')` }}
                  ></div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-1">
                      <h3 className={`font-semibold text-text-charcoal ${conv.unread ? 'font-bold' : ''}`}>
                        {conv.name}
                      </h3>
                      <span className="text-xs text-text-muted">{conv.time}</span>
                    </div>
                    <p className={`text-sm truncate ${conv.unread ? 'text-text-charcoal font-medium' : 'text-text-muted'}`}>
                      {conv.lastMessage}
                    </p>
                  </div>
                  {conv.unread && (
                    <span className="size-2 bg-primary rounded-full shrink-0 mt-2"></span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Chat Area */}
          <div className="hidden md:flex flex-1 flex-col">
            {selectedConversation ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b border-stone-100 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div 
                      className="size-10 rounded-full bg-cover bg-center border-2 border-white shadow-sm"
                      style={{ backgroundImage: `url('${selectedConversation.image}')` }}
                    ></div>
                    <div>
                      <h3 className="font-semibold text-text-charcoal">{selectedConversation.name}</h3>
                      <span className="text-xs text-primary">{selectedConversation.matchScore}% Match</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button className="size-10 rounded-full border border-stone-200 flex items-center justify-center text-text-muted hover:text-primary hover:border-primary transition-colors">
                      <span className="material-symbols-outlined text-xl">videocam</span>
                    </button>
                    <button className="size-10 rounded-full border border-stone-200 flex items-center justify-center text-text-muted hover:text-primary hover:border-primary transition-colors">
                      <span className="material-symbols-outlined text-xl">more_vert</span>
                    </button>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                  <div className="flex justify-center">
                    <span className="text-xs text-text-muted bg-stone-100 px-3 py-1 rounded-full">Conversation started on Dec 18, 2025</span>
                  </div>
                  
                  <div className="flex justify-start">
                    <div className="max-w-[70%] bg-stone-100 rounded-2xl rounded-bl-sm px-4 py-3">
                      <p className="text-sm text-text-charcoal">Hello! I came across your profile and was impressed by your background. I'd love to get to know you better.</p>
                      <span className="text-xs text-text-muted mt-1 block">10:30 AM</span>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <div className="max-w-[70%] bg-primary text-white rounded-2xl rounded-br-sm px-4 py-3">
                      <p className="text-sm">Thank you for reaching out! I appreciate the kind words. I'd be happy to connect.</p>
                      <span className="text-xs text-white/70 mt-1 block">10:45 AM</span>
                    </div>
                  </div>

                  <div className="flex justify-start">
                    <div className="max-w-[70%] bg-stone-100 rounded-2xl rounded-bl-sm px-4 py-3">
                      <p className="text-sm text-text-charcoal">{selectedConversation.lastMessage}</p>
                      <span className="text-xs text-text-muted mt-1 block">{selectedConversation.time}</span>
                    </div>
                  </div>
                </div>

                {/* Input */}
                <div className="p-4 border-t border-stone-100">
                  <div className="flex gap-3">
                    <button className="size-10 rounded-full border border-stone-200 flex items-center justify-center text-text-muted hover:text-primary transition-colors shrink-0">
                      <span className="material-symbols-outlined text-xl">attach_file</span>
                    </button>
                    <input 
                      type="text" 
                      placeholder="Type a message..." 
                      className="flex-1 px-4 py-2 bg-stone-50 border border-stone-200 rounded-full text-sm focus:outline-none focus:border-primary"
                    />
                    <button className="size-10 rounded-full bg-primary text-white flex items-center justify-center hover:bg-primary/90 transition-colors shrink-0">
                      <span className="material-symbols-outlined text-xl">send</span>
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-text-muted">
                <p>Select a conversation to start messaging</p>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Messages;
