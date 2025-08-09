import axios from "axios";
import { useState, useRef, useEffect } from "react";
import { Send, Sun, Moon, Loader2, Bot, Copy, HeartCrack } from "lucide-react";
import ReactMarkdown from "react-markdown";

function App() {
  const [messages, setMessages] = useState([
    { sender: "bot", text: "Well hello there 😎" },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [showClearWarning, setShowClearWarning] = useState(false);

  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  // Scroll to bottom while sending messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  useEffect(scrollToBottom, [messages]);

  // Load saved messages from localStorage
  useEffect(() => {
    const savedMessages = JSON.parse(localStorage.getItem("chatHistory"));
    if (savedMessages && savedMessages.length > 0) {
      setMessages(savedMessages);
    }
  }, []);

  // Keep the history updated
  useEffect(() => {
    localStorage.setItem("chatHistory", JSON.stringify(messages));
  }, [messages]);

  // Set theme on page load
  useEffect(() => {
    document.documentElement.classList.toggle(
      "dark",
      localStorage.theme === "dark" ||
      (!("theme" in localStorage) && window.matchMedia("(prefers-color-scheme: dark)").matches)
    );
    setDarkMode(document.documentElement.classList.contains("dark"));
  }, []);

  const toggleDarkMode = () => {
    const isDark = document.documentElement.classList.contains("dark");
    if (isDark) {
      document.documentElement.classList.remove("dark");
      localStorage.theme = "light";
      setDarkMode(false);
    } else {
      document.documentElement.classList.add("dark");
      localStorage.theme = "dark";
      setDarkMode(true);
    }
  };

  // User messages and bot messages along with history submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const newMessage = { sender: "user", text: input };
    const safeMessages = Array.isArray(messages) ? messages : [];
    const updatedMessages = [...safeMessages, newMessage];

    setMessages(updatedMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await axios.post(
        // "http://localhost:3000/chat",
        "https://gemini-lazy-bot.vercel.app/chat",
        {
          messages: updatedMessages,
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

  // Auto resizing of input box
  const handleInputChange = (e) => {
    setInput(e.target.value);
    textareaRef.current.style.height = "auto";
    textareaRef.current.style.height = textareaRef.current.scrollHeight + "px";
  };

  // Clear conversation from local storage
  const clearChatHistory = () => {
    localStorage.removeItem("chatHistory");
    setMessages([{ sender: "bot", text: "Well hello there 😎" }]);
    setShowClearWarning(false);
  };

  return (
    <div className="flex flex-col px-4 sm:px-8 md:px-16 lg:px-32 xl:px-40 h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-300 duration-300">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 py-2 px-4 sm:px-8 md:px-16 lg:px-32 xl:px-40 flex items-center justify-between font-semibold">
        <span className="flex items-center gap-2 text-xl cursor-pointer">
          LazyBot <img src="/bot.svg" alt="Logo" size={30} />
        </span>

        <div className="flex items-center gap-4">
          {/* Clear Chat Button */}
          <button
            onClick={() => setShowClearWarning(true)}
            title="Clear chat"
            className="cursor-pointer text-red-500 hover:text-red-700"
          >
            <HeartCrack size={20} />
          </button>

          {/* Dark Mode Toggle */}
          <button
            onClick={toggleDarkMode}
            title="Toggle dark mode"
            className="cursor-pointer"
          >
            {darkMode ? <Moon size={20} /> : <Sun size={20} />}
          </button>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 scrollbar-none mt-12 mb-12">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`group flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"
              }`}
          >
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
      <form onSubmit={handleSubmit} className="fixed bottom-0 left-0 right-0 py-2 px-4 sm:px-8 md:px-16 lg:px-32 xl:px-40 flex items-end gap-2">
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
          className="flex-1 px-4 py-2 border border-gray-500 bg-white rounded-xl outline-none focus:ring-2 focus:ring-gray-400 resize-none overflow-hidden"
        />
        <button
          type="submit"
          className="p-3 rounded-full bg-blue-500 text-white cursor-pointer hover:bg-blue-600"
        >
          <Send className="size-5" />
        </button>
      </form>

      {/* Clear Warning */}
      {showClearWarning && (
        <div className="fixed inset-0 flex items-center justify-center p-10 z-50 bg-black/50">
          <div className="max-w-md bg-red-100 dark:bg-red-800 px-4 py-3 rounded-xl shadow-lg flex flex-col items-center gap-2">
            <span>Are you sure you want to break our friendship and erase my memory? This cannot be undone. 😢</span>
            <div className="w-full flex justify-between gap-2">
              <button
                onClick={clearChatHistory}
                className="w-full px-3 py-1 cursor-pointer bg-red-500 text-white rounded-lg hover:bg-red-600"
              >
                Yes
              </button>
              <button
                onClick={() => setShowClearWarning(false)}
                className="w-full px-3 py-1 cursor-pointer bg-gray-300 dark:bg-gray-600 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500"
              >
                No
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
