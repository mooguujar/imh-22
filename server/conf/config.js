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
 * Created by Jack Jiang.
 *
 * 【用法】：载入配置文件
 * var config = require('./config');
 * 直接引用 config.description 这样的配置项。
 *
 * 【关于在IM-SDK外使用独立的log4js的说明】：
 * 前提是可以独立使用没有问题，但im-sdk中本身已有log4js的配置，为了方便把所有Log保并到一个地方显示，所以建议
 * 要使用log4js的地方都使用im-sdk中的配置即可，这样就只需要配置一个地方了！
 */

var config = {
    //工程名字
    name: 'Rainbowchat-Web-IMServer',

    // 开启或关闭与App产品的消息互通，true表示开启、false表示关闭，默认true（如您不知此为何物，请始终设为true即可）
    IMMQ_BRIDGE_ENABLED		: true,
    // 与App产品的消息互通时MQ的URI（本参数只在IMMQ_BRIDGE_ENABLED=true时有意义）// 18.167.110.125
    IMMQ_IMBRIDGE_URL		: 'amqp://js:19844713@3.0.248.34', //

    // 要插入DB的持久化数据消息队列服务器连接URI
    IMMQ_2DB_URI			: 'amqp://js:19844713@3.0.248.34',
    // 要插入DB的持久化数据消息队列名，用于配合IM服务器，从MQ中间件读取并处理离线消息等
    IMMQ_2DB_MSG_WRITE_QNAME: 'q_im2db_msg',


    // TODO: 用于MySQL数据库时，请启用以下配置项
    DB_HOST      : '3.0.248.34',
    DB_USER      : 'dbuser',
    DB_PASSWORD  : 'Wolf..123',
    DB_DBNAME    : 'im_data',

    // DB_HOST      : 'im-rds.cf9fgaoib8bm.ap-east-1.rds.amazonaws.com',
    // DB_USER      : 'admin',
    // DB_PASSWORD  : 'd9op*R,]cvyy',
    // DB_DBNAME    : 'im_data',

    REDIS_PORT: 6639,
    REDIS_HOST: '127.0.0.1'

    // TODO: 用于SQLServer数据库时，请启用以下配置项
    /*
    DB_HOST      : '192.168.0.190',
    DB_USER      : 'sa',
    DB_PASSWORD  : 'yy116',
    DB_DBNAME    : 'rainbowchat_pro'
    */
};


module.exports = config;
