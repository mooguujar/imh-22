// Copyright (C) 2022 即时通讯网(52im.net) & Jack Jiang.
// The RainbowChat-Web Project. All rights reserved.
// 
// 【本产品为著作权产品，合法授权后请放心使用，禁止外传！】
// 【本次授权给：<广州凡岛网络科技有限公司>，授权编号：<NT221206132410>，代码指纹：<A.670304250.076>，技术对接人微信：<ID: madamada888>】
// 【授权寄送：<收件：高先生、地址：甘肃省兰州市中川镇永登县巴黎阳光、电话：13663632363、邮箱：phdylan666@gmail.com>】
// 
// 【本系列产品在国家版权局的著作权登记信息如下】：
// 1）国家版权局登记名(简称)和权证号：RainbowChat    （证书号：软著登字第1220494号、登记号：2016SR041877）
// 2）国家版权局登记名(简称)和权证号：RainbowChat-Web（证书号：软著登字第3743440号、登记号：2019SR0322683）
// 3）国家版权局登记名(简称)和权证号：RainbowAV      （证书号：软著登字第2262004号、登记号：2017SR676720）
// 4）国家版权局登记名(简称)和权证号：MobileIMSDK-Web（证书号：软著登字第2262073号、登记号：2017SR676789）
// 5）国家版权局登记名(简称)和权证号：MobileIMSDK    （证书号：软著登字第1220581号、登记号：2016SR041964）
// * 著作权所有人：江顺/苏州网际时代信息科技有限公司
// 
// 【违法或违规使用投诉和举报方式】：
// 联系邮件：jack.jiang@52im.net
// 联系微信：hellojackjiang
// 联系QQ号：413980957
// 授权说明：http://www.52im.net/thread-1115-1-1.html
// 官方社区：http://www.52im.net
/**
 * 聊天内容面板UI封装（是一个windows范围内的全局对象）。
 */
