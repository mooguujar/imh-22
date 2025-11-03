
(function () {
    var w = window;

    // 【特别注意】：
    // IMSDK类中的第一层function可以直接调用IMSDK这一层的属性、函数等，直接用this即可。
    // 但到了this.socket.on里的function回调，是不能用this引用的到IMSDK的，因为此时的
    // "this"将会是socket.io某对象而不是IMSDK本身，但可以用全局的方式进行引用：w.IMSDK.
    // ，为了避免混淆，建议直接用w.IMSDK来避免混乱！
    w.IMSDK = {


        //*************************************************** 【1】以下属性定义仅供MobileIMSDK-Web框架内部使用 START
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
         * 调用时传入的参数1（必填）：字符串类型，表示log内容；
         * 调用时传入的参数2（可选）：bool量，true表示输出到console，否则默认方式(由开发者设置的回调决定)；
         */
        callback_onIMLog : null, // callback_log

        /**
         * 【外部传入的回调方法2：用于收到聊天消息时在UI上展现出来（事件通知于收到IM消息时）】。
         *
         * 调用时传入的参数1（必填）：Protocal对象(Protocal详情请见“/libs/mobileimsdk-client-common.js”
         *                        下的createCommonData4函数说明)；
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
         * 调用时传入的参数：true表示是掉线重连后的认证失败（在登陆其间可能用户的密码信息等发生了变更），否则表示首次登陆时的认证失败；
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
         * 调用时传入的参数1（必填）；文本类型，表示提示内容
         */
        callback_onIMShowAlert : null, // @since 3.4
        //*************************************************** 【2】以下属性供开发者在外部设置回调时使用 END


        // TODO 如需要其它更多回调的话，请开发者自行添加即可！


        //*************************************************** 【3】以下公开函数供开发者在自已的代码中使用 START
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
            // 将消息通过websocket发送出去
            this._socket.emit(p.type, p);
        },

        /**
         * 【公开方法5：客户端主动断开客户端socket连接】.
         * 补充说明：当开发者登陆IM后，需要退出登陆时，调用本函数就对了，本函数相当于登陆函数 loginImpl()的逆操作
         */
        disconnectSocket : function(){// add by js: 20170110
            this._socket.disconnect();

            // 重置已经登陆过标识（此标识主要用于区分首次登陆时的界面显示）
            w.IMSDK._logined = false;
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
                forceNew:true,               // 20170110：加了此选项才能让客户端socketio.disconnect()生效！
                secure:supportSSL?true:false // 20170526：是否支持SSL/TLS
            });

            /**
             * 以下是socket.io客户端库的Socket事件.
             * 更多资料请见：https://github.com/socketio/socket.io-client
             */
            // 收到对方客户端的“通用数据”消息（此事件表示收到IM消息了）
            this._socket.on(C_IMEVT_COMMON$DATA, function (p) {
                if(w.IMSDK._debugEnable){
                    w.IMSDK.callback_onIMLog('[E] >> 收到[聊天消息]：'+JSON.stringify(p), true);
                }

                // 将收到的消息通知应用层显示出来
                w.IMSDK.callback_onIMData(p);
            });
            // 收到服务端的“重复登陆被踢”消息（此事件由服务端检测到当前loginUserId已经别处登陆时发出）
            this._socket.on(S_IMEVT_DUPLICATED, function (p) {
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
            this._socket.on(S_IMEVT_ILLEGAL, function (p) {
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

                var errObj = JSON.parse(err);
                var code = errObj.code;
                var msg = errObj.msg;

                //  认证成功
                if(100 === code) {// 每次掉线都会重新走一遍认证过程，code=100的逻辑要注意别搞混
                    if(w.IMSDK._debugEnable) {
                        w.IMSDK.callback_onIMLog('[E] 本客户端 error 事件中：登陆认证成功(' + (w.IMSDK._logined ?
                                '掉线重连' : '首次登陆') + ')！【code=' + code + '】', true);
                    }

                    // 设置在线标识
                    w.IMSDK._online = true;

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

    // some other code line

})();