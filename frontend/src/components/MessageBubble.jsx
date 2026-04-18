import React from 'react';
import { format } from 'date-fns';
import { Check, CheckCheck, FileText, Download } from 'lucide-react';

const MessageBubble = ({ message, isOwn }) => {
  const { content, createdAt, type, attachments, isRead } = message;

  const formatTime = (date) => {
    try {
        return format(new Date(date), 'HH:mm');
    } catch (e) {
        return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
  };

  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-4 px-2 md:px-4`}>
      <div className="max-w-[75%] md:max-w-[60%] group relative">
        <div className={`
          px-4 py-2 rounded-2xl shadow-sm
          ${isOwn 
            ? 'bg-[#C10E62] text-white rounded-br-none border border-[#B20B5A]' 
            : 'bg-white border border-stone-200 text-text-charcoal rounded-bl-none'
          }
        `}>
          {type === 'IMAGE' && attachments?.length > 0 && (
            <div className="mb-2 -mx-2 -mt-1 overflow-hidden rounded-xl">
              <img 
                src={attachments[0].url} 
                alt="attachment" 
                className="w-full h-auto object-cover max-h-60 hover:scale-105 transition-transform duration-300 cursor-pointer"
              />
            </div>
          )}

          {type === 'FILE' && attachments?.length > 0 && (
            <div className={`
              flex items-center gap-3 p-3 mb-2 rounded-xl border
              ${isOwn ? 'bg-white/10 border-white/20' : 'bg-stone-50 border-stone-200'}
            `}>
              <div className={`p-2 rounded-lg ${isOwn ? 'bg-white/20' : 'bg-white shadow-sm'}`}>
                <FileText size={20} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{attachments[0].name}</p>
                <p className="text-[10px] opacity-70">{(attachments[0].size / 1024).toFixed(1)} KB</p>
              </div>
              <a href={attachments[0].url} download className="p-2 hover:bg-black/5 rounded-full transition-colors">
                <Download size={16} />
              </a>
            </div>
          )}

          <p className="text-sm whitespace-pre-wrap leading-relaxed">{content}</p>
          
          <div className={`flex items-center justify-end gap-1.5 mt-1 ${isOwn ? 'text-white/80' : 'text-stone-400'}`}>
            <span className="text-[10px]">{formatTime(createdAt)}</span>
            {isOwn && (
              <span className="flex">
                {isRead ? (
                  <CheckCheck size={14} className="text-blue-100" />
                ) : (
                  <Check size={14} />
                )}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
