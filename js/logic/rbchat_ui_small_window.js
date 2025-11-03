
var RBChatSmallWindowUI = (function () {

    // 构造器（相当于java里的构造方法）
    var UIModule2 = function (argument){
        // 当前所有打开的小窗
        this.windowList = []
        // 小窗的好友/群聊信息
        this.windowInfo = {}
    };

    /**
     * 本封装对象的所有初始化动作，放在本函数中执行。
     */
    UIModule2.prototype.init = function () {
            $('.smallWindow-swtich').each((e) => {
                e.stopPropagation()
            })
    };

    /**
     * 更新窗口到缓存
     */
    UIModule2.prototype.updateCache = function () {
        localStorage.setItem('windowList', JSON.stringify(this.windowList))
    };

    /**
     * 更新窗口好友/群聊信息到缓存
     */
    UIModule2.prototype.updateUserGroupInfoCache = function (dataId, data) {
        this.windowInfo[dataId] = data
    };

    /**
     * 获取窗口好友/群聊信息到缓存
     */
    UIModule2.prototype.getUserGroupInfo = function (dataId) {
        return this.windowInfo[dataId]
    };

    /**
     * 获取窗口好友/群聊信息到缓存
     */
    UIModule2.prototype.getWindowAttr = function (e, type = 'chat') {
        const _windowEl = $(e).closest('.small-window-box')
        if (_windowEl.length) {
            const _id = _windowEl.attr('id')?.split('_')[1]
            if (type == 'chat') {
                return {
                    currentSelectedAlarmType: _windowEl.attr('msgType'),
                    currentSelectedAlarmDataId: _id
                }
            } else if (type == 'info') {
                return this.getUserGroupInfo(_id) || null
            }
        }

        return null
    };

    /**
     * 更新窗口属性
     */
    UIModule2.prototype.updateWindowAttr = function (id, params) {
        const obj = this.windowList.find(item => item._windowId == id)
        if (!obj) return
        Object.assign(obj, { ...params })
        localStorage.setItem('windowList', JSON.stringify(this.windowList))
    };

    /**
     * 关闭指定窗口
     */
    UIModule2.prototype.handleCloseWindow = function (dataId) {
        if (!this.checkIsWindow(dataId)) return
        const _index = this.windowList.findIndex(item => item._windowId == dataId)
        if (_index == -1) return
        this.windowList.splice(_index, 1)
        this.updateCache()
        const _windowId = this.getWindowId(dataId)
        $(`#${_windowId}`).remove()
    }

    /**
     * 关闭窗口
     */
    UIModule2.prototype.handleClose = function (e) {
        const _windowEl =  $(e).closest('.small-window-box');
        const _id = $(_windowEl).attr('id')
        const _msgType = $(_windowEl).attr('msgtype')
        const _realId = _id.split('_')[1]
        const _index = this.windowList.findIndex(item => item._windowId == _realId)
        if (_index == -1) return
        this.windowList.splice(_index, 1)
        this.updateCache()
        $(`#alarms_li_${_msgType}_${_realId} .smallWindow-swtich`).removeClass('active')
        _windowEl.remove()
        window._chatType = 'chat'
        SingleChattingCache.removeChatCache(_realId);
        GroupChattingCache.removeChatCache(_realId);
        if (_realId == window.scrollInfo?.beyongDataId) {
            RBChatAlarmsUI.clickChatItem(_msgType, _realId)
        }
    }

    /**
     * 获取窗口id
     */
    UIModule2.prototype.getWindowId = function (dataId) {
        return `small-window_${dataId}`
    }

    /**
     * 获取窗口下某个元素，或者返回主窗口的某个元素
     */ 
    UIModule2.prototype.getWindowDom = function (domClass, type, chatId) {
        // RBChatSmallWindowUI.getWindowDom('.
        let _id = chatId && this.checkIsWindow(chatId) ? `#${this.getWindowId(chatId)}` : '#kchat-im-panel'
        if (!chatId && type != 'parent' && 
            window._chatId &&
            (window._chatType == 'window' || this.checkIsWindow(window._chatId))
        ) {
            _id = `#${this.getWindowId(window._chatId)}`
        }
        return $(`${_id} ${domClass}`)
    }

    /**
     * 检测某一个会话是否已经窗口化
     */
    UIModule2.prototype.checkIsWindow = function (dataId) {
        return this.windowList.find(item => item._windowId == dataId)
    }

    /**
     * 检测当前点击dom是否在小窗下。
     * 解决全局_chatType切换不及时问题
     */
    UIModule2.prototype.updateWindowChatType = function (e) {
        if (!$(this).closest('.small-window-box').length) {
            console.log('ttt _chatType 更新 chat', 3)
            window._chatType = 'chat'
        }
    }

    /**
     * 点击窗口，隐藏主窗口其他元素
     */
    UIModule2.prototype.hideOtherDom = function (e) {
        // 隐藏主窗口 表情弹窗
        $('#kchat-im-panel .im-panel-main-chat-textarea_love_emojipopup').hide()
    }

    UIModule2.prototype.showWindow = function (dataId, alarmMessageType, windowInfo) {
        console.log('ttt 小窗 渲染小窗')
        // 已存在该小窗
        if (this.checkIsWindow(dataId)) return
        if (!windowInfo && document.querySelectorAll('#kchat-im-panel-userlist-alarms li').length == 1) {
            RBChatDialogHelper.showAlertDialog_INFO('提示', '当前只有一个会话，无法打开小窗');
            return
        }
        if (!windowInfo && this.windowList.length >= 10) {
            RBChatDialogHelper.showAlertDialog_INFO('提示', '最多同时打开10个小窗，无法打开更多小窗');
            return
        }

        // 复制原始元素
        const _windowId = dataId
        const _windowEl = $('#small-window-0').clone();
        _windowEl.attr('id', this.getWindowId(dataId))
        _windowEl.attr('msgType', alarmMessageType)
        $(`#alarms_li_${alarmMessageType}_${dataId} .smallWindow-swtich`).addClass('active')
        let hasInitWindowNums = 0
         this.windowList.forEach(item => {
            const { top, left } = item
            if (
                (top == '50%' && left == '50%') ||
                (!top && !left)
            ) {
                hasInitWindowNums++
            }
         })
        if (windowInfo) {
            let top = windowInfo?.top || '50%'
            if (top == '50%' && hasInitWindowNums) {
                top = `calc(50% + ${30 * hasInitWindowNums}px)`
            }
            _windowEl.css('top', top)
            _windowEl.css('left', windowInfo?.left || '50%')
            _windowEl.css('width', windowInfo?.width || '800px')
            _windowEl.css('height', windowInfo?.height || '80%')
            if (windowInfo?.width < '630') {
                _windowEl.addClass('small-window-400')
                _windowEl.find('.small-window-box-header-title').css('display', 'block')
            }
        } else if (hasInitWindowNums) {
            _windowEl.css('top', `calc(50% + ${30 * hasInitWindowNums}px)`)
            _windowEl.css('left', '50%')
        }
        this.windowList.push({
            _windowId: _windowId,
            _type: alarmMessageType,
            ...windowInfo
        })
        this.updateCache()
        _windowEl.css('display', 'block')
        $('body').append(_windowEl);
        if (windowInfo?.draft) {
            _windowEl.find('.im-panel-inputcontent').val(windowInfo.draft)
        }
        this.focusWindow(dataId)
        RBChatAlarmsUI.clickChatItem(alarmMessageType, dataId)

        this.initMoveIMWindow(dataId)
        this.initChatBtns(dataId, alarmMessageType)
        this.initWindowEvents(dataId)
    }


    /**
     * 初始化IM窗口监听事件
     */
    UIModule2.prototype.initWindowEvents = function (dataId) {
        document.body.addEventListener('click', () => {
            console.log('ttt _chatType 更新 chat', 1)
            window._chatType = 'chat'
        })
        const _windowId = this.getWindowId(dataId)
        const _el = $(`#${_windowId}`)
        _el.click((e) => {
            this.hideOtherDom()
            this.focusWindow(dataId)
            e.stopPropagation()
        })

        RBChatChattingContentPaneUI.refreshFaceBoard(dataId)
        RBChatChattingContentPaneUI.show_face_love_ui()

        RBChatChattingContentPaneUI.initFileUplodifive5('image_msg');  // 图片消息的图片文件上传按钮及功能初始化
        RBChatChattingContentPaneUI.initFileUplodifive5('file_msg');   // 大文件消息的文件上传按钮及功能初始化

        RBChatChattingContentPaneUI.initEventProcess();     // 进行键盘事件等处理初始化！
        RBChatChattingContentPaneUI.initShotcutWords();     // 进行快键回复功能的初始化！
        RBChatChattingContentPaneUI.initEmoji(dataId);            // 进行表情功能的初始化！
        RBChatChattingContentPaneUI.initClearChatContents();// 进行清空聊天界面功能的初始化！
        RBChatChattingContentPaneUI.initLocationMsgSend();  // “位置”消息功能的初始化！
        RBChatChattingContentPaneUI.initContactMsgSend();   // “名片”消息功能的初始化！
        RBChatChattingContentPaneUI.initFastSend();   // “发送合集”消息功能的初始化！
        RBChatChattingContentPaneUI.initBackBottom();   // 回到底部功能的初始化！
        RBChatChattingContentPaneUI.initReCallEvent();   // 回到底部功能的初始化！
        RBChatChattingContentPaneUI.initFeedbackLinkMsgSend()
    };

    UIModule2.prototype.handleMini = function (e) {
        const _windowEl =  $(e).closest('.small-window-box');
        $(e).css('display', 'none')
        const _id = $(_windowEl).attr('id')
        _windowEl.find('.expand-open').css('display', 'block')
        _windowEl.css('top', '50%')
        _windowEl.css('left', '50%')
        const _lastWidh = _windowEl.attr('last-width')
        const _lastHeight = _windowEl.attr('last-height')

        _windowEl.css('width', _lastWidh || '800px')
        _windowEl.css('height', _lastHeight || '80')
        if (_lastWidh < '630') {
            _windowEl.addClass('small-window-400')
            _windowEl.find('.small-window-box-header-title').css('display', 'block')
        }
        this.updateWindowAttr(_id, { 
            top: '50%',
            left: '50%',
            width: '800px',
            height: '80%'
        })
        _windowEl.removeClass('expand');
    }

    UIModule2.prototype.handleExpand = function (e) {
        const _windowEl =  $(e).closest('.small-window-box');
        $(e).css('display', 'none');
        const _id = $(_windowEl).attr('id')
        _windowEl.find('.expand-mini').css('display', 'block')
        _windowEl.css('top', '0')
        _windowEl.css('left', '0')
        _windowEl.attr('last-width', _windowEl.width())
        _windowEl.attr('last-height', _windowEl.height())
        _windowEl.css('width', '100%')
        _windowEl.css('height', '100%')
        this.updateWindowAttr(_id, { 
            top: '0',
            left: '0',
            width: '100%',
            height: '100%'
        })
        _windowEl.addClass('expand');
    }

    /**
     * 重置窗口定位
     */
    UIModule2.prototype.resetWindow = function (dataId) {
        const _windowId = this.getWindowId(dataId)
        const _el = $(`#${_windowId}`)
        _el.css('top', '50%')
        _el.css('left', '50%')
        this.updateWindowAttr(dataId, { 
            top: '50%',
            left: '50%'
        })
        this.focusWindow(dataId)
    }

    /**
     * 聚焦窗口
     */
    UIModule2.prototype.focusWindow = function (dataId) {
        const _windowId = this.getWindowId(dataId)
        const _el = $(`#${_windowId}`)
        console.log('ttt _chatType 更新 window', 1)
        window._chatType = 'window'
        window._chatId = dataId
        $('.small-window-box').css('z-index', '1000');
        _el.css('z-index', '1001');
    }

    /**
     * 初始化IM窗口的拖动事件处理。
     */
    UIModule2.prototype.initMoveIMWindow = function (dataId, alarmMessageType) {
        const windowId = this.getWindowId(dataId, alarmMessageType)
        const draggable = document.getElementById(windowId);
        let isDragging = false;
        let offsetX, offsetY;
        let that = this

        // 处理拉伸功能
        let isResizing = false;
        let currentResizer = null;

        const resizers = {
            topLeft: `#${windowId} #top-left`,
            topRight: `#${windowId} #top-right`,
            bottomLeft: `#${windowId} #bottom-left`,
            bottomRight: `#${windowId} #bottom-right`,
        };
        const popup = draggable;

        function resizeDom(type, size) {
            if (type == 'width' && popup.style.width && popup.style.width <= '630') {
                $(popup).find('.small-window-box-header-title').css('display', 'block')
                $(popup).addClass('small-window-400')
            } else if (type == 'width' && popup.style.width && popup.style.width > '650') {
                $(popup).removeClass('small-window-400')
                $(popup).find('.small-window-box-header-title').css('display', 'none')
            }
            if (type == 'width' && popup.style.width && popup.style.width > size && popup.style.width <= '400') return
            if (type == 'height' && popup.style.height && popup.style.height > size && popup.style.height <= '500') return
            let _size = size
            if (type == 'width' && size < '400') {
                _size = '400px'
            } else if (type == 'height' && size < '500') {
                _size = '500px'
            }
            popup.style[type] = _size
            that.updateWindowAttr(dataId, { 
                [type]: _size
            })
        }

        function resizePopup(e) {
            isDragging = false
            const rect = popup.getBoundingClientRect();
            
            if (currentResizer === resizers.topLeft) {
                // 拉伸左上角：同时改变宽度和高度，并移动左上角
                resizeDom('width', `${rect.right - e.clientX}px`)
                resizeDom('height', `${rect.bottom - e.clientY}px`);
                // popup.style.left = `${e.clientX}px`;
                // popup.style.top = `${e.clientY}px`;
            } else if (currentResizer === resizers.topRight) {
                // 拉伸右上角：改变宽度和高度，调整上边界
                resizeDom('width', `${e.clientX - rect.left}px`);
                resizeDom('height', `${rect.bottom - e.clientY}px`);
                // popup.style.top = `${e.clientY}px`;
            } else if (currentResizer === resizers.bottomLeft) {
                // 拉伸左下角：改变宽度和高度，调整左边界
                resizeDom('width', `${rect.right - e.clientX}px`);
                resizeDom('height', `${e.clientY - rect.top}px`);
                // popup.style.left = `${e.clientX}px`;
            } else if (currentResizer === resizers.bottomRight) {
                // 拉伸右下角：改变宽度和高度
                resizeDom('width', `${e.clientX - rect.left}px`);
                resizeDom('height', `${e.clientY - rect.top}px`);
            }
        }


        function stopResizing() {
            isResizing = false;
            $(popup).removeClass('small-window-resizing')
            document.removeEventListener('mousemove', resizePopup);
            document.removeEventListener('mouseup', stopResizing);
        }
        
        function startResizing(resizer) {
            isResizing = true;
            $(popup).addClass('small-window-resizing')
            currentResizer = resizer;
            document.addEventListener('mousemove', resizePopup);
            document.addEventListener('mouseup', stopResizing);
        }
        
        // 为每个拉伸边框添加事件监听器
        Object.values(resizers).forEach(resizer => {
            console.log(Object.values(resizers), resizer, 124125125)
            document.querySelector(resizer).addEventListener('mousedown', () => startResizing(resizer));
        });
      
        draggable.addEventListener('mousedown', function(e) {
          that.focusWindow(dataId)
          // 鼠标按下时，记录鼠标的偏移位置
          isDragging = true;
          offsetX = e.clientX - draggable.offsetLeft;
          offsetY = e.clientY - draggable.offsetTop;
      
          // 阻止默认行为，避免选择文本
        //   e.preventDefault();
        });
      
        document.addEventListener('mousemove', function(e) {
          if (isDragging) {
            // 计算新的位置，并更新元素的位置
            const x = e.clientX - offsetX;
            const y = e.clientY - offsetY;
            
            draggable.style.left = x + 'px';
            draggable.style.top = y + 'px';
            that.updateWindowAttr(dataId, { 
                top: y + 'px',
                left: x + 'px'
            })
          }
        });
      
        document.addEventListener('mouseup', function() {
          // 鼠标释放时，停止拖拽
          isDragging = false;
        });
    };

    /**
     * 初始化IM窗口的拖动事件处理。
     */
    UIModule2.prototype.initChatBtns = function (dataId, alarmMessageType) {
        const isGroupChatting = (AlarmMessageType.groupChatMessage === alarmMessageType);
        const windowId = this.getWindowId(dataId, alarmMessageType)
        // // 红包目前只支持群聊
        isGroupChatting ? $(`#${windowId} .window-send-redpag`).show() : $(`#${windowId} .window-send-redpag`).hide();

        !isGroupChatting ? $(`#${windowId} .window-send-feedbackLink`).show() : $(`#${windowId} .window-send-feedbackLink`).hide();
        !isGroupChatting ? $(`#${windowId} .window-send-redpag-friend`).show() : $(`#${windowId} .window-send-redpag-friend`).hide();
    };

    /**
     * 选择图片
     */
    UIModule2.prototype.handleUploadImg = function (e) {
        window.userList=null;
        $(e).parent().find('#upload-image-mul-input').click();
    };

    /**
     * 选择文件
     */
    UIModule2.prototype.handleUploadFile = function (e) {
        $(e).parent().find('#upload-file-input').click();
    };

    /**
     * 选择视频
     */
    UIModule2.prototype.handleUploadVideo = function (e) {
        window.userList=null;
        $(e).parent().find('#upload-mul-video-input').click();
    };



    // 新建本模块对象
    var thisModule = new UIModule2();
    // 调用初始化方法
    thisModule.init();

    return thisModule;// 此种方式用于构造器的方式
})();
