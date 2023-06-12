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
 * 聊天模式类型常量对象定义，请勿修改各常量值！
 * 详见：http://docs.52im.net/extend/docs/api/rainbowchatserver4_pro/com/x52im/rainbowchat/im/dto/MsgBodyRoot.html
 */
var chatModeType = {
    /** 聊天模式类型：一对一好友聊天 */
    CHAT_TYPE_FRIEND$CHAT : 0,
    /** 聊天模式类型：一对一临时聊天(陌生人聊天) */
    CHAT_TYPE_GUEST$CHAT : 1,
    /** 聊天模式类型：普通群聊或世界频道（当groupid=-1时就是世界频道聊天） */
    CHAT_TYPE_GROUP$CHAT  : 2
};


/**
 * RainbowChat中的IM协议类型常量对象定义，请勿修改各常量值！
 * （补充：本文件与前端代码rbchat_config.js中的UserProtocalsType对象内容定义是一致的）
 *
 * 参见：http://docs.52im.net/extend/docs/api/rainbowchatserver4_pro/com/x52im/rainbowchat/common/dto/cnst/UserProtocalsType.html
 */
var userProtocalsType = {
    /** 上线通知报文头 */
    MT01_OF_ONLINE_NOTIVICATION: 1,
    /** 下线通知报文头 */
    MT02_OF_OFFLINE_NOTIVICATION: 2,

    /** 普通一对一聊天消息的报文头（聊天消息可能是：文本、图片、语音留言、礼物等）
     * @see {@link com.x52im.rainbowchat.im.dto.MsgBody4Friend} */
    MT03_OF_CHATTING_MESSAGE: 3,

    /** 客户端发出的用户加好友请求报文头（由添加好友请求的发起人发出） */
    MT05_OF_ADD_FRIEND_REQUEST_A$TO$SERVER: 5,
    /** 由服务端反馈给加好友发起人的错误信息头(出错的可能是：该好友已经存在于我的好友列表中、插入好友请求到db中时出错等) */
    MT06_OF_ADD_FRIEND_REQUEST_RESPONSE$FOR$ERROR_SERVER$TO$A: 6,
    /** 由服务端转发的加好友请求消息给在线目标用户（离线用户是不需要的哦） */
    MT07_OF_ADD_FRIEND_REQUEST_INFO_SERVER$TO$B: 7,
    /** 被添加者【同意】加好友请求的消息头（由B发给服务端） */
    MT08_OF_PROCESS_ADD$FRIEND$REQ_B$TO$SERVER_AGREE: 8,
    /** 被添加者【拒绝】加好友请求的消息头（由B发给服务端） */
    MT09_OF_PROCESS_ADD$FRIEND$REQ_B$TO$SERVER_REJECT: 9,
    /**
     * 将【拒绝】的加好友结果传回给原请求用户的消息头（由服务端发回给A），此消息发送的
     * 前提条件是A必须此时必须在线，否则将不会实时发送给客户端 */
    MT12_OF_PROCESS_ADD$FRIEND$REQ_SERVER$TO$A_REJECT_RESULT: 12,
    /**
     * 新好友已成功被添加信息头（此场景是被请求用户同意了加好友的请求时，由服务端把双
     * 方的好友信息及时交给对方（如果双方有人在线的话）） */
    MT10_OF_PROCESS_ADD$FRIEND$REQ_FRIEND$INFO$SERVER$TO$CLIENT: 10,
    /**
     * 由服务端反馈给B处理（包括同意和拒绝两种情况下）加好友请求处理时的错误信
     * 息头(出错的可能是：B在提交同意A的加好友请求时出错了等) */
    MT11_OF_PROCESS_ADD$FRIEND$REQ_RESPONSE$FOR$ERROR_SERVER$TO$B: 11,

    /** 视频聊天进行中：结束本次音视频聊天 */
    MT14_OF_VIDEO$VOICE_END$CHATTING: 14,
    /** 视频聊天进行中：切换到纯音频聊天模式 */
    MT15_OF_VIDEO$VOICE_SWITCH$TO$VOICE$ONLY: 15,
    /** 视频聊天进行中：切换回音视频聊天模式 */
    MT16_OF_VIDEO$VOICE_SWITCH$TO$VOICE$AND$VIDEO: 16,

    /** 视频聊天呼叫中：请求视频聊天(发起方A) */
    MT17_OF_VIDEO$VOICE$REQUEST_REQUESTING$FROM$A: 17,
    /** 视频聊天呼叫中：取消视频聊天请求(发起发A) */
    MT18_OF_VIDEO$VOICE$REQUEST_ABRORT$FROM$A: 18,
    /** 视频聊天呼叫中：同意视频聊天请求(接收方B) */
    MT19_OF_VIDEO$VOICE$REQUEST_ACCEPT$TO$A: 19,
    /** 视频聊天呼叫中：拒绝视频聊天请求(接收方B) */
    MT20_OF_VIDEO$VOICE$REQUEST_REJECT$TO$A: 20,

    /** 实时语音聊天呼叫中：请求实时语音聊天(发起方A) */
    MT31_OF_REAL$TIME$VOICE$REQUEST_REQUESTING$FROM$A: 31,
    /** 实时语音聊天呼叫中：取消实时语音聊天请求(发起发A) */
    MT32_OF_REAL$TIME$VOICE$REQUEST_ABRORT$FROM$A: 32,
    /** 实时语音聊天呼叫中：同意实时语音聊天请求(接收方B) */
    MT33_OF_REAL$TIME$VOICE$REQUEST_ACCEPT$TO$A: 33,
    /** 实时语音聊天呼叫中：拒绝实时语音聊天请求(接收方B) */
    MT34_OF_REAL$TIME$VOICE$REQUEST_REJECT$TO$A: 34,

    /** 实时语音聊天进行中：结束本次实时语音聊天 */
    MT35_OF_REAL$TIME$VOICE_END$CHATTING: 35,


    /** 临时聊天消息：由发送人A发给服务端【步骤1/2】 */
    MT42_OF_TEMP$CHAT$MSG_A$TO$SERVER: 42,
    /** 临时聊天消息：由服务端转发给接收人B的【步骤2/2】 */
    MT43_OF_TEMP$CHAT$MSG_SERVER$TO$B: 43,

    /** 群聊/世界频道聊天消息：由发送人A发给服务端【步骤1/2】 */
    MT44_OF_GROUP$CHAT$MSG_A$TO$SERVER: 44,
    /** 群聊/世界频道聊天消息：由服务端转发给所有在线接收人B的【步骤2/2】 */
    MT45_OF_GROUP$CHAT$MSG_SERVER$TO$B: 45,

    /** 群聊系统指令：加群(建群或被邀请时)成功后通知被加群者（由Server发出，所有被加群者接收） */
    MT46_OF_GROUP$SYSCMD_MYSELF$BE$INVITE_FROM$SERVER: 46,
    /** 群聊系统指令：通用的系统信息给指定群员（由Server发出，指定群员接收） */
    MT47_OF_GROUP$SYSCMD_COMMON$INFO_FROM$SERVER: 47,
    /** 群聊系统指令：群已被解散（由Server发出，除解散者外的所有人接收） */
    MT48_OF_GROUP$SYSCMD_DISMISSED_FROM$SERVER: 48,
    /** 群聊系统指令："你"被踢出群聊（由Server发出，被踢者接收） */
    MT49_OF_GROUP$SYSCMD_YOU$BE$KICKOUT_FROM$SERVER: 49,
    /** 群聊系统指令："别人"主动退出或被群主踢出群聊（由Server发出，其它群员接收） */
    MT50_OF_GROUP$SYSCMD_SOMEONEB$REMOVED_FROM$SERVER: 50,
    /** 群聊系统指令：群名被修改的系统通知（由Server发出，所有除修改者外的群员接收） */
    MT51_OF_GROUP$SYSCMD_GROUP$NAME$CHANGED_FROM$SERVER: 51
};


exports.ChatModeType = chatModeType;
exports.UserProtocalsType = userProtocalsType;