var RBChatChattingContentPaneUI = (function () {

    // 常量定义：大文件图标所在的http相对目录
    var FILE_ICON_DIR =location.protocol + '//'+location.host + '/images/im_fileicons/';

    // 常量定义：表情图标所在的http相对目录
    var EMOJI_DIR = location.protocol + '//'+location.host + '/images/face/emoji/';
    // 常量定义：表情占位符和表示图片的映射表
    var EMOJI_MAP = {};

    // 构造器（相当于java里的构造方法）
    var UIModule5 = function (argument) {

        //// 没有数据时显示的空数据提示ui根对象
        //this.$emptyUIRoot = $('#kchat-im-panel-userlist-empty-alarms');
        //// 有数据时正常显示数据的ui根对象
        //this.$notEmptyUIRoot = $('#kchat-im-panel-userlist-alarms');

        // 聊天内容显示区外层父div
        this.$chatBox = $('#im-panel-main-chatcontentpane-wrap');
        // 聊天内容显示区
        this.$chatBoxContent = $('#im-panel-main-chatcontentpane');
        // 聊天内容输入框
        this.$inputMessage = $('#im-panel-inputcontent');
        // 文本消息的发送按钮
        this.$sendMessageButton = $('#im-panel-sendbutton');
        // 聊天框-滚动监听
        $('#im-panel-main-chatcontentpane-wrap').scroll(function () {
            const s = window.scrollInfo;
            if (s) {
                var list = (s.isGroupChatting ? GroupChattingCache.getChatCache(s.beyongDataId) : SingleChattingCache.getChatCache(s.beyongDataId));
                if ($(this).scrollTop() <= 2) {
                    const top = s.top;
                    if (top - RBChatConfig.LOAD_CHAT_RECORDER_COUNTS >= 0) {
                        //往上拉，代表有数据
                        var temp_list = list.slice(top - RBChatConfig.LOAD_CHAT_RECORDER_COUNTS, top)
                        window.scrollInfo.top = top - RBChatConfig.LOAD_CHAT_RECORDER_COUNTS
                        // 获取到 
                        const t = $('#im-panel-main-chatcontentpane').children().eq(0);
                        RBChatChattingContentPaneUI.insertChatItems(temp_list.reverse(), true, false);
                        $('#im-panel-main-chatcontentpane-wrap').animate({ scrollTop: t.offset().top }, 100);

                    } else if (top > 0) {
                        var temp_list = list.slice(0, top)
                        window.scrollInfo.top = 0;
                        // 获取到 
                        const t = $('#im-panel-main-chatcontentpane').children().eq(0);
                        RBChatChattingContentPaneUI.insertChatItems(temp_list.reverse(), true, false);
                        $('#im-panel-main-chatcontentpane-wrap').animate({ scrollTop: t.offset().top }, 100);
                    }
                }
            }
        })

        var that = this;
        $('#im-panel-inputcontent').on('input propertychange', function (e) {
            const temp = $(this).val();
            // 群组增加@引用功能
            if (window.openGroupChattingType && window.groupInfo && temp && temp.length > 0) {
                if (temp.substr(temp.length - 1) == '@') {
                    var dialog = RBChatGroupMemberDialogFactory(
                        11, window.groupInfo.g_id, true, true);
                    dialog.loadAndShow();
                }
            }
        });
        $('#im-panel-inputcontent').on('paste', function (e) {
            const clipdata = e.originalEvent.clipboardData;
            //是文本，判断是否是消息内图片复制
            if (clipdata.types && clipdata.types.length > 0 && clipdata.types[0].indexOf('text') >= 0) {
                const text = clipdata.getData("text/plain");
                if (text.indexOf('fingerPrintOfProtocal') >= 0 && text.indexOf('fingerPrintOfParent') >= 0) {
                    var dialogId = RBChatDialogHelper.nextDialogId();
                    const img_obj = JSON.parse(text);
                    RBChatDialogHelper.showImageSendDialog(dialogId, 0, img_obj, function () {
                        that.doSendImageMessage4IM(img_obj.text);
                    })
                    return false;
                }
            }
            if (clipdata.items && clipdata.items.length > 0) {
                const item = clipdata.items[0]
                if (item.kind == 'file' && item.type.match(/^image\//i)) {
                    var dialogId = RBChatDialogHelper.nextDialogId();
                    RBChatDialogHelper.showImageSendDialog(dialogId, 1, item, function (base64Str) {
                        that.uploadBase64Str(base64Str, true)
                    })
                    return true;
                }
            }
        })


        // 消息输入框绑定右键功能


        // 用途：聊天记录目前加载到的页数（注：目前只是默认加载一定天数的记录暂未做分页，此map
        //      目前仅用于记录指定访客是否已从服务端加载聊天记录（从而防止重复加载））；
        // 结构：key=对应uid, value=任意值，即目前是只要判定在此map中存在记录就表示已从服务端加载聊天记录
        // 范围：当前主要用于一对一聊天的历史聊天记录截入防重复加载的逻辑里。
        this.chatHistoryCurrentPagesMap = {
            set: function (key, value) {
                this[key] = value;
                RBChatUtils.logToConsole('[[chatHistoryCurrentPagesMap-debug]] set后：' + JSON.stringify(this), true);
            },
            get: function (key) {
                RBChatUtils.logToConsole('[[chatHistoryCurrentPagesMap-debug]] get时：' + JSON.stringify(this), true);
                return this[key];
            },
            contains: function (key) {
                RBChatUtils.logToConsole('[[chatHistoryCurrentPagesMap-debug]] contains时：' + JSON.stringify(this), true);
                return this.get(key) == null ? false : true;
            },
            remove: function (key) {
                delete this[key];
                RBChatUtils.logToConsole('[[chatHistoryCurrentPagesMap-debug]] remove后：' + JSON.stringify(this), true);
            }
        };
    };

    /**
     * 主要的事件处理初始化方法。
     */
    UIModule5.prototype.initEventProcess = function () {

        var that = this;

        // 为了防止全局冲突，只将事件加到此div上
        this.$inputMessage.keydown(function (event) {
            // Auto-focus the current input when a key is typed
            if (!(event.ctrlKey || event.metaKey || event.altKey)) {
                if (!IMSDK.isLogined()) {
                    //that.$inputMessage.focus();
                    RBChatUtils.setTextFocus(that.$inputMessage);
                }
            }
            // When the client hits ENTER on their keyboard
            if (event.which === 13) {
                // 预览发送图片
                if (window.showCopyPic && $('.d-s-copy-pic')) {
                    $('.d-s-copy-pic').click();
                    event.preventDefault();
                    return;
                }
                // 按Crtl+Enter时换行
                if (event.ctrlKey) {
                    that.$inputMessage.val(that.$inputMessage.val() + '\n');
                }
                // 仅按Enter时发送
                else {
                    event.preventDefault();
                    that.doSendTextMessage4IM();
                }
            }
        });

        // 鼠标点击事件
        this.$sendMessageButton.click(function () {
            that.doSendTextMessage4IM();
        });
    };

    /**
     * 初始化快捷回复的事件处理。
     */
    UIModule5.prototype.initShotcutWords = function () {

        var that = this;

        var btnObj = $('#im-panel-main-chatcontentpane-shortwordsbtn');
        var menuObj = $('#im-panel-main-chatcontentpane-shortwords');
        var menuItem1Obj = $('#im-panel-main-chatcontentpane-shortwords-1');
        var menuItem2Obj = $('#im-panel-main-chatcontentpane-shortwords-2');
        var onlineMessageInputObj = this.$inputMessage;//$('#im-panel-inputcontent');

        btnObj.click(function (event) {
            menuObj.toggle();
            event.stopPropagation();  //阻止冒泡（否则事件传递到body后，立即又被hide了）
        });
        menuItem1Obj.click(function () {
            // 注意：text()相当于设置innerHTML，只能用于非表单元素，而val()只能用于表单元素，别搞混了
            //      如果以下onlineMessageInputObj使用text()来设置值，则只会生效一次，后面的调用就没反应，所以要注意！
            onlineMessageInputObj.val('我正在处理紧急的事情，稍后再和您联系！');
            // 获得焦点，方便接着输入其它内容
            //RBChatUtils.setTextFocus(onlineMessageInputObj);
            that.foucusToInputContent();
            menuObj.hide();
        });
        menuItem2Obj.click(function () {
            onlineMessageInputObj.val('我有事先离开一会儿，回头再聊。');
            // 获得焦点，方便接着输入其它内容
            //RBChatUtils.setTextFocus(onlineMessageInputObj);
            that.foucusToInputContent();
            menuObj.hide();
        });

        // 点击空白处的事件处理（希望点空白，能自动隐藏菜单层的显示）
        $("body").click(function (event) {
            menuObj.hide();
        });
    };

    // 上传文件
    UIModule5.prototype.uploadBase64Str = function (base64Str, isUsedForImageMsg) {

        var dataURLtoBlob = function (dataurl) {
            var arr = dataurl.split(','),
                mime = arr[0].match(/:(.*?);/)[1],
                bstr = atob(arr[1]),
                n = bstr.length,
                u8arr = new Uint8Array(n);
            while (n--) {
                u8arr[n] = bstr.charCodeAt(n);
            }
            return new Blob([u8arr], { type: mime });
        }

        var blobToFile = function (theBlob, fileName) {
            theBlob.lastModifiedDate = new Date();  // 文件最后的修改日期
            theBlob.name = fileName;                // 文件名
            return new File([theBlob], fileName, { type: theBlob.type, lastModified: Date.now() });
        }

        var file = blobToFile(dataURLtoBlob(base64Str), 'temp.jpg')

        var that = this;
        var logTag = (isUsedForImageMsg ? '图片' : '文件');
        //后缀名判断
        let fileExt = file.name.substr(file.name.lastIndexOf(".") + 1);
        fileExt = fileExt.toLowerCase()
        if (isUsedForImageMsg) {
            if (!(fileExt == 'jpg' || fileExt == 'png' || fileExt == 'jpeg')) {
                return alert(logTag + '仅支持jpg、png、jpeg格式')
            }

            //大小限制判断
            if (file.size > 10 * 1024 * 1024) {
                return alert(logTag + '大小限制为' + RBChatConfig.UPLOAD_AVATAR_IMAGE_DATA_MAX_LENGTH)
            }
        } else {
            //大小限制判断
            if (file.size > 300 * 1024 * 1024) {
                return alert(logTag + '大小限制为' + RBChatConfig.SEND_FILE_DATA_MAX_LENGTH)
            }
        }
        $('#im-panel-main-chat-textarea_fileuphint').css('display', 'block');
        $('#im-panel-main-chat-textarea_fileuphint').text(logTag + '上传中 0%');

        $("input[type='file'").val(null)

        // 当前选择得用户
        var sendUser = { currentSelectedAlarmType: RBChatMainUI.getCurrentSelectedAlarmType(), currentSelectedAlarmDataId: RBChatMainUI.getCurrentSelectedAlarmDataId() };
        /**
         * 文件上传
         * @param file 
         */
        RBChatUtils.uploadFile(file, function (data) {
            $('#im-panel-main-chat-textarea_fileuphint').text(logTag + "上传中 " + (data.percent * 100).toFixed(0) + "%");
        }, function (errorMsg) {
            $('#im-panel-main-chat-textarea_fileuphint').css('display', 'none');
            //alert(logTag+'上传出错，'+errorMsg);
            RBChatDialogHelper.showAlertDialog_WARN('上传出错', logTag + '上传出错，' + errorMsg);
            // 关闭文件上传提示UI的显示（之所有用延迟关闭，是因为uploadifive控件的设计时，onError调用后，会接着调用onUpload函数，
            // 这样的话，就会导致错误提示显示完成后，UI上确还显示着文件正在上传的信息，这就不合适了！）
            that.refreshForFileUploadCompleteLazy(30);
        }, function (data) {
            $('#im-panel-main-chat-textarea_fileuphint').css('display', 'none');
            // 服务端在文件上传完成后返回的JSON对象，请务必与服务端的文件上传接口中返回的参数保持一致（详见服务端：FileUploader4Web.java）！
            var objFromServer = data;
            that.refreshForFileUploadHint(logTag + '上传成功！');
            // 文件已上传到http成功，可以发送消息给对方了
            if (isUsedForImageMsg) { // 图片消息的发送
                that.doSendImageMessage4IM(objFromServer.fileMd5, sendUser);
            }
            else { // 普通大文件消息的发送
                that.doSendFileMessage4IM(objFromServer.fileName, objFromServer.fileMd5, objFromServer.fileLength, sendUser);
            }
            that.refreshForFileUploadComplete();
        })
    }


    // 群发助手 上传文件
    UIModule5.prototype.uploadBase64Str_group_msg_send = function (base64Str, isUsedForImageMsg) {

        var dataURLtoBlob = function (dataurl) {
            var arr = dataurl.split(','),
                mime = arr[0].match(/:(.*?);/)[1],
                bstr = atob(arr[1]),
                n = bstr.length,
                u8arr = new Uint8Array(n);
            while (n--) {
                u8arr[n] = bstr.charCodeAt(n);
            }
            return new Blob([u8arr], { type: mime });
        }

        var blobToFile = function (theBlob, fileName) {
            theBlob.lastModifiedDate = new Date();  // 文件最后的修改日期
            theBlob.name = fileName;                // 文件名
            return new File([theBlob], fileName, { type: theBlob.type, lastModified: Date.now() });
        }

        var file = blobToFile(dataURLtoBlob(base64Str), 'temp.jpg')

        var that = this;
        var logTag = (isUsedForImageMsg ? '图片' : '文件');
        //后缀名判断
        let fileExt = file.name.substr(file.name.lastIndexOf(".") + 1);
        fileExt = fileExt.toLowerCase()
        if (isUsedForImageMsg) {
            if (!(fileExt == 'jpg' || fileExt == 'png' || fileExt == 'jpeg')) {
                return alert(logTag + '仅支持jpg、png、jpeg格式')
            }

            //大小限制判断
            if (file.size > 10 * 1024 * 1024) {
                return alert(logTag + '大小限制为' + RBChatConfig.UPLOAD_AVATAR_IMAGE_DATA_MAX_LENGTH)
            }
        } else {
            //大小限制判断
            if (file.size > 300 * 1024 * 1024) {
                return alert(logTag + '大小限制为' + RBChatConfig.SEND_FILE_DATA_MAX_LENGTH)
            }
        }
        $('#im-panel-main-chat-textarea_fileuphint-2').css('display', 'block');
        $('#im-panel-main-chat-textarea_fileuphint-2').text(logTag + '上传中 0%');

        $("input[type='file'").val(null)

        // 当前选择得用户
        var sendUser = { currentSelectedAlarmType: RBChatMainUI.getCurrentSelectedAlarmType(), currentSelectedAlarmDataId: RBChatMainUI.getCurrentSelectedAlarmDataId() };
        /**
         * 文件上传
         * @param file 
         */
        RBChatUtils.uploadFile(file, function (data) {
            $('#im-panel-main-chat-textarea_fileuphint-2').text(logTag + "上传中 " + (data.percent * 100).toFixed(0) + "%");
        }, function (errorMsg) {
            $('#im-panel-main-chat-textarea_fileuphint-2').css('display', 'none');
            //alert(logTag+'上传出错，'+errorMsg);
            RBChatDialogHelper.showAlertDialog_WARN('上传出错', logTag + '上传出错，' + errorMsg);
            // 关闭文件上传提示UI的显示（之所有用延迟关闭，是因为uploadifive控件的设计时，onError调用后，会接着调用onUpload函数，
            // 这样的话，就会导致错误提示显示完成后，UI上确还显示着文件正在上传的信息，这就不合适了！）
            that.refreshForFileUploadCompleteLazy(30);
        }, function (data) {
            $('#im-panel-main-chat-textarea_fileuphint-2').css('display', 'none');
            // 服务端在文件上传完成后返回的JSON对象，请务必与服务端的文件上传接口中返回的参数保持一致（详见服务端：FileUploader4Web.java）！
            var objFromServer = data;
            that.refreshForFileUploadHint(logTag + '上传成功！');
            // 文件已上传到http成功，可以发送消息给对方了
            if (isUsedForImageMsg) { // 图片消息的发送

                that.circleSendGroupMsg(window.userList.length, objFromServer.fileMd5, MsgType.TYPE_IMAGE, [].concat(window.userList))
            }
            else { // 普通大文件消息的发送
                var fileMeta = {
                    /** 文件名 */
                    "fileName": objFromServer.fileName,
                    /** 文件md5码 */
                    "fileMd5": objFromServer.fileMd5,
                    /** 文件长度（单位：字节） */
                    "fileLength": objFromServer.fileLength
                };
                that.circleSendGroupMsg(window.userList.length, JSON.stringify(fileMeta), MsgType.TYPE_FILE, [].concat(window.userList))
            }
            that.refreshForFileUploadComplete();
        })
    }

    //## HTML5跨域文件上传组件Uoloadifive的初始化 START --------------------------------
    /**
     * 初始化HTML5文件上传组件（目前用于图片消息、大文件消息的上传功能）。
     * uploadifive的官方API文档地址：http://www.uploadify.com/documentation/
     *
     * @param usedFor 用途：“image_msg”-表示图片消息文件上传、“file_msg”-表示普通大文件消息文件上传
     */
    UIModule5.prototype.initFileUplodifive5 = function (usedFor) {
        var that = this;

        // 是否是用于图片消息的文件上传
        var isUsedForImageMsg = ('image_msg' == usedFor);
        // 是否是用于普通大文件消息的文件上传
        var isUsedForFileMg = ('file_msg' == usedFor);

        var $imageMsgSendBtnObj = $("#upload-image-input");
        var $fileMsgSendBtnObj = $("#upload-file-input");


        var $destSendBtnObj = (isUsedForImageMsg ? $imageMsgSendBtnObj : $fileMsgSendBtnObj);
        var did = isUsedForImageMsg ? '#upload-image-input' : '#upload-file-input'

        // 上传文件
        var upload_ = function (file, isUsedForImageMsg, isVideo = false) {
            var logTag = (isUsedForImageMsg ? '图片' : '文件');
            //后缀名判断
            let fileExt = file.name.substr(file.name.lastIndexOf(".") + 1);
            fileExt = fileExt.toLowerCase()
            if (!isVideo) {
                if (isUsedForImageMsg) {
                    if (!(fileExt == 'jpg' || fileExt == 'png' || fileExt == 'jpeg' || fileExt == 'gif')) {
                        return alert(logTag + '仅支持jpg、png、jpeg格式')
                    }

                    //大小限制判断
                    if (file.size > 10 * 1024 * 1024) {
                        return alert(logTag + '大小限制为' + RBChatConfig.UPLOAD_AVATAR_IMAGE_DATA_MAX_LENGTH)
                    }
                } else {
                    //大小限制判断
                    if (file.size > 300 * 1024 * 1024) {
                        return alert(logTag + '大小限制为' + RBChatConfig.SEND_FILE_DATA_MAX_LENGTH)
                    }
                }
            }

            $('#im-panel-main-chat-textarea_fileuphint').css('display', 'block');
            $('#im-panel-main-chat-textarea_fileuphint').text(logTag + '上传中 0%');
            // 当前选择得用户
            var sendUser = { currentSelectedAlarmType: RBChatMainUI.getCurrentSelectedAlarmType(), currentSelectedAlarmDataId: RBChatMainUI.getCurrentSelectedAlarmDataId() };
            $("input[type='file'").val(null)
            /**
             * 文件上传
             * @param file 
             */
            RBChatUtils.uploadFile(file, function (data) {
                $('#im-panel-main-chat-textarea_fileuphint').text(logTag + "上传中 " + (data.percent * 100).toFixed(0) + "%");
            }, function (errorMsg) {
                $('#im-panel-main-chat-textarea_fileuphint').css('display', 'none');
                //alert(logTag+'上传出错，'+errorMsg);
                RBChatDialogHelper.showAlertDialog_WARN('上传出错', logTag + '上传出错，' + errorMsg);
                // 关闭文件上传提示UI的显示（之所有用延迟关闭，是因为uploadifive控件的设计时，onError调用后，会接着调用onUpload函数，
                // 这样的话，就会导致错误提示显示完成后，UI上确还显示着文件正在上传的信息，这就不合适了！）
                that.refreshForFileUploadCompleteLazy(30);
            }, function (data) {
                $('#im-panel-main-chat-textarea_fileuphint').css('display', 'none');
                // 服务端在文件上传完成后返回的JSON对象，请务必与服务端的文件上传接口中返回的参数保持一致（详见服务端：FileUploader4Web.java）！
                var objFromServer = data;
                that.refreshForFileUploadHint(logTag + '上传成功！');
                // 非视频
                if (!isVideo) {
                    // 文件已上传到http成功，可以发送消息给对方了
                    if (isUsedForImageMsg) { // 图片消息的发送
                        that.doSendImageMessage4IM(objFromServer.fileMd5, sendUser);
                    }
                    else { // 普通大文件消息的发送
                        that.doSendFileMessage4IM(objFromServer.fileName, objFromServer.fileMd5, objFromServer.fileLength, sendUser);
                    }
                } else {
                    //视频文件
                    that.doSendVideoMessage4IM(objFromServer.fileName, objFromServer.fileMd5, objFromServer.fileLength, sendUser);
                }

                that.refreshForFileUploadComplete();
            })
        }

        // 拖拽事件
        var dragEvent = function (oWrap) {
            oWrap.ondragover = function (ev) {
            }

            oWrap.ondrop = function (ev) {
                ev.preventDefault();
                ev.stopPropagation()
                var files = ev.dataTransfer.files;
                if (files.length <= 0) {
                    return alert('请选择文件后上传')
                }
                const file = files[0];
                // 上传文件
                upload_(file, file.type.includes('image'), file.type.includes('video'))
            }
        }

        //实现拖文件上传
        dragEvent(document.getElementById('kchat-im-panel-main-chat-textarea'))
        $destSendBtnObj.unbind("change");
        $destSendBtnObj.on('change', function () {
            // 文件判断
            var files = $destSendBtnObj[0].files;
            if (files.length <= 0) {
                return alert('请选择文件后上传')
            }
            const file = files[0];
            console.log('文件上传', 1, file)
            // 上传文件
            upload_(file, isUsedForImageMsg)
        });
        $('#upload-video-input').unbind("change");
        //上传视频
        $('#upload-video-input').on('change', function () {
            // 文件判断
            var files = $('#upload-video-input')[0].files;
            if (files.length <= 0) {
                return alert('请选择文件后上传')
            }
            const file = files[0];
            // 上传文件
            upload_(file, isUsedForImageMsg, true)
        });

        $('#upload-image-mul-input').unbind("change");
        //上传多张图片
        $('#upload-image-mul-input').on('change', function () {
            // 文件判断
            var files = $('#upload-image-mul-input')[0].files;
            const files_ext = ['jpg', 'png', 'jpeg', 'gif', 'webp']
            // 获取图片
            var img_files = []
            for (file of files) {
                let fileExt = file.name.substr(file.name.lastIndexOf(".") + 1);
                if (files_ext.indexOf(fileExt.toLowerCase()) != -1) {
                    img_files.push(file)
                }
            }
            // 批量上传图片
            if (img_files.length > 0) {
                var resultList = []
                that.circle_update_file(img_files.length, resultList, img_files, function () {
                    // 上传成功
                    if (resultList.length > 0) {
                        RBChatDialogHelper.showMulImageSendDialog(resultList, true)
                    } else {
                        alert('上传图片失败')
                    }
                })

            } else {
                return alert('请选择图片进行上传')
            }
        });


        $('#upload-mul-video-input').unbind("change");
        //上传多个视频
        $('#upload-mul-video-input').on('change', function () {
            // 文件判断
            var files = $('#upload-mul-video-input')[0].files;
            const files_ext = ['mp4']
            // 获取图片
            var img_files = []
            for (file of files) {
                let fileExt = file.name.substr(file.name.lastIndexOf(".") + 1);
                if (files_ext.indexOf(fileExt.toLowerCase()) != -1) {
                    img_files.push(file)
                }
            }
            // 批量上传视频
            if (img_files.length > 0) {
                var resultList = []
                that.circle_update_file(img_files.length, resultList, img_files, function () {
                    console.log('resultList', resultList)
                    // 上传成功
                    if (resultList.length > 0) {
                        RBChatDialogHelper.showMulImageSendDialog(resultList, false)
                    } else {
                        alert('上传视频失败')
                    }
                })

            } else {
                return alert('请选择' + files_ext.join(',') + '进行上传')
            }
        });

        //红包发送
        $('#send-redpag-pack').unbind("click");
        $('#send-redpag-pack').click(function () {
            var callBack = function (e) {

                var l = function () {
                    var obj = null;
                    try {
                        obj = JSON.parse(e.data)
                    } catch (e) { }
                    if (obj) {
                        //红包发送成功
                        if (obj.type - 0 == 0) {
                            var r = $('#im-panel-msg-popupmenu')
                            if (r) {
                                r.remove();
                            }
                            //查询红包详情
                            RBChatRestHelper.queryWalletIdFromServer(obj.data
                                , function (returnValue) {
                                    var res = JSON.parse(returnValue);
                                    if (res.data) {
                                        var fingerPrint = MBProtocalFactory.genFingerPrint();
                                        // 发送消息
                                        that.doSendMessageImpl(JSON.stringify(res.data), 10, function () {
                                            // 清空输入框
                                            that.$inputMessage.val('');
                                        }, fingerPrint);
                                    }
                                }
                                , function (errorThrownStr) {
                                    //alert('首页历史"消息"列表数据读取出错，原因是：'+errorThrownStr);
                                    RBChatDialogHelper.showAlertDialog_WARN('加载失败', '首页历史"消息"列表数据加载出错，可能是网络故障，请稍后再试！');
                                }
                            );

                            //点击取消
                        } else if (obj.type - 0 == 1) {
                            var r = $('#im-panel-msg-popupmenu')
                            if (r) {
                                r.remove();
                            }
                        }
                    }
                }

                if (that.ltimer) {
                    clearTimeout(that.ltimer)
                    that.ltimer = null;
                }

                that.ltimer = setTimeout(() => {
                    l();
                }, 250)

            }
            var localUserUid = LocalUserInfo.getUid();
            const numPeo = window.groupInfo.g_member_count;
            RBChatUtils.showIFrameURL("https://chat.imnono.net/coupon/givRedEnv.html?numPeo=" + numPeo + "&userId=" + localUserUid, '发送红包', callBack)
        })
    };


    /**
     * 批量上传图片中
     * @param {*} resultList 
     * @param {*} uploadFiles 
     */
    UIModule5.prototype.circle_update_file = function (count, resultList, uploadFiles, callBack) {
        const that = this;
        if (uploadFiles.length > 0) {
            var file = uploadFiles[0]
            uploadFiles.splice(0, 1)
            RBChatUtils.uploadFile(file, function (data) {
                $('#im-panel-main-chat-textarea_fileuphint').show();
                $('#im-panel-main-chat-textarea_fileuphint').text("上传中[" + (count - uploadFiles.length) + "/" + count + "] - " + (data.percent * 100).toFixed(0) + "%");
            }, function (errorMsg) {
                that.circle_update_file(count, resultList, uploadFiles, callBack)
            }, function (data) {
                resultList.push(data)
                that.circle_update_file(count, resultList, uploadFiles, callBack)
            })
        } else {
            $("input[type='file'").val(null)
            $('#im-panel-main-chat-textarea_fileuphint').hide();
            that.refreshForFileUploadHint('上传完成！');
            that.refreshForFileUploadComplete();
            if (callBack) {
                callBack()
            }
        }
    }


    /**
     *  群发助手
     * @param {*} userList  用户列表
     */
    UIModule5.prototype.initFileUplodifive5_groupMsgSend = function () {
        var that = this;

        var $imageMsgSendBtnObj = $("#upload-image-input-2");
        var $fileMsgSendBtnObj = $("#upload-file-input-2");


        // 上传文件
        var upload_ = function (file, isUsedForImageMsg, isVideo = false) {
            var logTag = (isUsedForImageMsg ? '图片' : '文件');
            //后缀名判断
            let fileExt = file.name.substr(file.name.lastIndexOf(".") + 1);
            fileExt = fileExt.toLowerCase()
            if (!isVideo) {
                if (isUsedForImageMsg) {
                    if (!(fileExt == 'jpg' || fileExt == 'png' || fileExt == 'jpeg')) {
                        return alert(logTag + '仅支持jpg、png、jpeg格式')
                    }

                    //大小限制判断
                    if (file.size > 10 * 1024 * 1024) {
                        return alert(logTag + '大小限制为' + RBChatConfig.UPLOAD_AVATAR_IMAGE_DATA_MAX_LENGTH)
                    }
                } else {
                    //大小限制判断
                    if (file.size > 300 * 1024 * 1024) {
                        return alert(logTag + '大小限制为' + RBChatConfig.SEND_FILE_DATA_MAX_LENGTH)
                    }
                }
            }

            $('#im-panel-main-chat-textarea_fileuphint-2').css('display', 'block');
            $('#im-panel-main-chat-textarea_fileuphint-2').text(logTag + '上传中 0%');

            $("input[type='file'").val(null)

            /**
             * 文件上传
             * @param file 
             */
            RBChatUtils.uploadFile(file, function (data) {
                $('#im-panel-main-chat-textarea_fileuphint-2').text(logTag + "上传中 " + (data.percent * 100).toFixed(0) + "%");
            }, function (errorMsg) {
                $('#im-panel-main-chat-textarea_fileuphint-2').css('display', 'none');
                //alert(logTag+'上传出错，'+errorMsg);
                RBChatDialogHelper.showAlertDialog_WARN('上传出错', logTag + '上传出错，' + errorMsg);
                // 关闭文件上传提示UI的显示（之所有用延迟关闭，是因为uploadifive控件的设计时，onError调用后，会接着调用onUpload函数，
                // 这样的话，就会导致错误提示显示完成后，UI上确还显示着文件正在上传的信息，这就不合适了！）
                that.refreshForFileUploadCompleteLazy(30);
            }, function (data) {
                $('#im-panel-main-chat-textarea_fileuphint-2').css('display', 'none');
                // 服务端在文件上传完成后返回的JSON对象，请务必与服务端的文件上传接口中返回的参数保持一致（详见服务端：FileUploader4Web.java）！
                var objFromServer = data;
                that.refreshForFileUploadHint(logTag + '上传成功！');
                // 非视频
                if (!isVideo) {
                    // 文件已上传到http成功，可以发送消息给对方了
                    if (isUsedForImageMsg) { // 图片消息的发送

                        that.circleSendGroupMsg(window.userList.length, objFromServer.fileMd5, MsgType.TYPE_IMAGE, [].concat(window.userList))
                    }
                    else { // 普通大文件消息的发送
                        var fileMeta = {
                            /** 文件名 */
                            "fileName": objFromServer.fileName,
                            /** 文件md5码 */
                            "fileMd5": objFromServer.fileMd5,
                            /** 文件长度（单位：字节） */
                            "fileLength": objFromServer.fileLength
                        };
                        that.circleSendGroupMsg(window.userList.length, JSON.stringify(fileMeta), MsgType.TYPE_FILE, [].concat(window.userList))
                    }
                } else {
                    //视频文件
                    var fileMeta = {
                        /** 文件名 */
                        "fileName": objFromServer.fileMd5,
                        /** 文件md5码 */
                        "fileMd5": objFromServer.fileName,
                        /** 文件长度（单位：字节） */
                        "fileLength": objFromServer.fileLength
                    };
                    that.circleSendGroupMsg(window.userList.length, JSON.stringify(fileMeta), MsgType.TYPE_SHORTVIDEO, [].concat(window.userList))
                }

                that.refreshForFileUploadComplete();
            })
        }

        // 拖拽事件
        var dragEvent = function (oWrap) {
            oWrap.ondragover = function (ev) {
            }

            oWrap.ondrop = function (ev) {
                ev.preventDefault();
                ev.stopPropagation()
                var files = ev.dataTransfer.files;
                if (files.length <= 0) {
                    return alert('请选择文件后上传')
                }
                const file = files[0];
                // 上传文件
                upload_(file, file.type.includes('image'), file.type.includes('video'))
            }
        }

        //实现拖文件上传
        dragEvent(document.getElementById('kchat-im-panel-main-chat-textarea-2'))
        // 图片上传
        $imageMsgSendBtnObj.unbind("change");
        $imageMsgSendBtnObj.on('change', function () {
            // 文件判断
            var files = $imageMsgSendBtnObj[0].files;
            if (files.length <= 0) {
                return alert('请选择文件后上传')
            }
            const file = files[0];
            // 上传文件
            upload_(file, true)
        });
        // 文件上传
        $fileMsgSendBtnObj.unbind("change");
        $fileMsgSendBtnObj.on('change', function () {
            // 文件判断
            var files = $fileMsgSendBtnObj[0].files;
            if (files.length <= 0) {
                return alert('请选择文件后上传')
            }
            const file = files[0];
            // 上传文件
            upload_(file, false)
        });
        // 视频上传
        $('#upload-video-input-2').unbind("change");
        $('#upload-video-input-2').on('change', function () {
            // 文件判断
            var files = $('#upload-video-input-2')[0].files;
            if (files.length <= 0) {
                return alert('请选择文件后上传')
            }
            const file = files[0];
            // 上传文件
            upload_(file, false, true)
        });
        // 输入框 post 事件
        $('#im-panel-inputcontent-2').on('paste', function (e) {
            const clipdata = e.originalEvent.clipboardData;
            //是文本，判断是否是消息内图片复制
            if (clipdata.types && clipdata.types.length > 0 && clipdata.types[0].indexOf('text') >= 0) {
                const text = clipdata.getData("text/plain");
                if (text.indexOf('fingerPrintOfProtocal') >= 0 && text.indexOf('fingerPrintOfParent') >= 0) {
                    var dialogId = RBChatDialogHelper.nextDialogId();
                    const img_obj = JSON.parse(text);
                    RBChatDialogHelper.showImageSendDialog(dialogId, 0, img_obj, function () {
                        that.circleSendGroupMsg(window.userList.length, img_obj.text, MsgType.TYPE_IMAGE, [].concat(window.userList))
                    })
                    return false;
                }
            }
            if (clipdata.items && clipdata.items.length > 0) {
                const item = clipdata.items[0]
                if (item.kind == 'file' && item.type.match(/^image\//i)) {
                    var dialogId = RBChatDialogHelper.nextDialogId();
                    RBChatDialogHelper.showImageSendDialog(dialogId, 1, item, function (base64Str) {
                        that.uploadBase64Str_group_msg_send(base64Str, true)
                    })
                    return true;
                }
            }
        })
    };


    UIModule5.prototype.refreshForFileUploadHint = function (hint) {
        var fileUploadHintUIObj = $('#im-panel-main-chat-textarea_fileuphint');
        var fileUploadHintUIObj2 = $('#im-panel-main-chat-textarea_fileuphint-2');

        if (fileUploadHintUIObj2) {
            fileUploadHintUIObj2.text(hint);
            fileUploadHintUIObj2.show();
        } else {
            fileUploadHintUIObj.text(hint);
            fileUploadHintUIObj.show();
        }
    };

    /**
     * 在指定的延迟后，关闭文件上传提示控件的UI显示。
     *
     * @param timeout
     */
    UIModule5.prototype.refreshForFileUploadCompleteLazy = function (timeout) {
        var fileUploadHintUIObj = $('#im-panel-main-chat-textarea_fileuphint');
        var fileUploadHintUIObj2 = $('#im-panel-main-chat-textarea_fileuphint-2');
        setTimeout(function () {
            fileUploadHintUIObj.hide();
            fileUploadHintUIObj.text('');
            if (fileUploadHintUIObj2) {
                fileUploadHintUIObj2.hide();
                fileUploadHintUIObj2.text('');
            }
        }, timeout);
    };

    UIModule5.prototype.refreshForFileUploadComplete = function () {
        this.refreshForFileUploadCompleteLazy(2500);
    };
    // ## HTML5跨域文件上传组件Uoloadifive的初始化 END --------------------------------

    // ## 表情操作面板及功能的初始化 STAR ---------------------------------------------
    /**
     * 初始化表情相关的事件处理。
     */
    UIModule5.prototype.initEmoji = function () {
        var that = this;
        $.get("/images/face/face_data.json", function (data) {
            // console.log("ttt0:" + JSON.stringify(data));
            for (var i = 0; i < data.length; i++) {
                EMOJI_MAP[data[i].desc] = data[i].fileName;
            }
            // 保存emoji笑脸图片
            window.emoji_list = data
            that.refreshFaceBoard(data);
        });
    };

    // 初始群发助手的表情
    UIModule5.prototype.initEmoji2 = function () {
        var that = this;
        $.get("/images/face/face_data.json", function (data) {
            // console.log("ttt0:" + JSON.stringify(data));
            for (var i = 0; i < data.length; i++) {
                EMOJI_MAP[data[i].desc] = data[i].fileName;
            }
            that.refreshFaceBoard2(data);
        });
    };

    /**
  * 刷新表情面板.
  * 
  * @author Freeman
  */
    UIModule5.prototype.refreshFaceBoard2 = function (faceDatas) {
        var emojiPopObj = $('#im-panel-main-chat-textarea_emojipopup-2'); // 表情面板 div
        var emojiOpenBtnObj = $('#im-panel-main-chat-textarea_emojiopenbtn-2'); //表情开关按钮 i
        var faceGroupsHtml = "";
        faceGroupsHtml += "<ul id='im-panel-main-chat-face-emoji' style='display:flex'>";
        for (var faceIndex in faceDatas) {
            var face = faceDatas[faceIndex];
            //每个表情单元，各单元的class=emoji_li并不存在，仅为做标记faceType以为下面使用
            var filePath = "/images/face/emoji/" + face.fileName;
            faceGroupsHtml += "<li class='emoji_li' desc='" + face.desc + "'>" +
                "<span style=\"background: url('" + filePath + "') no-repeat; background-size:contain;\" class='emoji'></span></li>"
        }
        faceGroupsHtml += "</ul>";

        emojiPopObj.append(faceGroupsHtml); //加入各表情组内容

        // 点情表情打开按钮则打开表情择面板
        emojiOpenBtnObj.unbind('click');
        emojiOpenBtnObj.click(function () {
            emojiPopObj.toggle();
        });

        // 为每一个表情增加点击事件
        $(".emoji_li").click(function () {
            var inputObj = $('#im-panel-inputcontent-2');
            // inputObj.val(inputObj.val() + $(this).attr('desc')); // 此方式只会追加在末尾，不能插入到当前交点处
            // RBChatUtils.setTextFocus(inputObj); // 获得焦点，方便接着输入其它内容 // 该方法会将光标设置到末尾
            var pos = RBChatUtils.insertAtCursor(inputObj, $(this).attr('desc')); //插入emoji表情并返回最新输入的位置(emoji表情后)
            RBChatUtils.setCursorPos(inputObj, pos); // 设置光标到最新输入的位置(emoji表情后)
        });


        // 添加事件保证点击空白的地方则表情选择面板消失
        document.body.onclick = function (e) {
            e = e || window.event;
            var target = e.target || e.srcElement;
            console.log('target',target.id);
            if (target.id != "im-panel-main-chat-textarea_emojipopup-2"
                && target.id != 'im-panel-main-chat-textarea_emojiopenbtn-2') {
                emojiPopObj.hide();
            }
        };
    };

    /**
     *  初始面板表情
     * @param {*} key 
     */
    UIModule5.prototype.show_plan_face_ui = function(key=''){
        // 表情
        if(key == '' || key == 'emoji'){
            this.show_emoji_ui()
        // 收藏
        }else if(key == 'love'){
            this.show_face_love_ui();
        // 其他
        }else{
            this.show_bg_face_love_ui(key)
        }
    }

    /**
     * 初始表情导航
     */
    UIModule5.prototype.init_face_nav_ui = function(){
       var that = this;
       $('#emoji-nav').empty()
       $('#emoji-nav').append('<div class="item item-active" key="emoji"><img src="images/face.svg"/></div>')
       var nav_face_list = window.bg_face_list
       nav_face_list.forEach(item=>{
        $('#emoji-nav').append('<div class="item" key="nav-'+item.id+'"><img src="'+item.key+'"/></div>')
       })
       $('#emoji-nav').append('<div class="item" id="nav-love" key="love"><img src="images/love-e.svg"/></div> ')


       $('#emoji-nav div').unbind('click')
       $('#emoji-nav div').click(function(){
            $('#emoji-nav div').removeClass('item-active')
            $(this).addClass('item-active')
            const key = $(this).attr('key')
            that.show_plan_face_ui(key)
       })
    }

    /**
     * 显示后台返回的表情
     * @param {*} key 
     */
    UIModule5.prototype.show_bg_face_love_ui = function(key){
        var love_emojiPopObj = $('#emoji-content'); //表情开关按钮 i
        love_emojiPopObj.empty();
        var that = this;
        var love_pop = $('#im-panel-main-chat-textarea_love_emojipopup'); //表情开关按钮 i
        // 显示其他表情列表
        var show_other_face_love = function(list){
            var faceGroupsHtml = "";
            faceGroupsHtml += "<ul id='im-panel-main-chat-face-emoji-love'>";
            // 添加图片
            list.forEach(item => {
                faceGroupsHtml += "<li><img src='"+item.key+"' class='love-face-img' dkey='" +item.key + "'/></li>"
            })
            faceGroupsHtml += "</ul>";
            love_emojiPopObj.append(faceGroupsHtml); //加入各表情组内容

             // 图标绑定事件
            $('.love-face-img').unbind('click')
            $('.love-face-img').click(function () {
                //发送图片消息
                if (RBChatMainUI.getCurrentSelectedAlarmDataId()) {
                    var sendUser = { currentSelectedAlarmType: RBChatMainUI.getCurrentSelectedAlarmType(), currentSelectedAlarmDataId: RBChatMainUI.getCurrentSelectedAlarmDataId() };
                    that.doSendImageMessage4IM($(this).attr('dkey'), sendUser);
                    love_pop.hide();
                }
            })

        }
        if(!window.fac_id_map){
            window.fac_id_map={}
        }
        if(key && key.length > 0){
            var face_id = key.split('-')[1]
            const v =  window.fac_id_map[face_id]
            if(v){
                show_other_face_love(v)
            }else{
                // 查询表情列表
                RBChatRestHelper.query_face_type_detail_list(face_id,function (res) {
                    const obj_list = JSON.parse(res);
                    window.fac_id_map[face_id] = obj_list || []
                    show_other_face_love(obj_list || [])
                });
            }
        }
    }


    /**
     * 初始收藏图标列表
     */
    UIModule5.prototype.show_face_love_ui = function () {
        const that = this;
        var love_emojiPopObj = $('#emoji-content'); //表情开关按钮 i
        love_emojiPopObj.empty();
        var love_pop = $('#im-panel-main-chat-textarea_love_emojipopup'); //表情开关按钮 i


        var faceGroupsHtml = "";
        faceGroupsHtml += "<ul id='im-panel-main-chat-face-emoji-love'>";
        faceGroupsHtml += "<li><img src='/images/face-add.webp' class='face-love-add' id='face-love-add' onclick=\"$('#upload-love-face-file-input').click();\"/> <input type='file' name='upload-love-face-file-input' id='upload-love-face-file-input' style='display: none;'></li>"
        const love_list = window.love_face_list || []
        // 添加图片
        love_list.forEach(item => {
            var img_url = item[1] && item[1].indexOf('http') ==-1 ? RBChatUtils.getImageDownloadURL(item[1]):item[1];
            faceGroupsHtml += "<li><img src='" +img_url + "' class='love-face-img' dkey='" + img_url + "'  bid='" + item[0] + "'/></li>"
        })
        faceGroupsHtml += "</ul>";
        love_emojiPopObj.append(faceGroupsHtml); //加入各表情组内容

        // 上传文件
        var upload_ = function (file, isUsedForImageMsg, isVideo = false) {
            var logTag = (isUsedForImageMsg ? '图片' : '文件');
            //后缀名判断
            let fileExt = file.name.substr(file.name.lastIndexOf(".") + 1);
            fileExt = fileExt.toLowerCase()
            if (!isVideo) {
                if (isUsedForImageMsg) {
                    if (!(fileExt == 'jpg' || fileExt == 'png' || fileExt == 'jpeg' || fileExt == 'gif')) {
                        return alert(logTag + '仅支持jpg、png、jpeg格式')
                    }
                    //大小限制判断
                    if (file.size > 10 * 1024 * 1024) {
                        return alert(logTag + '大小限制为' + RBChatConfig.UPLOAD_AVATAR_IMAGE_DATA_MAX_LENGTH)
                    }
                } else {
                    //大小限制判断
                    if (file.size > 300 * 1024 * 1024) {
                        return alert(logTag + '大小限制为' + RBChatConfig.SEND_FILE_DATA_MAX_LENGTH)
                    }
                }
            }

            // 当前选择得用户
            $("input[type='file'").val(null)
            /**
             * 文件上传
             * @param file 
             */
            RBChatUtils.uploadFile(file, function (data) {

            }, function (errorMsg) {
                //alert(logTag+'上传出错，'+errorMsg);
                RBChatDialogHelper.showAlertDialog_WARN('上传出错', logTag + '上传出错，' + errorMsg);
            }, function (data) {
                // 服务端在文件上传完成后返回的JSON对象，请务必与服务端的文件上传接口中返回的参数保持一致（详见服务端：FileUploader4Web.java）！
                var objFromServer = data;
                //上传收藏
                RBChatRestHelper.add_love_face(RBChatUtils.getImageDownloadURL(objFromServer.fileMd5, false), function () {
                    //查询收藏
                    RBChatRestHelper.query_love_face(function (res) {
                        window.love_face_list = JSON.parse(res)
                        // 重新绘制界面
                        that.show_face_love_ui()
                    }, null)
                }, null)
            })
        }

        $('#upload-love-face-file-input').unbind("change");
        //上传图片
        $('#upload-love-face-file-input').on('change', function () {
            // 文件判断
            var files = $('#upload-love-face-file-input')[0].files;
            if (files.length <= 0) {
                return alert('请选择文件后上传')
            }
            const file = files[0];
            // 上传文件
            upload_(file, true, true)
        });

        // 图标绑定事件
        $('.love-face-img').unbind('click')
        $('.love-face-img').click(function () {
            //发送图片消息
            if (RBChatMainUI.getCurrentSelectedAlarmDataId()) {
                var sendUser = { currentSelectedAlarmType: RBChatMainUI.getCurrentSelectedAlarmType(), currentSelectedAlarmDataId: RBChatMainUI.getCurrentSelectedAlarmDataId() };
                that.doSendImageMessage4IM($(this).attr('dkey'), sendUser);
                love_pop.hide();
            }
        })

        $('.love-face-img').unbind('contextmenu')
        $('.love-face-img').bind('contextmenu', function (e) {

            // 右键菜单主div层
            var popupId = "im-panel-msg-popupmenu";
            var oldPopupObj = $("#" + popupId);
            // 如果已经存在则先删除之（jq里选择器选回对象的Length>0表示该元素是存在的）
            if (oldPopupObj.length > 0)
                oldPopupObj.remove();

            // 构建菜单html内容
            var html =
                '<div id="' + popupId + '" style="display: none;">'
                + '   <div class="kchat-pop ">'
                + '       <ul>'
                + '<li id="im-panel-msg-popupmenu-delete">删除</li>'
                + '       </ul>'
                + '   </div>'
                + '</div>';

            $(html).appendTo('body');

            // 菜单对象
            var newPopupObj = $("#" + popupId);
            var x = e.clientX;
            var y = e.clientY;
            // 在鼠标点击的位置显示菜单
            newPopupObj.css("top", y + "px");
            newPopupObj.css("left", x + "px");
            newPopupObj.show();

            // 点击空白处的事件处理（希望点空白，能自动隐藏菜单层的显示）
            $("body").click(function (event) {
                newPopupObj.remove();
            });
            const bid = $(this).attr('bid')
            // 转发功能
            $('#im-panel-msg-popupmenu-delete').click(function () {
                newPopupObj.remove();
                //查询收藏
                RBChatRestHelper.delete_love_face(bid, function (res) {
                    //查询收藏
                    RBChatRestHelper.query_love_face(function (res) {
                        window.love_face_list = JSON.parse(res)
                        // 重新绘制界面
                        that.show_face_love_ui()
                    }, null)
                }, null)

            })

            return false;

        })
    }

    /**
     * 初始emoji图标列表
     */
    UIModule5.prototype.show_emoji_ui = function(){
        const that = this;
        var love_emojiPopObj = $('#emoji-content'); //表情开关按钮 i
        love_emojiPopObj.empty();
        var faceGroupsHtml = "";
        faceGroupsHtml += "<ul id='im-panel-main-chat-face-emoji-love'>";
        var love_pop = $('#im-panel-main-chat-textarea_love_emojipopup'); //表情开关按钮 i

        const emoji_list = window.emoji_list || []
        // 添加图片
        emoji_list.forEach(item => {
            var face = item;
            //每个表情单元，各单元的class=emoji_li并不存在，仅为做标记faceType以为下面使用
            var filePath = "/images/face/emoji/" + face.fileName;
            faceGroupsHtml += "<li class='emoji_li' desc='" + face.desc + "'>" +
                "<span style=\"background: url('" + filePath + "') no-repeat; background-size:contain;\" class='emoji'></span></li>"
        })
        faceGroupsHtml += "</ul>";
        love_emojiPopObj.append(faceGroupsHtml); //加入各表情组内容

         // 为每一个表情增加点击事件
         $(".emoji_li").click(function () {
            var inputObj = $('#im-panel-inputcontent');
            // inputObj.val(inputObj.val() + $(this).attr('desc')); // 此方式只会追加在末尾，不能插入到当前交点处
            // RBChatUtils.setTextFocus(inputObj); // 获得焦点，方便接着输入其它内容 // 该方法会将光标设置到末尾
            var pos = RBChatUtils.insertAtCursor(inputObj, $(this).attr('desc')); //插入emoji表情并返回最新输入的位置(emoji表情后)
            RBChatUtils.setCursorPos(inputObj, pos); // 设置光标到最新输入的位置(emoji表情后)
            love_pop.hide();
        });
    }


    /**
     * 刷新表情面板.
     * 
     * @author Freeman
     */
    UIModule5.prototype.refreshFaceBoard = function (faceDatas) {
        var love_emojiOpenBtnObj = $('#im-panel-main-chat-textarea_love_emojiopenbtn'); // 表情面板 div
        var love_emojiPopObj = $('#im-panel-main-chat-textarea_love_emojipopup'); //表情开关按钮 i
        var that = this;
        love_emojiOpenBtnObj.unbind('click');
        love_emojiOpenBtnObj.click(function () {
            love_emojiPopObj.toggle();
            that.init_face_nav_ui();
            that.show_plan_face_ui();
        });


        document.body.onclick = function (e) {
            e = e || window.event;
            var target = e.target || e.srcElement;
            const ids_list = [
                'face-love-add',
                'upload-love-face-file-input',
                'im-panel-msg-popupmenu-delete',
                'im-panel-main-chat-textarea_love_emojiopenbtn',
                'im-panel-main-chat-textarea_love_emojipopup'
            ]
            if(target.id.length > 0 && ids_list.indexOf(target.id) == -1){
                love_emojiPopObj.hide();
            }
        };
    };

    UIModule5.prototype.replaceEmojiPlaceholderToHTML = function (contentWithEmojiPlaceholder) {
        if (contentWithEmojiPlaceholder) {
            // 匹配表情占位符，占位符形如“[emoji_cry]”
            var m = contentWithEmojiPlaceholder.match(/\[[^\[|^\]]+\]/g);
            if (m) {
                for (var i in m) {
                    // 映射表中存在这个表情吗？
                    if (EMOJI_MAP[m[i]]) { // m[i]的值将形如“[emoji_cry]”
                        // 将占位符替换成img的形式，以便在html中显示出来
                        contentWithEmojiPlaceholder = contentWithEmojiPlaceholder
                            .replace(m[i], '<img src="' + (EMOJI_DIR + EMOJI_MAP[m[i]])
                                + '" width="20" style="display: inline;vertical-align: text-bottom;">');
                    }
                }
            }
        }
        return contentWithEmojiPlaceholder;
    };
    // ## 表情操作面板及功能的初始化 END ----------------------------------------------

    /**
     * 初始化清空聊天界面的事件处理。
     */
    UIModule5.prototype.initClearChatContents = function () {
        var clearBtnObj = $('#im-panel-main-chat-textarea_clearbtn');
        var that = this;

        // 点情表情打开按钮则打开表情择面板
        clearBtnObj.click(function () {

            //** 【1】先清空聊天界面
            that.setChatPaneEmpty();

            //** 【2】再清空JS消息缓存
            // 首页“消息”上选中的item数据类型
            var currentSelectedAlarmType = RBChatMainUI.getCurrentSelectedAlarmType();
            // 首页“消息”上选中的item数据id值
            var currentSelectedAlarmDataId = RBChatMainUI.getCurrentSelectedAlarmDataId();
            // 选中的是一对一好友聊天类型的消息、陌生人/临时聊天类型的消息
            if (currentSelectedAlarmType == AlarmMessageType.reviceMessage
                || currentSelectedAlarmType == AlarmMessageType.tempChatMessage) {
                // 同时从JS缓存中请除与此用户的聊天数据（此时首页“消息”选中item的id值就是聊天对象的uid）
                SingleChattingCache.removeChatCache(currentSelectedAlarmDataId);
                GroupChattingCache.removeChatCache(currentSelectedAlarmDataId);
            }
        });
    };


    /**
     * 初始化“位置”消息发送按钮的事件处理。
     */
    UIModule5.prototype.initLocationMsgSend = function () {
        var btnObj = $('#im-panel-main-chat-textarea_locationmsgbtn');
        var that = this;

        // 点击事件
        btnObj.click(function () {
            if (!that.send4IMCheck())
                return;

            RBChatDialogHelper.showLocationSelectDialog();
        });
    };

    /**
     * 初始化“名片”消息发送按钮的事件处理。
     */
    UIModule5.prototype.initContactMsgSend = function () {
        var btnObj = $('#im-panel-main-chat-textarea_contactmsgbtn');
        var that = this;

        // 点击事件
        btnObj.click(function () {

            if (!that.send4IMCheck())
                return;

            //     var currentSelectedAlarmType = RBChatMainUI.getCurrentSelectedAlarmType();
            //     var currentSelectedAlarmDataId = RBChatMainUI.getCurrentSelectedAlarmDataId();

            //     var chatModeType = null;
            //     if (currentSelectedAlarmType == AlarmMessageType.reviceMessage)
            //         chatModeType = ChatModeType.CHAT_TYPE_FRIEND$CHAT;
            //     else if (currentSelectedAlarmType == AlarmMessageType.tempChatMessage)
            //         chatModeType = ChatModeType.CHAT_TYPE_GUEST$CHAT;
            //     else if (currentSelectedAlarmType == AlarmMessageType.groupChatMessage)
            //         chatModeType = ChatModeType.CHAT_TYPE_GROUP$CHAT;

            //     RBChatDialogHelper.showUserChooserDialog(
            //         UserChooserDialogUsed.USED_FOR_SEND_CONTACT_MESSAGE, chatModeType, currentSelectedAlarmDataId);
            var localUserInfo = LocalUserInfo.getObj();
            // 发出消息指令
            RBChatChattingContentPaneUI.doSendContactMessage4IM(localUserInfo.user_uid, localUserInfo.nickname, function () { });
        });


    };

    /**
     * 插入多条聊天消息到在线聊天的消息面板中。
     *
     * @param multiChatMsgEntity Array[ChatMsgEntity对象]数组
     * @param needPrepend true表示插入被选元素的开头，否则插入被选元素的末尾
     */
    UIModule5.prototype.insertChatItems = function (multiChatMsgEntity, needPrepend, scrollBottom = true) {
        if (multiChatMsgEntity) {
            //标准的for循环：遍历 Array[ChatMsgEntity对象] 数组
            for (var i = 0; i < multiChatMsgEntity.length; i++) {
                this.insertChatItemWithP(multiChatMsgEntity[i], needPrepend, scrollBottom);
            }
        }
        else {
            RBChatUtils.logToConsole('【UI处理】insertChatItems无法完成，原因：multiP=' + multiChatMsgEntity);
        }
    };

    /**
     * 构建聊天消息中的时间显示内容。
     *
     * @param date {long} 时间戳，长整数，对应{@link ChatMsgEntity}对象的date字段值
     */
    UIModule5.prototype.constructTimeStringForChatItem = function (date) {
        var timeToShow = (date ? RBChatUtils.getTimeStringAutoShort(date, true, true)
            : RBChatUtils.getTimeStringAutoShort(RBChatUtils.getCurrentUTCTimestamp(), true, true));
        return timeToShow;
    };

    /**
     * 插入一条聊天消息到在线聊天的消息面板中。
     *
     * @param chatMsgEntity 聊天消息数据对够用（ChatMsgEntity对象字段定义见：rbchat_cache.js文件）
     * @param needPrepend true表示插入被选元素的开头，否则插入被选元素的末尾
     */
    UIModule5.prototype.insertChatItemWithP = function (chatMsgEntity, needPrepend, scrollBottom = true) {
        var isme = this.isMyselfChatData4IM(chatMsgEntity);
        // 内容为空就不需要显示在界面上
        if (chatMsgEntity.text) {

            // var timeToShow = (chatMsgEntity.date ? RBChatUtils.getTimeStringAutoShort(chatMsgEntity.date, true, true)
            //     : RBChatUtils.getTimeStringAutoShort(RBChatUtils.getCurrentUTCTimestamp(), true, true));

            var timeToShow = this.constructTimeStringForChatItem(chatMsgEntity.date);

            // 插入一条系统消息显示到消息面板上
            if (chatMsgEntity.msgType == MsgType.TYPE_SYSTEAM$INFO) // 群聊系统指令的ui是单独的样式
                this.insertChatItemForSysteminfo(chatMsgEntity.text, timeToShow, needPrepend);
            else if (chatMsgEntity.msgType == MsgType.TYPE_REVOKE)
                this.insertChatItemForRevoked(chatMsgEntity.text, timeToShow, needPrepend);
            // 插入一条普通聊天消息显示到消息面板上
            else {
                // this.insertChatItem(
                //     chatMsgEntity.uid
                //     , chatMsgEntity.msgType
                //     , (isme?'':chatMsgEntity.name)
                //     , timeToShow
                //     , chatMsgEntity.text
                //     , chatMsgEntity.fingerPrintOfProtocal
                //     , chatMsgEntity.fingerPrintOfParent
                //     , isme
                //     , needPrepend);

                this.insertChatItem(chatMsgEntity, timeToShow, isme, needPrepend, scrollBottom);
            }
        }
    };

    /**
     * 显示领取成功ui
     * @param {*} res 
     */
    UIModule5.prototype.showRedPckUI = function (res, redInfo, entityData) {
        var that = this;
        var popupId = "im-panel-msg-popupmenu";
        var oldPopupObj = $("#" + popupId);
        // 如果已经存在则先删除之（jq里选择器选回对象的Length>0表示该元素是存在的）
        if (oldPopupObj.length > 0)
            oldPopupObj.remove();

        const show_t = GroupsProvider.getMickNameInGroup(redInfo.nickname, entityData.nickname_ingroup).substr(0, 1).toUpperCase();

        window.redp = function (obj) {
            const defaultColor = RBChatUtils.getBgColor(redInfo.userId)
            obj.parent().children().eq(0).css('background', defaultColor)
            obj.parent().children().eq(0).text(show_t)
            obj.remove()
        }


        var html_ =
            '<div id="' + popupId + '" style="display: none;">'
            + '   <div  id=\'redpck-show-chai\'  class=\'redpck-show-chai-root\'>'
            + '         <div  id=\'redpck-show-result\' class=\'redpck-show-c\' >'
            + '                 <div class=\'redpck-row-11\'> <div></div> <img onerror=\'javascript:redp($(this))\' src=\'' + RBChatUtils.getUserAvatarDownloadURL(redInfo.userId, false) + '\'/></div>'
            + '                 <div class=\'redpck-row-12\'>' + redInfo.nickname + '的红包</div>'
            + '                 <div class=\'redpck-row-13\' >' + redInfo.description + '</div>'
            + '                 <div class=\'redpck-row-14\'><img src=\'/images/r-p-c-s.png\'  id=\'redpck-row-14\' /></div>'
            + '          </div>'
            + '          <img src=\'/images/red-close.png\' class=\'redpck-show-chai-close\' id=\'redpck-show-chai-close-c\'/>'
            + '    </div>'
            + '   <div  id=\'redpck-show-chai-root\'  class=\'redpck-show-chai-root\' style="display: none;">'
            + '         <div  id=\'redpck-show-result\' class=\'redpck-show-result\' >'
            + '                 <div class=\'redpck-row-1\'>' + redInfo.nickname + '的红包</div>'
            + '                 <div class=\'redpck-row-2\'>¥' + res.amount + '</div>'
            + '                 <div class=\'redpck-row-3\' >' + redInfo.description + '</div>'
            + '                 <div class=\'redpck-row-4\' id=\'redpck-row-4\'>查看红包详情></div>'
            + '          </div>'
            + '          <img src=\'/images/red-close.png\' class=\'redpck-show-chai-close\' id=\'redpck-show-chai-close\'/>'
            + '    </div>'
            + '</div>';

        $(html_).appendTo('body');
        // 菜单对象
        var newPopupObj = $("#" + popupId);
        // 在鼠标点击的位置显示菜单
        newPopupObj.css("top", "20%");
        newPopupObj.css("left", RBChatUtils.isMobile() ? "10%" : "40%");
        newPopupObj.css("z-index", "999");
        newPopupObj.show();

        //关闭
        $('#redpck-show-chai-close').click(function () {
            newPopupObj.remove();
        });

        $('#redpck-show-chai-close-c').click(function () {
            newPopupObj.remove();
        });

        // 拆效果
        $('#redpck-row-14').click(function () {
            $(this).attr('src', '/images/c.gif');
            setTimeout(() => {
                $('#redpck-show-chai').hide();
                newPopupObj.css("left", RBChatUtils.isMobile() ? "" : "40%");
                $('#redpck-show-chai-root').show();
            }, 1000)
        });


        //查看领取详情
        $('#redpck-row-4').click(function () {
            newPopupObj.remove();
            var localUserUid = LocalUserInfo.getUid();
            const walletId = redInfo.walletId;
            var callBack = function (e) {
                var obj = null;
                try {
                    obj = JSON.parse(e.data)
                } catch (e) { }
                if (obj) {
                    //跳转钱包
                    if (obj.type - 0 == 2) {
                        RBChatUtils.showIFrameURL("https://chat.imnono.net/coupon/wallet.html?isWeb=1&userId=" + localUserUid, '我的钱包', callBack)
                        // 跳转客服,web 默认关闭
                    } else if (obj.type - 0 == 4) {
                        var popupId = "im-panel-msg-popupmenu";
                        var oldPopupObj = $("#" + popupId);
                        if (oldPopupObj.length > 0)
                            oldPopupObj.remove();
                    }
                }
            }
            RBChatUtils.showIFrameURL("https://chat.imnono.net/coupon/claimDetails.html??walletId=" + walletId + "&userId=" + localUserUid, '领取详情', callBack);
        });

        // setTimeout(() => {
        //     $('#redpck-show-chai').hide();
        //     $('#redpck-show-result').show();
        //     $('#redpck-show-chai-close').show();
        // }, 1400)

    }


    /**
     * 插入一条聊天消息到在线聊天的消息面板中。
     *
     * @param chatMsgEntity {ChatMsgEntity} 聊天消息数据对够用（ChatMsgEntity对象字段定义见：rbchat_cache.js文件）
     * @param showTime {String} 消息接收时间
     * @param isMe {boolean} 是否是我自已发出的消息
     * @param needPrepend {boolean} true表示插入被选元素的开头，否则插入被选元素的末尾
     */
    UIModule5.prototype.insertChatItem = function (chatMsgEntity//uid, messageType, nickName
        , showTime
        //, messageContent, fp , parentFp
        , isMe, needPrepend, scrollBottom = true) {
        var that = this;
        // {String} 消息发起者的uid
        var uid = chatMsgEntity.uid;
        // {int} 消息类型
        var messageType = chatMsgEntity.msgType;
        // {String} 昵称
        var nickName = (isMe ? '' : chatMsgEntity.name);
        // {String} 消息内容
        var messageContent = chatMsgEntity.text;
        // {String} 消息指纹码（也就消息的唯一ID），当前指纹码主要用于消息撤回、删除等功能，但无论此参数是否为null都不影响ui显示
        // {String} 父消息的指纹码，该指纹码只在群聊时有用，一对一聊天时传null即可，当前指纹码主要用于消息撤回、删除等功能，但无论此参数是否为null都不影响ui显示
        var parentFp = chatMsgEntity.fingerPrintOfParent;

        var fp = chatMsgEntity.fingerPrintOfProtocal ? chatMsgEntity.fingerPrintOfProtocal : parentFp;


        var html = "";

        var red_obj = null;


        // TODO  以下按协议类型进行的区分逻辑，进一步要来实现哦！！！！！

        // 普通的聊天消息
        //else
        {
            // 将聊天消息中的表情占位符替换成HTML的img元素，便能在消息气泡里显示表情图标
            if (messageType - 0 != 10 && messageType - 0 != 11 && messageType - 0 != 9 && messageType - 0 != 12 && messageType - 0 != 13) {
                messageContent = this.replaceEmojiPlaceholderToHTML(messageContent);
            }
            messageContent = messageContent.replace(new RegExp('\n', 'g'), '<br>');
            messageContent = messageContent.replace(/[\r|\t]/g, "")
            // 按messageType来区别是图片消息、文本消息
            var contentHTML = "";
            var cssExtra = null;

            // 多视频和多图片
            if (messageType - 0 == 13) {
                const obj = JSON.parse(messageContent);
                let file_html = ''
                file_html = RBChatUtils.draw_mul_pic(obj.files,obj.type == 1)
                contentHTML = "<div class='mul-img-send'><div class='row-1'>" + file_html + "</div>" +
                    (obj.text && obj.text.length > 0 ?"<div class='row-2'>" + obj.text + "</div>":"") +
                    "</div>"
            }
            // @消息
            else if (messageType - 0 == 12) {
                try {
                    const obj = JSON.parse(messageContent);
                    const select_obj = obj.select_obj;
                    var origin_text = obj.origin_text;
                    select_obj.forEach(item => {
                        const l = '@' + item.nickname
                        origin_text = origin_text.replace(new RegExp(l, 'g'), "<font color='#28a0ff'>" + l + "</font>")
                    })
                    contentHTML = this.replaceEmojiPlaceholderToHTML(origin_text);
                    if (contentHTML)
                        contentHTML = contentHTML.replace(new RegExp('\n', 'g'), '<br>');

                } catch (e) {
                    console.log('解析报错的@消息', messageContent)
                }
            }
            //小程序消息
            else if (messageType - 0 == 9) {

                var phoneCss = '';
                if (RBChatUtils.isMobile()) {
                    phoneCss = "style='min-width: auto !important'"
                }

                const obj = JSON.parse(messageContent);
                contentHTML = "<div class='minapp-root' " + phoneCss + " onclick=\"javascript:minappJump('" + obj.appletUrl + "','" + obj.appletId + "')\">" +
                    "<div class='minapp-root-top'>" +
                    "<img src='" + obj.appletImage + "'/> <span>" + obj.appletTitle + "</span>" +
                    "</div>" +
                    "<div class='minapp-root-bottom'>" +
                    "[小程序]" + obj.appletName +
                    "</div>" +
                    "</div>"
                // 红包消息
            } else if (messageType - 0 == 10) {
                try {
                    red_obj = JSON.parse(messageContent)
                } catch (e) { }
                if (red_obj) {

                    var phoneCss = '';
                    if (RBChatUtils.isMobile()) {
                        phoneCss = "style='min-width: auto !important'"
                    }

                    contentHTML = "<div class='redpck-root' " + phoneCss + "  id='" + red_obj.walletId + "_id_clck'>" +
                        "<div class='redpck-top' id='" + red_obj.walletId + "_redpck_root'> <img src='/images/redpck.png'/> <div class='redpck-top-right'><span>" + this.replaceEmojiPlaceholderToHTML(red_obj.description) + "</span><p id='" + red_obj.walletId + "_status_text'>" + (red_obj.status - 1 == 0 ? '待领取' : '已领取') + "</p></div></div>" +
                        "<div class='redpck-bottom'><span>元友红包</span><p>" + red_obj.amount + "元</p> </div>" +
                        "</div>"
                } else {
                    contentHTML = '[暂不支持该消息]'
                }
            }
            // 回复消息
            else if (messageType - 0 == 11) {
                var obj = null
                try {
                    obj = JSON.parse(messageContent)
                    obj.from.text = this.replaceEmojiPlaceholderToHTML(obj.from.text)
                    obj.to.text = this.replaceEmojiPlaceholderToHTML(obj.to.text)
                } catch (e) { }

                // 获取右边文字提示
                var getText_htmle = function (messageType, text) {
                    if (messageType == MsgType.TYPE_IMAGE) {
                        return '图片消息'
                    }
                    if (messageType == MsgType.TYPE_VOICE) {
                        return '语音消息'
                    }
                    if (messageType == 9) {
                        return '小程序消息'
                    }
                    if (messageType == 10) {
                        return '红包消息'
                    }
                    if (messageType == MsgType.TYPE_FILE) {
                        return '文件消息'
                    }
                    if (messageType == MsgType.TYPE_SHORTVIDEO) {
                        return '视频消息'
                    }
                    if (messageType == messageType == MsgType.TYPE_CONTACT) {
                        return '名片消息'
                    }
                    if (messageType == MsgType.TYPE_TEXT) {
                        return text;
                    }
                    return '';
                }
                // 获取左边
                var left_htmle = function (messageType, text) {
                    if (messageType == MsgType.TYPE_IMAGE) {
                        return "<img src='" + RBChatUtils.getImageDownloadURL(text, false) + '?imageView2/2/w/150' + "'/>"
                    }
                    return ''
                }
                // 复制uiui
                $('#im-panel-main-chat-replay-ui').empty();
                if (obj) {
                    var left_html = left_htmle(obj.from.msgType, obj.from.text);
                    var text_html = getText_htmle(obj.from.msgType, obj.from.text);
                    contentHTML = "<div class='reply-msg-root'>"
                        + "                  <div class='replay-root left-border' id='replay-root-msg-click-" + fp + "'>"
                        + "                      <div class='replay-left'> " + left_html + "</div>"
                        + "                      <div class='replay-right'> "
                        + "                          <span>" + obj.from.name + "</span> <p class='msg-width'>" + text_html + "</p>  "
                        + "                        </div>"
                        + "                   </div>"
                        + "                   <div class='reply-msg-text'>"
                        + obj.to.text
                        + "                   </div>"
                        + "                </div>"
                } else {
                    contentHTML = '[暂不支持该消息]'
                }
                // 图片消息的显示逻辑处理
            } else if (messageType == MsgType.TYPE_IMAGE) {
                // 切换ui
                window.imgSwiperListUI = function (url) {
                    var beyongDataId = window.openBeyongDataId;
                    var list = (window.openGroupChattingType ? GroupChattingCache.getChatCache(beyongDataId) : SingleChattingCache.getChatCache(beyongDataId));
                    var imgList = []
                    list.filter(item => item.msgType == MsgType.TYPE_IMAGE || item.msgType == 13).forEach(item => {
                        if (item.msgType == MsgType.TYPE_IMAGE) {
                            const i_url = item.text.indexOf('http')!=-1?item.text:RBChatUtils.getImageDownloadURL(item.text, false);
                            imgList.push(i_url)
                        } else {
                            if (item.msgType == 13) {
                                const obj = JSON.parse(item.text);
                                if (obj.type == 0) {
                                    var list = obj.files.map(item => {
                                        return RBChatUtils.getImageDownloadURL(item.fileMd5, false)
                                    })
                                    imgList = imgList.concat(list)
                                }
                            }
                        }
                    })
                    RBChatUtils.imgListSwiper(imgList, imgList.indexOf(url))
                }
                var img_url = messageContent.indexOf('http')!=-1?messageContent:RBChatUtils.getImageDownloadURL(messageContent, false)
                contentHTML =
                    "<a target=\"_blank\" href=\"javascript:void(0)\" onclick=\"javascript:imgSwiperListUI('" + img_url + "');return false\">" +
                    "   <img class=\"msg-image\" src=\"" + img_url + '?imageView2/2/w/150' + "\">" +
                    "</a>";
                cssExtra = (isMe ? "chat-info_ex_lightbg_r " : "chat-info_ex_lightbg_l ") + "chat-info_imagemsg";
            }
            // 语音留言消息的显示逻辑处理
            else if (messageType == MsgType.TYPE_VOICE) {
                contentHTML =
                    "<audio src=\"" + RBChatUtils.getVoiceDownloadURL(messageContent, false) + "\" preload=\"metadata\" controls=\"controls\"></audio>";
                cssExtra = "chat-info_voicemsg";
            }
            // 大文件消息的显示逻辑处理
            else if (messageType == MsgType.TYPE_FILE) {
                // 大文件消息的messageContent中存放的就是FileMeta对象
                // （详见创建代码：rbchat_cache.js中的createChatMsgEntity_COME_FILE(..)函数）
                var fileMeta = JSON.parse(messageContent);

                // 文件名
                var fileName = fileMeta.fileName;
                // 文件md5码
                var fileMd5 = fileMeta.fileMd5;
                // 文件大小
                var fileLength = fileMeta.fileLength;

                var httpDownloadURL = RBChatUtils.getBigFileDownloadURL(fileMd5, fileName);
                var imgUrl = FILE_ICON_DIR + this.getBigFileIcon(fileName);

                contentHTML =
                    "<a href=\"" + httpDownloadURL + "\" class=\"chat-msg-file-pic\">" +
                    "   <img src=\"" + imgUrl + "\" title='" + fileName + "'>" +
                    "</a>" +
                    "<div class=\"chat-msg-file-info\">" +
                    "   <h4 title='" + fileName + "'>" + fileName + "</h4>" +
                    "   <p><a href=\"" + httpDownloadURL + "\"><span>" + RBChatUtils.getConvenientFileSize(fileLength, 100) + "</span></a></p>" +
                    "</div>" +
                    // 自已发出的大文件消息就不需要显示这个“下载图标”了
                    (isMe ? "" :
                        "<div class=\"chat-msg-file-down\">" +
                        "   <a href=\"" + httpDownloadURL + "\" title='" + fileName + "'></a>" +
                        "</div>"
                    );

                cssExtra = (isMe ? "chat-info_ex_lightbg_r " : "chat-info_ex_lightbg_l ") + "chat-info_bigfilemsg";
            }
            // 短视频消息的显示逻辑处理
            else if (messageType == MsgType.TYPE_SHORTVIDEO) {

                // 大文件消息的messageContent中存放的就是FileMeta对象
                // （详见创建代码：rbchat_cache.js中的createChatMsgEntity_COME_SHORTVIDEO(..)函数）
                var fileMeta = JSON.parse(messageContent);
                // console.log('fileMeta',chatMsgEntity)
                if(fileMeta.isMovie){
                    var httpDownloadURL = fileMeta.movieUrl;
                    var picUrl = fileMeta.movieCoverUrl;
                    var durationString = fileMeta.durationString;
                    contentHTML =
                        "<a  href=\"javascript:void(0)\" onclick=\"javascript:videoSwiperListUI('" + httpDownloadURL + "');return false;\">" +
                        // 视频预览图片
                        "   <img class=\"chat-msg-video-thumbimg\" src=\"" + picUrl + "\">" +
                        // 视频播放图标
                        "   <img class=\"chat-msg-video-playicon\" src=\"images/common_short_video_player_continue_play_ico_nor.png\">" +
                        "   <span class=\"chat-msg-video-info\">" + durationString + "</span>" +
                        "</a>";
                    cssExtra = (isMe ? "chat-info_ex_lightbg_r " : "chat-info_ex_lightbg_l ") + "chat-info_shortvideomsg";
                }else{
                     // 文件名
                    var fileName = fileMeta.fileName;
                    // 文件md5码
                    var fileMd5 = fileMeta.fileMd5;
                    // 文件大小
                    var fileLength = fileMeta.fileLength;

                    var httpDownloadURL = RBChatUtils.getShortVideoDownloadURL(fileName, fileMd5);
                    // 视频的时长在文件名里就可以取到
                    var duration = RBChatUtils.getDurationFromVoiceFileName(fileName);
                    var durationHuman = RBChatUtils.getMMSSFromSS(duration);
                
                    contentHTML =
                        "<a  href=\"javascript:void(0)\" onclick=\"javascript:videoSwiperListUI('" + httpDownloadURL + "');return false;\">" +
                        // 视频预览图片
                        "   <img class=\"chat-msg-video-thumbimg\" src=\"" + httpDownloadURL + '?ci-process=snapshot&time=0.01' + "\">" +
                        // 视频播放图标
                        "   <img class=\"chat-msg-video-playicon\" src=\"images/common_short_video_player_continue_play_ico_nor.png\">" +
                        "   <span class=\"chat-msg-video-info\">" + durationHuman + "</span>" +
                        "</a>";
                    cssExtra = (isMe ? "chat-info_ex_lightbg_r " : "chat-info_ex_lightbg_l ") + "chat-info_shortvideomsg";
                }

               
            }
            // 名片消息的显示逻辑处理
            else if (messageType == MsgType.TYPE_CONTACT) {

                // 名片消息的messageContent中存放的就是ContactMeta对象
                // （详见创建代码：rbchat_cache.js中的createChatMsgEntity_COME_CONTACT(..)函数）
                var contactMeta = JSON.parse(messageContent);

                // 名片用户的uid
                var theUid = contactMeta.uid;
                // 名片用户的昵称
                var theNickname = contactMeta.nickName;

                contentHTML =
                    "<a href=\"javascript:void(0);\" class=\"chat-msg-contact-pic\" onclick=\"javascript:RBChatDialogHelper.showUserInfoFromServer(false, null, " + theUid + ", null);return false;\">" +
                    "    <img src=\"" + RBChatUtils.getUserAvatarDownloadURL(theUid, false) + "\" title=\"点击查看[" + theNickname + "]的名片信息！\"/>" +
                    "</a>" +
                    "<div class=\"chat-msg-contact-info\">" +
                    "    <h4 title=\"[" + theNickname + "]的名片\">" + theNickname + "</h4>" +
                    "    <p><span>UID: " + theUid + "</span></p>" +
                    "</div>" +
                    "<div class=\"chat-msg-contact-down\">" +
                    "    <a href=\"#\" title=\"点击查看" + theNickname + "的名片信息！\" onclick=\"javascript:RBChatDialogHelper.showUserInfoFromServer(false, null, " + theUid + ", null);return false;\"></a>" +
                    "</div>" +
                    "<div class=\"chat-msg-contact-bottom\">" +
                    "    <span>个人名片</span>" +
                    "</div>";

                cssExtra = (isMe ? "chat-info_ex_lightbg_r " : "chat-info_ex_lightbg_l ") + "chat-info_contactmsg";
            }
            // 位置消息的显示逻辑处理
            else if (messageType == MsgType.TYPE_LOCATION) {

                // 名片消息的messageContent中存放的就是LocationMeta对象
                // （详见创建代码：rbchat_cache.js中的createChatMsgEntity_COME_LOCATION(..)函数）
                var locationMeta = JSON.parse(messageContent);

                // 位置主描述
                var locationTitle = locationMeta.locationTitle;
                // 位置详细描述
                var locationContent = locationMeta.locationContent;
                // 经度
                var longitude = locationMeta.longitude;
                // 纬度
                var latitude = locationMeta.latitude;

                // 注意：onclick中的js函数参数无法直接传locationMeta对象，所以只能先传单参，再到函数中组合成LocationMeta对象
                contentHTML =
                    "<a href=\"javascript:void(0);\" class=\"chat-msg-location-pic\" onclick=\"javascript:RBChatDialogHelper.showLocationViewDialog(\'" + locationTitle + "\',\'" + locationContent + "\'," + longitude + "," + latitude + ");return false;\">" +
                    "    <img class=\"chat-msg-location-pic-contentimg\" src=\"" + RBChatUtils.getLocationPreviewImgDownloadURL(longitude, latitude) + "\" title=\"经度：" + longitude + ", 纬度：" + latitude + "\">" +
                    "    <img class=\"chat-msg-location-pic-flagimg\" src=\"../images/chatting_location_current_pin_medium_icon.png\">" +
                    "</a>" +
                    "<div class=\"chat-msg-location-info\"><h4>" + locationTitle + "</h4>" +
                    "    <p><span>" + locationContent + "</span></p>" +
                    "</div>";

                cssExtra = (isMe ? "chat-info_ex_lightbg_r " : "chat-info_ex_lightbg_l ") + "chat-info_locationmsg";
            }
            else if (messageType == MsgType.TYPE_GIFT$GET || messageType == MsgType.TYPE_GIFT$SEND) {
                contentHTML = "[不支持礼物消息，请在APP产品中打开]";
            }
            else {
                contentHTML = messageContent;
                // var regexp = /(http:\/\/|https:\/\/)((\w|=|\?|\.|\/|\&|-)+)/g;
                // contentHTML = contentHTML.replace(regexp, function($url){
                //     return "<a href='" + $url + "' target='_blank'>" + $url + "</a>";
                // });
                if (contentHTML)
                    contentHTML = contentHTML.replace(new RegExp('\n', 'g'), '<br>');
            }

            contentHTML = RBChatUtils.translate_minapp(contentHTML)

            const show_t = nickName.length > 0 ? nickName.substr(0, 1).toUpperCase() : '';
            const aurl = chatMsgEntity.user_photo && chatMsgEntity.user_photo.length > 0 ? chatMsgEntity.user_photo: RBChatUtils.getUserAvatarDownloadURL(uid, false);
            const defaultColor = RBChatUtils.getBgColor(uid)

            window.fnotFound = function (obj, uid) {
                obj.parent().children().eq(0).css('background', defaultColor)
                obj.remove()
            }

            // 判断 需要显示的vip
            var level_html = '';
            if (!RBChatUtils.isMobile()) {
                if (chatMsgEntity.mlevel && chatMsgEntity.mlevel - 0 > -1) {
                    level_html = level_html + "<span class='level-name m-right'>" + RBChatUtils.leveName(chatMsgEntity.mlevel) + "</span>";
                }
                if (chatMsgEntity.payDate && chatMsgEntity.payDate.length > 0) {
                    level_html = level_html + "<span class='m-right'><font color='red'>" + RBChatUtils.dateDiff(chatMsgEntity.nowTime, chatMsgEntity.payDate) + "</font>未存款 </span>"
                }

                if (chatMsgEntity.cmoney && chatMsgEntity.cmoney.length > 0) {
                    level_html = level_html + "<span class='m-right'><font color='black'>" + RBChatUtils.formatMoney(chatMsgEntity.cmoney) + "</font></span>"
                }
            }

            // 打开的是群信息
            let usr_dom = "        <img onerror='javascript:fnotFound($(this)," + uid + ")' title='" + (isMe ? "点击头像，查看我的个人信息" : "点击头像，查看用户信息") + "' src=\'" + aurl + "\' onclick='javascript:RBChatDialogHelper.showUserInfoFromServer(false, null, " + uid + ", null," + !isMe + ");'>"
            let fp_id = fp ? fp : parentFp;
            // 准备好在线用户的html
            html =
                "<div  id=\'" + fp_id + "\'" + (parentFp ? " parentfp=\'" + parentFp + "\'" : "") + " class=\'chat-item\'>"
                + "    <div class=\'chat-item-avatar " + (isMe ? "chat-item-avatar-r" : "chat-item-avatar-l") + "\'>"
                + "    <div onclick='javascript:RBChatDialogHelper.showUserInfoFromServer(false, null, " + uid + ", null," + !isMe + ");' style='background:"+defaultColor+"'>" + show_t + " </div>"
                + usr_dom
                + "    </div>"
                + "    <div class=\'" + (isMe ? 'chat-right' : 'chat-left') + "\'>"
                + "        <div class=\'chat-item-info\'>"
                + (isMe ? "" : level_html)
                + "          <span class=\'name\'> " + nickName + (isMe ? '' : ' -') + "</span>"
                + "           <span class=\'name\' title=\'" + nickName + "\'></span>"
                + "           <time>" + showTime + "</time>"
                + "        </div>"
                + "        <div " + (fp ? "id=\'chat_info_content_" + fp + "\'" : "") + " class=\'chat-info " + (cssExtra ? ' ' + cssExtra : '') + "\'>" + contentHTML + "</div>"
                + (isMe ? "<div class=' chat-info-unread " + (chatMsgEntity.redStatus - 0 == 1 ? "chat-info-read" : "") + "' time=" + chatMsgEntity.date + ">已读" : "")
                + "    </div></div>"
                + "</div>";

        }

        // 无条件尝试清除空数据UI的显示（该UI只应在没有聊天数据时显示）
        this.clearChatPaneEmpty();

        // 添加到消息界面
        if (needPrepend)
            this.$chatBoxContent.prepend(html); // 插入被选元素的开头
        else
            this.$chatBoxContent.append(html);  // 插入被选元素的末尾

        // 红包点击事件
        if (red_obj) {
            $("#" + red_obj.walletId + "_id_clck").click(function () {
                // 点击领取红包
                var localUserUid = LocalUserInfo.getUid();
                //领取红包详情
                RBChatRestHelper.recWalletIdFromServer(fp, window.groupInfo.g_id, red_obj.walletId, localUserUid, window.groupInfo.g_name
                    , function (returnValue) {
                        //
                        let redobJ = null;
                        try {
                            redobJ = JSON.parse(returnValue);
                            //领取成功
                            if (redobJ.retCode - 0 == 0) {
                                that.showRedPckUI(redobJ.data, red_obj, chatMsgEntity);
                                //已领取过
                            } else if (redobJ.retCode - 0 == 1001 || redobJ.retCode - 0 == 1003) {
                                var callBack = function (e) {
                                    var obj = null;
                                    try {
                                        obj = JSON.parse(e.data)
                                    } catch (e) { }
                                    if (obj) {
                                        //跳转钱包
                                        if (obj.type - 0 == 2) {
                                            var localUserUid = LocalUserInfo.getUid();
                                            RBChatUtils.showIFrameURL("https://chat.imnono.net/coupon/wallet.html?isWeb=1&userId=" + localUserUid, '我的钱包', callBack)
                                            //客服
                                        } else if (obj.type - 0 == 4) {
                                            var popupId = "im-panel-msg-popupmenu";
                                            var oldPopupObj = $("#" + popupId);
                                            if (oldPopupObj.length > 0)
                                                oldPopupObj.remove();
                                        }
                                    }
                                }
                                const walletId = red_obj.walletId;
                                const url = "https://chat.imnono.net/coupon/claimDetails.html?walletId=" + walletId + "&userId=" + localUserUid;
                                RBChatUtils.showIFrameURL(url, '领取详情', callBack)
                            } else {
                                alert(redobJ.errorMsg);
                            }
                        } catch (e) { }
                    }
                    , function (errorThrownStr) {
                        //alert('首页历史"消息"列表数据读取出错，原因是：'+errorThrownStr);
                        RBChatDialogHelper.showAlertDialog_WARN('加载失败', '首页历史"消息"列表数据加载出错，可能是网络故障，请稍后再试！');
                    }
                );
            });
        }

        // 回复点击
        const replyMsgClick = $('#replay-root-msg-click-' + fp)
        if (replyMsgClick) {
            //回复点击事件
            replyMsgClick.click(function () {
                const c = JSON.parse(messageContent)
                const fp = c.from.fingerPrintOfProtocal;
                // 自动滚动到聊天的位置
                if (fp && $('#' + fp)) {
                    const mainContainer = $('#im-panel-main-chatcontentpane-wrap');
                    const scrollToContainer = $('#' + fp)
                    console.log('scrollToContainer', scrollToContainer.offset().top)
                    mainContainer.scrollTop(
                        scrollToContainer.offset().top - mainContainer.offset().top + mainContainer.scrollTop()
                    );
                    scrollToContainer.addClass('show-my-tip-select')
                    setTimeout(() => {
                        scrollToContainer.removeClass('show-my-tip-select')
                    }, 1500)
                }
            })

        }


        // 为消息添加右键菜单
        this.constructPopupMenuForChatItem(messageType, chatMsgEntity, fp);

        // 显示在可视区
        // if(scrollBottom){
        //     this.scrollToBottom4IM();
        // }

    };


    UIModule5.prototype.insertChatItem2 = function (chatMsgEntity, content_dom, id) {
        var that = this;
        var uid = chatMsgEntity.userId;
        // {int} 消息类型
        var messageType = chatMsgEntity.msgType;
        // {String} 消息内容
        var messageContent = chatMsgEntity.msgContent;
        // {String} 消息指纹码（也就消息的唯一ID），当前指纹码主要用于消息撤回、删除等功能，但无论此参数是否为null都不影响ui显示
        // {String} 父消息的指纹码，该指纹码只在群聊时有用，一对一聊天时传null即可，当前指纹码主要用于消息撤回、删除等功能，但无论此参数是否为null都不影响ui显示
        var parentFp = chatMsgEntity.parent_fp;
        var fp = chatMsgEntity.fingerprint ? chatMsgEntity.fingerprint : parentFp;
        var html = "";
        var red_obj = null;
        var myUserId = LocalUserInfo.getUid();
        var isMe = uid - myUserId == 0

        // TODO  以下按协议类型进行的区分逻辑，进一步要来实现哦！！！！！

        // 普通的聊天消息
        //else
        {
            // 将聊天消息中的表情占位符替换成HTML的img元素，便能在消息气泡里显示表情图标
            if (messageType - 0 != 10 && messageType - 0 != 11 && messageType - 0 != 9 && messageType - 0 != 12 && messageType - 0 != 13) {
                messageContent = this.replaceEmojiPlaceholderToHTML(messageContent);
            }

            // 按messageType来区别是图片消息、文本消息
            var contentHTML = "";
            var cssExtra = null;

            // 多视频和多图片
            if (messageType - 0 == 13) {
                const obj = JSON.parse(messageContent);
                let file_html = ''
                let text_style = ''
                if (obj.type == 0) {
                    var style = ''
                    if (obj.files.length == 1) {
                        style = "style='height:200px'"
                    }
                    if (obj.files.length == 2) {
                        style = "style='height:180px'"
                    }
                    file_html = obj.files.map(item => {
                        return "<div class='item' " + style + "> <img src='" + RBChatUtils.getImageDownloadURL(item.fileMd5, false) + "?imageView2/2/w/150" + "' " + style + "/></div>"
                    }).join('')
                } else {
                    var style = "style='max-width:120px'"
                    if (obj.files.length == 1) {
                        style = "style='height:200px;max-width:120px'"
                    }
                    if (obj.files.length == 2) {
                        style = "style='height:180px;max-width:120px'"
                    }
                    file_html = obj.files.map(item => {
                        return "<div class='item' " + style + "><img src='" + RBChatUtils.getImageDownloadURL(item.fileMd5, false) + "?ci-process=snapshot&time=0.01" + "' " + "' " + style + "/> <img class='play' src='images/common_short_video_player_continue_play_ico_nor.png'/></div>"
                    }).join('')
                }
                if (obj.files.length > 3) {
                    text_style = "style='max-width:360px'"
                } else {
                    text_style = "style='max-width:" + (obj.files.length * 120 + 49) + "px'"
                }
                contentHTML = "<div class='mul-img-send'>" +
                    "<div class='row-1'>" + file_html + "</div>" +
                    "<div class='row-2' " + text_style + ">" + obj.text + "</div>" +
                    "</div>"
            }
            // @消息
            else if (messageType - 0 == 12) {
                const obj = JSON.parse(messageContent);
                const select_obj = obj.select_obj;
                var origin_text = obj.origin_text;
                select_obj.forEach(item => {
                    const l = '@' + item.nickname
                    origin_text = origin_text.replace(new RegExp(l, 'g'), "<font color='#28a0ff'>" + l + "</font>")
                })
                contentHTML = this.replaceEmojiPlaceholderToHTML(origin_text);
                if (contentHTML)
                    contentHTML = contentHTML.replace(new RegExp('\n', 'g'), '<br>');
            }
            //小程序消息
            else if (messageType - 0 == 9) {

                var phoneCss = '';
                if (RBChatUtils.isMobile()) {
                    phoneCss = "style='min-width: auto !important'"
                }

                const obj = JSON.parse(messageContent);
                contentHTML = "<div class='minapp-root' " + phoneCss + ">" +
                    "<div class='minapp-root-top'>" +
                    "<img src='" + obj.appletImage + "'/> <span>" + obj.appletTitle + "</span>" +
                    "</div>" +
                    "<div class='minapp-root-bottom'>" +
                    "[小程序]" + obj.appletName +
                    "</div>" +
                    "</div>"
                // 红包消息
            } else if (messageType - 0 == 10) {
                try {
                    red_obj = JSON.parse(messageContent)
                } catch (e) { }
                if (red_obj) {

                    var phoneCss = '';
                    if (RBChatUtils.isMobile()) {
                        phoneCss = "style='min-width: auto !important'"
                    }

                    contentHTML = "<div class='redpck-root' " + phoneCss + "  id='" + red_obj.walletId + "_id_clck'>" +
                        "<div class='redpck-top' id='" + red_obj.walletId + "_redpck_root'> <img src='/images/redpck.png'/> <div class='redpck-top-right'><span>" + this.replaceEmojiPlaceholderToHTML(red_obj.description) + "</span><p id='" + red_obj.walletId + "_status_text'>" + (red_obj.status - 1 == 0 ? '待领取' : '已领取') + "</p></div></div>" +
                        "<div class='redpck-bottom'><span>元友红包</span><p>" + red_obj.amount + "元</p> </div>" +
                        "</div>"
                } else {
                    contentHTML = '[暂不支持该消息]'
                }
            }
            // 回复消息
            else if (messageType - 0 == 11) {
                var obj = null
                try {
                    obj = JSON.parse(messageContent)
                    obj.from.text = this.replaceEmojiPlaceholderToHTML(obj.from.text)
                    obj.to.text = this.replaceEmojiPlaceholderToHTML(obj.to.text)
                } catch (e) { }

                // 获取右边文字提示
                var getText_htmle = function (messageType, text) {
                    if (messageType == MsgType.TYPE_IMAGE) {
                        return '图片消息'
                    }
                    if (messageType == MsgType.TYPE_VOICE) {
                        return '语音消息'
                    }
                    if (messageType == 9) {
                        return '小程序消息'
                    }
                    if (messageType == 10) {
                        return '红包消息'
                    }
                    if (messageType == MsgType.TYPE_FILE) {
                        return '文件消息'
                    }
                    if (messageType == MsgType.TYPE_SHORTVIDEO) {
                        return '视频消息'
                    }
                    if (messageType == messageType == MsgType.TYPE_CONTACT) {
                        return '名片消息'
                    }
                    if (messageType == MsgType.TYPE_TEXT) {
                        return text;
                    }
                    return '';
                }
                // 获取左边
                var left_htmle = function (messageType, text) {
                    if (messageType == MsgType.TYPE_IMAGE) {
                        return "<img src='" + RBChatUtils.getImageDownloadURL(text, false) + '?imageView2/2/w/150' + "'/>"
                    }
                    return ''
                }
                // 复制uiui
                $('#im-panel-main-chat-replay-ui').empty();
                if (obj) {
                    var left_html = left_htmle(obj.from.msgType, obj.from.text);
                    var text_html = getText_htmle(obj.from.msgType, obj.from.text);
                    contentHTML = "<div class='reply-msg-root'>"
                        + "                  <div class='replay-root left-border' id='replay-root-msg-click-" + fp + "'>"
                        + "                      <div class='replay-left'> " + left_html + "</div>"
                        + "                      <div class='replay-right'> "
                        + "                          <span>" + obj.from.name + "</span> <p class='msg-width'>" + text_html + "</p>  "
                        + "                        </div>"
                        + "                   </div>"
                        + "                   <div class='reply-msg-text'>"
                        + obj.to.text
                        + "                   </div>"
                        + "                </div>"
                } else {
                    contentHTML = '[暂不支持该消息]'
                }

                // 图片消息的显示逻辑处理
            } else if (messageType == MsgType.TYPE_IMAGE) {

                contentHTML =
                    "<a target=\"_blank\" href=\"javascript:void(0)\">" +
                    "   <img class=\"msg-image\" src=\"" + RBChatUtils.getImageDownloadURL(messageContent, false) + '?imageView2/2/w/150' + "\">" +
                    "</a>";
                cssExtra = (isMe ? "chat-info_ex_lightbg_r " : "chat-info_ex_lightbg_l ") + "chat-info_imagemsg";
            }
            // 语音留言消息的显示逻辑处理
            else if (messageType == MsgType.TYPE_VOICE) {
                contentHTML =
                    "<audio src=\"" + RBChatUtils.getVoiceDownloadURL(messageContent, false) + "\" preload=\"metadata\" controls=\"controls\"></audio>";
                cssExtra = "chat-info_voicemsg";
            }
            // 大文件消息的显示逻辑处理
            else if (messageType == MsgType.TYPE_FILE) {
                // 大文件消息的messageContent中存放的就是FileMeta对象
                // （详见创建代码：rbchat_cache.js中的createChatMsgEntity_COME_FILE(..)函数）
                var fileMeta = JSON.parse(messageContent);

                // 文件名
                var fileName = fileMeta.fileName;
                // 文件md5码
                var fileMd5 = fileMeta.fileMd5;
                // 文件大小
                var fileLength = fileMeta.fileLength;

                var httpDownloadURL = RBChatUtils.getBigFileDownloadURL(fileMd5, fileName);
                var imgUrl = FILE_ICON_DIR + this.getBigFileIcon(fileName);

                contentHTML =
                    "<a href=\"" + httpDownloadURL + "\" class=\"chat-msg-file-pic\">" +
                    "   <img src=\"" + imgUrl + "\" title='" + fileName + "'>" +
                    "</a>" +
                    "<div class=\"chat-msg-file-info\">" +
                    "   <h4 title='" + fileName + "'>" + fileName + "</h4>" +
                    "   <p><a href=\"" + httpDownloadURL + "\"><span>" + RBChatUtils.getConvenientFileSize(fileLength, 100) + "</span></a></p>" +
                    "</div>" +
                    // 自已发出的大文件消息就不需要显示这个“下载图标”了
                    (isMe ? "" :
                        "<div class=\"chat-msg-file-down\">" +
                        "   <a href=\"" + httpDownloadURL + "\" title='" + fileName + "'></a>" +
                        "</div>"
                    );

                cssExtra = (isMe ? "chat-info_ex_lightbg_r " : "chat-info_ex_lightbg_l ") + "chat-info_bigfilemsg";
            }
            // 短视频消息的显示逻辑处理
            else if (messageType == MsgType.TYPE_SHORTVIDEO) {

                // 大文件消息的messageContent中存放的就是FileMeta对象
                // （详见创建代码：rbchat_cache.js中的createChatMsgEntity_COME_SHORTVIDEO(..)函数）
                var fileMeta = JSON.parse(messageContent);

                // 文件名
                var fileName = fileMeta.fileName;
                // 文件md5码
                var fileMd5 = fileMeta.fileMd5;
                // 文件大小
                var fileLength = fileMeta.fileLength;

                var httpDownloadURL = RBChatUtils.getShortVideoDownloadURL(fileName, fileMd5);

                // 视频的时长在文件名里就可以取到
                var duration = RBChatUtils.getDurationFromVoiceFileName(fileName);
                var durationHuman = RBChatUtils.getMMSSFromSS(duration);

                contentHTML =
                    "<a  href=\"javascript:void(0)\">" +
                    // 视频预览图片
                    "   <img class=\"chat-msg-video-thumbimg\" src=\"" + httpDownloadURL + '?ci-process=snapshot&time=0.01' + "\">" +
                    // 视频播放图标
                    "   <img class=\"chat-msg-video-playicon\" src=\"images/common_short_video_player_continue_play_ico_nor.png\">" +
                    "   <span class=\"chat-msg-video-info\">" + durationHuman + "</span>" +
                    "</a>";
                cssExtra = (isMe ? "chat-info_ex_lightbg_r " : "chat-info_ex_lightbg_l ") + "chat-info_shortvideomsg";
            }
            // 名片消息的显示逻辑处理
            else if (messageType == MsgType.TYPE_CONTACT) {

                // 名片消息的messageContent中存放的就是ContactMeta对象
                // （详见创建代码：rbchat_cache.js中的createChatMsgEntity_COME_CONTACT(..)函数）
                var contactMeta = JSON.parse(messageContent);

                // 名片用户的uid
                var theUid = contactMeta.uid;
                // 名片用户的昵称
                var theNickname = contactMeta.nickName;

                contentHTML =
                    "<a href=\"javascript:void(0);\" class=\"chat-msg-contact-pic\" onclick=\"javascript:RBChatDialogHelper.showUserInfoFromServer(false, null, " + theUid + ", null);return false;\">" +
                    "    <img src=\"" + RBChatUtils.getUserAvatarDownloadURL(theUid, false) + "\" title=\"点击查看[" + theNickname + "]的名片信息！\"/>" +
                    "</a>" +
                    "<div class=\"chat-msg-contact-info\">" +
                    "    <h4 title=\"[" + theNickname + "]的名片\">" + theNickname + "</h4>" +
                    "    <p><span>UID: " + theUid + "</span></p>" +
                    "</div>" +
                    "<div class=\"chat-msg-contact-down\">" +
                    "    <a href=\"#\" title=\"点击查看" + theNickname + "的名片信息！\" onclick=\"javascript:RBChatDialogHelper.showUserInfoFromServer(false, null, " + theUid + ", null);return false;\"></a>" +
                    "</div>" +
                    "<div class=\"chat-msg-contact-bottom\">" +
                    "    <span>个人名片</span>" +
                    "</div>";

                cssExtra = (isMe ? "chat-info_ex_lightbg_r " : "chat-info_ex_lightbg_l ") + "chat-info_contactmsg";
            }
            // 位置消息的显示逻辑处理
            else if (messageType == MsgType.TYPE_LOCATION) {

                // 名片消息的messageContent中存放的就是LocationMeta对象
                // （详见创建代码：rbchat_cache.js中的createChatMsgEntity_COME_LOCATION(..)函数）
                var locationMeta = JSON.parse(messageContent);

                // 位置主描述
                var locationTitle = locationMeta.locationTitle;
                // 位置详细描述
                var locationContent = locationMeta.locationContent;
                // 经度
                var longitude = locationMeta.longitude;
                // 纬度
                var latitude = locationMeta.latitude;

                // 注意：onclick中的js函数参数无法直接传locationMeta对象，所以只能先传单参，再到函数中组合成LocationMeta对象
                contentHTML =
                    "<a href=\"javascript:void(0);\" class=\"chat-msg-location-pic\" onclick=\"javascript:RBChatDialogHelper.showLocationViewDialog(\'" + locationTitle + "\',\'" + locationContent + "\'," + longitude + "," + latitude + ");return false;\">" +
                    "    <img class=\"chat-msg-location-pic-contentimg\" src=\"" + RBChatUtils.getLocationPreviewImgDownloadURL(longitude, latitude) + "\" title=\"经度：" + longitude + ", 纬度：" + latitude + "\">" +
                    "    <img class=\"chat-msg-location-pic-flagimg\" src=\"../images/chatting_location_current_pin_medium_icon.png\">" +
                    "</a>" +
                    "<div class=\"chat-msg-location-info\"><h4>" + locationTitle + "</h4>" +
                    "    <p><span>" + locationContent + "</span></p>" +
                    "</div>";

                cssExtra = (isMe ? "chat-info_ex_lightbg_r " : "chat-info_ex_lightbg_l ") + "chat-info_locationmsg";
            }
            else if (messageType == MsgType.TYPE_GIFT$GET || messageType == MsgType.TYPE_GIFT$SEND) {
                contentHTML = "[不支持礼物消息，请在APP产品中打开]";
            }
            else {
                contentHTML = messageContent;
                // var regexp = /(http:\/\/|https:\/\/)((\w|=|\?|\.|\/|\&|-)+)/g;
                // contentHTML = contentHTML.replace(regexp, function($url){
                //     return "<a href='" + $url + "' target='_blank'>" + $url + "</a>";
                // });
                if (contentHTML)
                    contentHTML = contentHTML.replace(new RegExp('\n', 'g'), '<br>');
            }
            //小程序替换


            const show_t = '';
            const aurl = chatMsgEntity.user_photo && chatMsgEntity.user_photo.length > 0 ? chatMsgEntity.user_photo: RBChatUtils.getUserAvatarDownloadURL(uid, false);

            window.fnotFound = function (obj, uid) {
                const defaultColor = RBChatUtils.getBgColor(uid)
                obj.parent().children().eq(0).css('background', defaultColor)
                obj.remove()
            }

            // 判断 需要显示的vip
            var level_html = '';
            if (!RBChatUtils.isMobile()) {
                if (chatMsgEntity.mlevel && chatMsgEntity.mlevel - 0 > -1) {
                    level_html = level_html + "<span class='level-name m-right'>" + RBChatUtils.leveName(chatMsgEntity.mlevel) + "</span>";
                }
                if (chatMsgEntity.payDate && chatMsgEntity.payDate.length > 0) {
                    level_html = level_html + "<span class='m-right'><font color='red'>" + RBChatUtils.dateDiff(chatMsgEntity.nowTime, chatMsgEntity.payDate) + "</font>未存款 </span>"
                }

                if (chatMsgEntity.cmoney && chatMsgEntity.cmoney.length > 0) {
                    level_html = level_html + "<span class='m-right'><font color='black'>" + RBChatUtils.formatMoney(chatMsgEntity.cmoney) + "</font></span>"
                }
            }

            // 打开的是群信息
            let usr_dom = "        <img onerror='javascript:fnotFound($(this)," + uid + ")' title='" + (isMe ? "点击头像，查看我的个人信息" : "点击头像，查看用户信息") + "' src=\'" + aurl + "\' onclick='javascript:RBChatDialogHelper.showUserInfoFromServer(false, null, " + uid + ", null," + !isMe + ");'>"
            // 准备好在线用户的html
            html =
                "<div  id=\'msg-d-" + id + "\'" + " class=\'chat-item\'>"
                + "    <div class=\'chat-item-avatar " + (isMe ? "chat-item-avatar-r" : "chat-item-avatar-l") + "\'>"
                + "    <div onclick='javascript:RBChatDialogHelper.showUserInfoFromServer(false, null, " + uid + ", null," + !isMe + ");'>" + show_t + " </div>"
                + usr_dom
                + "    </div>"
                + "    <div class=\'" + (isMe ? 'chat-right' : 'chat-left') + "\'>"
                + "        <div class=\'chat-item-info\'>"
                + "        </div>"
                + "        <div " + (fp ? "id=\'chat_info_content_" + fp + "\'" : "") + " class=\'chat-info " + (cssExtra ? ' ' + cssExtra : '') + "\'>" + contentHTML + "</div>"
                + (isMe ? "<div class=' chat-info-unread " + (chatMsgEntity.redStatus - 0 == 1 ? "chat-info-read" : "") + "' time=" + chatMsgEntity.date + ">已读" : "")
                + "    </div></div>"
                + "</div>";
        }
        // 添加到消息界面
        content_dom.append(html);
        // 添加右键菜单
        $("#msg-d-" + id).bind('contextmenu', function (e) {
            // 右键菜单主div层
            var popupId = "im-panel-msg-popupmenu";
            var oldPopupObj = $("#" + popupId);
            // 如果已经存在则先删除之（jq里选择器选回对象的Length>0表示该元素是存在的）
            if (oldPopupObj.length > 0)
                oldPopupObj.remove();
            // 构建菜单html内容
            var html =
                '<div id="' + popupId + '" style="display: none;">'
                + '   <div class="kchat-pop ">'
                + '       <ul>'
                + '<li id="im-panel-msg-popupmenu-cancle-msg-top">取消置顶</li>'

                + '       </ul>'
                + '   </div>'
                + '</div>';

            $(html).appendTo('body');

            // 菜单对象
            var newPopupObj = $("#" + popupId);
            var x = e.clientX;
            var y = e.clientY;
            // 在鼠标点击的位置显示菜单
            newPopupObj.css("top", y + "px");
            newPopupObj.css("left", x + "px");
            newPopupObj.css("z-index", '9999');
            newPopupObj.show();

            // 点击空白处的事件处理（希望点空白，能自动隐藏菜单层的显示）
            $("body").click(function (event) {
                newPopupObj.remove();
            });

            // 取消置顶
            $('#im-panel-msg-popupmenu-cancle-msg-top').click(function () {
                newPopupObj.remove();

                // 删除置顶消息
                var groupId = ''
                var beyongDataId = window.openBeyongDataId;
                // 群与人区分
                if (window.openGroupChattingType) {
                    groupId = beyongDataId
                } else {
                    var myId = LocalUserInfo.getUid()
                    groupId = uid - myId > 0 ? myId + '_' + uid : uid + '_' + myId
                }
                // 查询置顶消息
                RBChatRestHelper.cancle_msg_top({
                    topId: id,
                    groupId: groupId,
                }, function (returnValue) {
                    $("#msg-d-" + id).remove();
                    that.init_msg_top_ui()
                }, function () { })

            })

            return false;
        });
    };



    UIModule5.prototype.constructPopupMenuForChatItem = function (messageType, chatMsgEntity, fp) {
        $("#im-panel-main-chatcontentpane").bind('contextmenu', function (e) {
            return false;
        });

        var that = this;

        // 批量收藏图片
        var  cirlce_love_pic = function(list,callBack){
            if(list.length > 0){
                //上传收藏
                RBChatRestHelper.add_love_face(list[0], function () {
                    //移除当前元素
                    list.splice(0, 1)
                    cirlce_love_pic(list,callBack)

                }, null)
            }else{
                if(callBack) callBack()
            }
        }

        var deal_context_menu = function (e, is_forbid = false) {
            // 当前正在处于选中（打开）状态的聊天类型等信息
            var currentSelectedAlarmType = RBChatMainUI.getCurrentSelectedAlarmType();
            var currentSelectedAlarmDataId = RBChatMainUI.getCurrentSelectedAlarmDataId();

            // 聊天模式
            var currentChatType = -1;
            // 聊天id（单聊时是对方的uid、群聊是gid）
            var currentChatId = currentSelectedAlarmDataId;

            // 根据打开的聊天界面类型，匹配对应的聊天模式
            if (currentSelectedAlarmType == AlarmMessageType.reviceMessage) {
                currentChatType = ChatModeType.CHAT_TYPE_FRIEND$CHAT;
            } else if (currentSelectedAlarmType == AlarmMessageType.tempChatMessage) {
                currentChatType = ChatModeType.CHAT_TYPE_GUEST$CHAT;
            } else if (currentSelectedAlarmType == AlarmMessageType.groupChatMessage) {
                currentChatType = ChatModeType.CHAT_TYPE_GROUP$CHAT;
            } else {
                RBChatUtils.logToConsole_DEBUG("【消息右键】当前右键对应的currentSelectedAlarmType=" + currentSelectedAlarmType
                    + "、currentSelectedAlarmDataId，但无法找到对应和currentChatType，不是有效的聊天类型！");
            }

            RBChatUtils.logToConsole_DEBUG("【消息右键】当前右键对应的currentSelectedAlarmType=" + currentSelectedAlarmType
                + "、currentSelectedAlarmDataId=" + currentSelectedAlarmDataId + "，对应于currentChatType=" + currentChatType);

            if (currentChatType == -1)
                return;

            // 右键菜单主div层
            var popupId = "im-panel-msg-popupmenu";
            var oldPopupObj = $("#" + popupId);
            // 如果已经存在则先删除之（jq里选择器选回对象的Length>0表示该元素是存在的）
            if (oldPopupObj.length > 0)
                oldPopupObj.remove();

            // 菜单可视与否
            var canCopy = (messageType == MsgType.TYPE_TEXT);
            var canRevoke = that.messageCanBeRevoke(currentChatType, chatMsgEntity, currentChatId);
            var canDelete = chatMsgEntity.isOutgoing; // 默认情况下只能删除自已发出的消息

            // 判断是否可复制图片
            var canCopyPic = (messageType == MsgType.TYPE_IMAGE);
            // 多图支持复制图片
            if(messageType == 13){
                const obj = JSON.parse(chatMsgEntity.text);
                if(obj.type == 0){
                    canCopyPic = true;
                }
            }
            var canreply = (messageType != MsgType.TYPE_CONTACT)
            // 判断是否可转发  红包消息和回复消息不可转发
            var canForward = messageType != 10 && messageType != 11;


            var canForBid = false;
            var canMsgTop = false;
            // 群聊时，群主可删除自已的和群员发出的消息
            var isGroupChat = (currentChatType == ChatModeType.CHAT_TYPE_GROUP$CHAT);
            if (isGroupChat) {
                // 群主和管理可以撤回、删除消息
                canDelete = GroupsProvider.isThisGroupOwner(currentChatId) || window.groupInfo && window.groupInfo.manage_mark - 0 == 1;
                canRevoke = GroupsProvider.isThisGroupOwner(currentChatId) || window.groupInfo && window.groupInfo.manage_mark - 0 == 1;
                canForBid = GroupsProvider.isThisGroupOwner(currentChatId) || window.groupInfo && window.groupInfo.manage_mark - 0 == 1;
                canMsgTop = GroupsProvider.isThisGroupOwner(currentChatId) || window.groupInfo && window.groupInfo.manage_mark - 0 == 1
            } else {
                canMsgTop = true;
            }

            // 构建菜单html内容
            var html =
                '<div id="' + popupId + '" style="display: none;">'
                + '   <div class="kchat-pop ">'
                + '       <ul>'
                + (canForBid ? '    <li id="im-panel-msg-popupmenu-forbid">' + (is_forbid ? '取消禁言' : '禁言') + '</li>' : '')
                + (canreply ? '    <li id="im-panel-msg-popupmenu-replay">回复</li>' : '')
                + (canForward ? '    <li id="im-panel-msg-popupmenu-forward">转发</li>' : '')
                + (canCopy ? '    <li id="im-panel-msg-popupmenu-copy">复制内容</li>' : '')
                + (canCopyPic ? '    <li id="im-panel-msg-popupmenu-copy-pic">复制图片</li>' : '')
                + (canCopyPic ? '    <li id="im-panel-msg-popupmenu-love-pic">收藏图片</li>' : '')
                + (canRevoke ? '  <li id="im-panel-msg-popupmenu-revoke">撤回消息</li>' : '')
                + (canMsgTop ? '  <li id="im-panel-msg-popupmenu-msg-top">置顶消息</li>' : '')
                + (canDelete ? '  <li id="im-panel-msg-popupmenu-delete" ' + ((canCopy || canRevoke) ? 'style="color:#ff3532;border-top: 1px solid #eff2f6;"' : 'style="color:#ff3532;"') + '>删除消息</li>' : '')
                + '       </ul>'
                + '   </div>'
                + '</div>';

            $(html).appendTo('body');

            // 菜单对象
            var newPopupObj = $("#" + popupId);
            // 鼠标点击坐标
            // var x = e.originalEvent.x || e.originalEvent.layerX || 0;
            // var y = e.originalEvent.y || e.originalEvent.layerY || 0;
            var x = e.clientX;
            var y = e.clientY;
            // 在鼠标点击的位置显示菜单
            newPopupObj.css("top", y + "px");
            newPopupObj.css("left", x + "px");
            newPopupObj.show();

            // 点击空白处的事件处理（希望点空白，能自动隐藏菜单层的显示）
            $("body").click(function (event) {
                newPopupObj.remove();
            });

            // 置顶消息
            $('#im-panel-msg-popupmenu-msg-top').click(function () {
                newPopupObj.remove();
                var groupId = ''
                var beyongDataId = window.openBeyongDataId;
                // 群与人区分
                if (window.openGroupChattingType) {
                    groupId = beyongDataId
                } else {
                    var myId = LocalUserInfo.getUid()
                    groupId = beyongDataId - myId > 0 ? myId + '_' + beyongDataId : beyongDataId + '_' + myId
                }
                RBChatRestHelper.set_msg_top({
                    userId: LocalUserInfo.getUid(),
                    groupId: groupId,
                    srcId: chatMsgEntity.uid,
                    destId: window.openGroupChattingType ? RBChatMainUI.getCurrentSelectedAlarmDataId() :
                        (chatMsgEntity.isOutgoing ? beyongDataId : LocalUserInfo.getUid()),
                    fp: chatMsgEntity.fingerPrintOfProtocal
                }, function (res) {
                    that.init_msg_top_ui()
                }, null)
            })

            // 禁言功能
            $('#im-panel-msg-popupmenu-forbid').click(function () {
                newPopupObj.remove();
                RBChatRestHelper.set_forbid_status(chatMsgEntity.uid
                    , is_forbid ? '1' : '2', window.groupInfo.g_id, function (res) {
                    }, null)

            })

            // 转发功能
            $('#im-panel-msg-popupmenu-forward').click(function () {
                newPopupObj.remove();
                window.forWrardMsg = {...chatMsgEntity, text: chatMsgEntity.text.replace(new RegExp('<br/>', 'g'), '\n')};
                RBChatDialogHelper.showGroupForWardDialog();
            })

            // 收藏图片
            $('#im-panel-msg-popupmenu-love-pic').click(function () {
                newPopupObj.remove();
                let list_pic = [];
                if(messageType == MsgType.TYPE_IMAGE){
                    const i_url = chatMsgEntity.text.indexOf('http')!=-1?chatMsgEntity.text:RBChatUtils.getImageDownloadURL(chatMsgEntity.text, false);
                    list_pic.push(i_url);
                   
                }else if(messageType == 13){
                    const obj = JSON.parse(chatMsgEntity.text);
                    if(obj.type == 0){
                        list_pic = obj.files.map(item=>{
                            return RBChatUtils.getImageDownloadURL(item.fileMd5, false)
                        }) ;
                    }
                }
                console.log()
                if(list_pic.length > 0){
                    cirlce_love_pic(list_pic,function(){
                            //查询收藏
                            RBChatRestHelper.query_love_face(function (res) {
                                window.love_face_list = JSON.parse(res)
                                // 重新绘制界面
                                that.show_face_love_ui()
                            }, null)
                    })
                }
            })

            // 回复功能
            $('#im-panel-msg-popupmenu-replay').click(function () {
                // 获取右边文字提示
                var getText_htmle = function (messageType, text) {
                    if (messageType == MsgType.TYPE_IMAGE) {
                        return '图片消息'
                    }
                    if (messageType == MsgType.TYPE_VOICE) {
                        return '语音消息'
                    }
                    if (messageType == 9) {
                        return '小程序消息'
                    }
                    if (messageType == 10) {
                        return '红包消息'
                    }
                    if (messageType == 12) {
                        return JSON.parse(text).origin_text
                    }
                    if (messageType == MsgType.TYPE_FILE) {
                        return '文件消息'
                    }
                    if (messageType == MsgType.TYPE_SHORTVIDEO) {
                        return '视频消息'
                    }
                    if (messageType == MsgType.TYPE_TEXT) {
                        return text;
                    }
                    return '';
                }
                // 获取左边
                var left_htmle = function (messageType, text) {
                    if (messageType == MsgType.TYPE_IMAGE) {
                        return "<img src='" + RBChatUtils.getImageDownloadURL(chatMsgEntity.text, false) + '?imageView2/2/w/150' + "'/>"
                    }
                    return ''
                }
                var c = { ...chatMsgEntity };
                c.name = c.groupName || c.name;
                //是回复消息
                if (c.msgType == 11) {
                    c.msgType = 0; //转换成文本消息
                    c.text = JSON.parse(c.text).to.text;
                }
                //是回复消息
                if (c.msgType == 12) {
                    c.msgType = 0; //转换成文本消息
                    c.text = JSON.parse(c.text).origin_text;
                }
                // 设置回复
                window.replyModel = c;
                // 复制uiui
                $('#im-panel-main-chat-replay-ui').empty();
                var left_html = left_htmle(c.msgType, c.text);
                var text_html = getText_htmle(c.msgType, c.text);
                var reply_html = "<div class='replay-root'>"
                    + "                      <div class='replay-first'><img src='/images/replay-back.png'/></div>"
                    + "                      <div class='replay-left'> " + left_html + "</div>"
                    + "                      <div class='replay-right'> "
                    + "                          <span>" + c.name + "</span> <p>" + text_html + "</p>  "
                    + "                        </div>"
                    + "                      <div class='replay-close' id='replay-close'><img src='/images/replay-close.png'/></div>"
                    + "                </div>"

                $('#im-panel-main-chat-replay-ui').append(reply_html);
                $('#replay-close').click(function () {
                    window.replyModel = null;
                    $('#im-panel-main-chat-replay-ui').empty();
                    $('#im-panel-main-chat-replay-ui').hide();
                })
                $('#im-panel-main-chat-replay-ui').show();

            })

            // 为菜单项增加点击事件
            if (canCopy) {
                // 复制文本功能
                $("#im-panel-msg-popupmenu-copy").click(function (e) {
                    RBChatUtils.copyText("chat_info_content_" + fp);
                    // 取消弹出菜单的显示
                    newPopupObj.remove();
                });
            }

            if (canCopyPic) {
                // 复制文本功能
                $("#im-panel-msg-popupmenu-copy-pic").click(function (e) {
                    $('#pic-copy-input').val(JSON.stringify(chatMsgEntity)).show();
                    $('#pic-copy-input').select();
                    document.execCommand('Copy', 'false', null);
                    $('#pic-copy-input').hide();
                    // 取消弹出菜单的显示
                    newPopupObj.remove();
                });
            }
            if (canDelete) {
                // 删除功能
                $("#im-panel-msg-popupmenu-delete").click(function (e) {
                    let fpForMessage = (isGroupChat ? chatMsgEntity.fingerPrintOfParent : chatMsgEntity.fingerPrintOfProtocal);
                    that.doMessageDelete(currentChatType, fpForMessage, currentChatId, function () {
                        // 从ui界面上删除该消息
                        $("#" + fp).remove();
                    });
                    // 取消弹出菜单的显示
                    newPopupObj.remove();
                });
            }
            if (canRevoke) {
                // 消息撤回功能
                $("#im-panel-msg-popupmenu-revoke").click(function (e) {
                    console.log('点击了撤回')
                    that.doMessageRevoking(currentChatType, chatMsgEntity, currentChatId);
                    // 取消弹出菜单的显示
                    newPopupObj.remove();
                });
            }

        }

        // 添加右键菜单
        $("#" + fp).bind('contextmenu', function (e) {
            // 群 
            if (window.openGroupChattingType) {
                RBChatRestHelper.query_forbid_status(chatMsgEntity.uid
                    , window.groupInfo.g_id, function (res) {
                        console.log('禁言状态查询', res, chatMsgEntity)
                        deal_context_menu(e, res - 0 == 2)
                    }, null)
                // 个人
            } else {
                deal_context_menu(e)
            }
            // 阻止事件继续冒泡
            // e.stopPropagation();
            return false;
        });
    };

    /**
     * 插入一条系统通知（消息）到聊天内容显示面板中。
     *
     * @param sysinfo 要显示的系统通知内容（本参数可为空，为空时将不显示通知内容）
     * @param timeToShow 要显示的时间（本参数可为空，为空时将不显示时间）
     * @param needPrepend true表示插入被选元素的开头，否则插入被选元素的末尾
     */
    UIModule5.prototype.insertChatItemForSysteminfo = function (sysinfo, timeToShow, needPrepend) {
        var html = this.constructChatItemForSysteminfo(sysinfo, timeToShow);

        // 无条件尝试清除空数据UI的显示（该UI只应在没有聊天数据时显示）
        this.clearChatPaneEmpty();

        // 添加到消息界面
        if (needPrepend)
            this.$chatBoxContent.prepend(html); // 插入被选元素的开头
        else
            this.$chatBoxContent.append(html);  // 插入被选元素的末尾
    };

    /**
     * 插入一条已被标记为“已撤回”的消息到聊天内容显示面板中。
     *
     * @param sysinfo 要显示的系统通知内容（本参数可为空，为空时将不显示通知内容）
     * @param timeToShow 要显示的时间（本参数可为空，为空时将不显示时间）
     * @param needPrepend true表示插入被选元素的开头，否则插入被选元素的末尾
     */
    UIModule5.prototype.insertChatItemForRevoked = function (messageContent, timeToShow, needPrepend) {
        var html = this.constructChatItemForRevoked(messageContent, timeToShow);

        // 无条件尝试清除空数据UI的显示（该UI只应在没有聊天数据时显示）
        this.clearChatPaneEmpty();

        // 添加到消息界面
        if (needPrepend)
            this.$chatBoxContent.prepend(html); // 插入被选元素的开头
        else
            this.$chatBoxContent.append(html);  // 插入被选元素的末尾
    };

    UIModule5.prototype.constructChatItemForSysteminfo = function (sysinfo, timeToShow) {
        // 准备好html
        var html =
            '<div class="system-info">'
            ////+   sysinfo
            ////+'<span style="padding: 2px 10px 2px 10px;background: rgba(180,180,180,0.6);color: #fff; border-radius: 10px;">'+sysinfo+'</span>'
            ////+'<span style="padding: 2px 10px 2px 10px;color: #b2b2b2; border-radius: 10px;">'+sysinfo+'</span>'
            //+'  <span>'+sysinfo+'</span>'
            + '  <div>'
            + (sysinfo ? '<span>' + sysinfo + '</span>' : '')
            + (timeToShow ? '<span class="system-info-time">' + timeToShow + '</span>' : '')
            + '  </div>'
            + '</div>';
        return html;
    };

    UIModule5.prototype.constructChatItemForRevoked = function (messageContent, timeToShow) {
        if (messageContent && timeToShow) {
            // 被撤回消息的内容体是RevokedMeta对象的JSON形式
            var revokedMeta = JSON.parse(messageContent);
            var info = MessageHelper.getMessageContentPreviewForRevoked(revokedMeta, true);
            return this.constructChatItemForSysteminfo(info, timeToShow);
        }
        return null;
    };

    /**
     * 刷新一个已被标识为“已撤回”的消息的UI显示（相当于做两个动作：一是插入一条被撤回的信息显示、二是删除已被撤回消息的原始ui显示）。
     *
     * 提示：因fp的是唯一的，所以如果当前聊天已不是之前被撤回消息的聊天列表，则jq选择器查找到的元素就是空的，也就等于是变现忽略了
     * 这个ui刷新请求，而代码里，在调用方法前也就没有必要多此一举判断只有当前打开的是之前聊天列表时才调用本方法了，可以简化调用的代码。
     *
     * @param chatType {int} 聊天类型（可以是好友聊天、陌生人聊天、群聊），见 {@link ChatModeType}
     * @param message {ChatMsgEntity} 聊天消息数据对象
     */
    UIModule5.prototype.updateChatItemForRevoked = function (chatType, message) {
        var fpForMessage = (chatType == ChatModeType.CHAT_TYPE_GROUP$CHAT ? message.fingerPrintOfParent : message.fingerPrintOfProtocal);

        var $chatItemObj = null;
        if (chatType == ChatModeType.CHAT_TYPE_GROUP$CHAT) {
            // 查找自定义属性为“parentFp”的div（这是按父指纹码查找指定消息item对象的方法）
            $chatItemObj = $("div[parentfp='" + fpForMessage + "']");
        }
        else {
            // 查找指定id的div（这是按消息指纹码查找一对一聊天item对象的方法）
            $chatItemObj = $("div#" + fpForMessage);
        }

        // length>0表示通过jQuery选择器找到该元素
        if ($chatItemObj.length > 0) {
            var htmlForRevoked = RBChatChattingContentPaneUI.constructChatItemForRevoked(message.text
                , RBChatChattingContentPaneUI.constructTimeStringForChatItem(message.date));

            RBChatUtils.logToConsole_DEBUG("【消息撤回】[updateChatItemForRevoked]将用新的消息ui替换被撤回的，新htmlForRevoked=" + htmlForRevoked, true);

            //** 以下插入和删除，在ui上的效果就相当于是用新的item替换了旧的显示哦
            // 在该元素之后插入
            $chatItemObj.after(htmlForRevoked)
            // 同时删除该元素本身
            $chatItemObj.remove();
        }
    };

    /**
     * 从聊天界面UI中删除一条消息。
     *
     * @param fpForMessage {String} 消息的指纹码
     * @param isParentFp {boolean} true表示该指纹码是“父”指纹码 ，否则不是
     * @retrun true表示成功删除，否则不成功
     */
    UIModule5.prototype.deleteChatItem = function (fpForMessage, isParentFp) {
        var $chatItemObj = null;
        if (isParentFp) {
            // 查找自定义属性为“parentFp”的div（这是按父指纹码查找指定消息item对象的方法）
            $chatItemObj = $("div[parentfp='" + fpForMessage + "']");
        }
        else {
            // 查找指定id的div（这是按消息指纹码查找一对一聊天item对象的方法）
            $chatItemObj = $("div#" + fpForMessage);
        }

        // length>0表示通过jQuery选择器找到该元素
        if ($chatItemObj.length > 0) {
            // 同时删除该元素本身
            $chatItemObj.remove();
            return true;
        }

        return false;
    };

    /**
     * 将与指定用户的聊天记加载标记清空（这主要用于删除好友这样的功能中，）。
     *
     * @param uid
     */
    UIModule5.prototype.removeSingleChatHistoryCurrentPages = function (uid) {
        this.chatHistoryCurrentPagesMap.remove(uid);
    };

    /**
     * 清空聊天消息内容显示面板内容。
     */
    UIModule5.prototype.clearChatPane = function () {
        this.$chatBoxContent.empty();
    };

    /**
     * 设置聊天消息内容显示面板内容为空UI（主要用于没有聊天数据时，显示友好提示，提升体验）。
     */
    UIModule5.prototype.setChatPaneEmpty = function () {
        var emptyHTML =
            "<div id=\'im-panel-main-chatcontentpane-empty\' class=\'kchat-talk-list-empty\'>" +
            "	<i class=\'icon-talk1\' style=\'font-size: 60px;\'></i>" +
            "	<p>暂无聊天记录</p>" +
            "</div>";
        this.clearChatPane();
        this.$chatBoxContent.append(emptyHTML);
    };

    /**
     * 当前聊天消息内容显示面板中，显示的内容是否为空数据提示UI.
     *
     * @returns {boolean} true表示是，否则不是
     */
    UIModule5.prototype.isChatPaneEmptyShow = function () {
        if ($("#im-panel-main-chatcontentpane-empty").length > 0) {
            return true;
        }
        else {
            return false;
        }
    };

    /**
     * 清除当前聊天消息内容显示面板中的空数据提示UI（此UI只应显示在无聊天数据时）。
     */
    UIModule5.prototype.clearChatPaneEmpty = function () {
        if (this.isChatPaneEmptyShow()) {
            this.clearChatPane();
        }
    };

    //hide right content menu
    UIModule5.prototype.hideRightChatContent = function () {
        $('.kchat-im-panel-main').css({
            'display': 'none'
        });

        //$('.im-panel-right-main, .im-panel-right-mainImage, .im-panel-right-mainTitle').css({
        //    'display': 'block'
        //});

        d.getElementById("IM-chat-visitorName").innerHTML = "";
    };

    UIModule5.prototype.showRightChatContent = function () {
        $('.kchat-im-panel-main').css({
            'display': 'flex'
        });

        //$('.im-panel-right-mainImage, .im-panel-right-mainTitle').css({
        //    'display': 'none'
        //});
    };

    /**
     * 返回消息输入框的内容。
     *
     * @returns {*}
     * @since 2.0
     */
    UIModule5.prototype.getInputContent = function () {
        return this.$inputMessage.val();
    };

    /**
     * 消息输入框的内容是否为空。
     *
     * @returns {boolean}
     * @since 2.0
     */
    UIModule5.prototype.isInputContentEmpty = function () {
        return RBChatUtils.isStringEmpty(this.getInputContent());
    };

    /**
     * 设置消息输入框的内容。
     *
     * @param text
     * @since 2.0
     */
    UIModule5.prototype.setInputContent = function (text) {
        if (text)
            this.$inputMessage.val(text);
    };

    /**
     * 清空消息输入框内容。
     *
     * @since 2.0
     */
    UIModule5.prototype.clearInputContent = function () {
        this.$inputMessage.val("");
    };

    /**
     * 让输入框获得焦点。
     *
     * @since 2.0
     */
    UIModule5.prototype.foucusToInputContent = function () {
        // 获得焦点，方便接着输入其它内容
        if (RBChatUtils.isMobile() == 'false') {
            RBChatUtils.setTextFocus(this.$inputMessage);
        }
    };

    /**
     * 是否是“我”自已发出的消息。
     * 这是相对于“收到”的消息而言，“我”的意义只要用于界面上的消息显示逻辑中。
     *
     * @param chatMsgEntity
     * @returns {boolean}
     */
    UIModule5.prototype.isMyselfChatData4IM = function (chatMsgEntity) {
        //return (p &&　p.from == IMSDK.getLoginInfo().loginUserId) ? true : false;
        return (chatMsgEntity && chatMsgEntity.isOutgoing);
    };

    /**
     * 返回指定文件名对应的图标图片文件名。
     */
    UIModule5.prototype.getBigFileIcon = function (fileName) {
        var fileIcon = "file_type_unknow.png";
        var fileExtName = RBChatUtils.getFileExtName(fileName);

        if (fileExtName) {
            if ("xls" == fileExtName || "xlsx" == fileExtName)
                fileIcon = "file_type_excel.png";
            else if ("gif" == fileExtName)
                fileIcon = "file_type_gif.png";
            else if ("html" == fileExtName || "htm" == fileExtName)
                fileIcon = "file_type_html.png";
            else if ("jpg" == fileExtName || "jpeg" == fileExtName)
                fileIcon = "file_type_jpg.png";
            else if ("mp4" == fileExtName)
                fileIcon = "file_type_mp4.png";
            else if ("pdf" == fileExtName)
                fileIcon = "file_type_pdf.png";
            else if ("png" == fileExtName)
                fileIcon = "file_type_png.png";
            else if ("ppt" == fileExtName || "pptx" == fileExtName)
                fileIcon = "file_type_ppt.png";
            else if ("rar" == fileExtName)
                fileIcon = "file_type_rar.png";
            else if ("txt" == fileExtName)
                fileIcon = "file_type_txt.png";
            else if ("apk" == fileExtName)
                fileIcon = "file_type_apk.png";
            else if ("doc" == fileExtName || "docx" == fileExtName)
                fileIcon = "file_type_word.png";
            else if ("zip" == fileExtName
                || "7z" == fileExtName
                || "gz" == fileExtName
                || "tar" == fileExtName)
                fileIcon = "file_type_zip.png";
        }

        return fileIcon;
    };

    /**
     * 让浏览器滚动条保持在最低部。
     */
    UIModule5.prototype.scrollToBottom4IM = function () {
        setTimeout(() => {
            var t = document.getElementById('im-panel-main-chatcontentpane-wrap');
            if (t) {
                t.scrollTop = t.scrollHeight;
            }
        }, 50)

        this.$chatBox[0].scrollTop = this.$chatBox[0].scrollHeight; // [0]是何意？待考证
    };

    // 判断是否到了底部
    UIModule5.prototype.isScrollToBottom = function () {
        var t = document.getElementById('im-panel-main-chatcontentpane-wrap');
        // console.log('判断是否滚动到了底部', t.scrollTop , t.scrollHeight)
        return Math.abs(t.scrollTop - t.scrollHeight) < 1500; // [0]是何意？待考证
    };




    UIModule5.prototype.onlineCheck = function () {
        if (!IMSDK.isOnline()) {
            //alert('当前与服务器的连接已断开，请等待网络恢复后再试！');
            RBChatDialogHelper.showAlertDialog_WARN('连接断开', '当前与服务器的连接已断开，请等待网络恢复后再试！');
            return false;
        }
        return true;
    };

    /**
     * 发送消息前的逻辑检查。
     *
     * @return {boolean} true表示该消息允许发送，否则不允许
     */
    UIModule5.prototype.send4IMCheck = function () {
        if (this.onlineCheck()) {
            console.info('>>>>>>>>>>>>> type=' + RBChatMainUI.getCurrentSelectedAlarmType()
                + ", RBChatMainUI.getCurrentSelectedAlarmDataId()=" + RBChatMainUI.getCurrentSelectedAlarmDataId());

            if (RBChatMainUI.getCurrentSelectedAlarmType() == -1 &&
                (!RBChatMainUI.getCurrentSelectedAlarmDataId() || RBChatMainUI.getCurrentSelectedAlarmDataId() === 'N/A')) {
                //alert('请先选中聊天对象后再发送消息！');
                RBChatDialogHelper.showAlertDialog_INFO("无法发送", "请先选中左侧列表中的聊天对象后，再发送消息！");
                return false;
            }
            return true;
        }
        return false;
    };

    /**
     * 发送普通文本聊天消息的实施方法。
     */
    UIModule5.prototype.doSendTextMessage4IM = function () {
        $("#im-panel-inputcontent").height(28)

        //var message = this.$inputMessage.val().trim();
        var message = this.getInputContent().trim();
        var that = this;

        if (!this.send4IMCheck())
            return;

        // 先生成指纹码
        var fingerPrint = MBProtocalFactory.genFingerPrint();

        //判断是否是小程序指令
        var isMinApp = false;
        if (message && message.length > 0) {
            const t = message.toLowerCase().substr(0, 4)
            if (t == 'app:') {
                isMinApp = true;
            }
        }
        // app指令
        if (isMinApp) {
            const minAppFlag = message.split(':')[1];
            var that = this;
            RBChatRestHelper.queryMinAppListFromServer(function (res) {
                const obj_list = JSON.parse(res);
                if (obj_list.length > 0) {
                    window.app_applets = obj_list;
                    const obj = obj_list.find(item => item.appletId == minAppFlag || item.appletName == minAppFlag);
                    if (obj) {
                        // 执行真正的消息/指令发送逻辑
                        that.doSendMessageImpl(JSON.stringify(obj), 9, function () {
                            // 清空输入框
                            that.$inputMessage.val('');
                        }, fingerPrint);
                    } else {
                        alert('没有找到相关得小程序')
                    }
                } else {
                    alert('没有找到相关得小程序')
                }
            }, function (error) {
                alert(error)
            })

        } else {
            // 判断是否是回复
            if (window.replyModel) {
                var msg = {
                    from: { ...window.replyModel },
                    to: { text: message },
                    gid: window.groupInfo ? window.groupInfo.g_id : LocalUserInfo.getUid()
                }

                // 执行真正的消息/指令发送逻辑
                this.doSendMessageImpl(JSON.stringify(msg), 11, function () {
                    window.replyModel = null;
                    $('#im-panel-main-chat-replay-ui').empty();
                    $('#im-panel-main-chat-replay-ui').hide();
                    // 清空输入框
                    that.$inputMessage.val('');
                }, fingerPrint);
            } else {
                var isTipsMessage = false;
                //@ 消息
                if (window.groupSelectTipsUser) {
                    const len = window.groupSelectTipsUser;
                    //查找是否有@存在
                    for (const item of window.groupSelectTipsUser) {
                        let index = message.indexOf('@' + item[2]);
                        isTipsMessage = index > -1;
                        if (isTipsMessage) {
                            break;
                        }
                    }
                }
                // 发送@消息
                if (isTipsMessage) {
                    // 执行真正的消息/指令发送逻辑
                    this.doSendMessageImpl(JSON.stringify({
                        origin_text: message,
                        gid: window.groupInfo.g_id, // 群id
                        select_obj: window.groupSelectTipsUser.map(item => {
                            return {
                                nickname: item[2],
                                user_uid: item[1]
                            }
                        })
                    }), 12, function () {
                        // 清空输入框
                        that.$inputMessage.val('');
                        window.groupSelectTipsUser = null;
                    }, fingerPrint);
                    // 发送常规消息
                } else {
                    // 执行真正的消息/指令发送逻辑
                    this.doSendMessageImpl(message, MsgType.TYPE_TEXT, function () {
                        // 清空输入框
                        that.$inputMessage.val('');
                        window.groupSelectTipsUser = null;
                    }, fingerPrint);
                }


            }
        }
    };

    /**
     * 发送图片聊天消息的实施方法。
     */
    UIModule5.prototype.doSendImageMessage4IM = function (fileNameWithMD5, sendUser = {}) {
        //var that = this;

        if (!fileNameWithMD5) {
            //alert('没有要发送的图片！');
            RBChatDialogHelper.showAlertDialog_INFO('友情提示', '没有要发送的图片！');
            return;
        }

        if (!this.send4IMCheck())
            return;

        // 先生成指纹码
        var fingerPrint = MBProtocalFactory.genFingerPrint();

        // 执行真正的消息/指令发送逻辑
        this.doSendMessageImpl(fileNameWithMD5, MsgType.TYPE_IMAGE, null, fingerPrint, sendUser);
    };

    /**
     * 发送大文件聊天消息的实施方法。
     */
    UIModule5.prototype.doSendFileMessage4IM = function (fileName, fileMd5, fileLength, sendUser = {}) {
        //var that = this;

        if (!fileName && !fileMd5 && !fileLength) {
            //alert('无效的参数，无法开始发送大文件消息(fileName='+fileName+', fileMd5='+fileMd5+', fileLength='+fileLength+')！');
            RBChatDialogHelper.showAlertDialog_WARN('无法发送', '无效的参数，无法开始发送大文件消息(fileName='
                + fileName + ', fileMd5=' + fileMd5 + ', fileLength=' + fileLength + ')！');
            return;
        }

        if (!this.send4IMCheck())
            return;

        // 根据RainbowChat的多端约定，文件消息的消息体内容就是这个完整的FileMeta
        // 对象的JSON文件信息（见：rbchat_cache.js文件中的Factory.prototype.createChatMsgEntity_COME_FILE 函数）
        var fileMeta = {
            /** 文件名 */
            "fileName": fileName,
            /** 文件md5码 */
            "fileMd5": fileMd5,
            /** 文件长度（单位：字节） */
            "fileLength": fileLength
        };

        // 先生成指纹码
        var fingerPrint = MBProtocalFactory.genFingerPrint();

        // 执行真正的消息/指令发送逻辑
        this.doSendMessageImpl(JSON.stringify(fileMeta), MsgType.TYPE_FILE, null, fingerPrint, sendUser);
    };

    /**
   * 发送视频聊天消息的实施方法。
   */
    UIModule5.prototype.doSendVideoMessage4IM = function (fileName, fileMd5, fileLength, sendUser = {}) {
        //var that = this;

        if (!fileName && !fileMd5 && !fileLength) {
            //alert('无效的参数，无法开始发送大文件消息(fileName='+fileName+', fileMd5='+fileMd5+', fileLength='+fileLength+')！');
            RBChatDialogHelper.showAlertDialog_WARN('无法发送', '无效的参数，无法开始发送大文件消息(fileName='
                + fileName + ', fileMd5=' + fileMd5 + ', fileLength=' + fileLength + ')！');
            return;
        }

        if (!this.send4IMCheck())
            return;

        // 根据RainbowChat的多端约定，文件消息的消息体内容就是这个完整的FileMeta
        // 对象的JSON文件信息（见：rbchat_cache.js文件中的Factory.prototype.createChatMsgEntity_COME_FILE 函数）
        var fileMeta = {
            /** 文件名 */
            "fileName": fileMd5,
            /** 文件md5码 */
            "fileMd5": fileName,
            /** 文件长度（单位：字节） */
            "fileLength": fileLength
        };

        // 先生成指纹码
        var fingerPrint = MBProtocalFactory.genFingerPrint();

        // 执行真正的消息/指令发送逻辑
        this.doSendMessageImpl(JSON.stringify(fileMeta), MsgType.TYPE_SHORTVIDEO, null, fingerPrint, sendUser);
    };



    /**
     * 发送“位置”聊天消息的实施方法。
     */
    UIModule5.prototype.doSendLocationMessage4IM = function (locationTitle, locationContent, longitude, latitude, fn_sucess_send) {

        if (!locationTitle && !locationContent && !longitude && !latitude) {
            RBChatDialogHelper.showAlertDialog_WARN('无法发送', '无效的参数，无法开始发送位置消息(locationTitle='
                + locationTitle + ', locationContent=' + locationContent + ', longitude=' + longitude + ', latitude=' + latitude + ')！');
            return;
        }

        if (!this.send4IMCheck())
            return;

        // 根据RainbowChat的多端约定，文件消息的消息体内容就是这个完整的LocationMeta
        // 对象的JSON文件信息（见：rbchat_cache.js文件中的Factory.prototype.createChatMsgEntity_COME_LOCATION 函数）
        var locationMeta = {
            /** 位置主描述 */
            "locationTitle": locationTitle,
            /** 位置详细描述 */
            "locationContent": locationContent,
            /** 经度 */
            "longitude": longitude,
            /** 纬度 */
            "latitude": latitude,
            /** 地图预览图缓存文件名（此字段目前仅用于app产品中，对于web产品而言暂作保留字段，未实际使用之） */
            "prewviewImgFileName": null
        };

        // 先生成指纹码
        var fingerPrint = MBProtocalFactory.genFingerPrint();

        // 执行真正的消息/指令发送逻辑
        this.doSendMessageImpl(JSON.stringify(locationMeta), MsgType.TYPE_LOCATION, fn_sucess_send, fingerPrint);
    };

    /**
     * 发送“名片”聊天消息的实施方法。
     */
    UIModule5.prototype.doSendContactMessage4IM = function (theUid, theNickname, fn_sucess_send) {

        if (!theUid && !theNickname) {
            RBChatDialogHelper.showAlertDialog_WARN('无法发送'
                , '无效的参数，无法开始发送名片消息(theUid=' + theUid + ', theNickname=' + theNickname + ')！');
            return;
        }

        if (!this.send4IMCheck())
            return;

        // 根据RainbowChat的多端约定，文件消息的消息体内容就是这个完整的ConcatMeta
        // 对象的JSON文件信息（见：rbchat_cache.js中的Factory.prototype.createChatMsgEntity_COME_CONTACT 函数）
        var contactMeta = {
            /** 名片人员的uid */
            "uid": theUid,
            /** 名片人员的昵称 */
            "nickName": theNickname
        };

        // 先生成指纹码
        var fingerPrint = MBProtocalFactory.genFingerPrint();

        // 执行真正的消息/指令发送逻辑
        this.doSendMessageImpl(JSON.stringify(contactMeta), MsgType.TYPE_CONTACT, fn_sucess_send, fingerPrint);
    };

    /**
     * 递归发送电影消息
     * @param {*} msgType 
     * @param {*} userList 
     * @param {*} moiveList 
     * @param {*} callBack 
     */
    UIModule5.prototype.circleSendMoiveMsg = function(user, moiveList,callBack){
        if(moiveList.length > 0){
            var that = this;
             var  item =  moiveList[0]
             var fileMeta = {
                isMovie:'1',
                movieCoverUrl: item[2],
                movieUrl: item[3],
                durationString: '',
             };
             console.log('send-fileMeta',fileMeta)
             var fingerPrint = MBProtocalFactory.genFingerPrint();
             that.doSendMessageImpl(JSON.stringify(fileMeta), MsgType.TYPE_SHORTVIDEO, function () {
                 //移除当前元素
                 moiveList.splice(0, 1)
                 // 重更新开始调用
                 that.circleSendMoiveMsg(user, moiveList, callBack)
             }, fingerPrint, {
                 currentSelectedAlarmType: user.msgType,
                 currentSelectedAlarmDataId: user.userId,
             }, false, true)
        }else{
            if (callBack) {
                callBack()
            }
            alert('消息发送完成')
        }
    }

    /**
     *  递归发送消息
     * @param {*} msgContent 
     * @param {*} msgType 
     * @param {*} fingerPrint 
     * @param {*} userList 
     */
    UIModule5.prototype.circleSendGroupMsg = function (count, msgContent, msgType, userList, callBack) {
        if (count == userList.length) {
            $('#im-panel-main-chat-textarea_fileuphint-2').css('display', 'block');
            $('#im-panel-main-chat-textarea_fileuphint-2').text('消息发送中:' + (count - userList.length) + '/' + count);
        }
        var that = this;
        // 还有人员没有发送
        if (userList.length > 0) {
            var item = userList[0];
            $('#im-panel-main-chat-textarea_fileuphint-2').text('消息发送中:' + (count - userList.length) + '/' + count);
            // 先生成指纹码
            var fingerPrint = MBProtocalFactory.genFingerPrint();
            this.doSendMessageImpl(msgContent, msgType, function () {
                //移除当前元素
                userList.splice(0, 1)
                // 重更新开始调用
                that.circleSendGroupMsg(count, msgContent, msgType, userList, callBack)
            }, fingerPrint, {
                currentSelectedAlarmType: 4,
                currentSelectedAlarmDataId: item,
            }, false, true)
            // 已经发送完成
        } else {
            $('#im-panel-main-chat-textarea_fileuphint-2').text('');
            $('#im-panel-main-chat-textarea_fileuphint-2').hide();
            if (callBack) {
                callBack()
            }
            alert('消息发送完成')
        }
    }

    /**
    *  递归发送转发消息
    * @param {*} msgContent 
    * @param {*} msgType 
    * @param {*} fingerPrint 
    * @param {*} userList 
    */
    UIModule5.prototype.circleSendForwardMsg = function (dom, count, msgContent, msgType, forWardList, callBack) {
        if (count == forWardList.length) {
            $(dom).text('发送(' + (count - forWardList.length) + '/' + count + ')');
        }
        var that = this;
        // 还有人员没有发送
        if (forWardList.length > 0) {
            var item = forWardList[0];
            $(dom).text('发送(' + (count - forWardList.length) + '/' + count + ')');
            // 先生成指纹码
            var fingerPrint = MBProtocalFactory.genFingerPrint();
            this.doSendMessageImpl(msgContent, msgType, function () {
                //移除当前元素
                forWardList.splice(0, 1)
                // 重更新开始调用
                that.circleSendForwardMsg(dom, count, msgContent, msgType, forWardList, callBack)
            }, fingerPrint, {
                currentSelectedAlarmType: item.utype,
                currentSelectedAlarmDataId: item.uid,
            }, false, true)
            // 已经发送完成
        } else {
            $(dom).text('发送')
            if (callBack) {
                callBack()
            }
        }
    }

    /**
     *  检测好友是否被删除
     * @param {*} uid 
     */
    UIModule5.prototype.checkFriendIsValid = function (uid, isshowAlert = true) {
        let valid = true;
        const list = RosterProvider.getRosterData()
        if (list && list.length > 0) {
            list.forEach(item => {
                if (item.user_uid == uid && item.state - 0 == 3) {
                    valid = false;
                }
            })
        }
        // 好友被删除不能发送消息
        if (!valid && isshowAlert) {
            alert('对方已将您删除好友，不能发送消息')
        }
        return valid
    }

    UIModule5.prototype.doSendMessageImpl = function (msgContent, msgType, fn_callback_after_send_sucess, fingerPrint, sendUser = {}, isIMCheck = true, isGroupSend = false) {

        var currentSelectedAlarmType = RBChatMainUI.getCurrentSelectedAlarmType();
        var currentSelectedAlarmDataId = RBChatMainUI.getCurrentSelectedAlarmDataId();
        // 文件上传默认选择了当前一个用户
        if (sendUser.currentSelectedAlarmDataId) {
            currentSelectedAlarmType = sendUser.currentSelectedAlarmType
            currentSelectedAlarmDataId = sendUser.currentSelectedAlarmDataId
        }

        console.log('发送的消息', msgContent)

        // 发送的是好友聊天类型的消息
        if (currentSelectedAlarmType == AlarmMessageType.reviceMessage) {

            // 校验好友是否被删除
            if (!this.checkFriendIsValid(currentSelectedAlarmDataId)) {
                return;
            }

            // 回调中的msgBody值，详见：http://docs.52im.net/extend/docs/api/rainbowchatserver4_pro/com/x52im/rainbowchat/im/dto/MsgBody4Friend.html
            MessageHelper.sendMessage(msgType, currentSelectedAlarmDataId, msgContent, function (isSucess, msgBody) {
                if (isSucess) {
                    //// 清空输入框
                    //that.$inputMessage.val('');
                    if (fn_callback_after_send_sucess)
                        fn_callback_after_send_sucess();

                    var friendUid = currentSelectedAlarmDataId;
                    var ree = RosterProvider.getFriendInfoByUid(friendUid) || {};

                    // 自已发出的消息，也要显示在相应的UI界面上
                    var alarmMessageDTO = AlarmsProvider.createChatMsgAlarmForLocal(msgBody.ty, msgBody.m, ree.nickname, friendUid);
                    var chatMsgEntity = ChatMsgEntity.prepareSendedMessage(msgBody.m, 0, fingerPrint, msgType);

                    // 将此条消息存入缓存并在UI上显示
                    RBChatMainUI.processRecivedMessage(true, false, alarmMessageDTO, chatMsgEntity, isGroupSend);

                    // 发送完成的提示音，提升用户体验
                    //if(msgType == MsgType.TYPE_IMAGE
                    //    || msgType == MsgType.TYPE_FILE){
                    AudioPromptHelper.fileSentPromt();

                    //}
                }
            }, fingerPrint, isIMCheck);
        }
        // 发送的是陌生人/临时聊天类型的消息
        else if (currentSelectedAlarmType == AlarmMessageType.tempChatMessage) {

            // 校验好友是否被删除
            if (!this.checkFriendIsValid(currentSelectedAlarmDataId)) {
                return;
            } 

            // 回调中的msgBody值，详见：http://docs.52im.net/extend/docs/api/rainbowchatserver4_pro/com/x52im/rainbowchat/im/dto/MsgBody4Guest.html
            TMessageHelper.sendGuestMessage(msgType, currentSelectedAlarmDataId, msgContent, function (isSucess, msgBody) {
                if (isSucess) {
                    //// 清空输入框
                    //that.$inputMessage.val('');
                    if (fn_callback_after_send_sucess)
                        fn_callback_after_send_sucess();

                    var guestUid = currentSelectedAlarmDataId;

                    // 自已发出的消息，也要显示在相应的UI界面上
                    var alarmMessageDTO = AlarmsProvider.createATempChatMsgAlarmForLocal(msgBody.ty, msgBody.m
                        , null//msgBody.nickName// 这个字段值就是对方的nickname，但在web端不太好取，而此处可以设为null的
                        // 逻辑是因为本地发出的消息必定是选中了已存在首页陌生人“消息”item，所以此处为null地无谓（因为刷新item时不需要刷新title）
                        , guestUid);
                    var chatMsgEntity = ChatMsgEntity.prepareSendedMessage(msgBody.m, 0, fingerPrint, msgType);

                    // 将此条消息存入缓存并在UI上显示
                    RBChatMainUI.processRecivedMessage(true, false, alarmMessageDTO, chatMsgEntity);

                    // 发送完成的提示音，提升用户体验
                    //if(msgType == MsgType.TYPE_IMAGE
                    //    || msgType == MsgType.TYPE_FILE){
                    AudioPromptHelper.fileSentPromt();
                    //}
                }
            }, fingerPrint);
        }
        // 发送的是群聊消息
        else if (currentSelectedAlarmType == AlarmMessageType.groupChatMessage) {

            // 回调中的msgBody值，详见：http://docs.52im.net/extend/docs/api/rainbowchatserver4_pro/com/x52im/rainbowchat/im/dto/MsgBody4Group.html
            GMessageHelper.sendGroupMessage(msgType, currentSelectedAlarmDataId, msgContent, function (isSucess, msgBody, currentChattingGe) {
                if (isSucess) {
                    //// 清空输入框
                    //that.$inputMessage.val('');
                    if (fn_callback_after_send_sucess)
                        fn_callback_after_send_sucess();

                    var gid = currentSelectedAlarmDataId;

                    // 自已发出的消息，也要显示在相应的UI界面上
                    var alarmMessageDTO = AlarmsProvider.createAGroupChatMsgAlarmForLocal(msgBody.ty, msgBody.m, currentChattingGe.g_name, gid);
                    // 消息数据对象
                    var chatMsgEntity = ChatMsgEntity.prepareSendedMessage(msgBody.m, 0, fingerPrint, msgType);

                    // 本地发出的群聊消息作为到服务端被扩散写为其它群员消息的"父"消息，是没有"父"指纹码的，为了
                    // 让处理本地发出的和收到的群聊消息在撤回逻辑上的代码，所以把自身的这条消息的指纹码也填到了
                    // fingerPrintOfParent字段里，这在逻辑上并没有什么问题，可以放心处理
                    chatMsgEntity.fingerPrintOfParent = msgBody.parentFp;

                    // 将此条消息存入缓存并在UI上显示
                    RBChatMainUI.processRecivedMessage(true, true, alarmMessageDTO, chatMsgEntity, isGroupSend);

                    // 发送完成的提示音，提升用户体验
                    //if(msgType == MsgType.TYPE_IMAGE
                    //    || msgType == MsgType.TYPE_FILE){
                    AudioPromptHelper.fileSentPromt();
                    //}
                }
            }, fingerPrint);
        }
        else {
            //alert('暂未实现聊天类型：'+currentSelectedAlarmType+' 的聊天消息发送！');
            RBChatDialogHelper.showAlertDialog_INFO('无法发送', '暂未实现聊天类型：' + currentSelectedAlarmType + ' 的聊天消息发送！');
        }
    };

    /**
     * 默认加载本地数据
     * @param {*} alarmMessageType 
     * @param {*} dataId 
     */
    UIModule5.prototype.loadCacheHistoryFromCache2 = function (alarmMessageType, beyongDataId) {
        // 先清空当前的聊天消息显示
        this.clearChatPane();
        var that = this;

        window.replyModel = null;
        // 复制uiui
        $('#im-panel-main-chat-replay-ui').empty();
        $('#im-panel-main-chat-replay-ui').hide();

        $('#im-panel-main-chat-tip-me').hide();

        $('#tip_my_' + beyongDataId).hide();

        $('#im-chat-top-msg').hide();

        $('#im-panel-main-chatcontentpane').removeClass('have-msg-top')

        window.top_msg_list = []
        window.to_msg_show_index = 0;

        // 重新选择群，提醒的人设置取消
        window.groupSelectTipsUser = null;
        window.tip_msg_list = [];

        // 要截入的是群聊消息
        var isGroupChatting = (AlarmMessageType.groupChatMessage === alarmMessageType);
        // 打开的用户id
        window.openGroupChattingType = isGroupChatting;
        window.openBeyongDataId = beyongDataId;
        // 去掉单聊不禁言
        if (!isGroupChatting) {
            $('#kchat-im-panel-main-chat-textarea').css('pointer-events', '');
            $('#im-panel-inputcontent').attr('placeholder', '请输入消息')
            $('#im-panel-inputcontent').removeAttr("disabled");
        }

        // 红包目前只支持群聊
        isGroupChatting ? $('#send-redpag').show() : $('#send-redpag').hide();

        window.scrollInfo = null;

        var TAG = (isGroupChatting ? "群聊" : "一对一");

        // FIXME: 【可优化内容】未来如果聊天记录需要分页的话，本方法中进对chatHistoryCurrentPagesMap做进一步定义和细化
        // if (this.chatHistoryCurrentPagesMap.contains(beyongDataId)) {
        //     alert(2)
        //     return;
        // }
        // 要加载的聊天记录的开始时间
        var startTime = null;
        // 要加载的聊天记录的结束时间
        var endTime = null;
        var QUERY_DATE_PATTERN = 'yyyy-MM-dd hh:mm:ss';

        // 【计算聊天记录的开始时间查询条件】：当前默认定义为加载15天内的聊天
        // 记录（见RBChatConfig.CHATTING_HISTORY_LOAD_TIME_INTERVAL常量定义）
        var dtForStart = new Date();
        dtForStart.setDate(dtForStart.getDate() - RBChatConfig.CHATTING_HISTORY_LOAD_TIME_INTERVAL);
        startTime = RBChatUtils.formatDate(dtForStart, QUERY_DATE_PATTERN);

        // 获取阅读状态
        var getReadStatus = function (time) {
            // 私聊且有阅读时间
            if (!isGroupChatting && window.lastReadTime) {
                return window.lastReadTime - time >= 0 ? '1' : '0';
            }
            return '0'
        }
        // 清除缓存
        isGroupChatting ? GroupChattingCache.removeChatCache(beyongDataId) : SingleChattingCache.removeChatCache(beyongDataId)

        // 【计算聊天记录的结束时间查询条件】：如果当前缓存中已存在聊天消息数据，则取此时间作为加载的结束时间，
        // 这么做的原因，是防止当本地用户登陆后，已载离线聊天数据之后，首次点进聊天界面时，会重复加载历史，
        // 聊天记录的问题（因为之前加载的离线消息，早已进入了服务端的聊天记录中，本次如果不加这个查询截止
        // 时间，则数据当然就会被重复加载罗！）
        var firstChatMsgEntity = (isGroupChatting ? GroupChattingCache.getChatCacheFirst(beyongDataId) : SingleChattingCache.getChatCacheFirst(beyongDataId)); // 取出当天聊天缓存数据中的第一条消息对象
        if (firstChatMsgEntity) {
            var firstMsgTimestamp = firstChatMsgEntity.date; // 取出该条缓存消息的时间戳
            if (firstMsgTimestamp) {
                var dtForEnd = new Date();
                // 之所以将此时间主动减去1000毫秒，是因为服务端的SQL查询"BETWEEN AND"的右边界问题会导
                // 致该第一条消息还是会重，主动减1秒则下方formatDate(..)转时分秒格式后，就能保证不存在
                // 边界导致的查询重复（因为直接少了1秒啊）
                dtForEnd.setTime(firstMsgTimestamp - 1000);
                endTime = RBChatUtils.formatDate(dtForEnd, QUERY_DATE_PATTERN); // 将时间戳转了字符串日期格式（便于提前服务端接口使用）
            }
        }

        // 开始从服务端查询历史聊天记录并缓存到本地，同时尝试在ui上显示之
        RBChatRestHelper.queryChattingHistoryFromServer(
            isGroupChatting
            , beyongDataId
            , IMSDK.getLoginInfo().loginUserId, beyongDataId
            , "1"
            , startTime, endTime
            // 数据读取成功后的回调
            , function (returnValue) {
                // 服务端返回的是java 2维Vector<Vector>对象数组（相当于JS里的2维嵌套数组）
                var chattingHistoryList = JSON.parse(returnValue);
                // 如果返回数据大于0行
                if (chattingHistoryList && chattingHistoryList.length > 0) {// 正常处理完成的情况下接口约定为本字段存放Vector<Vector>结果
                    var chatHistoryDatas = [];
                    // console.log('历史消息', chattingHistoryList)
                    //标准的for循环：遍历 Array[Array对象] 2维数组
                    for (var i = 0; i < chattingHistoryList.length; i++) {
                        // 遍历内层数组
                        var row = chattingHistoryList[i];
                        // 解析一条聊天记录中的每个字段
                        // 注意：当srcUid=本地用户时，表示本条消息是“我”发出的，否则表示是收到的消息，这个逻辑一定别搞混了
                        var srcUid = row[0]
                            , destUid = row[1]
                            , chat_type = row[2]
                            , msg_type = row[3]
                            , msgContent = row[4]
                            , msgTime2Timestamp = row[5]
                            , fingerPrint = row[6]
                            , name = row[8]
                            , fingerPrintOfParent = row[7]
                            , mlevel = row.length > 11 ? row[11] : ''
                            , payDate = row.length > 12 ? row[12] : ''
                            , nowTime = row.length > 13 ? row[13] : ''
                            , cmoney = row.length > 14 ? row[14] : ''
                            , groupName = row[8]
                            , redStatus = getReadStatus(row[5]),
                            user_photo = row.length > 16 ? row[16] : '';
                        remarkName = row.length > 10 ? row[10] : ''

                        // 备注名
                        if (remarkName && remarkName.length > 0) {
                            name = remarkName;
                        }

                        // true表示此行数据是群聊息，否则是单聊的
                        var returnIsGroupChatting = (chat_type == ChatModeType.CHAT_TYPE_GROUP$CHAT);
                        // true表示是“我”发出的消息，否则是“我”收到的消息（即对方发给“我”的）
                        var isOutgoing = (srcUid == IMSDK.getLoginInfo().loginUserId);
                        // 消息发送者的uid
                        var beyongUid = returnIsGroupChatting ? srcUid : (isOutgoing ? destUid : srcUid);
                        // 群组id（只在群聊消息时才有意义）
                        var gid = returnIsGroupChatting ? destUid : null;

                        //console.error('>>>>>> srcUid='+srcUid+', IMSDK.getLoginInfo().loginUserId='+IMSDK.getLoginInfo().loginUserId
                        //    +", isOutgoing?"+isOutgoing+", beyongUid="+beyongUid);

                        //## Bug FIX: 检查该fingerPrint的消息是否已存在于缓存中，如存在则不需要添加，否则就重
                        //##            复了，此为解决209170914日开会指出的存在聊天消息首次从历史加载时会重复的问题
                        if (fingerPrint) {
                            if (returnIsGroupChatting) {
                                if (GroupChattingCache.containsFingerPrintInChatCache(gid, fingerPrint)) {
                                    RBChatUtils.logToConsole('[前端-GET-【接口1008-26-8】' + TAG + '群聊天记录获取接口返回值解析后] - 来自dataId=' + beyongDataId + '的fp=' + fingerPrint
                                        + '的消息已存在于缓存中，不需要重复添加，继续循环的下一轮【!!】！');
                                    continue;
                                }
                            }
                            else {
                                if (SingleChattingCache.containsFingerPrintInChatCache(beyongUid, fingerPrint)) {
                                    RBChatUtils.logToConsole('[前端-GET-【接口1008-26-8】' + TAG + '单聊天记录获取接口返回值解析后] - 来自dataId=' + beyongDataId + '的fp=' + fingerPrint
                                        + '的消息已存在于缓存中，不需要重复添加，继续循环的下一轮【!!】！');
                                    continue;
                                }
                            }
                        }
                        //## Bug FIX END

                        var chatMsgEntity = null;
                        if (isOutgoing) {
                            chatMsgEntity = ChatMsgEntity.prepareSendedMessage(msgContent
                                , msgTime2Timestamp ? msgTime2Timestamp : 0, fingerPrint, msg_type);
                        }
                        else {
                            chatMsgEntity = ChatMsgEntity.prepareRecievedMessage(beyongUid
                                , beyongUid // TODO: 显示昵称？（从好友列表？从首页“消息”的item上取？
                                , msgContent, msgTime2Timestamp ? msgTime2Timestamp : 0, msg_type, fingerPrint);
                        }

                        if (returnIsGroupChatting)
                            // 群聊消息需要记录下扩散写前由消息发起者发出消息的原始指纹码（以便消息"撤回"功能时使用）
                            chatMsgEntity.fingerPrintOfParent = fingerPrintOfParent;
                        if (name) {
                            chatMsgEntity.name = name;
                        }
                        // 重置历史消息状态
                        chatMsgEntity.redStatus = redStatus;

                        chatMsgEntity.mlevel = mlevel
                        chatMsgEntity.payDate = payDate
                        chatMsgEntity.nowTime = nowTime
                        chatMsgEntity.cmoney = cmoney
                        chatMsgEntity.groupName = groupName
                        chatMsgEntity.user_photo = user_photo;

                        if (msg_type - 0 == 9) {
                            chatMsgEntity.msgType = 9;
                        }
                        // 放入数组
                        chatHistoryDatas.push(chatMsgEntity);

                    }

                    // 聊天记录放入缓存中缓存起来并决定是否要在聊天内容面板中显示
                    if (chatHistoryDatas.length > 0) {
                        RBChatUtils.logToConsole('[前端-GET-【接口1008-26-8】' + TAG + '聊天记录获取接口返回值解析后] - 获取的聊天记录条数为'
                            + chatHistoryDatas.length + '，马上放入缓存并决定是否需要显示到聊天内容面板哦！', true);

                        if (isGroupChatting) {
                            GroupChattingCache.putChatCaches(beyongDataId, chatHistoryDatas, true);
                        }
                        else {
                            // 数据放入与该用户聊天的缓存里存起来（以备后续使用）
                            SingleChattingCache.putChatCaches(beyongDataId, chatHistoryDatas, true);
                        }
                    }
                }

                var needSetChatPaneEmpty = false;
                if (isGroupChatting) {
                    if (GroupChattingCache.getChatCacheLength(beyongDataId) === 0)
                        needSetChatPaneEmpty = true;
                }
                else {
                    if (SingleChattingCache.getChatCacheLength(beyongDataId) === 0)
                        needSetChatPaneEmpty = true;
                }

                if (needSetChatPaneEmpty) {
                    // 显示空数据ui
                    that.setChatPaneEmpty();
                } else {
                    //默认加载50条
                    // 如果获取的聊天记录对象正是属于当前正在聊天着的用户，则把
                    // 聊天消息同时也显示到聊天内容面板中以便即时查看;
                    if (RBChatMainUI.isCurrentSelectedAlarm(AlarmMessageType.tempChatMessage, beyongDataId)
                        || RBChatMainUI.isCurrentSelectedAlarm(AlarmMessageType.reviceMessage, beyongDataId)
                        || RBChatMainUI.isCurrentSelectedAlarm(AlarmMessageType.groupChatMessage, beyongDataId)) {
                        var list = (isGroupChatting ? GroupChattingCache.getChatCache(beyongDataId) : SingleChattingCache.getChatCache(beyongDataId));
                        if (list.length <= RBChatConfig.LOAD_CHAT_RECORDER_COUNTS) {
                            window.scrollInfo = { beyongDataId, isGroupChatting, top: 0 };
                            RBChatChattingContentPaneUI.insertChatItems(list);
                            // 过滤消息
                            that.showMyTip(list, beyongDataId);
                        } else {
                            const showList = list.slice(list.length - RBChatConfig.LOAD_CHAT_RECORDER_COUNTS, list.length);
                            RBChatChattingContentPaneUI.insertChatItems(showList);
                            window.scrollInfo = { beyongDataId, isGroupChatting, top: list.length - RBChatConfig.LOAD_CHAT_RECORDER_COUNTS }

                            // 过滤消息
                            that.showMyTip(showList, beyongDataId);
                        }
                        // 放到当前聊天内容的前面显示
                        RBChatChattingContentPaneUI.scrollToBottom4IM();
                    }

                }

                // 判断好友是否已经删除
                if (!RBChatUtils.isMobile() && !isGroupChatting && !that.checkFriendIsValid(beyongDataId, false)) {
                    that.showAddFriendUI(beyongDataId)
                }

                // 设置已读聊天记录的标识
                that.chatHistoryCurrentPagesMap.set(beyongDataId, 'N/A');
                // 置顶消息处理
                that.init_msg_top_ui();

            }
            // 数据加载失败后的回调
            , function (errorThrownStr) {
                //alert('聊天历史记录数据读取出错，原因是：'+errorThrownStr);
                RBChatDialogHelper.showAlertDialog_WARN('加载失败', TAG + '聊天历史记录数据加载出错，可能是网络故障，请稍后再试！');
            }
        );

    }

    // 初始置顶消息ui
    UIModule5.prototype.init_msg_top_ui = function () {
        const that = this;
        // 查询置顶消息
        var groupId = ''
        var beyongDataId = window.openBeyongDataId;
        // 群与人区分
        if (window.openGroupChattingType) {
            groupId = beyongDataId
        } else {
            var myId = LocalUserInfo.getUid()
            groupId = beyongDataId - myId > 0 ? myId + '_' + beyongDataId : beyongDataId + '_' + myId
        }
        // 查询置顶消息
        RBChatRestHelper.query_msg_top(groupId, function (returnValue) {
            var top_msg_list = JSON.parse(returnValue);
            if (top_msg_list.length > 0) {
                $('#im-chat-top-msg').show();
                $('#im-panel-main-chatcontentpane').addClass('have-msg-top')
                window.top_msg_list = top_msg_list;
                // 显示ui
                that.show_top_msg_ui();

            } else {
                $('#im-panel-main-chatcontentpane').removeClass('have-msg-top')
                $('#im-chat-top-msg').hide();
            }
        }, function () { })
    }

    // 绘制顶部消息ui
    UIModule5.prototype.show_top_msg_ui = function (isClick = false) {
        const that = this;
        var index = window.to_msg_show_index % window.top_msg_list.length
        const item = window.top_msg_list[index]
        const obj = JSON.parse(item[0])
        let html_content = '[该消息暂不支持]'
        // 文本消息
        if (obj.msgType - 0 == 0) {
            html_content = obj.msgContent
        }
        // 红包消息
        if (obj.msgType - 0 == 10) {
            html_content = '[红包消息]'
        }
        // @消息
        if (obj.msgType - 0 == 12) {
            const obj_ = JSON.parse(obj.msgContent);
            const select_obj = obj_.select_obj;
            var origin_text = obj_.origin_text;
            select_obj.forEach(item => {
                const l = '@' + item.nickname
                origin_text = origin_text.replace(new RegExp(l, 'g'), "<font color='#28a0ff'>" + l + "</font>")
            })
            html_content = this.replaceEmojiPlaceholderToHTML(origin_text);
            if (html_content)
                html_content = html_content.replace(new RegExp('\n', 'g'), '<br>');
        }
        // 小程序消息
        if (obj.msgType - 0 == 9) {
            html_content = '[小程序消息]'
        }

        // 图片消息
        if (obj.msgType - 0 == MsgType.TYPE_IMAGE) {
            html_content = "[图片消息]"
        }

        // 语音消息
        if (obj.msgType - 0 == MsgType.TYPE_VOICE) {
            html_content = "[语音消息]"
        }

        // 文件消息
        if (obj.msgType - 0 == MsgType.TYPE_FILE) {
            html_content = "[文件消息]"
        }

        // 视频消息
        if (obj.msgType - 0 == MsgType.TYPE_SHORTVIDEO) {
            html_content = "[视频消息]"
        }

        // 名片消息
        if (obj.msgType - 0 == MsgType.TYPE_CONTACT) {
            html_content = "[名片消息]"
        }

        // 多文件或者多视频消息
        if (obj.msgType - 0 == 13) {
            const obj_ = JSON.parse(obj.msgContent);
            html_content = obj_.type == 0 ? "[多图片消息]" : '[多视频消息]'
        }

        // 回复消息
        if (obj.msgType - 0 == 11) {
            var obj_ = null
            try {
                obj_ = JSON.parse(obj.msgContent)
                obj_.from.text = this.replaceEmojiPlaceholderToHTML(obj_.from.text)
                obj_.to.text = this.replaceEmojiPlaceholderToHTML(obj_.to.text)
                html_content = obj_.to.text
            } catch (e) { }
        }

        $('#im-chat-top-msg-title').text('置顶消息  #' + (index + 1))
        $('#im-chat-top-msg-content').text(html_content)

        // 遍历线条
        $('.top-line-item').css('background', 'rgba(0,186,255,0.2)')
        $('.line-' + (window.to_msg_show_index % 3)).css('background', 'rgba(0,186,255,1)')

        //绑定点击事件
        $('#im-chat-top-msg-left').unbind('click')
        $('#im-chat-top-msg-left').click(function () {
            // 处理点击事件
            var index_ = window.to_msg_show_index % window.top_msg_list.length
            const item_ = window.top_msg_list[index_]
            const mainContainer = $('#im-panel-main-chatcontentpane-wrap');
            const scrollToContainer = $('#' + item_[1]);
            if (scrollToContainer) {
                mainContainer.scrollTop(
                    scrollToContainer.offset().top - mainContainer.offset().top + mainContainer.scrollTop() - 50
                );
                $('#' + item_[1]).addClass('show-my-tip-select')
                setTimeout(() => {
                    $('#' + item_[1]).removeClass('show-my-tip-select')
                }, 1500);
            }

            window.to_msg_show_index = window.to_msg_show_index + 1;
            that.show_top_msg_ui(true);
        })

        // 右边点击
        $('#im-chat-top-msg-right').unbind('click')
        $('#im-chat-top-msg-right').click(function () {
            RBChatDialogHelper.showTopMsgUI();
        })

    }

    UIModule5.prototype.showAddFriendUI = function (beyongDataId) {
        const item = RosterProvider.getRosterData().find(item => item.user_uid == beyongDataId);
        $('#im-panel-main-chatcontentpane').append("<div class='chat-add-friend' id='chat-add-friend-" + beyongDataId + "'>对方开启了好友验证，你还不是他(她)的好友<br/> <a href='javascript:RBChatDialogHelper.showSendAddFriendReqForm(" + beyongDataId + ", \"" + item.nickname + "\")'>发送好友验证</a></div>")
    }

    // 处理在线的@消息
    UIModule5.prototype.showOnLineMyTip = function (msgItem, gid) {
        if (window.tip_msg_list) {
            window.tip_msg_list = []
        }
        window.tip_msg_list.push(msgItem);
        const time_ = localStorage.getItem('my_tip_' + gid)
        const list = window.tip_msg_list.filter(item => !time_ || item.date - time_ > 0);
        if (list && list.length > 0) {
            $('#im-panel-main-chat-tip-me').show();
            this.showMyTipInitEvent(gid);
            $('#tip-num').text(list.length)
        } else {
            $('#im-panel-main-chat-tip-me').hide();
        }
    }

    // 绘制是否显示@  ui
    UIModule5.prototype.showMyTip = function (list, gid) {
        const time = localStorage.getItem('my_tip_' + gid)
        // 获取到@ 我得消息 || 回复的消息
        const tip_msg_list = list.filter((item) => {
            var t = false;
            if (item.msgType - 0 == 12) {
                const obj_ = JSON.parse(item.text)
                const select_obj = obj_.select_obj;
                if (RBChatUtils.isTipMy(select_obj) && (!time || item.date - time > 0)) {
                    t = true;
                }
            }
            // 回复自己
            if (item.msgType - 0 == 11) {
                if ((!time || item.date - time > 0)) {
                    const obj_ = JSON.parse(item.text)
                    var myuid = LocalUserInfo.getUid();
                    t = obj_.from.uid == myuid
                }
            }
            return t;
        });
        $('#tip_my_' + gid).hide();
        // 赋值消息列表
        window.tip_msg_list = tip_msg_list && tip_msg_list.length > 0 ? tip_msg_list : [];

        if (window.tip_msg_list && window.tip_msg_list.length > 0) {
            $('#im-panel-main-chat-tip-me').show();
            $('#tip-num').text(window.tip_msg_list.length);
            this.showMyTipInitEvent(gid);

        } else {
            $('#im-panel-main-chat-tip-me').hide();
        }

    }
    /**
     * 处理点击事件
     */
    UIModule5.prototype.showMyTipInitEvent = function (gid) {
        $('#im-panel-main-chat-tip-me').unbind('click');
        $('#im-panel-main-chat-tip-me').click(function () {
            $('#tip_my_' + gid).hide();
            const time_ = localStorage.getItem('my_tip_' + gid)
            var find_obj = null;
            const list = window.tip_msg_list.filter(item => !time_ || item.date - time_ > 0);
            if (list && list.length > 0) {
                find_obj = list[0]
                $('#tip-num').text(list.length)
            } else {
                $('#im-panel-main-chat-tip-me').hide();
            }

            if (find_obj) {
                const mainContainer = $('#im-panel-main-chatcontentpane-wrap');
                const scrollToContainer = $('#' + find_obj.fingerPrintOfProtocal);
                mainContainer.scrollTop(
                    scrollToContainer.offset().top - mainContainer.offset().top + mainContainer.scrollTop()
                );
                localStorage.setItem('my_tip_' + gid, find_obj.date)

                // 添加css,1.5s 后消失
                $('#' + find_obj.fingerPrintOfProtocal).addClass('show-my-tip-select')
                setTimeout(() => {
                    $('#' + find_obj.fingerPrintOfProtocal).removeClass('show-my-tip-select')
                }, 1500);

                if (list.length == 1) {
                    $('#im-panel-main-chat-tip-me').hide();
                }

            } else {
                $('#im-panel-main-chat-tip-me').hide();
            }
        })
    }

    /**
     * 从本地JS缓存中加载聊天消息记录。
     *
     * @param alarmType 首页“消息”类型(见 AlarmMessageType )
     * @param dataId 数据的id
     */
    UIModule5.prototype.loadChatHistoryFromLocalCache = function (alarmMessageType, dataId) {
        RBChatUtils.logToConsole('【UI处理】正在从JS缓存中载入 alarmType=' + alarmMessageType + ', dataId=' + dataId + '的聊天记录。。。。');

        // 先清空当前的聊天消息显示
        this.clearChatPane();

        var isGroupChatting = (alarmMessageType == AlarmMessageType.groupChatMessage);

        //console.info('?????????????????????????????????????????? isGroupChatting='+isGroupChatting+', alarmMessageType='+alarmMessageType)

        var cachedHistory = (isGroupChatting ? GroupChattingCache.getChatCache(dataId) : SingleChattingCache.getChatCache(dataId));
        if (cachedHistory) {
            RBChatUtils.logToConsole('【UI处理】已经取到' + (isGroupChatting ? '[群聊]' : '[单聊]') + dataId + '的JS缓存聊天记录，记录数：' + cachedHistory.length + '！');

            //标准的for循环：遍历 Array[ChatMsgEntity对象] 数组
            this.insertChatItems(cachedHistory);
            //for(var i=0; i < cachedHistory.length; i++){
            //    insertChatItemWithP(cachedHistory[i]);
            //}
        }
        else {
            RBChatUtils.logToConsole('【UI处理】很不幸，目前不存在' + (isGroupChatting ? '[群聊]' : '[单聊]') + dataId + '的JS缓存聊天记录！');

            // 显示空数据ui
            this.setChatPaneEmpty();
        }
    };

    /**
     * 加载与某用户的一对一聊天（包括：好友聊天、陌生人聊天） 或 群聊历史记录。
     *
     * @param alarmMessageType 首页“消息”类型，见 AlarmMessageType
     * @param beyongDataId 数据id
     */
    UIModule5.prototype.loadChattingHistoryFromServer = function (alarmMessageType, beyongDataId) {

        var that = this;

        // 要截入的是群聊消息
        var isGroupChatting = (AlarmMessageType.groupChatMessage === alarmMessageType);
        var TAG = (isGroupChatting ? "群聊" : "一对一");

        // FIXME: 【可优化内容】未来如果聊天记录需要分页的话，本方法中进对chatHistoryCurrentPagesMap做进一步定义和细化
        if (this.chatHistoryCurrentPagesMap.contains(beyongDataId)) {

            RBChatUtils.logToConsole('[前端-GET-【接口1008-26-8】' + TAG + '聊天记录获取接口请求前] - dataId=' + beyongDataId
                + '的历史聊天记录已加载过，本次无需再加载（否则重复）【NO】。');
            return;
        }

        // 要加载的聊天记录的开始时间
        var startTime = null;
        // 要加载的聊天记录的结束时间
        var endTime = null;
        var QUERY_DATE_PATTERN = 'yyyy-MM-dd hh:mm:ss';

        // 【计算聊天记录的开始时间查询条件】：当前默认定义为加载15天内的聊天
        // 记录（见RBChatConfig.CHATTING_HISTORY_LOAD_TIME_INTERVAL常量定义）
        var dtForStart = new Date();
        dtForStart.setDate(dtForStart.getDate() - RBChatConfig.CHATTING_HISTORY_LOAD_TIME_INTERVAL);
        startTime = RBChatUtils.formatDate(dtForStart, QUERY_DATE_PATTERN);

        // 【计算聊天记录的结束时间查询条件】：如果当前缓存中已存在聊天消息数据，则取此时间作为加载的结束时间，
        // 这么做的原因，是防止当本地用户登陆后，已载离线聊天数据之后，首次点进聊天界面时，会重复加载历史，
        // 聊天记录的问题（因为之前加载的离线消息，早已进入了服务端的聊天记录中，本次如果不加这个查询截止
        // 时间，则数据当然就会被重复加载罗！）
        var firstChatMsgEntity = (isGroupChatting ? GroupChattingCache.getChatCacheFirst(beyongDataId) : SingleChattingCache.getChatCacheFirst(beyongDataId)); // 取出当天聊天缓存数据中的第一条消息对象
        if (firstChatMsgEntity) {
            var firstMsgTimestamp = firstChatMsgEntity.date; // 取出该条缓存消息的时间戳
            if (firstMsgTimestamp) {
                var dtForEnd = new Date();
                // 之所以将此时间主动减去1000毫秒，是因为服务端的SQL查询"BETWEEN AND"的右边界问题会导
                // 致该第一条消息还是会重，主动减1秒则下方formatDate(..)转时分秒格式后，就能保证不存在
                // 边界导致的查询重复（因为直接少了1秒啊）
                dtForEnd.setTime(firstMsgTimestamp - 1000);
                endTime = RBChatUtils.formatDate(dtForEnd, QUERY_DATE_PATTERN); // 将时间戳转了字符串日期格式（便于提前服务端接口使用）
            }
        }

        // 调用HTTP REST接口：“【1008-26-8】查询聊天消息记录”，接品返回值详细情况，详见接口文档或服务端代码。
        // 开始从服务端查询历史聊天记录并缓存到本地，同时尝试在ui上显示之
        RBChatRestHelper.queryChattingHistoryFromServer(
            isGroupChatting
            , beyongDataId
            , IMSDK.getLoginInfo().loginUserId, beyongDataId
            , "1"
            , startTime, endTime
            // 数据读取成功后的回调
            , function (returnValue) {

                // 服务端返回的是java 2维Vector<Vector>对象数组（相当于JS里的2维嵌套数组）
                var chattingHistoryList = JSON.parse(returnValue);
                // 如果返回数据大于0行
                if (chattingHistoryList && chattingHistoryList.length > 0) {// 正常处理完成的情况下接口约定为本字段存放Vector<Vector>结果

                    var chatHistoryDatas = [];

                    //标准的for循环：遍历 Array[Array对象] 2维数组
                    for (var i = 0; i < chattingHistoryList.length; i++) {
                        // 遍历内层数组
                        var row = chattingHistoryList[i];

                        // 解析一条聊天记录中的每个字段
                        // 注意：当srcUid=本地用户时，表示本条消息是“我”发出的，否则表示是收到的消息，这个逻辑一定别搞混了
                        var srcUid = row[0]
                            , destUid = row[1]
                            , chat_type = row[2]
                            , msg_type = row[3]
                            , msgContent = row[4]
                            , msgTime2Timestamp = row[5]
                            , fingerPrint = row[6]
                            , name = row[8]
                            , fingerPrintOfParent = row[7];

                        // true表示此行数据是群聊息，否则是单聊的
                        var returnIsGroupChatting = (chat_type == ChatModeType.CHAT_TYPE_GROUP$CHAT);
                        // true表示是“我”发出的消息，否则是“我”收到的消息（即对方发给“我”的）
                        var isOutgoing = (srcUid == IMSDK.getLoginInfo().loginUserId);
                        // 消息发送者的uid
                        var beyongUid = returnIsGroupChatting ? srcUid : (isOutgoing ? destUid : srcUid);
                        // 群组id（只在群聊消息时才有意义）
                        var gid = returnIsGroupChatting ? destUid : null;

                        //console.error('>>>>>> srcUid='+srcUid+', IMSDK.getLoginInfo().loginUserId='+IMSDK.getLoginInfo().loginUserId
                        //    +", isOutgoing?"+isOutgoing+", beyongUid="+beyongUid);

                        //## Bug FIX: 检查该fingerPrint的消息是否已存在于缓存中，如存在则不需要添加，否则就重
                        //##            复了，此为解决209170914日开会指出的存在聊天消息首次从历史加载时会重复的问题
                        if (fingerPrint) {
                            if (returnIsGroupChatting) {
                                if (GroupChattingCache.containsFingerPrintInChatCache(gid, fingerPrint)) {
                                    RBChatUtils.logToConsole('[前端-GET-【接口1008-26-8】' + TAG + '群聊天记录获取接口返回值解析后] - 来自dataId=' + beyongDataId + '的fp=' + fingerPrint
                                        + '的消息已存在于缓存中，不需要重复添加，继续循环的下一轮【!!】！');
                                    continue;
                                }
                            }
                            else {
                                if (SingleChattingCache.containsFingerPrintInChatCache(beyongUid, fingerPrint)) {
                                    RBChatUtils.logToConsole('[前端-GET-【接口1008-26-8】' + TAG + '单聊天记录获取接口返回值解析后] - 来自dataId=' + beyongDataId + '的fp=' + fingerPrint
                                        + '的消息已存在于缓存中，不需要重复添加，继续循环的下一轮【!!】！');
                                    continue;
                                }
                            }
                        }
                        //## Bug FIX END

                        var chatMsgEntity = null;
                        if (isOutgoing) {
                            chatMsgEntity = ChatMsgEntity.prepareSendedMessage(msgContent
                                , msgTime2Timestamp ? msgTime2Timestamp : 0, fingerPrint, msg_type);
                        }
                        else {
                            chatMsgEntity = ChatMsgEntity.prepareRecievedMessage(beyongUid
                                , beyongUid // TODO: 显示昵称？（从好友列表？从首页“消息”的item上取？
                                , msgContent, msgTime2Timestamp ? msgTime2Timestamp : 0, msg_type, fingerPrint);
                        }

                        if (returnIsGroupChatting)
                            // 群聊消息需要记录下扩散写前由消息发起者发出消息的原始指纹码（以便消息"撤回"功能时使用）
                            chatMsgEntity.fingerPrintOfParent = fingerPrintOfParent;
                        if (name) {
                            chatMsgEntity.name = name;
                        }
                        if (msg_type - 0 == 9) {
                            chatMsgEntity.msgType = 9;
                        }
                        // 放入数组
                        chatHistoryDatas.push(chatMsgEntity);
                    }


                    // 聊天记录放入缓存中缓存起来并决定是否要在聊天内容面板中显示
                    if (chatHistoryDatas.length > 0) {
                        RBChatUtils.logToConsole('[前端-GET-【接口1008-26-8】' + TAG + '聊天记录获取接口返回值解析后] - 获取的聊天记录条数为'
                            + chatHistoryDatas.length + '，马上放入缓存并决定是否需要显示到聊天内容面板哦！', true);

                        if (isGroupChatting) {
                            GroupChattingCache.putChatCaches(beyongDataId, chatHistoryDatas, true);
                        }
                        else {
                            // 数据放入与该用户聊天的缓存里存起来（以备后续使用）
                            SingleChattingCache.putChatCaches(beyongDataId, chatHistoryDatas, true);
                        }

                        // 如果获取的聊天记录对象正是属于当前正在聊天着的用户，则把
                        // 聊天消息同时也显示到聊天内容面板中以便即时查看;
                        if (RBChatMainUI.isCurrentSelectedAlarm(AlarmMessageType.tempChatMessage, beyongDataId)
                            || RBChatMainUI.isCurrentSelectedAlarm(AlarmMessageType.reviceMessage, beyongDataId)
                            || RBChatMainUI.isCurrentSelectedAlarm(AlarmMessageType.groupChatMessage, beyongDataId)) {

                            // 放到当前聊天内容的前面显示
                            RBChatChattingContentPaneUI.insertChatItems(chatHistoryDatas, true);
                            RBChatChattingContentPaneUI.scrollToBottom4IM();
                        }
                    }
                    else {
                        // log('[前端-GET-【接口1008-26-8】'+TAG+'聊天记录获取接口返回值解析后] - 聊天记录条数为0，无更多聊天记录哦！', true);

                        var needSetChatPaneEmpty = false;
                        if (isGroupChatting) {
                            if (GroupChattingCache.getChatCacheLength(beyongDataId) === 0)
                                needSetChatPaneEmpty = true;
                        }
                        else {
                            if (SingleChattingCache.getChatCacheLength(beyongDataId) === 0)
                                needSetChatPaneEmpty = true;
                        }

                        if (needSetChatPaneEmpty)
                            // 显示空数据ui
                            this.setChatPaneEmpty();
                    }
                }
                else {
                    RBChatUtils.logToConsole('[前端-GET-【接口1008-26-8】' + TAG + '聊天记录获取接口返回值解析后] 聊天记录为空，' +
                        '无需进入ui处理代码。(returnValue=' + returnValue + ')', true);
                }

                // 设置已读聊天记录的标识
                that.chatHistoryCurrentPagesMap.set(beyongDataId, 'N/A');
            }
            // 数据加载失败后的回调
            , function (errorThrownStr) {
                //alert('聊天历史记录数据读取出错，原因是：'+errorThrownStr);
                RBChatDialogHelper.showAlertDialog_WARN('加载失败', TAG + '聊天历史记录数据加载出错，可能是网络故障，请稍后再试！');
            }
        );
    };


    //## 消息撤回功能相关的实现方法 START --------------------------------

    /**
     * 显示进度提示框。
     *
     * @param fpForMessage {String} 被撤回消息对应的指纹码（如果是群聊，则此指纹码实际指的是父指纹码——即fingerPrintOfParent）
     */
    UIModule5.prototype.showMessageRevokingProgess = function (fpForMessage) {
        RBMessageRevokingDialogProgess.show(fpForMessage)
    };

    /**
     * 隐藏消息撤回进度提示框的显示。
     *
     * @param enforce {boolean} true表示无条件强制进度提示框的显示，false表示只有当 fpForMessage 参数与当前正在撤回的指纹码一致才会取消显示哦
     * @param fpForMessage {String} 被撤回消息对应的指纹码（如果是群聊，则此指纹码实际指的是父指纹码——即fingerPrintOfParent）
     */
    UIModule5.prototype.hideMessageRevokingProgess = function (enforce, fpForMessage) {
        RBMessageRevokingDialogProgess.hide(enforce, fpForMessage);
    };

    /**
     * 消息"删除"功能实现（有确认对话框）。
     *
     * @param chatType 聊天类型，see {@link ChatModeType}
     * @param fpForMessage  被删除消息的指纹码
     * @param forId 群聊时这表示群id，否则表示好友或陌生人uid
     */
    UIModule5.prototype.doMessageDelete = function (chatType, fpForMessage, forId, fn_forServerDeleteSucess) {

        var that = this;

        // 对话框id，为了防止全局取id对象发生冲突，建议必须使用
        var dialogId = RBChatDialogHelper.nextDialogId();
        // 点击确认按钮要执行的回调函数
        var fn_submitCallback = function () {
            RBChatDialogHelper.closeDialog(dialogId);

            // 调用HTTP REST接口：“【接口1008-4-23】删除单条聊天消息记录”，具体参数和返回值，详见接口文档或服务端代码。
            RBChatRestHelper.submitDeleteChattingSingleMsgToServer(fpForMessage
                // 成功后的回调
                , function (returnValue) {

                    if (returnValue) {

                        // 返回值为1 表示更新成功，否则失败（详见http rest 手册中的“【接口1008-4-23】”的返回值说明）
                        if ('1' == returnValue) {

                            // // 先关闭当前修改对话框
                            // that.closeDialog(dialogId);

                            RBChatToastHelper.showToast_OK('删除成功', null);

                            // 服务端数据库里的聊天记录成功后，接着将进行浏览器端的ui等本地相关逻辑处理
                            that.doMessageDeleteImpl(chatType, fpForMessage, forId);

                            // 通知调用者
                            if (fn_forServerDeleteSucess)
                                fn_forServerDeleteSucess();

                            return;
                        }
                        else {
                            //alert('个人信息修改失败，请稍后再试！');
                            RBChatDialogHelper.showAlertDialog_ERROR('删除失败', '消息删除失败，请稍后再试！');
                        }
                    }
                }
                // 失败后的回调
                , function (errorThrownStr) {
                    RBChatDialogHelper.showAlertDialog_ERROR('删除失败', '消息删除失败，可能是网络故障，请稍后再试！');
                }
            );
        };

        RBChatDialogHelper.showConfrimDialog("确认操作", "确认"
            , "此操作将彻底删除消息，无法恢复，确认要这样做吗？", dialogId, fn_submitCallback);
    };

    /**
     * 消息"删除"功能实现。
     *
     * @param chatType {int} 聊天类型，see {@link ChatModeType}
     * @param fpForMessage {String} 被删除消息的指纹码
     * @param forId {String} 群聊时这表示群id，否则表示好友或陌生人uid
     */
    UIModule5.prototype.doMessageDeleteImpl = function (chatType, fpForMessage, forId) {

        let result = null;

        // 先从内存中的消息列表中删除该消息对象（进而会通知ui层刷新聊天界面中的显示）
        let alrmType = -1;
        if (chatType === ChatModeType.CHAT_TYPE_FRIEND$CHAT || chatType === ChatModeType.CHAT_TYPE_GUEST$CHAT) {
            result = SingleChattingCache.removeChatCacheByFp(forId, fpForMessage);
        }
        else if (chatType === ChatModeType.CHAT_TYPE_GROUP$CHAT) {
            result = GroupChattingCache.removeChatCacheByParentFp(forId, fpForMessage);
        }
        else {
            RBChatUtils.logToConsole_WARN("doMessageDeleteImpl时，无效的chatType=" + chatType + "，doMessageDelete无法继续！")
            return;
        }

        // 如果被删除的是最后一条消息，则要同时更新首页"消息"列表中的内容显示（应显示为被删除前的倒数第2条消息内容），
        // 否则该消息已被删除但首页列表中显示的还是已被删除消息内容，ui上看起来它就是个bug了，很不友好！
        if (result) {
            // 上面的消息删除操作已成功，才需要继续余下的逻辑哦
            if (result.deletedSucess) {

                // 不同消息类型，对应的首页"消息"列表中的Alarm类型
                if (chatType === ChatModeType.CHAT_TYPE_FRIEND$CHAT) {
                    alrmType = AlarmMessageType.reviceMessage;
                }
                else if (chatType === ChatModeType.CHAT_TYPE_GUEST$CHAT) {
                    alrmType = AlarmMessageType.tempChatMessage;
                }
                else if (chatType === ChatModeType.CHAT_TYPE_GROUP$CHAT) {
                    alrmType = AlarmMessageType.groupChatMessage;
                }

                // RBChatUtils.logToConsole_INFO("》》》》》》》》》》》》result.isLast()="+result.last);

                // 如果刚才删除的是该聊天会话的最后一条消息则就要更新首页消息列表的内容显示
                if (result.last) {
                    let previousDeletedMessage = result.previousDeletedMessage;

                    // 更新首页消息内容
                    let newAlarmContent = "";
                    if (previousDeletedMessage) {
                        newAlarmContent = MessageHelper.parseMessageForShow(previousDeletedMessage.text, previousDeletedMessage.msgType);
                    }
                    RBChatAlarmsUI.updateItemContent(alrmType, forId, previousDeletedMessage ? previousDeletedMessage.date : 0, newAlarmContent, null);
                }
            }
        }
    };

    /**
     * 消息"撤回"功能实现。
     *
     * @param chatType {int} 聊天类型，see {@link ChatModeType}
     * @param message {ChatMsgEntity} 要撤回的消息位于聊天列表数据模型中的消息对象
     * @param toId {String} 群聊时这表示群id，否则表示好友或陌生人uid
     */
    UIModule5.prototype.doMessageRevoking = function (chatType, message, toId) {

        if (!message) {
            console.log('1')
            RBChatUtils.logToConsole_WARN("【消息撤回】doMessageRevoking中，message == null！");
            RBChatDialogHelper.showAlertDialog_WARN("出错了", "不合法的消息数据，无法撤回！");
            return;
        }

        //** 最终再次进行消息撤回时限检查，防止用户故意弹出菜单后，等超时时间过，仍然点击“撤回”菜单项的bug！
        // var isGroupOwner = (chatType == ChatModeType.CHAT_TYPE_GROUP$CHAT && GroupsProvider.isThisGroupOwner(toId));
        // // 群管理员可无条件、无时限地撤回所有消息（包括自已发出的、别人发出的），否则只能撤回规定时限内的消息
        // if (!isGroupOwner) {
        //     console.log('2')
        //     // 消息超限检查
        //     if (!this.messageIsNotTimeoutForRevoke(message)) {
        //         RBChatDialogHelper.showAlertDialog_WARN("无法撤回", "只能撤回" + RBChatConfig.CHATTING_MESSAGE_CAN_BE_REVOKE_TIME + "分钟内的消息！");
        //         return;
        //     }
        // }

        var isGroupChat = (chatType == ChatModeType.CHAT_TYPE_GROUP$CHAT);
        // 被撤回消息对应的指纹码（也就是唯一消息ID啦）
        var fpForMessage = (isGroupChat ? message.fingerPrintOfParent : message.fingerPrintOfProtocal);

        // 显示撤回进度提示框
        this.showMessageRevokingProgess(fpForMessage);

        // 准备好将要发出的"撤回"指令的指令内容
        var contentForRevokeCMD = RBMessageRevokingManager.constructRevokedMetaForOperator(fpForMessage
            // 是群聊 且 撤回的是别人的消息时，需要传入被撤回消息发送者的uid
            , isGroupChat && !message.isOutgoing ? message.uid : null
            // 是群聊 且 撤回的是别人的消息时，需要传入被撤回消息发送者的昵称
            , isGroupChat && !message.isOutgoing ? message.name : null);// RevokedMeta
        if (contentForRevokeCMD == null){
            console.log('撤回消息构建失败')
            return;
        }
           
        // 为将要发出的"撤回"指令准备好指纹码
        var fpForRevokeCMD = MBProtocalFactory.genFingerPrint();

        // 加入消息撤回管理器！
        var messageWillBeRevoke = RBMessageRevokingManager.constructMessageBeRevoke(chatType, message);
        console.log('撤回消息',messageWillBeRevoke,currentSelectedAlarmType)
        if (messageWillBeRevoke != null) {
            // 撤回管理器中执行"开始"撤回逻辑
            RBMessageRevokingManager.revokeStart(fpForRevokeCMD, messageWillBeRevoke);

            var currentSelectedAlarmType = RBChatMainUI.getCurrentSelectedAlarmType();
            var currentSelectedAlarmDataId = RBChatMainUI.getCurrentSelectedAlarmDataId();

            // 是好友聊天类型的消息撤回指令
            if (currentSelectedAlarmType == AlarmMessageType.reviceMessage) {
                console.log('好友消息撤回', contentForRevokeCMD)
                // 回调中的msgBody值，详见：http://docs.52im.net/extend/docs/api/rainbowchatserver4_pro/com/x52im/rainbowchat/im/dto/MsgBody4Friend.html
                MessageHelper.sendMessage(MsgType.TYPE_REVOKE, currentSelectedAlarmDataId, JSON.stringify(contentForRevokeCMD), function (isSucess, msgBody) {
                    if (isSucess) {

                        var friendUid = currentSelectedAlarmDataId;
                        var ree = RosterProvider.getFriendInfoByUid(friendUid);

                        // 撤回消息时，也同步更新首页“消息”列表中的显示，这样从体验上来说更合理一些
                        var alarmMessageDTO = AlarmsProvider.createChatMsgAlarmForLocal(msgBody.ty, msgBody.m, ree.nickname, friendUid);
                        RBChatAlarmsUI.insertOrUpdate(alarmMessageDTO, true);

                        // var chatMsgEntity = ChatMsgEntity.prepareSendedMessage(msgBody.m, 0, fingerPrint, msgType);
                        //
                        // // 将此条消息存入缓存并在UI上显示
                        // RBChatMainUI.processRecivedMessage(true, false, alarmMessageDTO, chatMsgEntity);
                        //
                        // // 发送完成的提示音，提升用户体验
                        // //if(msgType == MsgType.TYPE_IMAGE
                        // //    || msgType == MsgType.TYPE_FILE){
                        // AudioPromptHelper.fileSentPromt();
                        // //}
                    }
                }, fpForRevokeCMD);
            }
            // 发送的是陌生人/临时聊天类型的消息撤回指令
            else if (currentSelectedAlarmType == AlarmMessageType.tempChatMessage) {

                // 回调中的msgBody值，详见：http://docs.52im.net/extend/docs/api/rainbowchatserver4_pro/com/x52im/rainbowchat/im/dto/MsgBody4Guest.html
                TMessageHelper.sendGuestMessage(MsgType.TYPE_REVOKE, currentSelectedAlarmDataId, JSON.stringify(contentForRevokeCMD), function (isSucess, msgBody) {
                    if (isSucess) {

                        var guestUid = currentSelectedAlarmDataId;

                        // 撤回消息时，也同步更新首页“消息”列表中的显示，这样从体验上来说更合理一些
                        var alarmMessageDTO = AlarmsProvider.createATempChatMsgAlarmForLocal(msgBody.ty, msgBody.m
                            , null//msgBody.nickName// 这个字段值就是对方的nickname，但在web端不太好取，而此处可以设为null的
                            // 逻辑是因为本地发出的消息必定是选中了已存在首页陌生人“消息”item，所以此处为null地无谓（因为刷新item时不需要刷新title）
                            , guestUid);
                        RBChatAlarmsUI.insertOrUpdate(alarmMessageDTO, true);

                        // var chatMsgEntity = ChatMsgEntity.prepareSendedMessage(msgBody.m, 0, fingerPrint, msgType);
                        //
                        // // 将此条消息存入缓存并在UI上显示
                        // RBChatMainUI.processRecivedMessage(true, false, alarmMessageDTO, chatMsgEntity);
                        //
                        // // 发送完成的提示音，提升用户体验
                        // //if(msgType == MsgType.TYPE_IMAGE
                        // //    || msgType == MsgType.TYPE_FILE){
                        // AudioPromptHelper.fileSentPromt();
                        // //}
                    }
                }, fpForRevokeCMD);
            }
            // 发送的是群聊消息撤回指令
            else if (currentSelectedAlarmType == AlarmMessageType.groupChatMessage) {
                console.log('发送了，群小撤回消息')
                // 回调中的msgBody值，详见：http://docs.52im.net/extend/docs/api/rainbowchatserver4_pro/com/x52im/rainbowchat/im/dto/MsgBody4Group.html
                GMessageHelper.sendGroupMessage(MsgType.TYPE_REVOKE, currentSelectedAlarmDataId, JSON.stringify(contentForRevokeCMD), function (isSucess, msgBody, currentChattingGe) {
                    if (isSucess) {

                        var gid = currentSelectedAlarmDataId;

                        // 撤回消息时，也同步更新首页“消息”列表中的显示，这样从体验上来说更合理一些
                        var alarmMessageDTO = AlarmsProvider.createAGroupChatMsgAlarmForLocal(msgBody.ty, msgBody.m, currentChattingGe.g_name, gid);
                        RBChatAlarmsUI.insertOrUpdate(alarmMessageDTO, true);

                        // // 消息数据对象
                        // var chatMsgEntity = ChatMsgEntity.prepareSendedMessage(msgBody.m, 0, fingerPrint, msgType);
                        // // 本地发出的群聊消息作为到服务端被扩散写为其它群员消息的"父"消息，是没有"父"指纹码的，为了
                        // // 让处理本地发出的和收到的群聊消息在撤回逻辑上的代码，所以把自身的这条消息的指纹码也填到了
                        // // fingerPrintOfParent字段里，这在逻辑上并没有什么问题，可以放心处理
                        // chatMsgEntity.fingerPrintOfParent = msgBody.parentFp;
                        //
                        // // 将此条消息存入缓存并在UI上显示
                        // RBChatMainUI.processRecivedMessage(true, true, alarmMessageDTO, chatMsgEntity);
                        //
                        // // 发送完成的提示音，提升用户体验
                        // //if(msgType == MsgType.TYPE_IMAGE
                        // //    || msgType == MsgType.TYPE_FILE){
                        // AudioPromptHelper.fileSentPromt();
                        // //}
                    }
                }, fpForRevokeCMD);
            }

            // // 发送撤回指令
            // if(chatType == ChatModeType.CHAT_TYPE_FRIEND$CHAT)
            //     MessageHelper.sendRevokeMessageAsync(this, fpForRevokeCMD, toId, contentForRevokeCMD, null);
            // else if(chatType == ChatModeType.CHAT_TYPE_GUEST$CHAT)
            //     TMessageHelper.sendRevokeMessageAsync(this, fpForRevokeCMD, toId, toName, contentForRevokeCMD, null);
            // else if(chatType == ChatModeType.CHAT_TYPE_GROUP$CHAT)
            //     GMessageHelper.sendRevokeMessageAsync(this, fpForRevokeCMD, toId, contentForRevokeCMD, null);
            else
                RBChatUtils.logToConsole_WARN("【消息撤回】发送撤回指令，无效的chatType=" + chatType);
        }
        else {
            RBChatUtils.logToConsole_WARN("【消息撤回】撤回指令发出前MessageBeRevoke.create后，messageBeRevoke==null!");
            RBChatDialogHelper.showAlertDialog_WARN("出错了", "无效的消息数据，无法撤回！");
        }
    };

    /**
     * 该消息是否可被撤回（子类可重写本方法实现自已的“撤回”功能权限可用逻辑）.
     *
     * @param chatType {int} 聊天类型，see {@link ChatModeType}
     * @param d {ChatMsgEntity} 聊天消息数据对象
     * @param gid {String} 本字段仅在群聊时有意义，否则请传null
     * @return {boolean} true表示该消息可被撤回
     */
    UIModule5.prototype.messageCanBeRevoke = function (chatType, chatMsgEntity, gid) {
        if (chatMsgEntity) {
            // 群聊的权限复杂一些
            if (chatType == ChatModeType.CHAT_TYPE_GROUP$CHAT) {
                // 除系统消息、已被撤回的消息
                if (chatMsgEntity.msgType != MsgType.TYPE_SYSTEAM$INFO && chatMsgEntity.msgType != MsgType.TYPE_REVOKE) {
                    // 管理员有权限撤回别人的消息
                    var isGroupOwner = GroupsProvider.isThisGroupOwner(gid);
                    // 群管理员可无条件、无时限地撤回所有消息（包括自已发出的、别人发出的）
                    if (isGroupOwner)
                        return true;
                    // 非管理员则只能撤回自已发出的 且 在撤回时限内的消息
                    else {
                        if (chatMsgEntity.isOutgoing) {
                            return this.messageIsNotTimeoutForRevoke(chatMsgEntity);
                        }
                    }
                }
            }
            // 单聊时
            else {
                // 除系统消息、已被撤回的消息
                if (chatMsgEntity.msgType != MsgType.TYPE_SYSTEAM$INFO && chatMsgEntity.msgType != MsgType.TYPE_REVOKE) {
                    // 只能撤回自已发出的 且 在撤回时限内的消息
                    if (chatMsgEntity.fingerPrintOfProtocal && chatMsgEntity.isOutgoing) {
                        return this.messageIsNotTimeoutForRevoke(chatMsgEntity);
                    }
                }
            }
        }

        return false;
    };

    /**
     * 该消息是否未超出撤回时限.
     *
     * @param d {ChatMsgEntity} 聊天消息数据对象
     * @return {boolean} true表示该消息在超时时限内
     */
    UIModule5.prototype.messageIsNotTimeoutForRevoke = function (d) {
        var cur = RBChatUtils.getCurrentUTCTimestamp();//System.currentTimeMillis();
        if (d.date > 0 && cur - d.date < RBChatConfig.CHATTING_MESSAGE_CAN_BE_REVOKE_TIME * 60 * 1000) {
            return true;
        }
        return false;
    };

    //## 消息撤回功能相关的实现方法 END   --------------------------------


    var thisModule = new UIModule5();
    thisModule.initEventProcess();     // 进行键盘事件等处理初始化！
    thisModule.initShotcutWords();     // 进行快键回复功能的初始化！
    thisModule.initEmoji();            // 进行表情功能的初始化！
    thisModule.initClearChatContents();// 进行清空聊天界面功能的初始化！
    thisModule.initLocationMsgSend();  // “位置”消息功能的初始化！
    thisModule.initContactMsgSend();   // “名片”消息功能的初始化！

    return thisModule;// 此种方式用于构造器的方式
})();
