"use client"
import { useState, useEffect } from "react";
import { useSocket } from "./hooks/socket.hook";

export default function ChatRoom() {
  const socket = useSocket();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const roomId = "hjf"; // Example room ID

  useEffect(() => {
    if (!socket) return;

    // Join room on connection
    socket.emit("joinRoom", roomId);
    socket.on("error", (error) => {
      console.log("Socket error:", error);
      // alert(error.message); // Display error message to the user
    });

    // Listen for new messages
    const handleNewQuestion = (message) => {
      setMessages((prev) => [...prev, message]);
    };

    const handleNewAnswer = (answer) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.questionId === answer.questionId ? { ...msg, answer } : msg
        )
      );
    };

    const handleUpvote = ({ questionId }) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.questionId === questionId
            ? { ...msg, upvotes: (msg.upvotes || 0) + 1 }
            : msg
        )
      );
    };

    const handleDownvote = ({ questionId }) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.questionId === questionId
            ? { ...msg, downvotes: (msg.downvotes || 0) + 1 }
            : msg
        )
      );
    };

    socket.on("newQuestion", handleNewQuestion);
    socket.on("newAnswer", handleNewAnswer);
    socket.on("upvoteQuestion", handleUpvote);
    socket.on("downvoteQuestion", handleDownvote);

    return () => {
      socket.off("newQuestion", handleNewQuestion);
      socket.off("newAnswer", handleNewAnswer);
      socket.off("upvoteQuestion", handleUpvote);
      socket.off("downvoteQuestion", handleDownvote);
    };
  }, [socket]);

  const sendMessage = () => {
    if (input.trim() && socket) {
      socket.emit("newQuestion", roomId, input, "User");
      setInput("");
    }
  };

  const sendAnswer = () => {
    // if (input.trim() && socket) {
      socket.emit("newAnswer", roomId, "Hello I am content", "Hello i am questionid");
      setInput("");
    // }
  };

  return (
    <div>
      <h2>Room ID: {roomId}</h2>
      <div>
        {messages.map((msg, index) => (
          <div key={index}>
            <p>
              {msg.senderName}: {msg.content} ({msg.upvotes || 0}👍, {msg.downvotes || 0}👎)
            </p>
            {msg.answer && <p>Answer: {msg.answer.content}</p>}
          </div>
        ))}
      </div>
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Ask a question..."
      />
      <button onClick={sendMessage}>Send</button>
      <button onClick={sendAnswer}>Send Answer</button>
    </div>
  );
}
