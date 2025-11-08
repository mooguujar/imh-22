window.App.ChatPage = (function() {
  const ConversationList = window.App.ConversationList;
  const MessageList = window.App.MessageList;
  const chatStore = window.App.ChatStore;
//   const router = window.App.Router;
  const eventBus = window.App.EventBus;
  
  class ChatPage {
    constructor() {
      this.$container = null;
      this.conversationList = null;
      this.messageList = null;
    }
    
    render() {
      return `
        <div id="conversation-container" class="sidebar"></div>
        <div id="message-container" class="main-content"></div>
      `;
    }
    
    mount(container) {
      // 检查登录状态
      // const currentUser = localStorage.getItem('currentUser');
      // if (!currentUser) {
      //   // router.navigate('/login');
      //   return;
      // }
      
      this.$container = $(this.render());
      $(container).append(this.$container);
      
      this.bindEvents();
      this.initComponents();
      this.loadMockData();
    }
    
    bindEvents() {
      this.$container.find('.btn-logout').on('click', () => {
        if (confirm('确定退出登录吗？')) {
          localStorage.removeItem('currentUser');
        //   router.navigate('/login');
        }
      });
    }
    
    initComponents() {
      // 初始化会话列表
      this.conversationList = new ConversationList('#conversation-container');
      this.conversationList.mount();
      
      // 初始化消息列表
      $('#message-container').hide();
      this.messageList = new MessageList('#message-container');
      this.messageList.mount();
    }
    
    loadMockData() {
      // 如果没有数据，加载模拟数据
      if (chatStore.conversations.length === 0) {
        const mockConversations = [
          {
            id: '1',
            name: '张三',
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=1',
            lastMessage: '你好，在吗？',
            lastMessageTime: Date.now() - 5 * 60 * 1000,
            unread: 2,
            isOnline: true
          },
          {
            id: '2',
            name: '李四',
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=2',
            lastMessage: '文件已发送',
            lastMessageTime: Date.now() - 30 * 60 * 1000,
            unread: 0,
            isOnline: false
          }
        ];
        
        mockConversations.forEach(conv => {
          chatStore.addConversation(conv);
          
          // 添加历史消息
          chatStore.addMessage(conv.id, {
            senderId: conv.id,
            content: '你好！',
            type: 'text',
            timestamp: Date.now() - 60 * 60 * 1000,
            avatar: conv.avatar
          });
        });
      }
    }
    
    destroy() {
      // 销毁组件
      this.conversationList && this.conversationList.destroy();
      this.messageList && this.messageList.destroy();
      this.$container && this.$container.remove();
    }
  }

  eventBus.on('conversations:add1', (data) => {
    chatStore.addConversation({
      ...data,
      id: data.gid,
      name: data.gname,
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=2',
      lastMessage: '文件已发送',
      lastMessageTime: data.create_time,
      unread: 0,
      isOnline: false

    });
  });

  $(document).ready(() => {
    setTimeout(() => {
      const app = new ChatPage();
      app.mount('#kchat-im-panel-userlist-groups');
      console.log('11122');
      
    }, 1500);
  });

  return ChatPage;
})();
