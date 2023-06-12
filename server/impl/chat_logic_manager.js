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
 * RainbowChat-Web服务端的IM实时聊天逻辑管理器。
 *
 * @author Jack Jiang
 * @version 1.0
 */


// MobileIMSDK-Web版服务端的log4js日志框架实例
var logger = require('mobileimsdk_web_server/j_conf/log').logger;
var MessageHelper = require('./message_helper');
var uuid = require('node-uuid');
var Cache = require('./cache_l_helper');


/**
 * BBS聊天（即世界频道）所对应的群组聊天id（因为世界频道是个特殊
 * 的群聊，属系统默认无需创建，所以给它一个默认的固定id，以便跟普
 * 通群聊区分开来）.
 *
 * 注：世界频道功能目前仅在APP版产品中存在，且未来可能将删除，web版产品中暂不打算实现之。
 */
const DEFAULT_GROUP_ID_FOR_BBS = "-1";



/**
 * 指定id是否是“世界频道”（或者说是bbs聊天）。
 *
 * 注：世界频道功能目前仅在APP版产品中存在，且未来可能将删除，web版产品中暂不打算实现之。
 *
 * @param gid 群id
 * @return {boolean} true表示是世界频道，否则不是
 */
function isWorldChat(gid)
{
    return DEFAULT_GROUP_ID_FOR_BBS == gid;
}

/**
 * 处理临时聊天消息的最终投递.
 *
 * @param imServerSDKInstance www.js中的imServerSDK对象实例引用
 */
function processMT42_OF_TEMP$CHAT$MSG_A$TO$SERVER(imServerSDKInstance, dbMsgProducer, fingerPrint, dataContent){

    // 解析临时聊天消息（MsgBody4Guest对象，详见：http://docs.52im.net/extend/docs/api/rainbowchatserver4_pro/com/x52im/rainbowchat/im/dto/MsgBody4Guest.html）
    var tempChatMsgFromClient = MessageHelper.pareseTempChatMsg_A$TO$SERVER_Message(dataContent);

    var fromUid = tempChatMsgFromClient.f;
    var toUid = tempChatMsgFromClient.t;

    // JSON对象正常解析出来了
    if(tempChatMsgFromClient) {

        // 将临时聊天消息实时转发给本次消息接收者（如果用户连在本APPP实例则直发，否则开启与web互通时将桥接发）
        // 补充：因为nodejs异步执行的特性，无法像同步方法那样获得返回值来判断消息是否成功送出，所以无论如何只要是
        //      未进入上方离线回调处理的就可以认为是成功送成，否则未成的消息在离线处理回调里进行处理（比如：持久化到数据库中）即可。
        MessageHelper.sendTempChatMsg_SERVER$TO$B_Message(imServerSDKInstance, toUid, tempChatMsgFromClient, fingerPrint);

        /** 20190328 by Jack Jiang：按照目前的设计原则，为了减化架构和处理的复杂性，服务端主动发起
         的S2C类型消息或指令一律由发送者处理（详见设计备忘），切记！ */
        // ** 【用户消息收集】收集用户的聊天消息，以供后台进行用户行为分析
        // 将聊天消息推送到MQ中间件而不是直接操作DB（聊天消息的持久化由中间件对应的消费者去处理，从而降低IM服务器的负载，降低IO瓶颈发生的可能）
        dbMsgProducer.publishChatMsg_dataContent(dataContent, fingerPrint, function (result) {
            // publish成功了
            if (result) {

                // logger.info(+"[临时聊天]-[publishChatMsg] 消息记录str=[" + dataContent + "]，推送到MQ处理完成，【ssucess=true】");
            }
            // publish失败
            else {

                // logger.warn("[临时聊天]-[publishChatMsg]消息记录str=[" + dataContent + "]，推送到MQ处理发生异常，publishChatMsg失败！");
            }
        });
    }
}

/**
 * 群聊/世界频道消息的代码实现代码。
 * <p>
 * 说明：为了简化普通群聊消息的发送算法，本方法采用的是群消息扩散写的方式，
 * 如有疑问可以参考这篇文章：http://www.52im.net/thread-812-1-1.html
 *
 * @param dataContent
 */
