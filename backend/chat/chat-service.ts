/**
 * Chat Service
 *
 * Handles persistence and retrieval of conversations and messages.
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';

// ============================================================================
// Configuration
// ============================================================================

const SUPABASE_URL =
  process.env.VITE_SUPABASE_URL || 'https://imxrdomaamdcmhtxztcj.supabase.co';

const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const SUPABASE_ANON_KEY =
  process.env.VITE_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlteHJkb21hYW1kY21odHh6dGNqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYzODk2NDQsImV4cCI6MjA4MTk2NTY0NH0.pn9EZmPwB29Mf2jJwrBxZaMwvegehSzENgKRrcNSOFI';

const SUPABASE_KEY = SUPABASE_SERVICE_ROLE_KEY || SUPABASE_ANON_KEY;

// ============================================================================
// Types
// ============================================================================

export type MessageRole = 'user' | 'assistant' | 'system';
export type MessageType = 'text' | 'thinking' | 'narration' | 'plan' | 'error';

export interface Conversation {
  id: string;
  project_state_id: string;
  user_id: string;
  title: string | null;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  role: MessageRole;
  content: string;
  message_type: MessageType;
  metadata: Record<string, any>;
  created_at: string;
}

export interface ConversationWithMessages extends Conversation {
  messages: Message[];
}

// ============================================================================
// Chat Service Class
// ============================================================================

export class ChatService {
  private readonly supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }

  // ==========================================================================
  // Conversation Operations
  // ==========================================================================

  /**
   * Creates a new conversation for a project
   */
  async createConversation(
    projectStateId: string,
    userId: string,
    title?: string
  ): Promise<Conversation> {
    const { data, error } = await this.supabase
      .from('conversations')
      .insert({
        project_state_id: projectStateId,
        user_id: userId,
        title: title || null,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create conversation: ${error.message}`);
    }

    return data;
  }

  /**
   * Gets or creates a conversation for a project
   */
  async getOrCreateConversation(
    projectStateId: string,
    userId: string
  ): Promise<Conversation> {
    // Try to find existing conversation
    const { data: existing } = await this.supabase
      .from('conversations')
      .select('*')
      .eq('project_state_id', projectStateId)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (existing) {
      return existing;
    }

    // Create new conversation
    return this.createConversation(projectStateId, userId);
  }

  /**
   * Gets a conversation by ID
   */
  async getConversation(conversationId: string): Promise<Conversation | null> {
    const { data, error } = await this.supabase
      .from('conversations')
      .select('*')
      .eq('id', conversationId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw new Error(`Failed to get conversation: ${error.message}`);
    }

    return data;
  }

  /**
   * Gets a conversation by project state ID
   */
  async getConversationByProjectState(
    projectStateId: string,
    userId: string
  ): Promise<ConversationWithMessages | null> {
    const { data: conversation, error: convError } = await this.supabase
      .from('conversations')
      .select('*')
      .eq('project_state_id', projectStateId)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (convError) {
      if (convError.code === 'PGRST116') {
        return null;
      }
      throw new Error(`Failed to get conversation: ${convError.message}`);
    }

    // Get messages for this conversation
    const { data: messages, error: msgError } = await this.supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversation.id)
      .order('created_at', { ascending: true });

    if (msgError) {
      throw new Error(`Failed to get messages: ${msgError.message}`);
    }

    return {
      ...conversation,
      messages: messages || [],
    };
  }

  /**
   * Updates a conversation's title
   */
  async updateConversationTitle(
    conversationId: string,
    title: string
  ): Promise<void> {
    const { error } = await this.supabase
      .from('conversations')
      .update({ title })
      .eq('id', conversationId);

    if (error) {
      throw new Error(`Failed to update conversation: ${error.message}`);
    }
  }

  // ==========================================================================
  // Message Operations
  // ==========================================================================

  /**
   * Adds a message to a conversation
   */
  async addMessage(
    conversationId: string,
    role: MessageRole,
    content: string,
    messageType: MessageType = 'text',
    metadata: Record<string, any> = {}
  ): Promise<Message> {
    const { data, error } = await this.supabase
      .from('messages')
      .insert({
        conversation_id: conversationId,
        role,
        content,
        message_type: messageType,
        metadata,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to add message: ${error.message}`);
    }

    return data;
  }

  /**
   * Gets all messages for a conversation
   */
  async getMessages(conversationId: string): Promise<Message[]> {
    const { data, error } = await this.supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (error) {
      throw new Error(`Failed to get messages: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Adds multiple messages in batch (for restoring state)
   */
  async addMessagesBatch(
    conversationId: string,
    messages: Array<{
      role: MessageRole;
      content: string;
      message_type?: MessageType;
      metadata?: Record<string, any>;
    }>
  ): Promise<Message[]> {
    const records = messages.map((msg) => ({
      conversation_id: conversationId,
      role: msg.role,
      content: msg.content,
      message_type: msg.message_type || 'text',
      metadata: msg.metadata || {},
    }));

    const { data, error } = await this.supabase
      .from('messages')
      .insert(records)
      .select();

    if (error) {
      throw new Error(`Failed to add messages: ${error.message}`);
    }

    return data || [];
  }
}

// ============================================================================
// Singleton Instance
// ============================================================================

let instance: ChatService | null = null;

export function getChatService(): ChatService {
  if (!instance) {
    instance = new ChatService();
  }
  return instance;
}
