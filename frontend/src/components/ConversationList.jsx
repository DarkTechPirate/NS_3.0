import React, { useState } from 'react';
import { Search, User as UserIcon, MessageSquare } from 'lucide-react';
import useMessagingStore from '../store/useMessagingStore';
import { useAuth } from '../context/AuthContext';

const ConversationList = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const { conversations, activeConversation, setActiveConversation, isLoading } = useMessagingStore();
  const { user } = useAuth();

  const filteredConversations = conversations.filter(conv => {
    const otherUser = conv.participants.find(p => p._id !== user?._id);
    return otherUser?.fullname?.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const getOtherUser = (conv) => {
    return conv.participants.find(p => p._id !== user?._id) || { fullname: 'Deleted User' };
  };

  const getUnreadCount = (conv) => {
    // Basic logic: if last message is not by current user and its createdAt > lastReadAt of current user
    const lastMessage = conv.lastMessage;
    if (!lastMessage || lastMessage.senderId === user?._id) return 0;
    
    const member = conv.members.find(m => m.userId === user?._id);
    if (!member) return 0;
    
    return new Date(lastMessage.createdAt) > new Date(member.lastReadAt) ? 1 : 0;
  };

  return (
    <div className="flex flex-col h-full bg-white border-r">
      <div className="p-4 border-b">
        <h1 className="text-xl font-bold text-text-charcoal mb-4 flex items-center gap-2">
            <MessageSquare className="text-primary" size={24} />
            Messages
        </h1>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:border-primary transition-all"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {isLoading && conversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 opacity-50">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : filteredConversations.length > 0 ? (
          filteredConversations.map((conv) => {
            const otherUser = getOtherUser(conv);
            const isActive = activeConversation?.id === conv.id;
            const unreadCount = getUnreadCount(conv);

            return (
              <div
                key={conv.id}
                onClick={() => setActiveConversation(conv)}
                className={`
                  p-4 cursor-pointer transition-all border-b border-stone-50 flex gap-3
                  ${isActive ? 'bg-primary/5 border-l-4 border-l-primary' : 'hover:bg-stone-50'}
                `}
              >
                <div className="relative shrink-0">
                  <div className="size-12 rounded-full overflow-hidden border-2 border-white shadow-sm bg-stone-100 flex items-center justify-center">
                    {otherUser.profilePicture ? (
                      <img src={otherUser.profilePicture} alt={otherUser.fullname} className="w-full h-full object-cover" />
                    ) : (
                      <UserIcon size={24} className="text-stone-400" />
                    )}
                  </div>
                  {/* Status Indicator (Greyscale if offline, but we don't have online status yet) */}
                  <div className="absolute bottom-0 right-0 size-3 rounded-full bg-green-500 border-2 border-white"></div>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className={`font-semibold text-sm truncate ${unreadCount > 0 ? 'text-text-charcoal' : 'text-text-muted'}`}>
                      {otherUser.fullname}
                    </h3>
                    <span className="text-[10px] text-text-muted whitespace-nowrap">
                      {conv.lastMessage ? new Date(conv.lastMessage.createdAt).toLocaleDateString() : ''}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <p className={`text-xs truncate ${unreadCount > 0 ? 'font-medium text-text-charcoal' : 'text-text-muted'}`}>
                      {conv.lastMessage?.content || 'No messages yet'}
                    </p>
                    {unreadCount > 0 && (
                      <span className="bg-primary text-white text-[10px] size-5 flex items-center justify-center rounded-full font-bold">
                        {unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="flex flex-col items-center justify-center h-60 text-center p-6 opacity-40">
            <MessageSquare size={48} className="mb-4" />
            <p className="text-sm font-medium">No conversations found</p>
            <p className="text-xs">Start a conversation with a match!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConversationList;
