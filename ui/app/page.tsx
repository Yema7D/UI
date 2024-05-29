"use client";

import React, { useState } from "react";
import { Card, CardBody, CardFooter, Divider, Link, Avatar, Input } from "@nextui-org/react";
import { HiPaperAirplane } from "react-icons/hi";
import { TypeAnimation } from 'react-type-animation';

export default function Home() {
  const [messages, setMessages] = useState([
    {
      type: "bot",
      content: "Hello How can I help you?"
    }
  ]);
  const [userMessage, setUserMessage] = useState("");

  const handleSendMessage = () => {
    if (userMessage.trim() === "") return;

    const newMessages = [
      ...messages,
      { type: "user", content: userMessage }
    ];

    setMessages(newMessages);
    setUserMessage("");

    // Add a delay before showing bot's response
    setTimeout(() => {
      setMessages([
        ...newMessages,
        { type: "bot", content: "This is a response from the chat bot. This is a response from the chat bot. This is a response from the chat bot. This is a response from the chat bot. This is a response from the chat bot." }
      ]);
    }, 500);
  };

  return (
    <section className="flex flex-col items-center justify-center dark:bg-gray-900 min-h-screen p-4">
    <Card className="max-w-[600px] w-full shadow-xl border border-gray-200 rounded-lg">
      <CardBody className="space-y-4 overflow-y-auto max-h-[500px] p-6 bg-white dark:bg-gray-800">
        {messages.map((message, index) => (
          <div key={index} className={`flex ${message.type === "user" ? "items-end justify-end" : "items-start"} gap-2.5`}>
            {message.type === "bot" && (
              <Avatar
                isBordered
                radius="full"
                size="md"
                src="https://nextui.org/avatars/avatar-1.png"
              />
            )}
            <div className={`flex flex-col w-full max-w-[480px] p-4 ${message.type === "user" ? "bg-blue-100 border border-blue-200 dark:bg-blue-700" : "bg-gray-100 border border-gray-200 dark:bg-gray-700"} rounded-xl`}>
              {message.type === "bot" ? (
                <TypeAnimation
                  sequence={[message.content]}
                  speed={80}
                  wrapper="span"
                  repeat={0}
                  cursor={false}
                  className="text-sm font-normal text-gray-900 dark:text-white"
                />
              ) : (
                <p className="text-sm font-normal text-gray-900 dark:text-white">
                  {message.content}
                </p>
              )}
            </div>
            {message.type === "user" && (
              <Avatar
                isBordered
                radius="full"
                size="md"
                src="https://nextui.org/avatars/avatar-2.png"
              />
            )}
          </div>
        ))}
      </CardBody>
      <Divider />
      <CardFooter className="p-4 bg-gray-50 dark:bg-gray-800">
        <div className="flex items-center gap-2 w-full">
          <Input
            placeholder="Type a message"
            value={userMessage}
            onChange={(e) => setUserMessage(e.target.value)}
            className="flex-grow bg-white dark:bg-gray-700 border border-gray-300 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            size="lg"
          />
          <button
            className="flex items-center justify-center bg-blue-500 hover:bg-blue-600 text-white rounded-full p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            onClick={handleSendMessage}
          >
            <HiPaperAirplane className="h-6 w-6 transform rotate-90 ml-1" />
          </button>
        </div>
      </CardFooter>
    </Card>
  </section>
  );
}
