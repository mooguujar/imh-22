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
/*
 * Copyright (C) 2019  即时通讯网(52im.net) & Jack Jiang.
 * The MobileIMSDK-Web Project. All rights reserved.
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


// 由客户端发出 - 协议类型：发送通用数据（注意：此事件一定要与服务端protocal-type.js中定义的保持一致！）
// 20160921 modified by js: 为保持与APP端消息类型一致，本常量由原值'c_evt.commondata'改为现值
const C_IMEVT_COMMON$DATA = '2';
// 由服务端发出 - 协议类型：重复登陆被踢消息（注意：此事件一定要与服务端protocal-type.js中定义的保持一致！）
const S_IMEVT_DUPLICATED = 's_evt.duplicated';
// 由服务端发出 - 协议类型：非法连接被拒绝服务事件（即服务将未带有合法认证信息的socket踢掉前发出的事件通知，防止非法连接和攻击）
// （注意：此事件一定要与服务端protocal-type.js中定义的保持一致！）
const S_IMEVT_ILLEGAL = 's_evt.illegal';


/**
 * 增加了msgTime字段、fingerPrint字段的通用Protocal对象创建函数。
 *
 * ----------------------------------------------------------------------------------------
 * 【【MobileIMSDK-Web框架中的Protocal协议封装对象说明】】
 *
 * > Protocal对象用途：
 *   用于MobileIMSDK-Web框架底层进行IM数据往来的协议包装对象使用(即它是MobileIMSDK-Web的IM框架层协议)；
 *
 * > Protocal对象字段：
 *   - dataContent：要发送的数据内容（非必须项）
 *   - from_user_id 消息发送者uid（必须项）
 *   - to_user_id 消息接收者uid（必须项）
 *   - typeu 应用层专用字段——用于应用层存放聊天、推送等场景下的消息类型。注意：此值为-1时表示未定义（必须项，不用可填-1）
 *   - msgTime 消息的发出时间，本字段目前用于聊天消息记录时，可为空（非必须项，可为空）
 *   - fingerPrint 消息包的指纹码（即唯一ID）（必须项）。
 *
 * > Protocal对象可以随意修改吗？：
 *   不可以！这是整个MobileIMSDK-Web框架层的协议定义，如需修改则需保证与服务端保持一致！
 * ----------------------------------------------------------------------------------------
 *
 * @param dataContent 要发送的数据内容
 * @param from_user_id 消息发送者uid
 * @param to_user_id 消息接收者uid
 * @param typeu 应用层专用字段——用于应用层存放聊天、推送等场景下的消息类型。注意：此值为-1时表示未定义。
 *              MobileIMSDK_Web框架中，本字段为保留字段，不参与框架的核心算法，专留用应用层自行定义和使用。
 * @param msgTime 消息的发出时间，本字段目前用于聊天消息记录时，可为空
 * @param fingerPrint 消息包的指纹码（即唯一ID），本参数为空时函数将自动生成uuid作为fingerprint，否则使用您传的值
 * @returns {{type: string, from: *, to: *, dataContent: *, fp: *, typeu: *, msgTime: *}}
 * @see mobile-im-sdk/protocal.js
 */
createCommonData4 = function(dataContent, from_user_id, to_user_id, typeu, msgTime, fingerPrint){
    return {type:C_IMEVT_COMMON$DATA
        , from:from_user_id
        , to:to_user_id
        , dataContent:dataContent
        // 20160921后启动uuid生成， uuid对象由uuid.js文件中代码定义，uuid生成可兼容IE7及以上浏览器（IE6未测试过）
        , fp:(fingerPrint ? fingerPrint : uuid.v1())
        , typeu: typeu // add by Jack Jiang at 20161122
        , msgTime: msgTime
    };
};

/**
 * 增加了msgTime字段的通用Protocal对象创建函数。
 *
 * @param dataContent 要发送的数据内容
 * @param from_user_id 消息发送者uid
 * @param to_user_id 消息接收者uid
 * @param typeu 应用层专用字段——用于应用层存放聊天、推送等场景下的消息类型。注意：此值为-1时表示未定义。
 *              MobileIMSDK_Web框架中，本字段为保留字段，不参与框架的核心算法，专留用应用层自行定义和使用。
 * @param msgTime 消息的了出时间，本字段目前用于聊天消息记录时，可为空
 * @returns {{type: string, from: *, to: *, dataContent: *, fp: *, typu: *}}
 * @see mobile-im-sdk/protocal.js
 */
createCommonData3 = function(dataContent, from_user_id, to_user_id, typeu, msgTime){
    return createCommonData4(dataContent, from_user_id, to_user_id, typeu, msgTime, null)
};

