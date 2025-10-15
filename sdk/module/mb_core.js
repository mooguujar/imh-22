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
 * MobileIMSDK框架的浏览器端核心算法层入口类（相当于其它客户端sdk中的ClientCoreSDK类）。
 * <br>
 * 本类主要提供一些全局参数的读取和设置。
 *
 * @author Jack Jiang(http://www.52im.net/thread-2792-1-1.html)
 */
const MBCore = (function () {

    const TAG = "MBCore";

    // 构造器（相当于java里的构造方法）
    let ModuleMBCore = function (argument){

        /* 事件监听者Map(key=事件名, value=回调函数)，事件名常量定义请见：mb_constants.js中的MBSocketEvent对象 */
        this._socketEvenCallbacks = {};

        /* 要连接的WebSockcet服务端地址和端口，形如：“ws://192.168.0.113:3000/websocket” */
        this._websocketUrl = null;

        /* true表示开启MobileIMSDK框架核心层的Debug信息在浏览器console下的输出，否则关闭。默认为true. */
        this.DEBUG = false;

        /*
         * 是否在登陆成功后掉线时自动重新登陆线程中实质性发起登陆请求，true表示将在线程运行周期中正常发起，否则不发起
         * （即关闭实质性的重新登陆请求）。
         * <p>
         * 什么样的场景下，需要设置本参数为false？比如：上层应用可以在自已的节电逻辑中控制当网络长时断开时就不需要实质
         * 性发起登陆请求了，因为 网络请求是非常耗电的。
         * <p>
         * <b>本参数的设置将实时生效。</b>
         */
        this.autoReLogin = true;

        /*
         * 是否已成功连接到服务器（当然，前提是已成功发起过登陆请求后）.
         * 
         * 此“成功”意味着可以正常与服务端通信（可以近似理解为Socket正常建立），“不成功”意味着不能与服务端通信.
         * 不成功的因素有很多：比如网络不可用、网络状况很差导致的掉线、心跳超时等.
         * 
         * 本参数是整个MobileIMSDK框架中唯一可作为判断与MobileIMSDK服务器的通信是否正常的准确依据。
         * 本参数将在收到服务端的登陆请求反馈后被设置为true，在与服务端的通信无法正常完成时被设置为false。
         *
         * 那么MobileIMSDK如何判断与服务端的通信是否正常呢？ 判断方法如下：
         * 1）登陆请求被正常反馈即意味着通信正常（包括首次登陆时和断掉后的自动重新时）；
         * 2）首次登陆或断线后自动重连时登陆请求被发出后，没有收到服务端反馈时即意味着不正常；
         * 3）与服务端通信正常后，在规定的超时时间内没有收到心跳包的反馈后即意味着与服务端的通信又中断了（即所谓的掉线）。
         *
         * 本参数由框架自动设置。
         */
        this.connectedToServer = true;

        /*
         * 当且仅当用户从登陆界面成功登陆后设置本字段为true，系统退出（登陆）时设置为false。
         *
         * <b>本参数由框架自动设置。</b>
         */
        this.loginHasInit = false;

        /*
         * 保存用户的登陆用户id等信息（具体字段意义由业务层决定）。
         * 本对象在登陆信息成功发出后就会被设置，将在掉线后自动重连时使用。
         *
         * <b>本参数由框架自动设置（以下置null初始化，只是方便开发者正确的理解和使用这个对象中的各字段）。</b>
         *
         * 登陆信息各字段定义见：http://docs.52im.net/extend/docs/api/mobileimsdk/server_tcp/net/x52im/mobileimsdk/server/protocal/c/PLoginInfo.html
         */
        this.currenetLoginInfo = {
            // 保存提交到服务端的准一身份id，可能是登陆用户名、任意不重复的id等，具体意义由开发者业务层决定
            loginUserId : null,
            // 保存提交到服务端用于身份鉴别和合法性检查的token，它可能是登陆密码、也可能是通过前置http单点
            // 登陆接口拿到的token等，具体意义由业务层决定。
            loginToken : null,
            // 保存本地用户登陆时要提交的额外信息（非必须字段，具体意义由客户端自行决定）
            loginExtra : null,
            // 保存客户端首次登陆时间（此时间由服务端在客户端首次登陆时返回的登陆信息中提供，客户端后绪在
            // 掉重连时带上本字段，以便服务端用于多端互踢判定逻辑中使用）。此值不设置则默认应置为0
            firstLoginTime : 0
        };
    };

    /**
     * 设置要连接的WebSockcet服务端地址和端口。
     *
     * @param wsUrl {String } websocket的url地址，形如：“ws://192.168.0.113:3000/websocket”
     */
    ModuleMBCore.prototype.setWebsocketUrl = function(wsUrl){
        this._websocketUrl = wsUrl;
    };

    /**
     * 返回设置的WebSockcet服务端地址和端口。
     *
     * @return {null|String} 形如：“ws://192.168.0.113:3000/websocket”
     */
    ModuleMBCore.prototype.getWebsocketUrl = function(){
        return this._websocketUrl;
    };

    /**
     * 当且仅当用户从登陆界面成功登陆后设置本字段为true，服务端反馈会话被注销或系统退出（登陆）时自动被设置为false。
     * <br>
     * <b>注意：</b>本函数由框架自动调用，无需也不建议应用层调用。
     *
     * @return {boolean} true表示已成功登陆过
     */
    ModuleMBCore.prototype.isLoginHasInit= function() {
        return this.loginHasInit;
    };

    /**
     * 当且仅当用户从登陆界面成功登陆后设置本字段为true，服务端反馈会话被注销或系统退出（登陆）时自动被设置为false。
     * <br>
     * <b>注意：</b>本方法由框架自动调用，无需也不建议应用层调用。
     *
     * @param loginHasInit {boolean} 是否已成功登陆功
     */
    ModuleMBCore.prototype.setLoginHasInit = function(loginHasInit) {
        this.loginHasInit = loginHasInit;
    };

    /**
     * 设置是否支持自动登陆机制。
     *
     * @param autoRelogin {boolean}  true表示支持，否则不支持
     */
    ModuleMBCore.prototype.setAutoRelogin = function(autoRelogin){
        this.autoReLogin = autoRelogin;
    };

    /**
     * 是否支持自动登陆机制。
     *
     * @returns {boolean} true表示支持，否则不支持
     */
    ModuleMBCore.prototype.isAutoRelogin = function(){
        return this.autoReLogin;
    };

    /**
     * 是否已成功连接到服务器（当然，前提是已成功发起过登陆请求后）.
     *
     * 此“成功”意味着可以正常与服务端通信（可以近似理解为Socket正常建立），“不成功”意味着不能与服务端通信.
     * 不成功的因素有很多：比如网络不可用、网络状况很差导致的掉线、心跳超时等.
     *
     * 本参数是整个MobileIMSDK框架中唯一可作为判断与MobileIMSDK服务器的通信是否正常的准确依据。
     * 本参数将在收到服务端的登陆请求反馈后被设置为true，在与服务端的通信无法正常完成时被设置为false。
     *
     * 那么MobileIMSDK如何判断与服务端的通信是否正常呢？ 判断方法如下：
     * 1）登陆请求被正常反馈即意味着通信正常（包括首次登陆时和断掉后的自动重新时）；
     * 2）首次登陆或断线后自动重连时登陆请求被发出后，没有收到服务端反馈时即意味着不正常；
     * 3）与服务端通信正常后，在规定的超时时间内没有收到心跳包的反馈后即意味着与服务端的通信又中断了（即所谓的掉线）。
     *
     * @return {boolean} true表示与服务端真正的通信正常（即准确指明可正常进行消息交互，而不只是物理网络连接正常，因为物理连接正常
     * 并不意味着服务端允许你合法的进行消息交互），否由表示不正常
     */
    ModuleMBCore.prototype.isConnectedToServer= function() {
        return this.connectedToServer;
    };

    /**
     * 是否已成功连接到服务器（当然，前提是已成功发起过登陆请求后）.
     * <br>
     * <b>注意：</b>本函数由框架自动调用，无需也不建议应用层调用。
     *
     * @param connectedToServer {boolean} true表示已成功连接到服务器
     */
    ModuleMBCore.prototype.setConnectedToServer = function(connectedToServer) {
        this.connectedToServer = connectedToServer;
    };

    /**
     * 返回提交到服务端的登陆信息，可能是用户id、token等，具体意义由业务层决定。
     *
     * @return {Object}
     */
    ModuleMBCore.prototype.getCurrentLoginInfo = function() {
        return this.currenetLoginInfo;
    };

    /**
     * 登陆信息成功发出后就会设置本字段（即登陆uid等信息），这些信息也将在掉线后自动重连时使用。
     * <br>
     * <b>注意：</b>本函数由框架自动调用，无需也不建议应用层调用。
     *
     * @param loginInfo {Object}
     */
    ModuleMBCore.prototype.setCurrenetLoginInfo = function(loginInfo){
        this.currenetLoginInfo = loginInfo;
    };

    /**
     * 用于首次登陆成功后，保存服务端返回的登陆时间（此时间将会随着完整登陆信息，在掉线重连时再次提交到服务端，服务端
     * 可据此时间精确判定在多端、网络复杂性的情况下的互踢逻辑）。
     *
     * @param firstLoginTime {Number} 服务端返回的首次登陆时间（此时间为形如“1624333553769”的Java时间戳）
     */
    ModuleMBCore.prototype.setCurrenetLoginInfo_firstLoginTime = function(firstLoginTime){
        this.currenetLoginInfo.firstLoginTime = firstLoginTime;
    };

    /**
     * 获取指定事件名对应的回调函数。
     * <br>
     * <b>注意：</b>本函数由框架内部调用，无需也不建议应用层调用。
     *
     * @param eventName {String} 事件名常量，常量定义见mb_constants.js中的{@link MBSocketEvent}对象。
     * @return {null|function}
     */
    ModuleMBCore.prototype.getEventCallback = function(eventName){
        if(eventName){
            let callback = this._socketEvenCallbacks[eventName];
            if(callback){
                return callback;
            }

            MBUtils.mblog_d(TAG, "事件监听者列表中，名称为 eventName="+eventName+"的callback 是空的！");
            return null;
        }
        else
            MBUtils.mblog_w(TAG, '无效的参数：eventName='+eventName);
    };

    /**
     * 为指定的网络事件添加事件处理回调。
     *
     * 补充说明：之所以将本函数命名为“on”，是为了兼容socket.io版的MobileIMSDK-H5，
     *          如果本函数命名为“registerSocketEventCallback”可能更易理解。
     *
     * @param eventName {String} 网络事件名，常量定义请见mb_constant.js中的{@link MBSocketEvent}对象
     * @param callback {function} 处理对应网络事件的回调函数
     */
    ModuleMBCore.prototype.on = function(eventName, callback){
        if(eventName && callback){
            // 如果存在则直接覆盖（替换）成最新的
            this._socketEvenCallbacks[eventName] = callback;
        }
        else{
            MBUtils.mblog_w(TAG, '无效的参数：eventName='+eventName+", callback="+callback);
        }
    };

    /**
     * 抛出网络事件。
     *
     * 补充说明：之所以将本函数命名为“emite”，是为了兼容socket.io版的MobileIMSDK-H5，
     *          如果本函数命名为“postSocketEvent”可能更易理解。
     *
     * @param eventName {String} 网络事件名，常量定义请见mb_constant.js中的{@link MBSocketEvent}对象
     * @param data {Object} 该事件对应的数据，具体的数据类型由对应的网络事件决定，并不固定
     */
    ModuleMBCore.prototype.emit = function(eventName, data){
        var callbackForEvent = this.getEventCallback(eventName);
        if(callbackForEvent){
            callbackForEvent(data);
        }
        else{
            MBUtils.mblog_w(TAG, '事件回调列表中没有找到eventName='+eventName+"的callback，本次emit无法进行！");
        }
    };

    /**
     * 是否已开启核心算法层的Log输出。
     *
     * @return {boolean} true表示开启，否则关闭。默认为true.
     */
    ModuleMBCore.prototype.debugEnabled = function () {
        return this.DEBUG;
    };

    /**
     * 开启或关闭核心算法层的Log输出。
     *
     * @param enabled {boolean} true表示开启，否则关闭
     */
    ModuleMBCore.prototype.setDebugEnabled = function (enabled) {
        this.DEBUG = enabled;
    };

    /**
     * 释放MobileIMSDK框架资源统一方法。
     * <p>
     * 本方法建议在退出登陆（或退出APP时）时调用。调用时将尝试关闭所有
     * MobileIMSDK框架的后台守护线程并同设置核心框架init=false、
     * {@link #loginHasInit}=false、{@link #connectedToServer}=false。
     */
    ModuleMBCore.prototype.release = function() {

        // 设置是否正常连接（登陆）到服务器的标识
        // （注意：在要closeLocalSocket前调用哦，否则将错误地触发自动重连逻辑）
        MBCore.setConnectedToServer(false);

        // 尝试关闭本地Socket
        MBSocketProvider.closeLocalSocket();
        // 尝试停掉掉线重连线程（如果线程正在运行的话）
        MBAutoReLoginDaemon.stop();
        // 尝试停掉QoS质量保证（发送）心跳线程
        MBQoS4SendDaemon.stop();
        // 尝试停掉Keep Alive心跳线程
        MBKeepAliveDaemon.stop();
//		// 尝试停掉消息接收者
//		LocalUDPDataReciever.getInstance().stop();
        // 尝试停掉QoS质量保证（接收防重复机制）心跳线程
        MBQoS4ReciveDaemon.stop();

        // 并清除QoS发送队列缓存：防止不退出APP时切换另一账号后qos的缓存队列未清空
        MBQoS4SendDaemon.clear();
        // 并清除QoS接收队列缓存：防止不退出APP时切换另一账号后qos的缓存队列未清空
        MBQoS4ReciveDaemon.clear();

        // 清除事件回调列表
        // this._socketEvenCallbacks = {};

        this.setLoginHasInit(false);
        // this.setConnectedToServer(false);
        this.setCurrenetLoginInfo(null);
    };

    // 实例化此类
    return new ModuleMBCore();
})();