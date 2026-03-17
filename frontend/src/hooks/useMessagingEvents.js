import { useEffect } from 'react';
import useMessagingStore from '../store/useMessagingStore';

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export const useMessagingEvents = (user) => {
    const { addMessage, handleMessagesRead, markAsRead, activeConversation } = useMessagingStore();

    useEffect(() => {
        if (!user) return;

        console.log("[SSE] Connecting for user:", user._id);
        const eventSource = new EventSource(`${API_URL}/events`, { withCredentials: true });

        eventSource.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                console.log("[SSE] Received event:", data.type);

                switch (data.type) {
                    case "NEW_MESSAGE":
                        const msg = data.payload;
                        addMessage(msg);
                        
                        // Auto-ACK if viewing
                        if (activeConversation?.id === msg.conversationId && msg.senderId !== user._id) {
                            markAsRead(msg.conversationId);
                        }
                        break;
                    case "MESSAGES_READ":
                        handleMessagesRead(data.payload.conversationId, data.payload.readerId, data.payload.readAt);
                        break;
                    default:
                        break;
                }
            } catch (err) {
                console.error("[SSE] Error parsing event data:", err);
            }
        };

        eventSource.onerror = (err) => {
            console.error("[SSE] Connection error:", err);
            // eventSource.close(); // Browser will auto-reconnect usually
        };

        return () => {
            console.log("[SSE] Closing connection");
            eventSource.close();
        };
    }, [user, addMessage, handleMessagesRead, markAsRead, activeConversation]);
};