/**
 * 增加了typu字段的通用通用Protocal对象创建函数。（msgTime字段默认设为null）。
 *
 * @param dataContent 要发送的数据内容
 * @param from_user_id 消息发送者uid
 * @param to_user_id 消息接收者uid
 * @param typeu 应用层专用字段——用于应用层存放聊天、推送等场景下的消息类型。注意：此值为-1时表示未定义。
 *              MobileIMSDK_Web框架中，本字段为保留字段，不参与框架的核心算法，专留用应用层自行定义和使用。
 * @returns {{type: string, from: *, to: *, dataContent: *, fp: *, typu: *}}
 * @see mobile-im-sdk/protocal.js
 * @see createCommonData3(..)
 */
createCommonData2 = function(dataContent, from_user_id, to_user_id, typeu){
    return createCommonData3(dataContent, from_user_id, to_user_id, typeu, null);
};

/**
 * 本函数已于20161122日过时，请调用方法createCommonData2()作为替代函数。本函数目前仅作为兼容而存在，以后会删除！
 *
 * @param dataContent 要发送的数据内容
 * @param from_user_id 消息发送者uid
 * @param to_user_id 消息接收者uid
 * @returns {{type: string, from: *, to: *, dataContent: *, fp: *}}
 * @see mobile-im-sdk/protocal.js
 * @see createCommonData3(..)
 */
// @Deprecated at 20161122, 本类已过时，仅为兼容性而保留，请调用等价 createTextMessage()
createCommonData = function(dataContent, from_user_id, to_user_id){
    return createCommonData3(dataContent, from_user_id, to_user_id, -1, null);
};


/**
 * 对Date的扩展，将 Date 转化为指定格式的String。
 *
 *  月(M)、日(d)、小时(h)、分(m)、秒(s)、季度(q) 可以用 1-2 个占位符，
 *  年(y)可以用 1-4 个占位符，毫秒(S)只能用 1 个占位符(是 1-3 位的数字)。
 *
 *  【示例】：
 *  common.formatDate(new Date(), 'yyyy-MM-dd hh:mm:ss.S') ==> 2006-07-02 08:09:04.423
 *  common.formatDate(new Date(), 'yyyy-M-d h:m:s.S')      ==> 2006-7-2 8:9:4.18
 *  common.formatDate(new Date(), 'hh:mm:ss.S')            ==> 08:09:04.423
 */
formatDate = function (date, fmt) { //author: meizz
    var o = {
        "M+": date.getMonth() + 1, //月份
        "d+": date.getDate(), //日
        "h+": date.getHours(), //小时
        "m+": date.getMinutes(), //分
        "s+": date.getSeconds(), //秒
        "q+": Math.floor((date.getMonth() + 3) / 3), //季度
        "S": date.getMilliseconds() //毫秒
    };
    if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (date.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o)
        if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    return fmt;
};

/**
 * 将字符串解析成日期。
 *
 * 【示例】：
 * parseDate('2016-08-11'); // Thu Aug 11 2016 00:00:00 GMT+0800
 * parseDate('2016-08-11 13:28:43', 'yyyy-MM-dd HH:mm:ss') // Thu Aug 11 2016 13:28:43 GMT+0800
 *
 * @param str 输入的日期字符串，如'2014-09-13'
 * @param fmt 字符串格式，默认'yyyy-MM-dd'，支持如下：y、M、d、H、m、s、S，不支持w和q
 * @returns 解析后的Date类型日期
 */
function parseDate(str, fmt)
{
    fmt = fmt || 'yyyy-MM-dd';
    var obj = {y: 0, M: 1, d: 0, H: 0, h: 0, m: 0, s: 0, S: 0};
    fmt.replace(/([^yMdHmsS]*?)(([yMdHmsS])\3*)([^yMdHmsS]*?)/g, function(m, $1, $2, $3, $4, idx, old)
    {
        str = str.replace(new RegExp($1+'(\\d{'+$2.length+'})'+$4), function(_m, _$1)
        {
            obj[$3] = parseInt(_$1);
            return '';
        });
        return '';
    });
    obj.M--; // 月份是从0开始的，所以要减去1
    var date = new Date(obj.y, obj.M, obj.d, obj.H, obj.m, obj.s);
    if(obj.S !== 0) date.setMilliseconds(obj.S); // 如果设置了毫秒
    return date;
}

/**
 * 获得URL地址上的get参数。
 *
 * @param fieldName 参数名
 * @return 成功取到则返回参数的value,否则返回null，建议使用时作非空判断“if(ret !=null && ret.toString().length>1)”
 */
getQueryString = function(fieldName)
{
    var reg = new RegExp("(^|&)"+ fieldName +"=([^&]*)(&|$)");
    var r = window.location.search.substr(1).match(reg);
    if(r!=null)return unescape(r[2]); return null;
};
