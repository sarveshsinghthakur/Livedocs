"use client"
import { useState, useRef } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";
import Message from "@/components/Messges";

export default function Home() {
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState<string>("");
  const formRef = useRef<HTMLFormElement>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!input.trim()) return;

    const userMessage = { id: Date.now(), role: "user", content: input };
    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setInput("");

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt: input }),
      });

      if (!response.ok) {
        throw new Error(`Failed to generate content: ${response.statusText}`);
      }

      const data = await response.json();
      const assistantMessage = {
        id: Date.now() + 1,
        role: "assistant",
        content: data.text,
      };
      setMessages((prevMessages) => [...prevMessages, userMessage, assistantMessage]);
    } catch (error) {
      console.error("Error generating content:", error.message);
      const errorMessage = {
        id: Date.now() + 2,
        role: "system",
        content: `Error: ${error.message}`,
      };
      setMessages((prevMessages) => [...prevMessages, userMessage, errorMessage]);
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
    <main className="fixed h-full w-full bg-muted">
      <div className="container h-full w-full flex flex-col py-8">
        <div className="flex-1 overflow-y-auto">
          {messages.map((message) => (
            <Message key={message.id} message={message} />
          ))}
        </div>
        <form
          ref={formRef}
          onSubmit={handleSubmit}
          className="mt-auto relative"
        >
          <Textarea
            className="w-full text-lg text-black"
            placeholder="Say something"
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
          />
          <Button
            type="submit"
            size="icon"
            disabled={!input}
            className="absolute top-1/2 transform -translate-y-1/2 right-4 rounded-full"
          >
            <Send size={24} />
          </Button>
        </form>
      </div>
    </main>
  );
}