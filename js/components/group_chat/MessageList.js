window.App.MessageList = (function() {
  const chatStore = window.App.ChatStore;
  const eventBus = window.App.EventBus;
  const MessageItem = window.App.MessageItem;
  
  class MessageList {
    constructor(containerId) {
      this.containerId = containerId;
      this.$container = null;
      this.currentConversationId = null;
      this.messages = [];
      this.messageItems = new Map();
      this.isAtBottom = true;
      this.unreadMessages = 0;
    }
    
    render() {
      return `
        <div class="message-list">
          <div class="message-list-header">
            <div class="header-actions">
              <button class="btn-call" title="语音通话">📞</button>
              <button class="btn-video" title="视频通话">📹</button>
              <button class="btn-more" title="更多">⋮</button>
            </div>
          </div>
          
          <div class="message-list-body">
            <div class="messages-container"></div>
            <button class="btn-scroll-bottom" style="display: none;">
              <span>↓</span>
              <span class="unread-count"></span>
            </button>
          </div>
          
          <div class="message-input-area">
            <div class="input-toolbar">
              <button class="btn-emoji" title="表情">😊</button>
              <button class="btn-image" title="图片">🖼️</button>
              <button class="btn-file" title="文件">📎</button>
              <button class="btn-voice" title="语音">🎤</button>
              <button class="btn-video-msg" title="视频">📹</button>
            </div>
            <div class="input-wrapper">
              <textarea class="message-input" placeholder="输入消息... (Shift+Enter换行)" rows="1"></textarea>
              <button class="btn-send">发送</button>
            </div>
          </div>
          
          <input type="file" class="file-input" accept="image/*" style="display: none;" multiple>
          <input type="file" class="file-input-doc" style="display: none;">
        </div>
      `;
    }
    
    mount() {
      this.$container = $(this.render());
      console.log('MessageList mounted 111', this.$container);
      
      $(this.containerId).append(this.$container);
      this.bindEvents();
      this.subscribeToStore();
      this.setupScrollObserver();
      return this;
    }
    
    bindEvents() {
      // 返回按钮（移动端）
      this.$container.find('.btn-back').on('click', () => {
        // 可以触发显示会话列表
        $(document).trigger('show:conversation-list');
      });
      
      // 发送消息
      this.$container.find('.btn-send').on('click', () => {
        this.sendMessage();
      });
      
      // 输入框事件
      const $input = this.$container.find('.message-input');
      
      // 回车发送
      $input.on('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          this.sendMessage();
        }
      });
      
      // 自动调整高度
      $input.on('input', function() {
        this.style.height = 'auto';
        this.style.height = Math.min(this.scrollHeight, 120) + 'px';
      });
      
      // 输入状态提示
      let typingTimer;
      $input.on('input', () => {
        clearTimeout(typingTimer);
        // 可以发送正在输入的状态
        typingTimer = setTimeout(() => {
          // 停止输入状态
        }, 1000);
      });
      
      // 工具栏按钮
      this.$container.find('.btn-emoji').on('click', () => {
        this.showEmojiPicker();
      });
      
      this.$container.find('.btn-image').on('click', () => {
        this.$container.find('.file-input').click();
      });
      
      this.$container.find('.btn-file').on('click', () => {
        this.$container.find('.file-input-doc').click();
      });
      
      this.$container.find('.btn-voice').on('click', () => {
        this.startVoiceRecord();
      });
      
      this.$container.find('.btn-video-msg').on('click', () => {
        this.startVideoRecord();
      });
      
      // 文件选择
      this.$container.find('.file-input').on('change', (e) => {
        this.handleImageUpload(e.target.files);
        e.target.value = ''; // 清空以便重复选择
      });
      
      this.$container.find('.file-input-doc').on('change', (e) => {
        this.handleFileUpload(e.target.files);
        e.target.value = '';
      });
      
      // 滚动到底部按钮
      this.$container.find('.btn-scroll-bottom').on('click', () => {
        this.scrollToBottom(true);
      });
      
      // 滚动事件
      this.$container.find('.message-list-body').on('scroll', () => {
        this.handleScroll();
      });
      
      // 拖拽上传
      const $body = this.$container.find('.message-list-body');
      
      $body.on('dragover', (e) => {
        e.preventDefault();
        $body.addClass('drag-over');
      });
      
      $body.on('dragleave', () => {
        $body.removeClass('drag-over');
      });
      
      $body.on('drop', (e) => {
        e.preventDefault();
        $body.removeClass('drag-over');
        
        const files = Array.from(e.originalEvent.dataTransfer.files);
        const images = files.filter(f => f.type.startsWith('image/'));
        const docs = files.filter(f => !f.type.startsWith('image/'));
        
        if (images.length) this.handleImageUpload(images);
        if (docs.length) this.handleFileUpload(docs);
      });
      
      // 通话按钮
      this.$container.find('.btn-call').on('click', () => {
        this.startCall('audio');
      });
      
      this.$container.find('.btn-video').on('click', () => {
        this.startCall('video');
      });
      
      // 粘贴事件（支持粘贴图片）
      $input.on('paste', (e) => {
        const items = e.originalEvent.clipboardData.items;
        for (let item of items) {
          if (item.type.indexOf('image') !== -1) {
            const file = item.getAsFile();
            this.handleImageUpload([file]);
            e.preventDefault();
          }
        }
      });
    }
    
    subscribeToStore() {
      eventBus.on('conversation:selected', (conversationId) => {
        this.loadConversation(conversationId);
      });
      
      eventBus.on('message:added', ({ conversationId, message }) => {
        if (conversationId === this.currentConversationId) {
          this.appendMessage(message);
        }
      });
      
      // 监听消息操作
      $(document).on('message:reply', (e, message) => {
        this.replyToMessage(message);
      });
      
      $(document).on('message:recall', (e, messageId) => {
        this.handleMessageRecall(messageId);
      });
      
      $(document).on('message:delete', (e, messageId) => {
        this.handleMessageDelete(messageId);
      });
    }
    
    setupScrollObserver() {
      // 监听消息进入视口（标记已读）
      if ('IntersectionObserver' in window) {
        this.messageObserver = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              const $message = $(entry.target);
              const messageId = $message.data('message-id');
              // 标记为已读
              this.markAsRead(messageId);
            }
          });
        }, { threshold: 0.5 });
      }
    }
    
    loadConversation(conversationId) {
      this.currentConversationId = conversationId;
      const conversation = chatStore.conversations.find(c => c.id === conversationId);
      
      if (!conversation) return;
      
      // 更新标题
      this.$container.find('.conversation-title').text(conversation.name);
      this.$container.find('.conversation-status').text(
        conversation.isOnline ? '在线' : `最后在线: ${this.formatLastSeen(conversation.lastSeen)}`
      ).toggleClass('online', conversation.isOnline);
      
      // 加载消息
      this.messages = chatStore.getMessages(conversationId);
      this.renderMessages();
      
      // 滚动到底部
      this.scrollToBottom();
    }
    
    renderMessages() {
      const $container = this.$container.find('.messages-container');
      
      // 清空现有消息
      this.messageItems.forEach(item => item.destroy());
      this.messageItems.clear();
      $container.empty();
      
      if (this.messages.length === 0) {
        $container.html(`
          <div class="empty-state">
            <div class="empty-icon">💬</div>
            <p>暂无消息，发送一条消息开始聊天吧</p>
          </div>
        `);
        return;
      }
      
      // 按日期分组
      const groupedMessages = this.groupMessagesByDate(this.messages);
      
      Object.entries(groupedMessages).forEach(([date, messages]) => {
        // 添加日期分隔
        $container.append(`<div class="date-divider">${date}</div>`);
        
        // 渲染消息
        messages.forEach(msg => {
          const isSelf = msg.senderId === 'currentUser'; // 根据实际情况判断
          const item = new MessageItem(msg, isSelf);
          item.mount($container);
          this.messageItems.set(msg.id, item);
          
          // 添加到观察器
          if (this.messageObserver) {
            this.messageObserver.observe(item.$el[0]);
          }
        });
      });
    }
    
    groupMessagesByDate(messages) {
      const groups = {};
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      
      messages.forEach(msg => {
        const msgDate = new Date(msg.timestamp);
        let dateKey;
        
        if (msgDate.toDateString() === today.toDateString()) {
          dateKey = '今天';
        } else if (msgDate.toDateString() === yesterday.toDateString()) {
          dateKey = '昨天';
        } else {
          dateKey = `${msgDate.getMonth() + 1}月${msgDate.getDate()}日`;
        }
        
        if (!groups[dateKey]) {
          groups[dateKey] = [];
        }
        groups[dateKey].push(msg);
      });
      
      return groups;
    }
    
    appendMessage(message) {
      const $container = this.$container.find('.messages-container');
      
      // 如果是空状态，先清空
      if ($container.find('.empty-state').length) {
        $container.empty();
      }
      
      // 检查是否需要添加日期分隔
      const lastMessage = this.messages[this.messages.length - 1];
      if (lastMessage) {
        const lastDate = new Date(lastMessage.timestamp).toDateString();
        const newDate = new Date(message.timestamp).toDateString();
        
        if (lastDate !== newDate) {
          const dateStr = newDate === new Date().toDateString() ? '今天' : 
                         `${new Date(message.timestamp).getMonth() + 1}月${new Date(message.timestamp).getDate()}日`;
          $container.append(`<div class="date-divider">${dateStr}</div>`);
        }
      }
      
      // 添加消息
      const isSelf = message.senderId === 'currentUser';
      const item = new MessageItem(message, isSelf);
      item.mount($container);
      this.messageItems.set(message.id, item);
      
      this.messages.push(message);
      
      // 如果在底部或是自己发送的，自动滚动
      if (this.isAtBottom || isSelf) {
        this.scrollToBottom(true);
      } else {
        // 显示新消息提示
        this.unreadMessages++;
        this.updateScrollButton();
      }
      
      // 添加到观察器
      if (this.messageObserver) {
        this.messageObserver.observe(item.$el[0]);
      }
    }
    
    sendMessage() {
      const $input = this.$container.find('.message-input');
      const content = $input.val().trim();
      
      if (!content || !this.currentConversationId) return;
      
      const message = {
        id: Date.now() + Math.random(),
        conversationId: this.currentConversationId,
        senderId: 'currentUser',
        content,
        type: 'text',
        timestamp: Date.now(),
        status: 'sending',
        avatar: '/current-user-avatar.jpg'
      };
      
      // 添加到 store
      chatStore.addMessage(this.currentConversationId, message);
      
      // 清空输入框
      $input.val('').css('height', 'auto').focus();
      
      // 模拟发送状态变化
      setTimeout(() => {
        this.updateMessageStatus(message.id, 'sent');
      }, 500);
      
      setTimeout(() => {
        this.updateMessageStatus(message.id, 'delivered');
      }, 1000);
      
      // 模拟收到回复（测试用）
      if (Math.random() > 0.5) {
        setTimeout(() => {
          const conversation = chatStore.conversations.find(c => c.id === this.currentConversationId);
          chatStore.addMessage(this.currentConversationId, {
            senderId: this.currentConversationId,
            content: `收到你的消息: "${content}"`,
            type: 'text',
            timestamp: Date.now(),
            avatar: conversation.avatar,
            senderName: conversation.name
          });
        }, 2000);
      }
    }
    
    handleImageUpload(files) {
      if (!files || files.length === 0) return;
      
      Array.from(files).forEach(file => {
        // 预览图片
        const reader = new FileReader();
        reader.onload = (e) => {
          const message = {
            id: Date.now() + Math.random(),
            conversationId: this.currentConversationId,
            senderId: 'currentUser',
            content: e.target.result, // Base64 图片数据
            type: 'image',
            timestamp: Date.now(),
            status: 'sending',
            avatar: '/current-user-avatar.jpg'
          };
          
          chatStore.addMessage(this.currentConversationId, message);
          
          // 模拟上传
          setTimeout(() => {
            this.updateMessageStatus(message.id, 'sent');
          }, 1000);
        };
        reader.readAsDataURL(file);
      });
    }
    
    handleFileUpload(files) {
      if (!files || files.length === 0) return;
      
      Array.from(files).forEach(file => {
        const message = {
          id: Date.now() + Math.random(),
          conversationId: this.currentConversationId,
          senderId: 'currentUser',
          content: {
            name: file.name,
            size: file.size,
            url: URL.createObjectURL(file)
          },
          type: 'file',
          timestamp: Date.now(),
          status: 'sending',
          avatar: '/current-user-avatar.jpg'
        };
        
        chatStore.addMessage(this.currentConversationId, message);
        
        setTimeout(() => {
          this.updateMessageStatus(message.id, 'sent');
        }, 1000);
      });
    }
    
    showEmojiPicker() {
      // 简单的表情选择器
      const emojis = ['😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂', '🙂', '🙃', '😉', '😊', 
                      '😇', '🥰', '😍', '🤩', '😘', '😗', '😚', '😙', '😋', '😛', '😜', '🤪',
                      '👍', '👎', '👌', '✌️', '🤞', '🤟', '🤘', '🤙', '👏', '🙌', '👐', '🤲',
                      '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❣️', '💕'];
      
      const $picker = $(`
        <div class="emoji-picker">
          <div class="emoji-picker-content">
            ${emojis.map(emoji => `<button class="emoji-btn">${emoji}</button>`).join('')}
          </div>
        </div>
      `);
      
      // 移除已存在的选择器
      $('.emoji-picker').remove();
      
      this.$container.find('.input-toolbar').append($picker);
      
      setTimeout(() => {
        $picker.addClass('show');
      }, 10);
      
      $picker.find('.emoji-btn').on('click', (e) => {
        const emoji = $(e.target).text();
        const $input = this.$container.find('.message-input');
        $input.val($input.val() + emoji).focus();
      });
      
      // 点击其他地方关闭
      setTimeout(() => {
        $(document).one('click', (e) => {
          if (!$(e.target).closest('.emoji-picker, .btn-emoji').length) {
            $picker.remove();
          }
        });
      }, 100);
    }
    
    startVoiceRecord() {
      alert('语音录制功能开发中...');
      // TODO: 实现语音录制
    }
    
    startVideoRecord() {
      alert('视频录制功能开发中...');
      // TODO: 实现视频录制
    }
    
    startCall(type) {
      const conversation = chatStore.conversations.find(c => c.id === this.currentConversationId);
      alert(`发起${type === 'audio' ? '语音' : '视频'}通话: ${conversation.name}`);
      // TODO: 实现通话功能
    }
    
    replyToMessage(message) {
      const $input = this.$container.find('.message-input');
      $input.val(`回复 @${message.senderName}: `).focus();
    }
    
    handleMessageRecall(messageId) {
      const item = this.messageItems.get(messageId);
      if (item) {
        // 替换为撤回提示
        item.$el.html(`
          <div class="message-recalled">
            <span>你撤回了一条消息</span>
          </div>
        `);
      }
    }
    
    handleMessageDelete(messageId) {
      const item = this.messageItems.get(messageId);
      if (item) {
        item.destroy();
        this.messageItems.delete(messageId);
        
        const index = this.messages.findIndex(m => m.id === messageId);
        if (index !== -1) {
          this.messages.splice(index, 1);
        }
      }
    }
    
    updateMessageStatus(messageId, status) {
      const item = this.messageItems.get(messageId);
      if (item) {
        item.updateStatus(status);
      }
    }
    
    handleScroll() {
      const $body = this.$container.find('.message-list-body');
      const scrollTop = $body.scrollTop();
      const scrollHeight = $body[0].scrollHeight;
      const clientHeight = $body.height();
      
      // 判断是否在底部
      this.isAtBottom = scrollHeight - scrollTop - clientHeight < 50;
      
      if (this.isAtBottom) {
        this.unreadMessages = 0;
      }
      
      this.updateScrollButton();
      
      // 加载更多历史消息
      if (scrollTop < 100) {
        this.loadMoreMessages();
      }
    }
    
    loadMoreMessages() {
      // TODO: 实现加载更多历史消息
      console.log('加载更多消息...');
    }
    
    updateScrollButton() {
      const $btn = this.$container.find('.btn-scroll-bottom');
      
      if (this.isAtBottom) {
        $btn.hide();
      } else {
        $btn.show();
        if (this.unreadMessages > 0) {
          $btn.find('.unread-count').text(this.unreadMessages).show();
        } else {
          $btn.find('.unread-count').hide();
        }
      }
    }
    
    scrollToBottom(smooth = false) {
      const $body = this.$container.find('.message-list-body');
      const scrollHeight = $body[0].scrollHeight;
      
      if (smooth) {
        $body.animate({ scrollTop: scrollHeight }, 300);
      } else {
        $body.scrollTop(scrollHeight);
      }
      
      this.isAtBottom = true;
      this.unreadMessages = 0;
      this.updateScrollButton();
    }
    
    markAsRead(messageId) {
      // TODO: 实现标记已读逻辑
    }
    
    formatLastSeen(timestamp) {
      if (!timestamp) return '未知';
      
      const diff = Date.now() - timestamp;
      const minute = 60 * 1000;
      const hour = 60 * minute;
      const day = 24 * hour;
      
      if (diff < minute) return '刚刚';
      if (diff < hour) return `${Math.floor(diff / minute)}分钟前`;
      if (diff < day) return `${Math.floor(diff / hour)}小时前`;
      return `${Math.floor(diff / day)}天前`;
    }
    
    destroy() {
      // 清理观察器
      if (this.messageObserver) {
        this.messageObserver.disconnect();
      }
      
      // 销毁所有消息项
      this.messageItems.forEach(item => item.destroy());
      this.messageItems.clear();
      
      // 移除事件监听
      $(document).off('message:reply message:recall message:delete');
      
      this.$container && this.$container.remove();
    }
  }
  
  return MessageList;
})();