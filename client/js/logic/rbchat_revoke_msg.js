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
 * 消息"撤回"功能对应的进度提示框（此进度框将在撤回指令发出时显示，撤回指令的ACK应答收到时取肖显示）。
 *
 * @author JackJiang
 * @since 4.0
 */
// TODO: 重构名为 RBMessageRevokingProgess
var RBMessageRevokingDialogProgess = (function () {

    // 构造器（相当于java里的构造方法）
    var UIModuleMRDP = function () {

        // 被撤回消息对应的指纹码（如果是群聊，则此指纹码实际指的是父指纹码——即fingerPrintOfParent）
        this.fpForMessage = null;

        // 实例化进度提示框对象
        var that = this;
        this.progress = RBLoadingToastTimmerFactory(10 * 1000, "消息撤回中", function () {
            RBChatDialogHelper.showAlertDialog_WARN("出错了", "消息撤回失败，请稍后重试！");
            that.hide(true, null);
        });
    };


    /**
     * 显示进度提示框。
     *
     * @param fpForMessage {String} 被撤回消息对应的指纹码（如果是群聊，则此指纹码实际指的是父指纹码——即fingerPrintOfParent）
     */
    UIModuleMRDP.prototype.show = function(fpForMessage){
        // 如果已经显示则强制取消显示
        if(this.progress && this.progress.isShowing()){
            this.hide(true, null);
        }

        this.fpForMessage = fpForMessage;

        // 显示进度提示框
        if(this.progress)
            this.progress.showProgressDialogForPairing(true);
    };

    /**
     * 隐藏进度提示框的显示。
     *
     * @param enforce {boolean} true表示无条件强制进度提示框的显示，false表示只有当 fpForMessage 参数与当前正在撤回的指纹码一致才会取消显示哦
     * @param fpForMessage {String} 被撤回消息对应的指纹码（如果是群聊，则此指纹码实际指的是父指纹码——即fingerPrintOfParent）
     * @return {boolean}
     */
    UIModuleMRDP.prototype.hide = function (enforce, fpForMessage) {
        RBChatUtils.logToConsole_INFO("【消息撤回】[RevokingProgess.hide]正在hide进度提示框（enforce=" + enforce + ", fpForMessage=" + fpForMessage + "）。。。");
        if (enforce) {
            if (this.progress)
                this.progress.showProgressDialogForPairing(false);
            this.fpForMessage = null;
            return true;
        } else {
            if (this.fpForMessage != null && this.fpForMessage == fpForMessage) {
                RBChatUtils.logToConsole_INFO("【消息撤回】[RevokingProgess.hide]hide进度提示框成功（fpForMessage == this.fpForMessage == " + fpForMessage + " ）。。。");
                if (this.progress)
                    this.progress.showProgressDialogForPairing(false);
                this.fpForMessage = null;
                return true;
            } else {
                RBChatUtils.logToConsole_WARN("【消息撤回】[RevokingProgess.hide]hide进度提示框失败，（fpForMessage != this.fpForMessage，fpForMessage=>"
                    + fpForMessage + "、this.fpForMessage=>" + this.fpForMessage + "）。。。");
            }
            return false;
        }
    };


    return new UIModuleMRDP();
})();


/**
 * 消息"撤回"全局管理器。
 * <p>
 * 【该管理器的作用】：
 * 由于实时消息撤回指令跟其它实时指令一样，都是异步发出和异步应答的（消息撤回指令等待应答的目的是
 * 确保消息撤回指令已送达，否则将影响撤回功能的用户体验，这很重要），所以本类中使用一个Map管理当前
 * 正在被撤回中的消息（即key=撤回指令的fp指纹码，value=当前正在被撤回消息在消息列表中的Message
 * 数据模型对象），当收到撤回指令的的ACK应答包时，就表示撤回指令已送达，UI上就可以取消跟微信\QQ
 * 一样的菊花进度提示框架、同时进行本地消息撤回的余下逻辑（内存数据更新、ui显示更新等）。
 * <p>
 * 【一个疑问】：
 * 既然消息撤回指令使用实时指令，因为异步应答让事情应该的稍难处理，那干嘛不像其它需要即时得到反馈的
 * 指令那样通过http接口发出呢？原因是消息撤回涉及到陌生人聊天、好友聊天、群聊天，http接口到服务端后
 * ，服务端那头再进行撤回的下行逻辑（即通知被撤回方、以及一些离线处理逻辑等等），需要区分3种聊天模式
 * 的话，就会多很多额外的代码，会把事情搞的更复杂。所以目前这样，利用聊天通道，以实时指令方式送出，作
 * 为一种特殊的"聊天"消息，就可以借用现有的完整消息发送、应答、离线逻辑、消息记录处理逻辑，就能少掉很
 * 多额外代码，代码实现上也更优雅。
 * <p>
 *
 * @author JackJiang
 * @since 4.0
 */
