/**
 * QoS机制中提供消息送达质量保证的定时器实现类。
 * 开发者提供两种结果：要么明确被送达（即收到ACK应答包，见
 *  {@link net.x52im.mobileimsdk.android.event.MessageQoSEvent#messagesBeReceived(String)}）、要行明确
 *  未被送达（见{@link net.x52im.mobileimsdk.android.event.MessageQoSEvent#messagesLost(ArrayList)}）
 */
const MBQoS4SendDaemon = (function () {

    const TAG = "MBQoS4SendDaemon";

    // 构造器（相当于java里的构造方法）
    let ModuleMBQoS4SendDaemon = function (argument) {

        // 保存setInverval(...)定时器id（此id方便用于关闭定时器时使用）
        this.intervalId = 0;

        /*
         * QoS质量保证线程心跳间隔（单位：毫秒），默认5000ms.
         * <p>
         * 间隔越短则为用户重发越即时，但将使得重复发送的可能性增大（因为可能在应答包尚在途中时就判定丢包了的错误情况）
         * ，当然，即使真存在重复发送的可能也是无害的，因为MobileIMSDK的QoS机制本身就有防重能力。请根据您的应用所处
         * 的网络延迟情况进行权衡，本参数为非关键参数，如无特殊情况则建议无需调整本参数。
         */
        this.CHECH_INTERVAL = 5000;

        /*
         * “刚刚”发出的消息阀值定义（单位：毫秒），默认3000毫秒。
         * <b>注意：此值通常无需由开发者自行设定，保持默认即可。</b>
         * <p>
         * 此阀值的作用在于：在QoS=true的情况下，一条刚刚发出的消息会同时保存到本类中的QoS保证队列，在接收方的应答包
         * 还未被发出方收到时（已经发出但因为存在数十毫秒的网络延迟，应答包正在路上），恰好遇到本次QoS质量保证心跳间隔
         * 的到来，因为之前的QoS队列罗辑是只要存在本队列中还未被去掉的包，就意味着是要重传的——那么此逻辑在我们本次讨论
         * 的情况下就存在漏洞而导致没有必要的重传了。如果有本阀值存在，则即使刚刚发出的消息刚放到QoS队列就遇到QoS心跳
         * 到来，则只要当前放入队列的时间小于或等于本值，就可以被认为是刚刚放入，那么也就避免被误重传了。
         * <p>
         * 基于以上考虑，本值的定义，只要设定为大于一条消息的发出起到收到它应答包为止这样一个时间间隔即可（其实就相于
         * 一个客户端到服务端的网络延迟时间4倍多一点点即可）。此处定为3秒其实是为了保守起见哦。
         * <p>
         * 本参数将决定重传的即时性问题，即当MobileIMSDK判定消息未送达时，QoS首次重传的
         * 响应时间为> {@link #MESSAGES_JUST$NOW_TIME}(即{@value #MESSAGES_JUST$NOW_TIME}毫秒) 而 <= {@link #CHECH_INTERVAL}(即{@value #CHECH_INTERVAL}毫秒)。
         */
        this.MESSAGES_JUST$NOW_TIME = 3 * 1000;

        /*
         * 一个包允许的最大重发次数，默认2次。
         * <p>
         * 次数越多，则整个消息的可靠性越好，但在网络确实很烂的情况下可能会导致重传的泛滥而失去“即时”的意义。请根据网络
         * 状况和应用体验来权衡设定，本参数为0表示不重传，建议使用1到5之间的数字。
         */
        this.QOS_TRY_COUNT = 2;// 为了降低服务端负载，本参数由原3调整为2

        /* 本Hash表目前用于缓存一段时间内的已发送消息，<key=String, value=Protocal> */
        this.sentMessages = new MBHashMap();
        /* 本Hash表目前仅用于QoS重传判断是否是“刚刚”发出的消息之用（别无它用），<key=String, value=long> */
        this.sendMessagesTimestamp = new MBHashMap();

        /* 本次执行是否还未完成（内部变量，开发者无需理会） */
        this._excuting = false;
    };

    /**
     * 执行业务逻辑（此函数由框架内部调用，开发者无需使用）。
     *
     * @see #onRetryCheck()
     * @see #doRetryCheck()
     */
    ModuleMBQoS4SendDaemon.prototype.excute = function(){
        console.log(lostMessages, 12414444)
        // 极端情况下本次循环内可能执行时间超过了时间间隔，此处是防止在前一次还没有运行完的情况下又重复执行，从而出现无法预知的错误
        if(!this._excuting) {
            // 丢包列表（数组单元中的是Protocal对象）
            var lostMessages = new Array();
            // 执行doRetryCheck()检查消息重传列表，完成后执行onRetryCheck()
            this.onRetryCheck(this.doRetryCheck(lostMessages));
        }
    };

    /**
     * 重传检查（此函数由框架内部调用，开发者无需使用）。
     *
     * @param lostMessages {Array<Protocal>} 被判定为丢包的数组对象引用
     * @return {Array<Protocal>} 已被判定为“消息未送达”的消息列表
     */
    ModuleMBQoS4SendDaemon.prototype.doRetryCheck = function(lostMessages) {
        this._excuting = true;
        try {
            if(IMSDK._debugEnable && this.sentMessages.size() > 0)
                MBUtils.mblog_d(TAG, "【QoS】====== 消息发送质量保证线程运行中, 当前需要处理的列表长度为"+this.sentMessages.size()+"...");

            // 开始处理中 ************************************************
            var arr = this.sentMessages.keySet();
            for (var i = 0; i < arr.length; i++) {
                var key = arr[i];

                var p = this.sentMessages.get(key);
                if(p && p.QoS && p.fp != 'groupSend') {
                    // 达到或超过了最大重试次数（判定丢包）
                    // if(p.getRetryCount() >= this.QOS_TRY_COUNT)
                    if(p.retryCount && p.retryCount >= this.QOS_TRY_COUNT) {
                        if(IMSDK._debugEnable)
                            MBUtils.mblog_d(TAG, "【QoS】指纹为"+p.fp
                                +"的消息包重传次数已达"+p.retryCount+"(最多"+this.QOS_TRY_COUNT+"次)上限，将判定为丢包！");

                                console.log('casdasdasda', p)
                        // 将这个包加入到丢包列表
                        lostMessages.push(p);

                        // 从列表中称除之
                        this.remove(p.fp);
                    }
                    // 没有达到重传上限则开始进行重传
                    else {
                        //### 2015103 Bug Fix: 解决了无线网络延较大时，刚刚发出的消息在其应答包还在途中时被错误地进行重传
                        var sendMessageTimestamp = this.sendMessagesTimestamp.get(key);
                        var delta = MBUtils.getCurrentUTCTimestamp() - (sendMessageTimestamp == null?0 : sendMessageTimestamp);
                        // 该消息包是“刚刚”发出的，本次不需要重传它哦
                        if(delta <= this.MESSAGES_JUST$NOW_TIME) {
                            if(IMSDK._debugEnable)
                                MBUtils.mblog_w(TAG, "【QoS】指纹为"+key+"的包距\"刚刚\"发出才"+delta
                                    +"ms(<="+this.MESSAGES_JUST$NOW_TIME+"ms将被认定是\"刚刚\"), 本次不需要重传哦.");
                        }
                        //### 2015103 Bug Fix END
                        else {
                            // 尝试进行重传
                            // var code = MBDataSender.sendCommonData(p);
                            console.log('casdasdasda 2', p)
                            IMSDK.sendData(p);

                            // 重传次数+1
                            if(!p.retryCount) {
                                p.retryCount = 0;
                            }
                            p.retryCount += 1;

                            if (IMSDK._debugEnable)
                                MBUtils.mblog_d(TAG, "【QoS】指纹为" + p.fp + "的消息包已进行重传，此次之后重传次数已达" + p.retryCount + "(最多" + this.QOS_TRY_COUNT + "次).");
                        }
                    }
                }
                // value值为null，从列表中去掉吧
                else {
                    this.remove(key);
                }
            }
        }
        catch (eee){
            MBUtils.mblog_w(TAG, "【QoS】消息发送质量保证线程运行时发生异常：", eee);
        }

        return lostMessages;
    };

    /**
     * 重传检查完成后的回调处理（此函数由框架内部调用，开发者无需使用）。
     *
     * @param al {Array<Protocal>} 已被判定为“消息未送达”的消息列表
     */
    ModuleMBQoS4SendDaemon.prototype.onRetryCheck = function(al) {
        if(al && al.length > 0) {
            // 通知观察者这些包丢包了（目标接收者没有收到）
            this.notifyMessageLost(al);
        }
        this._excuting = false;
    };

    /**
     * 将未送达信息反馈给消息监听者。
     *
     * @param lostMessages {Array<Protocal>} 已被判定为“消息未送达”的消息列表
     */
    ModuleMBQoS4SendDaemon.prototype.notifyMessageLost = function(lostMessages) {
        // MBCore.emit(MBSocketEvent.SOCKET_EVENT_MESSAGE_LOST, lostMessages);
        IMSDK.emitLocalLogicEvent(MBLocalLogicEvent.LOCAL_LOGIC_EVENT_MESSAGE_LOST, lostMessages);
    };

    /**
     * 启动线程。
     *
     * 无论本方法调用前线程是否已经在运行中，都会尝试首先调用 {@link #stop()}方法，以便确保线程被启动前是真正处于停止状态，这也
     * 意味着可无害调用本方法。
     *
     * 注意：本线程的启停，目前属于MobileIMSDK算法的一部分，暂时无需也不建议由应用层自行调用。
     *
     * @param immediately {boolean} true表示立即执行线程作业，否则直到 {@link #CHECH_INTERVAL}执行间隔的到来才进行首次作业的执行
     */
    ModuleMBQoS4SendDaemon.prototype.startup = function(immediately) {
        this.stop();

        // 立即执行1次
        if(immediately){
            this.excute();
        }

        let that = this;
        // 定时执行
        this.intervalId = setInterval(function () {
            that.excute();
        }, this.CHECH_INTERVAL);
    };

    /**
     * 无条件中断本线程的运行。
     *
     * 注意：本线程的启停，目前属于MobileIMSDK算法的一部分，暂时无需也不建议由应用层自行调用。
     */
    ModuleMBQoS4SendDaemon.prototype.stop = function() {
        if(this.intervalId && this.intervalId !== 0)
            clearInterval(this.intervalId);
    };

    /**
     * 该包是否已存在于队列中。
     *
     * @param fingerPrint {String} 消息包的特纹特征码（理论上是唯一的）
     * @return {boolean} true表示是，否则不是
     */
    ModuleMBQoS4SendDaemon.prototype.exist = function(fingerPrint) {
        return this.sentMessages.get(fingerPrint) != null;
    };

    /**
     * 推入一个消息包的指纹特征码.
     * <br>注意：本方法只会将指纹码推入，而不是将整个Protocal对象放入列表中。
     *
     * @param p {Protocal} Protocal对象
     */
    ModuleMBQoS4SendDaemon.prototype.put = function(p) {
        if(p) {
            if(p.fp){
                if(p.QoS) {
                    // 如果列表中已经存则仅提示（用于debug）
                    if (this.sentMessages.get(p.fp) != null)
                        MBUtils.mblog_w(TAG, "【QoS】指纹为" + p.fp + "的消息已经放入了发送质量保证队列，该消息为何会重复？（生成的指纹码重复？还是重复put？）");

                    // save it
                    this.sentMessages.put(p.fp, p);
                    // 同时保存时间戳
                    this.sendMessagesTimestamp.put(p.fp, MBUtils.getCurrentUTCTimestamp());
                }
                else {
                    MBUtils.mblog_w(TAG, "This protocal is not QoS pkg, ignore it!");
                }
            }
            else{
                MBUtils.mblog_w(TAG, "Invalid arg p.getFp() == null.");
            }
        }
        else {
            MBUtils.mblog_w(TAG, "Invalid arg p==null.");
        }
    };

    /**
     * 移除一个消息包.
     * <p>
     * 此操作是在步异线程中完成，目的是尽一切可能避免可能存在的阻塞本类中的守护线程.
     *
     * @param fingerPrint {String} 消息包的特纹特征码（理论上是唯一的）
     */
    ModuleMBQoS4SendDaemon.prototype.remove = function(fingerPrint) {
        this.sendMessagesTimestamp.remove(fingerPrint);

        let removedObj = this.sentMessages.get(fingerPrint);
        this.sentMessages.remove(fingerPrint);

        MBUtils.mblog_w(TAG, "【QoS】指纹为"+fingerPrint+"的消息已成功从发送质量保证队列中移除(可能是收到接收方的应答也可能是达到了重传的次数上限)，重试次数="
            +(removedObj != null?(removedObj.retryCount):"none呵呵."));
    };

    /**
     * 清空缓存队列。
     * <p>
     * 调用此方法可以防止在APP不退出的情况下退出登陆MobileIMSDK时没有清除队列缓存，导致此时换用另一账号时发生数据交叉。
     *
     * @since 3.2
     */
    ModuleMBQoS4SendDaemon.prototype.clear = function() {
        this.sentMessages.clear();
        this.sendMessagesTimestamp.clear();
    };

    /**
     * 队列大小.
     *
     * @return {int}
     */
    ModuleMBQoS4SendDaemon.prototype.size = function() {
        return this.sentMessages.size();
    };

    /**
     * 设置心跳间隔（默认5000ms）。
     *
     * @param interval {int} 心跳间隔（单位：毫秒）
     */
    ModuleMBQoS4SendDaemon.prototype.setCheckInterval = function(interval){
        this.CHECH_INTERVAL = interval;
    };

    /**
     * 设置最大重发次数（默认2次）。
     *
     * @param cnt {int} 最大重发次数
     */
    ModuleMBQoS4SendDaemon.prototype.setQoSTryCount = function(cnt){
        this.QOS_TRY_COUNT = cnt;
    };

    // 实例化此类
    return new ModuleMBQoS4SendDaemon();
})();