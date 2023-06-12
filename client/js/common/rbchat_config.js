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
// ﻿'use strict';

/**
 * Created by Jack Jiang.
 *
 * RainbowChat-Web的基本配置常量表。
 */

(function () {

    var _PRODUCT_VER_CODE = 1;
    var _PRODUCT_VER_NAME = '4.1_b220805_pro';
    var _PRODUCT_NAME = 'RainbowChat-Web 网页端产品';

    /* http服务根URL (注意：结尾不带反斜线！) */
    var _HTTP_SERVER_ROOT_URL = "https://"+document.domain;
    /* 实时通信websocket服务器地址 */
    var _IM_SERVER_URL = "https://"+document.domain;                        // TODO: 【2】开发者请修改为您自已的 web im 服务端地址（即nodejs服务地址）

    // 文件地址
    var  _FILE_HTTPS_URL = 'https://oss.nongzhiw.cn'

    /* http rest接口调用服务URL */
    var _HTTP_REST_URL = _HTTP_SERVER_ROOT_URL+"/rest_get";
    /* Web版IM静态资源（图片、表情、swf等）服务器地址 */
    var _IM_STATIC_SERVER_ROOT_URL = _IM_SERVER_URL + "/";
    /** 用户头像下载的独立http接口地址 */
    var _AVATAR_DOWNLOAD_CONTROLLER_URL_ROOT = _HTTP_SERVER_ROOT_URL+"/UserAvatarDownloader";
    /** 用户2进制数据下载的独立http接口地址 */
    var _BBONERAY_DOWNLOAD_CONTROLLER_URL_ROOT = _HTTP_SERVER_ROOT_URL+"/BinaryDownloader";
    /** Web端文件上传的独立http接口地址 */
    var _WEB_FILE_UPLOAD_CONTROLLER_URL_ROOT = _HTTP_SERVER_ROOT_URL+"/FileUploader4Web";
    /** 用户大文件下载的独立http接口地址 */
    var _BIG_FILE_DOWNLOADER_CONTROLLER_URL_ROOT = _HTTP_SERVER_ROOT_URL+"/BigFileDownloader";
    /** 用户短视频消息的视频文件下载的独立http接口地址 */
    var _SHORTVIDEO_DOWNLOADER_CONTROLLER_URL_ROOT = _HTTP_SERVER_ROOT_URL+"/ShortVideoDownloader";
    /** 用户短视频消息的视频首帧预览图片文件下载的独立http接口地址 */
    var _SHORTVIDEO_THUMB_DOWNLOADER_CONTROLLER_URL_ROOT = _HTTP_SERVER_ROOT_URL+"/ShortVideoThumbDownloader";

    /** 加载的聊天记录天数（默认加载15天内的聊天记录，即“现在”开始前推15天的聊天记录） */
    var _CHATTING_HISTORY_LOAD_TIME_INTERVAL = 15;
    /**
     * 聊天默认加载条数
     */
    var _LOAD_CHAT_RECORDER_COUNTS = 50;
    /** 消息可被撤回的最大时限（单位：分钟），默认值是2。 */
    var _CHATTING_MESSAGE_CAN_BE_REVOKE_TIME  = 10;
    /**
     * 用户发送的大文件消息时，允许的最大文件大小（可以是“KB, MB, or GB”）。
     * 说明: 25M是参考微信的设定，如果必要，可设为你需要的数值（比如100MB或1GB等，就看你服务器多牛了^_^!） */
    var _SEND_FILE_DATA_MAX_LENGTH = '300MB';
    /** 用户发送的图片消息时，允许的最大文件大小（可以是“KB, MB, or GB”）*/
    var _SEND_IMAGE_DATA_MAX_LENGTH = '10MB';
    /** 本地用户上传用户头像时，允许的最大图片文件大小（可以是“KB, MB, or GB”）*/
    var _UPLOAD_AVATAR_IMAGE_DATA_MAX_LENGTH = '10MB';

    /** 高德地图的Web服务key，目前用于“位置”消息时的地图相关服务中（key申请见：https://lbs.amap.com/api/webservice/guide/create-project/get-key） */
    var _GAODE_MAP_WEB_STATIC_MAP_KEY  = "4fb238d0544f80f40fb3cd057d268a5f"; // TODO: 【3】开发者请修改为您自已的高德地图web服务key


    // 基本配置常量
    var config = {
        FILE_HTTPS_URL                                 : _FILE_HTTPS_URL,
        HTTP_SERVER_ROOT_URL                            : _HTTP_SERVER_ROOT_URL,
        IM_SERVER_URL                                   : _IM_SERVER_URL,
        HTTP_REST_URL                                   : _HTTP_REST_URL,
        IM_STATIC_SERVER_ROOT_URL                       : _IM_STATIC_SERVER_ROOT_URL,

        WEB_FILE_UPLOAD_CONTROLLER_URL_ROOT             : _WEB_FILE_UPLOAD_CONTROLLER_URL_ROOT,

        AVATAR_DOWNLOAD_CONTROLLER_URL_ROOT             : _AVATAR_DOWNLOAD_CONTROLLER_URL_ROOT,
        BBONERAY_DOWNLOAD_CONTROLLER_URL_ROOT           : _BBONERAY_DOWNLOAD_CONTROLLER_URL_ROOT,
        BIG_FILE_DOWNLOADER_CONTROLLER_URL_ROOT         : _BIG_FILE_DOWNLOADER_CONTROLLER_URL_ROOT,
        SHORTVIDEO_DOWNLOADER_CONTROLLER_URL_ROOT       : _SHORTVIDEO_DOWNLOADER_CONTROLLER_URL_ROOT,
        SHORTVIDEO_THUMB_DOWNLOADER_CONTROLLER_URL_ROOT : _SHORTVIDEO_THUMB_DOWNLOADER_CONTROLLER_URL_ROOT,
        GAODE_MAP_WEB_STATIC_MAP_KEY                    : _GAODE_MAP_WEB_STATIC_MAP_KEY,

        CHATTING_HISTORY_LOAD_TIME_INTERVAL             : _CHATTING_HISTORY_LOAD_TIME_INTERVAL,
        LOAD_CHAT_RECORDER_COUNTS                      : _LOAD_CHAT_RECORDER_COUNTS,
        CHATTING_MESSAGE_CAN_BE_REVOKE_TIME             : _CHATTING_MESSAGE_CAN_BE_REVOKE_TIME,

        SEND_FILE_DATA_MAX_LENGTH                       : _SEND_FILE_DATA_MAX_LENGTH,
        SEND_IMAGE_DATA_MAX_LENGTH                      : _SEND_IMAGE_DATA_MAX_LENGTH,
        UPLOAD_AVATAR_IMAGE_DATA_MAX_LENGTH             : _UPLOAD_AVATAR_IMAGE_DATA_MAX_LENGTH
    };

    // console.info('HTTP_SERVER_ROOT_URL='+config.HTTP_SERVER_ROOT_URL);
    // console.info('HTTP_REST_URL='+config.HTTP_REST_URL);

    // 用于http rest接口的Processor ID常量，请务必与http rest服务
    // 端的MyProcessorConst.java保持一致！
    var MyProcessorConst = {
        /** 退出登陆 */
        PROCESSSOR_LOGOUT       : -2,
        /** 业务逻辑功能处理器id */
        PROCESSOR_LOGIC         :  1008,
        /** 用户上传2进制数据（包括图片、语音留言等）的processor_id常量 */
        PROCESSOR_UPLOAD_BINARY : 1011,
        /** HTTP登陆认证请求处理器id（本接口Android、iOS等客户端均使用） */
        PROCESSOR_LOGIN_4ALL    : 1013,
        /** 群组聊天相关http请求的处理器id */
        PROCESSOR_GROUP_CHAT    : 1016,
        /**短信发送 */
        PROCESSOR_CMD_SEND     :  1101
    };

    // 用于http rest接口的Job Dispatch ID常量，请务必与http rest服务端
    // 的com.x52im.rainbowchat.http.logic.dto.JobDispatchConst.java保持一致！
    var JobDispatchConst = {
        /** 注册相关的作业调度id */
        LOGIC_REGISTER                    : 1,
        /** 好友列表管理的作业调度id */
        LOGIC_ROSTER                      : 2,
        /** 好友关系管理的作业调度id */
        LOGIC_SNS                         : 3,
        /** 消息相关的作业调度id */
        LOGIC_MESSAGES                    : 4,
        /** 删除好友的作业调度id */
        LOGIC_DELETE$FRIEND               : 5,

        /** 个人相册、个人介绍语音留言等的管理的作业调度id */
        LOGIC_MGR$PROFILE                 : 10,

        /** 服务端对外提供的文件信息查询等接口的调度id. */
        LOGIC_FILE_MGR                    : 23,
        /** 服务端对外提供的群组基本管理接口的调度id. */
        LOGIC_GROUP_BASE_MGR              : 24,
        /** 服务端对外提供的群组相关信息查询接口的调度id. */
        LOGIC_GROUP_QUERY_MGR             : 25,

        /**
         * 服务端对外提供的通用信息查询接口的调度id.
         * @since 4.5
         */
        LOGIC_COMMON_QUERY_MGR            : 26
    };

    // 用于http rest接口的Action ID常量，请务必与http rest服务端
    // 的com.eva.framework.dto.SysActionConst.java保持一致！
    var SysActionConst = {
        /** 新增 */
        ACTION_NEW      : 0,
        /** 编辑 */
        ACTION_EDIT     : 1,
        /** 删除 */
        ACTION_REMOVE   : 2,
        /** 附加 */
        ACTION_APPEND1  : 7,
        ACTION_APPEND2  : 8,
        ACTION_APPEND3  : 9,
        ACTION_APPEND4  : 22,
        ACTION_APPEND5  : 23,
        ACTION_APPEND6  : 24,
        ACTION_APPEND7  : 25,
        ACTION_APPEND8  : 26,
        ACTION_APPEND9  : 27,
        ACTION_APPEND10 : 28,
        ACTION_APPEND11 : 29,
        ACTION_APPEND12 : 30
    };

    // RainbowChat中的IM协议类型常量对象定义，请勿修改各常量值！
    // （补充：本常量定义与服务端端代码user_protocals_type.js中的常量定义是一致的）
    // 参见：http://docs.52im.net/extend/docs/api/rainbowchatserver4_pro/com/x52im/rainbowchat/common/dto/cnst/UserProtocalsType.html
    var UserProtocalsType = {
        /** 上线通知报文头 */
        MT01_OF_ONLINE_NOTIVICATION  : 1,
        /** 下线通知报文头 */
        MT02_OF_OFFLINE_NOTIVICATION : 2,

        /** 普通一对一聊天消息的报文头（聊天消息可能是：文本、图片、语音留言、礼物等）
         * @see {@link com.x52im.rainbowchat.im.dto.MsgBody4Friend} */
        MT03_OF_CHATTING_MESSAGE     : 3,

        /** 客户端发出的用户加好友请求报文头（由添加好友请求的发起人发出） */
        MT05_OF_ADD_FRIEND_REQUEST_A$TO$SERVER                        : 5,
        /** 由服务端反馈给加好友发起人的错误信息头(出错的可能是：该好友已经存在于我的好友列表中、插入好友请求到db中时出错等) */
        MT06_OF_ADD_FRIEND_REQUEST_RESPONSE$FOR$ERROR_SERVER$TO$A     : 6,
        /** 由服务端转发的加好友请求消息给在线目标用户（离线用户是不需要的哦） */
        MT07_OF_ADD_FRIEND_REQUEST_INFO_SERVER$TO$B                   : 7,
        /** 被添加者【同意】加好友请求的消息头（由B发给服务端） */
        MT08_OF_PROCESS_ADD$FRIEND$REQ_B$TO$SERVER_AGREE              : 8,
        /** 被添加者【拒绝】加好友请求的消息头（由B发给服务端） */
        MT09_OF_PROCESS_ADD$FRIEND$REQ_B$TO$SERVER_REJECT             : 9,
        /**
         * 将【拒绝】的加好友结果传回给原请求用户的消息头（由服务端发回给A），此消息发送的
         * 前提条件是A必须此时必须在线，否则将不会实时发送给客户端 */
        MT12_OF_PROCESS_ADD$FRIEND$REQ_SERVER$TO$A_REJECT_RESULT      : 12,
        /**
         * 新好友已成功被添加信息头（此场景是被请求用户同意了加好友的请求时，由服务端把双
         * 方的好友信息及时交给对方（如果双方有人在线的话）） */
        MT10_OF_PROCESS_ADD$FRIEND$REQ_FRIEND$INFO$SERVER$TO$CLIENT   : 10,
        /**
         * 由服务端反馈给B处理（包括同意和拒绝两种情况下）加好友请求处理时的错误信
         * 息头(出错的可能是：B在提交同意A的加好友请求时出错了等) */
        MT11_OF_PROCESS_ADD$FRIEND$REQ_RESPONSE$FOR$ERROR_SERVER$TO$B : 11,

        /** 视频聊天进行中：结束本次音视频聊天 */
        MT14_OF_VIDEO$VOICE_END$CHATTING                    : 14,
        /** 视频聊天进行中：切换到纯音频聊天模式 */
        MT15_OF_VIDEO$VOICE_SWITCH$TO$VOICE$ONLY            : 15,
        /** 视频聊天进行中：切换回音视频聊天模式 */
        MT16_OF_VIDEO$VOICE_SWITCH$TO$VOICE$AND$VIDEO       : 16,

        /** 视频聊天呼叫中：请求视频聊天(发起方A) */
        MT17_OF_VIDEO$VOICE$REQUEST_REQUESTING$FROM$A       : 17,
        /** 视频聊天呼叫中：取消视频聊天请求(发起发A) */
        MT18_OF_VIDEO$VOICE$REQUEST_ABRORT$FROM$A           : 18,
        /** 视频聊天呼叫中：同意视频聊天请求(接收方B) */
        MT19_OF_VIDEO$VOICE$REQUEST_ACCEPT$TO$A             : 19,
        /** 视频聊天呼叫中：拒绝视频聊天请求(接收方B) */
        MT20_OF_VIDEO$VOICE$REQUEST_REJECT$TO$A             : 20,

        /** 实时语音聊天呼叫中：请求实时语音聊天(发起方A) */
        MT31_OF_REAL$TIME$VOICE$REQUEST_REQUESTING$FROM$A   : 31,
        /** 实时语音聊天呼叫中：取消实时语音聊天请求(发起发A) */
        MT32_OF_REAL$TIME$VOICE$REQUEST_ABRORT$FROM$A       : 32,
        /** 实时语音聊天呼叫中：同意实时语音聊天请求(接收方B) */
        MT33_OF_REAL$TIME$VOICE$REQUEST_ACCEPT$TO$A         : 33,
        /** 实时语音聊天呼叫中：拒绝实时语音聊天请求(接收方B) */
        MT34_OF_REAL$TIME$VOICE$REQUEST_REJECT$TO$A         : 34,

        /** 实时语音聊天进行中：结束本次实时语音聊天 */
        MT35_OF_REAL$TIME$VOICE_END$CHATTING                : 35,

        /** 临时聊天消息：由发送人A发给服务端【步骤1/2】 */
        MT42_OF_TEMP$CHAT$MSG_A$TO$SERVER                   : 42,
        /** 临时聊天消息：由服务端转发给接收人B的【步骤2/2】 */
        MT43_OF_TEMP$CHAT$MSG_SERVER$TO$B                   : 43,

        /** 群聊/世界频道聊天消息：由发送人A发给服务端【步骤1/2】 */
        MT44_OF_GROUP$CHAT$MSG_A$TO$SERVER                  : 44,
        /** 群聊/世界频道聊天消息：由服务端转发给所有在线接收人B的【步骤2/2】 */
        MT45_OF_GROUP$CHAT$MSG_SERVER$TO$B                  : 45,

        /** 群聊系统指令：加群(建群或被邀请时)成功后通知被加群者（由Server发出，所有被加群者接收） */
        MT46_OF_GROUP$SYSCMD_MYSELF$BE$INVITE_FROM$SERVER   : 46,
        /** 群聊系统指令：通用的系统信息给指定群员（由Server发出，指定群员接收） */
        MT47_OF_GROUP$SYSCMD_COMMON$INFO_FROM$SERVER        : 47,
        /** 群聊系统指令：群已被解散（由Server发出，除解散者外的所有人接收） */
        MT48_OF_GROUP$SYSCMD_DISMISSED_FROM$SERVER          : 48,
        /** 群聊系统指令："你"被踢出群聊（由Server发出，被踢者接收） */
        MT49_OF_GROUP$SYSCMD_YOU$BE$KICKOUT_FROM$SERVER     : 49,
        /** 群聊系统指令："别人"主动退出或被群主踢出群聊（由Server发出，其它群员接收） */
        MT50_OF_GROUP$SYSCMD_SOMEONEB$REMOVED_FROM$SERVER   : 50,
        /** 群聊系统指令：群名被修改的系统通知（由Server发出，所有除修改者外的群员接收） */
        MT51_OF_GROUP$SYSCMD_GROUP$NAME$CHANGED_FROM$SERVER : 51
    };

    // 聊天模式类型常量对象定义，请勿修改各常量值！
    // 详见：http://docs.52im.net/extend/docs/api/rainbowchatserver4_pro/com/x52im/rainbowchat/im/dto/MsgBodyRoot.html
    var ChatModeType = {
        /** 聊天模式类型：一对一好友聊天 */
        CHAT_TYPE_FRIEND$CHAT : 0,
        /** 聊天模式类型：一对一临时聊天(陌生人聊天) */
        CHAT_TYPE_GUEST$CHAT :  1,
        /** 聊天模式类型：普通群聊或世界频道（当groupid=-1时就是世界频道聊天） */
        CHAT_TYPE_GROUP$CHAT  : 2
    };

    // 聊天消息内容细分类型常量对象定义，请勿修改各常量值！
    // 详见：http://docs.52im.net/extend/docs/api/rainbowchatserver4_pro/com/x52im/rainbowchat/im/dto/MsgBodyRoot.html
    var MsgType = {
        /** 聊天消息类型之：普通文字消息 */
        TYPE_TEXT         : 0,
        /** 聊天消息类型之：图片消息（即消息内容就是存放于服务端的磁盘图片文件名） */
        TYPE_IMAGE        : 1,
        /** 聊天消息类型之：语音留言消息（即消息内容就是存放于服务端的语音留言文件名） */
        TYPE_VOICE        : 2,
        /** 聊天消息类型之：赠送的礼品消息（即消息内容就是对应礼品的ident字符串）。
         * 真正赠送的礼品，这个过程是要扣积分的哦。*/
        TYPE_GIFT$SEND    : 3,
        /** 聊天消息类型之：索取礼品消息（即消息内容就是对应礼品的ident字符串） 。
         * 只是索取礼品，跟普通文本消息是等同的，它不步及积分及相关。*/
        TYPE_GIFT$GET     : 4,
        /** 聊天消息类型之：文件消息 */
        TYPE_FILE         : 5,
        /** 聊天消息类型之：短视频消息 */
        TYPE_SHORTVIDEO   : 6,

        /** 聊天消息类型之：个人名片消息 */
        TYPE_CONTACT      : 7,
        /** 聊天消息类型之：位置消息 */
        TYPE_LOCATION     : 8,

        /** 聊天消息类型之：系统消息或提示信息（此类消息通常由服务器即f="0"的用户发出）. */
        TYPE_SYSTEAM$INFO : 90,

        /** 聊天消息类型之：“消息撤回”消息，这是一个特殊的“消息”，对于客户端而言，
         * 收到此消息后，可以理解为——先删掉原消息并用本消息“替换”之. */
        TYPE_REVOKE       : 91
    };


    /**
     * 首页“消息”（或说提示信息）类型定义常量，用于列表中区分不同的提示类型.
     */
    var AlarmMessageType = {
        undefine : 0,

        /** 添加好友请求 */
        addFriendRequest  : 1,
        /** 加好友被拒绝 */
        addFriendBeReject : 2,

        /** 收到的好友聊天消息 */
        reviceMessage     : 4,

        /** 系统预定义提示：Help */
        systemDevTeam     : 6,
        /** 系统预定义提示：Q&A */
        systemQNA         : 7,

        /** 收到的临时(陌生人)聊天消息 */
        tempChatMessage   : 8,

        /** 普通群聊聊天消息 */
        groupChatMessage  : 9
    };


    /**
     * 群组聊天时，群成员可重用Dialog界面的用途常量定义。
     *
     * @since 1.3
     */
    var GroupMemberDialogUsed = {
        /** 本界面用途之：创建群 */
        USED_FOR_CREATE_GROUP            : 0,
        /** 本界面用途之：查看群成员(普通群员可用)或管理群成员(群主可用，群主有删除功能) */
        USED_FOR_VIEW_OR_MANAGER_MEMBERS : 1,
        /** 本界面用途之：邀请入群 */
        USED_FOR_INVITE_MEMBERS          : 2,
        /** 本界面用途之：转让群 */
        USED_FOR_TRANSFER                : 3
    };

    /**
     * 用户选择Dialog界面的用途常量定义。
     *
     * @since 2.0
     */
    var UserChooserDialogUsed = {
        /** 本界面用途之：聊天界面中发送"个人名片"消息时选择被发送的用户 */
        USED_FOR_SEND_CONTACT_MESSAGE    : 0
    };


    ///**
    // * “位置”聊天消息时，地图可重用Dialog界面的用途常量定义。
    // *
    // * @since 2.0
    // */
    //var MsgLocationDialogUsed = {
    //    /** 本界面用途之：选择位置 */
    //    USED_FOR_SELECT : 0,
    //    /** 本界面用途之：查看位置 */
    //    USED_FOR_VIEW   : 1
    //};


    window.PRODUCT_VER_CODE      = _PRODUCT_VER_CODE ;
    window.PRODUCT_VER_NAME      = _PRODUCT_VER_NAME ;
    window.PRODUCT_NAME          = _PRODUCT_NAME;
    window.RBChatConfig          = config;
    window.MyProcessorConst      = MyProcessorConst;
    window.JobDispatchConst      = JobDispatchConst;
    window.SysActionConst        = SysActionConst;
    window.UserProtocalsType     = UserProtocalsType;
    window.ChatModeType          = ChatModeType;
    window.MsgType               = MsgType;
    window.AlarmMessageType      = AlarmMessageType;
    window.GroupMemberDialogUsed = GroupMemberDialogUsed;
    window.UserChooserDialogUsed = UserChooserDialogUsed;
    //window.MsgLocationDialogUsed = MsgLocationDialogUsed;
})();