var RBMessageRevokingManager = (function () {

    var RevokedMeta = function(){
        /** "撤回"者的uid */
        this.uid = null;
        /** 撤回"者的昵称 */
        this.nickName = null;

        /**
         * 被"撤回"者的uid。
         * <p>
         * 注：用于群聊时，由管理员撤回其它群员消息时存入被撤回消息的发送者uid，其它余情况下本参数为空！
         */
        this.beUid = null;
        /**
         * 被"撤回"者的昵称。
         * <p>
         * 注：用于群聊时，由管理员撤回其它群员消息时存入被撤回消息的发送者uid，其它余情况下本参数为空！
         */
        this.beNickName = null;

        /** 将要被撤回的消息的指纹码（也就是唯一ID啦） */
        this.fpForMessage = null;
        /** 未撤回前的原始消内容（当前仅用于文本消息时，用于撤回后的"重新编辑"功能时使用） */
        this.originalContent = null;
    };

    var MessageBeRevoke = function () {
        this.chatType = -1;
        this.message = null; // ChatMsgEntity
    };

    // 构造器（相当于java里的构造方法）
    var UIModuleMRM = function () {

        /** 正在被"撤回"的消息集合（虽然实际实用时，一般集合中只有一条，但技术实现上能支持多条，目的对用户的非正常操作进行最大限度的容错） */
        this.beRevokingMessages = new MBHashMap();// key=fpForRevokeCmd, value=MessageBeRevoke
    };

    /**
     * 开始撤回。
     *
     * @param fpForRevokeCmd {String} 发出的消息"撤回"指令对应的指纹码
     * @param messageBeRevoke {MessageBeRevoke} 要撤回的消息位于聊天列表数据模型中的消息对象
     */
    UIModuleMRM.prototype.revokeStart = function(fpForRevokeCmd, messageBeRevoke){
        RBChatUtils.logToConsole_INFO("【消息撤回】[revokeStart]fpForRevokeCmd="+fpForRevokeCmd+", messageBeRevoke="+JSON.stringify(messageBeRevoke));
        if(fpForRevokeCmd && messageBeRevoke) {
//          if (!messages.containsKey(fpForRevokeCmd))
                this.beRevokingMessages.put(fpForRevokeCmd, messageBeRevoke);
        }
        else{
            RBChatUtils.logToConsole_WARN("【消息撤回】无效的参数，revokeStart无法继续，fpForRevokeCmd="+fpForRevokeCmd+"、messageBeRevoke="+messageBeRevoke);
        }
    };

    /**
     * 已收到撤回指令应答（可以认为将被或已被对方收到）。
     *
     * @param fpForRevokeCmd {String} 发出的消息"撤回"指令对应的指纹码
     * @return {boolean} true表示集合中存在该fp
     */
    UIModuleMRM.prototype.revokeCmdBeRecieved = function(fpForRevokeCmd){
        // MessageBeRevoke
        var beRevoking = this.beRevokingMessages.get(fpForRevokeCmd);
        if(beRevoking){
            RBChatUtils.logToConsole_INFO("【消息撤回】[revokeCmdBeRecieved]收到fpForRevokeCmd="+fpForRevokeCmd+"的应答，且查【有】此fp，将继续往下执行消息撤回功能的余下逻辑.....");

            this.fireRevokeSucess(fpForRevokeCmd, beRevoking);
            this.beRevokingMessages.remove(fpForRevokeCmd);
            return true;
        }
        else{
            RBChatUtils.logToConsole_WARN("【消息撤回】[revokeCmdBeRecieved]收到fpForRevokeCmd="+fpForRevokeCmd+"的应答，且查【无!】此fp，此条应答将被忽额。");
        }

        return false;
    };

    /**
     * 消息撤回成功后要做的事。
     *
     * @param fpForRevokeCmd {String} 发出的消息"撤回"指令对应的指纹码
     * @param messageBeRevoke {MessageBeRevoke} 要撤回的消息位于聊天列表数据模型中的消息对象
     */
    UIModuleMRM.prototype.fireRevokeSucess = function (fpForRevokeCmd, messageBeRevoke) {

        RBChatUtils.logToConsole_INFO("【消息撤回】消息撤回成功，马上开始执行真正的撤回逻辑 ==> messageBeRevoke = " + JSON.stringify(messageBeRevoke));

        if (!messageBeRevoke) {
            RBChatUtils.logToConsole_WARN("【消息撤回】messageBeRevoke == null！");
            return;
        }

        // 被撤回消息来自于哪种聊天模式
        var chatType = messageBeRevoke.chatType;// int
        // 被撤回消息所处聊天列表中的数据模型对象引用
        var message = messageBeRevoke.message;// Message

        var isGroupChat = (chatType == ChatModeType.CHAT_TYPE_GROUP$CHAT);
        // 被撤回消息的指纹码（如果是群聊消息，则这是被撤回消息的父指纹码）
        var fpForMessage = (isGroupChat ? message.fingerPrintOfParent : message.fingerPrintOfProtocal);
        // 构造被撤回消息内容对象（后续发出的指令内容等，就是这个对象）
        var revokedMeta = this.constructRevokedMetaForOperator(fpForMessage
            // 是群聊 且 撤回的是别人的消息时，需要传入被撤回消息发送者的uid
            , isGroupChat && !message.isOutgoing ? message.uid : null
            // 是群聊 且 撤回的是别人的消息时，需要传入被撤回消息发送者的昵称
            , isGroupChat && !message.isOutgoing ? (message.groupName ? message.groupName : message.name) : null);// RevokedMeta

        //*** 更新本地sqlite数据库
        // updateSQLiteForMessage(chatType, fpForMessage, revokedMeta);

        //*** 更新消息列表数据对象内容
        var sucess = this.updateModelForMessage(chatType, revokedMeta, message, fpForRevokeCmd, fpForMessage);
        if (sucess) {
            RBChatUtils.logToConsole_INFO("【消息撤回】主动撤回消息时，updateModelForMessage成功了。(content="
                + JSON.stringify(revokedMeta) + "，message=" + JSON.stringify(message) + "，fpForRevokeCmd=" + fpForRevokeCmd + ")");
        } else {
            RBChatUtils.logToConsole_WARN("【消息撤回】主动撤回消息时，updateModelForMessage失败了！(content="
                + JSON.stringify(revokedMeta) + "，message=" + JSON.stringify(message) + "，fpForRevokeCmd=" + fpForRevokeCmd + ")");
        }

        //*** 取消消息撤回进度提示框的显示
        RBChatChattingContentPaneUI.hideMessageRevokingProgess(false, fpForMessage);
    };

    /**
     * 更新消息列表数据对象内容。
     *
     * @param chatType {int} 聊天类型（可以是好友聊天、陌生人聊天、群聊），见 {@link ChatModeType}
     * @param content {RevokedMeta} 更新内容
     * @param message {ChatMsgEntity} 要撤回的消息位于聊天列表数据模型中的消息对象
     * @param fpForRevokeCmd {String}
     * @param fpForMessage {String}
     * @return {boolean} true表示更新成功，否则不成功
     */
    UIModuleMRM.prototype.updateModelForMessage = function(chatType, content,  message, fpForRevokeCmd, fpForMessage){
        if (content != null) {
            // 当是文本消息时就不清理消息内容了（以便稍后实现消息撤回后的"重新编辑"功能）
            if (message.msgType == MsgType.TYPE_TEXT) {
                content.originalContent = message.text;
            }
            message.text = JSON.stringify(content);
            message.msgType = MsgType.TYPE_REVOKE;

            //*** 通知UI层刷新显示
            // BroadcastToolKits.revokeCMDRecieved_SEND(MyApplication.getInstance2(), fpForRevokeCmd, fpForMessage);
            // 尝试更新聊天列表中的消息内容显示
            RBChatChattingContentPaneUI.updateChatItemForRevoked(chatType, message);
            // // 取消消息撤回进度提示框的显示
            // RBChatChattingContentPaneUI.hideMessageRevokingProgess(false, fpForMessage);

            return true;
        }
        return false;
    };

    /**
     *
     * @param String
     */
    UIModuleMRM.prototype.constructRevokedMeta = function(uid, nickName, fpForMessage, originalContent){
        var revokedMeta = new RevokedMeta();
        revokedMeta.uid = uid;
        revokedMeta.nickName = nickName;
        revokedMeta.fpForMessage = fpForMessage;
        revokedMeta.originalContent = originalContent;
        return revokedMeta;
    };

    /**
     * 为消息"撤回"发起者构建撤回指令内容对象。
     *
     * @param fpForMessage {String} 被撤回消息的指纹码（如果是群聊消息，则此值应取它的fingerPringOfParent值哦）
     * @param beUid {String}被"撤回"者的uid（当前用于群聊时，由管理员撤回其它群员消息时存入被撤回消息的发送者uid，其它余情况下本参数为空！）
     * @param beNickName {String} 被"撤回"者的昵称（当前用于群聊时，由管理员撤回其它群员消息时存入被撤回消息的发送者uid，其它余情况下本参数为空！）
     * @return {RevokedMeta} 新对象
     */
    UIModuleMRM.prototype.constructRevokedMetaForOperator = function(fpForMessage, beUid, beNickName){
        var localUserInfo = LocalUserInfo.getObj();
        if(!localUserInfo)
            return null;

        var rm = this.constructRevokedMeta(localUserInfo.user_uid, localUserInfo.nickname, fpForMessage, null);
        rm.beUid= beUid;
        rm.beNickName = beNickName;
        return rm;
    };

    /**
     *
     * @param message {ChatMsgEntity}
     */
    UIModuleMRM.prototype.constructMessageBeRevoke = function(chatType, message){
        if(chatType < 0 || !message)
            return null;

        var messageBeRevoke = new MessageBeRevoke();
        messageBeRevoke.chatType = chatType;
        messageBeRevoke.message = message;
        return messageBeRevoke;
    };

    UIModuleMRM.prototype.clear = function(){
        if(this.beRevokingMessages)
            this.beRevokingMessages.clear();
    };


    return new UIModuleMRM();
})();



