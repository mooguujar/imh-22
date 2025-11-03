/**
 * SDK框架级协议常量持有对象.
 *
 * @type {{S_IMEVT_DUPLICATED: string, C_IMEVT_COMMON$DATA: string, S_IMEVT_ILLEGAL: string}}
 */
const MBProtocalType = {
    /** 由客户端发出 - 协议类型：QoS保证机制中的消息应答包 */
    // （注意：此事件一定要与服务端protocal-type.js中定义的保持一致！）
    S_IMEVT_RECIVED      : '4',
    /** 由客户端发出 - 协议类型：发送通用数据（注意：此事件一定要与服务端protocal-type.js中定义的保持一致！）*/
    // 注：为保持与APP端消息类型一致，本常量由原值'c_evt.commondata'改为现值
    C_IMEVT_COMMON$DATA  : '2',

    /** 由服务端发出 - 协议类型：重复登陆被踢消息（注意：此事件一定要与服务端protocal-type.js中定义的保持一致！）*/
    S_IMEVT_DUPLICATED   : 's_evt.duplicated',
    /** 由服务端发出 - 协议类型：非法连接被拒绝服务事件（即服务将未带有合法认证信息的socket踢掉前发出的事件通知，防止非法连接和攻击）*/
    // （注意：此事件一定要与服务端protocal-type.js中定义的保持一致！）
    S_IMEVT_ILLEGAL      : 's_evt.illegal'
};


/**
 * 本地逻辑事件名定义。
 */
