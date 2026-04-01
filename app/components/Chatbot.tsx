"use client";

import React, { useState, FormEvent, useEffect, useRef } from "react";
import { MessageCircle, X, Send, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../../firebase/config";

/**
 * TYPES
 */
type Role = "user" | "assistant";
interface ChatMessage {
  role: Role;
  content: string;
}

/**
 * CALL GROQ API
 */
export async function callGroq(messages: ChatMessage[], userName?: string): Promise<string> {
  const apiKey = process.env.NEXT_PUBLIC_GROQ_API_KEY_CHATBOT;
  if (!apiKey) {
    console.error("GROQ API Key is missing in environment variables");
    throw new Error("Chatbot is currently unavailable. Please try again later.");
  }

  const personalizedContent = userName 
    ? `You are CovenAI, a friendly legal assistant helping ${userName} navigate the CovenAI platform. Address them by name and be conversational and helpful.`
    : `You are CovenAI, a friendly legal assistant helping users navigate the CovenAI platform. Be conversational and helpful.`;

  const res = await fetch(
    "https://api.groq.com/openai/v1/chat/completions",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          {
            role: "system",
            content: `${personalizedContent}

CovenAI helps with:
📄 Legal document automation and management
🤖 AI-powered document review and simplification
📱 OCR scanning of legal documents
🔐 Secure document storage and organization

Your personality:
- Be warm, friendly, and conversational
- Use natural language (avoid robotic responses)
- Address users by name when available
- Keep responses concise but helpful
- If asked about non-CovenAI topics, gently redirect: "I'm here to help with CovenAI and legal documentation. What can I assist you with regarding our platform?"
- Never use markdown or JSON - just plain text
- Feel free to use emojis occasionally to be more engaging

Example greeting: "Hi ${userName || 'there'}! I'm here to help you make the most of CovenAI's legal tools. What would you like to explore today?"`,
          },
          ...messages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
        ],
      }),
    }
  );

  if (!res.ok) {
    const errorText = await res.text();
    console.error("Groq API error details:", errorText);
    throw new Error(`Groq API error: ${res.status} ${res.statusText}`);
  }

  const data = await res.json();
  console.log("Groq API success response:", data);
  const message = data?.choices?.[0]?.message?.content || "I'm sorry, I couldn't process that request.";
  return message;
}

/**
 * MAIN CHATBOT COMPONENT
 */
export default function Chatbot() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [userName, setUserName] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatButtonRef = useRef<HTMLButtonElement>(null);
  const [user] = useAuthState(auth);

  // Show chat button when user scrolls down
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY || document.documentElement.scrollTop;
      setIsVisible(scrollPosition > 300); // Show after scrolling 300px down
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Get user name from Firebase auth or localStorage
  useEffect(() => {
    if (user) {
      const storedName = localStorage.getItem('userName') || user.displayName || user.email?.split('@')[0] || 'there';
      setUserName(storedName);
    }
  }, [user]);

  /**
   * Handle sending message
   */
  const handleSend = async (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const newMessage: ChatMessage = { role: "user", content: input };
    setMessages((prev) => [...prev, newMessage]);
    setInput("");
    setLoading(true);

    try {
      console.log("Calling Groq with messages:", [...messages, newMessage]);
      const response = await callGroq([...messages, newMessage], userName);
      setMessages((prev) => [...prev, { role: "assistant", content: response }]);
    } catch (err: any) {
      console.error("Chatbot handleSend error:", err);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `⚠️ Error: ${err.message || "Something went wrong"}. Please check your browser console for details.`,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div 
      className={`fixed right-3 z-50 flex flex-col items-end gap-4 transition-all duration-300 ease-in-out ${
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0 pointer-events-none'
      }`}
      style={{ bottom: isOpen ? '1rem' : '2rem' }}
    >
      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="chat-window"
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="w-[360px] h-[500px] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-gray-200"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-500 text-white p-4">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-semibold">CovenAI Assistant</h2>
                  <p className="text-sm text-blue-100">
                    Your legal documentation helper
                  </p>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 rounded-full hover:bg-blue-700 transition-colors"
                  aria-label="Close chat"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
              {messages.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="h-full flex flex-col items-center justify-center text-center text-gray-500"
                >
                  <MessageCircle size={48} className="mb-4 text-gray-300" />
                  <h3 className="text-lg font-medium text-gray-700">
                    How can I help you today?
                  </h3>
                  <p className="text-sm mt-1">
                    Ask me about CovenAI features or legal tools.
                  </p>
                </motion.div>
              ) : (
                <div className="space-y-3">
                  <AnimatePresence>
                    {messages.map((m, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2 }}
                        className={`flex ${
                          m.role === "user" ? "justify-end" : "justify-start"
                        }`}
                      >
                        <div
                          className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                            m.role === "user"
                              ? "bg-blue-600 text-white rounded-br-none"
                              : "bg-white border border-gray-200 text-gray-800 rounded-bl-none shadow-sm"
                          }`}
                        >
                          {m.content}
                        </div>
                      </motion.div>
                    ))}

                    {loading && (
                      <motion.div
                        key="loading"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex justify-start"
                      >
                        <div className="bg-white border border-gray-200 text-gray-800 rounded-2xl rounded-bl-none px-4 py-2 shadow-sm flex items-center gap-2">
                          <Loader2 className="animate-spin h-5 w-5 text-blue-600" />
                          <span className="text-sm text-gray-600">
                            Thinking...
                          </span>
                        </div>
                      </motion.div>
                    )}
                    <div ref={messagesEndRef} />
                  </AnimatePresence>
                </div>
              )}
            </div>

            {/* Input */}
            <form
              onSubmit={handleSend}
              className="border-t border-gray-200 p-4 bg-white"
            >
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1 border border-gray-300 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={loading}
                />
                <button
                  type="submit"
                  disabled={loading || !input.trim()}
                  className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full disabled:opacity-50 transition-colors"
                >
                  {loading ? (
                    <Loader2 className="animate-spin h-5 w-5" />
                  ) : (
                    <Send size={20} />
                  )}
                </button>
              </div>
              <p className="text-xs text-gray-400 mt-2 text-center">
                ⚠️ CovenAI provides general legal information — not professional
                advice.
              </p>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toggle Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen) {
            // Scroll to bottom when opening chat
            setTimeout(() => {
              messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
            }, 100);
          }
        }}
        ref={chatButtonRef}
        className={`p-4 rounded-full shadow-lg ${
          isOpen
            ? "bg-red-500 hover:bg-red-600"
            : "bg-blue-600 hover:bg-blue-700"
        } text-white transition-all`}
      >
        {isOpen ? <X size={24} /> : <MessageCircle size={24} />}
      </motion.button>
    </div>
  );
}
