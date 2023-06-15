// Express框架实例
var app = require('./app');

// Http服务实例
/**----- 启用普通HTTP START -----*/
var http = require('http');
/**----- 启用普通HTTP END -----*/
/**----- 启用HTTPS START -----*/
// var https = require('https');
// var fs = require('fs');
/**----- 启用HTTPS END -----*/

// MobileIMSDK-Web版服务端的配置项实例
var imConfig = require('mobileimsdk_web_server/j_conf/config');
// MobileIMSDK-Web版服务端的通用方法实例
var common = require('mobileimsdk_web_server/j_common/common');
// MobileIMSDK-Web版服务端的log4js日志框架实例
var logger = require('mobileimsdk_web_server/j_conf/log').logger;

// RainbowChat-Web服务端的配置项实例
var config = require('./conf/config');
// RainbowChat-Web服务端的常量表实例
var constant = require('./conf/constant');
// RainbowChat-Web的聊天服务逻辑管理器（除群聊天）
var ChatLogicManager = require('./impl/chat_logic_manager');
// 高速缓存提供者对象
var CacheProvider = require('./impl/cache-provider-mysql');     // TODO: 用于MySQL数据库时，请启用此行
// var CacheProvider = require('./logic/cache-provider-mssql'); // TODO: 用于SQLServer数据库时，请启用此行


/** -----------------------------------------------------------------------------------
 * Get port from environment and store in Express.
 */

var port = common.normalizePort(process.env.PORT || '80');
app.set('port', port);


/** -----------------------------------------------------------------------------------
 * Create HTTP server.
 */

/**----- 启用普通HTTP START -----*/
var server = http.createServer(app);
/**----- 启用普通HTTP END -----*/
/**----- 启用HTTPS START -----*/
// const options = {
//  key: fs.readFileSync('../ca/local/server-key.key'),
//  cert: fs.readFileSync('../ca/local/server-cert.crt')
// };
// var server = https.createServer(options, app);
/**----- 启用HTTPS END -----*/


/** -----------------------------------------------------------------------------------
 * Create 用于存储离线消息等的MQ生产者.
 */

// var dbMsgProducer = require('./impl/im2mq-producer');
// // 启动此MQ消息生产者
// dbMsgProducer.start();


/** -----------------------------------------------------------------------------------
 * Create RainbowChat-Web server.
 */

// TODO: 如要与RainbowChat APP版互通，请开启以下代码！
// 与APP产品的互通开关
imConfig.im_bridge_enabled = config.IMMQ_BRIDGE_ENABLED;
// 与APP产品的互通桥接MQ配置
imConfig.im_mq_server_url = config.IMMQ_IMBRIDGE_URL;


// MobileIMSDK-Web版的SDK主入口
var imServerSDK = require('mobileimsdk_web_server/j_core/im-server-sdk');
// 创建MobileIMSDK-Web版服务端的服务
// （注：如您需要更改socket.io的默认参数，请参见官方文档：https://github.com/socketio/engine.io#methods-1）
imServerSDK.createServer(server, {
  'pingTimeout':5000, // 本参数表示客户端检测网络掉线的超时时间(单位：毫秒），如不设置则默认是60000（即60秒），此值越大会让客户端感知掉线的时间越长
  'pingInterval':5000 // 本参数表示客户端的心跳间隔(单位：毫秒），如不设置则默认是25000（即25秒），此值越大会让客户端感知掉线的灵敏度越差
});
// 设置连接认证回调
imServerSDK.setCallBack_checkAuthToken(callBack_CheckAuthToken);
// 设置个人认证后信息的处理回调
imServerSDK.setCallBack_authedInfo(callBack_authedInfo);
// 设置用户上线回调
imServerSDK.setCallBack_userOnline(callBack_userOnline);
// 设置用户离线回调
imServerSDK.setCallBack_userOffline(callBack_userOffline);
// 设置C2S消息回调
imServerSDK.setCallBack_receivedC2SMessage(callBack_receivedC2SMessage);
// 设置C2C消息回调
imServerSDK.setCallBack_transferedC2CMessage(callBack_transferedC2CMessage);
// 设置离线消息处理回调
imServerSDK.setCallBack_processC2COfflineMessage(callBack_processC2COfflineMessage);


/** -----------------------------------------------------------------------------------
 * IM服务端SDK的各种回调方法实现.
 */

