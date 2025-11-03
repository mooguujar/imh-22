
'use strict';

/**
 * 一对一好友聊天相关消息/指令的发送和解析方法。
 *
 * @author Jack Jiang(http://www.52im.net/space-uid-1.html)
 * @version 1.0
 * @since 1.0
 */
// MessageHelper 对象
(function () {

    /**
     * 根据消息类型，显示友好的文字内容供某些情况下的预览（比如首页”消息“列表中、系统通知等）.
     *
     * @param messageContent 真正的聊天文本内容（该内容可能是扁平文本（文本聊天消息）、文件（语音留言、图片消息）），是TextMessage中的m内容
     * @return 返回消息文本（仅用于ui显示哦）
     * @since 2.2
     */
    function _parseMessageForShow(messageContent, msgType)
    {
        if(RBChatUtils.isStringEmpty(messageContent))
            return "";

        // 自kchat2.2(20140212)后，此字段将用于消息内容的显示
        var messageContentForShow = "";

        // 强转聊天消息类型：js中的switch语句，在匹配时不会进行类型转换，会使用“===”的方式进行比
        // 较，请确保msgType参数传过来时必须是显示转换为int后的结果（因为服务端的http接口拉过
        // 来的数据时，msgType使用的是String类型）！
        msgType = parseInt(msgType);
        messageContent = messageContent.replace(new RegExp('<br/>', 'g'), '').replace(new RegExp('<br>', 'g'), '');
        messageContent = messageContent.replace(new RegExp('\n', 'g'), '');
        messageContent = messageContent.replace(/[\r|\t]/g,"")
        messageContent = RBChatUtils.translate_minapp(messageContent,false)
        switch(msgType) {
            case 9:
                messageContentForShow = "[小程序]";
                break;
            case 10:
                messageContentForShow = "[红包]";
                break;
            case 11:
                var fm = JSON.parse(messageContent);
                messageContentForShow = _parseMessageForShow(fm.to.text, 0)
                break;
            case 12:
                try{
                    var fm = JSON.parse(messageContent);
                    messageContentForShow = _parseMessageForShow(fm.origin_text, 0)
                }catch(e){
                    console.log('解析报错', e, messageContent)
                }
               
                break;
            case 13:
                var fm = {}
                try {
                    fm = JSON.parse(messageContent);
                } catch (err) {}
                messageContentForShow = fm.type - 0  == 0 ? '[图片]':'[视频]'
                if (fm.text) {
                    messageContentForShow += fm.text
                }
                break;
            case MsgType.TYPE_IMAGE:
                messageContentForShow = "[图片]";
                break;
            case MsgType.TYPE_VOICE:
                messageContentForShow = "[语音]";
                break;
            case MsgType.TYPE_GIFT$SEND:
                messageContentForShow = "[收到礼物]";
                break;
            case MsgType.TYPE_GIFT$GET:
                messageContentForShow = "[能送我个礼物吗？]";
                break;
            case MsgType.TYPE_FILE:
                // 文件消息的内容体是FileMeta对象的JSON形式
                var fm = JSON.parse(messageContent);

                // FileMeta对象字段说明，请见Android或ios端工程里的FileMeta.java或FileMeta.h文件
                messageContentForShow = "[文件]" + (fm ? " " + fm.fileName : "");
                break;
            case MsgType.TYPE_SHORTVIDEO:
                var fm = JSON.parse(messageContent);
                messageContentForShow = fm.isMovie ? "[电影]": "[短视频]";
                break;
            case MsgType.TYPE_CONTACT:
                messageContentForShow = "[个人名片]";
                break;
            case MsgType.TYPE_LOCATION:
                // 位置消息的内容体是LocationMeta对象的JSON形式
                var lm = JSON.parse(messageContent);
                var extra = (lm == null?"":(RBChatUtils.isStringEmpty(lm.locationTitle)?"":" " + lm.locationTitle));
                messageContentForShow = "[位置]"+extra;
                break;
            case MsgType.TYPE_REVOKE:
                // 被撤回消息的内容体是RevokedMeta对象的JSON形式
                var revokedMeta = JSON.parse(messageContent);
                messageContentForShow = _getMessageContentPreviewForRevoked(revokedMeta);
                break;
            default:
                messageContentForShow = messageContent;
                break;
        }

        return messageContentForShow;
    }

    /**
     * 被撤回的消息，预览内容显示。
     *
     * @param rm {RevokedMeta} 被撤回消息的内容体对象
     * @return {String} 返回内容预览
     */
    function _getMessageContentPreviewForRevoked(rm, showUserLink)
    {
        var ret = "撤回了一条消息";
        if(rm != null){
            var uidForOperator = rm.uid;
            var nickeNameForOperator = rm.nickName;

            // 被"撤回"者的uid（当前用于群聊时，由管理员撤回其它群员消息时存入被撤回消息的发送者uid，其它余情况下本参数为空！）
            var beUid = rm.beUid;
            // 被"撤回"者的昵称（当前用于群聊时，由管理员撤回其它群员消息时存入被撤回消息的发送者uid，其它余情况下本参数为空！）
            var beNickname = rm.beNickName;

            // RosterElementEntity localRee = MyApplication.getInstance2().getIMClientManager().getLocalUserInfo();
            var localUid = IMSDK.getLoginInfo().loginUserId;

            var revokedOperatorNick = "";
            var beRevokesOperatorNick = "";

            // 撤回者昵称显示内容
            if(localUid && uidForOperator && uidForOperator == localUid){
                revokedOperatorNick = "你";
            }
            else{
                if(showUserLink)
                    revokedOperatorNick = ' \"<a href=\"javascript:void(0);\" onclick=\"RBChatDialogHelper.showUserInfoFromServer(false, null, ' + uidForOperator + ', null);\">' + nickeNameForOperator + '</a>\" ';
                else
                    revokedOperatorNick = '\"'+nickeNameForOperator+'\" ';
            }

            // 被撤回者昵称显示内容
            if(beUid){
                if(uidForOperator && beUid != uidForOperator) {
                    if(localUid && beUid == localUid)
                        beRevokesOperatorNick= "你的";
                    else {
                        if(showUserLink)
                            beRevokesOperatorNick = ' \"<a href=\"javascript:void(0);\" onclick=\"RBChatDialogHelper.showUserInfoFromServer(false, null, ' + beUid + ', null);\">' + beNickname + '</a>\" 的';
                        else
                            beRevokesOperatorNick = ' \"' + beNickname + '\" 的';
                    }
                }
                else
                    beRevokesOperatorNick = "";
            }
            else {
                beRevokesOperatorNick = "";
            }

            // 注意：同一条撤回提示，在不同的人看到时，显示的结果是一样的：
            // (通过上述逻辑之后，组合成的结果有以下5种可能)
            //   1）" 你撤回了一条消息 "            （单聊或群聊时）
            //   2）" "李四"撤回了一条消息 "        （单聊或群聊时）
            //   3）" 你撤回了"张三"的一条消息 "     （群聊时）
            //   4）" "李四"撤回了你的一条消息 "     （群聊时）
            //   5）" "李四"撤回了"张三"的一条消息 " （群聊时）
            ret = revokedOperatorNick+"撤回了"+beRevokesOperatorNick+"一条消息";

            /*
            // 操作者是本地用户，就显示"你撤回了一条消息"
            if(localUid != null && uidForOperator != null && uidForOperator == localUid){
                ret = "你撤回了一条消息";
            }
            else{
                ret = "\""+(RBChatUtils.isStringEmpty(nickeNameForOperator)?"":nickeNameForOperator)+"\" 撤回了一条消息";
            }*/
        }
        else
            ret = "";

        return ret;
    }


    //*********************************************************************** （1）解析接收的消息或指令 START
    /**
     * 解析由服务发过来的加好友被拒的实时信息（由服务端通知加好友发起人A）.
     *
     * <p>
     * 此场景一般是：A加B的好友请求被B拒绝了，服务器实时把此情况反馈给客户A，以便A
     * 能即时知会哦。
     *
     * @param originalMsg 服务端返回的RosterElementEntity对象的JSON文本字符串
     * @return 返回的是B的个人信息，即RosterElementEntity对象（此信息仅包含B存放在数据库中的数据，无其它在线状况信息描述），
     * 详见：http://docs.52im.net/extend/docs/api/rainbowchatserver4_pro/com/x52im/rainbowchat/http/logic/dto/RosterElementEntity.html
     */
    function _parseProcessAdd$Friend$Req_SERVER$TO$A_REJECT_RESULTMessage(originalMsg)
    {
        console.info("!!!!!!收到服务端发过来的好加友被拒信息："+originalMsg);
        return JSON.parse(originalMsg);
    }

    /**
     * 解析由服务发过来的好友个人信息.
     *
     * <p>
     * 此场景一般是：新好友已成功被添加完成，服务端将建立了好友关系的对方个人信息及时
     * 发送给本地用户（当然，前提是本地用户是在线的，否则没有必要传过来，以便能及时聊天）。
     *
     * @param originalMsg 服务端返回的RosterElementEntity对象的JSON文本字符串
     * @return 返回值为RosterElementEntity对象，
     * 详见：http://docs.52im.net/extend/docs/api/rainbowchatserver4_pro/com/x52im/rainbowchat/http/logic/dto/RosterElementEntity.html
     */
    function _parseProcessAdd$Friend$Req_friend$Info$Server$To$ClientMessage(originalMsg)
    {
        console.info("!!!!!!收到服务端发过来的新好友信息："+originalMsg);
        return JSON.parse(originalMsg);
    }

    /**
     * 解析由服务端通知在线被加好友者：收到了加好友请求.
     *
     * @param originalMsg 服务端返回的RosterElementEntity对象的JSON文本字符串
     * @return 返回值为RosterElementEntity对象，
     * 详见：http://docs.52im.net/extend/docs/api/rainbowchatserver4_pro/com/x52im/rainbowchat/http/logic/dto/RosterElementEntity.html
     */
    function _parseAddFriendRequestInfo_server$to$b(originalMsg)
    {
        console.info("!!!!!!收到服务端转发的加好友请求："+originalMsg);
        return JSON.parse(originalMsg);
    }

    /**
     * 解析由服务端反馈给加好友发起人的错误信息(出错的可能是：该好友
     * 已经存在于我的好友列表中、插入好友请求到db中时出错等)
     *
     * @param originalMsg
     * @return 错误信息（文本）
     */
    function _parseAddFriendRequestResponse_for$error_server$to$a(originalMsg)
    {
        return originalMsg;
    }

    function _pareseRecieveOnlineNotivication(msg)
    {
        // 通知内容就是这个上线用户的Uid
        var uid = msg;
        console.info("!!!!!!!!!!!!》》收到用户"+uid+"的上线通知！");
        return uid;
    }

    function _pareseRecieveOfflineNotivication(msg)
    {
        // 通知内容就是这个下线用户的Uid
        var uid = msg;
        console.info("!!!!!!!!!!!!《《收到用户"+uid+"的下线通知！");
        return uid;
    }

    //*********************************************************************** （1）解析接收的消息或指令 END


    //*********************************************************************** （2）发出的消息或指令 START
    ///**
    // * 将指定的图片消息发送给聊天中的好友.
    // */
    //function _sendPlainTextMessage(friendUID, message, fn_callback) {
    //    _sendMessage(MsgType.TYPE_TEXT, friendUID, message, fn_callback);
    //}
    //
    ///**
    // * 将指定的图片消息发送给聊天中的好友.
    // */
    //function _sendImageMessage(friendUID, imageFileName, fn_callback) {
    //    _sendMessage(MsgType.TYPE_IMAGE, friendUID, imageFileName, fn_callback);
    //}

    /**
     *
     * @param msgType
     * @param friendUID
     * @param msgContent
     * @param fn_callback
     * @param fingerPrint {String} 被发消息的指纹码，为空时将由通信底层自动生成
     * @private
     */
    function _sendMessage(msgType, friendUID, msgContent, fn_callback, fingerPrint, isIMCheck=true,isGroupSend=false, sendUser){
        var sucess = false;
        var msgBody = null;

        if(isIMCheck && !RBChatChattingContentPaneUI.send4IMCheck(sendUser)){
            //
        }
        else if(!friendUID){
            RBChatChattingContentPaneUI.deleteSendMsgRetryQueue(fingerPrint)
            //alert('消息接收者不能为空！');
            RBChatDialogHelper.showAlertDialog_INFO('友情提示', '消息接收者不能为空！');
        }
        else if(!msgContent){
            RBChatChattingContentPaneUI.deleteSendMsgRetryQueue(fingerPrint)
            //alert('消息内容不能为空！');
            RBChatDialogHelper.showAlertDialog_INFO('友情提示', '消息内容不能为空！');
        }
        else{
            // 消息发送者uid（就是本地用户的uid了）
            var fromUid = IMSDK.getLoginInfo().loginUserId;
            // 要发送的聊天消息内容，实际上是一个MsgBody4Friend对象
            // （详见：http://docs.52im.net/extend/docs/api/rainbowchatserver4_pro/com/x52im/rainbowchat/im/dto/MsgBody4Friend.html）
            msgBody = _constructFriendChatMsgBody(fromUid, friendUID, msgContent, msgType);
            msgBody.g="";
            msgBody.n = LocalUserInfo.getObj().nickname;
            // 构建建IM协议报文包（即Protocal对象，详见：http://docs.52im.net/extend/docs/api/mobileimsdk/server/net/openmob/mobileimsdk/server/protocal/Protocal.html）
            // var p = createCommonData2(JSON.stringify(msgBody), fromUid, friendUID, UserProtocalsType.MT03_OF_CHATTING_MESSAGE);
            var p = MBProtocalFactory.createCommonData(JSON.stringify(msgBody), fromUid, friendUID, true, fingerPrint, UserProtocalsType.MT03_OF_CHATTING_MESSAGE);
            if(isGroupSend){
                p.all='1'
            }
            // 将消息通过websocket发送出去
            IMSDK.sendData(p);
            RBChatAlarmsUI.updateChatCache({ [p.from]: Date.now() }, p.to)
            sucess = true;
        }

        if(fn_callback){
            fn_callback(sucess, msgBody);
        }
    }

    /**
     * 构造好友聊天消息协议体的 MsgBody4Friend DTO对象.
     * （MsgBody4Friendt对象详见：http://docs.52im.net/extend/docs/api/rainbowchatserver4_pro/com/x52im/rainbowchat/im/dto/MsgBody4Friend.html）
     *
     * @msgType 聊天消息类型
     * @param f 发送方的uid
     * @param t 发发送到的群id
     * @param m 消息内容，纯文本字串，可能是聊天文字、图片文件名或语音文件名等，但一定不是JSON字串
     * @param ty 聊天消息类型
     * @return
     */
    function _constructFriendChatMsgBody(f, t, m, ty) {
        var headPhoto = LocalUserInfo.getObj().userAvatarFileName && LocalUserInfo.getObj().userAvatarFileName.length > 0? LocalUserInfo.getObj().userAvatarFileName:'';
        // 新的MsgBody4Friend对象
        var tcmd = {};
        tcmd.cy = ChatModeType.CHAT_TYPE_FRIEND$CHAT; // 聊天模式类型：一对一好友聊天
        tcmd.f = f;
        tcmd.h = headPhoto;
        tcmd.t = t;
        tcmd.m = m;
        tcmd.ty = ty;
        return tcmd;
    }
    //*********************************************************************** （2）发出的消息或指令 END


    window.MessageHelper = {
        getMessageContentPreviewForRevoked                             : _getMessageContentPreviewForRevoked,
        parseMessageForShow                                            : _parseMessageForShow,
        parseProcessAdd$Friend$Req_SERVER$TO$A_REJECT_RESULTMessage    : _parseProcessAdd$Friend$Req_SERVER$TO$A_REJECT_RESULTMessage,
        parseProcessAdd$Friend$Req_friend$Info$Server$To$ClientMessage : _parseProcessAdd$Friend$Req_friend$Info$Server$To$ClientMessage,
        parseAddFriendRequestInfo_server$to$b                          : _parseAddFriendRequestInfo_server$to$b,
        parseAddFriendRequestResponse_for$error_server$to$a            : _parseAddFriendRequestResponse_for$error_server$to$a,
        pareseRecieveOnlineNotivication                                : _pareseRecieveOnlineNotivication,
        pareseRecieveOfflineNotivication                               : _pareseRecieveOfflineNotivication,

        //sendPlainTextMessage   : _sendPlainTextMessage,
        //sendImageMessage       : _sendImageMessage,

        sendMessage : _sendMessage
    };

})();



