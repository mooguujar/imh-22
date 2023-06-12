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
/*
 * Copyright (C) 2021  即时通讯网(52im.net) & Jack Jiang.
 * The MobileIMSDK-Web Project. All rights reserved.
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
 * QoS机制中提供对已收到包进行有限生命周期存储并提供重复性判断的定时器。
 *
 * 【原理是】：当收到需QoS机制支持消息包时，会把它的唯一特征码（即指纹id）存放于本类的“已收到”消息队列中，寿命约为
 *  {@link #MESSAGES_VALID_TIME}指明的时间，每当{@link #CHECH_INTERVAL}定时检查间隔到来时会对其存活期进行检查，
 *  超期将被移除，否则允许其继续存活。理论情况下，一个包的最大寿命不可能超过2倍的 {@link #CHECH_INTERVAL}时长。
 *
 * 【补充说明】：“超期”即意味着对方要么已收到应答包（这是QoS机制正常情况下的表现）而无需再次重传、要么是
 * 已经达到QoS机制的重试极限而无可能再收到重复包（那么在本类列表中该表也就没有必要再记录了）。总之，“超期”是队列中
 * 这些消息包的正常生命周期的终止，无需过多解读。
 *
 * 【本类存在的意义在于】：极端情况下QoS机制中存在因网络丢包导致应答包的丢失而触发重传机制从而导致消息重复，而本
 * 类将维护一个有限时间段内收到的所有需要QoS支持的消息的指纹列表且提供“重复性”判断机制，从而保证应用层绝不会因为QoS
 * 的重传机制而导致重复收到消息的情况。
 *
 * 当前MobileIMSDK的QoS机制支持全部的C2C、C2S、S2C共3种消息交互场景下的消息送达质量保证.
 *
 * 【注意】：本线程的启停，目前属于MobileIMSDK算法的一部分，暂时无需也不建议由应用层自行调用。
 *
 * @author Jack Jiang(http://www.52im.net/thread-2792-1-1.html)
 */
