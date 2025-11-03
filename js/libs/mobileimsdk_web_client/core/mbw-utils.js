
const MBUtils = (function () {

    const TAG = "MBUtils";

    // 构造器（相当于java里的构造方法）
    let ModuleMBUtils = function (argument) {
        // nothing
    };

    /**
     * ！本方法用于替代码 mobileimsdk-client-common.js 中的同名方法！
     *
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
    ModuleMBUtils.prototype.formatDate = function (date, fmt) { //author: meizz
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
     * ！本方法用于替代码 mobileimsdk-client-common.js 中的同名方法！
     *
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
    ModuleMBUtils.prototype.parseDate = function (str, fmt) {
        fmt = fmt || 'yyyy-MM-dd';
        var obj = {y: 0, M: 1, d: 0, H: 0, h: 0, m: 0, s: 0, S: 0};
        fmt.replace(/([^yMdHmsS]*?)(([yMdHmsS])\3*)([^yMdHmsS]*?)/g, function (m, $1, $2, $3, $4, idx, old) {
            str = str.replace(new RegExp($1 + '(\\d{' + $2.length + '})' + $4), function (_m, _$1) {
                obj[$3] = parseInt(_$1);
                return '';
            });
            return '';
        });
        obj.M--; // 月份是从0开始的，所以要减去1
        var date = new Date(obj.y, obj.M, obj.d, obj.H, obj.m, obj.s);
        if (obj.S !== 0) date.setMilliseconds(obj.S); // 如果设置了毫秒
        return date;
    };

    /**
     * ！本方法用于替代码 mobileimsdk-client-common.js 中的同名方法！
     *
     * 获得URL地址上的get参数。
     *
     * @param fieldName 参数名
     * @return 成功取到则返回参数的value,否则返回null，建议使用时作非空判断“if(ret !=null && ret.toString().length>1)”
     */
    ModuleMBUtils.prototype.getQueryString = function (fieldName) {
        var reg = new RegExp("(^|&)" + fieldName + "=([^&]*)(&|$)");
        var r = window.location.search.substr(1).match(reg);
        if (r != null) return unescape(r[2]);
        return null;
    };

    ModuleMBUtils.prototype.mblog = function (message) {
        var logPrefix = '☀ [' + this.formatDate(new Date(), 'MM/dd hh:mm:ss.S') + '] ' + '[CORE] ';
        var len = arguments.length;
        if (len === 1) {
            var logMsg = logPrefix + message;
            console.info(logMsg);
        } else if (len >= 2) {
            var logMsg = logPrefix + message;
            console.info(logMsg, arguments[1]);
        }
    };
    ModuleMBUtils.prototype.mblog_i = function () {
        var len = arguments.length;
        if (len === 1)
            this.mblog('<INFO>' + ' ' + arguments[0]);
        else if (len === 2)
            this.mblog('<INFO>' + (arguments[0] ? '[' + arguments[0] + ']' : '') + ' ' + arguments[1]);
        else if (len === 3)
            this.mblog('<INFO>' + (arguments[0] ? '[' + arguments[0] + ']' : '') + ' ' + arguments[1], arguments[2]);
    };
    ModuleMBUtils.prototype.mblog_d = function () {
        var len = arguments.length;
        if (len === 1)
            this.mblog('<DEBUG>' + ' ' + arguments[0]);
        else if (len === 2)
            this.mblog('<DEBUG>' + (arguments[0] ? '[' + arguments[0] + ']' : '') + ' ' + arguments[1]);
        else if (len === 3)
            this.mblog('<DEBUG>' + (arguments[0] ? '[' + arguments[0] + ']' : '') + ' ' + arguments[1], arguments[2]);
    };
    ModuleMBUtils.prototype.mblog_w = function () {
        var len = arguments.length;
        if (len === 1)
            this.mblog('<WARN>' + ' ' + arguments[0]);
        else if (len === 2)
            this.mblog('<WARN>' + (arguments[0] ? '[' + arguments[0] + ']' : '') + ' ' + arguments[1]);
        else if (len === 3)
            this.mblog('<WARN>' + (arguments[0] ? '[' + arguments[0] + ']' : '') + ' ' + arguments[1], arguments[2]);
    };
    ModuleMBUtils.prototype.mblog_e = function () {
        var len = arguments.length;
        if (len === 1)
            this.mblog('<ERROR>' + ' ' + arguments[0]);
        else if (len === 2)
            this.mblog('<ERROR>' + (arguments[0] ? '[' + arguments[0] + ']' : '') + ' ' + arguments[1]);
        else if (len === 3)
            this.mblog('<ERROR>' + (arguments[0] ? '[' + arguments[0] + ']' : '') + ' ' + arguments[1], arguments[2]);
    };

    /**
     * 是否正整数（即大于0的整数）。
     *
     * @param int
     * @returns {boolean}
     */
    ModuleMBUtils.prototype.isPositiveInteger = function (int) {
        if (!(/(^[1-9]\d*$)/.test(int))) {
            return false;
        }
        return true;
    };

    /**
     * 在JS中返回当前系统的时间戳。
     *
     * @returns {number} 形如：1280977330748 的长整数
     */
    ModuleMBUtils.prototype.getCurrentUTCTimestamp = function () {
        return new Date().getTime();
    };

    // 实例化此类
    return new ModuleMBUtils();
})();


