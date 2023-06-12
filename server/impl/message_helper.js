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
 * 服务端主动发出的或收到的消息处理辅助类（即消息发送模式为C2S或S2C的情况）.
 *
 * @author Jack Jiang
 * @version 1.0
 */

//var UserProtocalsType = require('./user_protocals_type');
// RainbowChat-Web服务端的常量表实例
var constant = require('../conf/constant');
var ProtocalFactory = require('mobileimsdk_web_server/j_core/protocal-factory');



//------------------------------------------------------------------------------- 临时聊天消息处理相关S
/**
 * 临时聊天消息：由服务端转发给接收人B的【步骤2/2】.
 *
 * <p>当然，此消息被发送的前提条件是B用户此时是在线的（否则临时聊天消息将被存储到DB中）。
 *
 * @param imServerSDKInstance www.js中的imServerSDK对象实例引用
 * @param to_user_id 要发送到的目标客户user_id
 * @param tempChatMsgDTO 要发送的消息体，即MsgBody4Guest对象，详见：http://docs.52im.net/extend/docs/api/rainbowchatserver4_pro/com/x52im/rainbowchat/im/dto/MsgBody4Guest.html
 //* @param callback_offlineProcess 当消息没有实时送出或者桥接发出时，可以通过本回调进行离线处理
 * @param fingerPrint 当本参数为null时，将自动生成消息指纹码，否则使用参数指定的指纹码
 */
    // 此消息由服务端主动发起，所以from_user_id==0
function sendTempChatMsg_SERVER$TO$B_Message(imServerSDKInstance, to_user_id, tempChatMsgDTO, fingerPrint)
{
    var tempChatMsgDTOStr = JSON.stringify(tempChatMsgDTO);//new Gson().toJson(tempChatMsgDTO);

    // // 由服务端将此指令发送给对应的客服端（所以from='0'、to=to_user_id）
    // var p = ProtocalFactory.createCommonDataU2(
    //      tempChatMsgDTOStr // dataContent的内容
    //     , '0'              // 由服务端发出的嘛，发送者uid当然就为“0”
    //     , to_user_id       // 接收者uid
    //     , constant.UserProtocalsType.MT43_OF_TEMP$CHAT$MSG_SERVER$TO$B // 注意：协议类型要跟客户端解析时保持一致哦
    //     , fingerPrint
    // );

    var p = ProtocalFactory.createCommonData(
        tempChatMsgDTOStr // dataContent的内容
        , '0'              // 由服务端发出的嘛，发送者uid当然就为“0”
        , to_user_id       // 接收者uid
        , true
        , fingerPrint
        , constant.UserProtocalsType.MT43_OF_TEMP$CHAT$MSG_SERVER$TO$B // 注意：协议类型要跟客户端解析时保持一致哦
    );

    imServerSDKInstance.publicSendDataGlobal(p
        // 离线回调传null，本方法的内部实现将自动调用MobileIMSDK-Web框架的默认回调callBack_processC2COfflineMessage
        , null//callback_offlineProcess
    );

    //return ok;
}

/**
 * 解析临时聊天消息：由发送人A发给服务端【步骤1/2】.
 *
 * @param originalMsg
 * @return 客户端A发过来的临时聊天消息：由发送人A发给服务端【步骤1/2】元数据封装对象MsgBody4Guest，
 * MsgBody4Guest对应字段详见：http://docs.52im.net/extend/docs/api/rainbowchatserver4_pro/com/x52im/rainbowchat/im/dto/MsgBody4Guest.html
 */
function pareseTempChatMsg_A$TO$SERVER_Message(originalMsg) {
    // 解析出元数据（即客户端A发过来的MsgBody4Guest对象）
    return JSON.parse(originalMsg);
}
//------------------------------------------------------------------------------- 临时聊天消息处理相关 E


//------------------------------------------------------------------------------- 群组聊天消息处理相关S
/**
 * 群聊/世界频道聊天消息：由服务端转发给接收人B的【步骤2/2】.
 *
 * <p>当然，此消息被发送的前提条件是B用户此时是在线的（否则BBS聊天消息将不会被发送给此人哦（会自动丢弃））。
 *
 * @param to_user_id 要发送到的目标客户user_id
 * @param groupChatMsgDTO 群组聊天消息body封装MsgBody4Group，
 * MsgBody4Group对应字段详见：http://docs.52im.net/extend/docs/api/rainbowchatserver4_pro/com/x52im/rainbowchat/im/dto/MsgBody4Group.html
 * @return
 */
    // 此消息由服务端主动发起，所以from_user_id==0，但此参数目前对于接收方而言没有用处，以后可能会用上
function sendGroupChatMsg_SERVER$TO$B_Message(imServerSDKInstance, to_user_id, groupChatMsgDTO,fps=null)
{
    var groupChatMsgDTOStr = JSON.stringify(groupChatMsgDTO);

    // // 由服务端将此指令发送给对应的客服端（所以from='0'、to=to_user_id）
    // var p = ProtocalFactory.createCommonDataU(
    //     groupChatMsgDTOStr // dataContent的内容
    //     , '0'              // 由服务端发出的嘛，发送者uid当然就为“0”
    //     , to_user_id       // 接收者uid
    //     , constant.UserProtocalsType.MT45_OF_GROUP$CHAT$MSG_SERVER$TO$B // 注意：协议类型要跟客户端解析时保持一致哦
    // );

    // 由服务端将此指令发送给对应的客服端（所以from='0'、to=to_user_id）
    var p = ProtocalFactory.createCommonData(
        groupChatMsgDTOStr // dataContent的内容
        , '0'              // 由服务端发出的嘛，发送者uid当然就为“0”
        , to_user_id       // 接收者uid
        , true
        , fps ? fps: null
        , constant.UserProtocalsType.MT45_OF_GROUP$CHAT$MSG_SERVER$TO$B // 注意：协议类型要跟客户端解析时保持一致哦
    );

    imServerSDKInstance.publicSendDataGlobal(p
        // 离线回调传null，本方法的内部实现将自动调用MobileIMSDK-Web框架的默认回调callBack_processC2COfflineMessage
        , null//callback_offlineProcess
    );

    //return p;
}

/**
 * 解析群聊/世界频道聊天消息：由发送人A发给服务端【步骤1/2】.
 *
 * @param originalMsg
 * @return 客户端A发过来的群组聊天消息：由发送人A发给服务端【步骤1/2】元数据封装对象MsgBody4Group，
 * MsgBody4Group对应字段详见：http://docs.52im.net/extend/docs/api/rainbowchatserver4_pro/com/x52im/rainbowchat/im/dto/MsgBody4Group.html
 */
function pareseGroupChatMsg_A$TO$SERVER_Message(originalMsg) {
    // 解析元数据（即客户端A发过来的MsgBody4Group对象）
    return JSON.parse(originalMsg);
}

//------------------------------------------------------------------------------- 群组聊天消息处理相关S


exports.sendTempChatMsg_SERVER$TO$B_Message   = sendTempChatMsg_SERVER$TO$B_Message;
exports.pareseTempChatMsg_A$TO$SERVER_Message = pareseTempChatMsg_A$TO$SERVER_Message;
exports.sendGroupChatMsg_SERVER$TO$B_Message   = sendGroupChatMsg_SERVER$TO$B_Message;
exports.pareseGroupChatMsg_A$TO$SERVER_Message = pareseGroupChatMsg_A$TO$SERVER_Message;