const MBQoS4ReciveDaemon = (function () {

    const TAG = "MBQoS4ReciveDaemon";

    // 构造器（相当于java里的构造方法）
    let ModuleMBQoS4ReciveDaemon = function (argument) {

        // 保存setInverval(...)定时器id（此id方便用于关闭定时时使用）
        this.intervalId = 0;

        /* 检查线程执行间隔（单位：毫秒），默认5分钟 */
        this.CHECH_INTERVAL = 5 * 60 * 1000; // 5分钟

        /* 一个消息放到在列表中（用于判定重复时使用）的生存时长（单位：毫秒），默认10分钟 */
        this.MESSAGES_VALID_TIME = 10 * 60 * 1000;// 10分钟

        /*
         * 时间间隔内接收到的需要QoS质量保证的消息指纹特征列表.
         *
         * key=消息包指纹码(String)，value=最近1次收到该包的时间戳（时间戳用于判定该包是否
         * 已失效时有用，收到重复包时用最近一次收到时间更新时间戳从而最大限度保证不重复） */
        this.recievedMessages = new MBHashMap();

        /* 本次执行是否还未完成（内部变量，开发者无需理会） */
        this._excuting = false;
    };

    /**
     * 执行业务逻辑（此函数由框架内部调用，开发者无需使用）。
     */
    ModuleMBQoS4ReciveDaemon.prototype.excute = function(){
        // 极端情况下本次循环内可能执行时间超过了时间间隔，此处是防止在前一
        // 次还没有运行完的情况下又重复过劲行，从而出现无法预知的错误
        if(!this._excuting) {
            this._excuting = true;

            if(IMSDK._debugEnable)
                // MBUtils.mblog_d(TAG, "【QoS接收方】+++++ START 暂存处理线程正在运行中，当前长度"+this.recievedMessages.size()+".");

            // TODO: 最终代码时要删除掉！！！！
            console.debug('___________________________AAAAAAAAA');
            this.recievedMessages.showAll();
            console.debug('___________________________BBBBBBBBBB');

            var arr = this.recievedMessages.keySet();
            // 特别注意：遍历数组时如使用for in语法，则取出的实际是数组单元索引（0、1、2、3这种）
            //          ，而非数组单元值，网上诸如“for (var key in this.recievedMessages.keySet()) ”
            //          是错误的，因为此处的key是数组索引，并非数组单元的value！切记！
            for (var i = 0; i < arr.length; i++) {
                var key = arr[i];
                var recievedTime = this.recievedMessages.get(key);

                var delta = MBUtils.getCurrentUTCTimestamp() - (recievedTime ? recievedTime : 0);

                // TODO: 最终代码时要删除掉！！！！
                console.debug('___________________________cccccccc，key='+key+', recievedTime='+recievedTime+',  getCurrentUTCTimestamp()='+ MBUtils.getCurrentUTCTimestamp()+', delta='+delta);

                // 该消息包超过了生命时长，去掉之
                if(delta >= this.MESSAGES_VALID_TIME) {
                    if(IMSDK._debugEnable)
                        MBUtils.mblog_d(TAG, "【QoS接收方】指纹为"+key+"的包已生存"+delta +"ms(最大允许"+this.MESSAGES_VALID_TIME+"ms), 马上将删除之.");
                    this.recievedMessages.remove(key);
                }
            }
        }

        if(IMSDK._debugEnable)
            // MBUtils.mblog_d(TAG, "【QoS接收方】+++++ END 暂存处理线程正在运行中，当前长度"+this.recievedMessages.size()+".");

        this._excuting = false;
    };

    /**
     * 启动线程。
     * <p>
     * 无论本方法调用前线程是否已经在运行中，都会尝试首先调用 {@link #stop()}方法，以便确保线程被启动前是真正处
     * 于停止状态，这也意味着可无害调用本方法。
     * <p>
     * <b>本线程的启停，目前属于MobileIMSDK算法的一部分，暂时无需也不建议由应用层自行调用。</b>
     *
     * @param immediately {boolean} true表示立即执行线程作业，否则直到 {@link #CHECH_INTERVAL}执行间隔的到来才进行首次作业的执行
     */
    ModuleMBQoS4ReciveDaemon.prototype.startup = function(immediately) {
        this.stop();

        // ** 如果列表不为空则尝试重置生成起始时间
        // 当重启时列表可能是不为空的（此场景目前出现在掉线后重新恢复时），那么为了防止在网络状况不好的情况下，登
        // 陆能很快恢复时对方可能存在的重传，此时也能一定程序避免消息重复的可能
        if(this.recievedMessages != null && this.recievedMessages.size() > 0) {
            var arr = this.recievedMessages.keySet();
            for (var i = 0; i < arr.length; i++) {
                var key = arr[i];
                // 重置列表中的生存起始时间
                this.putImpl(key);
            }
        }

        // 立即执行1次
        if(immediately){
            this.excute();
        }

        let that = this;
        // 定时执行
        this.intervalId = setInterval(function () {
            that.excute();
        }, this.CHECH_INTERVAL);

        // handler.postDelayed(runnable, immediately ? 0 : CHECH_INTERVAL);
        // running = true;
    };

    /**
     * 无条件中断本线程的运行。
     * <p>
     * <b>本线程的启停，目前属于MobileIMSDK算法的一部分，暂时无需也不建议由应用层自行调用。</b>
     */
    ModuleMBQoS4ReciveDaemon.prototype.stop = function() {
        if(this.intervalId && this.intervalId !== 0)
            clearInterval(this.intervalId);
    };

    /**
     * 向列表中加入一个包的特征指纹。
     * <br>注意：本方法只会将指纹码推入，而不是将整个Protocal对象放入列表中。
     * <p>
     * <b>本方法的调用，目前属于MobileIMSDK算法的一部分，暂时无需也不建议由应用层自行调用。</b>
     *
     * @param p {Protocal} Protocal对象
     */
    ModuleMBQoS4ReciveDaemon.prototype.addRecievedProtocal = function(p) {
        if(p && p.QoS)
            this.addRecieved(p.fp);
    };

    /**
     * 向列表中加入一个包的特征指纹。
     * <p>
     * <b>本方法的调用，目前属于MobileIMSDK算法的一部分，暂时无需也不建议由应用层自行调用。</b>
     *
     * @param fingerPrintOfProtocal {String} 消息包的特纹特征码（理论上是唯一的）
     */
    ModuleMBQoS4ReciveDaemon.prototype.addRecieved = function(fingerPrintOfProtocal) {
        if(fingerPrintOfProtocal) {
            if (this.recievedMessages.contains(fingerPrintOfProtocal))
                MBUtils.mblog_w(TAG, "【QoS接收方】指纹为" + fingerPrintOfProtocal
                    + "的消息已经存在于接收列表中，该消息重复了（原理可能是对方因未收到应答包而错误重传导致），更新收到时间戳哦.");

            // 无条件放入已收到列表（如果已存在则覆盖之，已在存则意味着消息重复被接收，那么就用最新的时间戳更新之）
            this.putImpl(fingerPrintOfProtocal);
        }
        else{
            MBUtils.mblog_w(TAG, "无效的 fingerPrintOfProtocal==null!");
        }
    };

    ModuleMBQoS4ReciveDaemon.prototype.putImpl = function(fingerPrintOfProtocal) {
        if(fingerPrintOfProtocal)
            this.recievedMessages.put(fingerPrintOfProtocal, MBUtils.getCurrentUTCTimestamp());
    };

    /**
     * 指定指纹码的Protocal是否已经收到过.
     * <p>
     * 此方法用于QoS机制中在防止因网络丢包导致对方未收到应答时而再次发送消息从而导致消息重复时的判断依赖.
     *
     * @param fingerPrintOfProtocal {String} 消息包的特纹特征码（理论上是唯一的）
     * @return {boolean} true表示是，否则不是
     */
    ModuleMBQoS4ReciveDaemon.prototype.hasRecieved = function(fingerPrintOfProtocal) {
        return this.recievedMessages.contains(fingerPrintOfProtocal);
    };

    /**
     * 清空缓存队列。
     * <p>
     * 调用此方法可以防止在客户端不退出的情况下退出登陆MobileIMSDK时没有清除队列缓存，导致此时换用另一账号时发生数
     * 据交叉。
     */
    ModuleMBQoS4ReciveDaemon.prototype.clear = function() {
        this.recievedMessages.clear();
    };

    /**
     * 当前“已收到消息”队列列表的大小.
     *
     * @return {int} 列表大小
     */
    ModuleMBQoS4ReciveDaemon.prototype.size = function(){
        return this.recievedMessages.size();
    };

    /**
     * 设置检查线程执行间隔（默认5分钟）。
     *
     * @param interval {int} 执行间隔时间（单位：毫秒）
     */
    ModuleMBQoS4ReciveDaemon.prototype.setCheckInterval = function(interval){
        this.CHECH_INTERVAL = interval;
    };

    /**
     * 设置消息的生存时长（默认10分钟）。
     *
     * @param time 生存时长（单位：毫秒）
     */
    ModuleMBQoS4ReciveDaemon.prototype.setMessageValidTime = function(time){
        this.MESSAGES_VALID_TIME = time;
    };

    // 实例化此类
    return new ModuleMBQoS4ReciveDaemon();
})();