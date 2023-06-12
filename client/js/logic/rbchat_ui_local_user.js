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
 * 本地用户信息显示UI模块（即主界面左上角那一块的UI显示封装）（是一个windows范围内的全局对象）。
 */
var RBChatLocalUserUI = (function () {

    // 构造器（相当于java里的构造方法）
    var UIModule2 = function (argument){

        if(RBChatUtils.isMobile()){
             // 本地用户头像的Img对象
            this.$avatarImg = $('#im-panel-header-user-avatar-phone');
            // 昵称ui组件
            this.$nickname = $('#im-panel-header-user-showname-phone');
            // 个人签名ui组件
            this.$whatsUp = $('#im-panel-header-user-whatsup-phone');
        }else{
             // 本地用户头像的Img对象
            this.$avatarImg = $('#im-panel-header-user-avatar');
            // 昵称ui组件
            this.$nickname = $('#im-panel-header-user-showname');
            // 个人签名ui组件
            this.$whatsUp = $('#im-panel-header-user-whatsup');
        }
       
    };

    /**
     * 本封装对象的所有初始化动作，放在本函数中执行。
     */
    UIModule2.prototype.init = function () {
        this.initClickShowLocalInfoEvent();
        this.initClickEditWhatsupEvent();
    };

    /**
     * 点击显示本地用户信息的事件处理。
     */
    UIModule2.prototype.initClickShowLocalInfoEvent = function(){
        var fun = function(event){
            // // 读取本地用户信息
            // var localUserInfo = LocalUserInfo.getObj();
            // // 显示之
            // if(localUserInfo){
            //     RBChatDialogHelper.showUserInfo(localUserInfo);
            // }

            // 显用本地用户信息
            RBChatDialogHelper.showLocalUserInfo();
        };

        // 点击本地用户的头像
        if(RBChatUtils.isMobile()){
            $('#im-panel-header-user-avatar-parent-phone').click(fun);
            // 点击用本地用户的昵称
            $('#im-panel-header-user-showname-phone').click(fun);
        }else{
            $('#im-panel-header-user-avatar-parent').click(fun);
            // 点击用本地用户的昵称
            $('#im-panel-header-user-showname').click(fun);
        }
      
    };

    /**
     * 点击本地用户的个性签名的事件处理。
     */
    UIModule2.prototype.initClickEditWhatsupEvent = function(){
        var fun = function(event){
            RBChatDialogHelper.showLocalUserWhatsupEdit();
        };

        // 点击个性签名
        this.$whatsUp.click(fun);
    };

    /**
     * 刷新UI的数据内容显示。
     */
    UIModule2.prototype.refresh = function () {

        // 读取本地用户信息
        var localUserInfo = LocalUserInfo.getObj();

        if(localUserInfo){

            // 显示本地用户头像图片
            //this.$avatarImg.attr('src',RBChatUtils.getUserAvatarDownloadURL(localUserInfo.user_uid, true));
            this.refreshAvatarImage();

            // 显示昵称
            this.$nickname.text(localUserInfo.nickname);
            this.$nickname.attr('title', localUserInfo.nickname);

            var whatsUpShow = (localUserInfo.whatsUp?localUserInfo.whatsUp:'编辑个性签名');
            this.$whatsUp.text(whatsUpShow);
            this.$whatsUp.attr('title', '[个性签名] '+whatsUpShow);
        }
    };

    /**
     * 单独刷新用户头像图片的显示（比如：用户上传了新头像完成后）。
     */
    UIModule2.prototype.refreshAvatarImage = function(){
        // 读取本地用户信息
        var localUserInfo = LocalUserInfo.getObj();
        if(localUserInfo){
            // 显示本地用户头像图片
            this.$avatarImg.css('display','')
            this.$avatarImg.attr('src',RBChatUtils.getUserAvatarDownloadURL(localUserInfo.user_uid, true));
            const defaultColor = RBChatUtils.getBgColor(localUserInfo.user_uid)
            const show_t = localUserInfo.nickname && localUserInfo.nickname.length > 0 ? localUserInfo.nickname.substr(0, 1).toUpperCase():'';
            $('#im-panel-header-user-avatar-default').css('background',defaultColor)
            $('#im-panel-header-user-avatar-default').text(show_t)
        }
    };

    /**
     * 刷新本地用户的在线状态UI显示。
     */
    UIModule2.prototype.refreshOnlineStatus = function(){
        var currentStatusOBJ = RBChatUtils.isMobile() ? $('#im-panel-header-user-status-phone'): $('#im-panel-header-user-status');

        if(IMSDK.isOnline()){
            currentStatusOBJ.removeClass('offline');
            currentStatusOBJ.addClass('online');
            currentStatusOBJ.attr('title', '在线状态：[在线]');
        }
        else{
            currentStatusOBJ.removeClass('online');
            currentStatusOBJ.addClass('offline');
            currentStatusOBJ.attr('title', '在线状态：[已离线]');
        }
    };

    /**
     * 刷新主界面左下角网络连接状态UI显示。
     */
    UIModule2.prototype.refreshConnectionStatus = function(){
        var currentStatusOBJ = $('#im-panel-userlist-bottom');
        var destOBJ = $('#im-panel-userlist-bottom-imnetworkstatusdesc');

        if(IMSDK.isOnline()){
            currentStatusOBJ.removeClass('im-panel-userlist-bottom_warn');
            currentStatusOBJ.addClass('im-panel-userlist-bottom_ok');
            currentStatusOBJ.attr('title', '网络连接：[连接正常]');
            destOBJ.text('通信正常');
        }
        else{
            currentStatusOBJ.removeClass('im-panel-userlist-bottom_ok');
            currentStatusOBJ.addClass('im-panel-userlist-bottom_warn');
            currentStatusOBJ.attr('title', '网络连接：[已断开]');
            destOBJ.text('连接已断开');
        }
    };

    UIModule2.prototype.setConnectionStatusIconLight = function(isLight){
        var obj = $('#im-panel-userlist-bottom-imnetworkstatusicon');

        if(isLight)
            obj.addClass('light');
        else
            obj.removeClass('light');
    };

    // 新建本模块对象
    var thisModule = new UIModule2();
    // 调用初始化方法
    thisModule.init();

    return thisModule;// 此种方式用于构造器的方式
})();
