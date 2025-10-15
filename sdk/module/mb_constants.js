/*
 * Copyright (C) 2021  即时通讯网(52im.net) & Jack Jiang.
 * The MobileIMSDK_H5（MobileIMSDK的标准HTML5版客户端） Project. All rights reserved.
 *
 * 【本产品为著作权产品，请在授权范围内放心使用，禁止外传！】
 *
 * 【本系列产品在国家版权局的著作权登记信息如下】：
 * 1）国家版权局登记名（简称）和证书号：RainbowChat（软著登字第1220494号）
 * 2）国家版权局登记名（简称）和证书号：RainbowChat-Web（软著登字第3743440号）
 * 3）国家版权局登记名（简称）和证书号：RainbowAV（软著登字第2262004号）
 * 4）国家版权局登记名（简称）和证书号：MobileIMSDK-Web（软著登字第2262073号）
 * 5）国家版权局登记名（简称）和证书号：MobileIMSDK（软著登字第1220581号）
 * 著作权所有人：江顺/苏州网际时代信息科技有限公司
 *
 * 【违法或违规使用投诉和举报方式】：
 * 联系邮件：jack.jiang@52im.net
 * 联系微信：hellojackjiang
 * 联系QQ：413980957
 * 官方社区：http://www.52im.net
 */

/**
 * MobileIMSDK核心框架级的协议类型.
 * <p>
 * 这些协议类型由框架算法决定其意义和用途，不建议用户自行使用，用户
 * 自定义协议类型请参见 {@link Protocal} 类中的 typeu 字段。
 *
 * 可参考API文档：http://docs.52im.net/extend/docs/api/mobileimsdk/server_tcp/net/x52im/mobileimsdk/server/protocal/Protocal.html
 */
const MBProtocalType = {

    //------------------------------------------------- from client
    /* 由客户端发出 - 协议类型：客户端登陆 */
    FROM_CLIENT_TYPE_OF_LOGIN               : 0,
    /* 由客户端发出 - 协议类型：心跳包 */
    FROM_CLIENT_TYPE_OF_KEEP$ALIVE          : 1,
    /* 由客户端发出 - 协议类型：发送通用数据 */
    FROM_CLIENT_TYPE_OF_COMMON$DATA         : 2,
    /* 由客户端发出 - 协议类型：客户端退出登陆 */
    FROM_CLIENT_TYPE_OF_LOGOUT              : 3,
    /* 由客户端发出 - 协议类型：QoS保证机制中的消息应答包（目前只支持客户端间的QoS机制哦） */
    FROM_CLIENT_TYPE_OF_RECIVED             : 4,
    /* 由客户端发出 - 协议类型：C2S时的回显指令（此指令目前仅用于测试时） */
    FROM_CLIENT_TYPE_OF_ECHO                : 5,

    //------------------------------------------------- from server
    /* 由服务端发出 - 协议类型：响应客户端的登陆 */
    FROM_SERVER_TYPE_OF_RESPONSE$LOGIN      : 50,
    /* 由服务端发出 - 协议类型：响应客户端的心跳包 */
    FROM_SERVER_TYPE_OF_RESPONSE$KEEP$ALIVE : 51,
    /* 由服务端发出 - 协议类型：反馈给客户端的错误信息 */
    FROM_SERVER_TYPE_OF_RESPONSE$FOR$ERROR  : 52,
    /* 由服务端发出 - 协议类型：反馈回显指令给客户端 */
    FROM_SERVER_TYPE_OF_RESPONSE$ECHO       : 53,
    /* 由服务端发出 - 协议类型：向客户端发出“重复登陆被踢”指令 */
    FROM_SERVER_TYPE_OF_KICKOUT             : 54
};

/**
 * 错误码常量表.<br>
 * <b>建议0~1024范围内的错误码作为MobileIMSDK核心框架保留，业务层请使用>1024的码表示！</b>
 */
