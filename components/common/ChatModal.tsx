
import React, { useState, useEffect, useRef } from 'react';
import type { Conversation, Message, User } from '../../types';
import { api } from '../../services/api';
import { Button } from './Button';

interface ChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  conversationId: string;
  currentUser: User;
}

export const ChatModal: React.FC<ChatModalProps> = ({ isOpen, onClose, conversationId, currentUser }) => {
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      const fetchConversation = async () => {
        setLoading(true);
        const data = await api.getConversationById(conversationId);
        setConversation(data || null);
        setLoading(false);
      };
      fetchConversation();
    }
  }, [isOpen, conversationId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversation?.messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() === '') return;

    const sentMessage = await api.sendMessage(conversationId, currentUser.id, newMessage);
    if (sentMessage && conversation) {
      setConversation({
        ...conversation,
        messages: [...conversation.messages, sentMessage],
      });
      setNewMessage('');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg h-[70vh] flex flex-col">
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="text-xl font-semibold">Messages</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
        </div>
        <div className="flex-1 p-4 overflow-y-auto bg-gray-50 space-y-4">
          {loading ? (
            <p>Loading messages...</p>
          ) : conversation?.messages.length === 0 ? (
            <p className="text-center text-gray-500">No messages yet. Start the conversation!</p>
          ) : (
            conversation?.messages.map(msg => (
              <div key={msg.id} className={`flex ${msg.senderId === currentUser.id ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-xs lg:max-w-md p-3 rounded-lg ${msg.senderId === currentUser.id ? 'bg-indigo-500 text-white' : 'bg-gray-200 text-gray-800'}`}>
                  <p>{msg.text}</p>
                  <p className={`text-xs mt-1 ${msg.senderId === currentUser.id ? 'text-indigo-200' : 'text-gray-500'}`}>
                    {new Date(msg.timestamp).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>
        <div className="p-4 border-t">
          <form onSubmit={handleSendMessage} className="flex space-x-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 border border-gray-300 rounded-md p-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white text-gray-900"
            />
            <Button type="submit">Send</Button>
          </form>
        </div>
      </div>
    </div>
  );
};
