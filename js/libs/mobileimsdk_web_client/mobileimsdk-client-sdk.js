
(function () {
    var w = window;

    // 【特别注意】：
    // IMSDK类中的第一层function可以直接调用IMSDK这一层的属性、函数等，直接用this即可。
    // 但到了this.socket.on里的function回调，是不能用this引用的到IMSDK的，因为此时的
    // "this"将会是socket.io某对象而不是IMSDK本身，但可以用全局的方式进行引用：w.IMSDK.
    // ，为了避免混淆，建议直接用w.IMSDK来避免混乱！
    w.IMSDK = {


        //*************************************************** 【1】以下属性定义仅供MobileIMSDK-Web框架内部使用 START
        // SDK内部逻辑事件监听者Map(key=事件名, value=回调函数)。
        // 补充说明：实现原理类似于一个EvenBus，目的是让sdk层的一些调用能在逻辑上进行解耦，仅此而已。当前主
        //          要是用在了QoS机制里，由QoS定义器对处理完的QoS事件进行通知之用，以后也可以扩展到更多的事
        //          件和逻辑，通过此种解耦方式更优雅地处理代码的耦合。
        _localLogicEvenCallbacks : {},

        // 【内部变量：是否在线】：true表示已正常连接且成功认证，当且仅当此值为true时才是业务层理解的正常通信！
        _online : false,
        // 【内部变量：是否已登陆】：true表示已登陆过（登陆只需要首次打开时登陆1次，后绪的掉线重
        //       连将自动提交首次登陆时有的用户名和密码）。本标识主要用于UI展现逻辑中：首次登
        //       陆跟掉线重连的ui表现上肯定是有不同的
        _logined : false,
        // 【内部变量：存储登陆认证需要的信息（用户名、密码等）】：用于连接断掉后自动重连时的认证token
        _loginInfo : null,
        // 【内部变量：socket连接实例】
        _socket : null,
        // 【内部变量：是否打印MobileIMSDK-Web框架层log，方便开发者调试，false表示关闭Log输出，默认为false】
        _debugEnable : false,
        // 【内部变量：是否打印MobileIMSDK-Web框架层心跳包的log，方便开发者调试，false表示关闭Log输出，默认为false】
        _debugPingPongEnable : false,
        //*************************************************** 【1】以下属性定义仅供MobileIMSDK-Web框架内部使用 END



        //*************************************************** 【2】以下属性供开发者在外部设置回调时使用 START
        /**
         * 【外部传入的回调方法1：用于debug的log输出】。
         *
         * 调用时传入的参数1 {String}：必填项，字符串类型，表示log内容；
         * 调用时传入的参数2 {boolean}：选填项，true表示输出到console，否则默认方式(由开发者设置的回调决定)；
         */
        callback_onIMLog : null, // callback_log

        /**
         * 【外部传入的回调方法2：用于收到聊天消息时在UI上展现出来（事件通知于收到IM消息时）】。
         *
         * 调用时传入的参数1 {Protocal}：非空项，Protocal详情请见“/mbw-constants.js”下的数说明；
         */
        callback_onIMData : null, // callback_showChatMessage

        /**
         * 【外部传入的回调方法3：客户端的登陆请求被服务端成功认证完成后的回调（事件通知于 登陆/认证 成功后）】。
         *
         * 调用时传入的参数：无参数；
         */
        callback_onIMAfterLoginSucess : null, // callback_afterLoginSucess

        /**
         * 【外部传入的回调方法4：客户端的登陆请求被服务端认证失败后的回调（事件通知于 登陆/认证 失败后）】。
         * 补充说明：登陆/认证失败的原因可能是用户名、密码等不正确等，但具体逻辑由服务端的 callBack_checkAuthToken
         *          回调函数去处理。
         *
         * 调用时传入的参数 {boolean}：true表示是掉线重连后的认证失败（在登陆其间可能用户的密码信息等发生了变更），否则表示首次登陆时的认证失败；
         */
        callback_onIMAfterLoginFailed : null, // callback_afterLoginFailed

        /**
         * 【外部传入的回调方法5：掉线重连成功后的回调（事件通知于掉线重连成功后）】。
         *
         * 调用时传入的参数：无参数；
         */
        callback_onIMReconnectSucess : null, // callback_reconnectSucess// add by Jack Jiang 20161219

        /**
         * 【外部传入的回调方法6：网络连接已断开时的回调（事件通知于与服务器的网络断开后）】。
         *
         * 调用时传入的参数：无参数；
         */
        callback_onIMDisconnected : null, // callback_disconnected    // add by Jack Jiang 20171121

        /**
         * 【外部传入的回调方法7：本地发出心跳包后的回调通知（本回调并非MobileIMSDK-Web核心逻辑，开发者可以不需要实现！）】。
         *
         * 调用时传入的参数：无参数；
         */
        callback_onIMPing : null, // @since 3.4

        /**
         * 【外部传入的回调方法8：收到服务端的心跳包反馈的回调通知（本回调并非MobileIMSDK-Web核心逻辑，开发者可以不需要实现！）】。
         *
         * 调用时传入的参数：无参数；
         */
        callback_onIMPong : null, // @since 3.4

        /**
         * 【外部传入的回调方法9：框架层的一些提示信息显示回调（本回调并非MobileIMSDK-Web核心逻辑，开发者可以不需要实现！）】。
         *
         * 【补充说明：开发者不设置的情况下，框架默认将调用window.alert()显示提示信息，否则将使用开发者设置的回调——目的主要是给
         *           开发者自定义这种信息的UI显示，提升UI体验，别无它用】。
         *
         * 调用时传入的参数1 {String}；必填项，文本类型，表示提示内容
         */
        callback_onIMShowAlert : null, // @since 3.4

        /**
         * 【外部传入的回调方法11：消息未送达的回调事件通知】。
         *
         * 【发生场景：比如用户刚发完消息但网络已经断掉了的情况下，表现形式如：就像手机qq或微信一样消息气泡边上会出现红色图标以示没有发送成功）.】
         * 【建议用途：应用层可通过回调中的指纹特征码找到原消息并可以UI上将其标记为”发送失败“以便即时告之用户。】
         *
         * 调用时传入的参数1 {Array<Protocal>}：由框架的QoS算法判定出来的未送达消息列表
         */
        callback_onIMMessagesLost : null,

        /**
         * 【外部传入的回调方法12：消息已被对方收到的回调事件通知】。
         *
         * 【方法说明】：
         *   目前，判定消息被对方收到是有两种可能：
         *   1) 对方确实是在线并且实时收到了；<br>
         *   2) 对方不在线或者服务端转发过程中出错了，由服务端进行离线存储成功后的反馈（此种情况严格来讲不能算是“已被收到
         *      ”，但对于应用层来说，离线存储了的消息原则上就是已送达了的消息：因为用户下次登陆时肯定能通过HTTP协议取到）。
         *
         * 调用时传入的参数1 {String}：已被收到的消息的指纹特征码（唯一ID），应用层可据此ID找到原先已发的消息并可在UI是将
         *                            其标记为”已送达“或”已读“以便提升用户体验。
         */
        callback_onIMMessagesBeReceived : null,
        //*************************************************** 【2】以下属性供开发者在外部设置回调时使用 END


        // TODO 如需要其它更多回调的话，请开发者自行添加即可！


        //*************************************************** 【3】以下公开函数供开发者在自已的代码中使用 START
        /**
         * 局部函数发送消息应答指令。
         * <br>
         * <b>注意：</b>本函数由框架内部调用，无需也不建议应用层调用。
         *
         * @param pFromServer {Protocal} 原始数据包
         */
        sendRecievedBack : function(pFromServer) {
            if (pFromServer.fp) {

                var pForRecivedBack = MBProtocalFactory.createRecivedBack(pFromServer.to, pFromServer.from, pFromServer.fp);
                var code = w.IMSDK.sendData(pForRecivedBack);

                if (w.IMSDK._debugEnable)
                    w.IMSDK.callback_onIMLog("【QoS】向" + pFromServer.from + "发送" + pFromServer.fp + "包的应答包成功？(code="+code+"),from=" + pFromServer.to + "！", true);
            } else {
                w.IMSDK.callback_onIMLog("【QoS】收到" + pFromServer.from + "发过来需要QoS的包，但它的指纹码却为null！无法发应答包！", true);
            }
        },

        /**
         * 获取指定SDK逻辑事件名对应的回调函数。
         * <br>
         * <b>注意：</b>本函数由框架内部调用，无需也不建议应用层调用。
         *
         * @param eventName {String} SDK逻辑事件名常量
         * @return {null|function}
         * @since 5.0
         */
        getLocalLogicEventCallback : function(eventName){
            if(eventName){
                let callback = this._localLogicEvenCallbacks[eventName];
                if(callback){
                    return callback;
                }

                if(w.IMSDK._debugEnable){
                    w.IMSDK.callback_onIMLog('[*] 事件监听者列表中，名称为 localLogicEventName='+eventName+'的callback 是空的！', true);
                }
                return null;
            }
            else
                w.IMSDK.callback_onIMLog('[*] 无效的参数：localLogicEventName='+eventName);
        },

        /**
         * 为指定的SDK逻辑事件添加事件处理回调。
         *
         * 补充说明：之所以将本函数命名为“on**”，是为模仿socket.io版的事件机制命名方法，
         *          如果本函数命名为“registerLocalLogicEventCallback”可能更易理解。
         *
         * @param eventName {String} SDK逻辑事件名常量
         * @param callback {function} 处理对应SDK逻辑事件的回调函数
         * @since 5.0
         */
        onLocalLogicEvent : function(eventName, callback){
            if(eventName && callback){
                // 如果存在则直接覆盖（替换）成最新的
                this._localLogicEvenCallbacks[eventName] = callback;
            }
            else{
                w.IMSDK.callback_onIMLog('[*] 无效的参数：localLogicEventName='+eventName+', callback='+callback);
            }
        },

        /**
         * 抛出SDK逻辑事件。
         *
         * 补充说明：之所以将本函数命名为“emite”，是为了兼容socket.io版的事件机制命名方法，
         *          如果本函数命名为“postLocalLogicEvent”可能更易理解。
         *
         * @param eventName {String} SDK逻辑事件名
         * @param data {Object} 该事件对应的数据，具体的数据类型由对应的事件决定，并不固定
         * @since 5.0
         */
        emitLocalLogicEvent : function(eventName, data){
            var callbackForEvent = this.getLocalLogicEventCallback(eventName);
            if(callbackForEvent){
                callbackForEvent(data);
            }
            else{
                w.IMSDK.callback_onIMLog('[*] 事件回调列表中没有找到localLogicEventName='+eventName+'的callback，本次emit无法进行！');
            }
        },

        /**
         * 【公开方法1：是否已经完成过首次登陆】。
         * 补充说明：用户一旦从自已的应用中完成登陆IM服务器后，本方法就会一直返回true（直到退出登陆IM）。
         *
         * @returns {boolean} true表示已完成首次成功登陆（即已经成功登陆过IM服务端了，后面掉线时不影响此标识），否则表示尚未连接IM服务器
         */
        isLogined : function(){
            return this._logined;
        },

        /**
         * 【公开方法2：是否在线】.
         * 补充说明：表示网络连接是否正常。
         *
         * @returns {boolean} true表示网络连接正常，否则表示已掉线，本字段只在this._logined=true时
         *          有意义（如果都没有登陆到IM服务器，怎么存在在线或掉线的概念呢）
         */
        isOnline : function(){
            return this._online;
        },

        /**
         * 【公开方法3：返回登陆时提交的登陆信息（用户名、密码等）】.
         * 补充说明：格式可能形如：{loginUserId:'',loginToken:''}，此返回值的内容由调用登陆函数 loginImpl()时传入的内容决定！
         *
         * @returns {} 之前登陆时提交的内容
         */
        getLoginInfo : function(){
            return this._loginInfo;
        },

        /**
         * 【公开方法4：向某人发送一条消息】.
         *
         * @param p 参数为Protocal对象，(Protocal详情请见“/libs/mobileimsdk-client-common.js”下的createCommonData4函数说明)
         */
        sendData : function(p){
            // Bug FIX on v5.0: 确保数据事件的发出是在网络正常的情况发出的（因为socket.io默认可以在网络断开的情况下发出任何事件
            //                  ，而这些被缓存的事件将在网络重连成功后被发出，而这导致v5.0中的QoS机制下的重发逻辑出现明明已报消
            //                  息未成功送达，确在网络重连成功后，重发又成功——并同时收到对方的应答，这对于MobileIMSDK-Web中的QoS
            //                  机制来说是有害的，所以此处我们不需要这个事件缓存机制！）
            // 参见官方文档：https://socket.io/docs/v3/client-offline-behavior/
            console.log("Sending Data: ", p);
            if (this._socket.connected) {
                // 将消息通过websocket发送出去
                this._socket.emit(p.type, p);
            }

            // 【【C2C或C2S模式下的QoS机制1/4步：将包加入到发送QoS队列中】】
            // 如果需要进行QoS质量保证，则把它放入质量保证队列中供处理(已在存在于列
            // 表中就不用再加了，已经存在则意味当前发送的这个是重传包哦)
            if(p.QoS && !MBQoS4SendDaemon.exist(p.fp))
                MBQoS4SendDaemon.put(p);
        },

        /**
         * 【公开方法5：客户端主动断开客户端socket连接】.
         * 补充说明：当开发者登陆IM后，需要退出登陆时，调用本函数就对了，本函数相当于登陆函数 loginImpl()的逆操作
         */
        disconnectSocket : function(){// add by js: 20170110
            this._socket.disconnect();

            // 重置已经登陆过标识（此标识主要用于区分首次登陆时的界面显示）
            w.IMSDK._logined = false;

            // 尝试停掉QoS质量保证（发送）心跳线程
            MBQoS4SendDaemon.stop();
            // 尝试停掉QoS质量保证（接收防重复机制）心跳线程
            MBQoS4ReciveDaemon.stop();
            // 并清除QoS发送队列缓存：防止不退出应用时切换另一账号后qos的缓存队列未清空
            MBQoS4SendDaemon.clear();
            // 并清除QoS接收队列缓存：防止不退出应用时切换另一账号后qos的缓存队列未清空
            MBQoS4ReciveDaemon.clear();
        },

        /**
         * 【公开方法6：是否开启MobileIMSDK-Web框架层的log输入，方便开发者调试】.
         *
         * @param enable true表示开启log输出，否则不输出，开发者不调用本函数的话系统默认是false（即不输出log）
         */
        setDebugEnable : function(enable){// add by js: 20171121
            // 设置debug允许标识
            w.IMSDK._debugEnable = enable;
        },

        /**
         * 【公开方法7：是否开启MobileIMSDK-Web框架层的底层网络socket.io心跳包的log输出，方便开发者调试】.
         *
         * 注意：必须 setDebugEnable(true) 且 setDebugPingPongEnable(true) 时，心跳log才会真正输出，方便控制。
         *
         * @param enable true表示开启log输出，否则不输出，开发者不调用本函数的话系统默认是false（即不输出log）
         */
        setDebugPingPongEnable : function(enable){// @since 3.4
            // 设置debug允许标识
            w.IMSDK._debugPingPongEnable = enable;
        },

        /**
         * 【公开方法8：登陆IM服务器时调用的方法】。
         * 补充说明：登陆MobileIMSDK-Web服务器由本函数发起。
         *
         * 关于"this"：因为本function内的回调function属第2层，直接在第2层调用this.callback_onIMLog会
         *            报“is not function”的错误，一定要注意this的含义！！(this就是调用者，scket.on里
         *            的回调里this应该是Socket.io而不是w.IMSDK)。
         *
         * 特别注意：参数varloginInfo可以是任一JSON对象，但必须有属性及其值：loginUserId的值必须不为空且保证全局唯一
         *
         * @param varloginInfo 必填项：登陆要提交给Websocket服务器的认证信息，不可为空。
         * @param wsUrl 必填项：要连接的Websocket服务器地址，不可为空，形如：http://192.168.31.190:4000
         * @param supportSSL 必填项：true表示启用TLS/SSL加密，否则不开启加密
         */
        loginImpl : function (varloginInfo, wsUrl, supportSSL){
            this._loginInfo = varloginInfo;

            // 发起首次连接和认证
            this._socket = io.connect(wsUrl, {
                query: 'token='+JSON.stringify(w.IMSDK._loginInfo),
                transports:['websocket'],
                forceNew:true,               // 20170110：加了此选项才能让客户端socketio.disconnect()生效！
                secure:supportSSL?true:false // 20170526：是否支持SSL/TLS
            });

            /**
             * 以下是socket.io客户端库的Socket事件.
             * 更多资料请见：https://github.com/socketio/socket.io-client
             */
            // 收到对方客户端的“通用数据”消息（此事件表示收到IM消息了）
            this._socket.on(MBProtocalType.C_IMEVT_COMMON$DATA, function (p, callback) {

                try {
                    // Perform some actions with the data
                    // If successful:
                    if(w.IMSDK._debugEnable){
                        w.IMSDK.callback_onIMLog('[E] >> 收到[聊天消息]：'+JSON.stringify(p), true);
                    }
    
                    // 且已经存在于接收列表中（及意味着可能是之前发给对方的应答包因网络或其它情况丢了，对方又因QoS机制重新发过来了）
                    if (MBQoS4ReciveDaemon.hasRecieved(p.fp)) {
                        if (w.IMSDK._debugEnable)
                            w.IMSDK.callback_onIMLog("【QoS机制】" + p.fp + "已经存在于发送列表中，这是重复包，通知应用层收到该包罗！");
    
                        //----------------------------------------- [1]代码与[2]处相同的哦 S
                        // 【【C2C、C2S、S2C模式下的QoS机制2/4步：将收到的包存入QoS接收方暂存队列中（用于防重复）】】
                        MBQoS4ReciveDaemon.addRecievedProtocal(p);
                        // 【【C2C、C2S、S2C模式下的QoS机制3/4步：回应答包】】给发送者回一个“收到”应答包
                        w.IMSDK.sendRecievedBack(p);
                        //----------------------------------------- [1]代码与[2]处相同的哦 E
    
                        // 此包重复，不需要通知应用层收到该包了，直接返回
                        return;
                    }
    
                    //----------------------------------------- [2]代码与[1]处相同的哦 S
                    // 【【C2C、C2S、S2C模式下的QoS机制2/4步：将收到的包存入QoS接收方暂存队列中（用于防重复）】】
                    MBQoS4ReciveDaemon.addRecievedProtocal(p);
                    // 【【C2C、C2S、S2C模式下的QoS机制3/4步：回应答包】】给发送者回一个“收到”应答包
                    w.IMSDK.sendRecievedBack(p);
                    //----------------------------------------- [2]代码与[1]处相同的哦 E
    
                    // 将收到的消息通知应用层显示出来
                    w.IMSDK.callback_onIMData(p);
                    callback({ success: true, message: '消息已发送成功。' });
                } catch (error) {
                    // In case of failure
                    callback({ success: false, message: '消息传输失败。' });
                }
            });
            // 收到服务端反馈来的ACK消息应答（此事件表示刚才发出的消息已送达）
            this._socket.on(MBProtocalType.S_IMEVT_RECIVED, function (p) {
                // 应答包的消息内容即为之前收到包的指纹id
                var theFingerPrint = p.dataContent;
                if (w.IMSDK._debugEnable)
                    w.IMSDK.callback_onIMLog("【QoS】收到" + p.from + "发过来的指纹为" + theFingerPrint + "的应答包.", true);

                // 将收到的应答事件通知事件处理者
                w.IMSDK.emitLocalLogicEvent(MBLocalLogicEvent.LOCAL_LOGIC_EVENT_MESSAGE_BE_RECIEVED, p);

                // 【【C2C或C2S模式下的QoS机制4/4步：收到应答包时将包从发送QoS队列中删除】】
                MBQoS4SendDaemon.remove(theFingerPrint);
            });
            // 收到服务端的“重复登陆被踢”消息（此事件由服务端检测到当前loginUserId已经别处登陆时发出）
            this._socket.on(MBProtocalType.S_IMEVT_DUPLICATED, function (p) {
                if(w.IMSDK._debugEnable) {
                    w.IMSDK.callback_onIMLog('[E] >> 收到[重复登陆被踢事件]：' + JSON.stringify(p), true);
                }

                var alertContent = '账号已在其它地方登陆，当前会话已断开，请退出后重新登陆！';
                // 如果开发者自已设置信息提示回调实现，就优先用开发者设置的
                if(w.IMSDK.callback_onIMShowAlert){
                    w.IMSDK.callback_onIMShowAlert(alertContent);
                }
                // 否则用浏览器默认的alert方法（就是UI有点土）
                else{
                    w.alert(alertContent);
                }
            });
            // 收到服务端的“非法连接被拒绝服务并断开连接”消息（此事件由服务器判定客户端的socket
            // 不存在登陆认证信息时发出，防止非法攻击）
            this._socket.on(MBProtocalType.S_IMEVT_ILLEGAL, function (p) {
                if(w.IMSDK._debugEnable) {
                    w.IMSDK.callback_onIMLog('[E] >> 收到[非法连接被拒绝服务]：' + JSON.stringify(p), true);
                }

                var alertContent = '服务判定你的连接非法，已被拒绝服务并断开连接！';
                // 如果开发者自已设置信息提示回调实现，就优先用开发者设置的
                if(w.IMSDK.callback_onIMShowAlert){
                    w.IMSDK.callback_onIMShowAlert(alertContent);
                }
                // 否则用浏览器默认的alert方法（就是UI有点土）
                else{
                    w.alert(alertContent);
                }
            });
            // 此事件发生时表示网络已连接
            this._socket.on('connect', function () {
                if(w.IMSDK._debugEnable) {
                    w.IMSDK.callback_onIMLog('[E] 本客户端的Socket connect 事件已经触发', true);
                }
            });
            // 此事件发生时表示网络连接断开了
            this._socket.on('disconnect', function (data) {// data content is "io server disconnect"
                if(w.IMSDK._debugEnable) {
                    w.IMSDK.callback_onIMLog('[E] 本客户端的Socket disconnect 事件已经触发【END】!', true);
                }

                //if(logined)
                {
                    // 重置在线标识，此标识只在登陆过之后才有意义（在此无条件重置吧，防止未知情况出现导致不能复位到false）
                    w.IMSDK._online = false;
                }

                // 属于首次登陆时，此时的disconnect发生的原因可能是：认证未通过、真的断网了等，
                // 此处复位这两个缓存量是合理的：以便用户可以再次登陆
                if(!w.IMSDK._logined){
                    w.IMSDK._loginInfo = null;
                }

                if(w.IMSDK._debugEnable) {
                    w.IMSDK.callback_onIMLog("[E] 对不起，你与IM服务器的网络连接断开了（掉线罗）...", true);
                }

                // 通知应用层网络掉线了
                if(w.IMSDK.callback_onIMDisconnected){
                    w.IMSDK.callback_onIMDisconnected();
                }
            });
            this._socket.on('connect_error', function (data) {
                if(w.IMSDK._debugEnable) {
                    //w.IMSDK.callback_onIMLog('[E] 本客户端 connect_error 事件已触发' + JSON.stringify(data), true);
                }
            });
            this._socket.on('connect_timeout', function () {
                if(w.IMSDK._debugEnable) {
                    w.IMSDK.callback_onIMLog('[E] 本客户端 connect_timeout 事件已触发', true);
                }
            });
            // 系统级的Error事件回调（socket.io v1.0后的版本中，官方推荐的连接认证最佳实践是通过服务端的error事件来处理的），
            // 根据socket.io官方的建议，MobileIMSDK-Web是利于本事件来实现登陆认证和掉线重连接认证的
            this._socket.on('error', function (err) {
                if(w.IMSDK._debugEnable) {
                    w.IMSDK.callback_onIMLog('[E] 本客户端 error 事件已经触发' + err, true);
                }
                var code;
                var msg
                try{
                    var errObj = JSON.parse(err);
                    code = errObj.code;
                    msg = errObj.msg;
                }catch(e){}

                //  认证成功
                if(100 === code) {// 每次掉线都会重新走一遍认证过程，code=100的逻辑要注意别搞混
                    if(w.IMSDK._debugEnable) {
                        w.IMSDK.callback_onIMLog('[E] 本客户端 error 事件中：登陆认证成功(' + (w.IMSDK._logined ?
                                '掉线重连' : '首次登陆') + ')！【code=' + code + '】', true);
                    }

                    // 设置在线标识
                    w.IMSDK._online = true;

                    //【登陆成功后开启QoS机制】启动QoS机制之发送列表重视机制
                    MBQoS4SendDaemon.startup(true);
                    // 启动QoS机制之接收列表防重复机制
                    MBQoS4ReciveDaemon.startup(true);

                    var welcome = '';
                    // 首次登陆成功
                    if (!w.IMSDK._logined) {

                        // 通知应用层对登陆结果处理展现或处理
                        w.IMSDK.callback_onIMAfterLoginSucess();

                        // Display the welcome message
                        welcome = "- 已成功登陆至 MobileIMSDK-Web 服务器 -";
                        w.IMSDK.callback_onIMLog(welcome, true);

                        // 设置已经登陆过标识（此标识主要用于区分首次登陆时的界面显示）
                        w.IMSDK._logined = true;
                    }
                    // 掉线重连成功
                    else{
                        if(w.IMSDK._debugEnable) {
                            w.IMSDK.callback_onIMLog("[E] 掉线自动重连成功了！", true);
                        }

                        // 通知应用层对掉线重连成功结果处理展现或处理
                        w.IMSDK.callback_onIMReconnectSucess();
                    }
                }
                else {
                    // 未认证成功（认证失败了）
                    if (101 === code) {
                        // 首次登陆时认证失败
                        if (!w.IMSDK._logined) {

                            if(w.IMSDK.callback_onIMAfterLoginFailed){
                                w.IMSDK.callback_onIMAfterLoginFailed(false);
                            }

                            if(w.IMSDK._debugEnable) {
                                w.IMSDK.callback_onIMLog("[E] 登陆认证失败，请检查您的用户名或密码！");
                            }
                        }
                        // 掉线重连时的认证失败
                        else {
                            var alertContent = '掉线重连时认证失败，请退出后重新登陆。。。';
                            // 如果开发者自已设置信息提示回调实现，就优先用开发者设置的
                            if(w.IMSDK.callback_onIMShowAlert){
                                w.IMSDK.callback_onIMShowAlert(alertContent);
                            }
                            // 否则用浏览器默认的alert方法（就是UI有点土）
                            else{
                                w.alert(alertContent);
                            }

                            if(w.IMSDK.callback_onIMAfterLoginFailed){
                                w.IMSDK.callback_onIMAfterLoginFailed(true);
                            }
                        }

                        if(w.IMSDK._debugEnable) {
                            w.IMSDK.callback_onIMLog('[E] 本客户端 error 事件中：登陆认证失败【code=' + code + '】', true);
                        }

                        // 客户端自已主动把连接断开！
                        //socket.disconnect(); // js补充：不能由客户端主动关闭，不然本地的disconnect事件不能被触发哦！
                    }
                }
            });
            this._socket.on('reconnect', function () {
                if(w.IMSDK._debugEnable) {
                    //w.IMSDK.callback_onIMLog('[E] 本客户端 reconnect 事件已触发', true);
                }
            });
            this._socket.on('reconnect_attempt', function () {
                if(w.IMSDK._debugEnable) {
                    w.IMSDK.callback_onIMLog('[E] 本客户端 reconnect_attempt 事件已触发', true);
                }
            });
            this._socket.on('reconnect_failed', function () {
                if(w.IMSDK._debugEnable) {
                    //w.IMSDK.callback_onIMLog('[E] 本客户端 reconnect_failed 事件已触发', true);
                }
            });
            this._socket.on('reconnect_error', function () {
                if(w.IMSDK._debugEnable) {
                    //w.IMSDK.callback_onIMLog('[E] 本客户端 reconnect_error 事件已触发', true);
                }
            });
            this._socket.on('ping', function () {
                if(w.IMSDK._debugEnable && w.IMSDK._debugPingPongEnable) {
                    w.IMSDK.callback_onIMLog('[E] 心跳请求已发出 →', true);
                }

                if(w.IMSDK.callback_onIMPing)
                    w.IMSDK.callback_onIMPing();
            });
            this._socket.on('pong', function () {
                if(w.IMSDK._debugEnable && w.IMSDK._debugPingPongEnable) {
                    w.IMSDK.callback_onIMLog('[E] 心跳响应已收到 ←', true);
                }

                if(w.IMSDK.callback_onIMPong)
                    w.IMSDK.callback_onIMPong();
            });
        }
        //*************************************************** 【3】以下公开函数供开发者在自已的代码中使用 END
    };


    // ************************************ 你可以下面实现更多逻辑处理代码 ************************************ //

    /*
     * 注册：消息未送达的回调事件处理.
     *
     * @param lostMessages {Array<Protocal>} 由MobileIMSDK QoS算法判定出来的未送达消息列表，应用层可通过指纹特征
     *                     码找到原消息并可以UI上将其标记为”发送失败“以便即时告之用户
     */
    w.IMSDK.onLocalLogicEvent(MBLocalLogicEvent.LOCAL_LOGIC_EVENT_MESSAGE_LOST, function (lostMessages) {
        if(lostMessages && lostMessages.length > 0){
            w.IMSDK.callback_onIMLog('[E]  收到系统的未实时送达事件通知，当前共有'+lostMessages.length+'个包QoS保证机制结束，判定为【无法实时送达】！', true);

            if(w.IMSDK.callback_onIMMessagesLost)
                w.IMSDK.callback_onIMMessagesLost(lostMessages);
        }
    });

    /*
     * 注册：消息已被对方收到的回调事件处理.
     *
     * 目前，判定消息被对方收到是有两种可能：
     *  1) 对方确实是在线并且实时收到了；
     *  2) 对方不在线或者服务端转发过程中出错了，由服务端进行离线存储成功后的反馈（此种情况严格来讲不能算是“已被
     * 		收到”，但对于应用层来说，离线存储了的消息原则上就是已送达了的消息：因为用户下次登陆时肯定能通过HTTP协议取到）。
     *
     * @param theFingerPrint {String} 已被收到的消息的指纹特征码（唯一ID），应用层可据此ID来找到原先已发生的消息并可在
     *                          UI是将其标记为”已送达“或”已读“以便提升用户体验
     */
    w.IMSDK.onLocalLogicEvent(MBLocalLogicEvent.LOCAL_LOGIC_EVENT_MESSAGE_BE_RECIEVED, function (p) {
        if (p.dataContent) {
            w.IMSDK.callback_onIMLog('[E]  收到对方已收到消息事件的通知，fp=' + p.dataContent, true);

            if (w.IMSDK.callback_onIMMessagesBeReceived)
                w.IMSDK.callback_onIMMessagesBeReceived(p);
        }
    });

})();