const MBErrorCode = {

    /* 一切正常 */
    COMMON_CODE_OK               : 0,
    /* 客户端尚未登陆 */
    COMMON_NO_LOGIN              : 1,
    /* 未知错误 */
    COMMON_UNKNOW_ERROR          : 2,
    /* 数据发送失败 */
    COMMON_DATA_SEND_FAILD       : 3,
    /* 无效的 {@link Protocal}对象 */
    COMMON_INVALID_PROTOCAL      : 4,

    //------------------------------------------------- 由客户端产生的错误码
    /* 与服务端的连接已断开 */
    BREOKEN_CONNECT_TO_SERVER    : 201,
    /* 与服务端的网络连接失败 */
    BAD_CONNECT_TO_SERVER        : 202,
    /* 客户端SDK尚未初始化 */
    CLIENT_SDK_NO_INITIALED      : 203,
    /* 本地网络不可用（未打开） */
    LOCAL_NETWORK_NOT_WORKING    : 204,
    /* 要连接的服务端网络参数未设置 */
    TO_SERVER_NET_INFO_NOT_SETUP : 205,

    //------------------------------------------------- 由服务端产生的错误码
    /* 客户端尚未登陆，请重新登陆 */
    RESPONSE_FOR_UNLOGIN         : 301
};

/**
 * Socket事件名定义。
 *
 * MobileIMSDK H5版客户端框架中，各种网络事件是通过事件通知的方法抛出，从而与主逻辑解耦，
 * 机制上与Andriod端的机制EventBus类似，与socket.io中的实现思路是一致的。
 */
const MBSocketEvent = {

    SOCKET_EVENT_ON_LOGIN_RESPONSE   : "onLoginResponse",
    SOCKET_EVENT_ON_LINK_CLOSE       : "onLinkClose",

    SOCKET_EVENT_ON_RECIEVE_MESSAGE  : "onRecieveMessage",
    SOCKET_EVENT_ON_ERROR_RESPONSE   : "onErrorResponse",

    SOCKET_EVENT_MESSAGE_LOST        : "messagesLost",
    SOCKET_EVENT_MESSAGE_BE_RECIEVED : "messagesBeReceived",

    SOCKET_EVENT_RECONNECT_ATTEMPT   : "reconnect_attempt",

    /* 网络事件：心跳包（客户端发出的） */
    SOCKET_EVENT_PING                : "ping",
    /* 网络事件：心跳包（客户端收到的） */
    SOCKET_EVENT_PONG                : "pong",

    /* 网络事件：客户端已被强行踢出 */
    SOCKET_EVENT_KICKOUT             : "kickout"
};

/**
 * 被踢原因编码常量。
 */
const MBKickoutCode = {
    /* 被踢原因编码：因重复登陆被踢 */
    KICKOUT_FOR_DUPLICATE_LOGIN : 1,
    /* 被踢原因编码：被管理员强行踢出 */
    KICKOUT_FOR_ADMIN           : 2
};

/**
 * MobileIMSDK核心框架预设的敏感度模式.
 *
 * <p>
 * 对于客户端而言，此模式决定了用户与服务端网络会话的健康模式，原则上超敏感客户端的体验越好。
 *
 * <p>
 * <b>重要说明：</b><u>客户端本模式的设定必须要与服务端的模式设制保持一致</u>，否则可能因参数的不一致而导致
 * IM算法的不匹配，进而出现不可预知的问题。
 *
 * @author Jack Jiang
 */
const MBSenseMode = {

    /*
     * 此模式下：<br>
     * - KeepAlive心跳问隔为3秒；<br>
     * - 5秒后未收到服务端心跳反馈即认为连接已断开（相当于连续1个心跳间隔+2秒链路延迟容忍时间后仍未收到服务端反馈）。
     */
    MODE_3S : 1,

    /*
     * 此模式下：<br>
     * - KeepAlive心跳问隔为5秒；<br>
     * - 8秒后未收到服务端心跳反馈即认为连接已断开（相当于连续1个心跳间隔+3秒链路延迟容忍时间后仍未收到服务端反馈）。
     */
    MODE_5S : 2,

    /*
     * 此模式下：<br>
     * - KeepAlive心跳问隔为10秒；<br>
     * - 15秒后未收到服务端心跳反馈即认为连接已断开（相当于连续1个心跳间隔+5秒链路延迟容忍时间后仍未收到服务端反馈）。
     */
    MODE_10S : 3,

    /*
     * 此模式下：<br>
     * - KeepAlive心跳问隔为15秒；<br>
     * - 20秒后未收到服务端心跳反馈即认为连接已断开（相当于连续1个心跳间隔+5秒链路延迟容忍时间后仍未收到服务端反馈）。
     */
    MODE_15S : 4,

    /*
     * 此模式下：<br>
     * - KeepAlive心跳问隔为30秒；<br>
     * - 35秒后未收到服务端心跳反馈即认为连接已断开（相当于连续1个心跳间隔+5秒链路延迟容忍时间后仍未收到服务端反馈）。
     */
    MODE_30S : 5,

    /*
     * 此模式下：<br>
     * - KeepAlive心跳问隔为60秒；<br>
     * - 65秒后未收到服务端心跳反馈即认为连接已断开（相当于连续1个心跳间隔+5秒链路延迟容忍时间后仍未收到服务端反馈）。
     */
    MODE_60S : 6,

    /*
     * 此模式下：<br>
     * - KeepAlive心跳问隔为120秒；<br>
     * - 125秒后未收到服务端心跳反馈即认为连接已断开（相当于连续1个心跳间隔+5秒链路延迟容忍时间后仍未收到服务端反馈）。
     */
    MODE_120S : 7
};


