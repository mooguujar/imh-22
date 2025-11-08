window.App.ChatStore = (function() {
  const eventBus = window.App.EventBus;
  
  class ChatStore {
    constructor() {
      this.conversations = [];
      this.currentConversation = null;
      this.messages = new Map();
      this.unreadCount = new Map();
    }
    
    addConversation(conversation) {
      this.conversations.push(conversation);
      this.messages.set(conversation.id, []);
      this.unreadCount.set(conversation.id, 0);
      eventBus.emit('conversation:added', conversation);
      eventBus.emit('conversations:updated', this.conversations);
    }
    
    updateConversation(conversationId, updates) {
      const index = this.conversations.findIndex(c => c.id === conversationId);
      if (index !== -1) {
        this.conversations[index] = {
          ...this.conversations[index],
          ...updates,
          lastUpdateTime: Date.now()
        };
        
        if (updates.lastMessage) {
          const conversation = this.conversations.splice(index, 1)[0];
          this.conversations.unshift(conversation);
        }
        
        eventBus.emit('conversation:updated', this.conversations[index]);
        eventBus.emit('conversations:updated', this.conversations);
      }
    }
    
    setCurrentConversation(conversationId) {
      this.currentConversation = conversationId;
      this.unreadCount.set(conversationId, 0);
      this.updateConversation(conversationId, { unread: 0 });
      eventBus.emit('conversation:selected', conversationId);
    }
    
    addMessage(conversationId, message) {
      if (!this.messages.has(conversationId)) {
        this.messages.set(conversationId, []);
      }
      
      const messages = this.messages.get(conversationId);
      messages.push({
        ...message,
        id: message.id || Date.now(),
        timestamp: message.timestamp || Date.now()
      });
      
      this.updateConversation(conversationId, {
        lastMessage: message.content,
        lastMessageTime: message.timestamp || Date.now()
      });
      
      if (this.currentConversation !== conversationId) {
        const unread = (this.unreadCount.get(conversationId) || 0) + 1;
        this.unreadCount.set(conversationId, unread);
        this.updateConversation(conversationId, { unread });
      }
      
      eventBus.emit('message:added', { conversationId, message });
    }
    
    getMessages(conversationId) {
      return this.messages.get(conversationId) || [];
    }
    
    searchConversations(keyword) {
      return this.conversations.filter(conv => 
        conv.name.toLowerCase().includes(keyword.toLowerCase()) ||
        (conv.lastMessage && conv.lastMessage.toLowerCase().includes(keyword.toLowerCase()))
      );
    }
  }
  
  // 返回单例
  return new ChatStore();
})();