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
/**
 * IM实例中需要持久化数据的MQ消息队列生产者。 本类实现基本参考自mobile-im-sdk中的im-mq-provider.js。
 *
 * <p>【技术原理】：
 * 当需要存储一条比如离线消息时，本类只需将此条消息向MQ离线消息队列中
 * 写入即可，余下的事情由独立于本IM实例之外的离线消息处理消费者进行处理即可（离线消息
 * 消费者可以是1到N个消费者实例，从而实现离线消息的高速持久化处理）。
 *
 * <p>【性能好处】：
 * 本机IM的比如离线消息，目前是利用消息队列作为中间件，从而实现业务解偶、
 * 高并发时的削峰、与持久化存储等容易产生瓶颈的IO读写业务进行分离，从而实现
 * IM单机实例的高性能。
 *
 * 理论上，为了保证IM单机实例的高性能，要尽可能避免操作磁盘IO等业务，否则高峰时
 * 很容易产生瓶颈，这是高并发场景下都需要面对的问题。
 *
 * @author Jack Jiang
 * @version 1.0
 */


/** MQ数据类型常量：聊天的离线消息 */
const MQ_DATA_TYPE_OFFLINE$MSG = 0;
/** MQ数据类型常量：聊天消息记录 */
const MQ_DATA_TYPE_CHAT$RECORD = 1;


var amqp = require('amqplib/callback_api');
var config = require('../conf/config');
var logger = require('mobileimsdk_web_server/j_conf/log').logger;

// MQ连接是否“正在”或“已经”start()，本标识用于防止在断线重连时出现两个循环调用start的线程
var running = false;
// if the connection is closed or fails to be established at all, we will reconnect
var amqpConn = null;
var pubChannel = null;

// 本地生产者用的暂存消息队列：因为当发送消息时，可能连接等原因导致此次消息没有成功发出，
// 那么暂存至此列表中，以备下次连接恢复时，再次由本类自动完成发送，从而确保消息不丢并确保送达
var offlinePubQueue = [];


function start() {
    // 防止被重复运行（根据下面的产生err即重新start的代码逻辑，如无本判断则会发生重启重启哦，不信仔细看代码！）
    if(running) {
        logger.warn('[4-MQ4DB] - 【注意】MQ服务正在或已经start()，本次start()将被忽略！running=%s', running);
        return;
    }

    // 设置“正在”或“已经”start()标识
    running = true;

    logger.debug('[4-MQ4DB] - [start()中] 要连接的MQ服务器地址：%s', config.IMMQ_2DB_URI + "?heartbeat=30");

    amqp.connect(config.IMMQ_2DB_URI + "?heartbeat=30", function(err, conn) {
        if (err) {
            running = false;
            logger.error('[4-MQ4DB] - [start()中] amqp.connect出错了，回调中err.message：%s 【3秒后重新start重试】', err.message);
            return setTimeout(start, 3000);
        }

        // 连接成功后注册error事件监听
        conn.on("error", function(err) {
            logger.error('[4-MQ4DB] - [start()中] conn.on("error")事件触发了，err：%s ', JSON.stringify(err));

            if (err.message !== "Connection closing") {
                console.error("[4-MQ4DB] - [start()中] conn error", err.message);
            }
        });

        // 连接成功后注册close事件监听
        conn.on("close", function() {
            running = false;
            logger.error('[4-MQ4DB] - [start()中] conn.on("close")事件触发了，表示连接已关闭！【3秒后重新start重试】');
            return setTimeout(start, 3000);
        });

        logger.info("[4-MQ4DB] - [start()中] 与RabittMQ服务器的连接成功完成！【OK】");
        amqpConn = conn;

        // 连接成功后要做的事
        whenConnected();
    });
}

function whenConnected() {
    startPublisher();
    //startWorker();
}

