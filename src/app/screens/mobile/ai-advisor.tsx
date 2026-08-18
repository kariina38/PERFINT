import { useState, useRef, useEffect } from "react";
import { Sparkles, Loader2, User, Bot, SendHorizontal } from "lucide-react";
import { aiApi } from "../../utils/api";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { useAuth } from "../../contexts/auth-context";

interface Message {
  role: "user" | "ai";
  content: string;
}

export function AIAdvisor() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    { role: "ai", content: `Halo ${user?.name || "User"}! Saya FinAI, asisten keuangan pribadi Anda. Ada yang bisa saya bantu hari ini?` }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    setMessages(prev => [...prev, { role: "user", content: userMessage }]);
    setIsLoading(true);

    try {
      const data = await aiApi.chat(userMessage);
      setMessages(prev => [...prev, { role: "ai", content: data.reply }]);
    } catch (err: any) {
      const errorMsg = err.message || "Maaf, terjadi kesalahan saat menghubungi asisten AI. Silakan coba lagi nanti.";
      setMessages(prev => [...prev, { role: "ai", content: errorMsg }]);
    } finally {
      setIsLoading(false);
    }
  };

  const parseInlineMarkdown = (text: string) => {
    if (!text.includes("**")) {
      return text;
    }
    const parts = text.split("**");
    return parts.map((part, index) => {
      if (index % 2 === 1) {
        return <strong key={index} className="font-bold text-gray-900">{part}</strong>;
      }
      return part;
    });
  };

  const renderMessageContent = (content: string) => {
    const lines = content.split("\n");
    return lines.map((line, lineIdx) => {
      // 1. Check for headers (e.g., ### Title)
      const headerMatch = line.match(/^(#{1,6})\s+(.*)$/);
      if (headerMatch) {
        const level = headerMatch[1].length;
        const text = headerMatch[2];
        const parsedText = parseInlineMarkdown(text);
        
        if (level <= 2) {
          return <h2 key={lineIdx} className="text-base font-bold text-gray-900 mt-3 mb-1.5">{parsedText}</h2>;
        } else {
          return <h3 key={lineIdx} className="text-sm font-bold text-gray-800 mt-2 mb-1">{parsedText}</h3>;
        }
      }
      
      // 2. Check for bullet points (e.g., * Item or - Item)
      const bulletMatch = line.match(/^[\*\-]\s+(.*)$/);
      if (bulletMatch) {
        const text = bulletMatch[1];
        const parsedText = parseInlineMarkdown(text);
        return (
          <div key={lineIdx} className="flex items-start gap-1.5 ml-2 my-0.5">
            <span className="text-blue-500 mt-1">•</span>
            <span className="flex-1">{parsedText}</span>
          </div>
        );
      }
      
      // 3. Regular lines
      const parsedLine = parseInlineMarkdown(line);
      return <p key={lineIdx} className="min-h-[1rem] my-0.5">{parsedLine}</p>;
    });
  };

  const suggestions = [
    "Berapa total saldo saya?",
    "Review pengeluaran bulan ini",
    "Tips cara berhemat",
    "Analisis kategori belanja terbesar"
  ];

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col h-[calc(100vh-6rem)] md:h-[calc(100vh-4rem)] bg-white md:rounded-2xl md:border md:shadow-sm overflow-hidden">
      {/* Header */}
      <div className="bg-white p-4 border-b flex items-center gap-3 shrink-0">
        <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center text-white shadow-md">
          <Sparkles className="w-5 h-5" />
        </div>
        <div>
          <h1 className="font-bold text-gray-900 text-base">FinAI Advisor</h1>
          <p className="text-[10px] text-green-600 font-bold flex items-center gap-1 uppercase tracking-wider">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span> AI Active
          </p>
        </div>
      </div>

      {/* Messages Feed */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-4"
      >
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`flex gap-3 max-w-[85%] md:max-w-[75%] ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-sm ${
                msg.role === "ai" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700"
              }`}>
                {msg.role === "ai" ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
              </div>
              <div className={`p-3.5 rounded-2xl text-sm leading-relaxed ${
                msg.role === "user" 
                ? "bg-blue-600 text-white rounded-tr-none shadow-md" 
                : "bg-gray-50 text-gray-800 border border-gray-100 shadow-sm rounded-tl-none whitespace-pre-wrap"
              }`}>
                {renderMessageContent(msg.content)}
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-sm">
                <Bot className="w-4 h-4" />
              </div>
              <div className="bg-gray-50 border p-3.5 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-2">
                <div className="flex gap-1.5">
                  <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                  <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                  <span className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input & Suggestion Section */}
      <div className="border-t bg-white p-4 space-y-3 shrink-0">
        {messages.length < 5 && !isLoading && (
          <div className="flex flex-wrap gap-2">
            {suggestions.map(s => (
              <button
                key={s}
                onClick={() => setInput(s)}
                className="px-3 py-1.5 bg-blue-50 text-blue-700 text-xs font-semibold rounded-full border border-blue-100 hover:bg-blue-100 transition-all cursor-pointer"
              >
                {s}
              </button>
            ))}
          </div>
        )}
        <div className="flex gap-2 items-center bg-gray-50 p-1.5 rounded-2xl border border-gray-200 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
          <Input 
            placeholder="Tanyakan sesuatu tentang keuangan Anda..." 
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleSend()}
            className="border-none bg-transparent focus:ring-0 focus:outline-none shadow-none text-sm placeholder:text-gray-400"
          />
          <Button 
            disabled={isLoading || !input.trim()}
            onClick={handleSend}
            className="rounded-xl bg-blue-600 hover:bg-blue-700 h-10 w-10 p-0 shadow-md transition-transform active:scale-95 shrink-0 cursor-pointer"
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <SendHorizontal className="w-5 h-5" />}
          </Button>
        </div>
      </div>
    </div>
  );
}
