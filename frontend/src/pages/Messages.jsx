import React, { useEffect, useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ConversationList from '../components/ConversationList';
import ChatWindow from '../components/ChatWindow';
import useMessagingStore from '../store/useMessagingStore';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

const Messages = () => {
    const { user } = useAuth();
    const { fetchConversations, activeConversation, setActiveConversation, setUser, initSocket } = useMessagingStore();
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    // Initialize Socket.io
    useEffect(() => {
        if (user) {
            initSocket(user);
        }
    }, [user, initSocket]);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        if (user) {
            setUser(user);
            fetchConversations();
        }
    }, [user, setUser, fetchConversations]);

    return (
        <div className="min-h-screen bg-background-light flex flex-col">
            <Header variant="authenticated" userName={user?.fullname?.split(' ')[0] || "Sarah"} />
            
            <main className="flex-1 max-w-7xl w-full mx-auto px-4 md:px-8 py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-text-charcoal font-serif">Messages</h1>
                    <p className="text-text-muted mt-2">Connect with your matches through our secure messaging platform.</p>
                </div>

                <div className="bg-white rounded-2xl shadow-xl border border-stone-100 overflow-hidden flex h-[700px] relative">
                    <AnimatePresence mode="wait">
                        {(!isMobile || !activeConversation) && (
                            <motion.div 
                                key="list"
                                initial={isMobile ? { x: -300, opacity: 0 } : false}
                                animate={{ x: 0, opacity: 1 }}
                                exit={isMobile ? { x: -300, opacity: 0 } : false}
                                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                                className={`${isMobile ? "absolute inset-0 z-20" : "w-80 md:w-1/3"} h-full`}
                            >
                                <ConversationList />
                            </motion.div>
                        )}

                        {(!isMobile || activeConversation) && (
                            <motion.div 
                                key="chat"
                                initial={isMobile ? { x: 300, opacity: 0 } : false}
                                animate={{ x: 0, opacity: 1 }}
                                exit={isMobile ? { x: 300, opacity: 0 } : false}
                                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                                className="flex-1 h-full"
                            >
                                {activeConversation ? (
                                    <ChatWindow 
                                        isMobile={isMobile} 
                                        onBack={() => setActiveConversation(null)} 
                                    />
                                ) : (
                                    <div className="flex-1 flex flex-col items-center justify-center text-center p-12 h-full bg-[#f8f9fa]">
                                        <div className="size-20 rounded-full bg-primary/5 flex items-center justify-center mb-6 text-primary">
                                            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                                        </div>
                                        <h3 className="text-xl font-bold text-text-charcoal mb-2">Your Conversations</h3>
                                        <p className="text-text-muted max-w-xs">Select a conversation from the list to view messages and start chatting.</p>
                                    </div>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default Messages;
