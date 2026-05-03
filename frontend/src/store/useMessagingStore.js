import { create } from "zustand";
import axios from "axios";
import { io } from "socket.io-client";
import { getTabAuthToken } from "../services/api";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";

const toId = (value) => String(value?._id ?? value ?? "");

const normalizeMessage = (message = {}) => {
  const normalizedId = toId(message.id || message._id);
  const normalizedConversationId = toId(message.conversationId);
  const normalizedSenderId = toId(message.senderId || message.sender?._id);

  return {
    ...message,
    id: normalizedId || message.id,
    _id: normalizedId || message._id,
    conversationId: normalizedConversationId || message.conversationId,
    senderId: normalizedSenderId || message.senderId,
  };
};

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
      path: '/ws/',
      withCredentials: true,
      autoConnect: true,
      auth: tabToken ? { token: tabToken } : {},
    });

    socket.on("connect", () => {
      console.log(`[Socket] Connected as ${user.fullname}`);
    });

    const handleIncomingMessage = (message) => {
      const normalizedMessage = normalizeMessage(message);
      console.log("[Socket] Received message:", normalizedMessage);
      get().addMessage(normalizedMessage);

      // Auto-ACK if viewing
      const { activeConversation, markAsRead } = get();
      if (
        activeConversation &&
        toId(activeConversation.id || activeConversation._id) === toId(normalizedMessage.conversationId)
      ) {
        if (toId(normalizedMessage.senderId) !== toId(user._id)) {
          markAsRead(normalizedMessage.conversationId);
        }
      }
    };

    socket.on("receive_message", (message) => {
      handleIncomingMessage(message);
    });

    // Backward-compatible event name used in some REST flows.
    socket.on("NEW_MESSAGE", (message) => {
      handleIncomingMessage(message);
    });

    socket.on("conversation_updated", ({ conversationId, lastMessage, updatedAt }) => {
      console.log("[Socket] Conversation updated:", conversationId);
      set((state) => ({
        conversations: state.conversations.map((conv) =>
          (toId(conv.id || conv._id) === toId(conversationId))
            ? { ...conv, lastMessage: normalizeMessage(lastMessage), updatedAt: updatedAt || new Date() }
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
      if (!conversations.find(c => toId(c.id || c._id) === toId(conversation.id || conversation._id))) {
        set({ conversations: [conversation, ...conversations] });
      }
      
      get().setActiveConversation(conversation);
    } catch (error) {
      set({ error: error.response?.data?.message || error.message, isLoading: false });
    }
  },

  setActiveConversation: async (conversation) => {
    const { socket, activeConversation: currentConv } = get();
    const currentConversationId = toId(currentConv?.id || currentConv?._id);
    const nextConversationId = toId(conversation?.id || conversation?._id);
    
    // Leave previous room if any
    if (currentConversationId && socket) {
      socket.emit("leave_chat", currentConversationId);
    }

    if (!conversation) {
      set({ activeConversation: null, messages: [], isLoading: false });
      return;
    }

    set({ activeConversation: { ...conversation, id: nextConversationId || conversation.id }, messages: [], isLoading: true });
    
    // Join new room
    if (nextConversationId && socket) {
      socket.emit("join_chat", nextConversationId);
    }

    try {
      const res = await axios.get(`${API_URL}/messaging/conversations/${nextConversationId}/messages`, getAuthConfig());
      set({ messages: (res.data.data || []).map(normalizeMessage), isLoading: false });
      
      // Mark as read
      get().markAsRead(nextConversationId);
    } catch (error) {
      set({ error: error.message, isLoading: false });
    }
  },

  sendMessage: async (content, recipientId = null, attachments = [], metadata = null) => {
    const { activeConversation, socket } = get();
    
    // Use socket if it's a simple text message and we have a conversation
    if (socket?.connected && activeConversation && attachments.length === 0 && !metadata) {
       const conversationId = toId(activeConversation.id || activeConversation._id);
       socket.emit("send_message", {
         conversationId,
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
          conversationId: toId(activeConversation?.id || activeConversation?._id),
          recipientId,
          content,
          attachments,
          metadata,
        },
        getAuthConfig()
      );
      
      const message = normalizeMessage(res.data.data);
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
    const normalizedMessage = normalizeMessage(message);
    const messageId = toId(normalizedMessage.id || normalizedMessage._id);
    const activeConversationId = toId(activeConversation?.id || activeConversation?._id);
    
    // Prevent duplicates
    if (messages.find(m => toId(m.id || m._id) === messageId)) return;

    if (activeConversationId && toId(normalizedMessage.conversationId) === activeConversationId) {
      set({ messages: [...messages, normalizedMessage] });
    }

    // Update conversation preview in list
    set((state) => ({
      conversations: state.conversations.map((conv) =>
        (toId(conv.id || conv._id) === toId(normalizedMessage.conversationId))
          ? { ...conv, lastMessage: normalizedMessage, updatedAt: normalizedMessage.createdAt || new Date() }
          : conv
      ).sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)),
    }));
  },

  markAsRead: async (conversationId) => {
    try {
      await axios.put(`${API_URL}/messaging/conversations/${conversationId}/read`, {}, getAuthConfig());
      set((state) => ({
        messages: state.messages.map((msg) =>
          toId(msg.senderId) !== toId(state.user?._id) ? { ...msg, isRead: true } : msg
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
    if (toId(activeConversation?.id || activeConversation?._id) === toId(conversationId)) {
      set({
        messages: messages.map((msg) =>
          toId(msg.senderId) !== toId(readerId) && !msg.isRead 
            ? { ...msg, isRead: true, readAt: readAt || new Date() } 
            : msg
        ),
      });
    }
    
    set((state) => ({
      conversations: state.conversations.map((conv) =>
        (toId(conv.id || conv._id) === toId(conversationId))
          ? {
              ...conv,
              members: conv.members.map((m) =>
                toId(m.userId) === toId(readerId) ? { ...m, lastReadAt: readAt || new Date() } : m
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