function startPublisher() {
    if (amqpConn) {
        amqpConn.createConfirmChannel(function (err, ch) {
            if (closeOnErr(err, ' ↑[startPublisher()中的amqpConn.createConfirmChannel]')) return;

            ch.on("error", function (err) {
                logger.error('[4-MQ4DB-↑] - [startPublisher()中] ch.on("error")事件触发了，err：%s ', JSON.stringify(err));
            });
            ch.on("close", function () {
                logger.error('[4-MQ4DB-↑] - [startPublisher()中] ch.on("close")事件触发了，channel 关闭了！');
                //console.log("[AMQP] channel closed");
            });

            pubChannel = ch;

            //logger.info('[3-IMMQ-↑] - [startPublisher()中] 的channel成功创建了，马上开始循环publish消息，当前数组队列长度：%d！【OK】'
            //    , offlinePubQueue.length);
            // logger.info('[4-MQ4DB-↑] - [startPublisher()中] 的channel成功创建了，接下来的publish将能正常使用！【OK】');

            // 确保在publish之前，队列已经被建立，否则publish的消息都将无法被消费者收到（也不会被mq持久化，直接没了！）
            ch.assertQueue(config.IMMQ_2DB_MSG_WRITE_QNAME, { durable: true }, function(err, _ok) {
                if (closeOnErr(err, ' - ↑[[startPublisher(config.im_mq_queue_web2app)中] 的ch.assertQueue]')) return;

                // logger.info('[4-MQ4DB-↑] - [startPublisher(config.im_mq_queue_web2app)中] Queue已成功建立，Publisher初始化成功，消息将可publish过去且不怕丢失了。【OK】');

                // 尝试将之前因发送中遇到错误时暂存的消息再次进行发送
                while (true) {
                    // 取出数组第一个单元（并删除原数据中的该单元）
                    var m = offlinePubQueue.shift();
                    if (!m) {
                        logger.debug('[4-MQ4DB-↑] - [startPublisher()中] [___]在channel成功创建后，当前取出的上次未成功数据第一个单元已为空，不存在上次未决的publish需续发！[当前数组队列长度：%d]！【OK】',offlinePubQueue.length);
                        break;
                    }

                    logger.debug('[4-MQ4DB-↑] - [startPublisher()中] [...]在channel成功创建后，正在publish消息 m[0]=%s、m[1]=%s,、m[2]=%s' +
                        '，[当前数组队列长度：%d]！【OK】', m[0], m[1], m[2],offlinePubQueue.length);
                    publish(m[0], m[1], m[2]);
                }
            });
        });
    }
    else{
        // logger.info("[4-MQ4DB-↑] - [startPublisher()中] amqpConn是空的，本次startPublisher没有继续【NO】");
    }
}

// method to publish a message, will queue messages internally if the connection is down and resend later
function publish(exchange, routingKey, content, resultCallback) {
    try {
        pubChannel.publish(exchange, routingKey, content, { persistent: true },
            function(err, ok) {// 此回调中的ok在发送成功的情况下值是undefine，无视它吧

                if (err) {

                    // 放回数组尾部位，以便下次正常时接之前的失败时间顺序被Publish出去，从而保证消息顺序
                    //offlinePubQueue.unshift([exchange, routingKey, content]);// 推到数组首部
                    offlinePubQueue.push([exchange, routingKey, content]);// 推到数组尾部
                    logger.error('[4-MQ4DB-↑] - [startPublisher()中] publish()时出错了，原因：%s【数据[%s,%s,%s]' +
                        '已重新放回数组首位，数组新长度：%d】, pubChannel马上会被关闭。', JSON.stringify(err), exchange
                        , routingKey, content, offlinePubQueue.length);

                    logger.error('[4-MQ4DB-↑] - [startPublisher()中] publish()时出错了，原因：%s【数据[%s,%s,%s]' +
                        '将由调用者进行处理（离线存起来？）】, pubChannel马上会被关闭。', JSON.stringify(err), exchange
                        , routingKey, content);
                    pubChannel.connection.close();

                    // publish 结果通过回调通知调用者
                    resultCallback(false);
                }
                else{
                    // logger.info('[4-MQ4DB-↑] - [startPublisher()中] publish()成功了(ok=%s) ！(数据:%s,%s,%s)【OK】'
                    //     , ok, exchange, routingKey, content);

                    // publish 结果通过回调通知调用者
                    resultCallback(true);
                }
            });
    } catch (e) {

        // 将没有发送出去的消息先放到本地内存中暂时，等连接恢复后再次发送
        // 方法是放回数组尾部位，以便下次正常时接之前的失败时间顺序被Publish出去，从而保证消息顺序
        //offlinePubQueue.unshift([exchange, routingKey, content]);// 推到数组首部
        offlinePubQueue.push([exchange, routingKey, content]);// 推到数组尾部
        logger.error('[4-MQ4DB-↑] - [startPublisher()中] publish()时Exception了，原因：%s【数据[%s,%s,%s]已重新放回数组首位' +
            '，当前数组长度：%d】', JSON.stringify(e), exchange, routingKey, content, offlinePubQueue.length);

        logger.error('[4-MQ4DB-↑] - [startPublisher()中] publish()时Exception了，原因：%s【数据[%s,%s,%s]将由调用者进' +
            '行处理（离线存起来？）】', JSON.stringify(e), exchange, routingKey, content);

        // publish 结果通过回调通知调用者
        resultCallback(false);
    }
}