const MBLocalLogicEvent = {
    LOCAL_LOGIC_EVENT_MESSAGE_LOST        : "messagesLost",
    LOCAL_LOGIC_EVENT_MESSAGE_BE_RECIEVED : "messagesBeReceived",
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
     * 此类是MobileIMSDK-Web的通信协议报文封装对象，MobileIMSDK-Web的全部客户端和服务端都遵从这个报文格式。
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
        this.type = '0';

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
         * 注意：此值为-1时表示未定义。MobileIMSDK_Web框架中，本字段为保留字段，不参与框架的核心算法，专留用应用
         *      层自行定义和使用。
         */
        this.typeu = -1;

        // /** 消息的发出时间，本字段目前用于聊天消息记录时，本字段不用于网络传输时（可为空）！ */
        // this.msgTime = null;

        /** 本字段仅用于客户端QoS逻辑时（表示丢包重试次数），本字段不用于网络传输时！ */
        this.retryCount = 0;
    };


    // 构造器（相当于java里的构造方法）
    let Factory = function(argument){
        //
    };

    /**
     * 创建框架的通信层Protocal报文对象的方法。
     *
     * @param type {String} 协议类型
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
            p.fp = (fingerPrint ? fingerPrint : this.genFingerPrint());
        }

        return p;
    };

    /**
     * 创建通用数据的Protocal报文对象的方法。
     *
     * @param dataContent {String} 协议数据内容
     * @param from_user_id {String} 消息发出方的id（当用户登陆时，此值可不设置）
     * @param to_user_id {String} 消息接收方的id（当用户退出时，此值可不设置）
     * @param QoS {boolean} 是否需要QoS支持，true表示是，否则不需要
     * @param fingerPrint {String} 协议包的指纹特征码，当 QoS字段=true时且本字段为null时方法中将自动生成指纹码否则使用本参数指定的指纹码
     * @param typeu {int} 应用层专用字段——用于应用层存放聊天、推送等场景下的消息类型，不需要设置时请填-1即可
     * @return {Protocal}
     */
    Factory.prototype.createCommonData = function(dataContent, from_user_id, to_user_id, QoS, fingerPrint, typeu){
        var p = this.createProtocal(MBProtocalType.C_IMEVT_COMMON$DATA, dataContent, from_user_id, to_user_id, QoS, fingerPrint, typeu);
        // p.msgTime = msgTime;
        return p;

        // return {type:C_IMEVT_COMMON$DATA
        //     , from:from_user_id
        //     , to:to_user_id
        //     , dataContent:dataContent
        //     // 20160921后启动uuid生成， uuid对象由uuid.js文件中代码定义，uuid生成可兼容IE7及以上浏览器（IE6未测试过）
        //     , fp:(fingerPrint ? fingerPrint : uuid.v1())
        //     , typeu: typeu // add by Jack Jiang at 20161122
        //     , msgTime: msgTime
        // };
    };

    /**
     * 创建通用数据的Protocal报文对象的方法（默认QoS为true）。
     *
     * @param dataContent {String} 协议数据内容
     * @param from_user_id {String} 消息发出方的id（当用户登陆时，此值可不设置）
     * @param to_user_id {String} 消息接收方的id（当用户退出时，此值可不设置）
     * @param typeu {int} 应用层专用字段——用于应用层存放聊天、推送等场景下的消息类型，不需要设置时请填-1即可
     * @return {Protocal}
     */
    Factory.prototype.createCommonDataSimple = function(dataContent, from_user_id, to_user_id, typeu){
        return this.createCommonData(dataContent, from_user_id, to_user_id, true, null, typeu);
    };

    // /**
    //  * 增加了msgTime字段、fingerPrint字段的通用Protocal对象创建函数。
    //  *
    //  * @param dataContent 要发送的数据内容
    //  * @param from_user_id 消息发送者uid
    //  * @param to_user_id 消息接收者uid
    //  * @param typeu 应用层专用字段——用于应用层存放聊天、推送等场景下的消息类型。注意：此值为-1时表示未定义。
    //  *              MobileIMSDK_Web框架中，本字段为保留字段，不参与框架的核心算法，专留用应用层自行定义和使用。
    //  * @param msgTime 消息的发出时间，本字段目前用于聊天消息记录时，可为空
    //  * @param QoS true表示支持消息送达保证机制
    //  * @param fingerPrint 消息包的指纹码（即唯一ID），本参数为空时函数将自动生成uuid作为fingerprint，否则使用您传的值
    //  * @returns {{type: string, from: *, to: *, dataContent: *, fp: *, typeu: *, msgTime: *}}
    //  * @see mobile-im-sdk/protocal.js
    //  */
    // Factory.prototype.createCommonData4 = function(dataContent, from_user_id, to_user_id, typeu, msgTime, fingerPrint){
    //     return this.createCommonData(dataContent, from_user_id, to_user_id, typeu, msgTime, true, fingerPrint);
    //
    //     // return {type:C_IMEVT_COMMON$DATA
    //     //     , from:from_user_id
    //     //     , to:to_user_id
    //     //     , dataContent:dataContent
    //     //     // 20160921后启动uuid生成， uuid对象由uuid.js文件中代码定义，uuid生成可兼容IE7及以上浏览器（IE6未测试过）
    //     //     , fp:(fingerPrint ? fingerPrint : uuid.v1())
    //     //     , typeu: typeu // add by Jack Jiang at 20161122
    //     //     , msgTime: msgTime
    //     // };
    // };

    // /**
    //  * 增加了msgTime字段的通用Protocal对象创建函数。
    //  *
    //  * @param dataContent 要发送的数据内容
    //  * @param from_user_id 消息发送者uid
    //  * @param to_user_id 消息接收者uid
    //  * @param typeu 应用层专用字段——用于应用层存放聊天、推送等场景下的消息类型。注意：此值为-1时表示未定义。
    //  *              MobileIMSDK_Web框架中，本字段为保留字段，不参与框架的核心算法，专留用应用层自行定义和使用。
    //  * @param msgTime 消息的了出时间，本字段目前用于聊天消息记录时，可为空
    //  * @returns {{type: string, from: *, to: *, dataContent: *, fp: *, typu: *}}
    //  * @see mobile-im-sdk/protocal.js
    //  */
    // Factory.prototype.createCommonData3 = function(dataContent, from_user_id, to_user_id, typeu, msgTime){
    //     return this.createCommonData4(dataContent, from_user_id, to_user_id, typeu, msgTime, null)
    // };
    //
    // /**
    //  * 增加了typu字段的通用通用Protocal对象创建函数。（msgTime字段默认设为null）。
    //  *
    //  * @param dataContent 要发送的数据内容
    //  * @param from_user_id 消息发送者uid
    //  * @param to_user_id 消息接收者uid
    //  * @param typeu 应用层专用字段——用于应用层存放聊天、推送等场景下的消息类型。注意：此值为-1时表示未定义。
    //  *              MobileIMSDK_Web框架中，本字段为保留字段，不参与框架的核心算法，专留用应用层自行定义和使用。
    //  * @returns {{type: string, from: *, to: *, dataContent: *, fp: *, typu: *}}
    //  * @see mobile-im-sdk/protocal.js
    //  * @see createCommonData3(..)
    //  */
    // Factory.prototype.createCommonData2 = function(dataContent, from_user_id, to_user_id, typeu){
    //     return this.createCommonData3(dataContent, from_user_id, to_user_id, typeu, null);
    // };

    // /**
    //  * 此方法的存在，仅是为了方便兼容基于MobileIMSDK-H5框架的应用层代码。
    //  *
    //  * @see #createProtocal()
    //  */
    // Factory.prototype.createCommonData4 = function(dataContent, from_user_id, to_user_id, typeu, fingerPrint, QoS){
    //     return this.createProtocal(MBProtocalType.FROM_CLIENT_TYPE_OF_COMMON$DATA, dataContent
    //         , from_user_id, to_user_id, QoS, fingerPrint, typeu);
    // };

    // /**
    //  * 此方法的存在，仅是为了方便兼容基于MobileIMSDK-H5框架的应用层代码。
    //  *
    //  * @see #createProtocal()
    //  */
    // Factory.prototype.createCommonData2 = function(dataContent, from_user_id, to_user_id, typeu){
    //     return this.createCommonData4(dataContent, from_user_id, to_user_id, typeu, null, true);
    // };



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
        return this.createProtocal(MBProtocalType.S_IMEVT_RECIVED
            , recievedMessageFingerPrint, from_user_id, to_user_id, false, null, -1);
    };

    /**
     * 生成一个消息指纹码。
     *
     * @return {string} 指纹码
     */
    Factory.prototype.genFingerPrint = function () {
        return uuid.v1();
    };

    // 实例化此类
    return new Factory();
})();



