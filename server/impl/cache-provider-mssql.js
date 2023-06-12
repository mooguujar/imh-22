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
 * RainbowChat-Web服务端的高速缓存提供者（SQL Server数据库实现）。
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
// mssql驱动库文档详见：https://www.npmjs.com/package/mssql
var mssql = require('mssql');


/**
 * 打印错误信息。
 *
 * @param hint
 * @param err
 */
function printDBError(hint, err){
    logger.error('[DB-MSSQL] - '+hint+'：'+JSON.stringify(err));
}

/**
 * 数据库查询根方法（开发者实现的查询都可重用本方法）。
 *
 * @param sql sql语句
 * @param resultCallback 成功后的回调，参数为（[参数1]boolean - true表示查询成功、否则失败，[参数2]Arrays - 查询结果）
 */
function queryNow(sql, resultCallback){

    // logger.info('[DB-MSSQL] - Query SQL：'+sql);

    // 连接方式："mssql://用户名:密码@ip地址:1433(默认端口号)/数据库名称"
    mssql.connect("mssql://"+config.DB_USER+":"+config.DB_PASSWORD+"@"+config.DB_HOST+":1433/"+config.DB_DBNAME).then(function() {
        // Query
        new mssql.Request().query(sql).then(function(recordset) {
            if(recordset){
                // 查询完成，且结果集有数据
                if(recordset.recordset) {
                    // logger.info('[DB-MSSQL] - 查询完成，结果recordset.recordset数据行数为 '+recordset.recordset.length+' !');

                    resultCallback(true, sql+','+recordset.recordset);
                }
                else{
                    // logger.info('[DB-MSSQL] - 查询完成，但结果recordset.recordset是空的！(recordset.recordset='+recordset.recordset+')');
                    resultCallback(true, null);
                }
            }
            else{
                // logger.info('[DB-MSSQL] - 查询完成，但结果recordset全是空的！(recordset='+recordset+')');
                resultCallback(true, null);
            }
        }).catch(function(err) {
            printDBError('查询出错了', err);
            resultCallback(false, null);
        });

        // Stored Procedure

    }).catch(function(err) {
        printDBError('数据库操作时出错了', err);
        resultCallback(false, null);
    });
}

/**
 * 对外公开的方法：查询群成员列表。
 *
 * @param gid 群id
 * @param resultCallback 成功后的回调，参数为（[参数1]boolean - true表示查询成功、否则失败，[参数2]Arrays - 查询结果）
 */
exports.queryGroupMember = function(gid, resultCallback){

    //queryNow(
    //    "select user_uid from group_members where g_id=?"
    //        // 通过EXISTS子查询实现关联主表群信息上的群状态字段，提升查询性能
    //    +" and EXISTS (select 1 from group_base where g_id=? and g_status=1)"
    //    , [gid, gid]
    //    , resultCallback
    //);

    queryNow(
        "select user_uid from group_members where g_id="+gid
            // 通过EXISTS子查询实现关联主表群信息上的群状态字段，提升查询性能
            +" and EXISTS (select 1 from group_base where g_id="+gid+" and g_status=1)"
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
        "UPDATE missu_users SET online_web="+online_web+" WHERE user_uid ="+user_uid
        , resultCallback
    );
};
