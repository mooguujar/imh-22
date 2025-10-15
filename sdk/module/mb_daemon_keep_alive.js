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
 * 用于保持与服务端通信活性的Keep alive定时器。
 *
 * Keep alive的目的有2个：
 *
 * 1、防止NAT路由算法导致的端口老化：
 * 路由器的NAT路由算法存在所谓的“端口老化”概念，请参见文章：http://www.52im.net/thread-209-1-1.html。
 *
 * 2、即时探测由于网络状态的变动而导致的通信中断（进而自动触发自动治愈机制）：
 * 此种情况可的原因有（但不限于）：无线网络信号不稳定、WiFi与2G/3G/4G等同开情况下的网络切换、网络连接正常但宽带欠
 * 费被停机、手机系统的省电策略等。
 *
 * 注意：本线程的启停，目前属于MobileIMSDK框架H5客户端算法的一部分，暂时无需也不建议由应用层自行调用。
 *
 * @author Jack Jiang(http://www.52im.net/thread-2792-1-1.html)
 */
const MBKeepAliveDaemon = (function () {

    const TAG = "MBKeepAliveDaemon";

    // 构造器（相当于java里的构造方法）
    let ModuleMBKeepAliveDaemon = function (argument) {

        // 保存setInverval(...)定时器id（此id方便用于关闭定时器时使用）
        this.intervalId = 0;

        /*
         * Keep Alive 心跳发送时间间隔（单位：毫秒），默认5000毫秒（即5秒）.
         * <p>
         * 心跳间隔越短则保持会话活性的健康度更佳，但将使得在大量客户端连接情况下服务端因此而增加负载，
         * 且手机将消耗更多电量和流量，所以此间隔需要权衡（建议为：>=3秒 且 <270秒(即4分半钟)）！
         * <p>
         * 说明：此参数用于设定客户端发送到服务端的心跳间隔，心跳包的作用是用来保持与服务端的会话活性（
         * 更准确的说是为了避免客户端因路由器的NAT算法而导致路由器端口老化，相关知识见此文：http://www.52im.net/thread-281-1-1.html）.
         * <p>
         * 参定此参数的同时，也需要相应设置服务端的ServerLauncher.SESION_RECYCLER_EXPIRE参数。
         */
        this.KEEP_ALIVE_INTERVAL = 5000;

        /*
         * 收到服务端响应心跳包的超时间时间（单位：毫秒），默认（5 * 1000 + 3000）＝ 8000 毫秒（即8秒）.
         * <p>
         * 超过这个时间客户端将判定与服务端的网络连接已断开（此间隔建议为(KEEP_ALIVE_INTERVAL * 1) + 3 秒），
         * 没有上限，但不可太长，否则将不能即时反映出与服务器端的连接断开（比如掉掉线时），请从
         * 能忍受的反应时长和即时性上做出权衡。
         * <p>
         * 本参数除与{@link MBKeepAliveDaemon#KEEP_ALIVE_INTERVAL}有关联外，不受其它设置影响。
         */
        this.NETWORK_CONNECTION_TIME_OUT = this.KEEP_ALIVE_INTERVAL + 3000;// + 5000;

        /* 记录最近一次服务端的心跳响应包时间 */
        this.lastGetKeepAliveResponseFromServerTimstamp = 0;

        /* 网络断开事件观察者 */
        this.networkConnectionLostCallback = null;

        /* 心跳包发送定时器的本次执行是否还未完成（具体指的是一次完整的心跳发送逻辑的执行） */
        this.keepAliveTaskExcuting = false;
        /* 心跳包发送定时器是否停止整个定时心跳循环 */
        this.keepAliveWillStop = false;
    };

    /**
     * 执行业务逻辑（此函数由框架内部调用，开发者无需使用）。
     *
     * @see #doKeepAlive()
     * @see #onKeepAlive()
     */
    ModuleMBKeepAliveDaemon.prototype.excute = function(){
        if(!this.keepAliveTaskExcuting) {
            this.keepAliveWillStop = false;
            this.onKeepAlive(this.doKeepAlive());
        }
    };

    /**
     * 发送心跳指令（此函数由框架内部调用，开发者无需使用）。
     *
     * @return {int} 返回指令发送结果码
     */
    ModuleMBKeepAliveDaemon.prototype.doKeepAlive = function() {
        this.keepAliveTaskExcuting = true;
        if(MBCore.debugEnabled())
            MBUtils.mblog_d(TAG, "心跳线程执行中...");
        return MBDataSender.sendKeepAlive();
    };

    /**
     * 心跳指令发送完成后的回调处理（此函数由框架内部调用，开发者无需使用）。
     *
     * @param code {int} 前一步的指令发送结果码
     */
    ModuleMBKeepAliveDaemon.prototype.onKeepAlive = function(code) {
        // 给应用层发出ping事件通知
        MBCore.emit(MBSocketEvent.SOCKET_EVENT_PING, null);

        // 首先执行Keep Alive心跳包时，把此时的时间作为第1次收到服务响应的时间（初始化）
        let isInitialedForKeepAlive = (this.lastGetKeepAliveResponseFromServerTimstamp === 0);
        //## 解决极端情况下网络断开时，无法进入下面的"断开"通知流程
        if(isInitialedForKeepAlive)
            this.lastGetKeepAliveResponseFromServerTimstamp = MBUtils.getCurrentUTCTimestamp();

        // 首先启动心跳时就不判断了，否则就是逻辑有问题
        if(!isInitialedForKeepAlive) {
            let now = MBUtils.getCurrentUTCTimestamp();

            // 当当前时间与最近一次服务端的心跳响应包时间间隔>= 10秒就判定当前与服务端的网络连接已断开
            if(now - this.lastGetKeepAliveResponseFromServerTimstamp >= this.NETWORK_CONNECTION_TIME_OUT) {
                if(MBCore.debugEnabled()) {
                    MBUtils.mblog_d(TAG, ">>>> t1=" + now + ", t2=" + this.lastGetKeepAliveResponseFromServerTimstamp
                        + " -> 差：" + (now - this.lastGetKeepAliveResponseFromServerTimstamp));
                    MBUtils.mblog_d(TAG, "心跳机制已判定网络断开，将进入断网通知和重连处理逻辑 ...");
                }

                this.notifyConnectionLost();
                this.keepAliveWillStop = true;
            }
        }

        this.keepAliveTaskExcuting = false;
        if(this.keepAliveWillStop) {
            // 停止心跳循环
            this.stop();
        }
    };

    /**
     * 心跳线程算法已判定需要与服务器的“通信通道”断开，调用此方法将进入框架的“通信通道”断开处理逻辑。
     *
     * 注意：本方法，目前属于MobileIMSDK框架算法的一部分，暂时无需也不建议由应用层开发者自行调用。
     */
    ModuleMBKeepAliveDaemon.prototype.notifyConnectionLost = function() {
        // 先停止心跳线程
        this.stop();
        // 再通知“网络连接已断开”
        if(this.networkConnectionLostCallback != null)
            this.networkConnectionLostCallback(null, null);
    };

    /**
     * 启动线程。
     *
     * 无论本方法调用前线程是否已经在运行中，都会尝试首先调用 {@link #stop()}方法，以便确保线程被启动前是真正处
     * 于停止状态，这也意味着可无害调用本方法。
     *
     * 注意：本线程的启停，目前属于MobileIMSDK算法的一部分，暂时无需也不建议由应用层自行调用。
     *
     * @param immediately {boolean} true表示立即执行线程作业，否则直到 {@link #KEEP_ALIVE_INTERVAL}执行间隔的到来才
     *                    进行首次作业的执行。
     */
    ModuleMBKeepAliveDaemon.prototype.start = function(immediately) {
        this.stop();

        // 立即执行1次
        if(immediately){
            this.excute();
        }

        let that = this;
        // 定时执行
        this.intervalId = setInterval(function () {
            that.excute();
        }, this.KEEP_ALIVE_INTERVAL);
    };

    /**
     * 无条件中断本线程的运行。
     *
     * 注意：本线程的启停，目前属于MobileIMSDK算法的一部分，暂时无需也不建议由应用层自行调用。
     */
    ModuleMBKeepAliveDaemon.prototype.stop = function() {
        if(this.intervalId && this.intervalId !== 0) {
            clearInterval(this.intervalId);
        }
        this.lastGetKeepAliveResponseFromServerTimstamp = 0;
    };

    /**
     * 收到服务端反馈的心跳包时调用此方法：作用是更新服务端最后的响应时间戳.
     *
     * 注意：本方法的调用，目前属于MobileIMSDK算法的一部分，暂时无需也不建议由应用层自行调用。
     */
    ModuleMBKeepAliveDaemon.prototype.updateGetKeepAliveResponseFromServerTimstamp = function() {
        this.lastGetKeepAliveResponseFromServerTimstamp = MBUtils.getCurrentUTCTimestamp();
    };

    /**
     * 设置网络断开事件观察者.
     *
     * 注意：本方法的调用，目前属于MobileIMSDK算法的一部分，暂时无需也不建议由应用层自行调用。
     *
     * @param networkConnectionLostCallback {function} 回调函数
     */
    ModuleMBKeepAliveDaemon.prototype.setNetworkConnectionLostCallback = function(networkConnectionLostCallback) {
        this.networkConnectionLostCallback = networkConnectionLostCallback;
    };

    /**
     * 设置MobileIMSDK即时通讯核心框架预设的敏感度模式（默认为 {@link MBSenseMode#MODE_15S} ）。
     * <p>
     * 请在登陆前调用，否则将不起效.
     * <p>
     * <b>重要说明：</b><u>客户端本模式的设定必须要与服务端的模式设制保持一致</u>，否则可能因参数的不一致而导致
     * IM算法的不匹配，进而出现不可预知的问题。
     *
     * @param senseMode {int} 常量定义详见{@link MBSenseMode}
     */
    ModuleMBKeepAliveDaemon.prototype.setSenseMode = function(senseMode) {
        let keepAliveInterval = 0;
        let networkConnectionTimeout = 0;
        switch(senseMode) {
            case MBSenseMode.MODE_3S: {
                // 心跳间隔3秒
                keepAliveInterval = 3000;// 3s
                // 5秒后未收到服务端心跳反馈即认为连接已断开（相当于连续1个心跳间隔+2秒链路延迟容忍时间后仍未收到服务端反馈）
                networkConnectionTimeout = keepAliveInterval * 1 + 2000;// 5s
                break;
            }
            case MBSenseMode.MODE_5S: {
                // 心跳间隔5秒
                keepAliveInterval = 5000;// 5s
                // 8秒后未收到服务端心跳反馈即认为连接已断开（相当于连续1个心跳间隔+3秒链路延迟容忍时间后仍未收到服务端反馈）
                networkConnectionTimeout = keepAliveInterval * 1 + 3000;// 8s
                break;
            }
            case MBSenseMode.MODE_10S: {
                // 心跳间隔10秒
                keepAliveInterval = 10000;// 10s
                // 15秒后未收到服务端心跳反馈即认为连接已断开（相当于连续1个心跳间隔+5秒链路延迟容忍时间后)后仍未收到服务端反馈）
                networkConnectionTimeout = keepAliveInterval * 1 + 5000;// 15s
                break;
            }
            case MBSenseMode.MODE_15S: {
                // 心跳间隔15秒
                keepAliveInterval = 15000;// 15s
                // 20秒后未收到服务端心跳反馈即认为连接已断开（相当于连续1个心跳间隔+5秒链路延迟容忍时间后)后仍未收到服务端反馈）
                networkConnectionTimeout = keepAliveInterval * 1 + 5000;// 20s
                break;
            }
            case MBSenseMode.MODE_30S: {
                // 心跳间隔30秒
                keepAliveInterval = 30000;// 30s
                // 35秒后未收到服务端心跳反馈即认为连接已断开（相当于连续1个心跳间隔+5秒链路延迟容忍时间后)后仍未收到服务端反馈）
                networkConnectionTimeout = keepAliveInterval * 1 + 5000;// 35s
                break;
            }
            case MBSenseMode.MODE_60S: {
                // 心跳间隔60秒
                keepAliveInterval = 60000;// 60s
                // 65秒后未收到服务端心跳反馈即认为连接已断开（相当于连续1个心跳间隔+5秒链路延迟容忍时间后)后仍未收到服务端反馈）
                networkConnectionTimeout = keepAliveInterval * 1 + 5000;// 65s
                break;
            }
            case MBSenseMode.MODE_120S: {
                // 心跳间隔120秒
                keepAliveInterval = 120000;// 120s
                // 125秒后未收到服务端心跳反馈即认为连接已断开（相当于连续1个心跳间隔+5秒链路延迟容忍时间后)后仍未收到服务端反馈）
                networkConnectionTimeout = keepAliveInterval * 1 + 5000;// 125s
                break;
            }
        }

        if(keepAliveInterval > 0) {
            // 设置Kepp alive心跳间隔
            this.KEEP_ALIVE_INTERVAL = keepAliveInterval;
        }

        if(networkConnectionTimeout > 0) {
            // 设置与服务端掉线的超时时长
            this.NETWORK_CONNECTION_TIME_OUT = networkConnectionTimeout;
        }
    };

    // 实例化此类
    return new ModuleMBKeepAliveDaemon();
})();