// TMessageHelper 对象
(function () {

    //*********************************************************************** （1）解析接收的消息或指令 START
    /**
     * 解析临时聊天消息：由服务端转发给接收人B的【步骤2/2】.
     *
     * <p>
     * 当然，此消息被接收到的前提条件是B用户此时是在线的（否则临时聊天消息将服务端被存储到DB中（直到本地用户下次上线））。
     *
     * @param originalMsg 服务端返回对象的JSON文本形式
     * @return 返回值为MsgBody4Guest对象，详见：http://docs.52im.net/extend/docs/api/rainbowchatserver4_pro/com/x52im/rainbowchat/im/dto/MsgBody4Guest.html
     */
    function _parseTempChatMsg_SERVER$TO$B_Message(originalMsg)
    {
        console.info("!!!!!!收到服务端发过来的临时聊天信息：" + originalMsg);
        return JSON.parse(originalMsg);
    }
    //*********************************************************************** （1）解析接收的消息或指令 END


    //*********************************************************************** （2）发出的消息或指令 START

    ///**
    // * 将指定的图片消息发送给聊天中的好友.
    // */
    //function _sendGuestPlainTextMessage(guestUID, message, fn_callback) {
    //    _sendGuestMessage(MsgType.TYPE_TEXT, guestUID, message, fn_callback);
    //}
    //
    ///**
    // * 将指定的图片消息发送给聊天中的好友.
    // */
    //function _sendGuestImageMessage(guestUID, imageFileName, fn_callback) {
    //    _sendGuestMessage(MsgType.TYPE_IMAGE, guestUID, imageFileName, fn_callback);
    //}

    /**
     *
     * @param msgType
     * @param guestUID
     * @param msgContent
     * @param fn_callback
     * @param fingerPrint {String} 被发消息的指纹码，为空时将由通信底层自动生成
     * @private
     */
    function _sendGuestMessage(msgType, guestUID, msgContent, fn_callback, fingerPrint){

        var sucess = false;
        var msgBody = null;

        if(!RBChatChattingContentPaneUI.send4IMCheck()){
            //
        }
        else if(!guestUID){
            //alert('消息接收者不能为空！');
            RBChatChattingContentPaneUI.deleteSendMsgRetryQueue(fingerPrint)
            RBChatDialogHelper.showAlertDialog_INFO('友情提示', '消息接收者不能为空！');
        }
        else if(!msgContent){
            //alert('消息内容不能为空！');
            RBChatChattingContentPaneUI.deleteSendMsgRetryQueue(fingerPrint)
            RBChatDialogHelper.showAlertDialog_INFO('友情提示', '消息内容不能为空！');
        }
        else{
            // 消息发送者uid（就是本地用户的uid了）
            var fromUid = IMSDK.getLoginInfo().loginUserId;
            var localAuthedUserInfo = LocalUserInfo.getObj();

            var fromNickname = localAuthedUserInfo.nickname;
            var fromNickname = (fromNickname ? fromNickname : fromUid);
            // 要发送的昨时聊天消息内容，实际上是一个MsgBody4Guest对象
            // （详见：http://docs.52im.net/extend/docs/api/rainbowchatserver4_pro/com/x52im/rainbowchat/im/dto/MsgBody4Guest.html）
            msgBody = _constructGuestChatMsgBody(msgType, fromUid, fromNickname, guestUID, msgContent);
            msgBody.g="";
            msgBody.n = fromNickname
            // 构建建IM协议报文包（即Protocal对象，详见：http://docs.52im.net/extend/docs/api/mobileimsdk/server/net/openmob/mobileimsdk/server/protocal/Protocal.html）
            // var p = createCommonData2(
            //     JSON.stringify(msgBody)  // 协议体内容
            //     , fromUid                // 消息发起者
            //     , '0'                    // 消息中转接收者（因为陌生人消息不允许直发给对方（因为不是好友关系嘛），所以必须由服务端代为转发）
            //     , UserProtocalsType.MT42_OF_TEMP$CHAT$MSG_A$TO$SERVER);
            var p = MBProtocalFactory.createCommonData(
                JSON.stringify(msgBody)  // 协议体内容
                , fromUid                // 消息发起者
                , '0'                    // 消息中转接收者（因为陌生人消息不允许直发给对方（因为不是好友关系嘛），所以必须由服务端代为转发）
                , true
                , fingerPrint
                , UserProtocalsType.MT42_OF_TEMP$CHAT$MSG_A$TO$SERVER);

            // 将消息通过websocket发送出去
            IMSDK.sendData(p);

            sucess = true;
        }

        if(fn_callback){
            fn_callback(sucess, msgBody);
        }
    }

    /**
     * 构造陌生人聊天（临时聊天）消息协议体的 MsgBody4Guest DTO对象.
     * （MsgBody4Guest对象详见：http://docs.52im.net/extend/docs/api/rainbowchatserver4_pro/com/x52im/rainbowchat/im/dto/MsgBody4Guest.html）
     *
     * @param msgType 聊天消息类型
     * @param srcUserUid 发送方的uid
     * @param srcNickName 发送方的昵称
     * @param friendUid 要发送到的用户id
     * @param msg 消息内容，纯文本字串，可能是聊天文字、图片文件名或语音文件名等，但一定不是JSON字串
     * @return
     */
    function _constructGuestChatMsgBody(msgType, srcUserUid, srcNickName , friendUid, msg) {
        // 新的MsgBody4Guest对象
        var headPhoto = LocalUserInfo.getObj().userAvatarFileName && LocalUserInfo.getObj().userAvatarFileName.length > 0? LocalUserInfo.getObj().userAvatarFileName:'';
        var tcmd = {};
        tcmd.cy = ChatModeType.CHAT_TYPE_GUEST$CHAT; // 聊天模式类型：一对一临时聊天(陌生人聊天)
        tcmd.f = srcUserUid;
        tcmd.nickName = srcNickName;
        tcmd.h = headPhoto;
        tcmd.t = friendUid;
        tcmd.m = msg;
        tcmd.ty = msgType;

        return tcmd;
    }
    //*********************************************************************** （2）发出的消息或指令 END


    window.TMessageHelper = {
        parseTempChatMsg_SERVER$TO$B_Message : _parseTempChatMsg_SERVER$TO$B_Message,

        //sendGuestPlainTextMessage : _sendGuestPlainTextMessage,
        //sendGuestImageMessage     : _sendGuestImageMessage,

        sendGuestMessage : _sendGuestMessage
    };

})();



