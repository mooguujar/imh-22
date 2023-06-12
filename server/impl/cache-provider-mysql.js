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
 * RainbowChat-Web服务端的高速缓存提供者（MySQL数据库实现）。
 *
 * 【关于高速缓存改为redis的说明】：
 * 目前为了简化架构，高速缓存没有基于redis实现，
 * 而是从DB中读取。生产环下，可根据业务规模自行改成redis，这需要APP 服务端那边配合（
 * APP服务端那边的高速缓存目前单实例非共享形式，改为redis后就能直web产品直接共享了）。
 *
 * @author Jack Jiang
 * @version 1.0
 */

// RainbowChat-Web服务端的配置项实例
var config = require('../conf/config');
// MobileIMSDK-Web版服务端的log4js日志框架实例
var logger = require('mobileimsdk_web_server/j_conf/log').logger;
// mysql驱动库文档详见：https://www.npmjs.com/package/mysql
var mysql = require('mysql');

// 连接池（提升性能）
var pool  = mysql.createPool({
    connectionLimit : 100,
    host            : config.DB_HOST,
    user            : config.DB_USER,
    password        : config.DB_PASSWORD,
    database        : config.DB_DBNAME
});

/**
 * 打印错误信息。
 *
 * @param hint
 * @param err
 */
function printDBError(hint, err){
    logger.error('[DB] - '+hint+'：{[code='
        +err.code+'], [sqlState='+err.sqlState+'], [sqlMessage='+err.sqlMessage+'], [SQL='+err.sql+']}');
}

/**
 * 数据库查询根方法（开发者实现的查询都可重用本方法）。
 *
 * @param sql sql语句（可以是带'?'号的预编译语句
 * @param values 对应的'?'号的预编译语句的字段值
 * @param resultCallback 成功后的回调，参数为（[参数1]boolean - true表示查询成功、否则失败，[参数2]Arrays - 查询结果）
 */
function queryNow(sql, values, resultCallback){

    pool.getConnection(function(err, connection) {
        if (err) {
            printDBError('获取数据连接时出错了，原因是', err);
            //throw err; // not connected!
            return;
        }

        logger.debug('[DB] - 马上开始查询：SQL='+sql+", values=" + JSON.stringify(values));

        // Use the connection
        connection.query(sql, values, function (error, results, fields) {

            if (error) {
                printDBError('查询数据时出错了，原因是', error);

                if (resultCallback)
                    resultCallback(false, null);

                return;
            }

            logger.debug('[DB] - 查询结果：' + JSON.stringify(results));

            if (resultCallback)
                resultCallback(true, results);

            // 连接使用完成后，放回连接池（而不是销毁，这也是连接池能提升性能的原因所在）
            connection.release();

            // Handle error after the release.
            if (error) {
                printDBError('release()时出错了，原因是', error);
            }

            // Don't use the connection here, it has been returned to the pool.
        });
    });
}

/**
 * 对外公开的方法：查询群成员列表。
 *
 * @param gid 群id
 * @param resultCallback 成功后的回调，参数为（[参数1]boolean - true表示查询成功、否则失败，[参数2]Arrays - 查询结果）
 */
exports.queryGroupMember = function(gid, resultCallback){

    queryNow(
        "select user_uid from group_members where g_id=?"
            // 通过EXISTS子查询实现关联主表群信息上的群状态字段，提升查询性能
            +" and EXISTS (select 1 from group_base where g_id=? and g_status=1)"
        , [gid, gid]
        , resultCallback
    );
};

/**
 *  更新用户在线状态
 * @param {*} online_web 
 * @param {*} user_uid 
 * @param {*} resultCallback 
 */
exports.update_user_online_status = function(online_web,user_uid,resultCallback){

    queryNow(
        "UPDATE missu_users SET online_web=? WHERE user_uid =?",
        [online_web,user_uid]
        , resultCallback
    );
};

