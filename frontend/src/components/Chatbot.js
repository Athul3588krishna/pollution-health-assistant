import React, { useState } from "react";
import { FaRobot, FaTimes } from "react-icons/fa";

function Chatbot() {

  const [open, setOpen] = useState(false);

  const [messages, setMessages] = useState([
    {
      text: "Hi 👋 Hello! My name is Tutu 1.0 🤖. Ennoda endh venelum chodikk machu 😄 (AQI, pollution, humidity etc).",
      sender: "bot"
    }
  ]);

  const [input, setInput] = useState("");

  const sendMessage = async () => {

    if (!input.trim()) return;

    const userMessage = { text: input, sender: "user" };

    setMessages(prev => [...prev, userMessage]);

    try {

      const response = await fetch("http://localhost:5000/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ message: input })
      });

      const data = await response.json();

      const botMessage = {
        text: data.reply || "Sorry macha 😅 enikk answer kittiyilla.",
        sender: "bot"
      };

      setMessages(prev => [...prev, botMessage]);

    } catch (error) {

      const botMessage = {
        text: "Server error 😢. Backend running ano check cheyyu.",
        sender: "bot"
      };

      setMessages(prev => [...prev, botMessage]);

      console.error(error);
    }

    setInput("");

  };

  return (
    <>
      {!open && (
        <div className="chat-icon" onClick={() => setOpen(true)}>
          <FaRobot size={24} />
        </div>
      )}

      {open && (
        <div className="chat-window">

          <div className="chat-header">
            <span>Tutu 1.0 🤖</span>
            <FaTimes onClick={() => setOpen(false)} style={{ cursor: "pointer" }} />
          </div>

          <div className="chat-body">
            {messages.map((msg, index) => (
              <div key={index} className={msg.sender}>
                {msg.text}
              </div>
            ))}
          </div>

          <div className="chat-footer">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask something..."
            />

            <button onClick={sendMessage}>Send</button>
          </div>

        </div>
      )}
    </>
  );
}

export default Chatbot;