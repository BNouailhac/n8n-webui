'use client';

import { useState, useEffect, useCallback } from 'react';
import { PaperAirplaneIcon } from '@heroicons/react/24/solid';
import ChatMessage from './components/ChatMessage';
import ChatLoading from './components/ChatLoading';
import ModelSelector from './components/ModelSelector';
import Settings from './components/Settings';
import ConversationList from './components/ConversationList';
import { Conversation, Message } from './types';
import ThemeToggle from "./components/ThemeToggle";
import WelcomeDialog, { HelpButton } from './components/WelcomeDialog';
import { useAppStore } from './store/useAppStore';
import { Model } from './types';
import TextareaAutosize from '@mui/material/TextareaAutosize';

// Generate unique ID
const generateId = () => Math.random().toString(36).substring(2) + Date.now().toString(36);

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState<Model>({ name: "Sélection Automatique", icon: "icon/star.png", model: "openrouter/auto", source: "cloud", id: "0" });
  const [error, setError] = useState<string | null>(null);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [showWelcomeDialog, setShowWelcomeDialog] = useState(false);

  // Use Zustand store
  const {
    conversations,
    hasVisited,
    setConversations,
    addConversation,
    updateConversation,
    deleteConversation,
    setHasVisited,
    getCurrentConversation
  } = useAppStore();

  // Initialize loading
  useEffect(() => {
    setMounted(true);
    if (conversations.length > 0) {
      setCurrentConversationId(conversations[0].id);
    }
  }, [conversations]);

  // Check if first visit - only show welcome dialog once
  useEffect(() => {
    console.log(hasVisited)
    if (!hasVisited) {
      setShowWelcomeDialog(true);
      setHasVisited(true);
    }
  }, [hasVisited, setHasVisited]);

  const currentConversation = getCurrentConversation(currentConversationId);

  const handleNewConversation = useCallback(() => {
    const newConversation: Conversation = {
      id: generateId(),
      title: 'New Chat',
      messages: [],
      model: selectedModel,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    addConversation(newConversation);
    setCurrentConversationId(newConversation.id);
  }, [selectedModel, addConversation]);

  const handleDeleteConversation = useCallback((id: string) => {
    deleteConversation(id);
    if (currentConversationId === id) {
      const remaining = conversations.filter(c => c.id !== id);
      setCurrentConversationId(remaining.length > 0 ? remaining[0].id : null);
    }
  }, [currentConversationId, conversations, deleteConversation]);

  const updateConversationTitle = useCallback((id: string, firstMessage: string) => {
    updateConversation(id, {
      title: firstMessage.substring(0, 30) + (firstMessage.length > 30 ? '...' : ''),
      updatedAt: new Date().toISOString()
    });
  }, [updateConversation]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !selectedModel || loading) return;

    if (!currentConversationId) {
      handleNewConversation();
      return;
    }

    const newMessage: Message = { role: 'user', content: input };
    const currentMessages = currentConversation?.messages || [];
    
    updateConversation(currentConversationId!, {
      messages: [...(currentConversation?.messages || []), newMessage],
      updatedAt: new Date().toISOString()
    });
    if (currentConversation?.messages.length === 0) {
      updateConversationTitle(currentConversationId!, input);
    }

    setInput('');
    setLoading(true);
    setError(null); 

    try {
      const data = await fetch('/api/postmessage', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: selectedModel.model,
          conversationId: currentConversationId,
          source: selectedModel.source,
          messages: [...currentMessages, newMessage]
        }),
      });

      const response = await data.json()

      let Message = response.result.output;

      if (Message && response.result.code === "success") {
        updateConversation(currentConversationId!, {
          messages: [...(currentConversation?.messages || []), { role: 'user', content: input }, { role: 'assistant', content: Message }],
          updatedAt: new Date().toISOString()
        });
      } else if (Message && response.result.code === "user-confirmation") {
        updateConversation(currentConversationId!, {
          messages: [...(currentConversation?.messages || []), { role: 'user', content: input }, { role: 'user-confirmation', content: Message }],
          updatedAt: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error('Error in chat request:', error);
      setError(error instanceof Error ? error.message : 'Failed to send message');
    } finally {
      setLoading(false);
    }
  };

  const displayMessages = currentConversation ? [
    ...currentConversation.messages,
    ...[]
  ] : [];

  const handleImportConversations = useCallback((imported: Conversation[]) => {
    const existingIds = new Set(conversations.map(c => c.id));
    const newConversations = imported.filter(c => !existingIds.has(c.id));
    setConversations([...newConversations, ...conversations]);
  }, [conversations, setConversations]);

  if (!mounted) {
    return null;
  }

  return (
    <div className="flex h-screen">
      <ConversationList
        conversations={conversations}
        currentConversationId={currentConversationId}
        onSelect={(conv) => setCurrentConversationId(conv.id)}
        onNew={handleNewConversation}
        onDelete={handleDeleteConversation}
      />
      
      <div className="flex-1 flex flex-col">
        <header className="p-4 border-b">
          <div className="flex items-center justify-between max-w-7xl mx-auto w-full">
            <h1 className="text-2xl font-bold"><img style={{"width": "160px"}} src="logo.png" alt="Tickitall logo"/></h1>
            <div className="flex items-center gap-4">
              <ModelSelector
                selectedModel={selectedModel}
                onModelSelect={setSelectedModel}
              />
              <Settings
                conversations={conversations}
                onConversationsImport={handleImportConversations}
              />
              <ThemeToggle />
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-4">
          <div className="max-w-6xl mx-auto">
            {displayMessages.map((message, index) => (
              <ChatMessage
                key={`${currentConversationId}-${index}`}
                role={message.role}
                content={message.content}
              />
            ))}
            {loading && (
              <ChatLoading/>
            )}
            {error && (
              <div className="text-error text-center p-4">
                Error: {error}
              </div>
            )}
          </div>
        </main>

        <footer className="p-4 border-t">
            <form onSubmit={handleSubmit} className="max-w-4xl mx-auto flex gap-4">
            <TextareaAutosize
              className="textarea textarea-bordered flex-1"
              placeholder="Type your message..."
              maxRows={2}
              value={input}
              onChange={(e) => {setInput(e.target.value)}}
              disabled={loading || !selectedModel}
              style={{resize: 'none'}}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  handleSubmit(e);
                }
              }}
            />
            <button
              type="submit"
              className="btn btn-accent"
              disabled={loading || !selectedModel || !input.trim()}
            >
              <PaperAirplaneIcon className="w-5 h-5" />
            </button>
            </form>
        </footer>
      </div>

      {/* Help button */}
      <HelpButton onClick={() => setShowWelcomeDialog(true)} />

      {/* Welcome dialog */}
      <WelcomeDialog
        isOpen={showWelcomeDialog}
        onClose={() => setShowWelcomeDialog(false)}
      />
    </div>
  );
}