// GMessageHelper 对象
(function () {

    //*********************************************************************** （1）解析接收的消息或指令 START
    /**
     * 解析群聊聊天消息：由服务端转发给接收人B的【步骤2/2】.
     *
     * <p>
     * 当然，此消息被接收到的前提条件是B用户此时是在线的（否则临时聊天消息将服务端被存储到DB中（直到本地用户下次上线））。
     *
     * @param originalMsg
     * @return {*} 返回的是MsgBody4Group对象
     * ，详见：http://docs.52im.net/extend/docs/api/rainbowchatserver4_pro/com/x52im/rainbowchat/im/dto/MsgBody4Group.html
     */
    function _parseGroupChatMsg_SERVER$TO$B_Message(originalMsg)
    {
        // console.info("!!!!!!收到服务端发过来的群聊聊天信息：" + originalMsg);
        return JSON.parse(originalMsg);// MsgBody4Group对象
    }

    /**
     * 解析群聊系统指令：“我”加群成功后通知“我”（即被加群者）（由Server发出），
     * 通知接收人可能是在创建群或群建好后邀请进入的.
     *
     * @param originalMsg
     * @return {*} 返回的是CMDBody4MyselfBeInvitedGroupResponse对象
     * ，详见：http://docs.52im.net/extend/docs/api/rainbowchatserver4_pro/com/x52im/rainbowchat/im/dto/CMDBody4MyselfBeInvitedGroupResponse.html
     */
    function _parseResponse4GroupSysCMD4MyselfBeInvited(originalMsg)
    {
        // console.info("!!!!!!收到服务端发过来的群聊指令be_invited：" + originalMsg);
        return JSON.parse(originalMsg);// CMDBody4MyselfBeInvitedGroupResponse对象
    }

    /**
     * 解析群聊系统指令：群聊时，向所有(除修改者)的群员通知群名被修改的通知协议内容（由Server发出），
     * 通知接收人可能是在创建群或群建好后邀请进入的.
     *
     * @param originalMsg
     * @return 返回的是CMDBody4GroupNameChangedNotification对象
     * ，详见：http://docs.52im.net/extend/docs/api/rainbowchatserver4_pro/com/x52im/rainbowchat/im/dto/CMDBody4GroupNameChangedNotification.html
     */
    function  _parseResponse4GroupSysCMD4GroupNameChanged(originalMsg)
    {
        // console.info("!!!!!!收到服务端发过来的群聊指令gname_changed：" + originalMsg);
        return JSON.parse(originalMsg);// CMDBody4GroupNameChangedNotification对象
    }
    //*********************************************************************** （1）解析接收的消息或指令 END


    //*********************************************************************** （2）发出的消息或指令 START

    /**
     *
     * @param msgType
     * @param toGid
     * @param msgContent
     * @param fn_callback
     * @param fingerPrint {String} 被发消息的指纹码，为空时将由通信底层自动生成
     * @private
     */
    function _sendGroupMessage(msgType, toGid, msgContent, fn_callback, fingerPrint,isGroupSend= false, isAutoSendRed, sendUser){

        var sucess = false;
        var msgBody = null;

        // 当前群组基本信息封装对象GroupEntity（
        // 详见：http://docs.52im.net/extend/docs/api/rainbowchatserver4_pro/com/x52im/rainbowchat/http/logic/dto/GroupEntity.html）
        var currentChattingGe = GroupsProvider.getGroupInfoByGid(toGid);

        if(!isAutoSendRed && !RBChatChattingContentPaneUI.send4IMCheck()){
            //
        }
        else if(!toGid){
            //alert('消息接收者不能为空！');
            RBChatChattingContentPaneUI.deleteSendMsgRetryQueue(fingerPrint)
            RBChatDialogHelper.showAlertDialog_INFO('友情提示', '要发送到的群组不能为空！');
        }
        else if(!msgContent){
            //alert('消息内容不能为空！');
            RBChatChattingContentPaneUI.deleteSendMsgRetryQueue(fingerPrint)
            RBChatDialogHelper.showAlertDialog_INFO('友情提示', '消息内容不能为空！');
        }
        else if(!currentChattingGe){
            RBChatChattingContentPaneUI.deleteSendMsgRetryQueue(fingerPrint)
            RBChatDialogHelper.showAlertDialog_WARN('友情提示', '您已不在该群组中，无法发送消息哦！');
        }
        else{
            // 消息发送者uid（就是本地用户的uid了）
            var fromUid = IMSDK.getLoginInfo().loginUserId;
            var localAuthedUserInfo = LocalUserInfo.getObj();

            var fromNickname = localAuthedUserInfo.nickname;
            var fromNickname = (fromNickname ? fromNickname : fromUid);

            // 要发送的昨时聊天消息内容，实际上是一个MsgBody4Group对象
            // （详见：http://docs.52im.net/extend/docs/api/rainbowchatserver4_pro/com/x52im/rainbowchat/im/dto/MsgBody4Group.html）
            msgBody = _constructGroupChatMsgBody(msgType, fromUid, fromNickname, toGid, msgContent, fingerPrint);
            msgBody.g= currentChattingGe.g_name;
            msgBody.n = msgBody.nickName;
            // 构建建IM协议报文包（即Protocal对象，详见：http://docs.52im.net/extend/docs/api/mobileimsdk/server/net/openmob/mobileimsdk/server/protocal/Protocal.html）
            var p = MBProtocalFactory.createCommonData(
                JSON.stringify(msgBody)  // 协议体内容
                , fromUid                // 消息发起者
                , '0'         // 消息中转接收者（因群聊消息为扩散写逻辑，所以必须由服务端代为转发）
                , true
                , fingerPrint
                , UserProtocalsType.MT44_OF_GROUP$CHAT$MSG_A$TO$SERVER);
            if(isGroupSend){
                p.all="1";
            }
            // 将消息通过websocket发送出去
            IMSDK.sendData(p);

            sucess = true;
        }

        if(fn_callback){
            fn_callback(sucess, msgBody, currentChattingGe);
        }
    }

    /**
     * 构造群组聊天消息协议体的 MsgBody4Group DTO对象.
     * （MsgBody4Group对象详见：http://docs.52im.net/extend/docs/api/rainbowchatserver4_pro/com/x52im/rainbowchat/im/dto/MsgBody4Group.html）
     *
     * @param msgType 聊天消息类型
     * @param srcUserUid 发送方的uid
     * @param srcNickName 发送方的昵称
     * @param toGid 要发送到的群id
     * @param msg 消息内容，纯文本字串，可能是聊天文字、图片文件名或语音文件名等，但一定不是JSON字串
     * @param parentFp {String} 群聊消息扩散写前原始消息的指纹码。此指纹码目前主要用于消息“撤回”功能时。且仅对由“人”发起的正常聊天消息有意义，对{@link MsgType.TYPE_SYSTEAM_INFO}类型的消息无意义。
     * @return 返回MsgBody4Group对象，详见：http://docs.52im.net/extend/docs/api/rainbowchatserver4_pro/com/x52im/rainbowchat/im/dto/MsgBody4Group.html
     */
    function _constructGroupChatMsgBody(msgType, srcUserUid, srcNickName , toGid, msg, parentFp)
    {
        var headPhoto = LocalUserInfo.getObj().userAvatarFileName && LocalUserInfo.getObj().userAvatarFileName.length > 0? LocalUserInfo.getObj().userAvatarFileName:'';
        // 新的MsgBody4Group对象
        var tcmd = {};
        tcmd.cy = ChatModeType.CHAT_TYPE_GROUP$CHAT; // 聊天模式类型：群组聊天
        tcmd.f = srcUserUid;
        tcmd.h = headPhoto;
        tcmd.nickName = srcNickName;
        tcmd.t = toGid;
        tcmd.m = msg;
        tcmd.ty = msgType;
        tcmd.parentFp = parentFp;
        return tcmd;
    }

    /**
     * 构造世界频道/普通群聊系统通知(消息)协议体的DTO对象.
     *
     * @msgType 聊天消息类型
     * @param toGid 要发送到的群id
     * @param msg 消息内容，纯文本字串，可能是聊天文字、图片文件名或语音文件名等，但一定不是JSON字串
     * @return 返回MsgBody4Group对象，详见：http://docs.52im.net/extend/docs/api/rainbowchatserver4_pro/com/x52im/rainbowchat/im/dto/MsgBody4Group.html
     */
    function _constructGroupSystenMsgBody(toGid, msg)
    {
        return _constructGroupChatMsgBody(
            MsgType.TYPE_SYSTEAM$INFO
            // 此值一定是"0"，因为是服务端发给客户端的嘛
            , "0"
            // 服务端发送的系统级消息，没昵称
            , ""
            , toGid
            , msg
            , null);
    }

    //*********************************************************************** （2）发出的消息或指令 END


    window.GMessageHelper = {
        parseGroupChatMsg_SERVER$TO$B_Message      : _parseGroupChatMsg_SERVER$TO$B_Message,
        parseResponse4GroupSysCMD4MyselfBeInvited  : _parseResponse4GroupSysCMD4MyselfBeInvited,
        parseResponse4GroupSysCMD4GroupNameChanged : _parseResponse4GroupSysCMD4GroupNameChanged,
        sendGroupMessage                           : _sendGroupMessage,
        constructGroupSystenMsgBody                : _constructGroupSystenMsgBody
    };
})();



