"use client";
import { useState, useEffect } from "react";
import { useSocket } from "./hooks/socket.hook";

export default function ChatRoom() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [answerInput, setAnswerInput] = useState("");
  const [selectedQuestionId, setSelectedQuestionId] = useState(null);
  const roomId = "22d0c9e3-f397-4ea7-bb4f-deddec631a43";
  const socket = useSocket(roomId); // Example room ID

  useEffect(() => {
    if (!socket) return;

    // Join room on connection
    socket.emit("joinRoom", roomId);
    socket.on("error", (error) => {
      console.log("Socket error:", error);
      alert(error.message); // Display error message to the user
    });

    // Listen for new messages
    const handleNewQuestion = (message) => {
      console.log("new quesitons")
      setMessages((prev) => [...prev, message]);
    };

    const handleNewAnswer = (answer) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.questionId === answer.questionId ? { ...msg, answer } : msg,
        ),
      );
    };

    const handleUpvote = ({ questionId }) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.questionId === questionId
            ? { ...msg, upvotes: (msg.upvotes || 0) + 1 }
            : msg,
        ),
      );
    };

    const handleDownvote = ({ questionId }) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.questionId === questionId
            ? { ...msg, downvotes: (msg.downvotes || 0) + 1 }
            : msg,
        ),
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
    if (answerInput.trim() && socket && selectedQuestionId) {
      socket.emit("newAnswer", roomId, answerInput, selectedQuestionId);
      setAnswerInput("");
      setSelectedQuestionId(null);
    }
  };

  const upvoteQuestion = (questionId) => {
    if (socket) {
      socket.emit("upvoteQuestion", roomId, questionId);
    }
  };

  const downvoteQuestion = (questionId) => {
    console.log(questionId)
    if (socket) {
      socket.emit("downvoteQuestion", roomId, questionId);
    }
  };

  return (
    <div>
      <h2>Room ID: {roomId}</h2>
      <div>
        {messages.map((msg, index) => {
          console.log(msg)
          return(
          <div key={index}>
            <p>
              {msg.senderName}: {msg.content} ({msg.upvotes || 0}👍,{" "}
              {msg.downvotes || 0}👎)
            </p>
            {msg.answer && <p>Answer: {msg.answer.content}</p>}
            <button onClick={() => setSelectedQuestionId(msg.questionId)}>
              Answer this question
            </button>
            <button onClick={() => upvoteQuestion(msg.questionId)}>Upvote</button>
            <button onClick={() => downvoteQuestion(msg.questionId)}>Downvote</button>
          </div>
        )})}
      </div>
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Ask a question..."
      />
      <button onClick={sendMessage}>Send Question</button>
      {selectedQuestionId && (
        <div>
          <input
            type="text"
            value={answerInput}
            onChange={(e) => setAnswerInput(e.target.value)}
            placeholder="Write an answer..."
          />
          <button onClick={sendAnswer}>Send Answer</button>
        </div>
      )}
    </div>
  );
}