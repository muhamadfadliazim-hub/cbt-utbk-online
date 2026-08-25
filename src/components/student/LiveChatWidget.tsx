"use client";

import { useEffect, useState, useRef } from "react";
import { MessageCircle, X, Send } from "lucide-react";
import { getPusherClient } from "@/lib/pusherClient";

type Message = {
  id: string;
  sender: string;
  message: string;
  timestamp: string;
};

export default function LiveChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Real-time listener
  useEffect(() => {
    // Note: ensure NEXT_PUBLIC_PUSHER_KEY is provided in .env
    const pusher = getPusherClient();
    const channel = pusher.subscribe("global");
    
    channel.bind("broadcast", (data: any) => {
      const newMsg = {
        id: Math.random().toString(36).substr(2, 9),
        sender: data.sender || "Admin",
        message: data.message,
        timestamp: data.timestamp
      };
      
      setMessages((prev) => [...prev, newMsg]);
      
      // Auto-open if it's an admin broadcast
      if (!isOpen) {
        setIsOpen(true);
      }
    });

    return () => {
      pusher.unsubscribe("global");
    };
  }, [isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isOpen]);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const msg = input;
    setInput("");
    
    try {
      await fetch("/api/live/broadcast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: msg, channel: "global", event: "broadcast" })
      });
    } catch (error) {
      console.error("Failed to send message", error);
    }
  };

  return (
    <>
      {/* Floating Button */}
      <button 
        onClick={() => setIsOpen(true)}
        style={{ position: "fixed", bottom: "30px", right: "30px", width: "60px", height: "60px", borderRadius: "50%", background: "var(--accent)", color: "white", border: "none", boxShadow: "var(--shadow-lg)", display: isOpen ? "none" : "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", zIndex: 100 }}>
        <MessageCircle size={28} />
        {messages.length > 0 && (
          <span style={{ position: "absolute", top: "0", right: "0", background: "var(--danger)", width: "18px", height: "18px", borderRadius: "50%", fontSize: "0.7rem", fontWeight: "bold" }}>
            !
          </span>
        )}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div style={{ position: "fixed", bottom: "30px", right: "30px", width: "350px", height: "500px", background: "white", borderRadius: "16px", boxShadow: "var(--shadow-lg)", display: "flex", flexDirection: "column", overflow: "hidden", zIndex: 100, border: "1px solid var(--border)" }}>
          <div style={{ padding: "15px", background: "var(--primary)", color: "white", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <MessageCircle size={20} />
              <span style={{ fontWeight: "bold" }}>Global Lounge</span>
            </div>
            <button onClick={() => setIsOpen(false)} style={{ background: "transparent", border: "none", color: "white", cursor: "pointer" }}>
              <X size={20} />
            </button>
          </div>

          <div style={{ flex: 1, padding: "15px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "10px", background: "#f8fafc" }}>
            {messages.length === 0 ? (
              <div style={{ margin: "auto", color: "var(--text-muted)", fontSize: "0.9rem", textAlign: "center" }}>
                Belum ada pesan.<br/>Ketik sesuatu untuk menyapa teman-teman!
              </div>
            ) : (
              messages.map(msg => (
                <div key={msg.id} style={{ alignSelf: msg.sender === "Admin" ? "flex-start" : "flex-end", background: msg.sender === "Admin" ? "var(--primary-light)" : "white", padding: "10px 15px", borderRadius: "12px", border: "1px solid var(--border)", maxWidth: "85%" }}>
                  {msg.sender === "Admin" && <div style={{ fontSize: "0.75rem", fontWeight: "bold", color: "var(--primary)", marginBottom: "3px" }}>Admin (Pengumuman)</div>}
                  {msg.sender !== "Admin" && <div style={{ fontSize: "0.75rem", fontWeight: "bold", color: "var(--text-muted)", marginBottom: "3px" }}>{msg.sender}</div>}
                  <div style={{ fontSize: "0.95rem", color: "var(--text)" }}>{msg.message}</div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          <div style={{ padding: "15px", borderTop: "1px solid var(--border)", display: "flex", gap: "10px" }}>
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              placeholder="Tulis pesan..."
              style={{ flex: 1, padding: "10px 15px", borderRadius: "20px", border: "1px solid var(--border)", outline: "none" }}
            />
            <button onClick={sendMessage} style={{ width: "40px", height: "40px", borderRadius: "50%", background: "var(--primary)", color: "white", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
              <Send size={18} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
