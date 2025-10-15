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
 * 数据发送处理实用类。
 * 本类是MobileIMSDK框架的唯一提供数据发送的公开实用类。
 *
 * @author Jack Jiang(http://www.52im.net/thread-2792-1-1.html)
 */
const MBDataSender = (function () {

    const TAG = "MBDataSender";

    // 构造器（相当于java里的构造方法）
    let ModuleMBDataSender = function (argument) {
        //
    };

    // /**
    //  * 发送登陆(连接)信息给服务端。
    //  *
    //  * @param loginInfo {LoginInfo} 完整的登陆信息对象
    //  * @return {int} 0表示数据发出成功，否则返回的是错误码
    //  * @see #sendLogin()
    //  */
    // ModuleMBDataSender.prototype.sendLoginInfo = function(loginInfo){
    //     // 登陆信息各字段定义见：
    //     // http://docs.52im.net/extend/docs/api/mobileimsdk/server_tcp/net/x52im/mobileimsdk/server/protocal/c/PLoginInfo.html
    //     return this.sendLogin(loginInfo.loginUserId, loginInfo.loginToken, loginInfo.loginExtra);
    // };

    /**
     * 发送登陆(连接)信息给服务端。
     *
     * @param loginInfo {PLoginInfo} 登陆信息各字段定义见：http://docs.52im.net/extend/docs/api/mobileimsdk/server_tcp/net/x52im/mobileimsdk/server/protocal/c/PLoginInfo.html
     * @return {int} 0表示数据发出成功，否则返回的是错误码
     * @see #sendLoginImpl()
     */
    ModuleMBDataSender.prototype.sendLogin = function(loginInfo){

        /* ========================================【补充说明】=====================================================
           登陆代码中，进行与服务端连接与否的检查，是登陆逻辑中特有的（其它正常发送时不需要有这种检查），因为正常的数据通信系统中，
           登陆验证是第一步，也是必须的一步，此步里进行连接检查（如果未连接就进行连接的发起）、身份认证等，此步正常结束后，才是一
           个通信系统能正常工作的开始，这是很合理的逻辑。而netty中的连接建立通常都是异步完成，所以通过观察者来获得连接建立的结果
           是必要的！ ============================================================================================== */

        // 确保登陆指令在连接没有准备好的情况下，通过设置回调，可以在连接建立后第一时间被补充发送（只有登陆指令需要这样哦）
        // 补充：设置这个观察者后，什么时候被调用呢？它将在下方的 sendLoginImpl() 执行时，通过获取socket引用时的连接建
        //      立逻辑中被调用（是的，理解起来有点绕，但这就是netty的设计，确实不同时通常的socket api设计）。
        if(!MBSocketProvider.isLocalSocketReady()) {

            if(MBCore.debugEnabled())
                MBUtils.mblog_d(TAG, "发送登陆指令时，socket连接未就绪，首先开始尝试发起连接（登陆指令将在连接成功后的回调中自动发出）。。。。");

            let that = this;
            let connectionDoneCallback = function(sucess, extraObj){
                // 成功建立了Websocket连接后立即把登陆包发出去
                if(sucess)
                    that.sendLoginImpl(loginInfo);
                // TCP连接建立失败
                else
                    MBUtils.mblog_w(TAG, "[来自ws连接结果回调观察者通知]socket连接失败，本次登陆信息未成功发出！");
            };
            // 调置连接回调
            MBSocketProvider.setConnectionDoneCallback(connectionDoneCallback);

            // 主要是为了触发 LocalUDPSocketProvider中的 tryConnectToHost()调用
            // ，connect完后将自动调用上方设置的回调，从而实现登陆指令在连接成功后的发送
            return MBSocketProvider.resetLocalSocket() != null
                ? MBErrorCode.COMMON_CODE_OK : MBErrorCode.BAD_CONNECT_TO_SERVER;
        }
        else{
            // 发送登陆指令
            return this.sendLoginImpl(loginInfo);
        }
    };

    /**
     * 发送登陆指令的真正实现函数。
     * 提示：本函数由 {@link #sendLogin()}函数调用，一般不单使用。
     *
     * 【注意】：本库的客户端启动入口就是登陆过程触发的，因而要使本库能正常工作，请确保首先进行登陆操作（其内
     * 部实现包括：WebSocket首次连接建立、认证指令发出）。
     *
     * @param loginInfo {PLoginInfo} 登陆信息各字段定义见：http://docs.52im.net/extend/docs/api/mobileimsdk/server_tcp/net/x52im/mobileimsdk/server/protocal/c/PLoginInfo.html
     * @return {int} 0表示数据发出成功，否则返回的是错误码
     */
    ModuleMBDataSender.prototype.sendLoginImpl = function(loginInfo) {
        // byte[] b = ProtocalFactory.createPLoginInfo(loginUserId, loginToken, extra).toBytes();

        let p = MBProtocalFactory.createPLoginInfo(loginInfo.loginUserId, loginInfo);
        let code = this.send(JSON.stringify(p));
        // 登陆信息成功发出时就把登陆名存下来
        if(code === 0) {
            // let currentLoginInfo = {
            //     loginUserId : loginUserId,
            //     loginToken  : loginToken,
            //     loginExtra  : extra,
            //
            //     firstLoginTime : 0
            // };

            MBCore.setCurrenetLoginInfo(loginInfo);
        }

        return code;
    };

    /**
     * 发送注销登陆信息.
     *
     * 【注意】：此方法的调用将被本库理解为退出库的使用，本方法将会额外调用资源释放方法{@link MBCore#release()}，以保证资源释放。
     * 【提示】：本方法调用后，除非再次进行登陆过程，否则核心库将处于初始未初始化状态。
     *
     * @return {int} 0表示数据发出成功，否则返回的是错误码
     */
    ModuleMBDataSender.prototype.sendLoginout = function() {
        let code = MBErrorCode.COMMON_CODE_OK;
        if(MBCore.isLoginHasInit()) {
            // byte[] b = ProtocalFactory.createPLoginoutInfo(ClientCoreSDK.getInstance().getCurrentLoginUserId()).toBytes();

            let p = MBProtocalFactory.createPLoginoutInfo(MBCore.getCurrentLoginInfo().loginUserId);
            code = this.send(JSON.stringify(p));
            // 登出信息成功发出时
            if(code === 0) {
                // do nothing
            }
        }

        // 释放SDK资源
        MBCore.release();

        return code;
    };

    /**
     * 发送Keep Alive心跳包.
     *
     * @return {int} 0表示数据发出成功，否则返回的是错误码
     */
    ModuleMBDataSender.prototype.sendKeepAlive = function() {
        let p = MBProtocalFactory.createPKeepAlive(MBCore.getCurrentLoginInfo().loginUserId);
        // byte[] b = ProtocalFactory.createPKeepAlive(ClientCoreSDK.getInstance().getCurrentLoginUserId()).toBytes();
        return this.send(JSON.stringify(p));
    };

    /**
     * 通用数据发送的根方法。
     *
     * @param p {Protocal} 要发送的内容（MobileIMSDK框架的“协议”DTO对象组织形式）
     * @return {int} 0表示数据发出成功，否则返回的是错误码
     * @see #send()
     */
    ModuleMBDataSender.prototype.sendCommonData = function(p) {
        if(p) {
            // byte[] b = p.toBytes();
            let dataWithString = JSON.stringify(p);
            let code = this.send(dataWithString);
            if(code === 0) {
                // 【【C2C或C2S模式下的QoS机制1/4步：将包加入到发送QoS队列中】】
                // 如果需要进行QoS质量保证，则把它放入质量保证队列中供处理(已在存在于列
                // 表中就不用再加了，已经存在则意味当前发送的这个是重传包哦)
                if(p.QoS && !MBQoS4SendDaemon.exist(p.fp))
                    MBQoS4SendDaemon.put(p);
            }
            return code;
        }
        else
            return MBErrorCode.COMMON_INVALID_PROTOCAL;
    };

    /**
     * 发送数据到服务端.
     *
     * 【注意】：直接调用此方法将无法支持QoS质量保证哦！
     * 【提示】：本函数由本类中的 sendXXXX() 函数调用，一般不单开放给外部类使用。
     *
     * @param dataWithString {String} Protocal对象转成JSON后的字符串
     * @return {int} 0表示数据发出成功，否则返回的是错误码
     */
    ModuleMBDataSender.prototype.send = function(dataWithString) {

        // 获得netty的channel实例
        let websocket = MBSocketProvider.getLocalSocket();

        // 关于WebSocket的readyState字段值含义，请见：
        // https://developer.mozilla.org/zh-CN/docs/Web/API/WebSocket/readyState
        if(websocket != null && websocket.readyState === 1){// && [ClientCoreSDK sharedInstance].connectedToServer)
            return MBUtils.send(websocket, dataWithString)? MBErrorCode.COMMON_CODE_OK : MBErrorCode.COMMON_DATA_SEND_FAILD;
            // return TCPUtils.send(ds, fullProtocalBytes, dataLen) ? ErrorCode.COMMON_CODE_OK : ErrorCode.COMMON_DATA_SEND_FAILD;
        }
        else{
            // 此种情况下的消息，将在应用层由QoS机制进行重传或不重传保证，所以此代码下无需再处理了
            // 【补充说明】：此种情况下的发送成功并不是真正的成功，只是作为上层判断的依据而已，（因整个socket
            // 操作等都是Netty异步完成，理论上发出成功不意味着实际被成功收到哦），但这并不会影响体验，因为
            // MobileIMSDK本身存在QoS送达保证机制，会在底层保证消息不会莫名消失，UI层也会稍后在回调中通知是否真正送达
            MBUtils.mblog_d(TAG, "scocket未连接，无法发送，本条将被忽略（dataWithString="+dataWithString+"）!");
            return MBErrorCode.COMMON_CODE_OK;
        }
    };

    // 实例化此类
    return new ModuleMBDataSender();
})();