/**
 * IMServerSDK的回调函数：连接认证时的认证实现函数。
 *
 * 【本回调建议用途】：
 * 开发者可在本方法中实现用户、密码验证或其它安全机制的处理，本方法调用于与服务器的合法通道建立前。
 *
 * @param loginInfo 客户端传过来的用于认证的JSON对象，具体内容由客户端指定，本回调将原样
 *                    传过来(但必须存在名为loginName的属性且值不可为空且全局唯一)
 * @param fn 此回调由MobileIMSDK-Web在调用回调callBack_CheckAuthToken时自动传入并调用，开发者无需理会，也不可更改
 * @see im-server-sdk.js -> "mobule.export = setCallBack_checkAuthToken(fn)"
 */
function callBack_CheckAuthToken(loginInfo, fn) {

  //*********************************************************************** START
  // TODO 你可在此填写登陆/掉线重连认证代码实现：（true表示验证成功，false表示失败） START
  //var authOK = false; // 验证失败！
  var authOK = true;    // 验证成功！
  // TODO 你可在此填写登陆/掉线重连认证代码实现：（true表示验证成功，false表示失败） END
  //*********************************************************************** END

  // logger.info('[IM应用层-回调] 已收到sdk的连接认证回调，loginInfo=%s, 认证结果=%s', JSON.stringify(loginInfo), authOK);

  // 此回调请原样照写，不可更改：即将认证结果传回第2层回调（fn回调函数来自SDK内部，原样传过去即可）
  fn(null, authOK);
}

/**
 * IMServerSDK的回调函数：用于用户认证成功后将调用本回调函数。。
 *
 * 【本回调建议用途】：
 * 开发者可在此回调中放入自已需要的更新多信息，因为此回调的结果将会被放于客户端的socket连接会话中，
 * 后绪的其它回调中将可拿到此值，此值的存放相当于Web应用中将用户的个人信息存放在Session中的属性。
 *
 * @param loginInfo 用户登陆时提交上来的信息
 * @return 返回开发者更改后的个人认证信息（开发者要可能需要自已添加一些内容等），如不想处理则原样返回吧
 */
function callBack_authedInfo(loginInfo){
  return loginInfo;
}

/**
 * IMServerSDK的回调函数：用户上线回调。
 *
 * 【本回调建议用途】：
 * 开发者可在此回调中处理用户上线时的代码。
 *
 * @param userId
 * @param socket
 */
function callBack_userOnline(userId, socket){
  // logger.info('[IM应用层-回调] %s 上线了, socketid=%s (authedinfo=%s)'
  //     , userId, socket.id, JSON.stringify(socket.authedinfo));
      // 更新在线状态
      CacheProvider.update_user_online_status(1,userId,function(sucess, results){
          // logger.info('[IM应用层-回调]  上线更新状态,'+sucess)
      })
}

/**
 * IMServerSDK的回调函数：用户离线回调。
 *
 * 【本回调建议用途】：
 * 开发者可在此回调中处理用户下线的代码。
 *
 * @param userId
 * @param socket
 */
function callBack_userOffline(userId, socket){
  // logger.info('[IM应用层-回调] %s 离线了, socketid=%s (authedinfo=%s)'
  //     , userId, socket.id, JSON.stringify(socket.authedinfo));

  // 更新离线状态
  CacheProvider.update_user_online_status(0,userId,function(sucess, results){
    // logger.info('[IM应用层-回调]  下线更新状态,'+sucess)
  })
}

/**
 * IMServerSDK的回调函数：C2S消息回调。
 *
 * 【本回调建议用途】：
 * 当客服端向userid='0'的用户发送的数据，都会回调至此，表示客户端向服务器发送的数据。用户可借此实现一些特殊的C2S指令。
 *
 * @param p
 * @param socket 发送者的socket句柄
 */
function callBack_receivedC2SMessage(p, socket){

  // logger.info('[IM应用层-回调-C2S] 收到客户端发给服务端的C2S消息（%s）', JSON.stringify(p));

  // 接收者uid
  var userId = p.to;
  // 发送者uid
  var from_user_id = p.from;
  // 消息或指令内容
  var dataContent = p.dataContent;
  // 消息或指令指纹码（即唯一ID）
  var fingerPrint = p.fp;
  // 【重要】用户定义的消息或指令协议类型（开发者可据此类型来区分具体的消息或指令）
  var typeu = p.typeu;

  // 处理用户A需要由服务端转发的临时聊天消息（给接收方B）
  if(typeu === constant.UserProtocalsType.MT42_OF_TEMP$CHAT$MSG_A$TO$SERVER){
      ChatLogicManager.processMT42_OF_TEMP$CHAT$MSG_A$TO$SERVER(imServerSDK, dbMsgProducer, fingerPrint, dataContent);
  }
  // 处理用户A需要由服务端转发的群聊消息 @since 1.3
  else if(typeu === constant.UserProtocalsType.MT44_OF_GROUP$CHAT$MSG_A$TO$SERVER){
    ChatLogicManager.processMT44_OF_GROUP$CHAT$MSG_A$TO$SERVER(imServerSDK, CacheProvider, dbMsgProducer, fingerPrint, dataContent);
  }
  else{
    logger.warn('[IM应用层-回调-C2S] 没有此typeu类型匹配的处理逻辑。。。(typeu='+typeu+')');
  }
}

