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
'use strict';

/**
 * 专用于登陆界面的UI和功能逻辑处理对象。
 *
 * 使用面向对向的方式调用实现方法，是为了规范代码的引用和调用，否则浏览器端引用的JS一多，
 * 各种交叉调用会让代码看起来异常混乱。
 *
 * @author Selina
 * @version 1.0
 */

(function(){
    function getUrlKey(name) {
        return decodeURIComponent((new RegExp('[?|&]'+name+'='+'([^&;]+?)(&|#|;|$)').exec(location.href)||[,""])[1].replace(/\+/g,'%20'))||null;
    }
    const setHtmlFontSize = () => {
        const htmlDom = document.getElementsByTagName('html')[0];
        const bodyWidth = document.documentElement.clientWidth || document.body.clientWidth; // 当前窗口的宽度
        const flag = (navigator.userAgent.match(/(phone|pad|pod|iPhone|iPod|ios|iPad|Android|Mobile|BlackBerry|IEMobile|MQQBrowser|JUC|Fennec|wOSBrowser|BrowserNG|WebOS|Symbian|Windows Phone)/i))

        // 检查ref=ios
        const ref = getUrlKey('ref');
        if (ref) {
            sessionStorage.setItem('p-ref', ref);
        }

        if (flag) {
            const whdef = 100 / 750; // 表示750的设计图,使用100PX的默认值
            const rem = bodyWidth * whdef; // 以默认比例值乘以当前窗口宽度,得到该宽度下的相应FONT-SIZE值
            htmlDom.style.fontSize = rem + 'px';
        } else {
            const pfont = getUrlKey('pfont');
            if (pfont) {
                htmlDom.style.fontSize = pfont;
            } else {
                const whdef = 65 / 1920; // 表示1920的设计图,使用100PX的默认值
                const rem = bodyWidth * whdef; // 以默认比例值乘以当前窗口宽度,得到该宽度下的相应FONT-SIZE值
                htmlDom.style.fontSize = rem + 'px';
            }
        }
        return flag
    };
    // 判断是否是手机
    function _isMobile() {
       setHtmlFontSize();
       return RBChatUtils.isMobile();
    }

    if(_isMobile()){
        doLogin();
    }



    /** 用于存储"记住密码"标识到本地cookie的key */
    var COOKIE_KEY_IS_NEED_SAVE_PASSWORD = 'is_nsp';
    /** 用于存储"登陆账号"到本地cookie的key */
    var COOKIE_KEY_SAVED_ACCOUNT = 'sac';
    /** 用于存储"记住密码"标识到本地cookie */
    var COOKIE_KEY_SAVED_PASSWORD = 'sps';
    /** 存储登陆认证成功后服务端返回的本地用户完整信息的cookie过期时间 */
    var COOKIE_KEY_NEED_SAVE_PASSWORD_$EXPIRETIME = 30 * 24 * 60 * 60 * 1000;// 单位：毫秒，目前是保存30*24小时

    let  is_forget_pwd = false;
    let ems_code_time = 60;
    let timer = null;
    let temp_phone = '';

    //--------------------------------------------------------------------------- 登陆相关 START


    /**
     * 保存登陆密码（当然也含登陆账号了）。
     *
     * @param account
     * @param psw
     */
    // FIXME: 注意，为了安全，保存密码到本地cookie的功能建议在生产环境下停用！本工程中为了简单直观地演示此功能，是直接明文保存的
    function saveAccountAndPswToCookie(account, psw){
        var expireDateTime = new Date();
        expireDateTime.setTime(expireDateTime.getTime() + COOKIE_KEY_NEED_SAVE_PASSWORD_$EXPIRETIME);

        // 保存至cookie
        $.cookie(COOKIE_KEY_SAVED_ACCOUNT
            , account, { expires: expireDateTime, path: '/' }); // 所有路径都能读取
        $.cookie(COOKIE_KEY_SAVED_PASSWORD
            , psw, { expires: expireDateTime, path: '/' }); // 所有路径都能读取
    }

    function readAccountFromCookie(){
        return $.cookie(COOKIE_KEY_SAVED_ACCOUNT);
    }

    function readPswFromCookie(){
        return $.cookie(COOKIE_KEY_SAVED_PASSWORD);
    }

    /**
     * 清除登陆密码（当然也含登陆账号了）。
     */
    function clearAccountAndPswToCookie(){
        $.removeCookie(COOKIE_KEY_SAVED_ACCOUNT, { path: '/' });
        $.removeCookie(COOKIE_KEY_SAVED_PASSWORD, { path: '/' });
        //location.reload();
    }

    /**
     * 界面上勾选“保存登陆密码”时，将此勾选开关结果保存起来，以备下次打开登陆界面时使用。
     *
     * @param needSave
     */
    function saveIsNeedRememberPasswordToCookie(needSave){

        // 不需要保存密码，则首先尝试将之前保存的难删除掉
        if(!needSave)
            clearAccountAndPswToCookie();

        var expireDateTime = new Date();
        expireDateTime.setTime(expireDateTime.getTime() + COOKIE_KEY_NEED_SAVE_PASSWORD_$EXPIRETIME);
        // 保存至cookie
        $.cookie(COOKIE_KEY_IS_NEED_SAVE_PASSWORD
            , needSave?'1':'0', { expires: expireDateTime, path: '/' }); // 所有路径都能读取
    }

    /**
     * 读取上次保存过的“保存登陆密码”开关值。
     *
     * @returns {boolean}
     */
    function readIsNeedRememberPasswordFromCookie(){
        return ('1' == $.cookie(COOKIE_KEY_IS_NEED_SAVE_PASSWORD))?true:false;
    }

    /**
     * 登陆界面上的“保存登陆密码”复选框是否勾选。
     *
     * @returns {String|false|null|*|jQuery}
     */
    function isNeedRememberPassword(){
        var isRememberPswChecked = $('#rbchat-form-rememberPswCb').is(':checked');
        return isRememberPswChecked;
    }

    /**
     * 显示或隐藏登陆错误信息提示内容及UI.
     *
     * @param infoText 错误信息文本（当文本不空时表示显示错误信息，否则表示清空并隐藏错误信息及组件的显示）
     */
    function showLoginErrorInfo(infoText)
    {
        var $infoUIObj = $('#rbchat-form-errorMsg');

        if(infoText)
        {
            $infoUIObj.text(infoText);
            $infoUIObj.removeClass('hide');
            RBChatUtils.log(infoText, true);
        }
        else
        {
            $infoUIObj.text('');
            $infoUIObj.addClass('hide');
        }
    }

    /**
     * 显示或取消显示登陆进度提示UI.
     *
     * @param show
     */
    function showLoginLoading(show)
    {
        var $loaingUIObj = $('#rbchat-wrapper-loadding');

        if(show)
            $loaingUIObj.removeClass('hide');
        else
            $loaingUIObj.addClass('hide');
    }

    /**
     * 显示或隐藏显示登陆表单UI.
     *
     * @param show
     */
    function showLoginUI(show) {
        var $loginUIObj = $('#rbchat-wrapper-login');

        if(show) {
            $loginUIObj.removeClass('hide');

            // 读取上次保存的值
            $('#rbchat-form-rememberPswCb').attr("checked", readIsNeedRememberPasswordFromCookie());

            // 读取出之前保存的密码（当然含登陆账号了）
            var accountFromCookie = readAccountFromCookie();
            var pswFromCookie = readPswFromCookie();
            if(accountFromCookie)
                $('#rbchat-form-loginname').val(accountFromCookie);
            if(pswFromCookie)
                $('#rbchat-form-loginpsw').val(pswFromCookie);
        }
        else
            $loginUIObj.addClass('hide');
    }

    function refreshLoginValue(account, psw){
        $('#rbchat-form-loginname').val(account);
        $('#rbchat-form-loginpsw').val(psw);
    }

    /**
     * 执行登陆认证。
     */
    function doLogin() {
        showLoginErrorInfo(null);
        var errorMsg = null;
        if(errorMsg) {
            //showLoginErrorInfo(errorMsg);
            // swal(errorMsg);
            // return;
        } else {
            showLoginUI(false);
            const my_uid = getUrlKey('id');
            // 提交登陆认证
            RBChatRestHelper.newSubmitGetUserInfoToServer(my_uid, function (returnValue){
                    // 根据接口定义，返回不为空即表示认证成功
                    if(!RBChatUtils.isStringEmpty(returnValue)) {
                        console.info('认证成功！');

                        // 将服务端探返回的用户完整信息存储到cookie中以备后绪使用
                        RBChatUtils.saveAuthedLocalUserInfoToCookie(JSON.parse(returnValue));
                        // 跳转到主界面，进入真正的im界面
                        gotoMainUI();
                    } else {
                        console.warn('认证失败。');
                        showLoginErrorInfo('无效登录信息，请确保正确输入了您的用户名和密码.');
                        showLoginUI(true);
                        showLoginLoading(false);
                    }
                }, function (errorThrownStr){
                    //swal('DDD出错了：'+errorThrownStr);
                    showLoginErrorInfo('登陆出错，原因是：'+errorThrownStr);
                    showLoginUI(true);
                    showLoginLoading(false);
                }
            );
        }
    }

    //--------------------------------------------------------------------------- 登陆相关 END



    //--------------------------------------------------------------------------- 注册相关 START
    /**
     * 显示或隐藏注册UI.
     *
     * @param show
     */
    function showRegisterUI(show){
        var $UIObj = $('#rbchat-wrapper-register');
        $("#rbchat-form-register-nickname" ).val('')
        $("#rbchat-form-register-tel" ).val('')
        $("#rbchat-form-register-emscode").val('')
        $("#rbchat-form-register-loginpsw").val('')
        $("#rbchat-form-register-confirmpsw").val('')


        $('#send-ems-code').text('发送验证码')
        if(timer){
            clearInterval(timer)
            timer = null;
        }
        if(show)
            $UIObj.removeClass('hide');
        else
            $UIObj.addClass('hide');
    }

    function doRegister(){

        var nickname = '';
        var emscode = $.trim($('#rbchat-form-register-emscode').val());
        var password = $.trim($('#rbchat-form-register-loginpsw').val());
        var confirmPassword = $.trim($('#rbchat-form-register-confirmpsw').val());
        var sex= '1';

        const countryCode =  $("#contry").val();
        const tel =  $("#rbchat-form-register-tel").val();

        // 是否勾选服务条款
        var isAgree = $('#rbchat-form-register-isagree').is(':checked');

        if (tel.length === 0) {
            swal('请填入注册手机号！');
            return;
        }

        if (emscode.length === 0) {
            swal('请填入短信验证码！');
            return;
        }

        if (password.length === 0) {
            swal('请填入登录密码！');
            return;
        }
        if (confirmPassword.length === 0) {
            swal('请确认登录密码！');
            return;
        }
        if (password.length < 6) {
            swal('登陆密码至少为6位！');
            return;
        }
        if(password != confirmPassword){
            swal('两次输入的密码不一致，请确认！');
            return;
        }

        if(!isAgree){
            swal('请先确认已阅读并同意服务条款！');
            return;
        }

        var $registerSubmitBtn = $('#rbchat-form-register-submitBtn');
        disbableSubmitBtn($registerSubmitBtn, true);
        $registerSubmitBtn.text('注册中 ...');

        // 调用HTTP REST接口：“【接口1008-1-7】用户注册”，具体参数和返回值，详见接口文档或服务端代码。
        RBChatRestHelper.submitRegisterToServer(tel,countryCode, emscode, nickname, password, sex
            // 成功后的回调
            , function (returnValue) {

                // 恢复按钮的UI样式
                disbableSubmitBtn($registerSubmitBtn, false);
                $registerSubmitBtn.text('注册');
                // 跳转到登陆界面，并自动填入刚注册完成的账号和密码（不需要用重新输入就能直接登陆了）
                if(returnValue){

                    var retrunObj = JSON.parse(returnValue);
                    var new_user_uid = retrunObj.new_uid;

                    // 返回值为‘0’表示注册的邮箱已经存在（详见http rest 手册中的“【接口1008-1-7】”的返回值说明）
                    if('0' == new_user_uid){
                        swal(tel+' 已被人注册，请更换邮箱后再试！');
                        return;
                    }
                    else {
                        if(retrunObj.new_uid){
                            swal('注册成功！');

                            hideAllUI();
                            showLoginUI(true);
                            refreshLoginValue(new_user_uid, password);
                        }else{
                            swal(retrunObj.errorMsg)
                        }
                       
                    }
                }
            }
            // 失败后的回调
            , function (errorThrownStr){
                swal('注册失败了，原因是：'+errorThrownStr);

                // 恢复按钮的UI样式
                disbableSubmitBtn($registerSubmitBtn, false);
                $registerSubmitBtn.text('注册');
            }
        );
    }
    //--------------------------------------------------------------------------- 注册相关 START



    //--------------------------------------------------------------------------- 忘记密码相关 START
    function doForgot(){
        // 已经验证过验证码
        if(is_forget_pwd){
            const pwd = $("#rbchat-form-forgot-new-pwd").val();
            const aginPwd = $("#rbchat-form-forgot-agin-new-pwd").val();
            RBChatRestHelper.resetPwdToServer(temp_phone,pwd,aginPwd,function (returnValue){
                const obj = JSON.parse(returnValue);
                if(obj.retCode == 0){
                    swal('密码修改成功');
                }else{
                    swal(obj.errorMsg)
                }
            },function (errorThrownStr){
                swal(errorThrownStr)
            });
        }else{
            const phone = $('#rbchat-form-forgot-stel').val();
            const countryCode = $('#f-contry').val();
            const emsCode =  $('#rbchat-form-forgot-semscode').val();
            temp_phone = '';
            RBChatRestHelper.findPwdCMSCodeToServer(countryCode,phone,emsCode,function (returnValue){
                const obj = JSON.parse(returnValue);
                if(obj.retCode == 0){
                    is_forget_pwd = true;
                    temp_phone = obj.phone
                    $('#forgot-p-new-pwd-div').show();
                    $('#forgot-p-new-agin-pwd-div').show();
                    $('#forgot-div-1').hide();
                    $('#forgot-div-2').hide();
                    $('#forgot-div-3').hide();
                    $('#rbchat-form-forgot-sendForgotMailBtn').text('确定')
                }else{
                    swal(obj.errorMsg)
                }
            },function (errorThrownStr){
                swal(errorThrownStr)
            });
            
        }

    }


    //--------------------------------------------------------------------------- 忘记密码相关 START
    /**
     * 显示或隐藏忘记密码UI.
     *
     * @param show
     */
    function showForgotUI(show){
        var $UIObj = $('#rbchat-wrapper-forgot');
        is_forget_pwd = false;
        if(timer){
            clearInterval(timer)
            timer = null;
        }
        $('#f-send-ems-code').text('发送验证码')
        $('#rbchat-form-forgot-sendForgotMailBtn').text('下一步')
        $('#forgot-p-new-pwd-div').hide();
        $('#forgot-p-new-agin-pwd-div').hide();
        $('#forgot-div-1').show();
        $('#forgot-div-2').show();
        $('#forgot-div-3').show();
        $("#rbchat-wrapper-forgot :input" ).val('')

    
        if(show)
            $UIObj.removeClass('hide');
        else
            $UIObj.addClass('hide');
    }

    function hideAllUI(){
        showLoginUI(false);
        showRegisterUI(false);
        showForgotUI(false);
    }

    /**
     * 为某按钮设置禁用或解除禁用样式。
     *
     * @param btnObj
     * @param disabled true表示高性能为禁用，否由解除禁用
     */
    function disbableSubmitBtn(btnObj, isDisabled){
        if(isDisabled)
            btnObj.attr('disabled', 'disabled');
        else
            btnObj.removeAttr('disabled');
    }

    function gotoMainUI(){
        // 跳转到主界面，进入真正的im界面
        window.location.href = '../index.html';
    }

    ///**
    // * 如果浏览器是低版本IE等，就显示一个提示信息。
    // */
    //function checkLowBrowser() {
    //    var browser = RBChatUtils.getBrowserInfo(),
    //        temp = browser.split(' '),
    //        appname = temp[0],
    //        version = temp[1];
    //    if (['msie', 'firefox', 'opera', 'safari', 'chrome'].contains(appname)) {
    //        if (appname == 'msie' && version < 10) {
    //            $('#rbchat-wrapper-footer').find('p').removeClass('hide');
    //        }
    //    } else {
    //        $('#rbchat-wrapper-footer').find('p').removeClass('hide');
    //    }
    //}

    /**
     * 为按钮添加事件处理。
     */
    function addEvents()
    {

        // 国家默认隐藏
        $("#contry").hide();
        $("#longinType").unbind('change');
        $("#longinType").change(function(){
            const l = $(this).val();
            if(l - 0  == 0){
                $('.row_1').html('请输入你的ID')
                $('#rbchat-form-loginname').attr('placeholder','请输入ID')
                $("#contry").hide();
            }else{
                $('.row_1').html('请输入你的手机号码')
                $('#rbchat-form-loginname').attr('placeholder','请输入手机号')
                $("#contry").show();
            }
        })
 
        //发送短信验证码
        $("#send-ems-code").unbind('click');
        $("#send-ems-code").click(function(){
            const code =  $("#contry").val();
            const tel =  $("#rbchat-form-register-tel").val();
            const t = $(this).text()
            
            if('发送验证码' == t){
                ems_code_time = 60;
                if(tel.length == 0){
                    swal('请输入注册手机号');
                    return;
                }
                //发送短信接口
                RBChatRestHelper.semdCMSCodeToServer(code, tel, 'REGISTER')

                timer = setInterval(()=>{
                    ems_code_time --;
                    if(ems_code_time > 0){
                        $("#send-ems-code").text(ems_code_time+'s');
                    }else{
                        //关掉定时器
                        if(timer){
                            clearInterval(timer)
                            timer = null;
                        }
                        $("#send-ems-code").text('发送验证码');
                    }
                },1000);

            }
        })

          //发送短信验证码
          $("#f-send-ems-code").unbind('click');
          $("#f-send-ems-code").click(function(){
            const code =  $("#f-contry").val();
            const tel =  $("#rbchat-form-forgot-stel").val();
            const t = $(this).text()            
            if('发送验证码' == t){
                ems_code_time = 60;
                if(tel.length == 0){
                    swal('请输入注册手机号');
                    return;
                }
                //发送短信接口
                RBChatRestHelper.semdCMSCodeToServer(code, tel, 'REPASSWORD')

                timer = setInterval(()=>{
                    ems_code_time --;
                    if(ems_code_time > 0){
                        $("#f-send-ems-code").text(ems_code_time+'s');
                    }else{
                        //关掉定时器
                        if(timer){
                            clearInterval(timer)
                            timer = null;
                        }
                        $("#f-send-ems-code").text('发送验证码');
                    }
                },1000);

            }
        })

        $('#rbchat-form-loginBtn').unbind('click');
        $('#rbchat-form-loginBtn').click(function(){
            doLogin();
        });

        $('#rbchat-form-gotoRigisterBtn').unbind('click');
        $('#rbchat-form-gotoRigisterBtn').click(function(){
            hideAllUI();
            showRegisterUI(true);
        });

        $('#rbchat-form-register-gotoLoginBtn').unbind('click');
        $('#rbchat-form-register-gotoLoginBtn').click(function(){
            hideAllUI();
            showLoginUI(true);
        });

        $('#rbchat-form-gotoForgotBtn').unbind('click');
        $('#rbchat-form-gotoForgotBtn').click(function(){
            hideAllUI();
            showForgotUI(true);
        });

        $('#rbchat-form-forgot-backLogonBtn').unbind('click');
        $('#rbchat-form-forgot-backLogonBtn').click(function(){
            hideAllUI();
            showLoginUI(true);
        });

        // 发送忘记密码邮件的确认按钮事件处理
        $('#rbchat-form-forgot-sendForgotMailBtn').unbind('click');
        $('#rbchat-form-forgot-sendForgotMailBtn').click(function(){
            doForgot();
        });

        // 注册界面中的“记住密码”checkbox的点击事件处理
        $('#rbchat-form-rememberPswCb').unbind('change');
        $('#rbchat-form-rememberPswCb').change(function(){
            saveIsNeedRememberPasswordToCookie(isNeedRememberPassword());
        });

        // 注册的确认按钮事件处理
        $('#rbchat-form-register-submitBtn').unbind('click');
        $('#rbchat-form-register-submitBtn').click(function(){
            doRegister();
        });


    }

    /**
     * 初始化方法。
     */
    function init()
    {
        //checkLowBrowser();
        addEvents();
    }

    // 执行Init
    init();

    showLoginUI(true);

})();






