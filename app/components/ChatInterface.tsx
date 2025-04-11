import React, { useState, useRef, useEffect } from "react";
import { Button, Input, Textarea, Spinner, Card, CardBody, Avatar, Divider } from "@nextui-org/react";
import { MdSend, MdInsertDriveFile } from "react-icons/md";
import axios from "axios";
import ReactMarkdown, { type Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import CodeBlock from './CodeBlock'; 

interface Message {
  id: string;
  content: string;
  role: "user" | "assistant";
  timestamp: Date;
}

interface ChatInterfaceProps {
  caseTitle: string;
  dlCitationNo: string;
  baseAIUrl: string;
  vectorStoreId?: string;
  fileId?: string;
}

const components: Partial<Components> = {
  code: CodeBlock,
  pre: ({ children }) => <>{children}</>,
  ol: ({ node, children, ...props }) => {
    return (
      <ol className="list-decimal list-outside ml-4" {...props}>
        {children}
      </ol>
    );
  },
  li: ({ node, children, ...props }) => {
    return (
      <li className="py-1" {...props}>
        {children}
      </li>
    );
  },
  ul: ({ node, children, ...props }) => {
    return (
      <ul className="list-decimal list-outside ml-4" {...props}>
        {children}
      </ul>
    );
  },
  strong: ({ node, children, ...props }) => {
    return (
      <span className="font-semibold" {...props}>
        {children}
      </span>
    );
  },
  a: ({ node, children, ...props }) => {
    return (
      <a
        className="text-blue-500 hover:underline"
        target="_blank"
        rel="noreferrer"
        {...props}
      >
        {children}
      </a>
    );
  },
  h1: ({ node, children, ...props }) => {
    return (
      <h1 className="text-3xl font-semibold mt-6 mb-2" {...props}>
        {children}
      </h1>
    );
  },
  h2: ({ node, children, ...props }) => {
    return (
      <h2 className="text-2xl font-semibold mt-6 mb-2" {...props}>
        {children}
      </h2>
    );
  },
  h3: ({ node, children, ...props }) => {
    return (
      <h3 className="text-xl font-semibold mt-6 mb-2" {...props}>
        {children}
      </h3>
    );
  },
  h4: ({ node, children, ...props }) => {
    return (
      <h4 className="text-lg font-semibold mt-6 mb-2" {...props}>
        {children}
      </h4>
    );
  },
  h5: ({ node, children, ...props }) => {
    return (
      <h5 className="text-base font-semibold mt-6 mb-2" {...props}>
        {children}
      </h5>
    );
  },
  h6: ({ node, children, ...props }) => {
    return (
      <h6 className="text-sm font-semibold mt-6 mb-2" {...props}>
        {children}
      </h6>
    );
  },
};


export default function ChatInterface({
  caseTitle,
  dlCitationNo,
  baseAIUrl,
  vectorStoreId,
  fileId
}: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Sample legal questions that users might want to ask
  const sampleQuestions = [
    "What are the key facts of this case?",
    "What was the court's reasoning in this decision?",
    "How might this ruling impact similar cases?",
    "What precedents were cited in this case?",
    "What were the arguments of the plaintiff and defendant?"
  ];

  // Scroll to bottom of chat when messages update
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  
  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;
    
    // Create user message
    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputMessage,
      role: "user",
      timestamp: new Date()
    };
    
    // Add user message to chat
    setMessages(prev => [...prev, userMessage]);
    setInputMessage("");
    setIsLoading(true);
    
    try {
      // Get token for authorization
      const token = localStorage.getItem("access_token");
      if (!token) {
        throw new Error("Not authenticated");
      }
      
      // Prepare the conversation history
      const conversationHistory = messages.map(msg => ({
        role: msg.role,
        content: msg.content
      }));
      
      // Add the new user message
      conversationHistory.push({
        role: "user",
        content: userMessage.content
      });
      
      // Call AI API
      const response = await axios.post(
        `${baseAIUrl}/case-chat`,
        {
          messages: conversationHistory,
          vector_store_id: vectorStoreId,
          file_id: fileId,
          dl_citation_no: dlCitationNo
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      // Add AI response to chat
      const aiResponse: Message = {
        id: Date.now().toString(),
        content: response.data.response || "I'm sorry, I couldn't process that request.",
        role: "assistant",
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, aiResponse]);
    } catch (error) {
      console.error("Error sending message to AI:", error);
      
      // Add error message
      const errorMessage: Message = {
        id: Date.now().toString(),
        content: "I'm sorry, I encountered an error processing your request. Please try again.",
        role: "assistant",
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  const handleSampleQuestionClick = (question: string) => {
    setInputMessage(question);
    // Optional: Auto-send the question immediately
    setTimeout(() => handleSendMessage(), 100);
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* System message - brief instructions (only shows before first message) */}
      {messages.length === 0 && (
        <div className="px-4 py-3 bg-white border-b border-gray-200">
          <p className="text-sm text-gray-600">
            I'm an AI assistant that can help you understand case <strong>{caseTitle}</strong>. Ask me any questions about the facts, legal reasoning, or implications.
          </p>
        </div>
      )}
      
      {/* Sample questions - only show if no messages have been sent yet */}
      {messages.length === 0 && (
        <div className="px-4 py-3 bg-white border-b border-gray-200">
          <p className="text-sm text-gray-600 mb-2">Quick questions:</p>
          <div className="flex flex-wrap gap-2">
            {sampleQuestions.map((question, index) => (
              <Button
                key={index}
                size="sm"
                color="primary"
                onPress={() => handleSampleQuestionClick(question)}
              >
                {question}
              </Button>
            ))}
          </div>
        </div>
      )}
      
      {/* Messages container */}
      <div className="flex-grow overflow-y-auto p-4 space-y-6">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${
              message.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-2 ${
                message.role === "user"
                  ? "bg-slate-800 text-white"
                  : "bg-white text-gray-800 border border-gray-200 shadow-sm py-4"
              }`}
            >
              <div className="prose prose-sm max-w-none">
                {message.role === "user" ? (
                  <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
                ) : (
                  // <p>{message.content}</p>
                  <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>{message.content}</ReactMarkdown>
                )}
              </div>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="max-w-[85%] rounded-2xl p-4 bg-white text-gray-800 border border-gray-200 shadow-sm">
              {/* <div className="flex items-center mb-2">
                <div className="h-7 w-7 rounded-full bg-gray-100 flex items-center justify-center mr-2">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M20 11a8 8 0 1 0-16 0v.5c0 1.4.7 2.7 1.8 3.5h.2c1.1 0 2-.9 2-2V10a4 4 0 1 1 8 0v3c0 1.1.9 2 2 2h.2a4.5 4.5 0 0 0 1.8-3.5V11z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <span className="font-medium text-sm text-gray-800">Assistant</span>
              </div> */}
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full bg-gray-300 animate-pulse"></div>
                <div className="w-2 h-2 rounded-full bg-gray-300 animate-pulse delay-75"></div>
                <div className="w-2 h-2 rounded-full bg-gray-300 animate-pulse delay-150"></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Input area - OpenAI style */}
      <div className="p-4 bg-white border-t border-gray-200">
        <div className="flex relative">
          <Textarea
            placeholder="Ask a question about this case..."
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={handleKeyPress}
            minRows={1}
            maxRows={5}
            classNames={{
              base: "w-full pr-12",
              input: "resize-none py-3 px-4 rounded-xl border-gray-300 focus:border-primary",
            }}
            disabled={isLoading}
          />
          <Button
            isIconOnly
            color="primary"
            className="absolute right-2 bottom-2 min-w-0 w-8 h-8 p-0"
            aria-label="Send"
            onClick={handleSendMessage}
            isLoading={isLoading}
            isDisabled={!inputMessage.trim()}
            radius="full"
          >
            <MdSend size={16} />
          </Button>
        </div>
        <p className="text-xs text-gray-500 mt-2 text-center">
          AI responses are generated based on the case content. They should not be considered legal advice.
        </p>
      </div>
    </div>
  );
}