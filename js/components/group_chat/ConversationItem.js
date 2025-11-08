
window.App.ConversationItem = (function() {
  const chatStore = window.App.ChatStore;
  const eventBus = window.App.EventBus;
  const MessageList = window.App.MessageList;

  
  class ConversationItem {
    constructor(data) {
      this.data = data;
      this.$el = null;
    }
    
    render() {
      const { id, avatar, name, gid, lastMessage, lastMessageTime, unread, isOnline, isPinned ,defaultColor,show_t,
        gname,create_time,localUserIsGroupOwner
       } = this.data;
                  
      var html =
            "<li id=\'group_li_gid_"+gid+"\' title=\'GID: "+gid+"\' im-date=\'"+gid+"\'>"+
            "    <div>"+
            "	<a class=\'top-tag\' title=\'Current Tag\'></a>"+
            "	<div class=\'avatar-source human\'>"+
            "        <div style='background:"+defaultColor+"'>"+show_t+" </div>"+
            // "	    <img id=\'"+_gg_id+"\' src=\'"+avatarUrl+"\' onerror='javascript:$(this).remove()'>"+
            "	    <img "+(localUserIsGroupOwner?"":"style=\'display:none;\'")+" title=\'我是该群的群主!\' id=\'li-group-ownerflag_"+gid+"\' class=\'group-ownerflag\' src=\'../images/groupchat_grous_list_item_owner2.png\'>"+
            "	</div>"+
            "	<div class=\'info\'>"+
            "	    <h4><span id=\'group_li_gname_"+gid+"\'>"+gname+"</span></h4>"+
            "	    <p>"+
            "		<span>创建于 "+create_time+"</span>"+
            //"		<img id=\'li-group-silentflag\' src=\'../../images/main_alarms_list_item_icon_notify.png\'>"+
            "	    </p>"+
            "	</div>"+
            "    </div>"+
            "</li>";

      return `
        <div class="conversation-item ${unread > 0 ? 'unread' : ''} ${isPinned ? 'pinned' : ''}" data-id="${id}">
          ${html}
        </div>
      `;
    }
// <img src="${avatar}" alt="${name}" class="avatar" onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2248%22 height=%2248%22><rect width=%2248%22 height=%2248%22 fill=%22%23ddd%22/><text x=%2250%25%22 y=%2250%25%22 dominant-baseline=%22middle%22 text-anchor=%22middle%22 font-size=%2220%22 fill=%22%23999%22>${name.charAt(0)}</text></svg>'">
          // ${isOnline ? '<span class="online-indicator"></span>' : ''}

          // <div class="conversation-content" >
    // <div class="conversation-header">
    //           <h4 class="conversation-name">
    //             ${isPinned ? '<span class="pin-icon">📌</span>' : ''}
    //             ${name}
    //           </h4>
    //           <span class="conversation-time">${this.formatTime(lastMessageTime)}</span>
    //         </div>

    //         <div class="conversation-footer">
    //           <p class="last-message">${this.escapeHtml(lastMessage || '暂无消息')}</p>
    //           ${unread > 0 ? `<span class="unread-badge">${unread > 99 ? '99+' : unread}</span>` : ''}
    //         </div>
    //       </div>

    //  <div class="conversation-actions">
    //         <button class="btn-action btn-pin" title="${isPinned ? '取消置顶' : '置顶'}">
    //           ${isPinned ? '📍' : '📌'}
    //         </button>
    //         <button class="btn-action btn-mute" title="消息免打扰">🔕</button>
    //         <button class="btn-action btn-delete" title="删除">🗑️</button>
    //       </div>
    formatTime(timestamp) {
      if (!timestamp) return '';
      
      const now = Date.now();
      const diff = now - timestamp;
      const minute = 60 * 1000;
      const hour = 60 * minute;
      const day = 24 * hour;
      const week = 7 * day;
      
      if (diff < minute) {
        return '刚刚';
      } else if (diff < hour) {
        return `${Math.floor(diff / minute)}分钟前`;
      } else if (diff < day) {
        return `${Math.floor(diff / hour)}小时前`;
      } else if (diff < week) {
        const days = Math.floor(diff / day);
        return days === 1 ? '昨天' : `${days}天前`;
      } else {
        const date = new Date(timestamp);
        const month = date.getMonth() + 1;
        const dayNum = date.getDate();
        return `${month}/${dayNum}`;
      }
    }
    
    escapeHtml(text) {
      const div = document.createElement('div');
      div.textContent = text;
      return div.innerHTML;
    }
    
    mount(container) {
      this.$el = $(this.render());
      $(container).append(this.$el);
      this.bindEvents();
      this.attachContextMenu();
      return this;
    }
    
    bindEvents() {
      // 点击会话 - 选中并加载消息
      this.$el.on('click', (e) => {
        // 如果点击的是操作按钮，不触发选中
        if ($(e.target).closest('.conversation-actions').length) {
          return;
        }
        
        chatStore.setCurrentConversation(this.data.id);
        
        // 添加点击动画
        this.$el.addClass('clicked');
        setTimeout(() => {
          this.$el.removeClass('clicked');
        }, 200);

        // 初始化消息列表
        $('#conversation-container').hide();
        $('#message-container').show();
        
      });
      
      // 置顶按钮
      this.$el.find('.btn-pin').on('click', (e) => {
        e.stopPropagation();
        this.togglePin();
      });
      
      // 免打扰按钮
      // this.$el.find('.btn-mute').on('click', (e) => {
      //   e.stopPropagation();
      //   this.toggleMute();
      // });
      
      // 删除按钮
      this.$el.find('.btn-delete').on('click', (e) => {
        e.stopPropagation();
        this.confirmDelete();
      });
      
      // 长按显示更多操作（移动端）
      let pressTimer;
      this.$el.on('touchstart mousedown', (e) => {
        if ($(e.target).closest('.conversation-actions').length) {
          return;
        }
        pressTimer = setTimeout(() => {
          this.showContextMenu(e);
        }, 500);
      });
      
      this.$el.on('touchend mouseup mouseleave', () => {
        clearTimeout(pressTimer);
      });
    }
    
    togglePin() {
      const isPinned = !this.data.isPinned;
      chatStore.updateConversation(this.data.id, { isPinned });
      
      // 显示提示
      this.showToast(isPinned ? '已置顶' : '已取消置顶');
    }
    
    toggleMute() {
      const isMuted = !this.data.isMuted;
      chatStore.updateConversation(this.data.id, { isMuted });
      
      this.showToast(isMuted ? '已开启免打扰' : '已关闭免打扰');
    }
    
    confirmDelete() {
      // 创建确认对话框
      const $dialog = $(`
        <div class="confirm-dialog-overlay">
          <div class="confirm-dialog">
            <h3>删除会话</h3>
            <p>确定要删除与 <strong>${this.data.name}</strong> 的会话吗？</p>
            <p class="warning">此操作将删除所有聊天记录，且无法恢复。</p>
            <div class="dialog-actions">
              <button class="btn btn-cancel">取消</button>
              <button class="btn btn-danger">删除</button>
            </div>
          </div>
        </div>
      `);
      
      $('body').append($dialog);
      
      // 显示动画
      setTimeout(() => {
        $dialog.addClass('show');
      }, 10);
      
      // 取消按钮
      $dialog.find('.btn-cancel').on('click', () => {
        $dialog.removeClass('show');
        setTimeout(() => {
          $dialog.remove();
        }, 300);
      });
      
      // 删除按钮
      $dialog.find('.btn-danger').on('click', () => {
        chatStore.deleteConversation(this.data.id);
        $dialog.removeClass('show');
        setTimeout(() => {
          $dialog.remove();
        }, 300);
        this.showToast('已删除');
      });
      
      // 点击遮罩关闭
      $dialog.on('click', (e) => {
        if ($(e.target).hasClass('confirm-dialog-overlay')) {
          $dialog.find('.btn-cancel').click();
        }
      });
    }
    
    attachContextMenu() {
      // 右键菜单
      this.$el.on('contextmenu', (e) => {
        e.preventDefault();
        this.showContextMenu(e);
      });
    }
    
    showContextMenu(e) {
      // 移除已存在的菜单
      $('.context-menu').remove();
      
      const $menu = $(`
        <div class="context-menu">
          <div class="context-menu-item" data-action="pin">
            <span class="menu-icon">${this.data.isPinned ? '📍' : '📌'}</span>
            <span>${this.data.isPinned ? '取消置顶' : '置顶会话'}</span>
          </div>
          <div class="context-menu-item" data-action="mute">
            <span class="menu-icon">${this.data.isMuted ? '🔔' : '🔕'}</span>
            <span>${this.data.isMuted ? '关闭免打扰' : '消息免打扰'}</span>
          </div>
          <div class="context-menu-item" data-action="mark">
            <span class="menu-icon">✓</span>
            <span>标记为已读</span>
          </div>
          <div class="context-menu-divider"></div>
          <div class="context-menu-item danger" data-action="delete">
            <span class="menu-icon">🗑️</span>
            <span>删除会话</span>
          </div>
        </div>
      `);
      
      $('body').append($menu);
      
      // 定位菜单
      const x = e.pageX || e.originalEvent.touches[0].pageX;
      const y = e.pageY || e.originalEvent.touches[0].pageY;
      
      $menu.css({
        left: x + 'px',
        top: y + 'px'
      });
      
      // 显示动画
      setTimeout(() => {
        $menu.addClass('show');
      }, 10);
      
      // 菜单项点击
      $menu.find('.context-menu-item').on('click', (e) => {
        const action = $(e.currentTarget).data('action');
        
        switch(action) {
          case 'pin':
            this.togglePin();
            break;
          case 'mute':
            this.toggleMute();
            break;
          case 'mark':
            chatStore.updateConversation(this.data.id, { unread: 0 });
            this.showToast('已标记为已读');
            break;
          case 'delete':
            this.confirmDelete();
            break;
        }
        
        $menu.remove();
      });
      
      // 点击其他地方关闭菜单
      setTimeout(() => {
        $(document).one('click', () => {
          $menu.remove();
        });
      }, 100);
    }
    
    showToast(message) {
      // 创建提示
      const $toast = $(`
        <div class="toast">
          <span>${message}</span>
        </div>
      `);
      
      $('body').append($toast);
      
      setTimeout(() => {
        $toast.addClass('show');
      }, 10);
      
      setTimeout(() => {
        $toast.removeClass('show');
        setTimeout(() => {
          $toast.remove();
        }, 300);
      }, 2000);
    }
    
    update(newData) {
      // 保存旧的滚动位置
      const $container = this.$el.parent();
      const scrollTop = $container.scrollTop();
      
      this.data = { ...this.data, ...newData };
      const $new = $(this.render());
      this.$el.replaceWith($new);
      this.$el = $new;
      this.bindEvents();
      this.attachContextMenu();
      
      // 恢复滚动位置
      $container.scrollTop(scrollTop);
    }
    
    destroy() {
      // 移除所有事件监听
      this.$el && this.$el.off();
      this.$el && this.$el.remove();
    }
  }
  
  return ConversationItem;
})();