function processMT44_OF_GROUP$CHAT$MSG_A$TO$SERVER(imServerSDKInstance, cacheProvider, dbMsgProducer, fingerPrint, dataContent){

    // 获得MobileIMSDK-Web版服务端的在线用户列表管理器
    var userProcessor = imServerSDKInstance.userProcessor;

    // 解析群组聊天消息（解析出的对象就是 MsgBody4Group，
    // 详见：http://docs.52im.net/extend/docs/api/rainbowchatserver4_pro/com/x52im/rainbowchat/im/dto/MsgBody4Guest.html）
    var msgBody = MessageHelper.pareseGroupChatMsg_A$TO$SERVER_Message(dataContent);

    logger.debug("[IM]【群聊/世界频道】《《《《《！收到了群发消息！》》》》》 ->"+dataContent);

    // 结果正常解析出来了
    if(msgBody != null) {
        var gid = msgBody.t;

        var logTAG =(isWorldChat(gid) ? "[IM-世界频道]" : "[IM-群聊(" + gid + ")]");

        // 世界频道（即bbs聊天）直接发给所在在线的人
        // FIXME: 世界频道功能目前仅在APP版产品中存在，且未来可能将删除，web版产品中暂不打算实现之。
        if (isWorldChat(gid)) {
            logger.warn(logTAG+" 世界频道功能目前仅在APP版产品中存在，且未来可能将删除，web版产品中暂不打算实现之。该条指令将被忽略。。。");
        }
        // 普通群聊是发给群内所有成员
        else {

            var chunkSize = function(arr, size) {
                var arr2=[];
                for(var i=0;i<arr.length;i=i+size){
                  arr2.push(arr.slice(i,i+size));
                }
                return arr2;
            }

            /**
             *  群成员获取成功之后执行
             * @param {*} list 
             */
            var fDeal2Go = function(results){
                //在线用户
                const online_list = [];
                // 非在线用户
                const offline_list = [];
                // 区分在线与非在线用户
                if(results && results.length > 0){
                    results.forEach(item=>{
                        if(item.user_uid != msgBody.f){
                            // 在线
                            if(userProcessor.isOnline(item.user_uid)){
                                online_list.push(item)
                            // 非在线
                            }else{
                                offline_list.push(item)
                            }
                        }
                    })
                }
                //  在线用户，socket发送
                if(online_list && online_list.length > 0){
                    online_list.forEach(item => {
                        MessageHelper.sendGroupChatMsg_SERVER$TO$B_Message(imServerSDKInstance, item.user_uid, msgBody);
                    })
                }
                //  离线用户， mq同步发送
                if(offline_list && offline_list.length > 0){
                    // 不分组
                    const list_ = offline_list;
                    const l_ = list_.map(item => {
                        return item.user_uid + '';
                    })
                    MessageHelper.sendGroupChatMsg_SERVER$TO$B_Message(imServerSDKInstance, l_.join(','), msgBody,uuid.v1());

                    // 分组-逻辑
                    // const list_ = chunkSize(offline_list, 100)
                    // list_.forEach(item => {
                    //     const fps = []
                    //     const l_ = item.map(item =>{
                    //         fps.push(uuid.v1())
                    //         return item.user_uid + '';
                    //     } )
                    //     MessageHelper.sendGroupChatMsg_SERVER$TO$B_Message(imServerSDKInstance, l_.join(','), msgBody,fps.join(','));
                    // })
                }
              

                // for(var i=0;i<results.length;i++){
                //     var rowObj = results[i];
                //     var user_uid = rowObj.user_uid; // 返回数据的字段名详见cacheProvider.queryGroupMember()函数中的SQL语句查询字段

                //     // 此消息的发起用户是发送消息者本人（当然不需要转发给自已罗）
                //     if(user_uid == msgBody.f) {
                //         logger.debug(logTAG+"【无需发给自已END】群员" +user_uid+"就是消息发起人，不需要再由服务端转发该条消息哦.");
                //     }
                //     else {

                //         // 目标接收人是否在线？
                //         var isDestFriendOnline = userProcessor.isOnline(user_uid);

                //         // （如果用户连在本APPP实例则直发，否则开启与web互通时将桥接发）
                //         // 补充：发送方法中，如果消息在桥接发送、实时发送过程中出现了任何问题，将会自动通知 www.js中的离线回调函数
                //         MessageHelper.sendGroupChatMsg_SERVER$TO$B_Message(imServerSDKInstance, user_uid, msgBody);
                //         //下一步：上面的send方法中，不要进行逐条消息记录的回调和存储（注意要改造回调方法的设置？！）
                //     }
                // }

                /** 20190328 by Jack Jiang：按照目前的设计原则，为了减化架构和处理的复杂性，服务端主动发起
                 的S2C类型消息或指令一律由发送者处理（详见设计备忘），切记！ */
                // ** 【用户消息收集】收集用户的聊天消息，以供后台进行用户行为分析
                // 将聊天消息推送到MQ中间件而不是直接操作DB（聊天消息的持久化由中间件对应的消费者去处理，从而降低IM服务器的负载，降低IO瓶颈发生的可能）
                // dbMsgProducer.publishChatMsg_dataContent(dataContent, fingerPrint, function (result) {
                //     // publish成功了
                //     if (result) {

                //         // logger.info(logTAG + "-[publishChatMsg] 消息记录str=[" + dataContent + "]，推送到MQ处理完成，【ssucess=true】");
                //     }
                //     // publish失败
                //     else {

                //         // logger.warn(logTAG + "-[publishChatMsg]消息记录str=[" + dataContent + "]，推送到MQ处理发生异常，publishChatMsg失败！");
                //     }
                // });
            }

           // 查询缓存
           const list = Cache.get('server-msg-gid-'+gid);
           if(list){
                fDeal2Go(list)
           }else{
                cacheProvider.queryGroupMember(gid, function(sucess, results){
                    //logger.info('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> 查询成功了吗？'+sucess+', 结果：'+JSON.stringify(results));
                    // 查询成功
                    if(sucess){
                        if(results && results.length > 0){
                            // 把数组分割成小数组
                            Cache.put('server-msg-gid-'+gid, results, 3)
                            fDeal2Go(results)
                        }
                        else{
                            logger.warn(logTAG+" 群成员数据查询完成，但结果是空的！"+results);
                        }
                    }
                    // 查询失败
                    else{
                        logger.warn(logTAG+" 群成员数据查询失败，群消息发送没有继续！{"+dataContent+"}");
                    }
                });
           }
        }
    }
}



exports.processMT42_OF_TEMP$CHAT$MSG_A$TO$SERVER = processMT42_OF_TEMP$CHAT$MSG_A$TO$SERVER;
exports.processMT44_OF_GROUP$CHAT$MSG_A$TO$SERVER = processMT44_OF_GROUP$CHAT$MSG_A$TO$SERVER;