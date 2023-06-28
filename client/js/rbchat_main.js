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
'use strict';

/**
 * Created by Administrator on 18-10-24.
 */


(function () {

    /************************************ 全局其它变量 ************************************/
    var mCurrentSelectedAlarmType = -1;  // 左侧列表中当前选中的数据类型
    var mCurrentSelectedAlarmDataId = null;  // 左侧列表中当前选中的数据主键id



    //#################################################################### 【1】初始化方面代码 START
    function initAll() {

        // 初始化本地用户信息
        LocalUserInfo.initFromCookie();

        // 初始化IMSDK
        initIMSDK();
    }

    function initIMSDK() {
        IMSDK.setDebugEnable(false);          // 开启框架的log输出
        IMSDK.setDebugPingPongEnable(false); // 关闭底层socket.io的心跳Log输出，否则心跳Log会太频繁而干其它更重要的Log查看

        // 【WEBIM的SDK调用第1步：设置回调函数】
        IMSDK.callback_onIMData = onIMData;
        IMSDK.callback_onIMLog = log;
        IMSDK.callback_onIMAfterLoginSucess = onIMAfterLoginSucess;
        IMSDK.callback_onIMDisconnected = onIMDisconnected;
        IMSDK.callback_onIMReconnectSucess = onIMReconnectSucess;
        IMSDK.callback_onIMPing = onIMPing;
        IMSDK.callback_onIMPong = onIMPong;
        IMSDK.callback_onIMMessagesLost = onIMMessagesLost;
        IMSDK.callback_onIMMessagesBeReceived = onIMMessagesBeReceived;
        IMSDK.callback_onIMShowAlert = onIMShowAlert;
    }

    //#################################################################### 【1】初始化方面代码 END


    //#################################################################### 【2】UI界面功能的综合性组织代码 START

    /**
     * Log a message。
     *
     * @param message
     * @param toConsole
     */
    function log(message, toConsole) {
        // //添加系统消息
        // var html = '['+RBChatUtils.formatDate(new Date(), 'hh:mm:ss.S') + '] ' + message;
        // console.info(html);
        RBChatUtils.logToConsole_DEBUG(message, toConsole);
    }

    //#################################################################### 【2】UI界面功能的综合性组织代码 END


    /**
     * 一条消息的完整处理和UI显示逻辑。
     *
     * @param isme true表示是“我”发出的消息
     * @param isGroupChatting true表示是群聊消息
     * @param alarmMessageDTO 首页“消息”中的item对应的数据封装对象（即AlarmMessageDTO对象）
     * @param chatMsgEntity 聊天界面中的一条消息，对应的数据封装对象（即ChatMsgEntity对象）
     */
    function processRecivedMessage(isme, isGroupChatting, alarmMessageDTO, chatMsgEntity, isGroupSend=false) {

        var needInsertToContentPane = false;
        var needShowUnreadNum = false;
        //// 这是列表中的首个到来的在线用户消息
        //var firstOnlineUser = false;

        //var alarmMessageDTO = AlarmsProvider.createAuto(p);

        log('【消息处理】[isme?' + isme + '] 一条新的消息正要显示到聊天面板里。。。。（普通消息:' + JSON.stringify(chatMsgEntity) + '）', true);
        var isGroupSome = false; //是否是群内消息重复
        if (chatMsgEntity) {

             //回复消息
             if(chatMsgEntity.msgType - 0 ==11){
                const msg_obj = JSON.parse(chatMsgEntity.text); //消息提
                var  isReplyMe = false;
                var myuid = LocalUserInfo.getUid();
                isReplyMe = msg_obj.from.uid == myuid
                if(isReplyMe){
                    RBChatChattingContentPaneUI.showOnLineMyTip(chatMsgEntity,alarmMessageDTO.dataId)
                }
            }

            // 保证数据进入缓存数据列表
            if (isGroupChatting) {
                //过滤重复性
                // const  t = chatMsgEntity.fingerPrintOfParent;
                // const list = GroupChattingCache.getChatCache(alarmMessageDTO.dataId)
                // if(list){
                //     const findList = list.filter(item=> t && item.fingerPrintOfParent == t); //指纹码是否一致
                //     isGroupSome = findList && findList.length > 0;
                // }
                if(!isGroupSome){
                    GroupChattingCache.putChatCache(alarmMessageDTO.dataId, chatMsgEntity, false);
                }
                 // 判断是否是@消息,且在当前界面
                 if(chatMsgEntity.msgType - 0 == 12){
                    const msg_obj = JSON.parse(chatMsgEntity.text); //消息提
                    //判断是否@了全部 或者 自己
                    const  select_obj = msg_obj.select_obj;
                      // 出现了@自己 || 回复自己
                    if((RBChatUtils.isTipMy(select_obj)) && isCurrentSelectedAlarm(alarmMessageDTO.alarmMessageType, alarmMessageDTO.dataId)){
                        RBChatChattingContentPaneUI.showOnLineMyTip(chatMsgEntity,alarmMessageDTO.dataId)
                    }
                 }
                
            } else {
                // const t = chatMsgEntity.fingerPrintOfProtocal;
                // const list =  SingleChattingCache.getChatCache(alarmMessageDTO.dataId)
                // if(list){
                //     const findList = list.filter(item=> t && item.fingerPrintOfProtocal == t); //指纹码是否一致
                //     isGroupSome = findList && findList.length > 0;
                // }
                if(!isGroupSome){
                    SingleChattingCache.putChatCache(alarmMessageDTO.dataId, chatMsgEntity, false);
                }
            }
        }

        if (alarmMessageDTO) {
            // 插入或更新首页“消息”item
            RBChatAlarmsUI.insertOrUpdate(alarmMessageDTO, true,isGroupSend);
        }

        // if (!isme) {
        //     // 如果现在收到的消息正是属于当前正在聊天着的用户，则不需要在左另用户列表上显示未读标识
        //     if (isCurrentSelectedAlarm(alarmMessageDTO.alarmMessageType, alarmMessageDTO.dataId)) {
        //         needInsertToContentPane = true;
        //     }
        //     // 否则显示未读标识
        //     else {
        //         needShowUnreadNum = true;
        //     }
        // }
        // // 自已发出的消息
        // else {
        //     // 自已发出的消息（自已发出的时候肯定是处于当前聊天窗口焦点的时候，无条件放入聊天内容面板于以显示）
        //     needInsertToContentPane = true;
        // }

         // 如果现在收到的消息正是属于当前正在聊天着的用户，则不需要在左另用户列表上显示未读标识
         if (isCurrentSelectedAlarm(alarmMessageDTO.alarmMessageType, alarmMessageDTO.dataId)) {
            needInsertToContentPane = true;
        }
        // 否则显示未读标识
        else {
            needShowUnreadNum = true;
        }

        // console.log('消息--',isme,isCurrentSelectedAlarm(alarmMessageDTO.alarmMessageType, alarmMessageDTO.dataId),needInsertToContentPane)

        // 群发不需要显示未读
        if(isGroupSend){
            needShowUnreadNum = false;
        }
        // ui上显示未读标识
        if (needShowUnreadNum) {
            //setOnlineVisitorUnread(p.from, 1);
            RBChatAlarmsUI.addUnread(alarmMessageDTO.alarmMessageType, alarmMessageDTO.dataId, 1);
        }
        // ui上显示该条消息
        // 说明：当firstOnlineUser==true时会默认调用selectedOnlineVisitor()，而此方法会载
        //      入存在JS缓存中的聊天记录，所以此时就不需要以下硬插入到消息界面了，否则就重复了哦
        if (needInsertToContentPane) {//} && !firstOnlineUser) {
            if (chatMsgEntity && !isGroupSome) {
                // 插入一条消息显示到消息面板上
                RBChatChattingContentPaneUI.insertChatItemWithP(chatMsgEntity);
            }
        }

        // 自动滚动底部（以便即时显示最新消息）
        if(needInsertToContentPane && RBChatChattingContentPaneUI.isScrollToBottom())
            RBChatChattingContentPaneUI.scrollToBottom4IM();

        // 如果当前首页的"消息"tab处于不可见状态，则设置“在线队列”的ui上显示一个新消息提示红点点
        if (!isme && !RBChatMainWindowUI.isAlarmsTabSelected()) {
            RBChatMainWindowUI.setAlarmsUIHasMsg(true);
        }

        // 主界面的header上必要的时候显示一个大红点提示有新消息（提示的前提是聊天窗处理关闭时）
        if (!isme)
            RBChatMainWindowUI.setHeaderNotificatonNewMsgHint(true);
    }

    /**
     * 一条消息撤回指令的完整处理和UI显示逻辑。
     *
     * @param chatType {int} 聊天类型，see {@link ChatModeType}
     * @param fpForRevokeCMD {String} 撤回指令本身的指纹码
     * @param fromId {String} 一对一聊天时此参数表示对方的uid，群聊时表示是群id
     * @param messageContent {String} 消息撤回指令的内容（也就是{@link RevokedMeta}对象转JSON后的文本）
     */
    function processRecivedRevokeCMD(chatType, fpForRevokeCMD, fromId, messageContent) {
        var messageContentObj = JSON.parse(messageContent);// RevokedMeta
        if (messageContentObj && messageContentObj.fpForMessage) {

            // //*** 更新本地sqlite数据库
            // long row = MessageRevokingManager.updateSQLiteForMessage(chatType, messageContentObj.getFpForMessage(), messageContentObj);
            // Log.i(TAG, "【消息撤回】被撤回消息时，updateSQLiteForMessage完成，影响row="+row+"。(messageContentObj="+messageContentObj+"，fpForRevokeCmd="+fpForRevokeCMD+")");

            var originalMessage = null;// ChatMsgEntity
            //*** 更新消息列表数据对象内容
            if (chatType == ChatModeType.CHAT_TYPE_FRIEND$CHAT || chatType == ChatModeType.CHAT_TYPE_GUEST$CHAT) {
                originalMessage = SingleChattingCache.findMessageByFingerPrint(fromId, messageContentObj.fpForMessage);
            }
            else if (chatType == ChatModeType.CHAT_TYPE_GROUP$CHAT) {
                originalMessage = GroupChattingCache.findMessageByParentFingerPrint(fromId, messageContentObj.fpForMessage);
            }
            else {
                log("【消息撤回】未知的chatType=" + chatType + ", processRevokeMessage_incoming无法继续！");
                return;
            }
            //			Log.i(TAG, "【=A=】被撤回消息updateModelForMessage前，originalMessage="+originalMessage);

            if (originalMessage) {
                var sucess = RBMessageRevokingManager.updateModelForMessage(chatType, messageContentObj, originalMessage, fpForRevokeCMD, messageContentObj.fpForMessage);
                if (sucess) {
                    log("【消息撤回】被撤回消息时，updateModelForMessage成功了。(messageContentObj=" + JSON.stringify(messageContentObj) + "，fpForRevokeCmd=" + fpForRevokeCMD + ")");
                    //					Log.i(TAG, "【=B1=】被撤回消息updateModelForMessager后，originalMessage="+originalMessage);
                    //					Log.i(TAG, "【=B2=】被撤回消息updateModelForMessager后，originalMessage="+originalMessageBBB);
                }
                else {
                    log("【消息撤回】被撤回消息时，updateModelForMessage失败了！(messageContentObj=" + JSON.stringify(messageContentObj) + "，originalMessage=" + JSON.stringify(originalMessage) + "，fpForRevokeCmd=" + fpForRevokeCMD + ")");
                }
            }
            else {
                log("【消息撤回】被撤回消息时，正准备updateModelForMessage，但数据为空，originalMessage=null");
            }
        }
        else {
            log("【消息撤回】被撤回消息时，正准备updateSQLiteForMessage等，但数据为空，messageContentObj=" + messageContentObj);
        }
    }



    //#################################################################### 【6】IM相关代码 START

    //function doStartupIM(){
    //}

    /**
     * 登陆/连接到IM服务器的实现方法。
     */
    function doLoginIMServer() {
        var loginUserId, loginToken;

        // 读取在登陆界面通过SSO单点登陆接口等方式认证后的完整用户身份信息，以便连接IM服务器时使用
        // 说明：一个典型的IM系统的登陆，通常会分为2步：即1）通过http的sso单点接口认证身份并返回合
        //      法身份数据、2）将认证后的身份信息（主要是loginUserId和token）提交给IM服务器，再由
        //      IM服务器进行IM长连接的合法性检查，进而决定是否允许此次socket长连接的建立.
        var localAuthedUserInfo = LocalUserInfo.getObj();//RBChatUtils.getAuthedLocalUserInfoFromCookie();

        // 具体对象字段，详见：
        // http://docs.52im.net/extend/docs/api/rainbowchatserver4_pro/com/x52im/rainbowchat/http/logic/dto/RosterElementEntity.html
        if (localAuthedUserInfo) {
            loginUserId = localAuthedUserInfo.user_uid;
            loginToken = localAuthedUserInfo.token;

            if (!loginUserId) {
                log('【doLoginIMServer】虽读取到用户的http认证后身份信息，但字段loginUserId读取为空，' +
                    '这是不合法的数据，即将跳转到登陆页面。。。', true);

                // 跳转到登陆页面，让用户首先完成http的sso单点身份证认证
                gotoLoginPage();
            }
            else {
                // 组织好要提交到im服务器的连接身份信息
                var loginIMServerInfo = {
                    loginUserId: loginUserId, // 本字段为RainbowChat系统中的用户唯id，是全系统的唯一标识
                    loginToken: loginToken,   // 此token为上一步中的http sso单点登陆接口返回，现提交给im服务器用于验证此次连接者的身份是否合法（不需要单独验证用户名和密码了，用上一步的token即可）
                };

                log("【doLoginIMServer】IM服务器连接中....", true);

                // 【WEBIM的SDK调用第2步：提交登陆/认证信息】
                IMSDK.loginImpl(loginIMServerInfo, RBChatConfig.IM_SERVER_URL, true);
            }
        }
        else {
            log('【doLoginIMServer】没有读取到用户的http认证后身份信息，即将跳转到登陆页面。。。', true);

            // 跳转到登陆页面，让用户首先完成http的sso单点身份证认证
            gotoLoginPage();
        }
    }

    /**
     * 登出。
     */
    function doLogout() {
        // 断开与IM服务器的网络连接
        IMSDK.disconnectSocket();
        // 从cookie中清除本地用户的个人数据
        LocalUserInfo.clear();
        // 清空撤回消息管理器中的数据集合
        RBMessageRevokingManager.clear();
        // 跳转到登陆界面
        gotoLoginPage();
    }

 
    window.minappJump = function (url, appId) {
        if (confirm("您所选小程序即将在浏览器新窗口打开")) {
            var localUserUid = LocalUserInfo.getUid();
            //收藏小程序
            RBChatRestHelper.collectionMinAppListFromServer(localUserUid, appId, function (res) {

            }, function (error) {

            })
            window.open(url, '_blank')
        }
    }

    // 切换ui
    window.imgSwiperListUI = function (url) {
        var beyongDataId = window.openBeyongDataId;
        var list = (window.openGroupChattingType ? GroupChattingCache.getChatCache(beyongDataId) : SingleChattingCache.getChatCache(beyongDataId));
        var imgList = []
        list.filter(item => item.msgType == MsgType.TYPE_IMAGE || item.msgType == 13).forEach(item => {
            if (item.msgType == MsgType.TYPE_IMAGE) {
                imgList.push(RBChatUtils.getImageDownloadURL(item.text, false))
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

    // 切换ui
    window.videoSwiperListUI = function (url) {
        var beyongDataId = window.openBeyongDataId;
        var list = (window.openGroupChattingType ? GroupChattingCache.getChatCache(beyongDataId) : SingleChattingCache.getChatCache(beyongDataId));
        var videoList = []
        list.filter(item => item.msgType == MsgType.TYPE_SHORTVIDEO || item.msgType == 13).forEach(item => {
            if (item.msgType == MsgType.TYPE_SHORTVIDEO) {
                var fileMeta = JSON.parse(item.text);
                var httpDownloadURL = fileMeta.isMovie ? fileMeta.movieUrl : RBChatUtils.getShortVideoDownloadURL(fileMeta.fileName, fileMeta.fileMd5);
                videoList.push(httpDownloadURL)
            } else {
                if (item.msgType == 13) {
                    const obj = JSON.parse(item.text);
                    if (obj.type == 1) {
                        var list = obj.files.map(item => {
                            return RBChatUtils.getImageDownloadURL(item.fileMd5, false)
                        })
                        videoList = videoList.concat(list)
                    }
                }
            }
        })
        RBChatUtils.fvideo(videoList, videoList.indexOf(url))
    }



    // 实现语音播放
    function startVoice(text){
        let msg = new SpeechSynthesisUtterance(text);
        window.speechSynthesis.speak(msg);
    }

    //处理上线title
    function title2Tip(){
        if($("div[uOnline='1']")){
            var list = [];
            $("div[uOnline='1']").each(function(i,v){
                const l = $(v).attr('uTitle');
                list.unshift(l)
            });
            if(timer){
                clearInterval(timer)
                timer = null;
            }
            // 开始语音提醒
            if(list.length > 0){
                // 标题滚动
                document.title = list.join('，');
                timer = setInterval(function() {
                    var tag =  document.title;//根据id获取元素
                    var content = tag; // 获取title标签的文本内容
                    var firstStr = content.charAt(0); // 获取第一个字
                    var surplue = content.substring(1, content.length); // 删除第一个字
                    var new_content = surplue +firstStr ; // 把第一个字加到最后面
                    document.title = new_content;
                }, 500);
            }
        }
    }

    /**
     * 加自己好友之后，默认招呼
     */
    function  sendHelloMsg(userId){
        var myUserId = LocalUserInfo.getUid();
        RBChatRestHelper.submitQueryWelecomToServer(myUserId,// 注意此id为本地用户的uid
            // 数据读取成功后的回调
            function (returnValue) {
                // 服务端返回的是java对象RosterElementEntity的JSON文本
                var ree = JSON.parse(returnValue == 'null' ? '[]' : returnValue);
                if (ree.length > 2) {
                    if (ree[0]) {
                        // 发送欢迎提示语
                        sendWelcome(ree[0], userId);
                    }
                }
            }
            // 数据读取失败后的回调
            , function (errorThrownStr) {

            }
        );
    }

    /**
     * 处理好友被删除
     * @param {*} userId 
     */
    function dealBeDeleteFriend(userId){
        
        // 刷新好友列表数据
        RBChatRosterUI.deal_fen_local_to_last(function(){
            RBChatRosterUI.countGroupUI();
            $("div[bd-flag='bd-"+userId+"']").attr('class','lixian-tip  be-del-show');
        })
        // 选中当前页面
        if(!RBChatUtils.isMobile() && getCurrentSelectedAlarmDataId() == userId){
            RBChatChattingContentPaneUI.showAddFriendUI(userId)
        }
    }

    /**
     *  处理离线自动回复
     * @param {*} toUserId 
     */
    function dealLiXianReply(toUserId){
        setTimeout(function(){
            // 离线状态下
            if(window.isLiXian){
                // 查到了本地用户提示语
                var myUserId = LocalUserInfo.getUid();
                RBChatRestHelper.submitQueryWelecomToServer(myUserId,// 注意此id为本地用户的uid
                    // 数据读取成功后的回调
                    function (returnValue) {
                        // 服务端返回的是java对象RosterElementEntity的JSON文本
                        var ree = JSON.parse(returnValue == 'null' ? '[]' : returnValue);
                        if (ree.length > 2) {
                            if (ree[2]) {
                                // 发送欢迎提示语
                                sendWelcome(ree[2], toUserId);
                            }
                        }
                    }
                    // 数据读取失败后的回调
                    , function (errorThrownStr) {
        
                    }
                );
            }
        },500);
    }


    /**
     * 显示新任务ui
     * @param {*} obj 
     */
    function  showTaskTipsUI(obj){
        obj = {...obj,id: new Date().getTime()+''}
        window.closeTaskTIps = function (id) {
            $('#task-tip-' + id).remove();
        }

        // 点击任务列表
        window.task_2_list = function(){
            $('#task-tip-' + obj.id).remove();
            RBChatDialogHelper.showTaskDialog();
        }

        window.seeTaskDetail = function(key){
            RBChatDialogHelper.showTaskDetail(key)
        }

        // 过滤重复显示
        const dom = $('#task-tip-'+obj.id)
        if(dom){
            dom.remove();
        }

        var voiceTitle = "您有新任务来了";
        var html = "<div class='tasks-level-root' id='task-tip-" + obj.id + "' uOnline='1'  uTitle='"+voiceTitle+"'>" +
            "<div class='tasks-level-root-title'><span>新任务 <a href='javascript:void(0)' onclick=\"javascript:task_2_list()\">任务列表</a></span><div onclick=\"javascript:closeTaskTIps(\'" + obj.id + "\')\">关闭</div></div>" +
            "<div class='tasks-level-root-item'>截至时间：" + obj.time + "</div>" +
            "<div class='tasks-level-root-item'>任务内容：<a href='javascript:void(0)' onclick='javascript:seeTaskDetail(\""+obj.content+"\")'>查看</a></div>" +
            "</div>";
        $('body').append(html)

        setTimeout(function(){
            startVoice(voiceTitle)
        },1000)
    }

    /**
     *  显示群管会员下的ui
     * @param {*} obj 
     */
    function showMemberLoginTIpsUI(obj) {

        window.closeMemreLoginTipsUI = function (uedUsername) {
            $('#mermber-login-tip-' + uedUsername).remove();
        }

        // 点击会员聊天
        window.merber_login_2_chat = function(srcUid){
            $('#mermber-login-tip-' +srcUid).remove();
            var alarmMessageDTO = AlarmsProvider.createChatMessageAlarm(
                MsgType.TYPE_TEXT, "现在开始发起聊天吧.", obj.nickname, srcUid, 0);
            RBChatAlarmsUI.insertOrUpdate(alarmMessageDTO, true, true);
            RBChatAlarmsUI.selectedItem(4, srcUid);
        }

        // 过滤重复显示
        const dom = $('#mermber-login-tip-'+obj.userId)
        if(dom){
            dom.remove();
        }

        var voiceTitle = "普通用户"+obj.nickname+"已上线";
        var html = ''
        if(obj.uedUsername && obj.uedUsername.length > 0){
            voiceTitle = "会员"+obj.nickname+"已上线";
            html = "<div class='mebers-level-root' id='mermber-login-tip-" + obj.userId + "' uOnline='1'  uTitle='"+voiceTitle+"'>" +
            "<div class='mebers-level-root-title'><span>会员登录 <a href='javascript:void(0)' onclick=\"javascript:merber_login_2_chat(" + obj.userId + ")\">去聊天</a></span><div onclick=\"javascript:closeMemreLoginTipsUI(\'" + obj.userId + "\')\">关闭</div></div>" +
            "<div class='mebers-level-root-item'>昵称：" + obj.nickname + "</div>" +
            "<div class='mebers-level-root-item'>UED账号：" + obj.uedUsername + "</div>" +
            "<div class='mebers-level-root-item'>UED充值金额：" + obj.uedMoney + "</div>" +
            "<div class='mebers-level-root-item'>UED最后登录时间：" + obj.uedLastLoginTime + "</div>" +
            "<div class='mebers-level-root-item'>备注：" + obj.remark + "</div>" +
            "</div>";
        }else{
            html = "<div class='mebers-level-root' id='mermber-login-tip-" + obj.userId + "' uOnline='1'  uTitle='"+voiceTitle+"'>" +
            "<div class='mebers-level-root-title'><span>普通登录 <a href='javascript:void(0)' onclick=\"javascript:merber_login_2_chat(" + obj.userId + ")\">去聊天</a></span><div onclick=\"javascript:closeMemreLoginTipsUI(\'" + obj.userId + "\')\">关闭</div></div>" +
            "<div class='mebers-level-root-item'>ID：" + obj.userId + "</div>" +
            "<div class='mebers-level-root-item'>昵称：" + obj.nickname + "</div>" +
            "<div class='mebers-level-root-item'>备注：" + obj.remark + "</div>" +
            "</div>";
        }
        
        $('body').append(html)

        setTimeout(function(){
            startVoice(voiceTitle)
        },1000)
      
        // 声音提醒及标题滚动
        title2Tip();

        // //发送打招呼消息
        var myUserId = LocalUserInfo.getUid();
        RBChatRestHelper.submitQueryWelecomToServer(myUserId,// 注意此id为本地用户的uid
            // 数据读取成功后的回调
            function (returnValue) {
                // 服务端返回的是java对象RosterElementEntity的JSON文本
                var ree = JSON.parse(returnValue == 'null' ? '[]' : returnValue);
                if (ree.length > 0) {
                    if (ree[1]) {
                        // 发送欢迎提示语
                        sendWelcome(ree[1], obj.userId);
                    }
                }
            }
            // 数据读取失败后的回调
            , function (errorThrownStr) {

            }
        );
        // 发送告警统计倒计时
        RBChatRestHelper.send_notice_count_num(myUserId,obj.userId,obj.type)
    }

    /**
     *  发送欢迎提示语
     * @param {*} welcome 
     * @param {*} userId 
     */
    function sendWelcome(welcome, userId) {
        // 带有小程序
        send_im_text(welcome, userId);
    }

    /**
     * 发送纯文本
     * @param {*} welcome 
     * @param {*} userId 
     */
    function send_im_text(welcome, userId, callBack){
        var fingerPrint = MBProtocalFactory.genFingerPrint();
        var msgType = 0; //文本消息
        MessageHelper.sendMessage(msgType, userId, welcome, function (isSucess, msgBody) {
            if (isSucess) {
                var friendUid = userId;
                var ree = RosterProvider.getFriendInfoByUid(friendUid) || {};
                // 自已发出的消息，也要显示在相应的UI界面上
                var alarmMessageDTO = AlarmsProvider.createChatMsgAlarmForLocal(msgBody.ty, msgBody.m, ree.nickname, friendUid);
                var chatMsgEntity = ChatMsgEntity.prepareSendedMessage(msgBody.m, 0, fingerPrint, msgType);
                // 将此条消息存入缓存并在UI上显示
                RBChatMainUI.processRecivedMessage(true, false, alarmMessageDTO, chatMsgEntity);
                if(callBack) callBack();
            }
        }, fingerPrint, false);
    }

    /**
     * 收到的IM聊天信息或指令。
     * 此方法为IMSDK的回调方法，请勿修改方法名哦（准确地说，本方法名应为“receivedMessage4IM”最佳，目前暂不修改）！
     *
     * @param pFromServer Protocal对象（对象字段请见：http://docs.52im.net/extend/docs/api/mobileimsdk/server/net/openmob/mobileimsdk/server/protocal/Protocal.html）
     * @param options
     */
    function onIMData(pFromServer) {

        //log('【onIMData】收到一条消息/指令，内容为：'+JSON.stringify(p), true);

        var fingerPrintOfProtocal = pFromServer.fp;
        var userid = pFromServer.from;
        var dataContent = pFromServer.dataContent;
        var typeu = pFromServer.typeu;

        var msg = dataContent;
        let obj = null;

        // console.log("【onIMData】[typeu=" + typeu + "] IM通道收到来自对象" + userid + "的数据dataContent=" + dataContent, pFromServer,true)

        // 判断消息指令
        if (dataContent) {
            obj = JSON.parse(dataContent);
            console.log('msg',obj);
            // 选择了当前的群
            if (window.groupInfo && obj.t == window.groupInfo.g_id) {
                if (obj.m == '群禁言已解封') {
                    $('#kchat-im-panel-main-chat-textarea').css('pointer-events', '');
                    $('#im-panel-inputcontent').attr('placeholder', '请输入消息')
                    $('#im-panel-inputcontent').removeAttr("disabled");
                } else if (obj.m == '群已被禁言') {
                    var myUserId = LocalUserInfo.getUid()
                    RBChatRestHelper.submitGetGroupInfoToServer(window.groupInfo.g_id, myUserId
                        // 数据读取成功后的回调
                        , function (returnValue) {
                            var groupInfo = JSON.parse(returnValue);
                            // 判断是否是群主或者管理员
                            if (!(groupInfo.g_owner_user_uid == myUserId || groupInfo.manage_mark - 0 == 1)) {
                                $('#kchat-im-panel-main-chat-textarea').css('pointer-events', 'none');
                                $('#im-panel-inputcontent').attr('placeholder', '禁言中 …')
                                $('#im-panel-inputcontent').attr('disabled', true)
                                $('#im-panel-inputcontent').val('');
                            }
                        }
                        // 数据读取失败后的回调
                        , function (errorThrownStr) {
                        }
                    );
                }
            }

            // 群头像及用户头像更新
            if (typeu == 82) {
                // 更头像
                RBChatUtils.updateGroupAvatar(obj.id, obj.type.toLowerCase() == 'group')
            }

            //更新红包状态ui
            if (typeu == 87) {
                const t = $('#' + obj.walletId + '_redpck_root');
                const l = $('#' + obj.walletId + '_status_text');
                if (t && l) {
                    t.css('background', 'rgb(252,205,168)');
                    l.text('已领取')
                }
            }

            //已阅状态更新
            if (typeu == 84) {
                const lastTime = obj.time; //最后得更新时间
                // 判断是否是当前会话
                if (getCurrentSelectedAlarmDataId() - obj.userId == 0) {
                    $('.chat-info-unread').each(function (index, item) {
                        $(item).addClass('chat-info-read')
                    })
                }
            }

            // 在线与离线ui状态
            var uid = LocalUserInfo.getUid()+'';
            if (typeu == 86 && '401462' != uid) {
                const userId = obj.userId; //最后得更新时间
                const isOnline = obj.isOnline;
                               
                if( window.friends_group_list &&  window.friends_group_list.length > 0){
                    window.friends_group_list.forEach(item=>{
                        let groupId = '';
                        item.list.forEach(item_=>{
                            if(item_.user_uid == userId){
                                item_.online = isOnline - 0 == 1;
                                if(!item_.online){
                                    item_.latestOfflineTime = obj.latestOfflineTime;
                                }
                                groupId = item.groupId+"";
                               
                            }
                        })
                        if(groupId.length > 0){
                             // 刷新分组在线人数显示
                             const dom = $('#rstore-group-count-'+ groupId);
                             if(dom){
                                 const  count = item.list.length;
                                 const  online_count = item.list.filter(item=> item.online).length;
                                 dom.text(online_count+"/"+count);
                             }
                        }
                    })
                }

                RBChatRosterUI.reFlash_count_online_ui();

                $(".other-tip-"+userId).each(function(i,v){
                    $(v).attr('lastlogintime',obj.latestOfflineTime);
                });
                RBChatUtils.reflashOnlineUI(userId, isOnline - 0 == 1)
            }
            // 接收你被好友删除
            if(typeu == 89){
                dealBeDeleteFriend(obj.userId);
            }

            // 是条@消息
            if(obj.ty - 0 == 12){
                const msg_obj = JSON.parse(obj.m); //消息提
                //判断是否@了全部 或者 自己
                const  select_obj = msg_obj.select_obj;

                // 出现了@自己 || 回复也提醒
                if(RBChatUtils.isTipMy(select_obj)){
                    $('#tip_my_'+msg_obj.gid).show();
                }
            }

            // 置顶取消
            if(typeu == 102 || typeu == 103){
                var myuid = LocalUserInfo.getUid();
                let groupId = obj.groupId
                groupId = groupId.replace(myuid, '').replace('_','')
                // 当前选中了这个界面, 则进行置顶消息刷新
                if(getCurrentSelectedAlarmDataId()+'' == groupId){
                    RBChatChattingContentPaneUI.init_msg_top_ui()
                }
            }

            if(obj.ty - 0 == 11){
                const msg_obj = JSON.parse(obj.m); //消息提
                var  isReplyMe = false;
                var myuid = LocalUserInfo.getUid();
                isReplyMe = msg_obj.from.uid == myuid
                // 出现了@自己 || 回复也提醒
                if(isReplyMe){
                    $('#tip_my_'+msg_obj.gid).show();
                }
            }
        }

        // 【IM指令：好友上线通知】
        if (typeu === UserProtocalsType.MT01_OF_ONLINE_NOTIVICATION) {
            // 服务端发来的上线通知
            var uid = MessageHelper.pareseRecieveOnlineNotivication(msg);
            // log('【onIMData】' + uid + '上线了 ↑', true);
        }
        // 【IM指令：好友下线通知】
        else if (typeu == UserProtocalsType.MT02_OF_OFFLINE_NOTIVICATION) {
            var uid = MessageHelper.pareseRecieveOfflineNotivication(userid, msg);
            // log('【onIMData】' + uid + '下线了 ↓', true);
        }
        // 【IM指令：临时/陌生人聊天消息->由服务端转发给接收人B的【步骤2/2】
        else if (typeu == UserProtocalsType.MT43_OF_TEMP$CHAT$MSG_SERVER$TO$B) {
            // 来自发送方的临时聊天消息
            // 返回值为MsgBody4Guest对象，详见：http://docs.52im.net/extend/docs/api/rainbowchatserver4_pro/com/x52im/rainbowchat/im/dto/MsgBody4Guest.html
            var tcmd = TMessageHelper.parseTempChatMsg_SERVER$TO$B_Message(msg);
            var msgType = tcmd.ty;

            // log('【onIMData】收到陌生人消息(msgType=' + msgType + ')：tcmd=' + JSON.stringify(tcmd));

            // 如果收到的消息"撤回指令"，则需要单独特殊处理（因为"撤回"指令不是普通的聊天消息哦）
            if (msgType == MsgType.TYPE_REVOKE) {
                // 进行消息撤回指令的处理逻辑
                processRecivedRevokeCMD(ChatModeType.CHAT_TYPE_GUEST$CHAT, fingerPrintOfProtocal, tcmd.f, tcmd.m);
                // 撤回消息时，也同步更新首页“消息”列表中的显示，这样从体验上来说更合理一些
                var alarmMessageDTO = AlarmsProvider.createATempChatMsgAlarmForLocal(tcmd.ty, tcmd.m
                    , tcmd.nickName//msgBody.nickName// 这个字段值就是对方的nickname，但在web端不太好取，而此处可以设为null的
                    // 逻辑是因为本地发出的消息必定是选中了已存在首页陌生人“消息”item，所以此处为null地无谓（因为刷新item时不需要刷新title）
                    , tcmd.f);
                RBChatAlarmsUI.insertOrUpdate(alarmMessageDTO, true);
            }
            // 收到的是正常的聊天消息等
            else {
                var alarmMessageDTO = AlarmsProvider.createATempChatMsgAlarm(tcmd.ty, tcmd.m, tcmd.n, tcmd.f, 0);
                var chatMsgEntity = ChatMsgEntity.prepareRecievedMessage(tcmd.f, tcmd.n, tcmd.m, 0, tcmd.ty, fingerPrintOfProtocal);
                if(obj.ued){
                    const _obj = JSON.parse(obj.ued)
                    alarmMessageDTO.mlevel = _obj.uedLevel
                    chatMsgEntity.mlevel = _obj.uedLevel
                    alarmMessageDTO.payDate = _obj.uedLastRechargeDate
                    chatMsgEntity.payDate = _obj.uedLastRechargeDate
                    alarmMessageDTO.nowTime = _obj.nowTime
                    chatMsgEntity.nowTime = _obj.nowTime
                    alarmMessageDTO.cmoney = _obj.uedMoney
                    chatMsgEntity.cmoney = _obj.uedMoney
                }
                alarmMessageDTO.user_photo = obj.h;
                chatMsgEntity.user_photo = obj.h;
                processRecivedMessage(false, false, alarmMessageDTO, chatMsgEntity);
                const flag = alarmMessageDTO.dataId
                let _notip = RBChatUtils.isKeyVal('noTipStr', flag);
                if (!_notip) {
                    // 来一个收到消息声音提示
                    AudioPromptHelper.newMessagePromt();
                }
            }
        }
        // 【IM指令：群聊/世界频道聊天消息->由服务端转发给接收人B的【步骤2/2】
        else if (typeu == UserProtocalsType.MT45_OF_GROUP$CHAT$MSG_SERVER$TO$B) {
            //** 特别说明：因群聊消息是由服务端发的（不像一对一聊天消息是通过client to client消息模式），所以
            //**         此处的消息发送者user_id字段的值是服务器（即"0"），而非消息真正的源头用户id哦，但
            //**         Protocal的dataContent里MsgBody4Guest对象里的f字段才是真正的用户源id哦！

            // log('【onIMData】收到群聊指令 MT45_OF_GROUP$CHAT$MSG_SERVER$TO$B');

            // 来自发送方的群组聊天消息（即 MsgBody4Group 对象：http://docs.52im.net/extend/docs/api/rainbowchatserver4_pro/com/x52im/rainbowchat/im/dto/MsgBody4Group.html）
            msgBody = GMessageHelper.parseGroupChatMsg_SERVER$TO$B_Message(msg);
            // 在群聊消息时，本字段存放的是群组id，普通一对的聊天时才是用户uid
            var toGid = msgBody.t;
            // 找到源用户要发送到的群组基本信息（即GroupEntity对象）
            var ge = null;
            // 如果是世界频道
            if (GroupsProvider.isWorldChat(toGid)) {
                //ge = GroupsProvider.getDefaultWordChatEntity();
                // log('【onIMData】Web端产品，不支持APP端产品的\"世界频道\"，本指令将被忽略！');
                return;
            }
            // 否则是普通群聊
            else
                ge = GroupsProvider.getGroupInfoByGid(toGid);

            if (ge) {

                var msgType = msgBody.ty;

                // 如果收到的消息"撤回指令"，则需要单独特殊处理（因为"撤回"指令不是普通的聊天消息哦）
                if (msgType == MsgType.TYPE_REVOKE) {
                    // 进行消息撤回指令的处理逻辑
                    processRecivedRevokeCMD(ChatModeType.CHAT_TYPE_GROUP$CHAT, fingerPrintOfProtocal, toGid, msgBody.m);
                    // 撤回消息时，也同步更新首页“消息”列表中的显示，这样从体验上来说更合理一些
                    var alarmMessageDTO = AlarmsProvider.createAGroupChatMsgAlarmForLocal(msgBody.ty, msgBody.m, ge.g_name, toGid);
                    RBChatAlarmsUI.insertOrUpdate(alarmMessageDTO, true);
                }
                // 收到的是正常的聊天消息等
                else {
                    var alarmMessageDTO = AlarmsProvider.createAGroupChatMsgAlarm(msgBody.ty, msgBody.m, ge.g_name, toGid, msgBody.nickName, 0);
                    var chatMsgEntity = ChatMsgEntity.prepareRecievedMessage(msgBody.f, msgBody.nickName, msgBody.m, 0, msgBody.ty, fingerPrintOfProtocal);
                    // 群聊消息需要记录下扩散写前由消息发起者发出消息的原始指纹码（以便消息"撤回"功能时使用）
                    chatMsgEntity.fingerPrintOfParent = msgBody.parentFp;
                    if(obj.ued){
                        const _obj = JSON.parse(obj.ued)
                        // console.log('ued消息测试-群聊',_obj)
                        alarmMessageDTO.mlevel = _obj.uedLevel
                        chatMsgEntity.mlevel = _obj.uedLevel
                        alarmMessageDTO.payDate = _obj.uedLastRechargeDate
                        chatMsgEntity.payDate = _obj.uedLastRechargeDate
                        alarmMessageDTO.nowTime = _obj.nowTime
                        chatMsgEntity.nowTime = _obj.nowTime
                        alarmMessageDTO.cmoney = _obj.uedMoney
                        chatMsgEntity.cmoney =_obj.uedMoney
                    }
                    alarmMessageDTO.user_photo = obj.h;
                    chatMsgEntity.user_photo = obj.h;
                    // 将数据放入并在UI上显示
                    processRecivedMessage(false, true, alarmMessageDTO, chatMsgEntity);
                    const flag =  alarmMessageDTO.dataId ;
                    let _notip = RBChatUtils.isKeyVal('noTipStr', flag);
                    if (!_notip) {
                        // 来一个收到消息声音提示
                        AudioPromptHelper.newMessagePromt();
                    }

                    // // 私聊处理离线
                    // dealLiXianReply(userid);
                }
            }
            else {
                // log("【onIMData】来自userid=" + msgBody.t + "的群聊消息虽收到，但目标群组" + toGid + "并不在我的群组列表里，本条群消息将被忽略！！");
            }
        }
        // 【IM指令：群聊系统指令->加群成功后通知被加群者（由Server发出）】：通知接收人可能是在创建群或群建好后邀请进入的
        else if (typeu == UserProtocalsType.MT46_OF_GROUP$SYSCMD_MYSELF$BE$INVITE_FROM$SERVER) {
            // log('【onIMData】收到群聊指令 MT46_OF_GROUP$SYSCMD_MYSELF$BE$INVITE_FROM$SERVER');

            // 解析出来的是CMDBody4MyselfBeInvitedGroupResponse对象
            var cmdBody = GMessageHelper.parseResponse4GroupSysCMD4MyselfBeInvited(msg);
            // 群组基本信息（GroupEntity对象）
            var ge = cmdBody;

            if (ge) {
                // 将新加入的群信息加入到本地的群缓存列表中
                GroupsProvider.putGroup(0, ge);
                // 在群列表中显示出来新加的群
                RBChatGroupsUI.add(ge, true);

                //** 以下代码用于将通知作为一条聊天消息的形式显示出来
                // 通知内容
                var hintTex = "\"" + cmdBody.initveBeNickName + "\"邀请您加入了群聊";
                // 将该条系统通知加入到聊天消息中
                var msgBody = GMessageHelper.constructGroupSystenMsgBody(ge.g_id, hintTex);
                //
                var alarmMessageDTO = AlarmsProvider.createAGroupChatMsgAlarm(msgBody.ty, msgBody.m, ge.g_name, ge.g_id, msgBody.nickName, 0);
                var chatMsgEntity = ChatMsgEntity.prepareRecievedMessage(msgBody.f, msgBody.nickName, msgBody.m, 0, msgBody.ty, fingerPrintOfProtocal);
                // 将数据放入并在UI上显示
                processRecivedMessage(false, true, alarmMessageDTO, chatMsgEntity);

                //NotificationPromptHelper.showMyselfBeInvitedGroupNotivication(context, ge.getG_name(), ge.getG_id());
                //// 将该条系统通知加入到聊天消息中
                //GChatDataHelper.addSystemInfoData(context, ge.getG_id(), ge.getG_name(), hintTex, 0, true, true);
            }
            else {
                // log("【onIMData】来自gid=" + ge.g_id + "的加群成功后通知，但ge==null，本条通知将被忽略！！");
            }
        }
        // 【IM指令：群聊系统指令->通用的系统信息给指定群员（由Server发出，指定群员接收）】
        else if (typeu == UserProtocalsType.MT47_OF_GROUP$SYSCMD_COMMON$INFO_FROM$SERVER) {
            // log('【onIMData】收到群聊指令 MT47_OF_GROUP$SYSCMD_COMMON$INFO_FROM$SERVER');

            // 群组的系统通知，本质还是个群聊消息体（即MsgBody4Group对象）
            var cmdBody = GMessageHelper.parseGroupChatMsg_SERVER$TO$B_Message(msg);
            // 在群聊消息时，本字段存放的是群组id，普通一对的聊天时才是用户uid
            var toGid = cmdBody.t;
            // 找到源用户要发送到的群组基本信息（即 GroupEntity 对象）
            var ge = null;
            // 如果是世界频道
            if (GroupsProvider.isWorldChat(toGid)) {
                //ge = GroupsProvider.getDefaultWordChatEntity();
                // log('【onIMData】Web端产品，不支持APP端产品的\"世界频道\"，本指令将被忽略！');
                return;
            }
            // 否则是普通群聊
            else
                ge = GroupsProvider.getGroupInfoByGid(toGid);

            if (ge) {
                var alarmMessageDTO = AlarmsProvider.createAGroupChatMsgAlarm(cmdBody.ty, cmdBody.m, ge.g_name, toGid, cmdBody.nickName, 0);
                var chatMsgEntity = ChatMsgEntity.prepareRecievedMessage(cmdBody.f, cmdBody.nickName, cmdBody.m, 0, cmdBody.ty, fingerPrintOfProtocal);
                // 将数据放入并在UI上显示
                processRecivedMessage(false, true, alarmMessageDTO, chatMsgEntity);
            }
            else {
                // log("【onIMData】来自userid=" + userid + "的群聊系统MT47指令/通知虽收到，但目标群组" + toGid + "并不在我的群组列表里，本条群消息将被忽略！！");
            }
        }
        // 【IM指令：群聊系统指令->群已被解散（由Server发出，除解散者外的所有人接收）】
        else if (typeu == UserProtocalsType.MT48_OF_GROUP$SYSCMD_DISMISSED_FROM$SERVER) {
            // log('【onIMData】收到群聊指令 MT48_OF_GROUP$SYSCMD_DISMISSED_FROM$SERVER');

            // 群组的系统通知，本质还是个群聊消息体（即MsgBody4Group对象）
            var cmdBody = GMessageHelper.parseGroupChatMsg_SERVER$TO$B_Message(msg);
            // 在群聊消息时，本字段存放的是群组id，普通一对的聊天时才是用户uid
            var toGid = cmdBody.t;
            // 找到源用户要发送到的群组基本信息（即 GroupEntity 对象）
            var ge = null;
            // 如果是世界频道
            if (GroupsProvider.isWorldChat(toGid)) {
                //ge = GroupsProvider.getDefaultWordChatEntity();
                // log('【onIMData】Web端产品，不支持APP端产品的\"世界频道\"，本指令将被忽略！');
                return;
            }
            // 否则是普通群聊
            else
                ge = GroupsProvider.getGroupInfoByGid(toGid);

            if (ge) {
                var alarmMessageDTO = AlarmsProvider.createAGroupChatMsgAlarm(cmdBody.ty, cmdBody.m, ge.g_name, toGid, cmdBody.nickName, 0);
                var chatMsgEntity = ChatMsgEntity.prepareRecievedMessage(cmdBody.f, cmdBody.nickName, cmdBody.m, 0, cmdBody.ty, fingerPrintOfProtocal);
                // 将通知放入缓存中并在UI上显示
                processRecivedMessage(false, true, alarmMessageDTO, chatMsgEntity);
                // 同时将此群基本信息从本地用户的群列表缓存中移除
                GroupsProvider.removeByGid(toGid)
                // 在群组列表中将此群组从UI上移除
                RBChatGroupsUI.deleteItem(toGid);
            }
            else {
                // log("【onIMData】来自userid=" + userid + "的群聊系统MT48指令/通知虽收到，但目标群组" + toGid + "并不在我的群组列表里，本条群消息将被忽略！！");
            }
        }
        // 【IM指令：群聊系统指令->"你"被踢出群聊（由Server发出，被踢者接收） 】
        else if (typeu == UserProtocalsType.MT49_OF_GROUP$SYSCMD_YOU$BE$KICKOUT_FROM$SERVER) {
            // log('【onIMData】收到群聊指令 MT49_OF_GROUP$SYSCMD_YOU$BE$KICKOUT_FROM$SERVER');

            // 群组的系统通知，本质还是个群聊消息体（即MsgBody4Group对象）
            var cmdBody = GMessageHelper.parseGroupChatMsg_SERVER$TO$B_Message(msg);
            // 在群聊消息时，本字段存放的是群组id，普通一对的聊天时才是用户uid
            var toGid = cmdBody.t;
            // 找到源用户要发送到的群组基本信息（即 GroupEntity 对象）
            var ge = null;
            // 如果是世界频道
            if (GroupsProvider.isWorldChat(toGid)) {
                //ge = GroupsProvider.getDefaultWordChatEntity();
                // log('【onIMData】Web端产品，不支持APP端产品的\"世界频道\"，本指令将被忽略！');
                return;
            }
            // 否则是普通群聊
            else
                ge = GroupsProvider.getGroupInfoByGid(toGid);

            if (ge) {
                var alarmMessageDTO = AlarmsProvider.createAGroupChatMsgAlarm(cmdBody.ty, cmdBody.m, ge.g_name, toGid, cmdBody.nickName, 0);
                var chatMsgEntity = ChatMsgEntity.prepareRecievedMessage(cmdBody.f, cmdBody.nickName, cmdBody.m, 0, cmdBody.ty, fingerPrintOfProtocal);
                // 将通知放入缓存中并在UI上显示
                processRecivedMessage(false, true, alarmMessageDTO, chatMsgEntity);
                // 同时将此群基本信息从本地用户的群列表缓存中移除
                GroupsProvider.removeByGid(toGid)
                // 在群组列表中将此群组从UI上移除
                RBChatGroupsUI.deleteItem(toGid);
            }
            else {
                // log("【onIMData】来自userid=" + userid + "的群聊系统MT49指令/通知虽收到，但目标群组" + toGid + "并不在我的群组列表里，本条群消息将被忽略！！");
            }
        }
        // 【IM指令：群聊系统指令->"别人"主动退出或被群主踢出群聊（由Server发出，其它群员接收）  】
        else if (typeu == UserProtocalsType.MT50_OF_GROUP$SYSCMD_SOMEONEB$REMOVED_FROM$SERVER) {
            // log('【onIMData】收到群聊指令 MT50_OF_GROUP$SYSCMD_SOMEONEB$REMOVED_FROM$SERVER');

            // 群组的系统通知，本质还是个群聊消息体（即MsgBody4Group对象）
            var cmdBody = GMessageHelper.parseGroupChatMsg_SERVER$TO$B_Message(msg);
            // 在群聊消息时，本字段存放的是群组id，普通一对的聊天时才是用户uid
            var toGid = cmdBody.t;
            // 找到源用户要发送到的群组基本信息（即 GroupEntity 对象）
            var ge = null;
            // 如果是世界频道
            if (GroupsProvider.isWorldChat(toGid)) {
                //ge = GroupsProvider.getDefaultWordChatEntity();
                // log('【onIMData】Web端产品，不支持APP端产品的\"世界频道\"，本指令将被忽略！');
                return;
            }
            // 否则是普通群聊
            else
                ge = GroupsProvider.getGroupInfoByGid(toGid);

            if (ge) {
                var alarmMessageDTO = AlarmsProvider.createAGroupChatMsgAlarm(cmdBody.ty, cmdBody.m, ge.g_name, toGid, cmdBody.nickName, 0);
                var chatMsgEntity = ChatMsgEntity.prepareRecievedMessage(cmdBody.f, cmdBody.nickName, cmdBody.m, 0, cmdBody.ty, fingerPrintOfProtocal);
                // 将通知放入缓存中并在UI上显示
                processRecivedMessage(false, true, alarmMessageDTO, chatMsgEntity);

                // 即时更新群头像的显示哦:强制刷新群组头像在各处的显示（此种情况主要用于：群成员变动时
                // ，群头像可能已经在服务端重新生成，刷新的目的是为了及时同步显示之）
                RBChatAlarmsUI.updateGroupAvatarShow(toGid);
                RBChatGroupsUI.updateGroupAvatarShow(toGid);
            }
            else {
                // log("【onIMData】来自userid=" + userid + "的群聊系统MT50指令/通知虽收到，但目标群组" + toGid + "并不在我的群组列表里，本条群消息将被忽略！！");
            }

        }
        // 【IM指令：群聊系统指令->群名被修改的系统通知（由Server发出，所有除修改者外的群员接收） 】
        else if (typeu == UserProtocalsType.MT51_OF_GROUP$SYSCMD_GROUP$NAME$CHANGED_FROM$SERVER) {
            // log('【onIMData】收到群聊指令 MT51_OF_GROUP$SYSCMD_GROUP$NAME$CHANGED_FROM$SERVER');

            // 解析出来的是CMDBody4GroupNameChangedNotification对象（
            // 详见：http://docs.52im.net/extend/docs/api/rainbowchatserver4_pro/com/x52im/rainbowchat/im/dto/CMDBody4GroupNameChangedNotification.html）
            var cmdBody = GMessageHelper.parseResponse4GroupSysCMD4GroupNameChanged(msg);

            var toGid = cmdBody.gid;
            // GroupEntity对象
            var ge = GroupsProvider.getGroupInfoByGid(toGid);

            if (ge) {
                var newGroupName = cmdBody.nnewGroupName;
                var hintTex = cmdBody.notificationContent;

                // 将新群名更新上去
                if (newGroupName) {
                    // 更新JS缓存中的群组名称
                    ge.g_name = newGroupName;
                    //GroupsProvider.updateGroupMemberCount(toGid, newGroupName, null);
                    GroupsProvider.updateGroup(ge);
                    // 更新群列表中的群名称的UI显示
                    RBChatGroupsUI.updateGroupName(toGid, newGroupName);
                    // 更新首页“消息”中的群名称UI显示
                    RBChatAlarmsUI.updateGroupName(toGid, newGroupName);
                }

                // 将该条系统通知加入到聊天消息中
                var msgBody = GMessageHelper.constructGroupSystenMsgBody(ge.g_id, hintTex);
                // （首页“消息”上的新群名称显示，将在item内容更新时自动设置为新群名称）
                var alarmMessageDTO = AlarmsProvider.createAGroupChatMsgAlarm(msgBody.ty, msgBody.m, newGroupName, ge.g_id, msgBody.nickName, 0);
                var chatMsgEntity = ChatMsgEntity.prepareRecievedMessage(msgBody.f, msgBody.nickName, msgBody.m, 0, msgBody.ty, fingerPrintOfProtocal);
                // 将数据放入并在UI上显示
                processRecivedMessage(false, true, alarmMessageDTO, chatMsgEntity);
            }
            else {
                // log("【onIMData】来自gid=" + toGid + "的群名被改通知，但ge==null，本条通知将被忽略！！");
            }
        }
        // 【IM指令：加好友错误提示】
        // 由服务端反馈给加好友发起人的错误信息(出错的可能是：该好友已
        // 经存在于我的好友列表中、插入好友请求到db中时出错等)
        else if (typeu == UserProtocalsType.MT06_OF_ADD_FRIEND_REQUEST_RESPONSE$FOR$ERROR_SERVER$TO$A) {
            var errorContent = MessageHelper.parseAddFriendRequestResponse_for$error_server$to$a(msg);

            // 来一个声音提示
            AudioPromptHelper.msgSentFailPromt();
            // 来一个通知哦
            NotificationPromptHelper.showAddFriendRequest_RESPONSE$FOR$ERROR_SERVER$TO$ANotivication(errorContent, RBChatMainWindowUI.showIMPanelAlert);
        }
        // 【IM指令：收到了加好友请求->服务端通知在线被加好友者】
        else if (typeu == UserProtocalsType.MT07_OF_ADD_FRIEND_REQUEST_INFO_SERVER$TO$B) {
            // 解析后便是RosterElementEntity对象，
            // 详见：http://docs.52im.net/extend/docs/api/rainbowchatserver4_pro/com/x52im/rainbowchat/http/logic/dto/RosterElementEntity.html
            var srcUserInfo = MessageHelper.parseAddFriendRequestInfo_server$to$b(msg);
            // log("【onIMData】收到了来自" + srcUserInfo.nickname + "(" + srcUserInfo.user_uid + ")的加好友请求！！！");

            // 来一个收到消息声音提示
            AudioPromptHelper.humanTixingPromt();
            // 来一个通知哦
            NotificationPromptHelper.showAddFriendRequestNotivication(srcUserInfo.nickname, RBChatMainWindowUI.showIMPanelAlert);

            // 在首页“消息”列表中刷新“未处理好友请求”的item显示，方便点击查看所有好友请求列表
            RBChatAlarmsUI.refreshAddFriendReqAlarmUI(srcUserInfo.nickname, null, 1);

            // 如果当前首页的"消息"tab处于不可见状态，则设置“在线队列”的ui上显示一个新消息提示红点点
            if (!RBChatMainWindowUI.isAlarmsTabSelected()) {
                RBChatMainWindowUI.setAlarmsUIHasMsg(true);
            }

            // 主界面的header上必要的时候显示一个大红点提示有新消息（提示的前提是聊天窗处理关闭时）
            RBChatMainWindowUI.setHeaderNotificatonNewMsgHint(true);
        }
        // 【IM指令：好友关系建立成功通知】
        // 新好友已成功被添加后由服务端发给在线用户对方的个人信息（此场景是被请求用户
        // 同意了加好友的请求时，由服务端把双方的好友信息及时交给对方（如果双方有人在线的话））
        // ，加入到本地好友列表中了后，就可以及时聊天了（如果对方此时在线的话）
        else if (typeu == UserProtocalsType.MT10_OF_PROCESS_ADD$FRIEND$REQ_FRIEND$INFO$SERVER$TO$CLIENT) {
            // RosterElementEntity对象，
            // 详见：http://docs.52im.net/extend/docs/api/rainbowchatserver4_pro/com/x52im/rainbowchat/http/logic/dto/RosterElementEntity.html
            var userInfoFromServer = MessageHelper.parseProcessAdd$Friend$Req_friend$Info$Server$To$ClientMessage(msg);
            // log("【onIMData】新好友" + userInfoFromServer.nickname + "(" + userInfoFromServer.user_uid + ")已成功添加在好友列表中，可以聊天了！");

           // 加好友提醒
           sendHelloMsg(userInfoFromServer.user_uid)

            // 删除聊天详情会话
            const  dom = $('#chat-add-friend-'+userInfoFromServer.user_uid);
            if(dom){
                dom.remove();
            }
            // 删除界面
            $("div[bd-flag='bd-"+userInfoFromServer.user_uid+"']").attr('class','lixian-tip  be-del-hide');

            //MyApplication.getInstance(context).getIMClientManager().getRosterProvider().putFriend(userInfoFromServer);
            // 来一个声音提示
            AudioPromptHelper.newFriendAddSucessPromt();
            // 来一个通知哦
            NotificationPromptHelper
                .showNewFriendAddSucessNotivication(userInfoFromServer.nickname, RBChatMainWindowUI.showIMPanelAlert);

            //** 【1】先将新好友加到本地好友列表缓存数据模型中，并在好友的UI列表中显示出来
            RBChatRosterUI.deal_fen_local_to_last(function(){
                RBChatRosterUI.countGroupUI();
               
            })

            // 将新好友数据加入数据模型
            // RosterProvider.putFriendWithRee(userInfoFromServer);
            // // UI中显示出来
            // RBChatRosterUI.addOrUpdate(userInfoFromServer, true,'0', true);
            // RBChatRosterUI.countGroupUI();

            //** 【2】像微信等IM一样：被好加友同意加好友请求后，将入一条空消息到首页
            var alarmMessageDTO = AlarmsProvider.createChatMsgAlarmForAddSuccess(
                userInfoFromServer.nickname, userInfoFromServer.user_uid);
            // 将数据放入并在UI上显示
            processRecivedMessage(false, false, alarmMessageDTO, null);
        }
        // 【IM指令：加好友被拒绝的实时通知->(由服务端在B拒绝A的请求后实时通知A)】
        else if (typeu == UserProtocalsType.MT12_OF_PROCESS_ADD$FRIEND$REQ_SERVER$TO$A_REJECT_RESULT) {
            // RosterElementEntity对象，
            // 详见：http://docs.52im.net/extend/docs/api/rainbowchatserver4_pro/com/x52im/rainbowchat/http/logic/dto/RosterElementEntity.html
            var userInfoFromServer = MessageHelper.parseProcessAdd$Friend$Req_SERVER$TO$A_REJECT_RESULTMessage(msg);
            // log("【onIMData】" + userInfoFromServer.nickname + "(" + userInfoFromServer.user_uid + ")拒绝了你的加好友请求哦！");

            // 来一个声音提示
            AudioPromptHelper.msgSentFailPromt();
            // 来一个通知哦
            NotificationPromptHelper
                .showAddFriendBeRejectNotivication(userInfoFromServer.nickname, RBChatMainWindowUI.showIMPanelAlert);

            // 加一条提示到主界面的提示功能列表中
            var alarmMessageDTO = AlarmsProvider.createAddFriendBeRejectAlarm(userInfoFromServer.nickname, userInfoFromServer.user_uid);
            //processRecivedMessage(false, false, alarmMessageDTO, null);
            // 插入或更新首页“消息”item
            RBChatAlarmsUI.insertOrUpdate(alarmMessageDTO, true);
            // ui上显示未读标识
            RBChatAlarmsUI.addUnread(alarmMessageDTO.alarmMessageType, alarmMessageDTO.dataId, 1);

            // 如果当前首页的"消息"tab处于不可见状态，则设置“在线队列”的ui上显示一个新消息提示红点点
            if (!RBChatMainWindowUI.isAlarmsTabSelected()) {
                RBChatMainWindowUI.setAlarmsUIHasMsg(true);
            }

            // 主界面的header上必要的时候显示一个大红点提示有新消息（提示的前提是聊天窗处理关闭时）
            RBChatMainWindowUI.setHeaderNotificatonNewMsgHint(true);
        }
        // 【IM指令：实时语音和视频聊天相关的指令】
        else if (typeu == UserProtocalsType.MT14_OF_VIDEO$VOICE_END$CHATTING
            || typeu == UserProtocalsType.MT15_OF_VIDEO$VOICE_SWITCH$TO$VOICE$ONLY
            || typeu == UserProtocalsType.MT16_OF_VIDEO$VOICE_SWITCH$TO$VOICE$AND$VIDEO
            || typeu == UserProtocalsType.MT19_OF_VIDEO$VOICE$REQUEST_ACCEPT$TO$A
            || typeu == UserProtocalsType.MT20_OF_VIDEO$VOICE$REQUEST_REJECT$TO$A
            || typeu == UserProtocalsType.MT17_OF_VIDEO$VOICE$REQUEST_REQUESTING$FROM$A
            || typeu == UserProtocalsType.MT18_OF_VIDEO$VOICE$REQUEST_ABRORT$FROM$A
            || typeu == UserProtocalsType.MT35_OF_REAL$TIME$VOICE_END$CHATTING
            || typeu == UserProtocalsType.MT34_OF_REAL$TIME$VOICE$REQUEST_REJECT$TO$A
            || typeu == UserProtocalsType.MT31_OF_REAL$TIME$VOICE$REQUEST_REQUESTING$FROM$A
            || typeu == UserProtocalsType.MT32_OF_REAL$TIME$VOICE$REQUEST_ABRORT$FROM$A) {
            RBChatMainWindowUI.showIMPanelAlert('收到音视频指令，但本客户端暂时不支持实时语音和视频聊天！', false);
        }
        // 【IM指令：普通一对一聊天消息->（聊天消息可能是：文本、图片、语音留言、礼物等）】
        else if (typeu == UserProtocalsType.MT03_OF_CHATTING_MESSAGE) {
            // MsgBodyRoot对象（详见：http://docs.52im.net/extend/docs/api/rainbowchatserver4_pro/com/x52im/rainbowchat/im/dto/MsgBodyRoot.html）
            var msgBody = JSON.parse(dataContent);

            var msgType = msgBody.ty;

            // RosterElementEntity对象，
            // 详见：http://docs.52im.net/extend/docs/api/rainbowchatserver4_pro/com/x52im/rainbowchat/http/logic/dto/RosterElementEntity.html
            var ree = RosterProvider.getFriendInfoByUid(userid);
            if (ree != null) {
                // 如果收到的消息"撤回指令"，则需要单独特殊处理（因为"撤回"指令不是普通的聊天消息哦）
                if (msgType == MsgType.TYPE_REVOKE) {
                    // 进行消息撤回指令的处理逻辑
                    processRecivedRevokeCMD(ChatModeType.CHAT_TYPE_FRIEND$CHAT, fingerPrintOfProtocal, userid, msgBody.m);
                    // 撤回消息时，也同步更新首页“消息”列表中的显示，这样从体验上来说更合理一些
                    var alarmMessageDTO = AlarmsProvider.createChatMsgAlarmForLocal(msgBody.ty, msgBody.m, RBChatUtils.getNickNameWithRemark(ree), userid);
                    RBChatAlarmsUI.insertOrUpdate(alarmMessageDTO, true);
                }
                // 收到的是正常的聊天消息等
                else {

                    //showIMPanelAlert('收到聊天消息：'+msg, true);

                    // 实现好友聊天消息的ui显示逻辑！
                    //addOnlineChatMessage(pFromServer);

                    var alarmMessageDTO = AlarmsProvider.createChatMessageAlarm(msgBody.ty, msgBody.m, RBChatUtils.getNickNameWithRemark(ree), userid, 0);
                    var chatMsgEntity = ChatMsgEntity.prepareRecievedMessage(userid, RBChatUtils.getNickNameWithRemark(ree), msgBody.m, 0, msgBody.ty, fingerPrintOfProtocal);
                    if(obj.ued){
                        const _obj = JSON.parse(obj.ued)
                        // console.log('ued消息测试-单聊',_obj)
                        alarmMessageDTO.mlevel = _obj.uedLevel
                        chatMsgEntity.mlevel = _obj.uedLevel
                        alarmMessageDTO.payDate = _obj.uedLastRechargeDate
                        chatMsgEntity.payDate = _obj.uedLastRechargeDate
                        alarmMessageDTO.nowTime = _obj.nowTime
                        chatMsgEntity.nowTime = _obj.nowTime
                        alarmMessageDTO.cmoney = _obj.uedMoney
                        chatMsgEntity.cmoney = _obj.uedMoney
                    }

                     // 私聊处理离线
                    dealLiXianReply(userid);
                    // 将数据放入并在UI上显示
                    processRecivedMessage(false, false, alarmMessageDTO, chatMsgEntity);
                    var localUserUid = LocalUserInfo.getUid();
                    const flag =  alarmMessageDTO.dataId ;
                    let _notip = RBChatUtils.isKeyVal('noTipStr', flag);
                    if (!_notip) {
                        // 来一个收到消息声音提示
                        AudioPromptHelper.newMessagePromt();
                    }
                }
            } else {
                // log("【onIMData】来自userid=" + userid + "的一对一聊天消息/指令虽收到，但此此人不在好友列表中，本条消息处将被忽略！", true);
                var tcmd = TMessageHelper.parseTempChatMsg_SERVER$TO$B_Message(msg);
                var msgType = tcmd.ty;

                // log('【onIMData】收到陌生人消息(msgType=' + msgType + ')：tcmd=' + JSON.stringify(tcmd));

                // 如果收到的消息"撤回指令"，则需要单独特殊处理（因为"撤回"指令不是普通的聊天消息哦）
                if (msgType == MsgType.TYPE_REVOKE) {
                    // 进行消息撤回指令的处理逻辑
                    processRecivedRevokeCMD(ChatModeType.CHAT_TYPE_GUEST$CHAT, fingerPrintOfProtocal, tcmd.f, tcmd.m);
                    // 撤回消息时，也同步更新首页“消息”列表中的显示，这样从体验上来说更合理一些
                    var alarmMessageDTO = AlarmsProvider.createATempChatMsgAlarmForLocal(tcmd.ty, tcmd.m
                        , tcmd.nickName//msgBody.nickName// 这个字段值就是对方的nickname，但在web端不太好取，而此处可以设为null的
                        // 逻辑是因为本地发出的消息必定是选中了已存在首页陌生人“消息”item，所以此处为null地无谓（因为刷新item时不需要刷新title）
                        , tcmd.f);
                    RBChatAlarmsUI.insertOrUpdate(alarmMessageDTO, true);
                }
                // 收到的是正常的聊天消息等
                else {
                    var alarmMessageDTO = AlarmsProvider.createATempChatMsgAlarm(tcmd.ty, tcmd.m, tcmd.n, tcmd.f, 0);
                    var chatMsgEntity = ChatMsgEntity.prepareRecievedMessage(tcmd.f, tcmd.n, tcmd.m, 0, tcmd.ty, fingerPrintOfProtocal);
                    if (obj.ued) {
                        const _obj = JSON.parse(obj.ued)
                        alarmMessageDTO.mlevel = _obj.uedLevel
                        chatMsgEntity.mlevel = _obj.uedLevel
                        alarmMessageDTO.payDate = _obj.uedLastRechargeDate
                        chatMsgEntity.payDate = _obj.uedLastRechargeDate
                        alarmMessageDTO.nowTime = _obj.nowTime
                        chatMsgEntity.nowTime = _obj.nowTime
                        alarmMessageDTO.cmoney = _obj.uedMoney
                        chatMsgEntity.cmoney = _obj.uedMoney
                    }
                    alarmMessageDTO.user_photo = obj.h;
                    chatMsgEntity.user_photo = obj.h;
                    processRecivedMessage(false, false, alarmMessageDTO, chatMsgEntity);
                    const flag = alarmMessageDTO.dataId
                    let _notip = RBChatUtils.isKeyVal('noTipStr', flag);
                    if (!_notip) {
                        // 来一个收到消息声音提示
                        AudioPromptHelper.newMessagePromt();
                    }
                }
            }
        }
        // 【IM指令：其它web端暂未支持或实现的指令】
        else {
            // log("【onIMData】【非法】来自" + userid + "的未定义typeu=" + typeu + "数据包，无法继续处理，请核实协议定义！", true);
        }
    }

    

    /**
     * 登陆/连接IM服务器成功后要做的事（即表示首次登陆IM服务器成功时）。
     */
    function onIMAfterLoginSucess() {

        log('【onIMAfterLoginSucess】首次登陆/连接IM服务器成功了！', true)

        // 将登出框隐藏并显示登陆成功后的聊天界面
        $("#im-panel-loginbox").hide();
        $("#im-panel-around").show();

        // 注意：以下初始化文件上传方法之所以没有放在RBChatChattingContentPaneUI中调用，原因为
        //      uplodify中要拿到本地用户的loginUserId，而且不能动态拿，所以只能在用户成功登陆
        //      后再初始化之，以便拿到loginUserId
        RBChatChattingContentPaneUI.initFileUplodifive5('image_msg');  // 图片消息的图片文件上传按钮及功能初始化
        RBChatChattingContentPaneUI.initFileUplodifive5('file_msg');   // 大文件消息的文件上传按钮及功能初始化

        // 载入相关数据
        // 说明：因需要连接IM成功后才能调用，所以以下调用不方便放在总init方法里执行
        loadAllDatas();

        // 刷新本地用户的在线状态显示
        RBChatLocalUserUI.refreshOnlineStatus();
        // 刷新网络连接情况的ui显录
        RBChatLocalUserUI.refreshConnectionStatus();
    }

    /**
     * 与IM服务端的网络连接断开时要调用的函数。
     *
     * 【补充说明】：在当前的代码中，本函数将被MobileIMSDK-Web框架回调，请见IMSDK.callback_disconnected 回调函数的设置。
     * 【建议用途】：开发者可在此回调中处理掉线时的界面状态更新等，比如设置将界面上的“在线”文字更新成“离线”。
     */
    function onIMDisconnected() {
        log('[IM] Sorry，你掉线了 ...', true);

        // 刷新本地用户的在线状态显示
        RBChatLocalUserUI.refreshOnlineStatus();
        // 刷新网络连接情况的ui显录
        RBChatLocalUserUI.refreshConnectionStatus();
    }

    // 执行断线重连逻辑
    function connection_agin(){
        // 刷新好友列表及会话列表
        RosterProvider.refreshRosterAsync(function () {
            RBChatRosterUI.reloadFromCache();
            // 刷新会话
            RBChatAlarmsUI.reload(null);
            // 刷新消息
            if(window.alarms_msg){
                const alarmMessageType = window.alarms_msg.alarmMessageType;
                const  dataId = window.alarms_msg.dataId
                // 设置选中
                RBChatAlarmsUI.selectedItem(alarmMessageType, dataId);
            }
        });
    }

    var reconTImer = null;

    /**
     * 掉线重连成功时要调用的函数。
     *
     * 【补充说明】：在当前的代码中，本函数将被MobileIMSDK-Web框架回调，请见IMSDK.callback_reconnectSucess 回调函数的设置。
     * 【建议用途】：开发者可在此回调中处理掉线重连成功后的界面状态更新等，比如设置将界面上的“离线”文字更新成“在线”。
     */
    function onIMReconnectSucess() {
        log('[IM] 掉线自动重连成功了！', true);

        // 网络掉线重连成功后，即时重新载入相关数据（如离线消息等）
        // loadAllDatas();
        // if(reconTImer){
        //     clearTimeout(reconTImer);
        //     reconTImer = null;
        // }
        // reconTImer = setTimeout(function(){
        //     connection_agin();
        // },250)
       
    
        // 刷新本地用户的在线状态显示
        RBChatLocalUserUI.refreshOnlineStatus();
        // 刷新网络连接情况的ui显录
        RBChatLocalUserUI.refreshConnectionStatus();
    }

    /**
     * 本地发出心跳包后的回调通知（本回调并非MobileIMSDK-Web核心逻辑，开发者可以不需要实现！）。
     *
     * 调用时传入的参数：无参数；
     *
     * 【补充说明】：在当前的代码中，本函数将被MobileIMSDK-Web框架回调，请见IMSDK.callback_onIMPing 回调函数的设置。
     * 【建议用途】：开发者可在此回调中处理底层网络的活动情况。
     */
    function onIMPing() {
        //log('[IM] 本地心跳包已发出。', true);
    }

    /**
     * 收到服务端的心跳包反馈的回调通知（本回调并非MobileIMSDK-Web核心逻辑，开发者可以不需要实现！）。
     *
     * 调用时传入的参数：无参数；
     *
     * 【补充说明】：在当前的代码中，本函数将被MobileIMSDK-Web框架回调，请见IMSDK.callback_onIMPong 回调函数的设置。
     * 【建议用途】：开发者可在此回调中处理底层网络的活动情况。
     */
    function onIMPong() {
        //log('[IM] 收到服务端的心中包反馈！', true);

        // 绿色呼吸灯效果（表示心跳在后面正常工作中...）
        RBChatLocalUserUI.setConnectionStatusIconLight(true);
        setTimeout(function () {
            RBChatLocalUserUI.setConnectionStatusIconLight(false);
        }, 500);
    }

    /**
     * 消息未送达的回调事件通知。
     *
     * 【发生场景：比如用户刚发完消息但网络已经断掉了的情况下，表现形式如：就像手机qq或微信一样消息气泡边上会出现红色图标以示没有发送成功）.】
     * 【建议用途：应用层可通过回调中的指纹特征码找到原消息并可以UI上将其标记为”发送失败“以便即时告之用户。】
     *
     * 调用时传入的参数1 {Array<Protocal>}：由框架的QoS算法判定出来的未送达消息列表
     * @since 4.0
     */
    function onIMMessagesLost(lostMessages) {
        log("[IM] [消息未成功送达] 共 " + lostMessages.length + " 条! (网络状况不佳或对方id不存在)", true);

        // 播一个声音提示
        // PromtHelper.tixintPromt(context);

        if (lostMessages != null) {
            // 【关于处理丢包消息的逻辑说明】逻辑是按各种消息依次进行丢包列表减量处理（即该丢的包在前1种方法里
            // 匹配后会从丢包列表中移除，下1次丢包处理方法就不需要处理这个丢包了，因为已经处理过了）

            // TODO: 稍后将为普通消息的发送添加送达保证UI逻辑！
            // ** 【第1种】：尝试作为普通聊天消息或临时聊天消息来处理哦
            // if(lostMessages.size() > 0)
            //     MessageQoSHelper.processMessagesLost_forLoverChat(context, lostMessages);

            // TODO: 稍后将为普通消息的发送添加送达保证UI逻辑！
            // ** 【第2种】：尝试作为BBS公聊消息或普通群聊消息来处理哦
            // if(lostMessages.size() > 0) // 前1种方法处理完成后，丢包列表还不是空的，则意味着还需要进入下一种方法中进一步处理哦
            //     MessageQoSHelper.processMessagesLost_forGroupChat(context, lostMessages);

            // ** 【第3种】：尝试作为"消息"撤回指令的应答来处理哦
            // TODO: 此种情况以后处理，后果是会导致MessageRevokingManager中的集合增长，但指令未实时通送这种情况不常见（何况是撤回这种非常态功能）
            // TODO: ，日后要被充处理的话：先在此处实现与MessageRevokingManager中的匹配逻辑（匹配上后就从集合中删除），然后匹配上后发出广播（通知聊天界面按fp取消进度提示的显示）
        }
    }

    /**
     * 消息已被对方收到的回调事件通知。
     *
     * 【方法说明】：
     *   目前，判定消息被对方收到是有两种可能：
     *   1) 对方确实是在线并且实时收到了；<br>
     *   2) 对方不在线或者服务端转发过程中出错了，由服务端进行离线存储成功后的反馈（此种情况严格来讲不能算是“已被收到
     *      ”，但对于应用层来说，离线存储了的消息原则上就是已送达了的消息：因为用户下次登陆时肯定能通过HTTP协议取到）。
     *
     * 调用时传入的参数1 {String}：已被收到的消息的指纹特征码（唯一ID），应用层可据此ID找到原先已发的消息并可在UI是将
     *                            其标记为”已送达“或”已读“以便提升用户体验。
     * @since 4.0
     */
    function onIMMessagesBeReceived(theFingerPrint) {
        if (theFingerPrint != null) {
            log("[IM] [收到对方消息应答] fp=" + theFingerPrint, true);

            // 找到该应答包对应的目标消息了吗？
            var beMatched = false;

            // TODO: 稍后将为普通消息的发送添加送达保证UI逻辑！
            // ** 【第1种】：尝试作为普通聊天消息或临时聊天消息来处理哦
            // beMatched = MessageQoSHelper.processMessagesBeReceived_forLoverChat(context, theFingerPrint);

            // TODO: 稍后将为普通消息的发送添加送达保证UI逻辑！
            // ** 【第2种】：尝试作为BBS公聊消息或普通群聊消息来处理哦
            // if(!beMatched)
            // beMatched = MessageQoSHelper.processMessagesBeReceived_forGroupChat(context, theFingerPrint);

            // ** 【第3种】：这可能是一条"消息"撤回指令的应答
            if (!beMatched)
                beMatched = RBMessageRevokingManager.revokeCmdBeRecieved(theFingerPrint);

            // ** 没有匹配到任何消息或指令
            if (!beMatched)
                log("[IM] 【QoS】指纹是" + theFingerPrint + "的应答包没有找到匹配目标，意味着目前应用层不用理会此类应答包，忽略之...");
        }
    }

    /**
     * MobileIMSDK-Web框架层的一些提示信息显示回调（本回调并非MobileIMSDK-Web核心逻辑，开发者可以不需要实现！）。
     *
     * 调用时传入的参数1（必填）；文本类型，表示提示内容
     *
     * 【补充说明】：在当前的代码中，本函数将被MobileIMSDK-Web框架回调，请见IMSDK.callback_onIMShowAlert 回调函数的说明。
     * 【建议用途】：开发者不设置的情况下，框架默认将调用window.alert()显示提示信息，否则将使用开发者设置的回调——目的主要是给
     *           开发者自定义这种信息的UI显示，提升UI体验，别无它用。
     */
    function onIMShowAlert(alertContent) {
        if(alertContent.indexOf('账号已在其它地方登陆')!=-1){
            const res = confirm(alertContent)
            if(res){
                RBChatMainUI.doLogout();
            }
            return;
        }
        RBChatDialogHelper.showAlertDialog_INFO("友情提示", alertContent);
    }
    //#################################################################### 【6】IM相关代码 END



    //#################################################################### 【7】数据载入和处理相关代码 END
    /**
     * 载入相关数据。
     */
    function loadAllDatas() {

        // 刷新本地用户信息的UI显示
        RBChatLocalUserUI.refresh();

        // 载入好友列表（载入数据并UI显示）
        RosterProvider.refreshRosterAsync(function () {
            RBChatRosterUI.reloadFromCache();

            // 载入首页历史“消息”列表（载入数据并UI显示）：确保在好友列表
            // 加载完成后加载首页“消息”数据，防止出现误判“陌生人”的情况
            RBChatAlarmsUI.reload(null);
        });

        // 载入群组列表（载入数据并UI显示）
        GroupsProvider.refreshGroupsListAsync(function () {
            RBChatGroupsUI.reloadFromCache();
        });

        // 从服务端加载最新的本地用户信息（及时保持本地用户信息数据为最新版）
        LocalUserInfo.reloadFromServer(function () {
            // 刷新本地用户信息的UI显示
            RBChatLocalUserUI.refresh();
            setTimeout(function(){
                $('#im-panel-header-lixian').text(window.isLiXian ? '取消离线':'设置离线')
            },250)
        });
    }
    //#################################################################### 【7】数据载入和处理相关代码 END



    //#################################################################### 【7】一些实用方法 START
    function gotoLoginPage() {
        window.location.href = '../login.html';
    }

    function getCurrentSelectedAlarmType() {
        return mCurrentSelectedAlarmType;
    }

    function getCurrentSelectedAlarmDataId() {
        return mCurrentSelectedAlarmDataId;
    }

    function setCurrentSelectedAlarm(alarmType, dataId) {
        mCurrentSelectedAlarmType = alarmType;
        mCurrentSelectedAlarmDataId = dataId;
    }

    /**
     * 当前收到的Protocal，是否是当前正在聊天中的On chat访客发出的。
     *
     * @param p
     * @returns {*|boolean}
     */
    function isCurrentSelectedAlarm(alarmType, dataId) {
        return (mCurrentSelectedAlarmType === alarmType)
            && (mCurrentSelectedAlarmDataId === dataId);
    }

    //#################################################################### 【7】一些实用方法 START


    //#################################################################### 【9】最终执行代码 START
    // 执行初始化
    initAll();
    //#################################################################### 【9】最终执行代码 END


    var ui = {
        /*---------------------- 公开的常量 ----------------------*/
        //SELECTED_CONTENT_TYPE_SINGLE_CHATTING : SELECTED_CONTENT_TYPE_SINGLE_CHATTING,
        //SELECTED_CONTENT_TYPE_GROUP_CHATTING  : SELECTED_CONTENT_TYPE_GROUP_CHATTING,


        /*---------------------- 公开的函数 ----------------------*/
        doLogout: doLogout,
        doLoginIMServer: doLoginIMServer,
        getCurrentSelectedAlarmType: getCurrentSelectedAlarmType,
        getCurrentSelectedAlarmDataId: getCurrentSelectedAlarmDataId,
        setCurrentSelectedAlarm: setCurrentSelectedAlarm,
        isCurrentSelectedAlarm: isCurrentSelectedAlarm,

        processRecivedMessage: processRecivedMessage,
        processRecivedRevokeCMD: processRecivedRevokeCMD

    };

    window.RBChatMainUI = ui;

})();
