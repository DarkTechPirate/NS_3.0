import { create } from "zustand";
import axios from "axios";
import { io } from "socket.io-client";
import { getTabAuthToken } from "../services/api";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";

const getAuthConfig = () => {
  const token = getTabAuthToken();
  const config = { withCredentials: true };

  if (token) {
    config.headers = { Authorization: `Bearer ${token}` };
  }

  return config;
};

const useMessagingStore = create((set, get) => ({
  conversations: [],
  activeConversation: null,
  messages: [],
  isLoading: false,
  error: null,
  user: null, // Current user object
  socket: null,
  
  setUser: (user) => set({ user }),

  initSocket: (user) => {
    if (get().socket || !user) return;

    const tabToken = getTabAuthToken();

    const socket = io(SOCKET_URL, {
      withCredentials: true,
      autoConnect: true,
      auth: tabToken ? { token: tabToken } : {},
    });

    socket.on("connect", () => {
      console.log(`[Socket] Connected as ${user.fullname}`);
    });

    socket.on("receive_message", (message) => {
      console.log("[Socket] Received message:", message);
      get().addMessage(message);
      
      // Auto-ACK if viewing
      const { activeConversation, markAsRead } = get();
      if (activeConversation && (activeConversation.id === message.conversationId || String(activeConversation.id) === String(message.conversationId))) {
        if (message.senderId !== user._id) {
           markAsRead(message.conversationId);
        }
      }
    });

    socket.on("conversation_updated", ({ conversationId, lastMessage, updatedAt }) => {
      console.log("[Socket] Conversation updated:", conversationId);
      set((state) => ({
        conversations: state.conversations.map((conv) =>
          (conv.id === conversationId || String(conv.id) === String(conversationId))
            ? { ...conv, lastMessage, updatedAt: updatedAt || new Date() }
            : conv
        ).sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)),
      }));
    });

    socket.on("MESSAGES_READ", ({ conversationId, readerId, readAt }) => {
      get().handleMessagesRead(conversationId, readerId, readAt);
    });

    socket.on("error", (err) => {
      console.error("[Socket] Error:", err.message);
      set({ error: err.message });
    });

    set({ socket });
  },

  disconnectSocket: () => {
    const { socket } = get();
    if (socket) {
      socket.disconnect();
      set({ socket: null });
    }
  },

  fetchConversations: async () => {
    set({ isLoading: true });
    try {
      const res = await axios.get(`${API_URL}/messaging/conversations`, getAuthConfig());
      set({ conversations: res.data.data, isLoading: false });
    } catch (error) {
      set({ error: error.message, isLoading: false });
    }
  },

  startConversationWithUser: async (userId) => {
    set({ isLoading: true });
    try {
      const res = await axios.post(
        `${API_URL}/messaging/conversations/get-or-create`,
        { recipientId: userId },
        getAuthConfig()
      );
      const conversation = res.data.data;
      
      const { conversations } = get();
      if (!conversations.find(c => c.id === conversation.id)) {
        set({ conversations: [conversation, ...conversations] });
      }
      
      get().setActiveConversation(conversation);
    } catch (error) {
      set({ error: error.response?.data?.message || error.message, isLoading: false });
    }
  },

  setActiveConversation: async (conversation) => {
    const { socket, activeConversation: currentConv } = get();
    
    // Leave previous room if any
    if (currentConv && socket) {
      socket.emit("leave_chat", currentConv.id);
    }

    set({ activeConversation: conversation, messages: [], isLoading: true });
    
    // Join new room
    if (conversation && socket) {
      socket.emit("join_chat", conversation.id);
    }

    try {
      const res = await axios.get(`${API_URL}/messaging/conversations/${conversation.id}/messages`, getAuthConfig());
      set({ messages: res.data.data, isLoading: false });
      
      // Mark as read
      get().markAsRead(conversation.id);
    } catch (error) {
      set({ error: error.message, isLoading: false });
    }
  },

  sendMessage: async (content, recipientId = null, attachments = [], metadata = null) => {
    const { activeConversation, socket } = get();
    
    // Use socket if it's a simple text message and we have a conversation
    if (socket && activeConversation && attachments.length === 0 && !metadata) {
       socket.emit("send_message", {
         conversationId: activeConversation.id,
         content,
         type: "TEXT"
       });
       return; // The receive_message listener will handle adding it to the state
    }

    // Fallback to REST for files/complex messages
    try {
      const res = await axios.post(
        `${API_URL}/messaging/messages`,
        {
          conversationId: activeConversation?.id,
          recipientId,
          content,
          attachments,
          metadata,
        },
        getAuthConfig()
      );
      
      const message = res.data.data;
      get().addMessage(message);
      
      if (!activeConversation) {
        get().fetchConversations();
      }
      
      return message;
    } catch (error) {
      set({ error: error.response?.data?.message || error.message });
    }
  },

  addMessage: (message) => {
    const { activeConversation, messages } = get();
    
    // Prevent duplicates
    if (messages.find(m => (m.id || m._id) === (message.id || message._id))) return;

    if (activeConversation && (message.conversationId === activeConversation.id || String(message.conversationId) === String(activeConversation.id))) {
      set({ messages: [...messages, { ...message, id: message._id || message.id }] });
    }

    // Update conversation preview in list
    set((state) => ({
      conversations: state.conversations.map((conv) =>
        (conv.id === message.conversationId || String(conv.id) === String(message.conversationId))
          ? { ...conv, lastMessage: message, updatedAt: message.createdAt || new Date() }
          : conv
      ).sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)),
    }));
  },

  markAsRead: async (conversationId) => {
    try {
      await axios.put(`${API_URL}/messaging/conversations/${conversationId}/read`, {}, getAuthConfig());
      set((state) => ({
        messages: state.messages.map((msg) =>
          msg.senderId !== state.user?._id ? { ...msg, isRead: true } : msg
        )
      }));
      // Update local conversation list
      const currentUser = get().user;
      get().handleMessagesRead(conversationId, currentUser?._id, new Date());
    } catch (error) {
      console.error("Failed to mark messages as read", error);
    }
  },

  handleMessagesRead: (conversationId, readerId, readAt) => {
    const { activeConversation, messages } = get();
    if (activeConversation?.id === conversationId || String(activeConversation?.id) === String(conversationId)) {
      set({
        messages: messages.map((msg) =>
          msg.senderId !== readerId && !msg.isRead 
            ? { ...msg, isRead: true, readAt: readAt || new Date() } 
            : msg
        ),
      });
    }
    
    set((state) => ({
      conversations: state.conversations.map((conv) =>
        (conv.id === conversationId || String(conv.id) === String(conversationId))
          ? {
              ...conv,
              members: conv.members.map((m) =>
                m.userId === readerId ? { ...m, lastReadAt: readAt || new Date() } : m
              ),
            }
          : conv
      ),
    }));
  },

  uploadAttachment: async (file) => {
    try {
      const formData = new FormData();
      formData.append("file", file);
      const authConfig = getAuthConfig();
      
      const res = await axios.post(`${API_URL}/messaging/messages/upload`, formData, {
        ...authConfig,
        headers: {
          ...(authConfig.headers || {}),
          "Content-Type": "multipart/form-data",
        },
      });
      
      return res.data.data;
    } catch (error) {
      console.error("Upload failed", error);
      throw error;
    }
  },
}));

export default useMessagingStore;
