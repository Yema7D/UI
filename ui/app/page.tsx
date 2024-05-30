"use client";

import React, { useState, useEffect, ChangeEvent, FormEvent } from "react";
import { FiUpload } from "react-icons/fi";
import { TypeAnimation } from "react-type-animation";

export default function Home() {
  const [messages, setMessages] = useState([
    { type: "bot", content: "Hello, how can I help you?" },
  ]);
  const [userMessage, setUserMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);
  const [websocket, setWebSocket] = useState<WebSocket | null>(null);

  useEffect(() => {
    const ws = new WebSocket(
      window.location.origin.replace(/^http/, "ws") + "/stream_completion"
    );
    setWebSocket(ws);

    ws.onmessage = (event) => {
      const responseElement = document.getElementById("response");
      const loadingSpinner = document.getElementById("loadingSpinner");
      const message = JSON.parse(event.data);

      if (message.type === "message") {
        setMessages((prevMessages) => {
          const lastMessage = prevMessages[prevMessages.length - 1];
          if (lastMessage && lastMessage.type === "bot") {
            lastMessage.content += message.data;
          } else {
            prevMessages.push({ type: "bot", content: message.data });
          }
          return [...prevMessages];
        });
        loadingSpinner?.classList.add("hidden");
      }

      if (responseElement) {
        responseElement.scrollTop = responseElement.scrollHeight;
      }
    };

    fetchUploadedFiles();

    return () => {
      ws.close();
    };
  }, []);

  const handleSendMessage = (event: FormEvent) => {
    event.preventDefault();
    if (userMessage.trim() === "") return;

    setMessages([...messages, { type: "user", content: userMessage }]);
    setUserMessage("");
    setLoading(true);

    if (websocket) {
      websocket.send(userMessage);
    }
  };

  const handleFileUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const formData = new FormData();
      formData.append("file", file);

      document.getElementById("upload-loading-spinner")?.classList.remove("hidden");

      fetch("/upload", {
        method: "POST",
        body: formData,
      })
        .then((response) => response.json())
        .then(() => {
          document.getElementById("upload-loading-spinner")?.classList.add("hidden");
          fetchUploadedFiles();
        })
        .catch((error) => {
          console.error("Error uploading the document:", error);
          document.getElementById("upload-loading-spinner")?.classList.add("hidden");
        });
    }
  };

  const fetchUploadedFiles = () => {
    fetch("/documents")
      .then((response) => response.json())
      .then((files) => setUploadedFiles(files))
      .catch((error) => {
        console.error("Error fetching uploaded files:", error);
      });
  };

  const handleDeleteFile = (fileName: string) => {
    fetch(`/delete-document/${fileName}`, {
      method: "DELETE",
    })
      .then((response) => {
        if (response.ok) {
          fetchUploadedFiles();
        } else {
          console.error("Error deleting file:", fileName);
        }
      })
      .catch((error) => {
        console.error("Error sending delete request:", error);
      });
  };

  const debounce = (func: (...args: any[]) => void, delay: number) => {
    let debounceTimer: NodeJS.Timeout;
    return function (...args: any[]) {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => func(...args), delay);
    };
  };

  const fetchSuggestions = debounce(async () => {
    const inputField = document.getElementById("messageText") as HTMLInputElement;
    const suggestionsPanel = document.getElementById("suggestions");
    const query = inputField.value;

    if (query.length < 3) {
      suggestionsPanel?.classList.add("hidden");
      return;
    }

    try {
      const response = await fetch("http://127.0.0.1:8000/queries", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query: query, top_k: 10 }),
      });

      const suggestions = await response.json();

      if (suggestions.length > 0) {
        suggestionsPanel!.innerHTML = "";
        suggestions.forEach((suggestion: string) => {
          const div = document.createElement("div");
          div.innerHTML = suggestion;
          div.classList.add("suggestion-item");
          div.onclick = () => {
            inputField.value = suggestion;
            suggestionsPanel!.classList.add("hidden");
          };
          suggestionsPanel?.appendChild(div);
        });
        suggestionsPanel?.classList.remove("hidden");
      } else {
        suggestionsPanel?.classList.add("hidden");
      }
    } catch (error) {
      console.error("Error fetching suggestions:", error);
    }
  }, 1000);

  return (
    <div className="font-sans min-h-screen p-5 bg-gray-100">
      <div className="page-container relative min-h-screen">
        <header className="flex items-center justify-center py-4 shadow-md mb-6 bg-gray-100 text-center">
          <img src="static/assets/logo.png" alt="Company Logo" className="mr-4 w-16 h-16" />
          <h2 className="text-xl font-semibold">Yema7D - Chat With Your PDF Documents</h2>
        </header>

        <div className="flex flex-row justify-center items-start space-x-5 h-full">
          <div className="bg-gray-50 flex flex-col p-6 bg-white shadow-lg rounded-lg w-3/4 space-y-6 transition-transform duration-300 hover:translate-y-1 hover:shadow-xl">
            <div id="response" className="border p-4 rounded-md overflow-y-auto h-96 space-y-3">
              {messages.map((message, index) => (
                <div key={index} className={`flex ${message.type === "user" ? "justify-end" : "justify-start"} gap-2.5`}>
                  <div className={`flex flex-col w-full max-w-[480px] p-4 ${message.type === "user" ? "bg-blue-100 border border-blue-200 dark:bg-blue-700" : "bg-gray-100 border border-gray-200 dark:bg-gray-700"} rounded-xl`}>
                    {message.type === "bot" ? (
                      <div>
                        <TypeAnimation sequence={[message.content]} speed={80} wrapper="span" repeat={0} cursor={false} className="text-sm font-normal text-gray-900 dark:text-white" />
                      </div>
                    ) : (
                      <p className="text-sm font-normal text-gray-900 dark:text-white">{message.content}</p>
                    )}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-center mt-4">
                  <div className="loader"></div>
                </div>
              )}
            </div>

            <form className="flex space-x-3" onSubmit={handleSendMessage}>
              <input
                type="text"
                id="messageText"
                placeholder="Your question here..."
                value={userMessage}
                onChange={(e) => setUserMessage(e.target.value)}
                className="flex-grow border rounded-md p-2 focus:border-blue-400 focus:outline-none"
                onInput={fetchSuggestions}
              />
              <input
                type="file"
                id="fileInput"
                accept="application/pdf"
                className="hidden"
                onChange={handleFileUpload}
              />
              <label htmlFor="fileInput" className="flex items-center justify-center bg-gray-200 hover:bg-gray-300 rounded-md p-2 cursor-pointer">
                <FiUpload className="h-6 w-6 text-gray-500" />
              </label>
              <button
                type="submit"
                className="bg-black text-white px-4 py-2 rounded-md hover:bg-blue-600 focus:outline-none transition-transform duration-300 hover:translate-y-0.5"
              >
                Send
              </button>
            </form>
          </div>

          <div className="bg-gray-50 flex flex-col items-center p-5 bg-white shadow-md rounded-lg w-1/4 max-w-sm space-y-3 relative">
            <h2 className="text-xl font-semibold mb-4">Upload Documents</h2>
            <div className="border-dashed border-2 border-gray-400 rounded-md p-6 w-full relative group hover:bg-blue-50 transition-all"
              onDrop={(e) => { e.preventDefault(); handleFileUpload(e as any); }}
              onDragOver={(e) => e.preventDefault()}
            >
              <input
                type="file"
                id="fileInput"
                accept="application/pdf"
                className="absolute top-0 left-0 opacity-0 w-full h-full cursor-pointer"
                onChange={handleFileUpload}
              />
              <div className="flex flex-col items-center justify-center space-y-2">
                <svg className="w-10 h-10 text-gray-400 group-hover:text-blue-500 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v4a2 2 0 002 2h12a2 2 0 002-2v-4m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
                </svg>
                <p className="text-gray-400 group-hover:text-blue-500 text-center transition-all">Drag & drop your files here or <span className="underline cursor-pointer">browse</span></p>
              </div>
            </div>

            <div id="uploadStatus" className="text-sm text-red-600 mt-2"></div>

            <div id="upload-loading-spinner" className="hidden">
              <div className="loader"></div>
              <p>Indexing...</p>
            </div>

            <h3 className="text-lg font-semibold mt-4">Uploaded Documents</h3>
            <ul id="uploadedFiles" className="mt-4 space-y-2 w-full">
              {uploadedFiles.map((file, index) => (
                <li key={index} className="flex justify-between items-center bg-gray-50 rounded-md p-2 hover:bg-gray-100 transition-all">
                  <span className="text-gray-600 font-medium">{file}</span>
                  <button onClick={() => handleDeleteFile(file)} className="focus:outline-none">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500 hover:text-red-600" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M6.293 9.293a1 1 0 011.414 0L10 11.586l2.293-2.293a1 1 0 111.414 1.414l-2.293 2.293 2.293 2.293a1 1 0 01-1.414 1.414L10 14.414l-2.293 2.293a1 1 0 01-1.414-1.414l2.293-2.293L6.293 10.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
