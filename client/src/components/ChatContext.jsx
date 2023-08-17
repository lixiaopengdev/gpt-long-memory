import React, { useState, createContext, useRef, useEffect } from "react";


const ChatContext = createContext();

const ChatProvider = ({children}) => {
  const [chatMessages, setChatMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const scrollDown = useRef(null);
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')));
  
  useEffect(() => {
    setUser(JSON.parse(localStorage.getItem('user')));
    
    }, [location])

  const handleClear = () => {
    setChatMessages([]);
  }

  const handleSubmit = async () => {
    if (!input) return;
    if(!user) {
      return alert('To initiate a conversation with the bot, please log in first.');
    }
    setLoading(true);
    
    let chatLog = [...chatMessages, {type: "user", text: input}]
    setInput("");
    setChatMessages(chatLog)
      
    if(chatMessages.length > 0) {
      scrollDown.current.scrollIntoView({ behavior: "smooth"});
    }
    function getLastThreeInteractions() {
      const parsedMessage = chatLog
        .slice(-6, -1)
        .map((message) => {
          const prefix = message.type === "bot"
            ? `\nRuly: ${message.text}`
            : `\nOwner: ${message.text}`;
          return prefix;
        })
        .join("");
      return parsedMessage;
    }
        
    const inputToEmbedd = `${input}`;

    // handle completions
    const response = await fetch(`${import.meta.env.VITE_IP_PORT}/api/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${import.meta.env.VITE_Api_Key}`
      },
      body: JSON.stringify({
        inputToEmbedd: inputToEmbedd,
        input: input,
        lastThreeInteractions: getLastThreeInteractions(),
        dbName: user?.result?.email,
        temperature: 0.5,
        ab: 0.115, 
      })
    })
    const data = await response.json()
    if(data?.errorMessage) {
      return alert("70 There was an error while processing your request. Please try to refresh the page, if the error persists clear the chat and/or the cache.")
    }

    
    if(data.error === 1) {
      setChatMessages([...chatLog])
      alert("76 There was an error while processing your request. Please try to refresh the page, if the error persists clear the chat and/or the cache.")
    } else {
      setChatMessages([...chatLog, {type: "bot", text: `${data.completionText}`}])
    }

    scrollDown.current.scrollIntoView({ behavior: "smooth" });
    
    setLoading(false);
    
  }

  return (
    <ChatContext.Provider value={{
      input, setInput, loading, setLoading, open, setOpen, scrollDown, handleClear, handleSubmit, chatMessages
    }}>
      {children}
    </ChatContext.Provider>
  );
}

export { ChatContext, ChatProvider };
