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
 * 与服务端通信中断后的自动登陆（重连）独立定时器。
 *
 * 鉴于无线网络的不可靠性和特殊性，移动端的即时通讯经常存在网络通信断断续续的状况，可能的原因有（但不限于）：无线网
 * 络信号不稳定、WiFi与2G/3G/4G等同开情况下的网络切换、手机系统的省电策略等。这就使得即时通信框架拥有对上层透明且
 * 健壮的健康度探测和自动治愈机制非常有必要。
 *
 * 本类的存在使得MobileIMSDK框架H5客户端拥有通信自动治愈的能力。
 *
 * 提示：自动登陆（重连）只可能发生在登陆成功后与服务端的网络通信断开时。
 *
 * 注意：本线程的启停，目前属于MobileIMSDK框架H5客户端算法的一部分，暂时无需也不建议由应用层自行调用。
 *
 * @author Jack Jiang(http://www.52im.net/thread-2792-1-1.html)
 */
const MBAutoReLoginDaemon = (function () {

    const TAG = "MBAutoReLoginDaemon";

    // 构造器（相当于java里的构造方法）
    let ModuleMBAutoReLoginDaemon = function (argument) {

        // 保存setInverval(...)定时器id（此id方便用于关闭定时器时使用）
        this.intervalId = 0;

        /*
         * 自动重新登陆时间间隔（单位：毫秒），默认3000毫秒。
         * <p>
         * 此参数只会影响断线后与服务器连接的即时性，不受任何配置参数的影响。请基于重连（重登陆）即时性和手机能耗上作
         * 出权衡。
         * <p>
         * 除非对MobileIMSDK的整个即时通讯算法非常了解，否则请勿尝试单独设置本参数。如需调整心跳频率请见
         * mb_daemon_keep_alive.js文件中的 {@link MBKeepAliveDaemon#setSenseMode()} 函数。
         */
        this.AUTO_RE$LOGIN_INTERVAL = 3000;//2000;

        /* 本次执行是否还未完成（内部变量，开发者无需理会） */
        this._excuting = false;
    };

    /**
     * 设置自动重新登陆时间间隔。
     *
     * @param interval {int} 时间间隔（单位：毫秒）
     */
    ModuleMBAutoReLoginDaemon.prototype.setAutoReloginInterval = function (interval) {
        if(MBUtils.isPositiveInteger(interval))
            this.AUTO_RE$LOGIN_INTERVAL = interval;
        else
            MBUtils.mblog_w(TAG, "无效的AUTO_RE$LOGIN_INTERVAL参数设置："+interval);
    };

    /**
     * 执行业务逻辑（此函数由框架内部调用，开发者无需使用）。
     *
     * @see #doSendLogin()
     * @see #onSendLogin()
     */
    ModuleMBAutoReLoginDaemon.prototype.excute = function(){
        if(!this._excuting)
            this.onSendLogin(this.doSendLogin());
    };

    /**
     * 发送登陆指令（此函数由框架内部调用，开发者无需使用）。
     *
     * @return {int} 返回指令发送结果码（见 {@link MBErrorCode} 对象中的常量定义）
     */
    ModuleMBAutoReLoginDaemon.prototype.doSendLogin = function() {
        this._excuting = true;

        if(MBCore.debugEnabled())
            MBUtils.mblog_d(TAG, "自动重新登陆线程执行中, autoReLogin ? "+MBCore.autoReLogin+"...");

        let code = -1;
        // 是否允许自动重新登陆哦
        if(MBCore.isAutoRelogin()) {
            code = MBDataSender.sendLogin(MBCore.getCurrentLoginInfo());
        }
        return code;
    };

    /**
     * 登陆指令发出后的回调处理（此函数由框架内部调用，开发者无需使用）。
     *
     * @param {int} code 前一步的指令发送结果码
     * @see #doSendLogin()
     */
    ModuleMBAutoReLoginDaemon.prototype.onSendLogin = function(code) {
        // 给应用层发出尝试重新登陆/连接事件通知
        MBCore.emit(MBSocketEvent.SOCKET_EVENT_RECONNECT_ATTEMPT, code);

        if(code === 0) {
            // do nothing
        }

        this._excuting = false;
    };

    /**
     * 启动自动登陆。
     * <p>
     * 无论本方法调用前线程是否已经在运行中，都会尝试首先调用 {@link #stop()}方法，以便确保线程被启动前是真正处
     * 于停止状态，这也意味着可无害调用本方法。
     * <p>
     * <b>本线程的启停，目前属于MobileIMSDK算法的一部分，暂时无需也不建议由应用层自行调用。</b>
     *
     * @param {boolean} immediately true表示立即执行线程作业，否则直到 {@link #AUTO_RE$LOGIN_INTERVAL}
     * 执行间隔的到来才进行首次作业的执行
     */
    ModuleMBAutoReLoginDaemon.prototype.start = function(immediately) {
        this.stop();

        // 立即执行1次
        if(immediately){
            this.excute();
        }

        let that = this;
        // 定时执行
        this.intervalId = setInterval(function () {
            that.excute();
        }, this.AUTO_RE$LOGIN_INTERVAL);
    };

    /**
     * 无条件中断本线程的运行。
     * <p>
     * <b>本线程的启停，目前属于MobileIMSDK算法的一部分，暂时无需也不建议由应用层自行调用。</b>
     */
    ModuleMBAutoReLoginDaemon.prototype.stop = function () {
        if(this.intervalId && this.intervalId !== 0)
            clearInterval(this.intervalId);
    };

    // 实例化此类
    return new ModuleMBAutoReLoginDaemon();
})();