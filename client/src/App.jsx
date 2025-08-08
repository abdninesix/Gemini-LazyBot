import axios from "axios";
import { useState, useRef, useEffect } from "react";
import { Send, Sun, Moon, Loader2, Bot, Copy } from "lucide-react";
import ReactMarkdown from "react-markdown";

function App() {
  const [messages, setMessages] = useState([
    { sender: "bot", text: "Hello! How can I help you today?" },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  useEffect(() => {
    const root = document.documentElement;
    const isDark = localStorage.getItem("theme") === "dark";

    if (isDark) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }

    setDarkMode(isDark);
  }, []);

  const toggleDarkMode = () => {
    const root = document.documentElement;
    if (darkMode) {
      root.classList.remove("dark");
      localStorage.setItem("theme", "light");
      setDarkMode(false);
    } else {
      root.classList.add("dark");
      localStorage.setItem("theme", "dark");
      setDarkMode(true);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const newMessage = { sender: "user", text: input };
    setMessages((prev) => [...prev, newMessage]);
    setInput("");
    textareaRef.current.style.height = "auto"; // reset height
    setLoading(true);

    try {
      const res = await axios.post("https://gemini-lazy-bot.vercel.app/chat", {
        message: input,
      });

      const botMessage = { sender: "bot", text: res.data.reply };
      setMessages((prev) => [...prev, botMessage]);
    } catch (err) {
      console.error("Error communicating with server:", err);
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: "Sorry, something went wrong." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setInput(e.target.value);
    textareaRef.current.style.height = "auto"; // shrink first
    textareaRef.current.style.height = textareaRef.current.scrollHeight + "px"; // grow to fit
  };

  return (
    <div className="flex flex-col px-4 sm:px-8 md:px-16 lg:px-32 xl:px-40 h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-300 duration-300">
      {/* Header */}
      <header className="py-2 flex items-center justify-center font-semibold">
        <span className="flex items-center gap-2 text-xl cursor-pointer">LazyBot<Bot size={30} /></span>
        {/* <button
          onClick={toggleDarkMode}
          title="Toggle dark mode"
          className="cursor-pointer"
        >
          {darkMode ? <Moon size={20} /> : <Sun size={20} />}
        </button> */}
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 scrollbar-none">
        {messages.map((msg, idx) => (
          <div key={idx} className={`group flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"}`}>
            {/* Copy Button */}
            <button
              onClick={() => navigator.clipboard.writeText(msg.text)}
              className="mb-1 mx-2 cursor-pointer text-xs opacity-0 group-hover:opacity-100 text-gray-400 hover:text-gray-600 dark:text-gray-300 dark:hover:text-white"
              title="Copy to clipboard"
            >
              <Copy size={14} />
            </button>

            {/* Message Bubble */}
            <div
              className={`max-w-4xl w-fit px-4 py-2 rounded-xl text-sm font-semibold leading-relaxed shadow ${msg.sender === "user"
                  ? "bg-blue-500 text-white rounded-br-none"
                  : "bg-gray-300 text-gray-900 rounded-tl-none"
                }`}
            >
              {msg.sender === "bot" ? (
                <ReactMarkdown>{msg.text}</ReactMarkdown>
              ) : (
                msg.text
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Loader2 className="animate-spin" />
            LazyBot is typing slowly...
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="py-2 flex items-end gap-2">
        <textarea
          ref={textareaRef}
          rows={1}
          value={input}
          onChange={handleInputChange}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSubmit(e);
            }
          }}
          placeholder="Type your message..."
          className="flex-1 px-4 py-2 border border-gray-500 rounded-xl outline-none focus:ring-2 focus:ring-gray-400 resize-none overflow-hidden"
        />
        <button
          type="submit"
          className="p-3 rounded-full bg-blue-500 text-white cursor-pointer hover:bg-blue-600"
        >
          <Send className="size-5" />
        </button>
      </form>
    </div>
  );
}

export default App;
