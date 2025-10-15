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
 * 【基本说明】：
 * 本文件是MobileIMSDK的H5客户端SDK入口类。
 * 本类中的API目的是开放MobileIMSDK的能力给开发者使用，并屏蔽MobileIMSDK的算法复杂性。
 * 本类中的代码实现，跟MobileIMSDK-H5工程中的同名文件基本一致，意味着基于两个框架的应用层代码经少量修改就能兼容迁移。
 *
 * 【网络特征】：
 * MobileIMSDK-H5端算法技术参数（默认值）：
 *  1）心跳包间隔：15秒（建议用3秒）；
 *  2）心跳响应超时阀值：20秒（建议用7秒）；
 *  3）掉线后首次自动重连延迟：立即发生；
 *  4）自动重连重试间隔：3秒（建议用5~10秒）；
 *  5）QoS丢包重传次数：2次；
 *  6）QoS丢包重试检查间隔：5秒；
 *  7）QoS丢包重试检查包龄阀值：3秒；
 *  8）QoS去重列表检查间隔：5分钟；
 *  9）QoS去重列表老化时长：10分钟。
 *
 * 【基本用法】：
 * 通过 <script src="/mobileimsdk_web_client/core/mobileimsdk-client-sdk.js"></script> 这样的引用就能在页面中使用了。
 */