// GChatDataHelper 对象
// 群聊天的UI相关显示数据操作实用类.
(function () {

    /**
     * 添加一条通用群聊系统通知到聊天数据结构中，并在UI上显示出来.
     *
     * @param context
     * @param systemInfo
     * @param showNotification
     */
    function _addSystemInfoData(gid, gname, systemInfo, time) {
        // 将该条系统通知加入到聊天消息中
        var msgBody = GMessageHelper.constructGroupSystenMsgBody(gid, systemInfo);
        // 首页“消息”上的item数据
        var alarmMessageDTO = AlarmsProvider.createAGroupChatMsgAlarm(msgBody.ty, msgBody.m, gname, gid, msgBody.nickName, time);
        // 聊天内容数据
        var chatMsgEntity = ChatMsgEntity.prepareRecievedMessage(msgBody.f, msgBody.nickName, msgBody.m, time, msgBody.ty, null);
        // 将数据放入并在UI上显示
        RBChatMainUI.processRecivedMessage(true, true, alarmMessageDTO, chatMsgEntity);
    }

    /**
     * 往聊天界面中显示一条被"我"邀请入群成功的系统通知给"自已"看（此通知并非服务器发出，而是本地准备好的，仅用UI显示）。
     *
     * @param beInvitedMembers ArrayList<GroupMemberEntity>
     * @param gid
     * @param gname
     */
    function _addSystenInfo_inviteMembersSucessForLocalUser(beInvitedMembers, gid, gname) {
        var size = beInvitedMembers.length;
        if(beInvitedMembers && size > 0) {
            var beInvitedNames = null;
            if (size > 1)
                beInvitedNames = "\""+beInvitedMembers[0].nickname + " 等\" " + size + "人";
            else
                beInvitedNames = "\""+beInvitedMembers[0].nickname+"\"";

            var hint = "你邀请" + beInvitedNames + "加入了群聊";
            _addSystemInfoData(gid, gname, hint, 0);
        }
    }

    /**
     * 往聊天界面中显示一条被"我"(我就是群主自已了，不然哪有移除权限)删除群员成功的系统通知给"自已"看（此
     * 通知并非服务器发出，而是本地准备好的，仅用UI显示）。
     *
     * @param beRemovedMembers ArrayList<GroupMemberEntity>
     * @param gid
     * @param gname
     */
    function _addSystenInfo_removeMembersSucessForLocalUser(beRemovedMembers, gid, gname) {
        var size = beRemovedMembers.length;
        if(beRemovedMembers  && size > 0) {
            var beInvitedNames = null;
            if (size > 1)
                beInvitedNames = "\""+beRemovedMembers[0].nickname + " 等\" " + size + "人";
            else
                beInvitedNames = "\""+beRemovedMembers[0].nickname+"\"";

            var hint = "你将" + beInvitedNames + "移出了本群";
            _addSystemInfoData(gid, gname, hint, 0);
        }
    }

    /**
     * 往聊天界面中显示一条被"我"(我就是群主自已了，不然哪有转让权限)转让群主权限成功的系统通知给"自已"看（此
     * 通知并非服务器发出，而是本地准备好的，仅用UI显示）。
     *
     * @param beTransferNickname
     * @param gid
     * @param gname
     */
    function _addSystenInfo_transferSucessForLocalUser(beTransferNickname, gid, gname) {
        if(beTransferNickname) {
            var hint = "你已将群主权限转让给\""+beTransferNickname+"\"";
            _addSystemInfoData(gid, gname, hint, 0);
        }
    }

    /**
     * 往聊天界面中显示一条群名被"我"自已修改的系统通知给"自已"看（此通知并非服务器发出，而是本地准备好的，仅用UI显示）。
     *
     * @param context
     * @param gid
     * @param newGroupname
     */
    function _addSystemInfo_groupNameChangedForLocalUser(gid, newGroupname)
    {
        var hint = "你已将群名修改为\""+newGroupname+"\"";
        _addSystemInfoData(gid, newGroupname, hint, 0);
    }

    /**
    * 创建群发消息模版
    *
    * @param info
    * @param msgType
    */
    function addSystemInfo_groupSendForLocalUser(info, content, msgType, id) {
        const fromUid = IMSDK.getLoginInfo().loginUserId
        const obj = {
            cy: 0,
            f: fromUid,
            h: LocalUserInfo.getObj().userAvatarFileName && LocalUserInfo.getObj().userAvatarFileName.length > 0? LocalUserInfo.getObj().userAvatarFileName:'',
            t: JSON.stringify(info),
            m: content,
            ty: msgType
        }
        obj.g = "";
        obj.n = LocalUserInfo.getObj().nickname;
        var p = MBProtocalFactory.createCommonData(JSON.stringify(obj), fromUid, `groupSend_${id}`, true, 'groupSend', 3);
       
        return p
    }


    window.GChatDataHelper = {
        addSystenInfo_inviteMembersSucessForLocalUser : _addSystenInfo_inviteMembersSucessForLocalUser,
        addSystenInfo_removeMembersSucessForLocalUser : _addSystenInfo_removeMembersSucessForLocalUser,
        addSystenInfo_transferSucessForLocalUser      : _addSystenInfo_transferSucessForLocalUser,
        addSystemInfo_groupNameChangedForLocalUser   : _addSystemInfo_groupNameChangedForLocalUser,
        addSystemInfo_groupSendForLocalUser
    };
})();