function closeOnErr(err, desc) {
    if (!err) return false;
    //console.error("[AMQP] error", err);
    logger.error('[4-MQ4DB] 操作MQ连接时出现错误，DESC：%s, 错误信息：%s', desc, JSON.stringify(err));
    amqpConn.close();
    return true;
}


/**
 * 外部方法：MQ中间件服务启动方法。
 *
 * @type {start}
 */
exports.start = start;

/**
 * 外部方法：向MQ中间件推送一条离线消息（会在MQ的消费者端存入DB进行持久化）。
 *
 * @param p 要发送的内容，Protocal对象
 * @param resultCallback 发送结果回调函数，形如：fn(result)，参数result为布尔值：true表示publish成功、否则表示publish失败
 */
exports.publishOffline = function(p, resultCallback){

    // 以下JSON对象的字段名一定要与MQ消费者服务端的ProtocalInMQ.java保持一致
    var offlineMsgInMQ = p;

    // 每条to db的消息必须加此类型区分，不然MQ消费者端将无法区别数据的去向
    offlineMsgInMQ.MQDataType = MQ_DATA_TYPE_OFFLINE$MSG;

    publish("", config.IMMQ_2DB_MSG_WRITE_QNAME, new Buffer(JSON.stringify(offlineMsgInMQ)), resultCallback);
};

/**
 * 外部方法：向MQ中间件推送一条聊天消息（会在MQ的消费者端存入DB进行持久化），持久化的目提是便于运营方分析用户行为等。
 *
 * @param p 要发送的内容，Protocal对象，Protocal对象详见：http://docs.52im.net/extend/docs/api/mobileimsdk/server/net/openmob/mobileimsdk/server/protocal/Protocal.html
 * @param resultCallback 发送结果回调函数，形如：fn(result)，参数result为布尔值：true表示publish成功、否则表示publish失败
 */
exports.publishChatMsg = function(p, resultCallback){

    //// 以下JSON对象的字段名一定要与APP服务端的OfflineMsgInMQ.java保持一致
    //var msgBodyInMQ = {};
    //
    //if(p.dataContent)
    //    msgBodyInMQ = JSON.parse(p.dataContent);
    //
    //// 把该消息对应的消息指纹码也保存过来
    //msgBodyInMQ.fingerPrint = p.fp;
    //// 每条to db的消息必须加此类型区分，不然MQ消费者端将无法区别数据的去向
    //msgBodyInMQ.MQDataType = MQ_DATA_TYPE_CHAT$RECORD;
    //
    //publish("", config.IMMQ_2DB_MSG_WRITE_QNAME, new Buffer(JSON.stringify(msgBodyInMQ)), resultCallback);

    this.publishChatMsg_dataContent(p.dataContent, p.fp, resultCallback);
};

/**
 * 外部方法：向MQ中间件推送一条聊天消息（会在MQ的消费者端存入DB进行持久化），持久化的目提是便于运营方分析用户行为等。
 *
 * @param dataContent 要发送的内容，即Protocal对象的dataContent字段（此字段内容对于聊天消息来说，就是MsgBodyRoot对象的JSON文本形式），
 *                    MsgBodyRoot对象详见：http://docs.52im.net/extend/docs/api/rainbowchatserver4_pro/com/x52im/rainbowchat/im/dto/MsgBodyRoot.html，
 *                    Protocal对象详见：http://docs.52im.net/extend/docs/api/mobileimsdk/server/net/openmob/mobileimsdk/server/protocal/Protocal.html
 * @param fingerPrint Protocal对象fp字段（即消息指纹码）
 * @param resultCallback 发送结果回调函数，形如：fn(result)，参数result为布尔值：true表示publish成功、否则表示publish失败
 */
exports.publishChatMsg_dataContent = function(dataContent, fingerPrint, resultCallback){

    // 以下JSON对象的字段名一定要与APP服务端的OfflineMsgInMQ.java保持一致
    var msgBodyInMQ = {};

    if(dataContent)
        msgBodyInMQ = JSON.parse(dataContent);

    // 把该消息对应的消息指纹码也保存过来
    msgBodyInMQ.fingerPrint = fingerPrint;
    // 每条to db的消息必须加此类型区分，不然MQ消费者端将无法区别数据的去向
    msgBodyInMQ.MQDataType = MQ_DATA_TYPE_CHAT$RECORD;

    publish("", config.IMMQ_2DB_MSG_WRITE_QNAME, new Buffer(JSON.stringify(msgBodyInMQ)), resultCallback);
};

