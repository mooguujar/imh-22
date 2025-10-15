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
 * 本地 WebSocket 实例封装实用类。
 *
 * 本类提供存取本地WebSocket通信对象引用的方便方法，封装了WebSocket有效性判断以及异常处理等，以便确
 * 保调用者通过方法 {@link #getLocalSocket()}拿到的Socket对象是健康有效的。
 *
 * 依据作者对MobileIMSDK API的设计理念，本类将以单例的形式提供给调用者使用。
 *
 * @author Jack Jiang(http://www.52im.net/thread-2792-1-1.html)
 */
const MBSocketProvider = (function () {

    const TAG = "MBSocketProvider";

    // 构造器（相当于java里的构造方法）
    let ModuleMBSocketProvider = function (argument) {

        /* 本地WebSocket对象引用 */
        this.localSocket = null;

        /*
         * 连接完成后将被通知的观察者。如果设置本参数，则将在连接完成后调用1次，调用完成后置null。
         * <p>
         * 设置本观察者的目的，是因为WebSocket连接的过程是异常完成，有时希望在连接完成时就能立即执行想
         * 要的逻辑，那么设置本观察者即可（在某次连接最终完成前，本参数的设置都会覆盖之前的设置，因为
         * 只有这一个观察者可以用哦）。
         */
        this.connectionDoneCallback = null;
    };

    /**
     * 设置连接完成后将被通知的回调函数。如果设置本参数，则将在连接完成后调用1次，调用完成后置null。
     * <p>
     * 设置本回调函数的目的，是因为WebSocket连接的过程是异常完成，有时希望在连接完成时就能立即执行想
     * 要的逻辑，那么设置本观察者即可（在某次连接最终完成前，本参数的设置都会覆盖之前的设置，因为
     * 只有这一个观察者可以用哦）。
     *
     * @param connectionDoneCallback 回调函数
     */
    ModuleMBSocketProvider.prototype.setConnectionDoneCallback = function(connectionDoneCallback) {
        this.connectionDoneCallback = connectionDoneCallback;
    };

    /**
     * 重置并新建一个全新的WebSocket对象。
     *
     * @return {WebSocket} 新建的全新Socket对象引用
     */
    ModuleMBSocketProvider.prototype.resetLocalSocket = function() {
        try {
            // 无条件关闭socket（如果它还存在的话）
            this.closeLocalSocket(true);
            // 连接服务器
            this.tryConnectToHost();
            // 返回新建立的连接对象引用
            return this.localSocket;
        } catch (e) {
            MBUtils.mblog_w(TAG, "重置localSocket时出错，原因是："+e);

            // 无条件关闭socket（如果它还存在的话）
            this.closeLocalSocket(true);

            return null;
        }
    };

    /**
     * 尝试发起连接并获取WebSocket。
     *
     * @return boolean
     */
    ModuleMBSocketProvider.prototype.tryConnectToHost = function () {
        if(MBCore.debugEnabled())
            MBUtils.mblog_d(TAG, "tryConnectToHost并获取connection开始了...");

        var done = false;
        var that = this;

        // 标准HTML5的WebSocket API文档请见：
        // https://developer.mozilla.org/zh-CN/docs/Web/API/WebSocket
        try {
            if (!window.WebSocket) {
                window.WebSocket = window.MozWebSocket;
            }

            if (window.WebSocket) {
                this.localSocket = new WebSocket(MBCore.getWebsocketUrl());// "ws://192.168.99.190:7080/websocket"

                //## WebSocket的HTML5标准API连接建立时的回调处理
                this.localSocket.onopen = function(event) {
                    if(MBCore.debugEnabled()) {
                        MBUtils.mblog_d(TAG, "WS.onopen - 连接已成功建立！(isLocalSocketReady="+ that.isLocalSocketReady() + ")");
                    }

                    // 连接结果回调通知
                    if(that.connectionDoneCallback) {
                        that.connectionDoneCallback(true);

                        // 调用完成马上置空，确保本观察者只被调用一次
                        that.connectionDoneCallback = null;
                    }
                };

                //## WebSocket的HTML5标准API连接关闭时的回调处理
                this.localSocket.onclose = function(evt) {
                    if(MBCore.debugEnabled()) {
                        MBUtils.mblog_d(TAG, "WS.onclose - 连接已断开。。。。(isLocalSocketReady=" + that.isLocalSocketReady()
                            + ", MBClientCoreSDK.connectedToServer=" + MBCore.isConnectedToServer() + ")", evt);
                    }

                    // 用于快速响应连接断开事件，第一时间反馈给上层，提升用户体验
                    if(MBCore.isConnectedToServer()) {
                        if(MBCore.debugEnabled)
                            MBUtils.mblog_d(TAG, "WS.onclose - 连接已断开，立即提前进入框架的“通信通道”断开处理逻辑(而不是等心跳线程探测到，那就已经比较迟了)......");

                        // 进入框架的“通信通道”断开处理逻辑（即断开回调通知）
                        MBKeepAliveDaemon.notifyConnectionLost();
                    }
                };

                //## WebSocket的HTML5标准API发生错误时的回调处理
                this.localSocket.onerror = function(evt) {
                    // if(MBClientCoreSDK.debugEnabled())
                        MBUtils.mblog_e(TAG, "WS.onerror - 异常被触发了，原因是：", evt);

                    // if(that.localSocket)
                    //     that.localSocket.close();
                    that.closeLocalSocket(true);
                };

                //## WebSocket的HTML5标准API收到数据时的回调处理
                this.localSocket.onmessage = function(event) {
                    let protocalJsonStr = (event ? (event.data ? event.data : null) : null);

                    if(MBCore.debugEnabled())
                        MBUtils.mblog_d(TAG, "WS.onmessage - 收到消息(原始内容)："+protocalJsonStr);

                    // 读取收到的数据 Protocal 对象
                    let pFromServer = (protocalJsonStr ? JSON.parse(protocalJsonStr) : null);

                    // 进入消息调度和处理逻辑
                    MBDataReciever.handleProtocal(pFromServer);
                };

                done = true;
            } else {
                MBUtils.mblog_w(TAG, "Your browser does not support Web Socket.");
            }
        }
        catch (e) {
            MBUtils.mblog_w(TAG, "连接Server("+this._websocketUrl+")失败：", e);
        }

        return done;
    };

    /**
     * 本类中的WebSocket对象是否是健康的。
     *
     * @return {boolean} true表示是健康的，否则不是
     */
    ModuleMBSocketProvider.prototype.isLocalSocketReady = function() {
        // 有关WebSocket的readyState状态说明，请见：
        // https://developer.mozilla.org/zh-CN/docs/Web/API/WebSocket/readyState
        return this.localSocket != null && this.localSocket.readyState === 1;
    };

    /**
     * 获得本地WebSocket的实例引用.
     * <p>
     * 本方法内封装了WebSocket有效性判断以及异常处理等，以便确保调用者通过本方法拿到的WebSocket对象是健康有效的。
     *
     * @return {WebSocket} 如果该实例正常则返回它的引用，否则返回null
     * @see #isLocalSocketReady()
     * @see #resetLocalSocket()
     */
    ModuleMBSocketProvider.prototype.getLocalSocket = function() {
        if(this.isLocalSocketReady()) {
            // // TODO: 注释掉log！
            // if(MBCore.debugEnabled())
            //     MBUtils.mblog_d(TAG, "isLocalSocketReady()==true，直接返回本地socket引用哦。");
            return this.localSocket;
        }
        else {
            // // TODO: 注释掉log！
            // if(MBCore.debugEnabled())
            //     MBUtils.mblog_d(TAG, "isLocalSocketReady()==false，需要先resetLocalSocket()...");
            return this.resetLocalSocket();
        }
    };

    /**
     * 强制关闭本地WebSocket。
     * 一旦调用本方法后，再次调用{@link #getLocalSocket()}将会返回一个全新的WebSocket对象引用。
     *
     * 本方法通常在两个场景下被调用：
     * 1) 真正需要关闭WebSocket时（如所在的浏览器退出时）；
     * 2) 当调用者检测到网络发生变动后希望重置以便获得健康的WebSocket引用对象时。
     *
     * @param {boolean} silentClose true表示close前会清掉为此socket实例设置的各种回调，确保close时不会触发这些回调（比如：在
     * 掉线重连场景下，close掉前一个旧的失效socket就不会错误地触发这些回调，而且还因为close是异步的，从而会引发一系列不可预测的行为）。
     */
    ModuleMBSocketProvider.prototype.closeLocalSocket= function(silentClose) {
        let silentCloseTag = (silentClose?"silentClose="+silentClose:"silentClose=false");

        if(MBCore.debugEnabled())
            MBUtils.mblog_d(TAG, "正在closeLocalSocket("+silentCloseTag+")...");

        let that = this;
        let thatSocket = this.localSocket;
        if(this.localSocket) {
            try {
                // close前会清掉为此socket实例设置的各种回调，确保close时不会触发这些回调（比如：在掉线重连场景下，close
                // 掉前一个旧的失效socket就不会错误地触发这些回调，而且还因为close是异步的，从而会引发一系列不可预测的行为）
                if(silentClose) {
                    thatSocket.onerror = null;
                    thatSocket.onclose = null;
                    thatSocket.onopen = null;
                    thatSocket.onmessage = null;

                    if (MBCore.debugEnabled())
                        MBUtils.mblog_d(this.TAG, "closeLocalSocket("+silentCloseTag+")时，清理socket上的回调函数完成.");
                }

                // 真正开始关闭socket了
                thatSocket.close();
                // 确保本次清理的socket实例是本方法初始时的那个实例（排除因异步等原因this.localSocket被重新设置后又在此被错误地置空，那就坑爹了）
                if(Object.is(thatSocket, this.localSocket)) {
                    this.localSocket = null;
                }
            }
            catch ( e){
                MBUtils.mblog_w(TAG, "在closeLocalSocket方法中试图释放localSocket资源时：", e);
            }
        }
        else {
            MBUtils.mblog_d(TAG, "Socket处于未初化状态（可能是您还未登陆），无需关闭。");
        }
    };

    // 实例化此类
    return new ModuleMBSocketProvider();
})();