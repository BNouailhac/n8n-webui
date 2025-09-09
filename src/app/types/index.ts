export interface Message {
  role: string;
  content: string;
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  model: string;
  createdAt: string;
  updatedAt: string;
}

export interface Model {
  name: string;
  id: string;
} 