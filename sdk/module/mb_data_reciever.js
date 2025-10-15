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
 * 数据接收辅助类（因html5的websocket的数据接收不需要像经典的BIO那样需开发者自已启动单独
 * 的线程，所以本类就简化成了一个辅助类，只是类命名为了兼容性，作了保留，请勿困惑）。
 *
 * 主要工作是将收到的数据进行解析并按MobileIMSDK框架的协议进行调度和处理。
 * 本类是MobileIMSDK框架数据接收处理的唯一实现类，也是整个框架算法最为关键的部分。
 *
 * 注意：本线程的启停，目前属于MobileIMSDK算法的一部分，暂时无需也不建议由应用层自行调用。
 *
 * @author Jack Jiang(http://www.52im.net/thread-2792-1-1.html)
 */
const MBDataReciever = (function () {

    const TAG = "MBDataReciever";

    // 构造器（相当于java里的构造方法）
    let ModuleMBDataReciever = function (argument) {
        //
    };

    /**
     * 处理通过WebSocket收到的原始数据包，将根据定义的协议类型进入相应的处理逻辑。
     *
     * @param pFromServer {Protocal} 解析出的MobileIMSDK数据包对象
     */
    ModuleMBDataReciever.prototype.handleProtocal = function(pFromServer) {
        // if(protocalJSONString && protocalJSONString.length > 0){
        if(pFromServer){

            try {
                // var pFromServer = JSON.parse(protocalJSONString);

                // ## 如果该消息是需要QoS支持的包
                if (pFromServer.QoS) {
                    // # Bug FIX B20170620_001 START 【1/2】
                    // # [Bug描述]：当服务端认证接口返回非0的code时，客记端会进入自动登陆尝试死循环。
                    // # [Bug原因]：原因在于客户端收到服务端的响应包时，因服务端发过来的包需要QoS，客户端会先发送一
                    //             个ACK包，那么此ACK包到达服务端后会因客户端“未登陆”而再次发送一“未登陆”错误信息
                    //             包给客户端，客户端在收到此包后会触发自动登陆重试，进而进入死循环。
                    // # [解决方法]：客户端判定当收到的是服务端的登陆响应包且code不等于0就不需要回ACK包给服务端。
                    // # [此解决方法带来的服务端表现]：服务端会因客户端网络关闭而将响应包进行重传直到超时丢弃，但并不影响什么。
                    if (pFromServer.type === MBProtocalType.FROM_SERVER_TYPE_OF_RESPONSE$LOGIN
                        && JSON.parse(pFromServer.dataContent).code !== 0){

                        // && ProtocalFactory.parsePLoginInfoResponse(pFromServer.getDataContent()).getCode() != 0)
                        if (MBCore.debugEnabled())
                            MBUtils.mblog_d(TAG, "【BugFIX】这是服务端的登陆返回响应包，且服务端判定登陆失败(即code!=0)，本次无需发送ACK应答包！");
                    }
                    // # Bug FIX 20170620 END 【1/2】
                    else {
                        // 且已经存在于接收列表中（及意味着可能是之前发给对方的应答包因网络或其它情况丢了，对方又因QoS机制重新发过来了）
                        if (MBQoS4ReciveDaemon.hasRecieved(pFromServer.fp)) {
                            if (MBCore.debugEnabled())
                                MBUtils.mblog_d(TAG, "【QoS机制】" + pFromServer.fp + "已经存在于发送列表中，这是重复包，通知应用层收到该包罗！");

                            //----------------------------------------- [1]代码与[2]处相同的哦 S
                            // 【【C2C、C2S、S2C模式下的QoS机制2/4步：将收到的包存入QoS接收方暂存队列中（用于防重复）】】
                            MBQoS4ReciveDaemon.addRecievedProtocal(pFromServer);
                            // 【【C2C、C2S、S2C模式下的QoS机制3/4步：回应答包】】给发送者回一个“收到”应答包
                            this.sendRecievedBack(pFromServer);
                            //----------------------------------------- [1]代码与[2]处相同的哦 E

                            // 此包重复，不需要通知应用层收到该包了，直接返回
                            return;
                        }

                        //----------------------------------------- [2]代码与[1]处相同的哦 S
                        // 【【C2C、C2S、S2C模式下的QoS机制2/4步：将收到的包存入QoS接收方暂存队列中（用于防重复）】】
                        MBQoS4ReciveDaemon.addRecievedProtocal(pFromServer);
                        // 【【C2C、C2S、S2C模式下的QoS机制3/4步：回应答包】】给发送者回一个“收到”应答包
                        this.sendRecievedBack(pFromServer);
                        //----------------------------------------- [2]代码与[1]处相同的哦 E
                    }
                }

                // 真正的指令处理逻辑
                switch (pFromServer.type) {
                    // ** 收到通用数据
                    case MBProtocalType.FROM_CLIENT_TYPE_OF_COMMON$DATA: {
                        this.onRecievedCommonData(pFromServer);
                        break;
                    }
                    //** 收到服务反馈过来的心跳包
                    case MBProtocalType.FROM_SERVER_TYPE_OF_RESPONSE$KEEP$ALIVE: {
                        this.onServerResponseKeepAlive();
                        break;
                    }
                    //** 收到好友发过来的QoS应答包
                    case MBProtocalType.FROM_CLIENT_TYPE_OF_RECIVED: {
                        this.onMessageRecievedACK(pFromServer);
                        break;
                    }
                    // ** 收到服务端反馈过来的登陆完成信息
                    case MBProtocalType.FROM_SERVER_TYPE_OF_RESPONSE$LOGIN: {
                        this.onServerResponseLogined(pFromServer);
                        break;
                    }
                    // ** 服务端返回来过的错误消息
                    case MBProtocalType.FROM_SERVER_TYPE_OF_RESPONSE$FOR$ERROR: {
                        this.onServerResponseError(pFromServer);
                        break;
                    }
                    // ** 服务端发回来过的“重复登录被踢”消息
                    case MBProtocalType.FROM_SERVER_TYPE_OF_KICKOUT: {
                        this.onKickout(pFromServer);
                        break;
                    }
                    default: {
                        MBUtils.mblog_w(TAG, "收到的服务端消息类型：" + pFromServer.getType() + "，但目前该类型客户端不支持解析和处理！");
                        break;
                    }
                }
            }
            catch (e) {
                MBUtils.mblog_w(TAG, "处理消息的过程中发生了错误.", e);
            }
        }
        else {
            MBUtils.mblog_d(TAG, "无效的pFromServer（"+pFromServer+"）！");
        }
    };

    /**
     * 收到通用数据时的处理逻辑。
     *
     * @param pFromServer {Protocal} 原始数据包
     */
    ModuleMBDataReciever.prototype.onRecievedCommonData = function(pFromServer) {
//		MBUtils.mblog_d(TAG, ">>>>>>>>>>>>>>>>>>>>>>>>>>>>收到"+pFromServer.getFrom()+"发过来的消息："+pFromServer.getDataContent()+".["+pFromServer.getTo()+"]");
        // 收到通用数据的回调
        MBCore.emit(MBSocketEvent.SOCKET_EVENT_ON_RECIEVE_MESSAGE, pFromServer);
    };

    /**
     * 收到服务端的心跳响应包时的处理逻辑。
     */
    ModuleMBDataReciever.prototype.onServerResponseKeepAlive = function() {
        if (MBCore.debugEnabled())
            MBUtils.mblog_d(TAG, "收到服务端回过来的Keep Alive心跳响应包.");

        // 给应用层发出pong事件通知
        MBCore.emit(MBSocketEvent.SOCKET_EVENT_PONG, null);

        // 更新服务端的最新响应时间（该时间将作为计算网络是否断开的依据）
        MBKeepAliveDaemon.updateGetKeepAliveResponseFromServerTimstamp();
    };

    /**
     * 收到ACK消息应答时的处理逻辑。
     *
     * @param pFromServer {Protocal} 原始数据包
     */
    ModuleMBDataReciever.prototype.onMessageRecievedACK = function(pFromServer) {
        // 应答包的消息内容即为之前收到包的指纹id
        var theFingerPrint = pFromServer.dataContent;
        if (MBCore.debugEnabled())
            MBUtils.mblog_d(TAG, "【QoS】收到" + pFromServer.from + "发过来的指纹为" + theFingerPrint + "的应答包.");

        // 将收到的应答事件通知事件处理者
        MBCore.emit(MBSocketEvent.SOCKET_EVENT_MESSAGE_BE_RECIEVED, theFingerPrint);

        // 【【C2C或C2S模式下的QoS机制4/4步：收到应答包时将包从发送QoS队列中删除】】
        MBQoS4SendDaemon.remove(theFingerPrint);
    };

    /**
     * 收到登陆响应包的处理逻辑。
     *
     * @param pFromServer {Protocal} 原始数据包
     */
    ModuleMBDataReciever.prototype.onServerResponseLogined = function(pFromServer) {
        // 解析服务端反馈过来的登陆消息对象，该PLoginInfoResponse对象的API文档：
        // http://docs.52im.net/extend/docs/api/mobileimsdk/server_tcp/net/x52im/mobileimsdk/server/protocal/s/PLoginInfoResponse.html
        var loginInfoRes = JSON.parse(pFromServer.dataContent);

        // 登陆成功了！
        if (loginInfoRes.code === 0) {

            // 代码至此，loginHasInit字段未设置时即表示这是首次"成功登陆"
            if(!MBCore.isLoginHasInit()) {
                MBUtils.mblog_d(TAG, "首次登陆验证成功，firstLoginTime="+loginInfoRes.firstLoginTime);
                // 将返回的“首次登陆时间”保存，该参数仅用于掉线重连时提交给服务端（服务端多端互踢判定逻辑中会用到）
                MBCore.setCurrenetLoginInfo_firstLoginTime(loginInfoRes.firstLoginTime);
            }

            this.fireConnectedToServer();
        } else {
            MBUtils.mblog_d(TAG, "登陆验证失败，错误码="+loginInfoRes.code+"！");

//			// # Bug FIX B20170620_001 START 【2/2】
//			// 登陆失败后关闭网络监听是合理的作法
//			LocalUDPDataReciever.getInstance().stop();
//			// # Bug FIX B20170620_001 END 【2/2】

            // 登陆失败后关闭网络监听是合理的作法
            MBSocketProvider.closeLocalSocket();

            // 设置中否正常连接（登陆）到服务器的标识（注意：在要event事件通知前设置哦，因为应用中是在event中处理状态的）
            MBCore.setConnectedToServer(false);
        }

        // 用户登陆认证情况事件通知
        // MBCore.emit(MBSocketEvent.SOCKET_EVENT_ON_LOGIN_RESPONSE, loginInfoRes.code);
        MBCore.emit(MBSocketEvent.SOCKET_EVENT_ON_LOGIN_RESPONSE, loginInfoRes);
    };

    /**
     * 收到服务端的错误信息包时的处理逻辑。
     *
     * @param pFromServer {Protocal} 原始数据包
     */
    ModuleMBDataReciever.prototype.onServerResponseError = function(pFromServer) {
        // 解析服务端反馈过来的消息
        var errorRes = JSON.parse(pFromServer.dataContent);
        // PErrorResponse errorRes = ProtocalFactory.parsePErrorResponse(pFromServer.getDataContent());

        // 收到的如果是“尚未登陆”的错误消息，则意味着该用户的socket会话可能是非法的，接着就该中止心跳并启动重连机制
        if (errorRes.errorCode === MBErrorCode.RESPONSE_FOR_UNLOGIN) {
            //
            MBCore.setLoginHasInit(false);

            MBUtils.mblog_e(TAG, "收到服务端的“尚未登陆”的错误消息，心跳线程将停止，请应用层重新登陆.");
            // 停止心跳
            MBKeepAliveDaemon.stop();

            // 此时尝试延迟开启自动登陆线程哦（注意不需要立即开启）
            // ** 【说明】：为何此时要开启自动登陆呢？逻辑上讲，心跳时即是连接正常时，上面的停止心跳即是登陆身份
            // ** 丢失时，那么此时再开启自动登陆线程则也是合理的。
            // ** 其实此处开启自动登陆线程是更多是为了防止这种情况：当客户端并没有触发网络断开（也就不会触发自动登
            // ** 陆）时，而此时却可能因延迟等错误或时机不对的情况下却收到了“未登陆”回复时，就会关闭心跳，但自动重新登陆
            // ** 却再也没有机会启动起来，那么这个客户端将会因此而永远（直到登陆程序后再登陆）无法重新登陆而一直处于离线
            // ** 状态，这就不对了。以下的启动重新登陆时机在此正可解决此种情况，而使得重新登陆机制更强壮哦！
            MBAutoReLoginDaemon.start(false);
        }

        // 收到错误响应消息的回调
        MBCore.emit(MBSocketEvent.SOCKET_EVENT_ON_ERROR_RESPONSE, errorRes);
    };

    /**
     * 收到服务端发回来过的“重复登录被踢”消息时的处理逻辑。
     *
     * @param pFromServer {Protocal} 原始数据包
     */
    ModuleMBDataReciever.prototype.onKickout = function(pFromServer){

        if (MBCore.debugEnabled())
            MBUtils.mblog_d(TAG, "收到服务端发过来的“重复登录被踢”消息.");

        /* 收到被踢指令后，主动断开本地连接等一系列通信资源等释放动作 */
        MBCore.release();

        /* 解析服务端发过来的被踢指令消息内容，该内容对象的API文档：
           http://docs.52im.net/extend/docs/api/mobileimsdk/server_tcp/net/x52im/mobileimsdk/server/protocal/s/PKickoutInfo.html */
        var kickoutInfo = JSON.parse(pFromServer.dataContent);

        /* 给应用层发出“被踢”事件通知 */
        MBCore.emit(MBSocketEvent.SOCKET_EVENT_KICKOUT, kickoutInfo);
        /* 给应用层发出“网络已断开”事件通知（因被踢出不是正常的掉线，所以不应走MBKeepAlive.notifyConnectionLost()这个逻辑，上
           方面的MBCore.release()释放掉所有通信资源后，此处就只需要简单地向ui层发出一个断网事件通知即可，方便ui刷新，别无它用） */
        MBCore.emit(MBSocketEvent.SOCKET_EVENT_ON_LINK_CLOSE, -1);
    };

    /**
     * 登陆服务端成功后的处理逻辑。
     */
    ModuleMBDataReciever.prototype.fireConnectedToServer = function() {
        var that = this;

        // 标记已完成首次登陆服务端
        MBCore.setLoginHasInit(true);

        // 尝试关闭自动重新登陆线程（如果该线程正在运行的话）
        MBAutoReLoginDaemon.stop();

        // 服务端的网络断开后会调用的回调函数
        var networkConnectionLostCallBack = function(){
            that.fireDisconnectedToServer();
        };
        // 立即开启Keepalive心跳线程
        MBKeepAliveDaemon.setNetworkConnectionLostCallback(networkConnectionLostCallBack);

        // ** 2015-02-10 by Jack Jiang：收到登陆成功反馈后，无需立即就发起心跳，因为刚刚才与服务端
        // ** 成功通信了呢（刚收到服务器的登陆成功反馈），节省1次心跳，降低服务重启后的“雪崩”可能性
        MBKeepAliveDaemon.start(false);

        //【登陆成功后开启QoS机制】启动QoS机制之发送列表重视机制
        MBQoS4SendDaemon.startup(true);
        // 启动QoS机制之接收列表防重复机制
        MBQoS4ReciveDaemon.startup(true);
        // 设置中否正常连接（登陆）到服务器的标识（注意：在要event事件通知前设置哦，因为应用中是在event中处理状态的）
        MBCore.setConnectedToServer(true);
    };

    /**
     * 与服务端断开连接后的处理逻辑。
     */
    ModuleMBDataReciever.prototype.fireDisconnectedToServer = function() {
        // 设置是否正常连接（登陆）到服务器的标识
        // （注意：在要onLinkCloseMessage事件通知前设置哦，因为应用中是在事件通知中处理状态的）
        MBCore.setConnectedToServer(false);

        //【掉线后关掉QoS机制，为手机省电】
        // 掉线时关闭QoS机制之发送列表重视机制（因为掉线了开启也没有意义）
        // ** 关闭但不清空可能存在重传列表是合理的，防止在网络状况不好的情况下，登
        // ** 陆能很快恢复时也能通过重传尝试重传，即使重传不成功至少也可以提示一下
        // 20170408 by Jack Jiang：为了让掉线情况下的消息发送能尽快作为“未实时送
//							达”包反馈到UI层从而提升体验，而不关闭发送质量保证线程
//		QoS4SendDaemon.getInstance(context).stop();

        // 尝试关闭本地Socket（确保已经变“坏”的socket被重置）
        MBSocketProvider.closeLocalSocket();

        // 掉线时关闭QoS机制之接收列表防重复机制（因为掉线了开启也没有意义）
        // ** 关闭但不清空可能存在缓存列表是合理的，防止在网络状况不好的情况下，登
        // ** 陆能很快恢复时对方可能存在的重传，此时也能一定程序避免消息重复的可能
        MBQoS4ReciveDaemon.stop();

        // 通知回调实现类

        // if(ClientCoreSDK.getInstance().getChatBaseEvent() != null)
        //     ClientCoreSDK.getInstance().getChatBaseEvent().onLinkClose(-1);
        MBCore.emit(MBSocketEvent.SOCKET_EVENT_ON_LINK_CLOSE, -1);
        // 网络断开后即刻开启自动重新登陆线程从而尝试重新登陆（以便网络恢复时能即时自动登陆）
        MBAutoReLoginDaemon.start(true);// 建议：此参数可由true改为false，防止服务端重启等情况下，客户端立即重连等
    };

    /**
     * 发送消息应答指令。
     *
     * @param pFromServer {Protocal} 原始数据包
     */
    ModuleMBDataReciever.prototype.sendRecievedBack = function(pFromServer) {
        if (pFromServer.fp) {

            var pForRecivedBack = MBProtocalFactory.createRecivedBack(pFromServer.to, pFromServer.from, pFromServer.fp);
            var code = MBDataSender.sendCommonData(pForRecivedBack);

            if (MBCore.debugEnabled())
                MBUtils.mblog_d(TAG, "【QoS】向" + pFromServer.from + "发送" + pFromServer.fp + "包的应答包成功？(code="+code+"),from=" + pFromServer.to + "！");
        } else {
            MBUtils.mblog_w(TAG, "【QoS】收到" + pFromServer.from + "发过来需要QoS的包，但它的指纹码却为null！无法发应答包！");
        }
    };

    // 实例化此类
    return new ModuleMBDataReciever();
})();