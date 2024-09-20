"use client";
import { useState, useRef, useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

import { Send } from "lucide-react";
import Message from "@/components/Messges";

export default function Home() {
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const formRef = useRef<HTMLFormElement>(null);
  const chatWindowRef = useRef<HTMLDivElement>(null);

  function scrollToBottom() {
    const chatWindow = chatWindowRef.current;
    if (chatWindow) {
      chatWindow.scrollTop = chatWindow.scrollHeight;
    }
  }

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!input.trim()) return;

    const userMessage = { id: Date.now(), role: "user", content: input };
    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setInput("");

    setLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ messages: [...messages, userMessage] }),
      });

      if (!response.ok) {
        throw new Error(`Failed to generate content: ${response.statusText}`);
      }

      const data = await response.json();
      const assistantMessage = {
        id: Date.now() + 1,
        role: "assistant",
        content: data,
      };

      setTimeout(() => {
        setMessages((prevMessages) => [...prevMessages, assistantMessage]);
        setLoading(false);
      }, 1000);
    } catch (error) {
      const errorMessage = {
        id: Date.now() + 2,
        role: "system",
        content: `Error`,
      };
      setMessages((prevMessages) => [...prevMessages, errorMessage]);
      setLoading(false);
    }
  }

  function handleInputChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setInput(e.target.value);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      formRef.current?.requestSubmit();
    }
  }

  return (
    <main className="flex h-screen w-full bg-slate-900 justify-center items-center">
      <div className="container h-full w-full mx-full flex flex-col border border-gray-300 rounded-lg shadow-lg border-gray-900">
        <h1 className="text-xl font-semibold text-center text-cyan-800 p-4 border-b border-gray-300 border-y-gray-200">
          Welcome to Gemini Era
        </h1>
        <div
          ref={chatWindowRef}
          className="flex-1 overflow-y-auto p-4 space-y-4 chat-window text-white"
        >
          {messages.map((message) => (
            <Message key={message.id} message={message} />
          ))}
          {loading && <div className="text-white text-center">Loading...</div>}
        </div>
        <form
          ref={formRef}
          onSubmit={handleSubmit}
          className="p-4 border-t border-gray-300 relative flex items-center"
        >
          <Textarea
            className="w-full p-2 rounded-lg border border-gray-300 text-black focus:outline-none focus:border-cyan-600 resize-none"
            placeholder="Say something..."
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            rows={1}
            style={{ minHeight: "50px", maxHeight: "150px", overflow: "auto" }}
          />
          <Button
            type="submit"
            size="icon"
            disabled={!input}
            className="ml-3 p-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-full"
          >
            <Send size={24} />
          </Button>
        </form>
      </div>
    </main>
  );
}