/**
 * IMServerSDK的回调函数：C2C消息代理转发成功后的回调。
 *
 * 【本回调建议用途】：
 * 此回调可作为像APP的IM服务端端一样通常用作用户行为和聊天内容抓取之用，本回调的作用参考APP的I
 * M服务端的onTransBuffer_C2C_CallBack(..)。
 *
 * @param p
 */
function callBack_transferedC2CMessage(p){
  // logger.info('[IM应用层-回调-C2C] 已成功处理完客户端发给客户端的C2C消息（%s）', JSON.stringify(p));

  // 【一对一好友聊天消息回调】
  // 在c2c的回调中，只记录一对一的聊天记录（群聊的消息记录是在发送时处理而
  // 不是在本回调中（即接收时）处理，详见群聊消息记录实现原则备忘）
  if(p.typeu == constant.UserProtocalsType.MT03_OF_CHATTING_MESSAGE) {
    //var dateContent = p.dataContent;
    //// 转MsgBodyRoot对象（详见：http://docs.52im.net/extend/docs/api/rainbowchatserver4_pro/com/x52im/rainbowchat/im/dto/MsgBodyRoot.html）
    //var msgBodyObj = JSON.parse(dateContent);

    // ** 【用户消息收集】收集用户的聊天消息，以供后台进行用户行为分析
    // 将聊天消息推送到MQ中间件而不是直接操作DB（聊天消息的持久化由中间件对应的消费者去处理，从而降低IM服务器的负载，降低IO瓶颈发生的可能）
    dbMsgProducer.publishChatMsg(p, function (result) {
      // publish成功了
      if (result) {

        // logger.info("[IM应用层-回调-C2C-publishChatMsg][typeu=" + p.typeu + "], 客户端" + p.from + " 发给客户端"
        //     + p.to + " 的实时聊天消息：str=[" + p.dataContent
        //     + "]，推送到MQ处理完成，【ssucess=true】");
      }
      // publish失败
      else {

        logger.warn("[IM应用层-回调-C2C-publishChatMsg][typeu=" + p.typeu + "] 客户端" + p.from + " 发给客户端"
            + p.to + " 的实时聊天消息：str=[" + p.dataContent + "]，推送到MQ处理发生异常，publishChatMsg失败！");
      }
    });
  }
  /** 因为根据MobileIMSDK APP端服务端器的设计逻辑，S2C消息本实例发送成功时，
   *  由发送者在应用层处理自行决定余下逻辑（如存聊天记录），而不是由框架层的本回调处理 */
  // 【群聊消息回调】
  // 不要在此记录群聊消息（因为群聊消息应只记录发送的，而不记录接收的，
  // 否则1000个群员就得存1000条记录，而本回调就是接收的消息，所以不应在此存）。
  // 群聊消息的聊天记录，应在发送的时候存（谁发谁存，而不是谁收谁存，切记！）。
  else if(p.typeu == constant.UserProtocalsType.MT45_OF_GROUP$CHAT$MSG_SERVER$TO$B){
    // 什么也不用做
    logger.debug("[IM应用层-回调-C2C-群聊][typeu=" + p.typeu + "], 客户端" + p.from + " 发给客户端"
        + p.to + " 的实时群聊消息：str=[" + p.dataContent + "] 【此回调中无需存聊天记录，忽略之！】");
  }
  /** 因为根据MobileIMSDK APP端服务端器的设计逻辑，S2C消息本实例发送成功时，
   *  由发送者在应用层处理自行决定余下逻辑（如存聊天记录），而不是由框架层的本回调处理 */
  // 【临时/陌生人聊天消息回调】
  // 陌生人消息不要在这里收集记录，根据目前的设计原则，s2c消息记录一律由发送者处理(而不是接收者)，详见设计备忘录
  else if(p.typeu == constant.UserProtocalsType.MT43_OF_TEMP$CHAT$MSG_SERVER$TO$B){
    // 什么也不用做
    logger.debug("[IM应用层-回调-C2C-临时聊][typeu=" + p.typeu + "], 客户端" + p.from + " 发给客户端"
        + p.to + " 的实时单聊消息：str=[" + p.dataContent + "] 【此回调中无需存聊天记录，忽略之！】");
  }
  else{
    logger.debug("[IM应用层-回调-C2C][typeu=" + p.typeu + "], 客户端" + p.from + " 发给客户端"
        + p.to + " 的消息：str=[" + p.dataContent + "] 【不支持的typeu类型，无需进行聊天记录存储！！】");
  }
}

