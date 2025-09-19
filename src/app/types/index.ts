export interface Message {
  role: string;
  content: string;
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  model: {};
  createdAt: string;
  updatedAt: string;
}

export interface Model {
  name: string;
  icon: string;
  model: string;
  source: string;
  id: string;
} 