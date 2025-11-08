window.App.MessageItem = (function() {
  
  class MessageItem {
    constructor(message, isSelf) {
      this.message = message;
      this.isSelf = isSelf;
      this.$el = null;
    }
    
    render() {
      const { id, content, timestamp, type, status, senderName } = this.message;
      const timeStr = this.formatTime(timestamp);
      
      return `
        <div class="message-item ${this.isSelf ? 'self' : 'other'}" data-message-id="${id}">
          ${!this.isSelf ? this.renderAvatar() : ''}
          <div class="message-wrapper">
            ${!this.isSelf ? `<div class="message-sender-name">${senderName || '未知'}</div>` : ''}
            <div class="message-content">
              ${this.renderMessageContent(type, content)}
            </div>
            <div class="message-meta">
              <span class="message-time">${timeStr}</span>
              ${this.isSelf ? this.renderStatus(status) : ''}
            </div>
          </div>
          ${this.isSelf ? this.renderAvatar() : ''}
        </div>
      `;
    }
    
    renderAvatar() {
      const avatar = this.message.avatar || 'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2236%22 height=%2236%22><rect width=%2236%22 height=%2236%22 fill=%22%23ddd%22/></svg>';
      return `<img src="${avatar}" class="message-avatar" alt="avatar">`;
    }
    
    renderMessageContent(type, content) {
      switch(type) {
        case 'text':
          return `<div class="message-text">${this.parseContent(content)}</div>`;
          
        case 'image':
          return `
            <div class="message-image-wrapper">
              <img src="${content}" class="message-image" alt="图片" loading="lazy">
              <div class="image-loading">加载中...</div>
            </div>
          `;
          
        case 'file':
          return `
            <div class="message-file">
              <div class="file-icon">${this.getFileIcon(content.name)}</div>
              <div class="file-info">
                <div class="file-name">${this.escapeHtml(content.name)}</div>
                <div class="file-size">${this.formatFileSize(content.size)}</div>
              </div>
              <button class="btn-download" data-url="${content.url}">
                <span>下载</span>
              </button>
            </div>
          `;
          
        case 'voice':
          return `
            <div class="message-voice">
              <button class="btn-play-voice" data-url="${content.url}">
                <span class="voice-icon">🎤</span>
              </button>
              <div class="voice-duration">${content.duration || 0}"</div>
              <div class="voice-wave"></div>
            </div>
          `;
          
        case 'video':
          return `
            <div class="message-video">
              <video class="video-player" controls preload="metadata">
                <source src="${content.url}" type="video/mp4">
                您的浏览器不支持视频播放
              </video>
              <div class="video-duration">${this.formatDuration(content.duration)}</div>
            </div>
          `;
          
        case 'location':
          return `
            <div class="message-location">
              <div class="location-icon">📍</div>
              <div class="location-info">
                <div class="location-name">${this.escapeHtml(content.name)}</div>
                <div class="location-address">${this.escapeHtml(content.address)}</div>
              </div>
              <button class="btn-view-map" data-lat="${content.lat}" data-lng="${content.lng}">
                查看地图
              </button>
            </div>
          `;
          
        case 'system':
          return `<div class="message-system">${this.escapeHtml(content)}</div>`;
          
        default:
          return `<div class="message-text">${this.escapeHtml(content)}</div>`;
      }
    }
    
    parseContent(text) {
      // 转义 HTML
      text = this.escapeHtml(text);
      
      // 解析链接
      text = text.replace(
        /(https?:\/\/[^\s]+)/g,
        '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>'
      );
      
      // 解析换行
      text = text.replace(/\n/g, '<br>');
      
      // 解析表情（简单示例）
      const emojiMap = {
        ':)': '😊',
        ':(': '☹️',
        ':D': '😄',
        ':P': '😛',
        '<3': '❤️',
        ':thumbsup:': '👍',
        ':fire:': '🔥'
      };
      
      Object.entries(emojiMap).forEach(([key, emoji]) => {
        text = text.replace(new RegExp(key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), emoji);
      });
      
      return text;
    }
    
    renderStatus(status) {
      const statusMap = {
        sending: { icon: '⏳', text: '发送中', class: 'sending' },
        sent: { icon: '✓', text: '已发送', class: 'sent' },
        delivered: { icon: '✓✓', text: '已送达', class: 'delivered' },
        read: { icon: '✓✓', text: '已读', class: 'read' },
        failed: { icon: '✗', text: '发送失败', class: 'failed' }
      };
      
      const statusInfo = statusMap[status] || statusMap.sent;
      
      return `
        <span class="message-status ${statusInfo.class}" title="${statusInfo.text}">
          ${statusInfo.icon}
        </span>
      `;
    }
    
    formatTime(timestamp) {
      if (!timestamp) return '';
      
      const date = new Date(timestamp);
      const now = new Date();
      const diff = now - date;
      const hour = 60 * 60 * 1000;
      const day = 24 * hour;
      
      const timeStr = date.toLocaleTimeString('zh-CN', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
      
      if (diff < day && date.getDate() === now.getDate()) {
        // 今天
        return timeStr;
      } else if (diff < 2 * day && date.getDate() === now.getDate() - 1) {
        // 昨天
        return `昨天 ${timeStr}`;
      } else if (diff < 7 * day) {
        // 本周
        const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
        return `${weekdays[date.getDay()]} ${timeStr}`;
      } else {
        // 更早
        return `${date.getMonth() + 1}/${date.getDate()} ${timeStr}`;
      }
    }
    
    formatFileSize(bytes) {
      if (!bytes) return '0 B';
      
      const units = ['B', 'KB', 'MB', 'GB'];
      let size = bytes;
      let unitIndex = 0;
      
      while (size >= 1024 && unitIndex < units.length - 1) {
        size /= 1024;
        unitIndex++;
      }
      
      return `${size.toFixed(1)} ${units[unitIndex]}`;
    }
    
    formatDuration(seconds) {
      if (!seconds) return '00:00';
      
      const mins = Math.floor(seconds / 60);
      const secs = Math.floor(seconds % 60);
      return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    
    getFileIcon(filename) {
      const ext = filename.split('.').pop().toLowerCase();
      
      const iconMap = {
        pdf: '📄',
        doc: '📝',
        docx: '📝',
        xls: '📊',
        xlsx: '📊',
        ppt: '📊',
        pptx: '📊',
        zip: '📦',
        rar: '📦',
        txt: '📃',
        jpg: '🖼️',
        jpeg: '🖼️',
        png: '🖼️',
        gif: '🖼️',
        mp3: '🎵',
        mp4: '🎬',
        avi: '🎬'
      };
      
      return iconMap[ext] || '📄';
    }
    
    escapeHtml(text) {
      if (typeof text !== 'string') return '';
      const div = document.createElement('div');
      div.textContent = text;
      return div.innerHTML;
    }
    
    mount(container) {
      this.$el = $(this.render());
      $(container).append(this.$el);
      this.bindEvents();
      this.setupObservers();
      return this;
    }
    
    bindEvents() {
      // 图片点击预览
      this.$el.find('.message-image').on('click', (e) => {
        const src = $(e.target).attr('src');
        this.previewImage(src);
      });
      
      // 图片加载完成
      this.$el.find('.message-image').on('load', function() {
        $(this).siblings('.image-loading').hide();
      });
      
      // 文件下载
      this.$el.find('.btn-download').on('click', (e) => {
        const url = $(e.currentTarget).data('url');
        this.downloadFile(url);
      });
      
      // 语音播放
      this.$el.find('.btn-play-voice').on('click', (e) => {
        const url = $(e.currentTarget).data('url');
        this.playVoice(url, e.currentTarget);
      });
      
      // 地图查看
      this.$el.find('.btn-view-map').on('click', (e) => {
        const lat = $(e.currentTarget).data('lat');
        const lng = $(e.currentTarget).data('lng');
        this.viewMap(lat, lng);
      });
      
      // 长按消息显示操作菜单
      let pressTimer;
      this.$el.on('touchstart mousedown', '.message-content', (e) => {
        pressTimer = setTimeout(() => {
          this.showMessageMenu(e);
        }, 500);
      });
      
      this.$el.on('touchend mouseup mouseleave', '.message-content', () => {
        clearTimeout(pressTimer);
      });
      
      // 右键菜单
      this.$el.on('contextmenu', '.message-content', (e) => {
        e.preventDefault();
        this.showMessageMenu(e);
      });
    }
    
    setupObservers() {
      // 使用 Intersection Observer 实现懒加载
      if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              const $img = $(entry.target);
              const src = $img.data('src');
              if (src) {
                $img.attr('src', src).removeAttr('data-src');
              }
              imageObserver.unobserve(entry.target);
            }
          });
        });
        
        this.$el.find('img[data-src]').each((i, img) => {
          imageObserver.observe(img);
        });
      }
    }
    
    previewImage(src) {
      const $overlay = $(`
        <div class="image-preview-overlay">
          <button class="btn-close">×</button>
          <img src="${src}" alt="预览">
          <div class="preview-loading">加载中...</div>
        </div>
      `);
      
      $('body').append($overlay);
      
      setTimeout(() => {
        $overlay.addClass('show');
      }, 10);
      
      $overlay.find('img').on('load', function() {
        $overlay.find('.preview-loading').hide();
      });
      
      $overlay.on('click', function(e) {
        if (e.target === this || $(e.target).hasClass('btn-close')) {
          $overlay.removeClass('show');
          setTimeout(() => {
            $overlay.remove();
          }, 300);
        }
      });
    }
    
    downloadFile(url) {
      const link = document.createElement('a');
      link.href = url;
      link.download = '';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
    
    playVoice(url, button) {
      const $btn = $(button);
      
      // 如果正在播放，停止
      if ($btn.hasClass('playing')) {
        if (this.audioPlayer) {
          this.audioPlayer.pause();
          this.audioPlayer = null;
        }
        $btn.removeClass('playing');
        return;
      }
      
      // 停止其他正在播放的音频
      $('.btn-play-voice.playing').removeClass('playing');
      
      this.audioPlayer = new Audio(url);
      $btn.addClass('playing');
      
      this.audioPlayer.play();
      
      this.audioPlayer.onended = () => {
        $btn.removeClass('playing');
      };
      
      this.audioPlayer.onerror = () => {
        $btn.removeClass('playing');
        alert('语音播放失败');
      };
    }
    
    viewMap(lat, lng) {
      // 打开地图（可以集成高德、百度等地图）
      const url = `https://maps.google.com/?q=${lat},${lng}`;
      window.open(url, '_blank');
    }
    
    showMessageMenu(e) {
      $('.message-context-menu').remove();
      
      const $menu = $(`
        <div class="message-context-menu">
          ${!this.isSelf ? '<div class="menu-item" data-action="reply"><span>回复</span></div>' : ''}
          <div class="menu-item" data-action="copy"><span>复制</span></div>
          <div class="menu-item" data-action="forward"><span>转发</span></div>
          ${this.isSelf ? '<div class="menu-item danger" data-action="recall"><span>撤回</span></div>' : ''}
          ${this.isSelf ? '<div class="menu-item danger" data-action="delete"><span>删除</span></div>' : ''}
        </div>
      `);
      
      $('body').append($menu);
      
      const x = e.pageX || e.originalEvent.touches[0].pageX;
      const y = e.pageY || e.originalEvent.touches[0].pageY;
      
      $menu.css({ left: x + 'px', top: y + 'px' });
      
      setTimeout(() => {
        $menu.addClass('show');
      }, 10);
      
      $menu.find('.menu-item').on('click', (e) => {
        const action = $(e.currentTarget).data('action');
        this.handleMenuAction(action);
        $menu.remove();
      });
      
      setTimeout(() => {
        $(document).one('click', () => {
          $menu.remove();
        });
      }, 100);
    }
    
    handleMenuAction(action) {
      switch(action) {
        case 'reply':
          console.log('回复消息', this.message);
          // 触发回复事件
          $(document).trigger('message:reply', [this.message]);
          break;
        case 'copy':
          this.copyToClipboard(this.message.content);
          break;
        case 'forward':
          console.log('转发消息', this.message);
          $(document).trigger('message:forward', [this.message]);
          break;
        case 'recall':
          this.recallMessage();
          break;
        case 'delete':
          this.deleteMessage();
          break;
      }
    }
    
    copyToClipboard(text) {
      if (navigator.clipboard) {
        navigator.clipboard.writeText(text).then(() => {
          this.showToast('已复制');
        });
      } else {
        // 兼容旧浏览器
        const textarea = document.createElement('textarea');
        textarea.value = text;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        this.showToast('已复制');
      }
    }
    
    recallMessage() {
      // 检查是否可以撤回（例如2分钟内）
      const timeDiff = Date.now() - this.message.timestamp;
      if (timeDiff > 2 * 60 * 1000) {
        this.showToast('超过2分钟无法撤回');
        return;
      }
      
      console.log('撤回消息', this.message.id);
      $(document).trigger('message:recall', [this.message.id]);
      this.showToast('已撤回');
    }
    
    deleteMessage() {
      console.log('删除消息', this.message.id);
      $(document).trigger('message:delete', [this.message.id]);
    }
    
    showToast(message) {
      const $toast = $(`<div class="toast"><span>${message}</span></div>`);
      $('body').append($toast);
      setTimeout(() => $toast.addClass('show'), 10);
      setTimeout(() => {
        $toast.removeClass('show');
        setTimeout(() => $toast.remove(), 300);
      }, 2000);
    }
    
    updateStatus(newStatus) {
      this.message.status = newStatus;
      this.$el.find('.message-status').replaceWith(this.renderStatus(newStatus));
    }
    
    destroy() {
      if (this.audioPlayer) {
        this.audioPlayer.pause();
        this.audioPlayer = null;
      }
      this.$el && this.$el.off();
      this.$el && this.$el.remove();
    }
  }
  
  return MessageItem;
})();