(function () {
    var w = window;

    /* 【特别注意】：
       IMSDK类中的第一层function可以直接调用IMSDK这一层的属性、函数等，直接用this即可。
       但到了this.socket.on里的function回调，是不能用this引用的到IMSDK的，因为此时的
       "this"将会是socket.io某对象而不是IMSDK本身，但可以用全局的方式进行引用：w.IMSDK.
       ，为了避免混淆，建议直接用w.IMSDK来避免混乱！*/
    w.IMSDK = {

        //*************************************************** 【1】以下属性定义仅供MobileIMSDK-H5框架内部使用 START
        /* 【内部变量：是否在线】：true表示已正常连接且成功认证，当且仅当此值为true时才是业务层理解的正常通信！*/
        _online : false,
        /* 【内部变量：是否已登陆】：true表示已登陆过（登陆只需要首次打开时登陆1次，后绪的掉线重连将自动提交首次登陆时有的用
                                    户名和密码）。本标识主要用于UI展现逻辑中：首次登陆跟掉线重连的ui表现上肯定是有不同的 */
        _logined : false,
        /* 【内部变量：是否打印MobileIMSDK-H5框架层log，方便开发者调试，false表示关闭Log输出，默认为false】*/
        _debugSDKEnable : false,
        /* 【内部变量：是否打印MobileIMSDK-H5框架层心跳包的log，方便开发者调试，false表示关闭Log输出，默认为false】*/
        _debugPingPongEnable : false,
        //*************************************************** 【1】以下属性定义仅供MobileIMSDK-H5框架内部使用 END


        //*************************************************** 【2】以下属性供开发者在外部设置回调时使用 START
        /**
         * 【外部传入的回调方法1：用于debug的log输出】。
         *
         * 调用时传入的参数1 {String}：必填项，字符串类型，表示log内容；
         * 调用时传入的参数2 {boolean}：选填项，true表示输出到console，否则默认方式(由开发者设置的回调决定)；
         */
        callback_onIMLog : null,

        /**
         * 【外部传入的回调方法2：用于收到聊天消息时在UI上展现出来（事件通知于收到IM消息时）】。
         *
         * 调用时传入的参数1 {Protocal}：Protocal详情请见“mb_constants.js”下的说明)；
         */
        callback_onIMData : null,

        /**
         * 【外部传入的回调方法3：客户端的登陆请求被服务端成功认证完成后的回调（事件通知于 登陆/认证 成功后）】。
         *
         * 调用时传入的参数：无参数；
         */
        callback_onIMAfterLoginSucess : null,

        /**
         * 【外部传入的回调方法4：客户端的登陆请求被服务端认证失败后的回调（事件通知于 登陆/认证 失败后）】。
         * 补充说明：登陆/认证失败的原因可能是用户名、密码等不正确等，但具体逻辑由服务端的 callBack_checkAuthToken回调函数去处理。
         *
         * 调用时传入的参数 {boolean}：true表示是掉线重连后的认证失败（在登陆其间可能用户的密码信息等发生了变更），否则表示首次登陆时的认证失败；
         */
        callback_onIMAfterLoginFailed : null,

        /**
         * 【外部传入的回调方法5：掉线重连成功后的回调（事件通知于掉线重连成功后）】。
         *
         * 调用时传入的参数：无参数；
         */
        callback_onIMReconnectSucess : null,

        /**
         * 【外部传入的回调方法6：网络连接已断开时的回调（事件通知于与服务器的网络断开后）】。
         *
         * 调用时传入的参数：无参数；
         */
        callback_onIMDisconnected : null,

        /**
         * 【外部传入的回调方法7：本地发出心跳包后的回调通知（本回调并非MobileIMSDK-H5核心逻辑，开发者可以不需要实现！）】。
         *
         * 调用时传入的参数：无参数；
         */
        callback_onIMPing : null,

        /**
         * 【外部传入的回调方法8：收到服务端的心跳包反馈的回调通知（本回调并非MobileIMSDK-H5核心逻辑，开发者可以不需要实现！）】。
         *
         * 调用时传入的参数：无参数；
         */
        callback_onIMPong : null,

        /**
         * 【外部传入的回调方法9：框架层的一些提示信息显示回调（本回调并非MobileIMSDK-H5核心逻辑，开发者可以不需要实现！）】。
         *
         * 【补充说明：开发者不设置的情况下，框架默认将调用window.alert()显示提示信息，否则将使用开发者设置的回调——目的主要是给
         *           开发者自定义这种信息的UI显示，提升UI体验，别无它用】。
         *
         * 调用时传入的参数1 {String}；必填项，文本类型，表示提示内容
         */
        callback_onIMShowAlert : null,

        /**
         * 【外部传入的回调方法10：收到服务端的“踢出”指令】。
         *
         * 调用时传入的参数1 {PKickoutInfo}：非空，详见：http://docs.52im.net/extend/docs/api/mobileimsdk/server_tcp/net/x52im/mobileimsdk/server/protocal/s/PKickoutInfo.html；
         */
        callback_onIMKickout : null,

        /**
         * 【外部传入的回调方法11：消息未送达的回调事件通知】。
         *
         * 【发生场景：比如用户刚发完消息但网络已经断掉了的情况下，表现形式如：就像手机qq或微信一样消息气泡边上会出现红色图标以示没有发送成功）.】
         * 【建议用途：应用层可通过回调中的指纹特征码找到原消息并可以UI上将其标记为”发送失败“以便即时告之用户。】
         *
         * 调用时传入的参数1 {Array<Protocal>}：由框架的QoS算法判定出来的未送达消息列表
         */
        callback_onMessagesLost : null,

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
        callback_onMessagesBeReceived : null,

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
         * 字段定义：http://docs.52im.net/extend/docs/api/mobileimsdk/server_tcp/net/x52im/mobileimsdk/server/protocal/c/PLoginInfo.html
         *
         * @returns {} 之前登陆时提交的内容
         */
        getLoginInfo : function(){
            // return this._loginInfo;
            return MBCore.getCurrentLoginInfo();
        },

        /**
         * 【公开方法4：向某人发送一条消息】.
         *
         * @param p 参数为Protocal对象，(Protocal详情请见“/libs/mobileimsdk-client-common.js”下的createCommonData4函数说明)
         * @return code {int}
         */
        sendData : function(p){
            // 将消息通过websocket发送出去
           return MBDataSender.sendCommonData(p); // TODO: 原生的mbw中没有返回值，mbwpro中有，后面的app中可对相应的业务代码进行优化！
        },

        /**
         * 【公开方法5：客户端主动断开客户端socket连接】.
         * 补充说明：当开发者登陆IM后，需要退出登陆时，调用本函数就对了，本函数相当于登陆函数 loginImpl()的逆操作
         */
        // TODO: 函数名应该重构为 logoutImpl 更合理
        disconnectSocket : function(){
            // this._socket.disconnect();

            var code = MBErrorCode.COMMON_UNKNOW_ERROR;
            // local user info 为空即意味着用户极是打开了登陆界面而尚未有登陆过，那当然就不需要退出登陆罗
            if(MBCore.getCurrentLoginInfo() != null) {
                code = MBDataSender.sendLoginout();

                if(code === 0)
                    w.IMSDK.callback_onIMLog('[SDK]  注销登陆请求已成功发出！', true);
                else
                    w.IMSDK.callback_onIMLog("[SDK]  注销登陆请求发送失败。错误码是："+code+"！", true);
            }
            else {
                // 释放IM SDK所占资源
                MBCore.release();
            }

            // 重置已经登陆过标识（此标识主要用于区分首次登陆时的界面显示）
            w.IMSDK._logined = false;
        },

        /**
         * 【公开方法6：是否开启MobileIMSDK-H5核心算法层的log输入，方便开发者调试】.
         *
         * @param enable true表示开启log输出，否则不输出，开发者不调用本函数的话系统默认是false（即不输出log）
         */
        setDebugCoreEnable : function(enable){
            // 设置debug允许标识
            MBCore.setDebugEnabled(enable);
        },

        /**
         * 【公开方法7：是否开启MobileIMSDK-H5框架层的log输入，方便开发者调试】.
         *
         * @param enable true表示开启log输出，否则不输出，开发者不调用本函数的话系统默认是false（即不输出log）
         */
        setDebugSDKEnable : function(enable){
            // 设置debug允许标识
            w.IMSDK._debugSDKEnable = enable;
        },

        /**
         * 【公开方法8：是否开启MobileIMSDK-H5框架层的底层网络socket.io心跳包的log输出，方便开发者调试】.
         *
         * 注意：必须 setDebugEnable(true) 且 setDebugPingPongEnable(true) 时，心跳log才会真正输出，方便控制。
         *
         * @param enable true表示开启log输出，否则不输出，开发者不调用本函数的话系统默认是false（即不输出log）
         */
        setDebugPingPongEnable : function(enable){
            // 设置debug允许标识
            w.IMSDK._debugPingPongEnable = enable;
        },

        /**
         * 【公开方法9：登陆IM服务器时调用的方法】。
         * 补充说明：登陆MobileIMSDK-H5服务器由本函数发起。
         *
         * 关于"this"：因为本function内的回调function属第2层，直接在第2层调用this.callback_onIMLog会
         *            报“is not function”的错误，一定要注意this的含义！！(this就是调用者，scket.on里
         *            的回调里this应该是Socket.io而不是w.IMSDK)。
         *
         * 特别注意：参数varloginInfo可以是任一JSON对象，但必须有属性及其值：loginUserId的值必须不为空且保证全局唯一
         *
         * @param varloginInfo 必填项：登陆要提交给Websocket服务器的认证信息，不可为空，对象字段定义见：http://docs.52im.net/extend/docs/api/mobileimsdk/server_tcp/net/x52im/mobileimsdk/server/protocal/c/PLoginInfo.html
         * @param wsUrl 必填项：要连接的Websocket服务器地址，不可为空，形如：http://192.168.31.190:4000
         */
        loginImpl : function (varloginInfo, wsUrl) {

            if(varloginInfo && wsUrl){

                var that = this;

                // 首先设置要连接的目标WebSocket服务地址
                MBCore.setWebsocketUrl(wsUrl);
                // // 同时保存一份登陆信息，以备登陆成功后使用
                // this._loginInfo = varloginInfo;

                /*
                 * 本地用户的登陆结果回调事件通知（此事件发生时表示客户端已登陆/连接或重连完成）。
                 *
                 * @param loginInfoResponse 即PLoginInfoResponse对象，API文档地址：http://docs.52im.net/extend/docs/api/mobileimsdk/server_tcp/net/x52im/mobileimsdk/server/protocal/s/PLoginInfoResponse.html
                 * @param loginResponseCode 服务端反馈的登录结果：0 表示登陆成功，否则为服务端自定义的出错代码（按照约定通常为>=1025的数）
                 */
                MBCore.on(MBSocketEvent.SOCKET_EVENT_ON_LOGIN_RESPONSE, function (loginInfoResponse) {
                    if(loginInfoResponse) {

                        // 返回码（用于获知被服务端是否正确登陆证的关键返回码）
                        var code = loginInfoResponse.code;
                        // // 首次登陆时间（该参数仅用于掉线重连时服务端的多端互踢判定逻辑中使用，别无他用）
                        // var firstLoginTime = loginInfoResponse.firstLoginTime;

                        if (w.IMSDK._debugSDKEnable) {
                            w.IMSDK.callback_onIMLog('[SDK]  本客户端 SOCKET_EVENT_ON_LOGIN_RESPONSE 事件已经触发（code=' + code + '）', true);
                        }

                        //  认证成功
                        if (0 === code) {// 每次掉线都会重新走一遍认证过程
                            if (w.IMSDK._debugSDKEnable) {
                                w.IMSDK.callback_onIMLog('[SDK]  本客户端 SOCKET_EVENT_ON_LOGIN_RESPONSE 事件中：登陆认证成功('
                                    + (w.IMSDK._logined ? '掉线重连' : '首次登陆') + ')！【code=' + code + '】', true);
                            }

                            // 设置在线标识
                            w.IMSDK._online = true;

                            var welcome = '';
                            // 首次登陆成功
                            if (!w.IMSDK._logined) {
                                // 通知应用层对登陆结果处理展现或处理
                                w.IMSDK.callback_onIMAfterLoginSucess();

                                // Display the welcome message
                                welcome = "[SDK]  ● ● ● ● ●【已成功登陆至 MobileIMSDK 服务器】● ● ● ● ●";
                                w.IMSDK.callback_onIMLog(welcome, true);

                                // 设置已经登陆过标识（此标识主要用于区分首次登陆时的界面显示）
                                w.IMSDK._logined = true;

                                // // 将返回的“首次登陆时间”保存，该参数仅用于掉线重连时提交给服务端（服务端多端互踢判定逻辑中会用到）
                                // // that._loginInfo.firstLoginTime = firstLoginTime;
                                // MBCore.setCurrenetLoginInfo_firstLoginTime(firstLoginTime);
                            }
                            // 掉线重连成功
                            else {
                                // Display the welcome message
                                welcome = "[SDK]  ○ ○ ○ ○ ○【已成功重连至 MobileIMSDK 服务器】○ ○ ○ ○ ○";
                                w.IMSDK.callback_onIMLog(welcome, true);

                                // 通知应用层对掉线重连成功结果处理展现或处理
                                w.IMSDK.callback_onIMReconnectSucess();
                            }
                        }
                        // 未认证成功（认证失败了）
                        else {
                            // 首次登陆时认证失败
                            if (!w.IMSDK._logined) {
                                if (w.IMSDK.callback_onIMAfterLoginFailed) {
                                    w.IMSDK.callback_onIMAfterLoginFailed(false);
                                }

                                if (w.IMSDK._debugSDKEnable) {
                                    w.IMSDK.callback_onIMLog("[SDK]  登陆认证失败，请检查您的用户名或密码！");
                                }
                            }
                            // 掉线重连时的认证失败
                            else {
                                var alertContent = '掉线重连时认证失败，请退出后重新登陆。。。';
                                // 如果开发者自已设置信息提示回调实现，就优先用开发者设置的
                                if (w.IMSDK.callback_onIMShowAlert) {
                                    w.IMSDK.callback_onIMShowAlert(alertContent);
                                }
                                // 否则用浏览器默认的alert方法（就是UI有点土）
                                else {
                                    w.alert(alertContent);
                                }

                                if (w.IMSDK.callback_onIMAfterLoginFailed) {
                                    w.IMSDK.callback_onIMAfterLoginFailed(true);
                                }
                            }

                            if (w.IMSDK._debugSDKEnable) {
                                w.IMSDK.callback_onIMLog('[SDK]  本客户端的 SOCKET_EVENT_ON_LOGIN_RESPONSE 事件中：登陆认证失败【code=' + code + '】', true);
                            }
                        }
                    }
                    else{
                        w.IMSDK.callback_onIMLog('[SDK]  本客户端的 SOCKET_EVENT_ON_LOGIN_RESPONSE 事件成功返回，但返回的loginInfoResponse是空的！', true);
                    }
                });

                /*
                 * 与服务端的通信断开的回调事件通知（此事件发生时表示客户端已掉线）。
                 * <br>
                 * 该消息只有在客户端连接服务器成功之后网络异常中断之时触发。<br>
                 * 导致与与服务端的通信断开的原因有（但不限于）：无线网络信号不稳定、WiFi与2G/3G/4G等同开情况下的网络切换、手机系统的省电策略等。
                 *
                 * @param errorCode 本回调参数表示表示连接断开的原因，目前错误码没有太多意义，仅作保留字段，目前通常为-1
                 */
                MBCore.on(MBSocketEvent.SOCKET_EVENT_ON_LINK_CLOSE, function (code) {
                    if(w.IMSDK._debugSDKEnable) {
                        w.IMSDK.callback_onIMLog('[SDK]  本客户端 SOCKET_EVENT_ON_LINK_CLOSE 事件已经触发【END】!', true);
                    }

                    //if(logined)
                    {
                        // 重置在线标识，此标识只在登陆过之后才有意义（在此无条件重置吧，防止未知情况出现导致不能复位到false）
                        w.IMSDK._online = false;
                    }

                    // // 属于首次登陆时，此时的disconnect发生的原因可能是：认证未通过、真的断网了等，
                    // // 此处复位这两个缓存量是合理的：以便用户可以再次登陆
                    // if(!w.IMSDK._logined){
                    //     w.IMSDK._loginInfo = null;
                    // }

                    if(w.IMSDK._debugSDKEnable) {
                        w.IMSDK.callback_onIMLog("[SDK]  对不起，你与IM服务器的网络连接断开了（掉线罗）...", true);
                    }

                    // 通知应用层网络掉线了
                    if(w.IMSDK.callback_onIMDisconnected){
                        w.IMSDK.callback_onIMDisconnected();
                    }
                });

                /*
                 * 收到普通消息的回调事件通知（此事件表示收到IM消息了）。
                 * <br>应用层可以将此消息进一步按自已的IM协议进行定义，从而实现完整的即时通信软件逻辑。
                 *
                 * @param protocal Protocal对象，见：http://docs.52im.net/extend/docs/api/mobileimsdk/server_netty/net/openmob/mobileimsdk/server/protocal/Protocal.html
                 */
                MBCore.on(MBSocketEvent.SOCKET_EVENT_ON_RECIEVE_MESSAGE, function (protocal) {
                    if(w.IMSDK._debugSDKEnable){
                        w.IMSDK.callback_onIMLog('[SDK]  >> 收到[聊天消息]：'+JSON.stringify(protocal), true);
                    }

                    // 将收到的消息通知应用层显示出来
                    w.IMSDK.callback_onIMData(protocal);
                });

                /*
                 * 服务端反馈的出错信息回调事件通知。
                 *
                 * @param errorCode 错误码，定义在常量表 ErrorCode.ForS 类中，见：http://docs.52im.net/extend/docs/api/mobileimsdk/server/net/openmob/mobileimsdk/server/protocal/ErrorCode.ForS.html
                 * @param errorMsg 描述错误内容的文本信息
                 */
                MBCore.on(MBSocketEvent.SOCKET_EVENT_ON_ERROR_RESPONSE, function (errorResponse) {
                    if(w.IMSDK._debugSDKEnable)
                        w.IMSDK.callback_onIMLog("[SDK]  收到服务端错误消息，errorCode="+errorResponse.errorCode+", errorMsg="+errorResponse.errorMsg, true);

                    if(errorResponse.errorCode ===  MBErrorCode.RESPONSE_FOR_UNLOGIN) {
                        //this.mainGUI.showIMInfo_brightred("服务端会话已失效，自动登陆/重连将启动! ("+errorCode+")");
                    }
                    else {
                        // this.mainGUI.showIMInfo_red("Server反馈错误码：" + errorCode + ",errorMsg=" + errorMsg);
                    }
                });

                /*
                 * 消息未送达的回调事件通知.
                 *
                 * @param lostMessages {Array<Protocal>} 由MobileIMSDK QoS算法判定出来的未送达消息列表，应用层可通过指纹特征
                 *                     码找到原消息并可以UI上将其标记为”发送失败“以便即时告之用户
                 */
                MBCore.on(MBSocketEvent.SOCKET_EVENT_MESSAGE_LOST, function (lostMessages) {
                    if(lostMessages && lostMessages.length > 0){
                        w.IMSDK.callback_onIMLog('[SDK]  收到系统的未实时送达事件通知，当前共有'+lostMessages.length+'个包QoS保证机制结束，判定为【无法实时送达】！', true);

                        if(w.IMSDK.callback_onMessagesLost)
                            w.IMSDK.callback_onMessagesLost(lostMessages);
                    }
                });

                /*
                 * 消息已被对方收到的回调事件通知.
                 *
                 * 目前，判定消息被对方收到是有两种可能：
                 *  1) 对方确实是在线并且实时收到了；
                 *  2) 对方不在线或者服务端转发过程中出错了，由服务端进行离线存储成功后的反馈（此种情况严格来讲不能算是“已被
                 * 		收到”，但对于应用层来说，离线存储了的消息原则上就是已送达了的消息：因为用户下次登陆时肯定能通过HTTP协议取到）。
                 *
                 * @param theFingerPrint {String} 已被收到的消息的指纹特征码（唯一ID），应用层可据此ID来找到原先已发生的消息并可在
                 *                          UI是将其标记为”已送达“或”已读“以便提升用户体验
                 */
                MBCore.on(MBSocketEvent.SOCKET_EVENT_MESSAGE_BE_RECIEVED, function (theFingerPrint) {
                    if(theFingerPrint){
                        w.IMSDK.callback_onIMLog('[SDK]  收到对方已收到消息事件的通知，fp='+theFingerPrint, true);

                        if(w.IMSDK.callback_onMessagesBeReceived)
                            w.IMSDK.callback_onMessagesBeReceived(theFingerPrint);
                    }
                });

                /* “自动重连尝试中”事件 */
                MBCore.on(MBSocketEvent.SOCKET_EVENT_RECONNECT_ATTEMPT, function (code) {
                    if(w.IMSDK._debugSDKEnable) {
                        w.IMSDK.callback_onIMLog('[SDK]  本客户端 SOCKET_EVENT_RECONNECT_ATTEMPT 事件已触发 ('+code+')', true);
                    }
                });

                /* 心跳包已发出事件 */
                MBCore.on(MBSocketEvent.SOCKET_EVENT_PING, function () {
                    if(w.IMSDK._debugSDKEnable && w.IMSDK._debugPingPongEnable) {
                        w.IMSDK.callback_onIMLog('[SDK]  心跳请求已发出 →', true);
                    }

                    if(w.IMSDK.callback_onIMPing)
                        w.IMSDK.callback_onIMPing();
                });

                /* 心跳响应已收到事件 */
                MBCore.on(MBSocketEvent.SOCKET_EVENT_PONG, function () {
                    if(w.IMSDK._debugSDKEnable && w.IMSDK._debugPingPongEnable) {
                        w.IMSDK.callback_onIMLog('[SDK]  心跳响应已收到 ←', true);
                    }

                    if(w.IMSDK.callback_onIMPong)
                        w.IMSDK.callback_onIMPong();
                });

                /* “被踢”事件（此事件由服务端检测到当前loginUserId已经别处登陆时发出） */
                MBCore.on(MBSocketEvent.SOCKET_EVENT_KICKOUT, function (kickoutInfo) {
                    if(w.IMSDK._debugSDKEnable) {
                        w.IMSDK.callback_onIMLog('[SDK]  本客户端 SOCKET_EVENT_KICKOUT 事件已触发，kickoutInfo='+JSON.stringify(kickoutInfo), true);
                    }

                    // 如果开发者已设置回调则交给开发者自行处理被踢后的应用层逻辑
                    if(w.IMSDK.callback_onIMKickout){
                        w.IMSDK.callback_onIMKickout(kickoutInfo);
                    }
                    // 否则直接给出提示
                    else {
                        var alertContent = '';
                        if(kickoutInfo.code === MBKickoutCode.KICKOUT_FOR_DUPLICATE_LOGIN){
                            alertContent = '账号已在其它地方登陆，当前会话已断开，请退出后重新登陆！';
                        }
                        else if(kickoutInfo.code === MBKickoutCode.KICKOUT_FOR_ADMIN){
                            alertContent = '已被管理员强行踢出聊天，当前会话已断开！';
                        }
                        else{
                            alertContent = '你已被踢出聊天，当前会话已断开（kickoutInfo='+JSON.stringify(kickoutInfo)+'）！';
                        }

                        // Just for debug
                        if(w.IMSDK._debugSDKEnable) {
                            w.IMSDK.callback_onIMLog('[SDK]  '+alertContent, false);
                        }

                        // 如果开发者自已设置信息提示回调实现，就优先用开发者设置的
                        if(w.IMSDK.callback_onIMShowAlert){
                            w.IMSDK.callback_onIMShowAlert(alertContent);
                        }
                        // 否则用浏览器默认的alert方法（就是UI有点土）
                        else{
                            w.alert(alertContent);
                        }
                    }

                    // 重置已经登陆过标识（此标识主要用于区分首次登陆时的界面显示）
                    w.IMSDK._logined = false;
                });


                // 真正发出登陆请求网络指令
                var code = MBDataSender.sendLogin(varloginInfo);
                if(code === 0)
                    w.IMSDK.callback_onIMLog('[SDK]  登陆/连接信息已发出（等待底层Socket反馈和服务端响应中...）！', true);
                else{
                    w.IMSDK.callback_onIMLog('[SDK]  数据发送失败。错误码是：'+code+'！', true);

                    var alertContent = '数据发送失败。错误码是：'+code+'！';
                    // 如果开发者自已设置信息提示回调实现，就优先用开发者设置的
                    if(w.IMSDK.callback_onIMShowAlert){
                        w.IMSDK.callback_onIMShowAlert(alertContent);
                    }
                    // 否则用浏览器默认的alert方法（就是UI有点土）
                    else{
                        w.alert(alertContent);
                    }
                }
            }
            else{
                var alertContent = '无效的参数：varloginInfo='+varloginInfo+'、wsUrl='+wsUrl;
                // 如果开发者自已设置信息提示回调实现，就优先用开发者设置的
                if(w.IMSDK.callback_onIMShowAlert){
                    w.IMSDK.callback_onIMShowAlert(alertContent);
                }
                // 否则用浏览器默认的alert方法（就是UI有点土）
                else{
                    w.alert(alertContent);
                }
            }
        },
    };

    // some other code line

})();