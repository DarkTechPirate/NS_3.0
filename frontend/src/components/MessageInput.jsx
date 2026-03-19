import React, { useState, useRef } from 'react';
import { Send, Paperclip, X, Image as ImageIcon } from 'lucide-react';
import useMessagingStore from '../store/useMessagingStore';

const MessageInput = () => {
  const [text, setText] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [attachment, setAttachment] = useState(null);
  const fileInputRef = useRef(null);
  
  const { sendMessage, uploadAttachment } = useMessagingStore();

  const handleSend = async (e) => {
    e.preventDefault();
    if ((!text.trim() && !attachment) || isUploading) return;

    const attachments = attachment ? [attachment] : [];
    await sendMessage(text, null, attachments);
    
    setText('');
    setAttachment(null);
  };

  const onFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const data = await uploadAttachment(file);
      setAttachment(data);
    } catch (err) {
      console.error("Upload failed", err);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="p-4 border-t bg-white/80 backdrop-blur-md">
      {attachment && (
        <div className="mb-3 p-2 bg-stone-50 rounded-xl border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-white rounded-lg border shadow-sm">
                {attachment.type.startsWith('image/') ? <ImageIcon size={16} /> : <Paperclip size={16} />}
            </div>
            <span className="text-xs font-medium truncate max-w-[200px]">{attachment.name}</span>
          </div>
          <button onClick={() => setAttachment(null)} className="p-1 hover:bg-stone-200 rounded-full">
            <X size={14} />
          </button>
        </div>
      )}

      <form onSubmit={handleSend} className="flex items-end gap-2">
        <button 
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="p-3 text-text-muted hover:text-primary hover:bg-primary/5 rounded-xl transition-all"
        >
          <Paperclip size={20} />
        </button>
        
        <input 
          type="file" 
          ref={fileInputRef} 
          className="hidden" 
          onChange={onFileChange}
        />

        <div className="flex-1 min-h-[44px] max-h-32 overflow-y-auto bg-stone-50 border border-stone-200 rounded-2xl focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 transition-all">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type your message..."
            className="w-full px-4 py-2.5 bg-transparent border-none focus:ring-0 text-sm resize-none"
            rows="1"
            onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend(e);
                }
            }}
          />
        </div>

        <button 
          type="submit"
          disabled={(!text.trim() && !attachment) || isUploading}
          className={`
            p-3 rounded-xl transition-all
            ${(!text.trim() && !attachment) || isUploading 
              ? 'bg-stone-100 text-stone-400' 
              : 'bg-primary text-white shadow-lg shadow-primary/20 hover:scale-105 active:scale-95'
            }
          `}
        >
          <Send size={20} />
        </button>
      </form>
    </div>
  );
};

export default MessageInput;
