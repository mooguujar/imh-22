window.App.ConversationList = (function() {
  const chatStore = window.App.ChatStore;
  const eventBus = window.App.EventBus;
  const ConversationItem = window.App.ConversationItem;
  
  class ConversationList {
    constructor(containerId) {
      this.containerId = containerId;
      this.$container = null;
      this.items = new Map();
      this.filter = 'all';
      this.searchKeyword = '';
    }
    
    render() {
      // <div class="conversation-list-header">
      //       <input type="text" class="search-input" placeholder="搜索会话...">
      //       <div class="filter-buttons">
      //         <button class="filter-btn active" data-filter="all">全部</button>
      //         <button class="filter-btn" data-filter="unread">未读</button>
      //         <button class="filter-btn" data-filter="pinned">置顶</button>
      //       </div>
      //     </div>
      return `
        <div class="conversation-list">
          
          <div class="conversation-list-body"></div>
        </div>
      `;
    }
    
    mount() {
      this.$container = $(this.render());
      $(this.containerId).append(this.$container);
      this.bindEvents();
      this.subscribeToStore();
      this.renderConversations();
      return this;
    }
    
    bindEvents() {
      // this.$container.find('.search-input').on('input', (e) => {
      //   this.searchKeyword = e.target.value;
      //   this.renderConversations();
      // });
      
      // this.$container.find('.filter-btn').on('click', (e) => {
      //   const $btn = $(e.target);
      //   this.filter = $btn.data('filter');
      //   this.$container.find('.filter-btn').removeClass('active');
      //   $btn.addClass('active');
      //   this.renderConversations();
      // });
    }
    
    subscribeToStore() {
      eventBus.on('conversations:updated', () => {
        this.renderConversations();
      });
      
      eventBus.on('conversation:updated', (conversation) => {
        if (this.items.has(conversation.id)) {
          this.items.get(conversation.id).update(conversation);
        }
      });
      
      eventBus.on('conversation:deleted', (conversation) => {
        if (this.items.has(conversation.id)) {
          this.items.get(conversation.id).destroy();
          this.items.delete(conversation.id);
        }
      });
      
      eventBus.on('conversation:selected', (conversationId) => {
        this.$container.find('.conversation-item').removeClass('active');
        this.$container.find(`[data-id="${conversationId}"]`).addClass('active');
      });
    }
    
    renderConversations() {
      const $body = this.$container.find('.conversation-list-body');
      
      this.items.forEach(item => item.destroy());
      this.items.clear();
      $body.empty();
      
      let conversations = this.getFilteredConversations();

      console.log('conv 111', conversations);
      
      
      conversations.sort((a, b) => {
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
        return (b.lastMessageTime || 0) - (a.lastMessageTime || 0);
      });
      
      conversations.forEach(conv => {
        const item = new ConversationItem(conv);
        item.mount($body);
        this.items.set(conv.id, item);
      });
      
      if (conversations.length === 0) {
        $body.html('<div class="empty-state">暂无会话</div>');
      }
    }
    
    getFilteredConversations() {
      let conversations = chatStore.conversations;
      
      if (this.searchKeyword) {
        conversations = chatStore.searchConversations(this.searchKeyword);
      }
      
      switch(this.filter) {
        case 'unread':
          conversations = conversations.filter(c => c.unread > 0);
          break;
        case 'pinned':
          conversations = conversations.filter(c => c.isPinned);
          break;
      }
      
      return conversations;
    }
    
    destroy() {
      this.items.forEach(item => item.destroy());
      this.items.clear();
      this.$container && this.$container.remove();
    }
  }
  
  return ConversationList;
})();