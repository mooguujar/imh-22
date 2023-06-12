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
 * Toast UI组件全局辅助对象。
 */
var RBChatToastHelper = (function () {

    // 构造器（相当于java里的构造方法）
    var UIModule8 = function (argument) {

    };

    /**
     * 返回一个Toast ID号（id的作用是防止id冲突）。
     *
     * @returns {number}
     */
    UIModule8.prototype.nextToastId = function(){
        // 用时间戳作为id号，简单实用
        return RBChatUtils.getCurrentUTCTimestamp();
    };

    /**
     * 关闭指定id的Toast。
     *
     * @param toastId
     */
    UIModule8.prototype.closeToast = function(toastId){
        $('#toast-'+toastId).remove();
    };

    /**
     * 显示一个Toast的通用方法。
     *
     * @param bodyHTML 要显示的toast内容
     * @param toastId toast id，建议唯一，防止id冲突
     * @param delayTimeToClose 当本参数大于0于表示在delayTimeToClose毫秒后自动关闭，否则不自动关闭
     * @param fn_callbackAfterClose 非必须参数：表示当本toast在自动延迟关闭后被调用的回调
     * @returns {*}
     */
    UIModule8.prototype.showToast = function(bodyHTML, toastId, delayTimeToClose, fn_callbackAfterDelayClose){

        var that = this;

        var html =
            "<div id=\'toast-"+toastId+"\'>"+
            "    <div class=\'weui-mask\'></div>"+
            // "    <div class=\'weui-toast\'>"+
            // (bodyHTML?bodyHTML:"")+
            // "    </div>"+
            "</div>";

        // 添加到body元素内
        $("body").append(html);

        // 延时关闭
        if(delayTimeToClose > 0){

            setTimeout(function () {
                // 关闭本toast
                that.closeToast(toastId)
                // 关闭本toast后的额外回调
                if(fn_callbackAfterDelayClose){
                    fn_callbackAfterDelayClose();
                }
            }, delayTimeToClose);
        }

        return toastId;
    };

    UIModule8.prototype.showToast_Loading = function(content){
        var toastId = this.nextToastId();

        // 要显示于Toast中的html内容
        var bodyHTML  =
            "        <i class=\'weui-loading weui-icon_toast\'></i>"+
            "        <p class=\'weui-toast__content\'>"+(content?content:"数据加载中")+"</p>";

        return this.showToast('', toastId, 0);
    };

    /**
     * 显示一个仿微信的OK样式的Toast。
     *
     * @param content 要显示的内容，空参数则自动使用默认值
     * @param fn_callbackAfterClose 非必须参数：表示当本toast在自动延迟关闭后被调用的回调，不需要请传null
     * @returns {*}
     */
    UIModule8.prototype.showToast_OK = function(content, fn_callbackAfterDelayClose){
        var toastId = this.nextToastId();

        // 要显示于Toast中的html内容
        var bodyHTML  =
            "        <i class=\'weui-icon-success-no-circle weui-icon_toast\'></i>"+
            "        <p class=\'weui-toast__content\'>"+(content?content:"已完成")+"</p>";

        return this.showToast(bodyHTML, toastId, 3000, fn_callbackAfterDelayClose);
    };

    /**
     * 显示一个仿微信的INFO样式的Toast。
     *
     * @param content 要显示的内容，空参数则自动使用默认值
     * @param fn_callbackAfterClose 非必须参数：表示当本toast在自动延迟关闭后被调用的回调，不需要请传null
     * @returns {*}
     */
    UIModule8.prototype.showToast_INFO = function(content, fn_callbackAfterDelayClose){
        var toastId = this.nextToastId();

        // 要显示于Toast中的html内容
        var bodyHTML  =
            "        <i class=\'weui-icon-info weui-icon_toast\'></i>"+
            "        <p class=\'weui-toast__content\'>"+content+"</p>";

        return this.showToast(bodyHTML, toastId, 3000, fn_callbackAfterDelayClose);
    };

    /**
     * 显示一个仿微信的WARN样式的Toast。
     *
     * @param content 要显示的内容，空参数则自动使用默认值
     * @param fn_callbackAfterClose 非必须参数：表示当本toast在自动延迟关闭后被调用的回调，不需要请传null
     * @returns {*}
     */
    UIModule8.prototype.showToast_WARN = function(content, fn_callbackAfterDelayClose){
        var toastId = this.nextToastId();

        // 要显示于Toast中的html内容
        var bodyHTML  =
            "        <i class=\'weui-icon-warn weui-icon_toast\'></i>"+
            "        <p class=\'weui-toast__content\'>"+content+"</p>";

        return this.showToast(bodyHTML, toastId, 3000, fn_callbackAfterDelayClose);
    };

    /**
     * 显示一个仿微信的ERROR样式的Toast。
     *
     * @param content 要显示的内容，空参数则自动使用默认值
     * @param fn_callbackAfterClose 非必须参数：表示当本toast在自动延迟关闭后被调用的回调，不需要请传null
     * @returns {*}
     */
    UIModule8.prototype.showToast_ERROR = function(content, fn_callbackAfterDelayClose){
        var toastId = this.nextToastId();

        // 要显示于Toast中的html内容
        var bodyHTML  =
            "        <i class=\'weui-icon-error weui-icon_toast\'></i>"+
            "        <p class=\'weui-toast__content\'>"+content+"</p>";

        return this.showToast(bodyHTML, toastId, 3000, fn_callbackAfterDelayClose);
    };


    return new UIModule8();
})();


