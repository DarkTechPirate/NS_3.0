import React, { useEffect, useRef } from 'react';
import { User as UserIcon, MoreHorizontal, Phone, Video, ChevronLeft } from 'lucide-react';
import useMessagingStore from '../store/useMessagingStore';
import MessageBubble from './MessageBubble';
import MessageInput from './MessageInput';
import { useAuth } from '../context/AuthContext';

const ChatWindow = ({ isMobile, onBack }) => {
  const { activeConversation, messages, isLoading } = useMessagingStore();
  const { user } = useAuth();
  const scrollRef = useRef(null);

  const toId = (value) => String(value?._id ?? value ?? '');

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  if (!activeConversation) return null;

  const otherUser = activeConversation.participants.find(p => p._id !== user?._id) || { fullname: 'User' };

  return (
    <div className="flex flex-col h-full bg-[#f8f9fa]">
      {/* Header */}
      <div className="p-4 bg-white border-b flex items-center justify-between shadow-sm z-10">
        <div className="flex items-center gap-3">
          {isMobile && (
            <button onClick={onBack} className="p-2 -ml-2 hover:bg-stone-100 rounded-full transition-colors">
              <ChevronLeft size={24} />
            </button>
          )}
          <div className="size-10 rounded-full overflow-hidden bg-stone-100 border border-stone-200 flex items-center justify-center">
            {otherUser.profilePicture ? (
              <img src={otherUser.profilePicture} alt={otherUser.fullname} className="w-full h-full object-cover" />
            ) : (
              <UserIcon size={20} className="text-stone-400" />
            )}
          </div>
          <div>
            <h3 className="font-semibold text-text-charcoal leading-tight">{otherUser.fullname}</h3>
            <span className="text-[10px] text-green-500 font-medium">Online</span>
          </div>
        </div>
        
        <div className="flex items-center gap-1">
          <button className="p-2.5 text-text-muted hover:text-primary hover:bg-primary/5 rounded-full transition-all">
            <Phone size={20} />
          </button>
          <button className="p-2.5 text-text-muted hover:text-primary hover:bg-primary/5 rounded-full transition-all">
            <Video size={20} />
          </button>
          <button className="p-2.5 text-text-muted hover:text-primary hover:bg-primary/5 rounded-full transition-all">
            <MoreHorizontal size={20} />
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar bg-[#fbfbfd]"
      >
        {isLoading && messages.length === 0 ? (
          <div className="flex items-center justify-center h-full opacity-50">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <>
            <div className="flex justify-center mb-6">
              <span className="text-[10px] px-3 py-1 bg-stone-200/50 backdrop-blur-sm rounded-full text-text-muted font-medium">
                CONVERSATION STARTED
              </span>
            </div>
            {messages.map((msg) => (
              <MessageBubble 
                key={msg.id || msg._id} 
                message={msg} 
                isOwn={toId(msg.senderId || msg.sender?._id) === toId(user?._id)} 
              />
            ))}
          </>
        )}
      </div>

      {/* Input Area */}
      <MessageInput />
    </div>
  );
};

export default ChatWindow;