/**
 * MibileIMSDK框架H5版客户端的协议工厂类。
 * <p>
 * 理论上这些协议都是框架内部要用到的，应用上层可以无需理解和理会之。
 *
 * @author Jack Jiang(http://www.52im.net/thread-2792-1-1.html)
 */
const MBProtocalFactory = (function(){

    /**
     * ======================================================================
     * 定义一个Protocal协议报文类.
     *
     * 【基本说明】：
     * 此类是MobileIMSDK的通信协议报文封装对象，MobileIMSDK的全部客户端和服务端都遵从这个报文格式。
     * ======================================================================
     */
    // 构造器（相当于java里的构造方法）
    let Protocal = function(argument){

        /**
         * 意义：协议类型。
         * 注意：本字段为框架专用字段，本字段的使用涉及IM核心层算法的表现，如无必要请避免应用层使用此字段。
         * 补充：理论上应用层不参与本字段的定义，可将其视为透明，如需定义应用层的消息类型，请使用typeu字
         *       段并配合dataContent一起使用。
         */
        this.type = 0;

        /**
         * 意义：协议数据内容。
         * 说明：本字段用于MobileIMSDK框架中时，可能会存放一些指令内容。当本字段用于应用层时，由用户自行
         *      定义和使用其内容。
         */
        this.dataContent = null;

        /**
         * 意义：消息发出方的id（当用户登陆时，此值可不设置）
         * 说明：为“-1”表示未设定、为“0”表示来自Server。
         */
        this.from = "-1";

        /**
         * 意义：消息接收方的id（当用户退出时，此值可不设置）
         * 说明：为“-1”表示未设定、为“0”表示发给Server。
         */
        this.to = "-1";

        /**
         * 意义：用于消息的指纹特征码（理论上全局唯一）.
         * 注意：本字段为框架专用字段，请勿用作其它用途。
         */
        this.fp = null;

        /**
         * 意义：true表示本包需要进行QoS质量保证，否则不需要.<br>
         * 默认：false */
        this.QoS = false;

        /**
         * 意义：应用层专用字段——用于应用层存放聊天、推送等场景下的消息类型。
         * 注意：此值为-1时表示未定义。MobileIMSDK_X框架中，本字段为保留字段，不参与框架的核心算法，专留用应用
         *      层自行定义和使用。
         */
        this.typeu = -1;

        /** 本字段仅用于客户端QoS逻辑时（表示丢包重试次数），本字段不用于网络传输时！ */
        this.retryCount = 0;
    };


    // 构造器（相当于java里的构造方法）
    let Factory = function(argument){
        //
    };

    /**
     * 创建Protocal对象的方法。
     *
     * @param type {int} 协议类型
     * @param dataContent {String} 协议数据内容
     * @param from {String} 消息发出方的id（当用户登陆时，此值可不设置）
     * @param to {String} 消息接收方的id（当用户退出时，此值可不设置）
     * @param QoS {boolean} 是否需要QoS支持，true表示是，否则不需要
     * @param fingerPrint {String} 协议包的指纹特征码，当 QoS字段=true时且本字段为null时方法中将自动生成指纹码否则使用本参数指定的指纹码
     * @param typeu {int} 应用层专用字段——用于应用层存放聊天、推送等场景下的消息类型，不需要设置时请填-1即可
     * @return {Protocal}
     */
    Factory.prototype.createProtocal = function(type, dataContent, from, to
        , QoS, fingerPrint, typeu) {

        var p = new Protocal();

        p.type = type;
        p.dataContent = dataContent;
        p.from = from;
        p.to = to;
        p.typeu = typeu;

        p.QoS = QoS;
        // 只有在需要QoS支持时才生成指纹，否则浪费数据传输流量
        // 目前一个包的指纹只在对象建立时创建哦
        if(QoS) {
            p.fp = (fingerPrint ? fingerPrint : uuid.v1());
        }

        return p;
    };

    /**
     * 此方法的存在，仅是为了方便兼容基于MobileIMSDK-H5框架的应用层代码。
     *
     * @see #createProtocal()
     */
    Factory.prototype.createCommonData = function(dataContent, from_user_id, to_user_id, QoS, fingerPrint, typeu){
        return this.createProtocal(MBProtocalType.FROM_CLIENT_TYPE_OF_COMMON$DATA, dataContent
            , from_user_id, to_user_id, QoS, fingerPrint, typeu);
    };

    /**
     * 此方法的存在，仅是为了方便兼容基于MobileIMSDK-H5框架的应用层代码。
     *
     * @see #createProtocal()
     */
    Factory.prototype.createCommonDataSimple = function(dataContent, from_user_id, to_user_id, typeu){
        return this.createCommonData(dataContent, from_user_id, to_user_id, true, null, typeu);
    };

    /**
     * 创建用户心跳包报文对象（该对象由客户端发出）.
     * <p>
     * <b>本方法主要由MobileIMSDK框架内部使用。</b>
     *
     * @param from_user_id {String} 消息接收者uid
     * @return {Protocal}
     */
    Factory.prototype.createPKeepAlive = function(from_user_id) {
        return this.createProtocal(MBProtocalType.FROM_CLIENT_TYPE_OF_KEEP$ALIVE
            , "{}", from_user_id, "0", false, null, -1);
    };

    /**
     * 创建用户注消登陆消息报文对象（该对象由客户端发出）.
     * <p>
     * <b>本方法主要由MobileIMSDK框架内部使用。</b>
     *
     * @param user_id {String} 消息接收者uid
     * @return {Protocal}
     */
    Factory.prototype.createPLoginoutInfo = function( user_id) {
        return this.createProtocal(MBProtocalType.FROM_CLIENT_TYPE_OF_LOGOUT
            , null, user_id, "0", false, null, -1);
    };

    /**
     * 创建用户登陆消息报文对象（该对象由客户端发出）.
     * <p>
     * <b>本方法主要由MobileIMSDK框架内部使用。</b>
     *
     * @param userId {String} 传递过来的准一id，保证唯一就可以通信，可能是登陆用户名、也可能是任意不重复的id等，具体意义由业务层决定
     * @param token {String} 用于身份鉴别和合法性检查的token，它可能是登陆密码，也可能是通过前置单点登陆接口拿到的token等，具体意义由业务层决定
     * @param extra {String} 额外信息字符串。本字段目前为保留字段，供上层应用自行放置需要的内容
     * @return {Protocal}
     */
    Factory.prototype.createPLoginInfo = function(userId, loginInfo) {

        // var loginInfo = {
        //     loginUserId : userId,
        //     loginToken  : token,
        //     extra       : extra
        // };

        // 因登陆额外处理丢包逻辑，所以此包也无需QoS支持。不能支持QoS的原因
        // 是：登陆时QoS机制都还没启用呢（只在登陆成功后启用），所以此处无需设置且设置了也没有用的哦
        return this.createProtocal(MBProtocalType.FROM_CLIENT_TYPE_OF_LOGIN
            , JSON.stringify(loginInfo), userId, "0", false, null, -1);
    };

    /**
     * 客户端from_user_id向to_user_id发送一个QoS机制中需要的“收到消息应答包”(默认bridge标认为false).
     * <p>
     * <b>本方法主要由MobileIMSDK框架内部使用。</b>
     *
     * @param from_user_id {String} 发起方
     * @param to_user_id {String} 接收方
     * @param recievedMessageFingerPrint {String} 已收到的消息包指纹码
     * @return
     */
    Factory.prototype.createRecivedBack = function( from_user_id,  to_user_id, recievedMessageFingerPrint) {
        return this.createProtocal(MBProtocalType.FROM_CLIENT_TYPE_OF_RECIVED
            , recievedMessageFingerPrint, from_user_id, to_user_id, false, null, -1);
    };

    // 实例化此类
    return new Factory();
})();