/**
 * 一个可显示进度提示框的定时器工厂类（在开发者指定的时间后通知观察者）。
 *
 * @param delay {int} 定时时间（单位：毫秒）
 * @param content 进度提示文字资源ID，为空则显示默认内容
 * @param callbackForTimout 定时结束时要通知的回调，为空则不需要进行回调
 *
 * @author JackJiang
 * @since 4.0
 */
RBLoadingToastTimmerFactory = function (delay, content, callbackForTimout) {

    // 构造器（相当于java里的构造方法）
    var RBLoadingToastTimmer = function (a1, a2, a3) {

        /** 定时时间（单位：毫秒） */
        this.delay = a1;//6000;
        /** 进度提示文字资源ID */
        this.content = a2;
        /** 定时结束时要通知的回调 */
        // TODO: 重构名为 callback
        this.obserer = a3;

        if(!this.delay)
            this.delay = 6000;
        if(!this.content)
            this.content = "数据加载中";

        // 保存setTimeout(...)定时器id（此id方便用于关闭定时器时使用）
        this.timeoutId = 0;

        this.loadingToastID = -1;
    };

    RBLoadingToastTimmer.prototype.init = function(){
        //
    };

    /**
     * 显示进度提示对话框.
     *
     * @param show {boolean} true表示显示，否则表示取消显示
     */
    // TODO: 重构名为 showLoading
    RBLoadingToastTimmer.prototype.showProgressDialogForPairing = function(showNow) {
        if(showNow)
            this.show();
        else
            this.hide();
    };

    RBLoadingToastTimmer.prototype.show = function () {

        // 先尝试关闭之前已显示的
        this.hide();

        // 显示进度提示框
        this.loadingToastID = RBChatToastHelper.showToast_Loading(this.content);

        let that = this;
        // 定时执行
        this.timeoutId = setTimeout(function () {
            if(that.obserer)
                that.obserer();
        }, this.delay);
    };

    RBLoadingToastTimmer.prototype.hide = function () {
        if(this.timeoutId && this.timeoutId !== 0) {
            clearTimeout(this.timeoutId);
            this.timeoutId = 0;
        }

        if(this.loadingToastID > 0){
            // 关闭toast显示
            RBChatToastHelper.closeToast(this.loadingToastID);
            this.loadingToastID = -1
        }
    };

    RBLoadingToastTimmer.prototype.isShowing = function(){
        return this.loadingToastID > 0;
    };


    return new RBLoadingToastTimmer(delay, content, callbackForTimout);
};