/**
 * IMServerSDK的回调函数：离线消息处理回调。
 *
 * 【本回调建议用途】：
 * 开发者可在此方法中处理用户不在线情况下未实时送的消息，比如将它们离线存储于DB中。
 *
 * @param p
 */
function callBack_processC2COfflineMessage(p){
  logger.info('[IM应用层-回调] 客户端C2C消息实时发送没成功，需要做离线消息处理（%s）', JSON.stringify(p));

  // 推送到MQ中间件上而非直接操作DB（离线消息由中间件对应的消费者去处理，从而降低IM服务器的负载，降低IO瓶颈发生的可能）
  dbMsgProducer.publishOffline(p, function(result){
    // publish成功了
    if(result){

      // logger.info("[IM应用层-回调-publishOffline][typeu="+ p.typeu+"], 客户端"+ p.from+" 发给客户端"
      //     + p.to+" 的离线消息：str=["+ p.dataContent
      //     +"]，离线处理完成，【ssucess=true】");
    }
    // publish失败
    else {

      // logger.warn("[IM应用层-回调-publishOffline][typeu="+ p.typeu+"] 客户端"+ p.from+" 发给客户端"
      //     + p.to+" 的离线消息：str=["+ p.dataContent+"]，离线处理发生异常，publishOffline失败！");
    }
  });

  /** 根据MobileIMSDK-Web和APP端服务端器的设计逻辑，C2C好友聊天消息在接收方离线情况下的聊天记录处理，
   * 需要在离线回调中处理（而不是在callBack_transferedC2CMessage中），详见“RainbowChat_pro_v4关键设计思路备忘.txt” */
  // 【一对一好友聊天消息，在离线情况下的消息记录处理】
  // if(p.typeu == constant.UserProtocalsType.MT03_OF_CHATTING_MESSAGE) {
  //   // ** 【用户消息收集】收集用户的聊天消息，以供后台进行用户行为分析
  //   // 将聊天消息推送到MQ中间件而不是直接操作DB（聊天消息的持久化由中间件对应的消费者去处理，从而降低IM服务器的负载，降低IO瓶颈发生的可能）
  //   dbMsgProducer.publishChatMsg(p, function (result) {
  //     // publish成功了
  //     if (result) {

  //       logger.info("[IM应用层-回调-C2COffline-publishChatMsg][typeu=" + p.typeu + "], 客户端" + p.from + " 发给客户端"
  //           + p.to + " 的离线聊天消息：str=[" + p.dataContent
  //           + "]，推送到MQ处理完成，【ssucess=true】");
  //     }
  //     // publish失败
  //     else {

  //       logger.warn("[IM应用层-回调-C2COffline-publishChatMsg][typeu=" + p.typeu + "] 客户端" + p.from + " 发给客户端"
  //           + p.to + " 的离线聊天消息：str=[" + p.dataContent + "]，推送到MQ处理发生异常，publishChatMsg失败！");
  //     }
  //   });
  // }
}

///**
// * 返回缓存提供者对象实例。
// *
// * @returns {exports|module.exports}
// */
//function getCacheProvider(){
//  return CacheProvider;
//}


/** -----------------------------------------------------------------------------------
 * Listen on provided port, on all network interfaces.
 */

server.listen(port, function () {
  // logger.info('[IM应用层] %s服务器正在运行中，监听端口：%d', imConfig.name, port);
});
server.on('error', onError);
server.on('listening', onListening);


/** -----------------------------------------------------------------------------------
 * Event listener for HTTP server "error" event.
 */

function onError(error) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  var bind = typeof port === 'string'
      ? 'Pipe ' + port
      : 'Port ' + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(bind + ' is already in use');
      process.exit(1);
      break;
    default:
      throw error;
  }
}


/** -----------------------------------------------------------------------------------
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
  var addr = server.address();
  var bind = typeof addr === 'string'
      ? 'pipe ' + addr
      : 'port ' + addr.port;
  logger.debug('Listening on ' + bind);
}


/** -----------------------------------------------------------------------------------
 * uncaughtException 处理，防止未捕获的异常导致Nodejs进程退出.
 */

process.on('uncaughtException', function (err) {// 直接捕获用户未处理的异常，防止Node进程退出
  logger.error('已捕获用户未处理的异常:');
  logger.error(err);
});