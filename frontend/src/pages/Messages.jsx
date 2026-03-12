import React, { useState, useEffect, useRef } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { getConversations, getMessages, sendMessage } from '../services/api';
import { useAuth } from '../context/AuthContext';

const Messages = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [conversationStartedAt, setConversationStartedAt] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef(null);

  // Fetch conversations on mount
  useEffect(() => {
    const fetchConversations = async () => {
      setLoadingConversations(true);
      const result = await getConversations();
      if (result.success) {
        setConversations(result.conversations);
        // Auto-select first conversation on desktop
        if (result.conversations.length > 0) {
          setSelectedConversation(result.conversations[0]);
        }
      }
      setLoadingConversations(false);
    };
    fetchConversations();
  }, []);

  // Fetch messages when a conversation is selected
  useEffect(() => {
    if (!selectedConversation) return;
    const fetchMessages = async () => {
      setLoadingMessages(true);
      const result = await getMessages(selectedConversation.id);
      if (result.success) {
        setMessages(result.data.messages || []);
        setConversationStartedAt(result.data.startedAt || null);
      }
      setLoadingMessages(false);
    };
    fetchMessages();
  }, [selectedConversation?.id]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!newMessage.trim() || !selectedConversation || sending) return;
    setSending(true);
    const text = newMessage.trim();
    setNewMessage('');

    const result = await sendMessage(selectedConversation.id, text);
    if (result.success) {
      setMessages((prev) => [...prev, result.message]);
      // Update the conversation's lastMessage in the sidebar
      setConversations((prev) =>
        prev.map((c) =>
          c.id === selectedConversation.id
            ? { ...c, lastMessage: text, lastMessageTime: new Date().toISOString() }
            : c
        )
      );
    }
    setSending(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatRelativeTime = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric',
    });
  };

  // Filter conversations by search
  const filteredConversations = conversations.filter((c) =>
    c.otherUser?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background-light flex flex-col">
      <Header />

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
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-stone-50 border border-stone-200 rounded-full text-sm focus:outline-none focus:border-primary"
                />
              </div>
            </div>

            {loadingConversations ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-6 h-6 border-2 border-stone-300 border-t-stone-600 rounded-full animate-spin"></div>
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="text-center py-12 px-4">
                <span className="material-symbols-outlined text-3xl text-stone-300 mb-2 block">chat_bubble</span>
                <p className="text-sm text-text-muted">
                  {searchQuery ? 'No conversations match your search' : 'No conversations yet. Express mutual interest in a match to start chatting!'}
                </p>
              </div>
            ) : (
              filteredConversations.map((conv) => (
                <div
                  key={conv.id}
                  onClick={() => setSelectedConversation(conv)}
                  className={`p-4 border-b border-stone-50 cursor-pointer transition-colors ${
                    selectedConversation?.id === conv.id ? 'bg-primary/5' : 'hover:bg-stone-50'
                  }`}
                >
                  <div className="flex gap-3">
                    <div
                      className="size-12 rounded-full bg-cover bg-center shrink-0 border-2 border-white shadow-sm bg-stone-100 flex items-center justify-center"
                      style={conv.otherUser?.image ? { backgroundImage: `url('${conv.otherUser.image}')` } : {}}
                    >
                      {!conv.otherUser?.image && (
                        <span className="material-symbols-outlined text-stone-400">person</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-1">
                        <h3 className={`font-semibold text-text-charcoal ${conv.unread ? 'font-bold' : ''}`}>
                          {conv.otherUser?.name || 'Unknown'}
                        </h3>
                        <span className="text-xs text-text-muted">{formatRelativeTime(conv.lastMessageTime)}</span>
                      </div>
                      <p className={`text-sm truncate ${conv.unread ? 'text-text-charcoal font-medium' : 'text-text-muted'}`}>
                        {conv.lastMessage || 'Start a conversation...'}
                      </p>
                    </div>
                    {conv.unread && (
                      <span className="size-2 bg-primary rounded-full shrink-0 mt-2"></span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Chat Area */}
          <div className="hidden md:flex flex-1 flex-col">
            {selectedConversation ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b border-stone-100 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="size-10 rounded-full bg-cover bg-center border-2 border-white shadow-sm bg-stone-100 flex items-center justify-center"
                      style={selectedConversation.otherUser?.image ? { backgroundImage: `url('${selectedConversation.otherUser.image}')` } : {}}
                    >
                      {!selectedConversation.otherUser?.image && (
                        <span className="material-symbols-outlined text-stone-400 text-sm">person</span>
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold text-text-charcoal">{selectedConversation.otherUser?.name || 'Unknown'}</h3>
                      {selectedConversation.compatibility && (
                        <span className="text-xs text-primary">{selectedConversation.compatibility} Match</span>
                      )}
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
                  {loadingMessages ? (
                    <div className="flex items-center justify-center h-full">
                      <div className="w-6 h-6 border-2 border-stone-300 border-t-stone-600 rounded-full animate-spin"></div>
                    </div>
                  ) : (
                    <>
                      {conversationStartedAt && (
                        <div className="flex justify-center">
                          <span className="text-xs text-text-muted bg-stone-100 px-3 py-1 rounded-full">
                            Conversation started on {formatDate(conversationStartedAt)}
                          </span>
                        </div>
                      )}

                      {messages.length === 0 && !loadingMessages && (
                        <div className="flex items-center justify-center h-full">
                          <p className="text-sm text-text-muted">No messages yet. Say hello!</p>
                        </div>
                      )}

                      {messages.map((msg) => (
                        <div key={msg.id} className={`flex ${msg.isOwn ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[70%] rounded-2xl px-4 py-3 ${
                            msg.isOwn
                              ? 'bg-primary text-white rounded-br-sm'
                              : 'bg-stone-100 rounded-bl-sm'
                          }`}>
                            <p className={`text-sm ${msg.isOwn ? '' : 'text-text-charcoal'}`}>{msg.text}</p>
                            <span className={`text-xs mt-1 block ${msg.isOwn ? 'text-white/70' : 'text-text-muted'}`}>
                              {formatTime(msg.createdAt)}
                            </span>
                          </div>
                        </div>
                      ))}
                      <div ref={messagesEndRef} />
                    </>
                  )}
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
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyDown={handleKeyDown}
                      className="flex-1 px-4 py-2 bg-stone-50 border border-stone-200 rounded-full text-sm focus:outline-none focus:border-primary"
                    />
                    <button
                      onClick={handleSend}
                      disabled={sending || !newMessage.trim()}
                      className="size-10 rounded-full bg-primary text-white flex items-center justify-center hover:bg-primary/90 transition-colors shrink-0 disabled:opacity-50"
                    >
                      <span className="material-symbols-outlined text-xl">send</span>
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-text-muted">
                <div className="text-center">
                  <span className="material-symbols-outlined text-4xl text-stone-300 mb-2 block">forum</span>
                  <p>Select a conversation to start messaging</p>
                </div>
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
