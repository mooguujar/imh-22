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
 * 弹出对话框的UI封装辅助类。
 */
var RBChatDialogHelper = (function () {

    // 构造器（相当于java里的构造方法）
    var UIModule7 = function (argument) {

    };

    UIModule7.prototype.nextDialogId = function () {

        var dialogId = window.dialogId;
        if (!dialogId)
            dialogId = 0;
        dialogId += 1;
        window.dialogId = dialogId;

        return dialogId;
    };

    /**
     * 关闭指定id的对话框。
     *
     * @param dialogId
     */
    UIModule7.prototype.closeDialog = function (dialogId) {
        $('#dialog-' + dialogId).remove();
    };

    /**
     * 设置指定id的对话框body内容。
     *
     * @param dialogId
     * @param newBodyHTML 本参数为空表示清除原body内容，否则表示替换为新内容
     */
    UIModule7.prototype.setDialogBody = function (dialogId, newBodyHTML) {
        var bodyOBJ = $('#dialog-body-' + dialogId);
        if (newBodyHTML) {
            bodyOBJ.empty();
            bodyOBJ.append(newBodyHTML);
        }
        // 如果newBodyHTML为空，即表示只是清空原body内容而已
        else {
            bodyOBJ.empty();
        }
    };

    /**
    * 一个显示模态对话框的通用方法。
    *
    *
    * @param title 对话框标题
    * @param cancelButtonText 取消按钮上的文字
    * @param okButtonText 确认按钮上的文字
    * @param bodyHTML 对话中要显示的html内容
    * @param dialogId 对话框id，为了防止全局取id对象发生冲突，建议必须使用，请调用 RBChatDialogHelper.nextDialogId() 获取之
    * @param fn_cancelCallback  非必须参数，取消按钮点击后的事件处理回调函数
    * @param fn_submitCallback 非必须参数，确定按钮点击后的事件处理回调函数
    * @param isShowFooter true表示显示底部的“确认”、“取消”按钮那整个div，否则不显示
    * @param lightboxStyleExtra 非必须参数，dialog可视窗口的额外样式
    * @param bodyStyleExtra 非必须参业务，对话框内容的额外样式
    * @param notShowCancelButton true表示不显示“取消”按钮，否则显示之
    * @param notShowOkButton  true表示不显示“确认”按钮，否则显示之
    */
    UIModule7.prototype.showGMSDialog = function (title, cancelButtonText, okButtonText
        , bodyHTML, dialogId, fn_cancelCallback, fn_submitCallback, isShowFooter, lightboxStyleExtra, bodyStyleExtra
        , notShowCancelButton, notShowOkButton) {

        var that = this;

        var html =
            "<div id=\'dialog-" + dialogId + "\' style=\'position: fixed; z-index: 9999;\'>" +
            "    <div class=\'mask show\'>" +
            "        <div class=\'mask-inner\'>" +
            "            <div class=\'lightbox\' " + (lightboxStyleExtra ? "style=\'" + lightboxStyleExtra + "\'" : "") + ">" +
            "                <header>" +
            "                    <h4 id=\'dialog-header-title-" + dialogId + "\'>" + (title ? title : "提示") + "</h4>" +
            "                    <a id=\'dialog-header-closebtn-" + dialogId + "\' class=\'close light-box-close\'><i class=\'icon-close\'></i></a>" +
            "                </header>" +
            "                <div id=\'dialog-body-" + dialogId + "\' class=\'body\' " + (bodyStyleExtra ? "style=\'" + bodyStyleExtra + "\'" : "") + ">" +
            (bodyHTML ? bodyHTML : "") +
            "                </div>" +
            "                <div  class=\'footer\' style='display:flex:flex-direction:column;' id='merbers-select-root'>" +
            "                   <div id ='select-name-txt-show' class='select-name-txt-show'></div>" +
            "                   <div class='member-select-div' id='members-select-div'></div>  " +
            "                </div>" +
            "                <div id=\'dialog-footer-" + dialogId + "\' class=\'footer\' " + (isShowFooter ? "" : "style=\'display:none;\'") + ">" +
            "                    <a id=\'dialog-footer-cancelbtn-" + dialogId + "\' class=\'btn btn-light fl\' " + (notShowCancelButton ? "style=\'display:none;\'" : "") + ">" + (cancelButtonText ? cancelButtonText : "取消") + "</a>" +
            "                    <a id=\'dialog-footer-okbtn-" + dialogId + "\' class=\'btn btn-blue fr\' " + (notShowOkButton ? "style=\'display:none;\'" : "") + ">" + (okButtonText ? okButtonText : "提交") + "</a>" +
            "                </div>" +
            "            </div>" +
            "        </div>" +
            "    </div>" +
            "</div>";

        // 添加到body元素内
        $("body").append(html);

        // 默认的关闭本对话框的实现函数
        var fn_closeDialogDefalt = function (e) {
            //$("#dialog-"+dialogId).hide();
            that.closeDialog(dialogId);
        };

        // 关闭按钮点击事件处理
        $("#dialog-header-closebtn-" + dialogId).click(fn_closeDialogDefalt);
        // 取消按钮
        $("#dialog-footer-cancelbtn-" + dialogId).click(fn_cancelCallback ? fn_cancelCallback : fn_closeDialogDefalt);
        // 确认按钮
        $("#dialog-footer-okbtn-" + dialogId).click(fn_submitCallback ? fn_submitCallback : fn_closeDialogDefalt);

        // enter键监听
        var func = function (e) {
            if (e.keyCode == 13) {
                fn_submitCallback ? fn_submitCallback() : fn_closeDialogDefalt()
                e.preventDefault();
            }
        }
        $("#dialog-" + dialogId).keydown(func);
    };


    UIModule7.prototype.showForWardDialog = function (title, cancelButtonText, okButtonText
        , bodyHTML, dialogId, fn_cancelCallback, fn_submitCallback, isShowFooter, lightboxStyleExtra, bodyStyleExtra
        , notShowCancelButton, notShowOkButton) {

        var that = this;

        var html =
            "<div id=\'dialog-" + dialogId + "\' style=\'position: fixed; z-index: 9999;\'>" +
            "    <div class=\'mask show\'>" +
            "        <div class=\'mask-inner\'>" +
            "            <div class=\'lightbox\' " + (lightboxStyleExtra ? "style=\'" + lightboxStyleExtra + "\'" : "") + ">" +
            "                <header>" +
            "                    <h4 id=\'dialog-header-title-" + dialogId + "\'>" + (title ? title : "提示") + "</h4>" +
            "                    <a id=\'dialog-header-closebtn-" + dialogId + "\' class=\'close light-box-close\'><i class=\'icon-close\'></i></a>" +
            "                </header>" +
            "                <div id=\'dialog-body-" + dialogId + "\' class=\'body\' " + (bodyStyleExtra ? "style=\'" + bodyStyleExtra + "\'" : "") + ">" +
            (bodyHTML ? bodyHTML : "") +
            "                </div>" +
            "                <div  class=\'footer\' style='display:flex:flex-direction:column;' id='merbers-select-root'>" +
            "                   <div id ='select-name-txt-show' class='select-name-txt-show'></div>" +
            "                   <div class='member-select-div' style='width:350px !important;' id='members-select-div'></div>  " +
            "                </div>" +
            "                <div id=\'dialog-footer-" + dialogId + "\' class=\'footer\' " + (isShowFooter ? "" : "style=\'display:none;\'") + ">" +
            "                    <a id=\'dialog-footer-cancelbtn-" + dialogId + "\' class=\'btn btn-light fl\' " + (notShowCancelButton ? "style=\'display:none;\'" : "") + ">" + (cancelButtonText ? cancelButtonText : "取消") + "</a>" +
            "                    <a id=\'dialog-footer-okbtn-" + dialogId + "\' class=\'btn btn-blue fr\' " + (notShowOkButton ? "style=\'display:none;\'" : "") + ">" + (okButtonText ? okButtonText : "提交") + "</a>" +
            "                </div>" +
            "            </div>" +
            "        </div>" +
            "    </div>" +
            "</div>";

        // 添加到body元素内
        $("body").append(html);

        // 默认的关闭本对话框的实现函数
        var fn_closeDialogDefalt = function (e) {
            //$("#dialog-"+dialogId).hide();
            that.closeDialog(dialogId);
        };

        // 关闭按钮点击事件处理
        $("#dialog-header-closebtn-" + dialogId).click(fn_closeDialogDefalt);
        // 取消按钮
        $("#dialog-footer-cancelbtn-" + dialogId).click(fn_cancelCallback ? fn_cancelCallback : fn_closeDialogDefalt);
        // 确认按钮
        $("#dialog-footer-okbtn-" + dialogId).click(fn_submitCallback ? fn_submitCallback : fn_closeDialogDefalt);

        // enter键监听
        var func = function (e) {
            if (e.keyCode == 13) {
                fn_submitCallback ? fn_submitCallback() : fn_closeDialogDefalt()
                e.preventDefault();
            }
        }
        $("#dialog-" + dialogId).keydown(func);
    };

    /**
     * 一个显示模态对话框的通用方法。
     *
     *
     * @param title 对话框标题
     * @param cancelButtonText 取消按钮上的文字
     * @param okButtonText 确认按钮上的文字
     * @param bodyHTML 对话中要显示的html内容
     * @param dialogId 对话框id，为了防止全局取id对象发生冲突，建议必须使用，请调用 RBChatDialogHelper.nextDialogId() 获取之
     * @param fn_cancelCallback  非必须参数，取消按钮点击后的事件处理回调函数
     * @param fn_submitCallback 非必须参数，确定按钮点击后的事件处理回调函数
     * @param isShowFooter true表示显示底部的“确认”、“取消”按钮那整个div，否则不显示
     * @param lightboxStyleExtra 非必须参数，dialog可视窗口的额外样式
     * @param bodyStyleExtra 非必须参业务，对话框内容的额外样式
     * @param notShowCancelButton true表示不显示“取消”按钮，否则显示之
     * @param notShowOkButton  true表示不显示“确认”按钮，否则显示之
     */
    UIModule7.prototype.showDialog = function (title, cancelButtonText, okButtonText
        , bodyHTML, dialogId, fn_cancelCallback, fn_submitCallback, isShowFooter, lightboxStyleExtra, bodyStyleExtra
        , notShowCancelButton, notShowOkButton) {

        var that = this;

        var html =
            "<div id=\'dialog-" + dialogId + "\' style=\'position: fixed; z-index: 9999;\'>" +
            "    <div class=\'mask show\'>" +
            "        <div class=\'mask-inner\'>" +
            "            <div class=\'lightbox\' " + (lightboxStyleExtra ? "style=\'" + lightboxStyleExtra + "\'" : "") + ">" +
            "                <header>" +
            "                    <h4 id=\'dialog-header-title-" + dialogId + "\'>" + (title ? title : "提示") + "</h4>" +
            "                    <a id=\'dialog-header-closebtn-" + dialogId + "\' class=\'close light-box-close\'><i class=\'icon-close\'></i></a>" +
            "                </header>" +
            "                <div id=\'dialog-body-" + dialogId + "\' class=\'body\' " + (bodyStyleExtra ? "style=\'" + bodyStyleExtra + "\'" : "") + ">" +
            (bodyHTML ? bodyHTML : "") +
            "                </div>" +
            "                <div id=\'dialog-footer-" + dialogId + "\' class=\'footer\' " + (isShowFooter ? "" : "style=\'display:none;\'") + ">" +
            "                    <a id=\'dialog-footer-cancelbtn-" + dialogId + "\' class=\'btn btn-light fl\' " + (notShowCancelButton ? "style=\'display:none;\'" : "") + ">" + (cancelButtonText ? cancelButtonText : "取消") + "</a>" +
            "                    <a id=\'dialog-footer-okbtn-" + dialogId + "\' class=\'btn btn-blue fr " + (window.showCopyPic ? " d-s-copy-pic" : "") + " \' " + (notShowOkButton ? "style=\'display:none;\'" : "") + ">" + (okButtonText ? okButtonText : "提交") + "</a>" +
            "                </div>" +
            "            </div>" +
            "        </div>" +
            "    </div>" +
            "</div>";

        /// 手机版适配
        if (RBChatUtils.isMobile()) {
            html =
                "<div id=\'dialog-" + dialogId + "\' style=\'position: fixed; z-index: 9999;\'>" +
                "    <div class=\'mask show\'>" +
                "        <div class=\'mask-inner\'>" +
                "            <div class=\'lightbox\' style='box-shadow: unset !important;border-radius: unset !important; width:100%;height:100%;' >" +
                "                <header style='display:flex;position:relative;align-items: center;'>" +
                "                    <img id=\'dialog-header-closebtn-" + dialogId + "\' src='images/im_b_img/left_jt_3.png' alt=''/>" +
                "                    <span id=\'dialog-header-title-" + dialogId + "\'>" + (title ? title : "提示") + "</span>" +
                "                </header>" +
                "                <div id=\'dialog-body-" + dialogId + "\' class=\'body\'>" +
                (bodyHTML ? bodyHTML : "") +
                "                </div>" +
                "                <div id=\'dialog-footer-" + dialogId + "\' class=\'footer\' " + (isShowFooter ? "style='margin: 0 15px'" : "style=\'display:none;\'") + ">" +
                "                    <a id=\'dialog-footer-okbtn-" + dialogId + "\' class=\'btn btn-blue fr \' " + (notShowOkButton ? "style=\'display:none;\'" : "") + ">" + (okButtonText ? okButtonText : "提交") + "</a>" +
                "                </div>" +
                "            </div>" +
                "        </div>" +
                "    </div>" +
                "</div>";
        }

        // 添加到body元素内
        $("body").append(html);

        // 默认的关闭本对话框的实现函数
        var fn_closeDialogDefalt = function (e) {
            window.showCopyPic = false;
            //$("#dialog-"+dialogId).hide();
            that.closeDialog(dialogId);
            var obj_show = {
                isShowBar : 'true',
                from:'chat'
            }
            // 底部tab展示，
            window.parent.postMessage(JSON.stringify(obj_show),'*');
            $(".bootQuestion").css({ 'display': 'block' })
        };

        // 关闭按钮点击事件处理
        $("#dialog-header-closebtn-" + dialogId).click(fn_closeDialogDefalt);
        // 取消按钮
        $("#dialog-footer-cancelbtn-" + dialogId).click(fn_cancelCallback ? fn_cancelCallback : fn_closeDialogDefalt);
        // 确认按钮
        $("#dialog-footer-okbtn-" + dialogId).click(fn_submitCallback ? fn_submitCallback : fn_closeDialogDefalt);

        // enter键监听
        var func = function (e) {
            if (e.keyCode == 13) {
                fn_submitCallback ? fn_submitCallback() : fn_closeDialogDefalt()
                e.preventDefault();
            }
        }
        $("#dialog-" + dialogId).keydown(func);
    };

    /**
     * 显示一个确认提示弹出框。
     *
     * @param title 对话框标题
     * @param okButtonText 确认按钮上的文字
     * @param content 对话中要显示的提示内容
     * @param dialogId 对话框id，为了防止全局取id对象发生冲突，建议必须使用，请调用 RBChatDialogHelper.nextDialogId() 获取之
     * @param fn_submitCallback 非必须参数，确定按钮点击后的事件处理回调函数
     * @returns {*}
     */
    UIModule7.prototype.showConfrimDialog = function (title, okButtonText, content, dialogId, fn_submitCallback) {

        // 要显示于对话框中的html内容
        var bodyHTML =
            "<div class=\'weui-msg\'>" +
            "	<div class=\'weui-msg__icon-area\'><i class=\'weui-icon-waiting weui-icon_msg\'></i></div>" +
            "	<div class=\'weui-msg__text-area\'>" +
            //"		<h2 class=\'weui-msg__title\'>"+title+"</h2>"+
            "		<p class=\'weui-msg__desc\'>" + content + "</p>" +
            "	</div>" +
            "</div>";

        // 先把对话框显示出来
        this.showDialog(title//" "
            , "取消"
            , okButtonText
            , bodyHTML
            , dialogId
            , null
            , fn_submitCallback
            , true
            , "min-width: 300px;max-width: 350px;"
            , "padding: 0;"
            , false
            , false);

        AudioPromptHelper.confirmPromt();

        return dialogId;
    };

    /**
     *  多图片及视频发送
     * @param {*} images 
     * @param {*} is_img 
     * @returns 
     */
    UIModule7.prototype.showMulImageSendDialog = function (files, is_img = true, isMoive=false) {

        var that = this;
        var dialogId = this.nextDialogId();
        var file_html = RBChatUtils.draw_mul_pic(files, !is_img,isMoive)
        // 要显示于对话框中的html内容
        var bodyHTML =
            "<div class=\'mul-img-send\' style='height:600px'>" +
            "  <div class='row-1'>" + file_html + "</div>" +
            "  <div class='row-3'> <input name='hb-send' id='hb-send' type='checkbox' value='' /><span>合并发送</span></div>" +
            " <div class='row-2'><textarea id=\'dialog-info-" + dialogId + "\' rows='5' style='padding:3px;width:350px'  placeholder=\'说点什么 ...\' /> </div>" +
            "</div>";

        var onSure = function () {
            const text = $('#dialog-info-' + dialogId).val();
            // 选中
            if ($("input[type='checkbox']").is(':checked')) {
                const msgBody = {
                    text,
                    files,
                    type: is_img ? '0' : '1',
                }
                var fingerPrint = MBProtocalFactory.genFingerPrint();
                // 向群内所有人发送此次公告内容
                RBChatChattingContentPaneUI.doSendMessageImpl(JSON.stringify(msgBody), 13, function () {
                    // 关闭当前的确认对话框
                    that.closeDialog(dialogId);
                }, fingerPrint);
                // 未选中
            } else {
                if (!RBChatMainUI.getCurrentSelectedAlarmDataId()) {
                    that.closeDialog(dialogId);
                    return;
                }
                var sendUser = { currentSelectedAlarmType: RBChatMainUI.getCurrentSelectedAlarmType(), currentSelectedAlarmDataId: RBChatMainUI.getCurrentSelectedAlarmDataId() };
                // 发送图片
                if (is_img) {
                    for (file of files) {
                        RBChatChattingContentPaneUI.doSendImageMessage4IM(file.fileMd5, sendUser)
                    }
                    // 发送文字
                    if (text && text.length > 0) {
                        var fingerPrint = MBProtocalFactory.genFingerPrint();
                        RBChatChattingContentPaneUI.doSendMessageImpl(text, MsgType.TYPE_TEXT, null, fingerPrint, sendUser);
                    }
                    that.closeDialog(dialogId);
                } else {
                    for (file of files) {
                        RBChatChattingContentPaneUI.doSendVideoMessage4IM(file.fileName, file.fileMd5, file.fileLength, sendUser);
                    }
                    // 发送文字
                    if (text && text.length > 0) {
                        var fingerPrint = MBProtocalFactory.genFingerPrint();
                        RBChatChattingContentPaneUI.doSendMessageImpl(text, MsgType.TYPE_TEXT, null, fingerPrint, sendUser);
                    }
                    that.closeDialog(dialogId);
                }

            }
        }

        // 先把对话框显示出来
        this.showDialog('发送图片/视频'//" "
            , "取消"
            , '发送'
            , bodyHTML
            , dialogId
            , null
            , onSure
            , true
            , "min-width: 380px;min-height:600px"
            , "padding: 0;"
            , false
            , false);
        return dialogId;
    };


    UIModule7.prototype.showImageSendDialog = function (dialogId, type, obj, fn_submitCallback) {

        var that = this;

        var imgHtml = '';

        var base64Str = '';

        // 消息图片
        if (type == 0) {
            imgHtml = "<img src ='" + RBChatUtils.getImageDownloadURL(obj.text, false) + "?imageView2/2/w/150" + "' style='width:150px;cursor: pointer;' onclick=\"javascript:window.open('" + RBChatUtils.getImageDownloadURL(obj.text, false) + "','_blank')\"/>";
        } else if (type == 1) {
            var blob = obj.getAsFile(), reader = new FileReader();
            //定义fileReader读取完数据后的回调  
            reader.onload = function (event) {
                base64Str = event.target.result
                var sHtml = "<img src='" + base64Str + "' style='width:150px;cursor: pointer;'/>";//result应该是base64编码后的图片  
                $('#pre-image-body').append(sHtml)
            }
            reader.readAsDataURL(blob);//用fileReader读取二进制图片，完成后会调用上面定义的回调函数  
        }

        window.showCopyPic = true;
        // 要显示于对话框中的html内容
        var bodyHTML =
            "<div class=\'weui-msg\'>" +
            "	<div class=\'weui-msg__text-area\' id='pre-image-body'>" +
            imgHtml +
            "	</div>" +
            "</div>";

        var onSure = function () {
            window.showCopyPic = false;
            that.closeDialog(dialogId);
            if (fn_submitCallback) {
                fn_submitCallback(base64Str)
            }
        }

        // 先把对话框显示出来
        this.showDialog('预览图片'//" "
            , "取消"
            , '发送'
            , bodyHTML
            , dialogId
            , null
            , onSure
            , true
            , "min-width: 500px;max-width: 550px;"
            , "padding: 0;"
            , false
            , false);
        return dialogId;
    };

    /**
     * 显示一个普通的信息提示弹出框。
     *
     * @param hintContent
     * @returns {*}
     */
    UIModule7.prototype.showAlertDialog = function (title, content, alertType) {
        // 对话框id，为了防止全局取id对象发生冲突，建议必须使用
        var dialogId = this.nextDialogId();

        // 要显示于对话框中的html内容
        var bodyHTML =
            "<div class=\'weui-msg\'>" +
            "	<div class=\'weui-msg__icon-area\'><i class=\'weui-icon-" + alertType + " weui-icon_msg\'></i></div>" +
            "	<div class=\'weui-msg__text-area\'>" +
            //"		<h2 class=\'weui-msg__title\'>"+title+"</h2>"+
            "		<p class=\'weui-msg__desc\'>" + content + "</p>" +
            "	</div>" +
            "</div>";

        // 先把对话框显示出来
        this.showDialog(title//" "
            , "取消"
            , "保存"
            , bodyHTML
            , dialogId
            , null
            , null
            , false
            , "min-width: 100px;max-width: 350px;"
            , "padding: 0;"
            , false
            , false);

        AudioPromptHelper.alertPromt();

        return dialogId;
    };

    UIModule7.prototype.showAlertDialog_SUCCESS = function (title, content) {
        return this.showAlertDialog(title, content, "success");
    };

    UIModule7.prototype.showAlertDialog_INFO = function (title, content) {
        return this.showAlertDialog(title, content, "info");
    };

    UIModule7.prototype.showAlertDialog_WARN = function (title, content) {
        // return this.showAlertDialog(title, content, "warn");
    };

    UIModule7.prototype.showAlertDialog_ERROR = function (title, content) {
        return this.showAlertDialog(title, content, "error");
    };

    /**
     * 显示一个通用的“无数据”提示信息弹出对话框（该对话框可用于在没有数据的情况下，弹出空数据提示，提升用户体验）。
     *
     * @param title
     * @param content 非必须参数：提示内容
     * @returns {*}
     */
    UIModule7.prototype.showNoDataDialog = function (title, content) {
        // 对话框id，为了防止全局取id对象发生冲突，建议必须使用
        var dialogId = this.nextDialogId();

        // 要显示于对话框中的html内容
        var bodyHTML =
            "<div id=\'im-verification-reminders-list-empty\' class=\'kchat-talk-list-empty\' style=\'position: inherit;\'>" +
            "	<i class=\'icon-talk1\' style=\'font-size: 60px;\'></i>" +
            "	<p>" + (content ? content : "暂无数据") + "</p>" +
            "</div>";

        // 先把对话框显示出来
        this.showDialog(title ? title : "提示"
            , "取消"
            , "保存"
            , bodyHTML
            , dialogId
            , null
            , null
            , false
            , "min-width: 260px;"
            , "padding: 0;"
            , false
            , false);

        return dialogId;
    };

    /**
     * 显示一个“载入中”提示弹出对话框。
     *
     * @param title
     * @param content 非必须参数：提示内容
     * @returns {*}
     */
    //UIModule7.prototype.showLoadingDialog = function(title, content){
    //    // 对话框id，为了防止全局取id对象发生冲突，建议必须使用
    //    var dialogId = this.nextDialogId();
    //
    //    // 要显示于对话框中的html内容
    //    var bodyHTML  = content?content:"数据载入中，请稍候 ...";
    //
    //    // 先把对话框显示出来
    //    this.showDialog(title?title:"提示"
    //        , "取消"
    //        , "保存"
    //        , bodyHTML
    //        , dialogId
    //        , null
    //        , null
    //        , false
    //        , "min-width: 250px;"
    //        , "padding: 20px 20px 20px 20px;");
    //
    //    return dialogId;
    //};

    /**
     * 从服务端查询指定用户的个人信息数据，并在对话框里显示出来。
     *
     * @param use_mail "1"表示用好友的mail地址查找，否则表示用好友的uid查找
     * @param user_mail 用户或好友的mail地址（use_mail为true时本参数必须不为空哦）
     * @param user_uid 用户或好友的uid（use_mail为false时本参数必须不为空哦）
     * @param fn_callback_after_sucess 成功加载到用户数据后的将要调用的回调函数，本参数可为空
     *
     * @see showUserInfo()
     */
    UIModule7.prototype.showUserInfoFromServer = function (use_mail, user_mail, user_uid, fn_callback_after_sucess, isGroup = false) {
        var that = this;
        // 查询用户信息
        var searchUserInfo = function () {
            // 调用HTTP REST接口：“【接口1008-3-8】获取用户/好友的个人信息”，接口返回值详细情况，详见接口文档或服务端代码。
            // 开始从服务端查询指定uid的用户基本信息，同时尝试在对话框上显示之
            RBChatRestHelper.submitGetUserInfoToServer(use_mail, user_mail, user_uid
                // 数据读取成功后的回调
                , function (returnValue) {

                    // 关闭加载中提示
                    //that.closeDialog(loadingDialogId);
                    //RBChatToastHelper.closeToast(loadingToastId);

                    // 服务端返回的是java对象RosterElementEntity的JSON文本
                    var ree = JSON.parse(returnValue);

                    if (ree) {

                        if (fn_callback_after_sucess)
                            fn_callback_after_sucess();

                        that.showUserInfo(ree);
                    }
                    else {
                        RBChatUtils.logToConsole('[前端-GET-【接口1008-3-8】用户/好友的个人信息获取接口返回值解析后] 数据为空，' +
                            '无需进入ui处理代码。(returnValue=' + returnValue + ')', true);

                        //alert('没有该用户的信息数据！');
                        that.showAlertDialog_WARN("查无此人", '没有查到该用户的信息数据，请确认您输入的UID或邮箱是否正确后再试！');
                    }
                }
                // 数据读取失败后的回调
                , function (errorThrownStr) {
                    // 关闭加载中提示
                    //that.closeDialog(loadingDialogId);
                    //RBChatToastHelper.closeToast(loadingToastId);

                    //alert('用户的基本信息数据加载出错，原因是：'+errorThrownStr);
                    RBChatDialogHelper.showAlertDialog_WARN('加载失败', '用户的基本信息数据加载出错，可能是网络故障，请稍后再试！');
                }
                , true
                , null
            );
        }
        // 群内打开头像
        if (window.groupInfo && isGroup) {
            var myUserId = LocalUserInfo.getUid()
            RBChatRestHelper.submitGetGroupInfoToServer(window.groupInfo.g_id, myUserId
                // 数据读取成功后的回调
                , function (returnValue) {
                    var groupInfo = JSON.parse(returnValue);
                    // 判断是否是群主或者管理员
                    if (groupInfo.g_owner_user_uid == myUserId || groupInfo.manage_mark - 0 == 1) {
                        searchUserInfo()
                    }
                }
                // 数据读取失败后的回调
                , function (errorThrownStr) {
                }
            );
        } else {
            searchUserInfo()
        }

        // 显示加载中提示
        //var loadingDialogId = this.showLoadingDialog(null, null);
        //var loadingToastId = RBChatToastHelper.showToast_Loading(null);


    };


    UIModule7.prototype.showUserInfoFromServer_for_search = function (use_mail, user_mail, user_uid, fn_callback_after_sucess, isGroup = false) {
        var that = this;
        // 查询用户信息
        var searchUserInfo = function () {
            // 调用HTTP REST接口：“【接口1008-3-8】获取用户/好友的个人信息”，接口返回值详细情况，详见接口文档或服务端代码。
            // 开始从服务端查询指定uid的用户基本信息，同时尝试在对话框上显示之
            RBChatRestHelper.submitGetUserInfoToServer_for_search(use_mail, user_mail, user_uid
                // 数据读取成功后的回调
                , function (returnValue) {
                    if(returnValue == 'null'){

                        alert('没有查到该用户的信息数据，请确认您输入的UID或邮箱是否正确后再试！');
                        return;
                    }
                    // 关闭加载中提示
                    //that.closeDialog(loadingDialogId);
                    //RBChatToastHelper.closeToast(loadingToastId);

                    // 服务端返回的是java对象RosterElementEntity的JSON文本
                    var ree = JSON.parse(returnValue);

                    if (ree) {

                        if (fn_callback_after_sucess)
                            fn_callback_after_sucess();

                        that.showUserInfo(ree);
                    }
                    else {
                        RBChatUtils.logToConsole('[前端-GET-【接口1008-3-8】用户/好友的个人信息获取接口返回值解析后] 数据为空，' +
                            '无需进入ui处理代码。(returnValue=' + returnValue + ')', true);

                        //alert('没有该用户的信息数据！');
                        alert('没有查到该用户的信息数据，请确认您输入的UID或邮箱是否正确后再试！');
                    }
                }
                // 数据读取失败后的回调
                , function (errorThrownStr) {
                    // 关闭加载中提示
                    //that.closeDialog(loadingDialogId);
                    //RBChatToastHelper.closeToast(loadingToastId);

                    //alert('用户的基本信息数据加载出错，原因是：'+errorThrownStr);
                    RBChatDialogHelper.showAlertDialog_WARN('加载失败', '用户的基本信息数据加载出错，可能是网络故障，请稍后再试！');
                }
                , true
                , null
            );
        }
        // 群内打开头像
        if (window.groupInfo && isGroup) {
            var myUserId = LocalUserInfo.getUid()
            RBChatRestHelper.submitGetGroupInfoToServer(window.groupInfo.g_id, myUserId
                // 数据读取成功后的回调
                , function (returnValue) {
                    var groupInfo = JSON.parse(returnValue);
                    // 判断是否是群主或者管理员
                    if (groupInfo.g_owner_user_uid == myUserId || groupInfo.manage_mark - 0 == 1) {
                        searchUserInfo()
                    }
                }
                // 数据读取失败后的回调
                , function (errorThrownStr) {
                }
            );
        } else {
            searchUserInfo()
        }

        // 显示加载中提示
        //var loadingDialogId = this.showLoadingDialog(null, null);
        //var loadingToastId = RBChatToastHelper.showToast_Loading(null);


    };

    /**
     * 显示用户信息内容（UI用弹出Dialog的方式）.
     *
     * @param ree RosterElementEntity对象（对应字段详见：
     * http://docs.52im.net/extend/docs/api/rainbowchatserver4_pro/com/x52im/rainbowchat/http/logic/dto/RosterElementEntity.html）。
     *
     * @see RBChatChattingContentPaneUI.showSingerUserBaseInfo(ree)
     */
    UIModule7.prototype.showUserInfo = function (ree) {

        var that = this;

        // 对话框id，为了防止全局取id对象发生冲突，建议必须使用
        var dialogId = this.nextDialogId();

        // 用户的个人信息主要字段值
        var uid = ree.user_uid;
        var nickname = ree.nickname;
        var nicknameWithRemark = RBChatUtils.getNickNameWithRemark(ree);
        var whatsup = ree.whatsUp;
        var mail = ree.user_mail;
        var register_time = ree.register_time;
        var latest_login_time = ree.latestOfflineTime;
        var latest_login_ip = ree.latest_login_ip;
        var userDesc = ree.userDesc;

        var isMan = ('1' == ree.user_sex);
        var isFriend = RosterProvider.isUserInRoster(uid);
        var hasRemark = !RBChatUtils.isStringEmpty(ree.friendRemark);

        // true表示是本地用户，否则不是
        var isMe = (LocalUserInfo.getObj().user_uid == uid);

        if (latest_login_time) { }
        // latest_login_time = RBChatUtils.utcTimestampToString(latest_login_time);
        else
            latest_login_time = '从未登陆';

        if (ree.online) {
            latest_login_time = '当前在线'
        }

        if (!whatsup)
            whatsup = '此人超懒，什么都没留下...';

        if (!userDesc)
            userDesc = '没有更多说明...';
        const defaultColor = RBChatUtils.getBgColor(uid)
        const show_t = nickname.substr(0, 1).toUpperCase();

        var phoneCss = 'min-width: 420px;'
        if (RBChatUtils.isMobile()) {
            phoneCss = ''
        }
        var bodyHTML = ''
        // 要显示于对话框中的form表单html内容
        if (RBChatUtils.isMobile()) {
            bodyHTML +=
                "<div class=\'chat-user-info scrollbar-auto\' style=\'position: relative;" + phoneCss + "\'>" +
                "	<div class=\'chat-user-info-headinfo\'>" +
                "		<div class=\'avatar-wrapper\' style=\'position: relative;\'>" +
                "                 <div class='avator' style='background:" + defaultColor + "'>" + show_t + " </div>" +
                "			<a id=\'im-panel-main-rightdetail-content-user-avatar_a-root" + dialogId + "\' target='_blank' href=\'" + ree.headUrl + "\'>" +
                "               <img id=\'im-panel-main-rightdetail-content-user-avatar_" + dialogId + "\' src=\'" + ree.headUrl+ '?imageView2/1/w/256/h/256' + "\' onerror='javascript:$(this).remove()'>" +
                "           </a>" +
                (isMe ? "<input type=\'file\' name=\'im-panel-main-rightdetail-content-user-uploadavatar_" + dialogId + "\' id=\'im-panel-main-rightdetail-content-user-uploadavatar_" + dialogId + "\' />" : "") +
                "		</div>" +
                "		<div class=\'info\'>" +
                "			<h4 title=\'" + nicknameWithRemark + "\'>" + nicknameWithRemark + "</h4>" +
                "			<a id=\'im-panel-main-rightdetail-content-user-whatsup_" + dialogId + "\' class=\'whatsup\' title=\'" + whatsup + "\'>" + whatsup + "</a>" +
                "		</div>" +
                "		<img style=\'right: 20px;\' class=\'sex\' title=\'" + (isMan ? '性别：男' : '性别：女') + "\' src=\'" + (isMan ? "images/sns_friend_list_form_item_male_img.png" : "images/sns_friend_list_form_item_female_img.png") + "\'>" +
                (isMe ? '' : isFriend ? '' : '<span class=\"guest_flag\" title=\"陌生人\">陌生人</span>') +
                "		<div class=\'clear\' style=\'clear: both;\'></div>" +
                "	</div>" +
                "	<dl>" +
                "		<dt>基本信息</dt>" +
                (hasRemark ?
                    "      <dd><span class=\'label\'>昵称：</span><span class=\'content\'>" + nickname + "</span></dd>" : "") +
                "		<dd><span class=\'label\'>ID号：</span><span class=\'content\'>" + uid+(ree.lastBit ? ree.lastBit : '') + "</span></dd>" +
                // "		<dd><span class=\'label\'>手机号：</span><span class=\'content\'>" + mail + "</span></dd>" +
                "		<dd><span class=\'label\'>注册时间：</span><span class=\'content\'>" + register_time + "</span></dd>" +
                "		<dd><span class=\'label\'>最近上线：</span><span class=\'content\'>" + latest_login_time + "</span></dd>" +
                // "		<dd><span class=\'label\'>最近 IP：</span><span class=\'content\'>" + latest_login_ip + "</span></dd>" +
                "	</dl>" +
                "	<dl>" +
                "		<dt>其它说明</dt>" +
                "		<dd>" +
                "			<span style=\'max-width: 400px;\' class=\'content\'>" + userDesc + "</span>" +
                "		</dd>" +
                "	</dl>" +
                "</div>";
        } else {
            bodyHTML +=
                "<div class=\'chat-user-info scrollbar-auto\' style=\'position: relative;" + phoneCss + "\'>" +
                "	<div class=\'chat-user-info-headinfo\'>" +
                "		<div class=\'avatar-wrapper\' style=\'position: relative;\'>" +
                "                 <div class='avator' style='background:" + defaultColor + "'>" + show_t + " </div>" +
                "			<a id=\'im-panel-main-rightdetail-content-user-avatar_a-root" + dialogId + "\' target='_blank' href=\'" + ree.headUrl + "\'>" +
                "               <img id=\'im-panel-main-rightdetail-content-user-avatar_" + dialogId + "\' src=\'" +ree.headUrl+ '?imageView2/1/w/256/h/256' + "\' onerror='javascript:$(this).remove()'>" +
                "           </a>" +
                (isMe ? "<input type=\'file\' name=\'im-panel-main-rightdetail-content-user-uploadavatar_" + dialogId + "\' id=\'im-panel-main-rightdetail-content-user-uploadavatar_" + dialogId + "\' />" : "") +
                "		</div>" +
                "		<div class=\'info\'>" +
                "			<h4 title=\'" + nicknameWithRemark + "\'>" + nicknameWithRemark + "</h4>" +
                "			<a id=\'im-panel-main-rightdetail-content-user-whatsup_" + dialogId + "\' class=\'whatsup\' title=\'" + whatsup + "\'>" + whatsup + "</a>" +
                "		</div>" +
                "		<img style=\'right: 20px;\' class=\'sex\' title=\'" + (isMan ? '性别：男' : '性别：女') + "\' src=\'" + (isMan ? "images/sns_friend_list_form_item_male_img.png" : "images/sns_friend_list_form_item_female_img.png") + "\'>" +
                (isMe ? '' : isFriend ? '' : '<span class=\"guest_flag\" title=\"陌生人\">陌生人</span>') +
                "		<div class=\'clear\' style=\'clear: both;\'></div>" +
                "	</div>" +
                "	<dl>" +
                "		<dt>基本信息</dt>" +
                (hasRemark ?
                    "   <dd><span class=\'label\'>昵称：</span><span class=\'content\'>" + nickname + "</span></dd>" : "") +
                "		<dd><span class=\'label\'>ID号：</span><span class=\'content\'>" + uid + "</span></dd>" +
                // "		<dd><span class=\'label\'>手机号：</span><span class=\'content\'>" + mail + "</span></dd>" +
                "		<dd><span class=\'label\'>注册时间：</span><span class=\'content\'>" + register_time + "</span></dd>" +
                "		<dd><span class=\'label\'>最近上线：</span><span class=\'content\'>" + latest_login_time + "</span></dd>" +
                // "		<dd><span class=\'label\'>最近 IP：</span><span class=\'content\'>" + latest_login_ip + "</span></dd>" +
                "	</dl>" +
                (isMe ? "" : "	<dl>" +
                    "	   <dt>营销策略</dt>" +
                    "     <dd><span class=\'label\'><a class='labe-a' href='javascript:void(0)'  onclick='javascript: RBChatDialogHelper.showSendMsgForm(" + uid + ")'>短信发送</a></dd>" +
                    "	</dl>") +
                (isMe ? "" : "	<dl>" +
                    "	   <dt>共同群与好友</dt>" +
                    "     <dd><span class=\'label\'><a class='labe-a' href='javascript:void(0)'  onclick='javascript: RBChatDialogHelper.showCommGroupDialog2(" + uid + ",\"" + nicknameWithRemark + "\")'>共同群</a> <a class='labe-a' href='javascript:void(0)'   onclick='javascript: RBChatDialogHelper.showCommGroupDialog3(" + uid + ",\"" + nicknameWithRemark + "\")'>共同好友</a></dd>" +
                    "	</dl>") +
                (isMe ? "	<dl>" +
                    "		<dt>我的二维码</dt>" +
                    "		<dd>" +
                    "			<span class=\'content downLoadQrBox\'></span><span style='margin-left: 10px' class=\'content downLoadQr\'>" + '下载' + "</span>" +
                    "		</dd>" +
                    "	</dl>" : "") +
                "	<dl>" +
                "		<dt>其它说明</dt>" +
                "		<dd>" +
                "			<span style=\'max-width: 400px;\' class=\'content\'>" + userDesc + "</span>" +
                "		</dd>" +
                "	</dl>" +
                "</div>";
        }

        // isMe=true 用于显示用地用户的个人信息时
        if (isMe) {

            // 点击保存按钮要执行的回调函数
            var fn_submitCallbackDefault = function () {
                that.closeDialog(dialogId);

                // 如果查看的是本地用户的个人信息，此事将显示修改个人信息的对话框
                if (isMe) {
                    that.showLocalUserInfoEdit();
                }
            };

            // 显示对话框
            that.showDialog("我的个人信息"
                , "取消"
                , "修改信息"
                , bodyHTML
                , dialogId
                , null
                , fn_submitCallbackDefault
                , true
                , null
                , null
                , false
                , false);

            // 本地用户时，要初始化头像文件上传组件，方便本地用户修改头像 @since 1.6
            that.initLocalAvatarFileUplodifive5($("#im-panel-main-rightdetail-content-user-uploadavatar_" + dialogId)
                , $("#im-panel-main-rightdetail-content-user-avatar_" + dialogId), dialogId);
        }
        // 否则显示的是别人的信息
        else {
            // 如果已是好友关系
            if (isFriend) {
                // 点击“去私聊”按钮要执行的回调函数
                var fn_submitCallback = function () {
                    var srcUid = uid
                    that.closeDialog(dialogId);
                    var alarmMessageDTO = AlarmsProvider.createChatMessageAlarm(
                        MsgType.TYPE_TEXT, "现在开始发起私聊吧.", nickname, srcUid, 0);
                    RBChatAlarmsUI.insertOrUpdate(alarmMessageDTO, true, true);
                    RBChatAlarmsUI.selectedItem(4, srcUid);
                };
                // 显示对话框
                that.showDialog("好友信息"
                    , null
                    , "去聊天"
                    , bodyHTML
                    , dialogId
                    , null
                    , fn_submitCallback
                    , true
                    , null
                    , null
                    , false
                    , false);
            }
            // 否则对方是陌生人
            else {

                // 点击“试试临时聊天”按钮要执行的回调函数
                var fn_cancelCallback = function () {
                    that.closeDialog(dialogId);

                    //** 以下代码用于实现进入临时聊天逻辑
                    // 构建一个临于聊天的首页“消息”item行需要的数据对象
                    var alarmMessageDTO = AlarmsProvider.createATempChatMsgAlarm(
                        MsgType.TYPE_TEXT, "现在开始临时聊天吧.", nickname, uid, 0);
                    // 将临时聊天titem插入或更新到首页“消息”item
                    RBChatAlarmsUI.insertOrUpdate(alarmMessageDTO, true, true);
                    // 默认选中此item（就可以马上开始聊天了哟）
                    RBChatAlarmsUI.selectedItem(alarmMessageDTO.alarmMessageType, alarmMessageDTO.dataId);
                };

                // 点击“加为好友”按钮要执行的回调函数
                var fn_submitCallback = function () {
                    //that.closeDialog(dialogId);
                    // 显示“发送加好友请求”对话框
                    that.showSendAddFriendReqForm(uid, nickname);
                };

                // 显示对话框
                that.showDialog("用户信息"
                    , ""
                    , "加为好友"
                    , bodyHTML
                    , dialogId
                    , null
                    , fn_submitCallback
                    , true
                    , null
                    , null
                    , false
                    , false);
            }
        }

        // 二维码生成
        var localUserUid = LocalUserInfo.getUid();
        let imgUrl = RBChatUtils.getUserAvatarDownloadURL(localUserUid, false)
        toBase64(imgUrl)
        let items = `<div id="qrcodeCanvas"></div>`
        $('.downLoadQrBox').html(items)
        function toBase64(imgUrl) {
            // 一定要设置为let，不然图片不显示
            const image = new Image();
            // 解决跨域问题
            image.setAttribute('crossOrigin', 'anonymous');
            const imageUrl = imgUrl;
            image.src = imageUrl
            // image.onload为异步加载
            image.onload = () => {
                var canvas = document.createElement('canvas');
                canvas.width = image.width;
                canvas.height = image.height;
                var context = canvas.getContext('2d');
                context.drawImage(image, 0, 0, image.width, image.height);
                var quality = 0.8;
                // 这里的dataurl就是base64类型
                // 使用toDataUrl将图片转换成jpeg的格式,不要把图片压缩成png，因为压缩成png后base64的字符串可能比不转换前的长！
                let dataurl = canvas.toDataURL('image/jpeg', quality);
                $('#qrcodeCanvas').qrcode({
                    render: "canvas",
                    text: `52im_rainbowchat://add_user/${uid}`,
                    width: "200",               //二维码的宽度
                    height: "200",              //二维码的高度
                    background: "#ffffff",       //二维码的后景色
                    foreground: "#000000",        //二维码的前景色
                    src: dataurl,          //二维码中间的图片
                });
            }
        }

        $('.downLoadQr').click(function () {
            html2Image()
        });
        function html2Image() {
            setTimeout(() => {
                html2canvas(document.getElementById('qrcodeCanvas'), {
                    width: document.getElementById('qrcodeCanvas').clientWidth,
                    backgroundColor: null,
                    useCORS: true, // 如果截图的内容里有图片,可能会有跨域的情况,加上这个参数,解决文件跨域问题
                    scale: 1,
                    allowTaint: true,
                    height: document.getElementById('qrcodeCanvas').scrollHeight,
                    windowHeight: document.getElementById('qrcodeCanvas').scrollHeight
                }).then((canvas) => {
                    let base64Image = canvas.toDataURL('image/png');
                    const a = document.createElement('a')
                    a.href = base64Image
                    a.download = '我的二维码'
                    a.click()
                })
            }, 500)
        }

        // 在对话框架中单独显示完整的个性签名内容
        $("#im-panel-main-rightdetail-content-user-whatsup_" + dialogId).click(function () {
            RBChatDialogHelper.showAlertDialog_INFO("个性签名", whatsup);
        });
    };

    /**
     * 显示我的小程序
     * @param {*} ree 
     */
    UIModule7.prototype.showMinAppInfo = function (ree) {

        var that = this;
        var dialogId = this.nextDialogId();

        var contentHTML = '暂无收藏小程序';
        if (ree && ree.length > 0) {
            window.minappJump = function (url, appId) {
                if (confirm("您所选小程序即将在浏览器新窗口打开")) {
                    window.open(url, '_blank')
                }
            }

            contentHTML = "<div class='my-min-app'>";
            ree.forEach(item => {
                contentHTML = contentHTML + "<div class='my-min-app-item' onclick=\"javascript:minappJump('" + item.appletUrl + "','" + item.appletId + "')\"> <img src='" + item.appletImage + "'/> <span>" + item.appletName + "</span></div>"
            })
            contentHTML = contentHTML + '</div>'
        }

        // 要显示于对话框中的form表单html内容
        var bodyHTML =
            "<div class=\'chat-user-info scrollbar-auto\' style=\'position: relative;\'>" +
            contentHTML +
            "</div>";


        // 显示对话框
        that.showDialog("我的小程序"
            , null
            , null
            , bodyHTML
            , dialogId
            , null
            , null
            , false
            , null
            , null
            , false
            , false);
    };

    /**
     * 显示本地用户的个人信息。
     */
    UIModule7.prototype.showLocalUserInfo = function () {
        // 读取本地用户信息
        var localUserInfo = LocalUserInfo.getObj();
        // 显示之
        if (localUserInfo) {
            RBChatDialogHelper.showUserInfo(localUserInfo);
        }
    };

    /**
     * 显示我的小程序
     */
    UIModule7.prototype.showMyMinAppInfo = function () {
        // 获取我的小程序
        //收藏小程序
        var localUserUid = LocalUserInfo.getUid();

        RBChatRestHelper.MyMinAppListFromServer(localUserUid, function (res) {
            RBChatDialogHelper.showMinAppInfo(JSON.parse(res));
        }, function (error) {

        })

    };

    /**
     * 显示本地用户的个性签名编辑对话框。
     *
     * @returns {UIModule7}
     */
    UIModule7.prototype.showLocalUserWhatsupEdit = function () {
        var that = this;
        // 读取个人信息
        var localUserInfoRee = LocalUserInfo.getObj();

        if (localUserInfoRee) {
            // 对话框id，为了防止全局取id对象发生冲突，建议必须使用
            var dialogId = this.nextDialogId();

            // 个人信息主要可以修改字段
            var uid = localUserInfoRee.user_uid;
            var whatsup = localUserInfoRee.whatsUp;         // 修改前的个性签名

            // 要显示于对话框中的form表单html内容
            var bodyHTML =
                "<form>" +
                "	<ul>" +
                "		<li>" +
                "		<div>" +
                "			<textarea id=\'dialog-editwhatsup-form-whatsup-" + dialogId + "\' maxlength=\'60\' class=\'ember-text-area\' style=\'margin: 0px; height: 75px; width: 300px;\' placeholder=\'说点什么 ...\' title=\'个性签名最多可输入60个字符。\'>" + (whatsup ? whatsup : "") + "</textarea>" +
                "			<p class=\'hint\'><i class=\'icon-info\' ></i>最多可输入60个字符</p>" +
                "		</div>" +
                "		</li>" +
                "	</ul>" +
                "</form>";

            // 点击保存按钮要执行的回调函数
            var fn_submitCallback = function () {

                // 新的个性签名
                var newWhatsup = $.trim($("#dialog-editwhatsup-form-whatsup-" + dialogId).val());

                // 如果内容没有改变，就不需要提交服务器了
                if (whatsup == newWhatsup) {
                    // 先关闭当前修改对话框
                    that.closeDialog(dialogId);
                    return;
                }

                // 调用HTTP REST接口：“【接口1008-1-22】修改用户What'sUp（个性签名）”，具体参数和返回值，详见接口文档或服务端代码。
                RBChatRestHelper.submitUserWhatsUpModifiyToServer(uid, newWhatsup
                    // 成功后的回调
                    , function (returnValue) {

                        if (returnValue) {

                            // 返回值为1 表示更新成功，否则失败（详见http rest 手册中的“【接口1008-1-22】”的返回值说明）
                            if ('1' == returnValue) {

                                // 先关闭当前修改对话框
                                that.closeDialog(dialogId);

                                //alert('个人信息修改成功！');
                                RBChatToastHelper.showToast_OK('修改成功', null);

                                // 修改成功后，将数据更新到缓存中
                                localUserInfoRee.whatsUp = newWhatsup;
                                // 刷新本地缓存
                                LocalUserInfo.update(localUserInfoRee);

                                // 刷新界面显示
                                RBChatLocalUserUI.refresh();

                                return;
                            }
                            else {
                                //alert('个人信息修改失败，请稍后再试！');
                                RBChatDialogHelper.showAlertDialog_ERROR('修改失败', '个性签名修改失败，请稍后再试！');
                            }
                        }
                    }
                    // 失败后的回调
                    , function (errorThrownStr) {
                        //alert('个人信息修改失败了，原因是：'+errorThrownStr);
                        RBChatDialogHelper.showAlertDialog_ERROR('修改失败', '个性签名修改失败，可能是网络故障，请稍后再试！');
                    }
                );
            };

            // 显示对话框
            that.showDialog("编辑个性签名"
                , "取消"
                , "保存"
                , bodyHTML
                , dialogId
                , null
                , fn_submitCallback
                , true
                , "min-width: 0px;"
                , null
                , false
                , false);
        }
    };

    /**
     * 显示本地用户登陆码的修改对话框。
     */
    UIModule7.prototype.showPasswordEdit = function () {

        var that = this;
        // 读取个人信息
        var localUserInfoRee = LocalUserInfo.getObj();

        if (localUserInfoRee) {

            var uid = localUserInfoRee.user_uid;
            // 对话框id，为了防止全局取id对象发生冲突，建议必须使用
            var dialogId = this.nextDialogId();

            // 要显示于对话框中的form表单html内容
            var bodyHTML =
                "<form>" +
                "	<ul>" +
                "		<li>" +
                "			<div class=\'left\'><label>原密码：</label></div>" +
                "			<div class=\'right\'>" +
                "				<input id=\'dialog-modifypsw-form-oldpsw-" + dialogId + "\' maxlength=\'16\' class=\'text ember-text-field\' type=\'password\' placeholder=\'请输入原密码\'>" +
                "			</div>" +
                "		</li>" +
                "		<li>" +
                "			<div class=\'left\'><label>新密码：</label></div>" +
                "			<div class=\'right\'>" +
                "				<input id=\'dialog-modifypsw-form-newpsw-" + dialogId + "\' maxlength=\'16\' class=\'text ember-text-field\' type=\'password\' placeholder=\'请输入新密码\'>" +
                "			</div>" +
                "		</li>" +
                "		<li>" +
                "			<div class=\'left\' style=\'width: 76px;\'><label>确认新密码：</label></div>" +
                "			<div class=\'right\'>" +
                "				<input id=\'dialog-modifypsw-form-newpsw2-" + dialogId + "\' maxlength=\'16\' class=\'text ember-text-field\' type=\'password\' placeholder=\'请再次输入新密码\'>" +
                "				<p class=\'hint\'><i class=\'icon-lock\' style=\'font-size: 14px;\' ></i>新密码至少6个字符，可使用特殊符号.</p>" +
                "			</div>" +
                "		</li>" +
                "	</ul>" +
                "</form>";

            // 点击保存按钮要执行的回调函数
            var fn_submitCallback = function () {

                var oldPassword = $.trim($('#dialog-modifypsw-form-oldpsw-' + dialogId).val());
                var newPassword = $.trim($('#dialog-modifypsw-form-newpsw-' + dialogId).val());
                var confirmNewPassword = $.trim($('#dialog-modifypsw-form-newpsw2-' + dialogId).val());

                // 当前密码是否为空
                if (RBChatUtils.isStringEmpty(oldPassword)) {
                    RBChatDialogHelper.showAlertDialog_INFO("友情提示", "旧密码不可为空！");
                    return;
                }

                // 新密码是否为空
                if (RBChatUtils.isStringEmpty(newPassword)) {
                    RBChatDialogHelper.showAlertDialog_INFO("友情提示", "新密码不可为空！");
                    return;
                }

                // 确认密码是否为空
                if (RBChatUtils.isStringEmpty(confirmNewPassword)) {
                    RBChatDialogHelper.showAlertDialog_INFO("友情提示", "确认密码不可为空！");
                    return;
                }

                // 两次输入新密码是否一致
                if (!(newPassword == confirmNewPassword)) {
                    RBChatDialogHelper.showAlertDialog_INFO("友情提示", "确认密码与新密码不相符，请再次输入！");
                    return;
                }

                // 新密码长度是否大于6
                if (newPassword.length < 6) {
                    RBChatDialogHelper.showAlertDialog_INFO("友情提示", "密码不能少于6个字符！");
                    return;
                }

                // 旧登录密码与新密码是相同的（未修改！）
                if (oldPassword == newPassword) {
                    RBChatDialogHelper.showAlertDialog_INFO("友情提示", "新密码和旧密码相同，请输入不同的密码！");
                    return;
                }

                // 调用HTTP REST接口：“【接口1008-1-9】修改登陆密码接口”，具体参数和返回值，详见接口文档或服务端代码。
                RBChatRestHelper.submitUserPasswordModifiyToServer(oldPassword, newPassword, uid
                    // 成功后的回调
                    , function (returnValue) {
                        if (returnValue) {
                            // // 返回值：1 表示更新成功，0 表示失败，2 表示原密码不正确（详见http rest 手册中的“【接口1008-1-9】”的返回值说明）
                            if ('1' == returnValue) {
                                // 先关闭当前修改对话框
                                that.closeDialog(dialogId);

                                RBChatToastHelper.showToast_OK('修改成功', null);
                                return;
                            }
                            else if ('2' == returnValue) {
                                RBChatDialogHelper.showAlertDialog_WARN('修改失败', '原密码输入有误，请确认！');
                            }
                            else {
                                RBChatDialogHelper.showAlertDialog_WARN('修改失败', '密码修改失败，请稍后再试！');
                            }
                        }
                    }
                    // 失败后的回调
                    , function (errorThrownStr) {
                        RBChatDialogHelper.showAlertDialog_ERROR('修改失败', '登陆密码修改失败，可能是网络故障，请稍后再试！');
                    }
                );
            };

            // 显示对话框
            that.showDialog("修改登陆密码"
                , "取消"
                , "保存"
                , bodyHTML
                , dialogId
                , null
                , fn_submitCallback
                , true
                , null
                , null
                , false
                , false);
        }
    };

    /**
     * 显示好友备注的编辑对话框。
     *
     * @param friendInfo {RosterElementEntity} 好友信息对象引用
     */
    UIModule7.prototype.showFriendRemarkEdit = function (friendInfo) {

        var that = this;

        // // 读取个人信息
        var localUserInfoRee = LocalUserInfo.getObj();

        if (!localUserInfoRee || !friendInfo) {
            RBChatDialogHelper.showAlertDialog_WARN("友情提示"
                , "无效的数据，localUserInfoRee=" + localUserInfoRee + ", friendInfo=" + friendInfo + "！");
            return;
        }

        // 对话框id，为了防止全局取id对象发生冲突，建议必须使用
        var dialogId = this.nextDialogId();

        // 初始数据
        var friendUid = friendInfo.user_uid;
        var localUid = localUserInfoRee.user_uid;
        var oldRemark = friendInfo.friendRemark;
        var oldMobileNum = friendInfo.friendMobileNum;
        var oldMoreDesc = friendInfo.friendMoreDesc;

        // 要显示于对话框中的form表单html内容
        var bodyHTML =
            "<form>" +
            "	<ul>" +
            "		<li>" +
            "			<div class=\'left\'><label>好友备注：</label></div>" +
            "			<div class=\'right\'>" +
            "				<input id=\'dialog-modifyfriendremark-form-remark-" + dialogId + "\' maxlength=\'16\' class=\'text ember-text-field\' type=\'text\' value=\'" + oldRemark + "\' placeholder=\'备注最多允许16个汉字\'>" +
            "			</div>" +
            "		</li>" +
            "		<li>" +
            "			<div class=\'left\'><label>更多描述：</label></div>" +
            "			<div class=\'right\'>" +
            "				<textarea id=\'dialog-modifyfriendremark-form-moredesc-" + dialogId + "\' maxlength=\'200\' class=\'ember-text-area\' style=\'margin: 0px; height: 80px; width: 282px;\' placeholder=\'输入更多描述 ...\' title=\'* 最多可输入200个字符\'>" + oldMoreDesc + "</textarea>" +
            "				<p class=\'hint\'><i class=\'icon-info\' ></i>最多可输入250个字符</p>" +
            "			</div>" +
            "		</li>" +
            "	</ul>" +
            "</form>";

        // 点击保存按钮要执行的回调函数
        var fn_submitCallback = function () {

            // 取出界面上form表单字段内容
            var remark = $.trim($("#dialog-modifyfriendremark-form-remark-" + dialogId).val());
            var moreDesc = $.trim($("#dialog-modifyfriendremark-form-moredesc-" + dialogId).val());

            // 调用HTTP REST接口：“【接口1008-2-8】更新好友信息中的备注、描述等”，具体参数和返回值，详见接口文档或服务端代码。
            RBChatRestHelper.submitRosterRemarkModifiyToServer(remark, "", moreDesc, localUid, friendUid
                // 成功后的回调
                , function (returnValue) {

                    if (returnValue) {

                        // 返回值为1 表示更新成功，否则失败（详见http rest 手册中的“【接口1008-2-8】”的返回值说明）
                        if ('1' == returnValue) {

                            // 先关闭当前修改对话框
                            that.closeDialog(dialogId);

                            RBChatToastHelper.showToast_OK('更新成功', null);

                            // 将数据更新到缓存中（不能直接更新传过来的friendInfo，因为它可能不是好友列表本地缓存中的全局对象，只是个对象克隆）
                            var cacheUpdateSucess = RosterProvider.updateFriendRemark(friendUid, remark, "", moreDesc);

                            // 更新右侧好友信息查看界面中的显示
                            friendInfo.friendRemark = remark;
                            friendInfo.friendMobileNum = "";
                            friendInfo.friendMoreDesc = moreDesc;
                            RBChatRightDetailUI.refreshFriendRemark(true, friendInfo);

                            // 更新首页消息列表中的显示
                            RBChatAlarmsUI.updateItemTitle(AlarmMessageType.reviceMessage, friendUid, RBChatUtils.getNickNameWithRemark(friendInfo));

                            // 更新好友列表中的显示
                            RBChatRosterUI.updateFriendNicknameWithRemark(friendUid, RBChatUtils.getNickNameWithRemark(friendInfo));

                            return;
                        } else {
                            RBChatDialogHelper.showAlertDialog_ERROR('更新失败', '好友备注更新失败，请稍后再试！');
                        }
                    }
                }
                // 失败后的回调
                , function (errorThrownStr) {
                    RBChatDialogHelper.showAlertDialog_ERROR('更新失败', '好友备注更新失败，可能是网络故障，请稍后再试！');
                }
            );
        };

        // 显示对话框
        that.showDialog("设置备注"
            , "取消"
            , "保存"
            , bodyHTML
            , dialogId
            , null
            , fn_submitCallback
            , true
            , null
            , null
            , false
            , false);
    };



    /**
     * 显示好友备注的编辑对话框。
     *
     * @param friendInfo {RosterElementEntity} 好友信息对象引用
     */
    UIModule7.prototype.showFriendRemarkEdit2 = function (friendInfo) {

        var that = this;

        // // 读取个人信息
        var localUserInfoRee = LocalUserInfo.getObj();

        if (!localUserInfoRee || !friendInfo) {
            RBChatDialogHelper.showAlertDialog_WARN("友情提示"
                , "无效的数据，localUserInfoRee=" + localUserInfoRee + ", friendInfo=" + friendInfo + "！");
            return;
        }

        // 对话框id，为了防止全局取id对象发生冲突，建议必须使用
        var dialogId = this.nextDialogId();

        // 初始数据
        var friendUid = friendInfo.user_uid;
        var localUid = localUserInfoRee.user_uid;
        var oldRemark = friendInfo.memberRemark ?friendInfo.memberRemark:'';
        var oldMobileNum = friendInfo.friendMobileNum;
        var oldMoreDesc = friendInfo.friendMoreDesc;

        // 要显示于对话框中的form表单html内容
        var bodyHTML =
            "<form>" +
            "	<ul>" +
            "		<li>" +
            "			<div class=\'left\'><label>会员备注：</label></div>" +
            "			<div class=\'right\'>" +
            "				<input id=\'dialog-modifyfriendremark-form-remark-" + dialogId + "\' maxlength=\'16\' class=\'text ember-text-field\' type=\'text\' value=\'" + oldRemark + "\' placeholder=\'备注最多允许16个汉字\'>" +
            "			</div>" +
            "		</li>" +
            "	</ul>" +
            "</form>";

        // 点击保存按钮要执行的回调函数
        var fn_submitCallback = function () {
            // 取出界面上form表单字段内容
            var remark = $.trim($("#dialog-modifyfriendremark-form-remark-" + dialogId).val());
            //会员备注接口
            RBChatRestHelper.submitMerberRemarkModifiyToServer(remark, friendUid
                // 成功后的回调
                , function (returnValue) {
                     if (returnValue) {
                        $('#im-panel-main-rightdetail-content-lb-remark4friend-2').text(remark)
                        // 先关闭当前修改对话框
                        that.closeDialog(dialogId);
                        RBChatToastHelper.showToast_OK('更新成功', null);

                        return;
                    } else {
                        RBChatDialogHelper.showAlertDialog_ERROR('更新失败', '会员备注更新失败，请稍后再试！');
                    }
                }
                // 失败后的回调
                , function (errorThrownStr) {
                    RBChatDialogHelper.showAlertDialog_ERROR('更新失败', '会员备注更新失败，可能是网络故障，请稍后再试！');
                }
            );
        };

        // 显示对话框
        that.showDialog("会员备注"
            , "取消"
            , "保存"
            , bodyHTML
            , dialogId
            , null
            , fn_submitCallback
            , true
            , null
            , null
            , false
            , false);
    };

    /**
     * 更新UED账号
     */
    UIModule7.prototype.showUEDAcountEdit = function (friendInfo) {

        var that = this;
        // 对话框id，为了防止全局取id对象发生冲突，建议必须使用
        var dialogId = this.nextDialogId();
        const account = friendInfo.uedUsername || ''
        // 要显示于对话框中的form表单html内容
        var bodyHTML =
            "<form>" +
            "	<ul>" +
            "		<li>" +
            "			<div class=\'left\'><label>UED账号：</label></div>" +
            "			<div class=\'right\'>" +
            "				<input id=\'dialog-modifyued-form-account-" + dialogId + "\' maxlength=\'16\' class=\'text ember-text-field\' type=\'text\' value=\'" + account + "\' placeholder=\'请输入UED账号\'>" +
            "			</div>" +
            "		</li>" +
            "	</ul>" +
            "</form>";

        // 点击保存按钮要执行的回调函数
        var fn_submitCallback = function () {

            // 取出界面上form表单字段内容
            var newUedAccount = $.trim($("#dialog-modifyued-form-account-" + dialogId).val());
            if (!newUedAccount || newUedAccount.length == 0) {
                alert('账号不能为空！');
                return;
            }

            // 调用HTTP REST接口：“【接口1008-2-8】更新好友信息中的备注、描述等”，具体参数和返回值，详见接口文档或服务端代码。
            RBChatRestHelper.ModifiyTUEDAccountoServer(friendInfo.user_uid, newUedAccount
                // 成功后的回调
                , function (returnValue) {
                    if (returnValue) {
                        // 先关闭当前修改对话框
                        that.closeDialog(dialogId);
                        RBChatToastHelper.showToast_OK('更新成功', null);
                        $('#im-panel-main-rightdetail-content-eidtUED-content').text(newUedAccount)

                    } else {
                        RBChatDialogHelper.showAlertDialog_ERROR('提示', '更新失败，请稍后再试！');
                    }
                }
                // 失败后的回调
                , function (errorThrownStr) {
                    RBChatDialogHelper.showAlertDialog_ERROR('提示', '更新失败，可能是网络故障，请稍后再试！');
                }
            );
        };

        // 显示对话框
        that.showDialog("设置UED账号"
            , "取消"
            , "保存"
            , bodyHTML
            , dialogId
            , null
            , fn_submitCallback
            , true
            , null
            , null
            , false
            , false);
    };

    /**
     * 显示本地用户个人信息的编辑对话框。
     */
    UIModule7.prototype.showLocalUserInfoEdit = function () {

        var that = this;

        // 读取个人信息
        var localUserInfoRee = LocalUserInfo.getObj();

        if (localUserInfoRee) {

            // 对话框id，为了防止全局取id对象发生冲突，建议必须使用
            var dialogId = this.nextDialogId();

            // 个人信息主要可以修改字段
            var uid = localUserInfoRee.user_uid;
            var nickname = localUserInfoRee.nickname;
            var whatsup = localUserInfoRee.whatsUp;         // 个性签名
            var userDesc = localUserInfoRee.userDesc;       // 其它说明
            var isMan = ('1' == localUserInfoRee.user_sex); // 性别：true表示男、否则表示女

            // 要显示于对话框中的form表单html内容
            var bodyHTML =
                "<form>" +
                "	<ul>" +
                "		<li>" +
                "			<div class=\'left\'><label>昵称：</label></div>" +
                "			<div class=\'right\'>" +
                "				<input id=\'dialog-modifyuserinfo-form-nickname-" + dialogId + "\' maxlength=\'20\' class=\'text ember-text-field\' type=\'text\' value=\'" + nickname + "\' placeholder=\'昵称最多允许20个字符\'>" +
                "			</div>" +
                "		</li>" +
                "		<li>" +
                "			<div class=\'left\'><label>性别：</label></div>" +
                "			<div class=\'right\'>" +
                "				<label style=\' margin: 0 10px 0 0px;\'>" +
                "					<input name=\'dialog-modifyuserinfo-form-sex-" + dialogId + "\' class=\'radio-or-checkbox\' type=\'radio\' " + (isMan ? "checked=\'checked\'" : "") + " value=\'1\'>男</label>" +
                "				<label>" +
                "					<input name=\'dialog-modifyuserinfo-form-sex-" + dialogId + "\' class=\'radio-or-checkbox\' type=\'radio\' " + (isMan ? "" : "checked=\'checked\'") + " value=\'0\'>女</label>" +
                "			</div>" +
                "		</li>" +
                "		<li>" +
                "			<div class=\'left\'><label>个人签名：</label></div>" +
                "			<div class=\'right\'>" +
                "				<textarea id=\'dialog-modifyuserinfo-form-whatsup-" + dialogId + "\' maxlength=\'60\' class=\'ember-text-area\' style=\'margin: 0px; height: 55px; width: 282px;\' placeholder=\'说点什么 ...\' title=\'* 最多可输入60个字符\'>" + whatsup + "</textarea>" +
                "				<p class=\'hint\'><i class=\'icon-info\' ></i>最多可输入60个字符</p>" +
                "			</div>" +
                "		</li>" +
                "		<li>" +
                "			<div class=\'left\'><label>其它说明：</label></div>" +
                "			<div class=\'right\'>" +
                "				<textarea id=\'dialog-modifyuserinfo-form-othercaption-" + dialogId + "\' maxlength=\'250\' class=\'ember-text-area\' style=\'margin: 0px; height: 80px; width: 282px;\' placeholder=\'输入其它说明 ...\' title=\'* 最多可输入250个字符\'>" + userDesc + "</textarea>" +
                "				<p class=\'hint\'><i class=\'icon-info\' ></i>最多可输入250个字符</p>" +
                "			</div>" +
                "		</li>" +
                "	</ul>" +
                "</form>";

            // 点击保存按钮要执行的回调函数
            var fn_submitCallback = function () {

                // 取出界面上form表单字段内容
                var newNickname = $.trim($("#dialog-modifyuserinfo-form-nickname-" + dialogId).val());
                var newSex = $("input:radio[name=dialog-modifyuserinfo-form-sex-" + dialogId + "]:checked").val();
                var newWhatsup = $.trim($("#dialog-modifyuserinfo-form-whatsup-" + dialogId).val());
                var newOthercaption = $.trim($("#dialog-modifyuserinfo-form-othercaption-" + dialogId).val());

                console.info('【本次将修改为的新的个人信息】 newNickname=' + newNickname
                    + ',newSex=' + newSex + ',newWhatsup=' + newWhatsup + ',newOthercaption=' + newOthercaption);

                if (newNickname.length === 0) {
                    alert('昵称不能为空哦！');
                    return;
                }

                // 调用HTTP REST接口：“【接口1008-1-25】更新昵称、性别、个性签名、个人其它说明”，具体参数和返回值，详见接口文档或服务端代码。
                RBChatRestHelper.submitUserInfoModifiyToServer(newNickname, newSex, newWhatsup, newOthercaption, uid
                    // 成功后的回调
                    , function (returnValue) {

                        if (returnValue) {

                            // 返回值为1 表示更新成功，否则失败（详见http rest 手册中的“【接口1008-1-25】”的返回值说明）
                            if ('1' == returnValue) {

                                // 先关闭当前修改对话框
                                that.closeDialog(dialogId);

                                //alert('个人信息修改成功！');
                                RBChatToastHelper.showToast_OK('修改成功', null);

                                // 修改成功后，将数据更新到缓存中
                                localUserInfoRee.nickname = newNickname;
                                localUserInfoRee.whatsUp = newWhatsup;
                                localUserInfoRee.userDesc = newOthercaption;
                                localUserInfoRee.user_sex = newSex;
                                // 刷新本地缓存
                                LocalUserInfo.update(localUserInfoRee);

                                // 刷新界面显示
                                RBChatLocalUserUI.refresh();

                                return;
                            }
                            else {
                                //alert('个人信息修改失败，请稍后再试！');
                                RBChatDialogHelper.showAlertDialog_ERROR('修改失败', '个人信息修改失败，请稍后再试！');
                            }
                        }
                    }
                    // 失败后的回调
                    , function (errorThrownStr) {
                        //alert('个人信息修改失败了，原因是：'+errorThrownStr);
                        RBChatDialogHelper.showAlertDialog_ERROR('修改失败', '个人信息修改失败，可能是网络故障，请稍后再试！');
                    }
                );
            };

            // 显示对话框
            that.showDialog("修改个人信息"
                , "取消"
                , "保存"
                , bodyHTML
                , dialogId
                , null
                , fn_submitCallback
                , true
                , null
                , null
                , false
                , false);
        }
    };

    /**
     * 显示未处理的好友请求对话框（及相关功能逻辑都要此函数中实现）。
     */
    UIModule7.prototype.showOfflineAddFriendsReq = function () {

        var that = this;
        var clickChat = function (id, reqUserNickname) {
            $('#getChat' + id).click(function () {
                var srcUid = $(this).attr('srcuid');
                that.closeDialog(dialogId);
                var alarmMessageDTO = AlarmsProvider.createChatMessageAlarm(
                    MsgType.TYPE_TEXT, "现在开始发起私聊吧.", reqUserNickname, srcUid, 0);
                RBChatAlarmsUI.insertOrUpdate(alarmMessageDTO, true, true);
                RBChatAlarmsUI.selectedItem(4, srcUid);
            })
        }

        // 读取本地用户的个人信息
        var localUserInfoRee = LocalUserInfo.getObj();
        if (localUserInfoRee) {

            // 本地用户的uid
            var uid = localUserInfoRee.user_uid;

            // 调用HTTP REST接口：“【接口1008-4-7】获取离线加好友请求”，具体参数和返回值，详见接口文档或服务端代码。
            RBChatRestHelper.submitGetOfflineAddFriendsReqToServer2(uid
                // 成功后的回调
                , function (returnValue) {

                    if (returnValue) {
                        // 服务端返回的是一维RosterElementEntity对象数组
                        var reqsList = JSON.parse(returnValue);

                        // 如果返回数据不为空
                        if (reqsList && reqsList.length > 0) {
                            RBChatUtils.logToConsole('【showOfflineAddFriendsReq】服务端返回的加好友请求数据行数：' + reqsList.length);

                            // 构建所有item的html
                            var itemsHTML = '';
                            // 是否有item行
                            var isHasItems = (reqsList.length > 0);

                            // 用数据构建好友请求处理列表的html
                            for (var i = 0; i < reqsList.length; i++) {

                                // 每一个好友请求元数据，都是一个完整的RosterElementEntity对象（详见【接口1008-4-7】接口文档或服务端代码）
                                var reqData = reqsList[i];

                                // 好友请求者的uid
                                var reqUserUid = reqData[0];
                                // 好友请求者的昵称
                                var reqUserNickname = reqData[1];
                                // 附加消息
                                var ex1 = reqData[2];
                                // 请求时间
                                var reqTime = reqData[3]; // ex10字段内容的约定详见接口文档或服务端代码
                                var result = reqData[4]; //结果

                                RBChatUtils.logToConsole('》》》》》该行加好友请求元数据为：' + reqData + ", " + JSON.stringify(reqData));


                                const show_t = reqUserNickname.length > 0 ? reqUserNickname.substr(0, 1).toUpperCase() : '';

                                window.reqFriendNotFound = function (obj, id) {
                                    const defaultColor = RBChatUtils.getBgColor(id)
                                    obj.parent().children().eq(0).css('background', defaultColor)
                                    obj.remove()
                                }

                                // 将每一个item的html拼接起来
                                const item_dom =
                                    "<li id=\'im-verification-reminders_li_" + reqUserUid + "\' nickName=\'" + reqUserNickname + "\'  srcuid=\'" + reqUserUid + "\' dataindex=\'" + i + "\' title='UID: " + reqUserUid + "' flag='" + result + "'>" +
                                    "	<div>" +
                                    "		<a class=\'top-tag\' title=\'Current Tag\'></a>" +
                                    "		<div class=\'avatar-source human\'>" +
                                    "        <div>" + show_t + " </div>" +
                                    //"		<img src=\'../images/main_alarms_chat_message_icon.png\'>"+
                                    "		<img onerror='javascript:reqFriendNotFound($(this)," + reqUserUid + ")'  src=\'" + RBChatUtils.getUserAvatarDownloadURL(reqUserUid, true) + "\'>" +
                                    "		</div>" +
                                    "		<div class=\'info\'>" +
                                    "		<h4>" +
                                    "			<span class=\'msg_title\'>" + reqUserNickname + "</span>" +
                                    "			<span id=\'im-verification-reminders_li_msgtime_" + reqUserUid + "\' class=\'msg_time\'>" + reqTime + "</span>" +
                                    "		</h4>" +
                                    "		<p>" +
                                    "			<span id=\'im-verification-reminders_li_msgcontent_" + reqUserUid + "\' title=\'" + reqUserNickname + " 邀请您成为好友\' > 附加:" + ex1 + "</span>" +
                                    (result - 0 == 0 ? "			<a id=\'im-verification-reminders_li_rejectbtn_" + reqUserUid + "\' srcuid=\'" + reqUserUid + "\' actiontype=\'1\' class=\'btn btn-light reject\'>拒绝</a>" : "") +
                                    (result - 0 == 0 ? "			<a id=\'im-verification-reminders_li_agreebtn_" + reqUserUid + "\' srcuid=\'" + reqUserUid + "\' actiontype=\'0\' class=\'btn btn-light agree\'>同意</a>" : "") +
                                    (result - 0 == 1 ? "<a style='color:green;float:right;'>已同意</a><a id=\'getChat" + reqUserUid + "\' srcuid=\'" + reqUserUid + "\' style='color:#5393ed;float:right;margin: 0 5px'>去聊天</a>" : "") +
                                    (result - 0 == 2 ? "<a style='color:red;float:right;'>已拒绝</a>" : "") +
                                    "		</p>" +
                                    "		</div>" +
                                    "	</div>" +
                                    "</li>";

                                itemsHTML += item_dom
                            }

                            // 将拼接好的html整好到即将到放dialog中的body的html中
                            var bodyHTML =
                                "<div id=\'im-verification-reminders-list-wrapper\' class=\'kchat-im-panel-userlist\'>" +
                                "	<div>" +
                                "		<div class=\'kchat-talk-list-group\'>" +
                                //			<!-- 当列表数据为空时要显示的提示信息 -->
                                "			<div id=\'im-verification-reminders-list-empty\' class=\'kchat-talk-list-empty\' " + (isHasItems ? "style=\'display: none;\'" : "") + ">" +
                                "				<i class=\'icon-talk1\' style=\'font-size: 60px;\'></i>" +
                                "				<p>好友请求已全部处理</p>" +
                                "			</div>" +
                                //			<!-- 动态组织的数据UI -->
                                (isHasItems ? ("<ul id=\'im-verification-reminders-list-content\'>" + itemsHTML + "</ul>") : "") +
                                "		</div>" +
                                "	</div>" +
                                "</div>";

                            // 所有item的html拼接完成后，显示在对话模框里
                            //that.setDialogBody(dialogId, bodyHTML);
                            // 对话框id，为了防止全局取id对象发生冲突，建议必须使用
                            var dialogId = that.nextDialogId();
                            // 先把对话框显示出来
                            that.showDialog("加好友请求"
                                , "取消"
                                , "保存"
                                , bodyHTML
                                , dialogId
                                , null
                                , null
                                , false
                                , "max-width: 375px;min-width: 375px !important;min-height: 600px !important;"
                                , "padding: 0;"
                                , false
                                , false);

                            // 为每一行item里的“同意”、“拒绝”按钮添加点击事件（必须要等到html是示到页面里后才能加事件，否则无法操作DOM对象哟）
                            var fn_clickButton = function (event) {
                                const usertype =  Number(sessionStorage.getItem('usertype'))
                                if(usertype){
                                    const showSqdLOgin = {
                                        isNeedLogon : 'true',
                                        from:'chat'
                                    }
                                    window.parent.postMessage(JSON.stringify(showSqdLOgin),'*');
                                    return
                                }
                                // 取出uid值
                                var srcUid = $(this).attr('srcuid');
                                // 取出action类型(见上方的html拼接内容， 0-表示同意、1-表示拒绝)
                                var actionType = $(this).attr('actiontype');

                                //alert('对'+srcUid+'点击了'+actionType+'！！！！');

                                // 本地用户的个人信息
                                var localUserInfo = LocalUserInfo.getObj();
                                if (!localUserInfo) {
                                    //alert('本地用户数据不存在，请重新登陆后再试！');
                                    RBChatDialogHelper.showAlertDialog_WARN('温馨提示', '本地用户数据不存在，请重新登陆后再试！');
                                    return;
                                }

                                // 回调函数：用于判断当item数为0时，自动切换到“空数据”的UI显示
                                var checkItemsCount = function () {
                                    // 余下的未处理行数
                                    var itemsCount = $('#im-verification-reminders-list-content').children().length;
                                    var resultCount = 0
                                    if (itemsCount > 0) {
                                        const l = $('#im-verification-reminders-list-content').children();
                                        for (var i = 0; i < itemsCount; i++) {
                                            const item = l[i];
                                            const f = $(item).attr('flag');
                                            if (f - 0 == 0) {
                                                resultCount++
                                            }
                                        }
                                    }
                                    // // 如果未处理数为0，则显示空UI，提升用户体验
                                    // if (resultCount === 0) {
                                    //     $('#im-verification-reminders-list-content').hide();
                                    //     $('#im-verification-reminders-list-empty').show();
                                    // }

                                    // 返回未处理的总行数
                                    return resultCount;
                                };

                                // 点击的是"同意"
                                if ('0' == actionType) {
                                    // 调用HTTP REST接口：“【接口1008-3-8】获取用户/好友的个人信息”，接口返回值详细情况，详见接口文档或服务端代码。
                                    RBChatRestHelper.submitPROCESS_ADD$FRIEND$REQ_B$TO$SERVER_AGREE(
                                        srcUid, localUserInfo.user_uid, localUserInfo.nickname
                                        // 数据读取成功后的回调
                                        , function (returnValue) {
                                            // 清空并赋值
                                            $('#im-verification-reminders_li_rejectbtn_' + srcUid).remove();
                                            $('#im-verification-reminders_li_agreebtn_' + srcUid).remove();

                                            $('#im-verification-reminders_li_' + srcUid).attr('flag', '1')
                                            var nickName = $('#im-verification-reminders_li_' + srcUid).attr('nickName')
                                            $('#im-verification-reminders_li_msgcontent_' + srcUid).after("<span style='color:green;float:right;'>已同意</span><a id=\'getChat" + srcUid + "\' srcuid=\'" + srcUid + "\' style='color:#5393ed;float:right;margin: 0 5px'>去聊天</a>")
                                            clickChat(srcUid, nickName)
                                            // 判断item是否已为空（即请求是否已全部处理完成）
                                            var remainingCount = checkItemsCount();
                                            // 用当前余下的未处理好友请求数更新首页“消息”上的未处理好友未读数显示
                                            RBChatAlarmsUI.setUnread_for_addFriendReq(remainingCount);
                                        }
                                        // 数据读取失败后的回调
                                        , function (errorThrownStr) {
                                            //alert('\"同意\"用户'+srcUid+'的加友请求处理失败了！');
                                            RBChatDialogHelper.showAlertDialog_WARN('处理失败了', '\"同意\"用户' + srcUid + '的加友请求处理失败了，可能是网络故障，请稍后再试！');
                                        }
                                    );
                                }
                                // 点击的是"拒绝"
                                else if ('1' == actionType) {
                                    // 调用HTTP REST接口：“【接口1008-3-8】获取用户/好友的个人信息”，接口返回值详细情况，详见接口文档或服务端代码。
                                    RBChatRestHelper.submitPROCESS_ADD$FRIEND$REQ_B$TO$SERVER_REJECT(
                                        srcUid, localUserInfo.user_uid, localUserInfo.nickname
                                        // 数据读取成功后的回调
                                        , function (returnValue) {

                                            // 清空并赋值
                                            $('#im-verification-reminders_li_rejectbtn_' + srcUid).remove();
                                            $('#im-verification-reminders_li_agreebtn_' + srcUid).remove();
                                            $('#im-verification-reminders_li_' + srcUid).attr('flag', '2')
                                            $('#im-verification-reminders_li_msgcontent_' + srcUid).after("<span style='color:red;float:right;'>已拒绝</span>")


                                            // 判断item是否已为空（即请求是否已全部处理完成）
                                            var remainingCount = checkItemsCount();
                                            // 用当前余下的未处理好友请求数更新首页“消息”上的未处理好友未读数显示
                                            RBChatAlarmsUI.setUnread_for_addFriendReq(remainingCount);
                                        }
                                        // 数据读取失败后的回调
                                        , function (errorThrownStr) {
                                            //alert('\"拒绝\"用户'+srcUid+'的加友请求处理失败了！');
                                            RBChatDialogHelper.showAlertDialog_WARN('处理失败了', '\"拒绝\"用户' + srcUid + '的加友请求处理失败了，可能是网络故障，请稍后再试！');
                                        }
                                    );
                                }

                                //阻止点击事件继续冒泡（否则事件又要传递到item了，从而触发item的点击事件处理）
                                event.stopPropagation();
                            };
                            for (var i = 0; i < reqsList.length; i++) {
                                var reqData = reqsList[i];
                                var reqUserUid = reqData[0];
                                var reqUserNickname = reqData[1];
                                clickChat(reqUserUid, reqUserNickname)
                            }

                            // 实现点击iten显示该用户的个人信息的事件处理
                            var fn_clickItem = function () {
                                // 取出uid值
                                var srcUid = $(this).attr('srcuid');
                                // 该行item所对应的返回数据中的数组索引
                                var dataIndex = $(this).attr('dataIndex');

                                if (srcUid && dataIndex) {
                                    // 每一个好友请求元数据，都是一个完整的RosterElementEntity对象（详见【接口1008-4-7】接口文档或服务端代码）
                                    var reqData = reqsList[dataIndex];

                                    // 先关闭当前对话框
                                    //that.closeDialog(dialogId);
                                    // 再显示该用户的个人信息
                                    that.showUserInfo(reqData);
                                }
                            };

                            // 将事件循环添加到html的DOM对象上
                            if (isHasItems) {
                                for (var i = 0; i < reqsList.length; i++) {

                                    // 每一个好友请求元数据，都是一个完整的RosterElementEntity对象（详见【接口1008-4-7】接口文档或服务端代码）
                                    var reqData = reqsList[i];
                                    var reqUserUid = reqData[0];
                                    if (reqData[4] - 0 != 0) {
                                        continue;
                                    }

                                    // 为每一行的按钮增加点击事件
                                    $("#im-verification-reminders_li_agreebtn_" + reqUserUid).click(fn_clickButton);
                                    $("#im-verification-reminders_li_rejectbtn_" + reqUserUid).click(fn_clickButton);
                                    // 为每一行的item增加点击事件
                                    // $("#im-verification-reminders_li_" + reqUserUid).click(fn_clickItem);
                                }
                            }
                        }
                        // 当服务端返回的请求数据为空时
                        else {
                            RBChatUtils.logToConsole('【showOfflineAddFriendsReq】服务端返回的加好友请求数据为空，本次拉取已结束。');

                            // 给一个空数据提示，提升用户体验
                            that.showNoDataDialog(null, "暂无好友请求");
                        }

                        //** 以下代码用于更新“首页”上的未处理好友请求Alarm上的未读数（为了防止某些情况下手机端并未能同步
                        //** 实际的服务端未处时好友请求数，正好借本界面中加载最新好友请求数据的机会刷新一下，既能省一次单独
                        //** 的网络调用，又能把“首页”的未处理好友请求Alarm的item上未读数同步，一举两得）
                        if (reqsList && reqsList.length > 0) {
                            var count = 0;
                            for (const item of reqsList) {
                                if (item[4] - 0 == 0) {
                                    count++;
                                }
                            }
                            RBChatAlarmsUI.setUnread_for_addFriendReq(count);
                        }
                        else {
                            RBChatAlarmsUI.setUnread_for_addFriendReq(0);
                        }
                    }
                }
                // 失败后的回调
                , function (errorThrownStr) {
                    //alert('加好友请求数据获取失败了，原因是：'+errorThrownStr);
                    RBChatDialogHelper.showAlertDialog_WARN('加载失败', '加好友请求数据获取失败了，可能是网络故障，请稍后再试！');
                }
            );
        }
    };

    /**
     * 显示“查找用户/好友”对话框。
     */
    UIModule7.prototype.showQueryUserForm = function () {

        var that = this;

        // 对话框id，为了防止全局取id对象发生冲突，建议必须使用
        var dialogId = that.nextDialogId();

        // 要显示于对话框中的form表单html内容
        var bodyHTML =
            "<form>" +
            "	<ul>" +
            "		<li>" +
            "			<div>" +
            "				<i class=\'icon-search\' style=\'position: absolute;left: 10px;top: 10px;font-size: 15px;color: #9d9d9d;\' ></i>" +
            "				<input id=\'dialog-queryuser-form-uidormail-" + dialogId + "\' maxlength=\'50\' class=\'text ember-text-field\' type=\'text\' placeholder=\'UID\' style=\'padding: 0px 0 0px 32px;\'>" +
            "				<p class=\'hint\'><i class=\'icon-info\' ></i>请输入用户的ID号</p>" +
            "			</div>" +
            "		</li>" +
            "	</ul>" +
            "</form>";

        // 点击保存按钮要执行的回调函数
        var fn_submitCallback = function () {
            // 取出界面上form表单字段内容
            var uidOrMail = $.trim($("#dialog-queryuser-form-uidormail-" + dialogId).val());

            if (uidOrMail.length === 0) {
                alert('查找内容不能为空哦！');
                return;
            }


            // true表示用好友的mail地址查找，否则表示用好友的uid查找
            var isUseMail = RBChatUtils.stringIsEmail(uidOrMail);

            //alert("输入的内容是："+uidOrMail+', isUseMail='+isUseMail);

            // 提交服务端查询并显示结果
            that.showUserInfoFromServer_for_search(isUseMail, uidOrMail, uidOrMail, function () {
                // 用户信息加载成后，关闭当前查询对话框
                that.closeDialog(dialogId);
            });
        };

        // 显示对话框
        that.showDialog("查找用户"
            , "取消"
            , "开始查找"
            , bodyHTML
            , dialogId
            , null
            , fn_submitCallback
            , true
            , "min-width: 0px;"
            , null
            , false
            , false);
    };


    /**
    * 发送短信弹框
    */
    UIModule7.prototype.showSendMsgForm = function (uid, isBatch = false, title = '') {
        var that = this;
        // 对话框id，为了防止全局取id对象发生冲突，建议必须使用
        var dialogId = that.nextDialogId();
        // 要显示于对话框中的form表单html内容
        var bodyHTML =
            "<form>" +
            "	<ul>" +
            "		<li>" +
            "			<div>" +
            "				<textarea id=\'dialog-queryuser-form-uidormail-" + dialogId + "\' maxlength=\'1000\' class=\'text ember-text-field\' type=\'text\' placeholder=\'要发送的短信内容\' style=\'padding: 5px;\' />" +
            "			</div>" +
            "		</li>" +
            "	</ul>" +
            "</form>";

        // 点击保存按钮要执行的回调函数
        var fn_submitCallback = function () {
            // 取出界面上form表单字段内容
            var uidOrMail = $.trim($("#dialog-queryuser-form-uidormail-" + dialogId).val());

            if (uidOrMail.length === 0) {
                alert('短信内容不能为空哦！');
                return;
            }
            if (isBatch) {
                RBChatRestHelper.submitSendBatchCmsMsg(uid, uidOrMail
                    // 数据读取成功后的回调
                    , function (returnValue) {
                        if (returnValue) {
                            const obj = JSON.parse(returnValue);
                            if (obj.result) {
                                alert('发送成功')
                                that.closeDialog(dialogId)
                            } else {
                                alert(obj.error || '发送失败')
                            }

                        } else {
                            alert('发送失败')
                        }
                    }
                    // 数据读取失败后的回调
                    , function (errorThrownStr) {
                    }
                );
            } else {
                RBChatRestHelper.submitSendCmsMsg(uid, uidOrMail
                    // 数据读取成功后的回调
                    , function (returnValue) {
                        if (returnValue) {
                            const obj = JSON.parse(returnValue);
                            if (obj.result) {
                                alert('发送成功')
                                that.closeDialog(dialogId)
                            } else {
                                alert(obj.error || '发送失败')
                            }

                        } else {
                            alert('发送失败')
                        }
                    }
                    // 数据读取失败后的回调
                    , function (errorThrownStr) {
                    }
                );
            }
        };

        // 显示对话框
        that.showDialog(title.length > 0 ? title : "发送短信"
            , "取消"
            , "确定"
            , bodyHTML
            , dialogId
            , null
            , fn_submitCallback
            , true
            , "min-width: 0px;"
            , null
            , false
            , false);
    };


    /**
   * 发送消息弹框
   */
    UIModule7.prototype.showSendMsgForm2 = function (uids, isBatch = false, title = '') {
        var that = this;
        // 对话框id，为了防止全局取id对象发生冲突，建议必须使用
        var dialogId = that.nextDialogId();
        // 要显示于对话框中的form表单html内容
        var bodyHTML =
            "<form>" +
            "	<ul>" +
            "		<li>" +
            "			<div>" +
            "				<textarea id=\'dialog-queryuser-form-uidormail-" + dialogId + "\' maxlength=\'1000\' class=\'text ember-text-field\' type=\'text\' placeholder=\'要发送的消息内容\' style=\'padding: 5px;\' />" +
            "			</div>" +
            "		</li>" +
            "	</ul>" +
            "</form>";

        // 点击保存按钮要执行的回调函数
        var fn_submitCallback = function () {
            // 取出界面上form表单字段内容
            var uidOrMail = $.trim($("#dialog-queryuser-form-uidormail-" + dialogId).val());

            if (uidOrMail.length === 0) {
                alert('消息内容不能为空哦！');
                return;
            }
            window.userList = uids;
            RBChatChattingContentPaneUI.circleSendGroupMsg(window.userList.length, uidOrMail, MsgType.TYPE_TEXT, [].concat(window.userList), function () {
            })

        };

        // 显示对话框
        that.showDialog(title.length > 0 ? title : "发送消息"
            , "取消"
            , "确定"
            , bodyHTML
            , dialogId
            , null
            , fn_submitCallback
            , true
            , "min-width: 0px;"
            , null
            , false
            , false);
    };

    /**
    * 创建分组对话框。
    */
    UIModule7.prototype.showGroupCreateForm = function () {

        var that = this;

        // 对话框id，为了防止全局取id对象发生冲突，建议必须使用
        var dialogId = that.nextDialogId();

        // 要显示于对话框中的form表单html内容
        var bodyHTML =
            "<form>" +
            "	<ul>" +
            "		<li>" +
            "			<div>" +
            "				<i  style=\'position: absolute;left: 10px;top: 10px;font-size: 15px;color: #9d9d9d;\' ></i>" +
            "				<input id=\'dialog-queryuser-form-uidormail-" + dialogId + "\' maxlength=\'20' class=\'text ember-text-field\' type=\'text\' placeholder=\'分组名称\' style=\'padding: 0px 0 0px 5px;\'>" +
            "			</div>" +
            "		</li>" +
            "	</ul>" +
            "</form>";

        // 点击保存按钮要执行的回调函数
        var fn_submitCallback = function () {

            // 取出界面上form表单字段内容
            var uidOrMail = $.trim($("#dialog-queryuser-form-uidormail-" + dialogId).val());

            if (uidOrMail.length === 0) {
                alert('分组名称不能为空哦！');
                return;
            }

            RBChatRestHelper.submitCreateFenzu(uidOrMail
                // 数据读取成功后的回调
                , function (returnValue) {
                    if (returnValue) {
                        // 添加分组
                        RBChatRosterUI.deal_fen_local_to_last(function () {
                            RBChatRosterUI.createFenzu(returnValue, uidOrMail, 0, 0, true);
                            that.closeDialog(dialogId);
                        });
                    } else {
                        alert('创建失败,请重试一下')
                    }
                }
                // 数据读取失败后的回调
                , function (errorThrownStr) {
                    //alert('用户的基本信息数据加载出错，原因是：'+errorThrownStr);
                    RBChatDialogHelper.showAlertDialog_WARN('加载失败', '用户的基本信息数据加载出错，可能是网络故障，请稍后再试！');
                }
                , true
                , null
            );
        };

        // 显示对话框
        that.showDialog("创建分组"
            , "取消"
            , "确定"
            , bodyHTML
            , dialogId
            , null
            , fn_submitCallback
            , true
            , "min-width: 0px;"
            , null
            , false
            , false);
    };

    /**
    * 修改分组对话框。
    */
    UIModule7.prototype.showGroupModifyNameForm = function (groupId, groupName) {

        var that = this;

        // 对话框id，为了防止全局取id对象发生冲突，建议必须使用
        var dialogId = that.nextDialogId();

        // 要显示于对话框中的form表单html内容
        var bodyHTML =
            "<form>" +
            "	<ul>" +
            "		<li>" +
            "			<div>" +
            "				<i  style=\'position: absolute;left: 10px;top: 10px;font-size: 15px;color: #9d9d9d;\' ></i>" +
            "				<input id=\'dialog-queryuser-form-uidormail-" + dialogId + "\' maxlength=\'20' class=\'text ember-text-field\' type=\'text\' placeholder=\'分组名称\' value='" + groupName + "' style=\'padding: 0px 0 0px 5px;\'>" +
            "			</div>" +
            "		</li>" +
            "	</ul>" +
            "</form>";

        // 点击保存按钮要执行的回调函数
        var fn_submitCallback = function () {

            // 取出界面上form表单字段内容
            var uidOrMail = $.trim($("#dialog-queryuser-form-uidormail-" + dialogId).val());

            if (uidOrMail.length === 0) {
                alert('分组名称不能为空哦！');
                return;
            }

            RBChatRestHelper.submitModifyFenzu(groupId, uidOrMail
                // 数据读取成功后的回调
                , function (returnValue) {
                    if (returnValue) {
                        // 添加分组
                        $("#rstore-group-name-" + groupId).text(uidOrMail);
                        that.closeDialog(dialogId);

                    } else {
                        alert('创建失败,请重试一下')
                    }
                }
                // 数据读取失败后的回调
                , function (errorThrownStr) {
                    //alert('用户的基本信息数据加载出错，原因是：'+errorThrownStr);
                    RBChatDialogHelper.showAlertDialog_WARN('加载失败', '用户的基本信息数据加载出错，可能是网络故障，请稍后再试！');
                }
                , true
                , null
            );
        };

        // 显示对话框
        that.showDialog("修改分组"
            , "取消"
            , "确定"
            , bodyHTML
            , dialogId
            , null
            , fn_submitCallback
            , true
            , "min-width: 0px;"
            , null
            , false
            , false);
    };

    /**
     * 设置常用提示语
     */
    UIModule7.prototype.showWelcomDialog = function (ree) {

        var that = this;
        // 对话框id，为了防止全局取id对象发生冲突，建议必须使用
        var dialogId = that.nextDialogId();

        // 要显示于对话框中的form表单html内容
        var bodyHTML =
            "<form>" +
            "	<ul>" +
            "		<li>" +
            "			<div>" +
            "				<i  style=\'position: absolute;left: 10px;top: 10px;font-size: 15px;color: #9d9d9d;\' ></i>" +
            "				<textarea id=\'dialog-welcom-01-" + dialogId + "\' maxlength=\'1000\' rows=\'5\' placeholder=\'您还没有设置添加好友欢迎语\'></textarea>" +
            "				<p class=\'hint\'><i class=\'icon-info\' ></i>设置添加好友欢迎语,最多1000字</p>" +
            "			</div>" +
            "		</li>" +
            "		<li>" +
            "			<div>" +
            "				<i  style=\'position: absolute;left: 10px;top: 10px;font-size: 15px;color: #9d9d9d;\' ></i>" +
            "				<textarea id=\'dialog-welcom-02-" + dialogId + "\' maxlength=\'1000\' rows=\'5\' placeholder=\'您还没有设置会员上线欢迎语\'></textarea>" +
            "				<p class=\'hint\'><i class=\'icon-info\' ></i>设置会员上线欢迎语,最多1000字</p>" +
            "			</div>" +
            "		</li>" +
            "		<li>" +
            "			<div>" +
            "				<i  style=\'position: absolute;left: 10px;top: 10px;font-size: 15px;color: #9d9d9d;\' ></i>" +
            "				<textarea id=\'dialog-welcom-03-" + dialogId + "\' maxlength=\'1000\' rows=\'5\' placeholder=\'您还没有设置离线自动回复语\'></textarea>" +
            "				<p class=\'hint\'><i class=\'icon-info\' ></i>设置离线自动回复语,最多1000字</p>" +
            "			</div>" +
            "		</li>" +
            "	</ul>" +
            "</form>";

        setTimeout(() => {
            if (ree.length > 0) {
                $('#dialog-welcom-01-' + dialogId).val(ree[0] || '');
                $('#dialog-welcom-02-' + dialogId).val(ree[1] || '');
                $('#dialog-welcom-03-' + dialogId).val(ree.length > 2 ? (ree[2] || '') : '');

            }
        }, 100)

        // 点击保存按钮要执行的回调函数
        var fn_submitCallback = function () {
            //开始提交
            let content0 = $('#dialog-welcom-01-' + dialogId).val() || '';
            let content1 = $('#dialog-welcom-02-' + dialogId).val() || '';
            let content2 = $('#dialog-welcom-03-' + dialogId).val() || '';

            RBChatRestHelper.setWleockFromServer({ content0, content1, content2 }
                // 数据读取成功后的回调
                , function (returnValue) {
                    // 服务端返回的是java对象Vector<Vector>表示的2维数组的JSON文本
                    if (returnValue) {
                        that.closeDialog(dialogId);
                    } else {
                        alert('设置出错')
                    }

                }
                // 数据读取失败后的回调
                , function (errorThrownStr) {
                    //alert('用户'+uid+'的个人相册列表数据读取出错，原因是：'+errorThrownStr);
                    RBChatDialogHelper.showAlertDialog_WARN('加载失败', '可能是网络故障，请稍后再试！');
                }
            );
        };

        // 显示对话框
        that.showDialog("设置提示语"
            , "取消"
            , "保存"
            , bodyHTML
            , dialogId
            , null
            , fn_submitCallback
            , true
            , "min-width: 0px;"
            , null
            , false
            , false);
    };

    /**
    * 其他开关设置
    */
    UIModule7.prototype.showOtherSetDialog = function () {

        var that = this;
        // 对话框id，为了防止全局取id对象发生冲突，建议必须使用
        var dialogId = that.nextDialogId();

        // 要显示于对话框中的form表单html内容
        var bodyHTML =
            "<form>" +
            "<div class='other-set-root'>" +
            " <div class='other-set-root-item'><span>添加好友无需验证</span> <p id='other-friend-open-" + dialogId + "'>开</p></div>" +
            "</div>" +
            "</form>";


        setTimeout(() => {
            var localUserInfo = LocalUserInfo.getObj();
            if (localUserInfo.disturb) {
                $('#other-friend-open-' + dialogId).text(localUserInfo.disturb == 'CLOSE' ? '关' : '开')
            }
            // 设置好友验证开关
            $('#other-friend-open-' + dialogId).click(function () {
                RBChatRestHelper.setFrendAddFromServer(localUserInfo.disturb == 'CLOSE' ? 'OPEN' : 'CLOSE'
                    // 数据读取成功后的回调
                    , function (returnValue) {
                        // 服务端返回的是java对象Vector<Vector>表示的2维数组的JSON文本
                        if (returnValue) {

                            // 刷新本地用户信息
                            LocalUserInfo.reloadFromServer(function () {
                                localUserInfo = LocalUserInfo.getObj();
                                if (localUserInfo.disturb) {
                                    $('#other-friend-open-' + dialogId).text(localUserInfo.disturb == 'CLOSE' ? '关' : '开')
                                }
                            });
                        } else {
                            alert('设置出错')
                        }
                    }
                    // 数据读取失败后的回调
                    , function (errorThrownStr) {
                        //alert('用户'+uid+'的个人相册列表数据读取出错，原因是：'+errorThrownStr);
                        RBChatDialogHelper.showAlertDialog_WARN('加载失败', '可能是网络故障，请稍后再试！');
                    }
                );
            })
        }, 50)

        // 显示对话框
        that.showDialog("其他设置"
            , "取消"
            , "保存"
            , bodyHTML
            , dialogId
            , null
            , null
            , false
            , "min-width: 500px;"
            , null
            , false
            , false);
    };

    /**
     * 显示发送的影片
     */
    UIModule7.prototype.showMoivesDialog = function () {
        var that = this;
        var dialogId = that.nextDialogId();
        var PAGE_SIZE = 50;
        window.moives_show_list = [];
        var params = {
            title:''
        }

        /**
         * 进行影片搜索
         */
        window.search_moives = function(){
            params.title = $('#id-search-text').val();
            reqData()
        }

        /**
         * 请求数据
         */
        var reqData = function(){
            RBChatRestHelper.query_moives(params,function(res){
                window.moives_show_list = JSON.parse(res)
                init_ui();
            },function(){})
        }

        
        // 绘制好友
        var show_list = function (list,isFrist = true) {
            var itemsHTML = ''
            for (var i = 0; i < list.length; i++) {
                var item = list[i]
                itemsHTML += "<div gTag='movies-item' class='movies-item-l' srcuid='"+item[0]+"'>"+
                              '<input  type="checkbox" value="" ' + (item.selected ? 'checked' : '') + ' srcuid=\'' + item[0] + '\'/>'+
                              "<div class='moives-info'><span>"+item[1]+"</span><img src='"+item[2]+"' class='feng'/> <img src='images/common_short_video_player_continue_play_ico_nor.png' class='bo'/></div>"+
                              "</div>"
            }
            if (isFrist) {
                $('#moives-list-content').append(itemsHTML)
            } else {
                const d = $("div[gTag='movies-item'");
                $(d[d.length - 1]).after(itemsHTML)
            }

            $("#moives-list-content input[type='checkbox']").off('change').on("change", function () {
                let choice = $(this).attr("checked") == "checked";
                var search_user_list = window.moives_show_list;
                if (search_user_list && search_user_list.length > 0) {
                    search_user_list.forEach(item => {
                        if (item[0]== $(this).attr("srcuid")) {
                            item.selected = choice;
                        }
                    })
                }
            });
        }

        // 处理点击加载
        var deal_more_logic = function () {
            var that = this;
            // 移除更多
            const remove_more = function () {
                const d = $("div[gTag='moives_more']");
                if (d) {
                    d.remove();
                }
            }
            var search_user_list = window.moives_show_list;
            //获取当前显示好友的数量
            const c_len = $("div[gTag='movies-item']") ? $("div[gTag='movies-item']").length : 0;
            var end = 0;
            // 加载数据
            if (c_len < search_user_list.length) {
                end = c_len + PAGE_SIZE;
                // 还没有加载完数据
                if (end < search_user_list.length) {
                    //加载数据
                    const _list = search_user_list.slice(c_len, end)
                    show_list(_list.reverse(), false)
                } else {
                    end = search_user_list.length - 1;
                    //加载数据
                    const _list = search_user_list.slice(c_len, end)
                    show_list(_list.reverse(), false)
                    remove_more();
                }
            } else {
                remove_more();
            }
        }

        // 创建加载更多
        var create_more_ui = function () {
            const group_html = "<div class='rstore-friend-group-more' gTag='moives_more'  id='moives_more'><span>查看更多</span></div>";
            const d = $("div[gTag='movies-item'");
            if (d) {
                $(d[d.length - 1]).after(group_html)
                // 添加点击事件
                $("#moives_more").click(function () {
                    deal_more_logic()
                })
            }
        }

        // 初始ui显示
        var init_ui = function () {
            $("#moives-list-content").empty();
            $("div[gTag='moives_more'").remove();
            var search_user_list = window.moives_show_list;
            if (search_user_list.length > 0) {
                $('#moive-list-tip').text('影片列表('+ search_user_list.length+')');
                const c_len = search_user_list.length > PAGE_SIZE ? PAGE_SIZE : search_user_list.length
                show_list(search_user_list.slice(0, c_len));
                // 创建更多
                if (search_user_list.length > PAGE_SIZE) {
                    create_more_ui()
                }
            } else {
                $('#moive-list-tip').text('影片列表(0)');
            }

        }


        window.sendMoive = function(){
            var sendList = window.moives_show_list || []
            sendList = sendList.filter(item=> item.selected)
            if(sendList.length>0){
                //请求选择要发送的群或用户
                if (RBChatMainUI.getCurrentSelectedAlarmDataId()){
                    // 批量发送影片
                    RBChatChattingContentPaneUI.circleSendMoiveMsg({
                        msgType:RBChatMainUI.getCurrentSelectedAlarmType(),
                        userId: RBChatMainUI.getCurrentSelectedAlarmDataId()
                    },sendList,function(){

                    })

                }else{
                    alert('请选择要发送的群或用户')
                }
            }else{
                alert('请选择要发送的影片')
            }
        }
        var bodyHTML =
            "<div class=\"moives-box\">" +
             "<div class='row-1'><input id='id-search-text' type='text' placeholder='请输入影片的名称' style='flex:1;margin-right:20px;padding:3px;font-size:14px;'/> <button onclick='javascript:search_moives()'>查询</button> <button style='margin-left:10px;' onclick='javascript:sendMoive()'>发送</button></div>"+
             "<div class='row-2'><div class='list-tip' id='moive-list-tip'>影片列表</div> <div class='list-content' id='moives-list-content'></div></div>"+
            " </div>"
        that.showDialog(
            "影片库"
            , "取消"
            , "发送"
            , bodyHTML
            , dialogId
            , null
            , null
            , false
            , "min-width: 375px;"
            , "min-width: 375px; max-height:600px;"
            , false
            , false);

            reqData();
    }

    /**
     * 显示共同的群
     * @param {*} userId 
     * @param {*} friendId 
     * @param {*} nickName 
     */
    UIModule7.prototype.showCommGroupDialog2 = function (srcuid, nickName) {
        var that = this;
        var showDialogTitle = "我与" + nickName + "共同的群"
        var localUserUid = LocalUserInfo.getObj().user_uid;
        var dialogId = that.nextDialogId();

        // 通过rest接口获取好友列表数据
        RBChatRestHelper.showDesignatedFriend(localUserUid, srcuid, function (returnValue) {
            // 根据接口定义，返回不为空即表示认证成功
            if (!RBChatUtils.isStringEmpty(returnValue)) {
                // 服务端返回的是一维RosterElementEntity对象数组
                var rosterList = JSON.parse(returnValue)
                if (rosterList) {
                    // 显示详情
                    var listHTML = ''
                    var entityDatalength = rosterList.length
                    for (var i = 0; i < rosterList.length; i++) {
                        var entityData = rosterList[i];
                        var gId = entityData.gId;
                        var gName = entityData.gName;
                        const defaultColor = RBChatUtils.getBgColor(gId)
                        const show_t = gName.substr(0, 1).toUpperCase();
                        listHTML +=
                            "<div class=\"group_dom_details\" id='" + gId + "_" + srcuid + "_root'>" +
                            " <div>" +
                            "	 <div class=\'avatar_source\'>" +
                            "        <div  class=\'img_group_d\' style='background:" + defaultColor + "'>" + show_t + " </div>" +
                            "        <img onerror='javascript:$(this).remove()' class=\"details_img\" src=\'" + RBChatUtils.getUserAvatarDownloadURL(gId, true) + "\'>" +
                            "	 </div>" +
                            "    <span class=\"details_name\">" + gName + "</span>" +
                            " </div>" +
                            " </div>"
                    }
                    listHTML += `<div class="details_num">${entityDatalength}个群组</div>`

                    var bodyHTML =
                        "<div class=\"container_box\">" +
                        "    <div class=\"group_dom_details_c\">" +
                        "       <div class=\"group_dom_details_list\">" + listHTML +
                        "       </div>" +
                        "   </div>" +
                        " </div>"
                    that.showDialog(
                        showDialogTitle
                        , "取消"
                        , "确定"
                        , bodyHTML
                        , dialogId
                        , null
                        , null
                        , false
                        , "min-width: 375px; max-height:800px;height:800px;"
                        , "min-width: 375px; max-height:800px;height:800px;overflow: unset !important;"
                        , false
                        , false);
                }
                else {
                    RBChatDialogHelper.showAlertDialog_WARN('提示', '当前没有指定好友拥有的共同群');
                }
            }
        }
            , function (errorThrownStr) {
                RBChatDialogHelper.showAlertDialog_WARN('加载失败', '查询和指定好友拥有的共同群列表数据加载出错，可能是网络故障，请稍后再试！');
            }
        );


    }


    /**
    * 显示共同的群
    * @param {*} userId 
    * @param {*} friendId 
    * @param {*} nickName 
    */
    UIModule7.prototype.showCommGroupDialog3 = function (srcuid, nickName) {
        var that = this;
        var showDialogTitle = "我与" + nickName + "共同的好友"
        var localUserUid = LocalUserInfo.getObj().user_uid;
        var dialogId = that.nextDialogId();
        // 通过rest接口获取好友列表数据
        RBChatRestHelper.getCommonFriend(localUserUid, srcuid, function (returnValue) {
            // 根据接口定义，返回不为空即表示认证成功
            if (!RBChatUtils.isStringEmpty(returnValue)) {
                // 服务端返回的是一维RosterElementEntity对象数组
                var rosterList = JSON.parse(returnValue)
                if (rosterList) {
                    // 显示详情
                    var listHTML = ''
                    var entityDatalength = rosterList.length
                    for (var i = 0; i < rosterList.length; i++) {
                        var entityData = rosterList[i];
                        var gId = entityData[0];
                        var gName = entityData[1];
                        const defaultColor = RBChatUtils.getBgColor(gId)
                        const show_t = gName.substr(0, 1).toUpperCase();
                        listHTML +=
                            "<div class=\"group_dom_details\" id='" + gId + "_" + srcuid + "_root'>" +
                            " <div>" +
                            "	 <div class=\'avatar_source\'>" +
                            "        <div  class=\'img_group_d\' style='background:" + defaultColor + "'>" + show_t + " </div>" +
                            "        <img onerror='javascript:$(this).remove()' class=\"details_img\" src=\'" + RBChatUtils.getUserAvatarDownloadURL(gId, true) + "\'>" +
                            "	 </div>" +
                            "    <span class=\"details_name\">" + gName + "</span>" +
                            " </div>" +
                            " </div>"
                    }
                    listHTML += `<div class="details_num">${entityDatalength}个好友</div>`

                    var bodyHTML =
                        "<div class=\"container_box\">" +
                        "    <div class=\"group_dom_details_c\">" +
                        "       <div class=\"group_dom_details_list\">" + listHTML +
                        "       </div>" +
                        "   </div>" +
                        " </div>"
                    that.showDialog(
                        showDialogTitle
                        , "取消"
                        , "确定"
                        , bodyHTML
                        , dialogId
                        , null
                        , null
                        , false
                        , "min-width: 375px; max-height:800px;height:800px;"
                        , "min-width: 375px; max-height:800px;height:800px;overflow: unset !important;"
                        , false
                        , false);
                }
                else {
                    RBChatDialogHelper.showAlertDialog_WARN('提示', '当前没有指定好友拥有的共同群');
                }
            }
        }
            , function (errorThrownStr) {
                RBChatDialogHelper.showAlertDialog_WARN('加载失败', '查询和指定好友拥有的共同群列表数据加载出错，可能是网络故障，请稍后再试！');
            }
        );


    }


    /**
    * 新增会员/非会员群
    */
    UIModule7.prototype.showAddGroupDialog = function (title, type) {
        var that = this;
        let showDialogTitle = title;
        var dialogId = that.nextDialogId();
        var s_list = type == 0 ? window.auto_groups.vipGroupList : window.auto_groups.noVipGroupList
        if (!s_list) {
            s_list = []
        }
        // 刷新好友列表
        var flashFriendsList = function (isFrist = false, callBack = null) {
            var localUserUid = LocalUserInfo.getObj().user_uid;
            // 通过rest接口获取好友列表数据
            RBChatRestHelper.query_all_my_group({
                adminId: localUserUid
            }, function (returnValue) {
                // 根据接口定义，返回不为空即表示认证成功
                if (!RBChatUtils.isStringEmpty(returnValue)) {
                    // 服务端返回的是一维RosterElementEntity对象数组
                    var rosterList = JSON.parse(returnValue)
                    if (rosterList) {
                        friendsListUI(rosterList, isFrist)
                        if (callBack) callBack();
                    }
                    else {
                        RBChatDialogHelper.showAlertDialog_WARN('提示', '当前没有共同群组信息');
                    }
                }
            }
                , function (errorThrownStr) {
                    RBChatDialogHelper.showAlertDialog_WARN('加载失败', '共同群组列表数据加载出错，可能是网络故障，请稍后再试！');
                }
            );
        }

        // 保存接口
        var saveCallBack = function () {
            const select = [];
            $('.container_list input[type=checkbox]:checked').each(function () {
                select.push($(this).val());
            });
            var params = {
                adminId: LocalUserInfo.getObj().user_uid,
                vipGroupIds: (window.auto_groups.vipGroupList || []).map(item => item[0]).join(','),
                noVipGroupIds: (window.auto_groups.noVipGroupList || []).map(item => item[0]).join(','),
            }
            // 保存vip
            if (type == 0) {
                params.vipGroupIds = select.join(',')
                // 保存非vip
            } else {
                params.noVipGroupIds = select.join(',')
            }
            RBChatRestHelper.set_auto_group(params, function (returnValue) {
                // 根据接口定义，返回不为空即表示认证成功
                that.closeDialog(dialogId)
                window.show_auto_add_group_req_data();
            }
                , function (errorThrownStr) {
                    RBChatDialogHelper.showAlertDialog_WARN('加载失败', '共同群组列表数据加载出错，可能是网络故障，请稍后再试！');
                }
            );

        }

        // 绘制共同群ui
        var friendsListUI = function (rosterList, isFrist = false) {
            const $d_dom = $('.container_list');
            var itemsHTML = ''
            for (var i = 0; i < rosterList.length; i++) {
                var entityData = rosterList[i];
                var friendUserId = entityData[0];
                var remark = entityData[1];
                const defaultColor = RBChatUtils.getBgColor(friendUserId)
                const show_t = remark.substr(0, 1).toUpperCase();
                var check_txt = s_list.filter(item => item[0] == friendUserId).length > 0 ? 'checked' : ''
                itemsHTML +=
                    "<div class=\"group_dom auto-group-my\" nickname='" + remark + "'  srcuid='" + friendUserId + "'\>" +
                    "     <div class=\'group_dom_l\'>" +
                    "		<div class=\'avatar_source\'>" +
                    "          <div  class=\'img_group\' style='background:" + defaultColor + "'>" + show_t + " </div>" +
                    "         <img onerror='javascript:$(this).remove()'  style='z-index: 99;' class=\'img_group\' src=\'" + RBChatUtils.getUserAvatarDownloadURL(friendUserId, true) + "\'>" +
                    "		</div>" +
                    "     </div>" +
                    "     <div class=\'group_dom_r\'>" +
                    "         <div class=\'group_dom_l_r\'>" +
                    "             <span class=\'group_dom_l_r_t\'>" + remark + "</span>" +
                    "             <span class=\'group_dom_l_r_b\'>群ID：" + friendUserId + "</span>" +
                    "         </div>" +
                    "        <input id='" + friendUserId + "_auto' name='" + friendUserId + "_auto' srcuid='" + friendUserId + "' type='checkbox' value='" + friendUserId + "' style='width:15px;height:15px' " + check_txt + " />" +
                    "      </div>" +
                    "</div>"
            }
            if (!isFrist) {
                $d_dom.empty();
                $d_dom.append(itemsHTML)
            } else {
                var bodyHTML =
                    "<div class=\"container_box\">" +
                    "    <div class=\"search_d\">" +
                    "        <div class=\"search_n\">" +
                    "            <img src=\"images/im_b_img/sea_3.png\">" +
                    "           <span>搜索</span>" +
                    "        </div>" +
                    "        <div class=\"search_y\">" +
                    "            <input id=\"focus_d\" type=\"text\" placeholder=\"请输入...\">" +
                    "            <span id=\"cancel_d\">取消</span>" +
                    "         </div>" +
                    "     </div>" +
                    "      <div class=\"container_list\" style='height:450px;'>" + itemsHTML + "</div>" +
                    "   </div>" +
                    "   <div class=\"group_dom_details_c\" style=\"display: none\">" +
                    "    <div class=\"group_dom_details_list\">" +
                    "    </div>" +
                    "   </div>"
                that.showDialog(
                    showDialogTitle
                    , "取消"
                    , "保存"
                    , bodyHTML
                    , dialogId
                    , null
                    , saveCallBack
                    , true
                    , "min-width: 375px;"
                    , "min-width: 375px; max-height:500px;height:500px;overflow: unset !important;"
                    , false
                    , false);
            }
        }

        // 初始基本事件
        var initEvents = function () {
            //添加返回按钮
            $('#dialog-header-title-' + dialogId).before("<h4><img src='images/im_b_img/left_jt_3.png' id='dialog-header-back-" + dialogId + "'  style='display:none;width:20px;height:20px; margin-right:15px;margin-top:13px' /></h4>")
            // 添加点击事件
            $('.auto-group-my').click(function () {
                const srcuid = $(this).attr('srcuid');
                $('#' + srcuid + '_auto').attr('checked', !($('#' + srcuid + '_auto').is(':checked')))

            })
            // 搜索框点击
            $('.search_n').click(function () {
                var _index = $(this).index();
                $('.search_y').css({ 'display': 'block' })
                $('.search_n').css({ 'display': 'none' })
                $('#focus_d').val('')
                $('#focus_d').focus()
            })
            $('#cancel_d').click(function () {
                $('.search_y').css({ 'display': 'none' })
                $('.search_n').css({ 'display': 'flex' })
                $('.group_dom').css('display', 'flex')
            })
            // 搜索
            $('#focus_d').on('input propertychange', function (e) {
                const inputVal = $(this).val();
                if (!inputVal || inputVal.length == 0) {
                    $('.group_dom').css('display', '')
                } else {
                    $('.group_dom').each(function (i, item) {
                        const nickname = $(item).attr('nickname').toLowerCase()
                        const srcuid = $(item).attr('srcuid');
                        if (srcuid) {
                            if (nickname && nickname.indexOf(inputVal.toLowerCase()) > -1 || srcuid && srcuid.indexOf(inputVal) > -1) {
                                $(item).css('display', '')
                            } else {
                                $(item).css('display', 'none')
                            }
                        }

                    });
                }
            });
        }


        flashFriendsList(true, function () {
            initEvents();
        });

    };



    /**
     * 共同的群
     */
    UIModule7.prototype.showCommonGroupDialog = function () {
        var that = this;
        let showDialogTitle = '共同的群';
        var dialogId = that.nextDialogId();
        const PAGE_SIZE = 50; //每一页分页大小
        var common_friends_list = []; // 好友列表


         // 处理点击加载
         var deal_more_logic = function (list) {
            var that = this;
            // 移除更多
            const remove_more = function () {
                const d = $("div[gTag='group_send_more']");
                if (d) {
                    d.remove();
                }
            }
            //获取当前显示好友的数量
            const c_len = $("div[gTag='group_send']") ? $("div[gTag='group_send']").length : 0;
            var end = 0;
            // 加载数据
            if (c_len < list.length) {
                end = c_len + PAGE_SIZE;
                // 还没有加载完数据
                if (end < list.length) {
                    //加载数据
                    const _list = list.slice(c_len, end)
                    friendsListUI(_list.reverse(), false)
                } else {
                    end = list.length - 1;
                    //加载数据
                    const _list = list.slice(c_len, end)
                    friendsListUI(_list.reverse(), false)
                    remove_more();
                }
            } else {
                remove_more();
            }
        }

        // 创建加载更多
        var create_more_ui = function (list) {
            const group_html = "<div class='rstore-friend-group-more' gTag='group_send_more'  id='groupsend-more'><span>查看更多</span></div>";
            const d = $("div[gTag='group_send'");
            if (d) {
                $(d[d.length - 1]).after(group_html)
                // 添加点击事件
                $("#groupsend-more").click(function () {
                    deal_more_logic(list)
                })
            }
        }


        // 刷新好友列表
        var flashFriendsList = function (isFrist = false, callBack = null) {
            var localUserUid = LocalUserInfo.getObj().user_uid;
            // 通过rest接口获取好友列表数据
            RBChatRestHelper.showGroups_html(localUserUid, function (returnValue) {
                // 根据接口定义，返回不为空即表示认证成功
                if (!RBChatUtils.isStringEmpty(returnValue)) {
                    // 服务端返回的是一维RosterElementEntity对象数组
                    var rosterList = JSON.parse(returnValue)
                     common_friends_list = [].concat(rosterList);
                    if (rosterList) {
                        init_friend_ui(common_friends_list);
                        if (callBack) callBack();
                    }
                    else {
                        RBChatDialogHelper.showAlertDialog_WARN('提示', '当前没有共同群组信息');
                    }
                }
            }
                , function (errorThrownStr) {
                    RBChatDialogHelper.showAlertDialog_WARN('加载失败', '共同群组列表数据加载出错，可能是网络故障，请稍后再试！');
                }
            );
        }

        // 初始好友ui
        var init_friend_ui = function(show_list){
            show_list_size = show_list.length > PAGE_SIZE ? PAGE_SIZE: show_list.length;
            friendsListUI(show_list.slice(0,show_list_size), true)
            // 数据大于 长度，则创建更多
            if(show_list.length > PAGE_SIZE){
                create_more_ui(show_list)
            }
        }

        // 绘制共同群ui
        var friendsListUI = function (rosterList, isFrist = false) {
            const $d_dom = $('.container_list');
            var itemsHTML = ''

            for (var i = 0; i < rosterList.length; i++) {
                showDialogTitle = '共同的群';
                var entityData = rosterList[i];
                var friendUserId = entityData.friendUserId;
                var remark = entityData.remark ? entityData.remark : entityData.nickname;
                var num = entityData.num;
                const defaultColor = RBChatUtils.getBgColor(friendUserId)
                const show_t = remark.substr(0, 1).toUpperCase();
                itemsHTML +=
                    "<div gTag='group_send' class=\"group_dom\" nickname='" + remark + "' onickname='" + entityData.nickname + "' srcuid='" + friendUserId + "'  friendUserId='" + friendUserId + "' \>" +
                    "     <div class=\'group_dom_l\'>" +
                    "		<div class=\'avatar_source\'>" +
                    "          <div  class=\'img_group\' style='background:" + defaultColor + "'>" + show_t + " </div>" +
                    "		</div>" +
                    "     </div>" +
                    "     <div class=\'group_dom_r\'>" +
                    "         <div class=\'group_dom_l_r\'>" +
                    "             <span class=\'group_dom_l_r_t\'>" + remark + "</span>" +
                    "             <span class=\'group_dom_l_r_b\'>共有" + num + "个共同群</span>" +
                    "         </div>" +
                    "         <img class=\'group_dom_r_img\' src=\"./images/Chevron.png\">" +
                    "      </div>" +
                    "</div>"
            }

            if (!isFrist) {
                const d = $("div[gTag='group_send'");
                $(d[d.length - 1]).after(itemsHTML)
            } else {
                if($d_dom){
                    $d_dom.empty();
                }

                $d_dom.append(itemsHTML);
            }

            // 点击共同群列表
            $('.group_dom').click(function () {
                initWidthSomeOneUIGroup($(this).attr("srcuid"), $(this).attr("nickname"), $(this).attr("onickname"))
            })
        }


        // 初始与某人得共同群列表
        var initWidthSomeOneUIGroup = function (srcuid, nickname, onickname) {
            // 获取共同群组列表
            var localUserUid = LocalUserInfo.getObj().user_uid;
            // 通过rest接口获取好友列表数据
            RBChatRestHelper.showDesignatedFriend(localUserUid, srcuid, function (returnValue) {
                // 根据接口定义，返回不为空即表示认证成功
                if (!RBChatUtils.isStringEmpty(returnValue)) {
                    // 服务端返回的是一维RosterElementEntity对象数组
                    var rosterList = JSON.parse(returnValue)
                    if (rosterList) {
                        $('.container_box').css({ 'display': 'none' })
                        $('.group_dom_details_c').css({ 'display': 'block' })
                        $('#dialog-header-back-' + dialogId).show();
                        $('#dialog-header-title-' + dialogId).html(`我与${nickname}的共同群`)
                        // 显示详情
                        var listHTML = ''
                        var entityDatalength = rosterList.length
                        for (var i = 0; i < rosterList.length; i++) {
                            var entityData = rosterList[i];
                            var gId = entityData.gId;
                            var gName = entityData.gName;
                            const defaultColor = RBChatUtils.getBgColor(gId)
                            const show_t = gName.substr(0, 1).toUpperCase();
                            listHTML +=
                                "<div class=\"group_dom_details\" id='" + gId + "_" + srcuid + "_root'>" +
                                " <div>" +
                                "	 <div class=\'avatar_source\'>" +
                                "        <div  class=\'img_group_d\' style='background:" + defaultColor + "'>" + show_t + " </div>" +
                                "	 </div>" +
                                "    <span class=\"details_name\">" + gName + "</span>" +
                                " </div>" +
                                "  <div class='details_bt' id_flag='" + gId + "_" + srcuid + "_" + onickname + "'>踢出群</div>" +
                                " </div>"
                        }
                        listHTML += `<div class="details_num">${entityDatalength}个群组</div>`
                        $('.group_dom_details_list').empty();
                        $('.group_dom_details_list').html(listHTML)
                        //添加踢出群事件
                        $(".details_bt").click(function () {
                            const flag = $(this).attr('id_flag');
                            const l = flag.split('_');
                            var localUser = LocalUserInfo.getObj();
                            // 发送接口
                            RBChatRestHelper.submitDeleteOrQuitGroupToServer(localUser.user_uid, localUser.nickname, l[0], [l], function (returnValue) {
                                if (returnValue && '1' == returnValue) {
                                    $('#' + l[0] + '_' + l[1] + '_root').remove();
                                    $('.details_num').text(($('.group_dom_details_list').children().length - 1) + "个群组")
                                    // 重新刷新共同群列表
                                    flashFriendsList(true);

                                } else {
                                    alert('操作失败,请重试')
                                }

                            }, function () {
                                alert('操作失败,请重试')
                            })

                        })
                    }
                    else {
                        RBChatDialogHelper.showAlertDialog_WARN('提示', '当前没有指定好友拥有的共同群');
                    }
                }
            }
                , function (errorThrownStr) {
                    RBChatDialogHelper.showAlertDialog_WARN('加载失败', '查询和指定好友拥有的共同群列表数据加载出错，可能是网络故障，请稍后再试！');
                }
            );
        }

        // 初始基本事件
        var initEvents = function () {
            //添加返回按钮
            $('#dialog-header-title-' + dialogId).before("<h4><img src='images/im_b_img/left_jt_3.png' id='dialog-header-back-" + dialogId + "'  style='display:none;width:20px;height:20px; margin-right:15px;margin-top:13px' /></h4>")
            // 添加点击事件
            $('#dialog-header-back-' + dialogId).click(function () {
                $('.group_dom_details_c').css({ 'display': 'none' })
                $('.container_box').css({ 'display': 'block' })
                $('#dialog-header-title-' + dialogId).html(`共同的群`)
                $('#dialog-header-back-' + dialogId).hide();
            })
            // 搜索框点击
            $('.search_n').click(function () {
                var _index = $(this).index();
                $('.search_y').css({ 'display': 'block' })
                $('.search_n').css({ 'display': 'none' })
                $('#focus_d').val('')
                $('#focus_d').focus()
            })
            $('#cancel_d').click(function () {
                $('.search_y').css({ 'display': 'none' })
                $('.search_n').css({ 'display': 'flex' })
                $('.group_dom').css('display', 'flex')
            })
            // 搜索
            $('#focus_d').on('input propertychange', function (e) {
                const inputVal = $(this).val();
                if (!inputVal || inputVal.length == 0) {
                    init_friend_ui(common_friends_list);
                } else {
                    const show_list = common_friends_list.filter(item=> item.nickname && item.nickname.toLowerCase().indexOf(inputVal.toLowerCase())!=-1 ||  item.remark && item.remark.toLowerCase().indexOf(inputVal.toLowerCase())!=-1 || item.friendUserId && item.friendUserId.indexOf(inputVal) > -1);
                    console.log('show_list',show_list)
                    if(show_list.length > 0){
                        init_friend_ui(show_list);
                    }else{
                        const $d_dom = $('.container_list');
                        $d_dom.empty();
                    }
                }
            });
        }

        var bodyHTML =
        "<div class=\"container_box\">" +
        "    <div class=\"search_d\">" +
        "        <div class=\"search_n\">" +
        "            <img src=\"images/im_b_img/sea_3.png\">" +
        "           <span>搜索</span>" +
        "        </div>" +
        "        <div class=\"search_y\">" +
        "            <input id=\"focus_d\" type=\"text\" placeholder=\"请输入...\">" +
        "            <span id=\"cancel_d\">取消</span>" +
        "         </div>" +
        "     </div>" +
        "      <div class=\"container_list\">" + '' + "</div>" +
        "   </div>" +
        "   <div class=\"group_dom_details_c\" style=\"display: none\">" +
        "    <div class=\"group_dom_details_list\">" +
        "    </div>" +
        "   </div>"
    that.showDialog(
        showDialogTitle
        , "取消"
        , "保存"
        , bodyHTML
        , dialogId
        , null
        , null
        , false
        , "min-width: 375px; max-height:800px;height:800px;"
        , "min-width: 375px; max-height:800px;height:800px;overflow: unset !important;"
        , false
        , false);


        flashFriendsList(true, function () {
            initEvents();
        });

    };


    /**
   * 取消所有item的选中（状态）。
   */
    UIModule7.prototype.unSelectedAllItem = function () {
        // 所有的item
        var itemList = $('#im-group-member-list-content').children();
        // 遍历每一个item
        for (var i = 0; i < itemList.length; i++) {
            var item = itemList[i];
            // 取出uid值
            var srcUid = itemObj.attr('srcuid');
            if (item && srcUid) {
                var itemObj = $(item);
                // 清除选中状态
                this.selectedOneItem(srcUid, false);
            }
        }
    };

    UIModule7.prototype.getSelectedItemsSimple = function () {

        var items = new Array();

        // 所有的item
        var itemList = $('#im-group-member-list-content').children();
        // 遍历每一个item
        for (var i = 0; i < itemList.length; i++) {
            var item = itemList[i];
            if (item) {
                var itemObj = $(item);
                var isSelected = (itemObj.attr('isselected') == '1');

                // 如果该item是“选中”的
                if (isSelected) {
                    // 取出uid值
                    var srcUid = itemObj.attr('srcuid');
                    var nickname = $('#im-group-member_li_nickname_' + srcUid).text();
                    var utype = itemObj.attr('utype');
                    // 数组
                    var row = new Array();
                    row.push(srcUid);
                    row.push(nickname);
                    row.push(utype);

                    items.push(row);
                }
            }
        }

        return items;
    };

    /**
     * 设定一个item为选中状态。
     *
     * @param uid
     * @param toSelected
     */
    UIModule7.prototype.selectedOneItem = function (uid, toSelected, item = {}) {

        var itemObj = $('#im-group-member_li_' + uid);
        if (itemObj) {
            // 设置选中状态的属性值
            itemObj.attr('isselected', toSelected ? '1' : '0');
            // 重置checkbox的ui显示
            var checkboxObj = $('#im-group-member_li_checkbox_' + uid);
            // 先清除所有class
            checkboxObj.removeClass();
            // 再设置class（选中或未选中状态的class样式）
            checkboxObj.addClass(toSelected ? 'weui-icon-success' : 'weui-icon-circle');
        }

        // 添加到选中框
        var user_uid = uid;
        var nickname = item.nickNameWithRemark
        const defaultColor = RBChatUtils.getBgColor(user_uid)
        const show_t = nickname.substr(0, 1).toUpperCase();
        var select_html = "<div class=\'avatar-source human\' id='select-img-uid-" + user_uid + "' style='margin-left: 10px'>" +
            "                 <div style='background:" + defaultColor + "'>" + show_t + " </div>" +
            "			<img onerror='javascript:$(this).remove()'  id=\'im-group-member_li_avartarimg_" + user_uid + "\' srcuid=\'" + user_uid + "\' style=\'z-index: 99;\' src=\'" + RBChatUtils.getUserAvatarDownloadURL(user_uid, true) + "\'>" +
            "		</div>"
        if (toSelected) {
            if ($('#members-select-div').children().length < 50)
                $('#members-select-div').append(select_html)
        } else {
            $("#select-img-uid-" + user_uid).remove()
        }
    };

    /**
   * 设定一个item为选中状态。
   *
   * @param uid
   * @param toSelected
   */
    UIModule7.prototype.flash_choice_ui = function (list) {
        var count = list.filter(item => item.selected).length;
        $('#select-name-txt-show').text("选择了 " + count + ' 好友:')
        count > 0 ? $('#merbers-select-root').show() : $('#merbers-select-root').hide();
    }


    /**
   * 设定一个item为选中状态。
   *
   * @param uid
   * @param toSelected
   */
    UIModule7.prototype.selectedOneItem2 = function (uid, toSelected) {

        var itemObj = $('#im-group-member_li_' + uid);
        // 设置选中状态的属性值
        itemObj.attr('isselected', toSelected ? '1' : '0');
        var nickname = itemObj.attr('nickname');
        // 重置checkbox的ui显示
        var checkboxObj = $('#im-group-member_li_checkbox_' + uid);
        // 先清除所有class
        checkboxObj.removeClass();
        // 再设置class（选中或未选中状态的class样式）
        checkboxObj.addClass(toSelected ? 'weui-icon-success' : 'weui-icon-circle');

        // 添加到选中框
        var user_uid = uid;
        const defaultColor = RBChatUtils.getBgColor(user_uid)
        const show_t = nickname.substr(0, 1).toUpperCase();
        var select_html = "<div class=\'avatar-source human\' id='select-img-uid-" + user_uid + "' style='margin-left: 10px'>" +
            "                 <div style='background:" + defaultColor + "'>" + show_t + " </div>" +
            "			<img onerror='javascript:$(this).remove()'  id=\'im-group-member_li_avartarimg_" + user_uid + "\' srcuid=\'" + user_uid + "\' style=\'z-index: 99;\' src=\'" + RBChatUtils.getUserAvatarDownloadURL(user_uid, true) + "\'>" +
            "		</div>"
        toSelected ? $('#members-select-div').append(select_html) : $("#select-img-uid-" + user_uid).remove()

        var count = $('#members-select-div').children().length;

        $('#select-name-txt-show').text("选择了 " + count + ' 会话:')

        count > 0 ? $('#merbers-select-root').show() : $('#merbers-select-root').hide();

    };

    /**
     * 展示置顶信息
     */
    UIModule7.prototype.showTopMsgUI = function () {
        var that = this;
        var dialogId = that.nextDialogId();
        const title = window.top_msg_list.length + '置顶消息'
        var fn_submitCallback = function () {
            // 删除置顶消息
            var groupId = ''
            var beyongDataId = window.openBeyongDataId;
            // 群与人区分
            if (window.openGroupChattingType) {
                groupId = beyongDataId
            } else {
                var myId = LocalUserInfo.getUid()
                groupId = beyongDataId - myId > 0 ? myId + '_' + beyongDataId : beyongDataId + '_' + myId
            }
            // 查询置顶消息
            RBChatRestHelper.cancle_all_msg_top({
                groupId: groupId,
            }, function (returnValue) {
                that.closeDialog(dialogId)
                RBChatChattingContentPaneUI.init_msg_top_ui()
            }, function () { })
        }

        var bodyHTML = "<div class='chat-box chat-style1 top-msg-ui-dialog' id='top-msg-ui-dialog'></div>"
        // 显示对话框
        that.showDialog(title
            , "取消"
            , "解除所有" + title
            , bodyHTML
            , dialogId
            , null
            , fn_submitCallback
            , true
            , "min-width: 500px;min-height:600px"
            , null
            , false
            , false);

        const content_dom = $('#top-msg-ui-dialog')
        for (const item of window.top_msg_list) {
            const obj = JSON.parse(item[0])
            RBChatChattingContentPaneUI.insertChatItem2(obj, content_dom, item[2])
        }

    }

    /**
     * 显示详情详情
     * @param {*} key 
     */
    UIModule7.prototype.showTaskDetail = function (key) {
        var that = this;
        var dialogId = that.nextDialogId();
        // 初始数据
        var req_data = function () {
            $.ajax({
                url: "https://oss.nongzhiw.cn/" + key,
                type: "GET",
                success: function (data) {  //括号里的data是服务器返回的数据
                    $('#task-content-detail').append(data)
                }
            });
        }

        var bodyHTML = "<div class='task-wh-root' id='task-wh-root'>" +
            "<div class='task-content' id='task-content-detail'></div>" +
            "</div>"

        this.showDialog("任务描述"
            , "取消"
            , "下一步"
            , bodyHTML
            , dialogId
            , null
            , null
            , false
            , "min-width: 500px;min-height:700px;"
            , "max-height:700px"
            , false
            , false);


        req_data()

    }

    /**
     * 显示自动加群配置
     */
    UIModule7.prototype.showAutoAddGroupDialog = function () {
        var that = this;
        var dialogId = that.nextDialogId();
        window.auto_groups = {};
        var select = 0;

        window.shoaAddGroup = function () {
            that.showAddGroupDialog(select - 0 == 0 ? '新增VIP群' : '新增非VIP群', select - 0);
        }

        // 初始数据
        window.show_auto_add_group_req_data = function () {
            RBChatRestHelper.query_auto_group({
                adminId: LocalUserInfo.getUid()
            }, function (returnValue) {
                // 根据接口定义，返回不为空即表示认证成功
                if (!RBChatUtils.isStringEmpty(returnValue)) {
                    var groups = JSON.parse(returnValue)
                    window.auto_groups = groups;
                    var showList = select == 0 ? groups.vipGroupList : groups.noVipGroupList;
                    if (showList && showList.length > 0) {
                        init_list_UI(showList);
                    } else {
                        $('#task-content').empty();
                        $('#task-content').append('该列表还没有群')
                    }
                }
            }
                , function (errorThrownStr) {
                }
            );
        }

        // 初始ui
        var init_list_UI = function (list) {
            //列表
            $('#task-content').empty();
            if (list.length > 0) {
                var c_html = ''
                for (var i = 0; i < list.length; i++) {
                    var item = list[i];
                    var friendUserId = item[0];
                    var remark = item[1]
                    const defaultColor = RBChatUtils.getBgColor(friendUserId)
                    const show_t = remark.substr(0, 1).toUpperCase();
                    c_html +=
                        "<div class=\"group_dom\" nickname='" + remark + "'  srcuid='" + friendUserId + "' style='border-bottom: 1px solid rgba(0,0,0,0.2);' \>" +
                        "     <div class=\'group_dom_l\'>" +
                        "		<div class=\'avatar_source\'>" +
                        "          <div  class=\'img_group\' style='background:" + defaultColor + "'>" + show_t + " </div>" +
                        "         <img onerror='javascript:$(this).remove()'  style='z-index: 99;' class=\'img_group\' src=\'" + RBChatUtils.getUserAvatarDownloadURL(friendUserId, true) + "\'>" +
                        "		</div>" +
                        "     </div>" +
                        "     <div class=\'group_dom_r\'>" +
                        "         <div class=\'group_dom_l_r\'>" +
                        "             <span class=\'group_dom_l_r_t\'>" + remark + "</span>" +
                        "             <span class=\'group_dom_l_r_b\'>群ID：" + friendUserId + "</span>" +
                        "         </div>" +
                        "      </div>" +
                        "</div>"
                }

                $('#task-content').append(c_html)
            } else {
                $('#task-content').append('当前没有群！')
            }
        }


        var nav_html = '<nav class="kchat-im-panel-userlist-nav task-nav">' +
            '<a  tabident="0" class="active" title="">VIP群</i></a>' +
            '<a  tabident="1" class="" title="已完成">非VIP群</a>' +
            '</nav>'
        var add_html = "<div class='add-group'> <a href='javascript:void(0)' onclick='javascript:shoaAddGroup()'>新增群<a/></div>"

        var bodyHTML = "<div class='task-wh-root' id='task-wh-root'>" +
            add_html +
            nav_html +
            "<div class='task-content' id='task-content'></div>" +
            "</div>"

        that.showDialog("自动加群配置"
            , "取消"
            , "下一步"
            , bodyHTML
            , dialogId
            , null
            , null
            , false
            , "min-width: 500px;min-height:800px;"
            , "max-height:800px"
            , false
            , false);

        var $allUserListTabs = $('nav.task-nav a');
        for (var i = 0; i < $allUserListTabs.length; i++) {
            var $tabCell = $($allUserListTabs[i]);
            $tabCell.click(function () {
                $allUserListTabs.removeClass('active');
                $(this).addClass('active');
                var tabident = $(this).attr('tabident');
                $('#task-content').empty();
                select = tabident - 0;
                window.show_auto_add_group_req_data();
            })
        }

        window.show_auto_add_group_req_data();
    }

    /**
     * 显示任务列表
     */
    UIModule7.prototype.showTaskDialog = function () {
        var that = this;
        var dialogId = that.nextDialogId();

        window.seeTaskDetail = function (key) {
            that.showTaskDetail(key)
        }
        var params = {
            userUid: LocalUserInfo.getUid(),
            taskStatus: '0',
            pageNo: 1,
            pageSize: 20,
        }
        var initPage = function (data) {
            var options = {
                dataTotal: data.total,	//数据总数
                pageSize: params.pageSize,	//每页显示数
                btnNum: 8,		//分页按钮显示数
                current: params.pageNo		//当前页
            };
            $('#page').pagebar(options, function (params) {
                params.pageNo = params.curPage;
                req_data();
            }); //调用插件

        }

        // 初始数据
        var req_data = function () {
            $.ajax({
                url: "https://crm.shuoqiudi100.com/api/api/getTaskListByPage",
                type: "GET",
                data: params, //必须是字符串格式
                dataType: 'json',
                success: function (data) {  //括号里的data是服务器返回的数据
                    if (data.code - 0 == 0) {
                        init_list_UI(data.data);
                    } else {
                        $('#task-content').empty();
                        $('#task-content').append(data.msg)
                    }
                }
            });
        }

        /**
         *  获得状态时间
         * @param {*} status 
         */
        var getStatus = function (status) {
            if (status - 0 == 0) {
                return '<font color=red>未完成</font>'
            }
            if (status - 0 == 1) {
                return '<font color=green>已完成</font>'
            }
            if (status - 0 == 2) {
                return '<font color=gray>已取消</font>'
            }
            return ''
        }

        // 初始ui
        var init_list_UI = function (data) {
            //列表
            $('#task-content').empty();
            $('#page').empty();
            var list = data.list;
            if (list.length > 0) {
                var c_html = ''
                for (var i = 0; i < list.length; i++) {
                    var item = list[i];
                    var item_html = "<div class='task-content-item'>" +
                        "<div class='t-row'><div class='t-col'>派发任务人：" + item.fromAdmin + "</div><div class='t-col'>指定任务人：" + item.toAdmin + "</div></div>" +
                        "<div class='t-row'><div class='t-col'>创建时间：" + item.createDate + "</div><div class='t-col'>修改时间：" + (item.updateDate ? item.updateDate : '') + "</div></div>" +
                        "<div class='t-row'><div class='t-col'>应完成时间：" + item.finishTimeY + "</div><div class='t-col'>实际完成时间：" + (item.finishTimeS ? item.finishTimeS : '') + "</div></div>" +
                        "<div class='t-row'><div class='t-col'>任务状态：" + getStatus(item.taskStatus) + "</div></div>" +
                        "<div class='t-row'><div class='t-col'>任务描述：<a href='javascript:void(0)' onclick='javascript:seeTaskDetail(\"" + item.taskContext + "\")'>查看</a></div></div>" +
                        "</div>"
                    c_html += item_html;
                }

                $('#task-content').append(c_html)
                initPage(data)
            } else {
                $('#task-content').append('当前没有任务！')
            }
        }


        var nav_html = '<nav class="kchat-im-panel-userlist-nav task-nav">' +
            '<a  tabident="0" class="active" title="未完成">未完成</i></a>' +
            '<a  tabident="1" class="" title="已完成">已完成</a>' +
            '<a  tabident="2" class="" title="已取消">已取消</a>' +
            '</nav>'

        var bodyHTML = "<div class='task-wh-root' id='task-wh-root'>" +
            nav_html +
            "<div class='task-content' id='task-content'></div>" +
            "<div id='page'></div>" +
            "</div>"

        that.showDialog("任务列表"
            , "取消"
            , "下一步"
            , bodyHTML
            , dialogId
            , null
            , null
            , false
            , "min-width: 800px;min-height:800px;"
            , "max-height:800px"
            , false
            , false);

        var $allUserListTabs = $('nav.task-nav a');
        for (var i = 0; i < $allUserListTabs.length; i++) {
            var $tabCell = $($allUserListTabs[i]);
            $tabCell.click(function () {
                $allUserListTabs.removeClass('active');
                $(this).addClass('active');
                var tabident = $(this).attr('tabident');
                $('#task-content').empty();
                params.taskStatus = tabident;
                params.pageNo = 1;
                req_data();
            })
        }

        req_data();
    }

    /**
     * 维护客户
     */
    UIModule7.prototype.showWeiHuDialog = function () {
        var that = this;
        var dialogId = that.nextDialogId();

        const select_1 = [{ l: '全部', v: '' }, { l: '是', v: '1' }, { l: '否', v: '0' }]
        const select_2 = [{ l: '全部', v: '' }].concat(RBChatUtils.leveNameList())
        const select_3 = [{ l: '全部', v: '' }, { l: '是', v: '1' }, { l: '否', v: '2' }]
        const select_5 = [{ l: '全部', v: '' }, { l: '是', v: '0' }, { l: '否', v: '1' }]

        // 分组
        let select_4 = [{ l: '全部', v: '' }]

        // 搜索用户列表
        let search_user_list = [];
        const PAGE_SIZE = 50;
        var that = this;

        // 初始事件
        var initEvent = function () {
            // 群发短信
            window.sendMuchSMSMsg = function () {
                const list = search_user_list.filter(item => item.selected);
                if (list && list.length > 0) {
                    that.showSendMsgForm(list.map(item => item.user_uid).join(','), list.length > 1, list.length > 1 ? '向' + list.length + '个好友群发短信' : '')
                } else {
                    alert('请选择需要发送得用户!')
                }
            }

            // 群发消息
            window.sendMuchMsg = function () {
                const list = search_user_list.filter(item => item.selected)
                if (list && list.length > 0) {
                    that.showSendMsgForm2(list.map(item => item.user_uid), list.length > 1, list.length > 1 ? '向' + list.length + '个好友群发消息' : '')
                } else {
                    alert('请选择需要发送得用户!')
                }
            }

            // 全选或者取消
            window.choiceAllSelect = function (type) {
                //全选  修改ui及
                if (type - 0 == 1) {
                    $("#kehu-wh-root input[type='checkbox']").attr('checked', true)
                    // 反选
                } else {
                    $("#kehu-wh-root input[type='checkbox']").attr('checked', false)
                }
                if (search_user_list && search_user_list.length > 0) {
                    search_user_list.forEach(item => {
                        item.selected = type - 0 == 1
                    })
                }
            }

            // 查询
            window.queryKh = function () {
                $('.k-w').hide();
                $('.k-l').show();
                // 获取选中的参数
                const q_onlie_status = $('#q_onlie_status').val();
                const q_m_status = $('#q_m_status').val();
                const q_m_level = $('#q_m_level').val();
                const q_n_date = $('#q_n_date').val();
                const q_n_nick = $('#q_n_nick').val();
                const q_n_id = $('#q_n_id').val();
                const q_belong_group = $('#q_belong_group').val();
                const q_weihu = $('#q_weihu').val();
                const params = {};
                if (q_onlie_status && q_onlie_status.length > 0) {
                    params['isOnline'] = q_onlie_status
                }
                if (q_m_status && q_m_status.length > 0) {
                    params['isVip'] = q_m_status
                }
                if (q_m_level && q_m_level.length > 0) {
                    params['uedLevel'] = q_m_level
                }
                if (q_n_date && q_n_date.length > 0) {
                    params['noRechargeDay'] = q_n_date
                }
                if (q_n_nick && q_n_nick.length > 0) {
                    params['nickname'] = q_n_nick
                }
                if (q_n_id && q_n_id.length > 0) {
                    params['friendUserId'] = q_n_id
                }
                if (q_belong_group && q_belong_group.length > 0) {
                    params['groupId'] = q_belong_group
                }
                if (q_weihu && q_weihu.length > 0) {
                    params['protectFlag'] = q_weihu
                }
                // 查询接口
                reqData(params)
            }

            // 查询一个月未登录UED会员
            window.queryMonthNoLogin = function(){
                $('.k-w').show();
                $('.k-l').hide();
                RBChatRestHelper.query_month_no_login_width_vip(function (res) {
                    const obj_list = JSON.parse(res);
                    search_user_list = [];
                    for(item of obj_list){
                        search_user_list.push(
                            {
                                user_uid:item[0],
                                nickNameWithRemark:item[1],
                                isUEDFunc: true,
                                data:item,

                            }
                        );
                    }
                    // console.log(search_user_list)
                    init_ui();
                    initEvent();
                });
            }

            // 群加好友
            window.groupAddFriend = function(){
                const list = search_user_list.filter(item => item.selected);
                if (list && list.length > 0) {
                    const ids = list.map(item=> item.user_uid).join(',');
                    RBChatRestHelper.batch_add_freind(ids,function(res){
                        window.queryMonthNoLogin();
                        alert(res?'好友添加成功':'好友添加失败');
                        RBChatRosterUI.deal_fen_local_to_last(function(){
                            RBChatRosterUI.countGroupUI();
                        })
                    });
                } else {
                    alert('请选择需要加好友的用户!')
                }
            }

            // 去聊天
            window.go2Chat = function (srcUid, reqUserNickname) {
                that.closeDialog(dialogId);
                var alarmMessageDTO = AlarmsProvider.createChatMessageAlarm(
                    MsgType.TYPE_TEXT, "现在开始发起聊天吧吧.", reqUserNickname, srcUid, 0);
                RBChatAlarmsUI.insertOrUpdate(alarmMessageDTO, true, true);
                RBChatAlarmsUI.selectedItem(4, srcUid);
            }
        }

        /**
         * 获取下拉选择框
         * @param {*} list 
         * @param {*} tag 
         * @param {*} id 
         * @returns 
         */
        var getSelectUI = function (list, tag, id = '') {
            var html = "<span>" + tag + "</span><select id='" + id + "'>"
            list.forEach(item => {
                html = html + "<option value='" + item.v + "'>" + item.l + "</option>"
            })
            return html + "</select>"
        }

        /**
         * 获取文本输入框
         * @param {*} tag 
         * @param {*} phoderTxt 
         * @param {*} id 
         * @returns 
         */
        var getInputUI = function (tag, phoderTxt, id = '') {
            var html = '<span>' + tag + '</span>' + "<input id='" + id + "' type='text' placeholder='" + phoderTxt + "'/>"
            return html
        }

        /**
         * 获取每一条搜索记录ui
         */
        var getItemUI = function (item) {
            const userId = item.user_uid;
            const nickName = item.nickNameWithRemark ? item.nickNameWithRemark : item.nickname
            const defaultColor = RBChatUtils.getBgColor(userId)
            const show_t = nickName && nickName.lenght > 0 ? nickName.substr(0, 1).toUpperCase():'';
            let l_html = ''
            let m_html = ''
            let n_html = ''
            let s_html = ''
            // const y_html = ' <span>群管：<font color=black>'+(item.uedMoney && item.uedMoney - 0 > 0?'0':+ RBChatUtils.formatMoney(item.uedMoney))+'</font></span>'
            if(item.isUEDFunc){
                l_html = ' <span><font color=black>' + (item.data[2] - 1 == 0 ? '在线' : item.data[5]  + 'UED下线') + '</font></span>'
                m_html = ' <span>会员等级:<font color=black> ' + (RBChatUtils.leveName(item.data[6]) ) + '</font></span>'
                n_html = ' <span>UED账号:<font color=black> ' + item.data[4]+ '</font></span>'
                s_html = ' <span>UED充值总金额:<font color=black>' + item.data[7]+'</font></span>'
            }else{
                l_html = ' <span><font color=black>' + (item.online ? '在线' : RBChatUtils.dateDiff2(item.latestOfflineTime) + '前在线') + '</font></span>'
                m_html = ' <span><font color=black>' + (item.uedLevel > -1 ? RBChatUtils.leveName(item.uedLevel) : '非会员') + '</font></span>'
                n_html = ' <span><font color=black>' + ((item.uedLastRechargeDate && item.uedLastRechargeDate.length > 0 ? RBChatUtils.dateDiff2(item.uedLastRechargeDate) : '0天')) + '</font>未存款</span>'
                s_html = ' <span<font color=black>' + (item.uedMoney && item.uedMoney - 0 > 0 ? '0' : RBChatUtils.formatMoney(item.uedMoney)) + '</font> 总存款</span>'
            }

            let itemsHTML = " <div class='kehu-wh-root-ruser-item' gTag='group_send'>"
            itemsHTML += '<input  type="checkbox" value="" ' + (item.selected ? 'checked' : '') + ' srcuid=\'' + userId + '\'/>'
            // 人员信息
            itemsHTML += "<div class=\"group_dom\"  srcuid='" + userId + "'  \>" +
                "     <div class=\'group_dom_l\'>" +
                "		<div class=\'avatar_source\'>" +
                "          <div  class=\'img_group\' style='background:" + defaultColor + "'>" + show_t + " </div>" +
                "		</div>" +
                "     </div>" +
                "     <div class=\'group_dom_r\'>" +
                "         <div class=\'group_dom_l_r\'>" +
                "             <span class=\'group_dom_l_r_t\'>" + (item.protectFlag - 0 == 0 ? "<span class=\'user-weihu\' title=\'维护\'>维</span>" : "") + nickName + "</span>" +
                "             <span class=\'group_dom_l_r_b\'>uid:" + userId + (item.lastBit ? item.lastBit : '') + "</span>" +
                "         </div>" +
                "      </div>" +
                "</div>"
            //ued及其他信息
            itemsHTML += "<div class='kh-user-ued'> " + l_html + m_html + n_html + s_html + "</div>"
            // 功能区域
            itemsHTML += "<div class='kehu-wh-root-item-right'><a class='kehu-wh-root-bt' href='javascript:void(0)' onclick='javascript:go2Chat(" + userId + ",\"" + nickName + "\")'>去聊天</a> <a class='kehu-wh-root-bt' href='javascript:void(0)' onclick='javascript: RBChatDialogHelper.showSendMsgForm(" + userId + ")'>发短信</a></div>"
            itemsHTML += '</div>'
            return itemsHTML
        }

        // 绘制好友
        var show_list = function (list, isFrist = true) {
            var itemsHTML = ''
            for (var i = 0; i < list.length; i++) {
                itemsHTML += getItemUI(list[i])
            }
            if (isFrist) {
                $('#kehu-wh-root-content').append(itemsHTML)
            } else {
                const d = $("div[gTag='group_send'");
                $(d[d.length - 1]).after(itemsHTML)
            }

            $("#kehu-wh-root input[type='checkbox']").off('change').on("change", function () {
                let choice = $(this).attr("checked") == "checked";
                if (search_user_list && search_user_list.length > 0) {
                    search_user_list.forEach(item => {
                        if (item.user_uid == $(this).attr("srcuid")) {
                            item.selected = choice;
                        }
                    })
                }
            });
        }

        // 处理点击加载
        var deal_more_logic = function () {
            var that = this;
            // 移除更多
            const remove_more = function () {
                const d = $("div[gTag='group_send_more']");
                if (d) {
                    d.remove();
                }
            }
            //获取当前显示好友的数量
            const c_len = $("div[gTag='group_send']") ? $("div[gTag='group_send']").length : 0;
            var end = 0;
            // 加载数据
            if (c_len < search_user_list.length) {
                end = c_len + PAGE_SIZE;
                // 还没有加载完数据
                if (end < search_user_list.length) {
                    //加载数据
                    const _list = search_user_list.slice(c_len, end)
                    show_list(_list.reverse(), false)
                } else {
                    end = search_user_list.length - 1;
                    //加载数据
                    const _list = search_user_list.slice(c_len, end)
                    show_list(_list.reverse(), false)
                    remove_more();
                }
            } else {
                remove_more();
            }
        }

        // 创建加载更多
        var create_more_ui = function (list) {
            const group_html = "<div class='rstore-friend-group-more' gTag='group_send_more'  id='groupsend-more'><span>查看更多</span></div>";
            const d = $("div[gTag='group_send'");
            if (d) {
                $(d[d.length - 1]).after(group_html)
                // 添加点击事件
                $("#groupsend-more").click(function () {
                    deal_more_logic(list)
                })
            }
        }

        // 初始ui显示
        var init_ui = function () {
            $("#kehu-wh-root-content").empty();
            $("div[gTag='group_send_more'").remove();
            if (search_user_list.length > 0) {
                $('#kehu-wh-root-content-count').text(search_user_list.length + '条查询结果');
                const c_len = search_user_list.length > PAGE_SIZE ? PAGE_SIZE : search_user_list.length
                show_list(search_user_list.slice(0, c_len));

                // 创建更多
                if (search_user_list.length > PAGE_SIZE) {
                    create_more_ui(search_user_list)
                }
            } else {
                $('#kehu-wh-root-content-count').text('0条查询结果');
            }

        }

        //接口请求
        var reqData = function (params) {
            RBChatRestHelper.kehuToServer(params, function (returnValue) {
                const list = JSON.parse(returnValue);
                search_user_list = JSON.parse(returnValue);
                // console.log('search_user_list', search_user_list)
                init_ui();
                initEvent();


            }, function (errorThrownStr) {

            });
        }


        RBChatRestHelper.queryFenzu(
            // 数据读取成功后的回调
            function (returnValue) {
                if (returnValue) {
                    const server_group_list = returnValue ? JSON.parse(returnValue) : [];
                    const list = server_group_list.map(item => {
                        return {
                            v: item[0],
                            l: item[1],
                        }
                    });
                    select_4 = select_4.concat(list);
                }
                var bodyHTML = "<div class='kehu-wh-root' id='kehu-wh-root'>" +
                    "  <div class='row k-l'> <div class='item'>" + getSelectUI(select_1, '在线：', 'q_onlie_status') + "</div> <div class='item'>" + getSelectUI(select_3, '会员：', 'q_m_status') + "</div>  <div class='item'>" + getSelectUI(select_2, '会员等级：', 'q_m_level') + "</div> </div>" +
                    "  <div class='row k-l'> <div class='item'>" + getSelectUI(select_4, '所属分组：', 'q_belong_group') + "</div> <div class='item'>" + getSelectUI(select_5, '需要维护：', 'q_weihu') + "</div>  <div class='item'></div> </div>" +

                    "  <div class='row k-l'> <div class='item'>" + getInputUI('未存款天数：', '', 'q_n_date') + "</div> <div class='item'>" + getInputUI('用户昵称：', '', 'q_n_nick') + "</div> <div class='item'>" + getInputUI('用户id：', '', 'q_n_id') + "</div> </div>" +
                    "  <div class='row'><div class='item'><a class='kehu-wh-root-bt' href='javascript:void(0)' onclick='javascript:choiceAllSelect(1)'>全选</a> <a class='kehu-wh-root-bt' href='javascript:void(0)'  onclick='javascript:choiceAllSelect(0)'>取消</a> <a class='kehu-wh-root-bt k-l' href='javascript:void(0)'  onclick='javascript:sendMuchSMSMsg()'>群发短信</a> <a class='kehu-wh-root-bt k-l' href='javascript:void(0)'  onclick='javascript:sendMuchMsg()'>群发消息</a> <a class='kehu-wh-root-bt k-w' href='javascript:void(0)' onclick='javascript:groupAddFriend()'>群加好友</a> </div><div class='item'></div><div class='item t-right'><button onclick='javascript:queryMonthNoLogin()' style='margin-right:10px'>查询一月未登录UED会员</button><button onclick='javascript:queryKh()'>查询</button></div> </div>" +
                    "  <div class='row' id='kehu-wh-root-content-count'> </div>" +
                    "  <div class='kehu-wh-root kehu-wh-root-content' id='kehu-wh-root-content'> " +

                    "  </div>" +
                    "</div>"

                that.showDialog("客户维护"
                    , "取消"
                    , "下一步"
                    , bodyHTML
                    , dialogId
                    , null
                    , null
                    , false
                    , "min-width: 800px;min-height:800px;"
                    , "max-height:800px"
                    , false
                    , false);
                $('.k-w').hide();
                // 接口请求, 做事件处理
                reqData({});

            }, function () { });

    }

    /**
   * 群发助手
   */
    UIModule7.prototype.showGroupMsgSendDialog = function () {
        var that = this;
        var dialogId = that.nextDialogId();
        // 每页显示50
        const PAGE_SIZE = 50;
        var groupMemberEntitys = null;

        var fn_clickItem = function (event) {
            // 取出uid值
            var srcUid = $(this).attr('srcuid');
            // 该行item所对应的返回数据中的数组索引
            var dataIndex = $(this).attr('dataIndex');
            var isSelectedValue = $(this).attr('isselected');
            var isSelected = (isSelectedValue == '1' ? true : false);

            const item = groupMemberEntitys.find(item => item.user_uid == srcUid)
            item.selected = !isSelected

            if (srcUid) {
                that.selectedOneItem(srcUid, !isSelected, item);
            }
            that.flash_choice_ui(groupMemberEntitys)
            // 阻止事件继续冒泡
            event.stopPropagation();
        };

        // 初始ui显示
        var init_friends_ui = function () {
            $("li[gTag='group_send'").remove();
            $("div[gTag='group_send_more'").remove();
            const c_len = groupMemberEntitys.length > PAGE_SIZE ? PAGE_SIZE : groupMemberEntitys.length
            show_list(groupMemberEntitys.slice(0, c_len));

            // 创建更多
            if (groupMemberEntitys.length > PAGE_SIZE) {
                create_more_ui(groupMemberEntitys)
            }
        }

        // 绘制好友
        var show_list = function (groupMemberEntitys, isFrist = true) {
            var itemsHTML = ''
            for (var i = 0; i < groupMemberEntitys.length; i++) {
                var entityData = groupMemberEntitys[i];
                // 用户id
                var user_uid = entityData.user_uid;
                // 用户昵称
                var nickname = entityData.nickNameWithRemark;;
                // 本字段仅用于客户端UI界面使用，与服务端无关。表示UI界面上的选中情况。
                var selected = entityData.selected;

                // true表示item里将显示checkbox，否则不显示
                var itemShowCheckBox = true;

                // 如果是“我”则显示“我”标签
                const defaultColor = RBChatUtils.getBgColor(user_uid)
                const show_t = nickname.substr(0, 1).toUpperCase();

                // 将每一个item的html拼接起来
                itemsHTML +=
                    "<li style=\'cursor: pointer;\' gTag='group_send' id=\'im-group-member_li_" + user_uid + "\' srcuid=\'" + user_uid + "\' nickname='" + nickname + "' dataindex=\'" + i + "\' isselected=\'" + (selected ? "1" : "0") + "\'>" +
                    "	<div>" +
                    "		<div class=\'avatar-source human\'>" +
                    "           <div style='background:" + defaultColor + "'>" + show_t + " </div>" +
                    "			<img onerror='javascript:$(this).remove()'  id=\'im-group-member_li_avartarimg_" + user_uid + "\' srcuid=\'" + user_uid + "\' style=\'z-index: 99;\' src=\'" + RBChatUtils.getUserAvatarDownloadURL(user_uid, true) + "\'>" +
                    "		</div>" +
                    "		<div class=\'info\'>" +
                    "			<h4><span id=\'im-group-member_li_nickname_" + user_uid + "\' class=\'msg_title\'>" + nickname + "</span></h4>" +
                    "			<p>" +
                    "				<span>ID: " + user_uid + "</span>" +
                    (itemShowCheckBox ?
                        "			<i id=\'im-group-member_li_checkbox_" + user_uid + "\' class=\'" + (selected ? "weui-icon-success" : "weui-icon-circle") + "\' style='top:0px !important'></i>" : "") +
                    "		</div>" +
                    "	</div>" +
                    "</li>";
            }

            if (isFrist) {
                $('#im-group-member-list-content').append(itemsHTML)
            } else {
                const d = $("li[gTag='group_send'");
                $(d[d.length - 1]).after(itemsHTML)
            }


            // 添加点击事件
            for (var i = 0; i < groupMemberEntitys.length; i++) {
                // 每一个好友请求元数据，都是一个完整的RosterElementEntity对象（详见【接口1008-4-7】接口文档或服务端代码）
                var reqData = groupMemberEntitys[i];
                var uid = reqData.user_uid;
                $("#im-group-member_li_" + uid).click(fn_clickItem);
            }
        }

        // 处理点击加载
        var deal_more_logic = function () {
            var that = this;
            // 移除更多
            const remove_more = function () {
                const d = $("div[gTag='group_send_more']");
                if (d) {
                    d.remove();
                }
            }
            //获取当前显示好友的数量
            const c_len = $("li[gTag='group_send']") ? $("li[gTag='group_send']").length : 0;
            var end = 0;
            // 加载数据
            if (c_len < groupMemberEntitys.length) {
                end = c_len + PAGE_SIZE;
                // 还没有加载完数据
                if (end < groupMemberEntitys.length) {
                    //加载数据
                    const _list = groupMemberEntitys.slice(c_len, end)
                    show_list(_list.reverse(), false)
                } else {
                    end = groupMemberEntitys.length - 1;
                    //加载数据
                    const _list = groupMemberEntitys.slice(c_len, end)
                    show_list(_list.reverse(), false)
                    remove_more();
                }
            } else {
                remove_more();
            }
        }
        // 创建加载更多
        var create_more_ui = function (list) {
            const group_html = "<div class='rstore-friend-group-more' gTag='group_send_more'  id='groupsend-more'><span>查看更多</span></div>";
            const d = $("li[gTag='group_send'");
            if (d) {
                $(d[d.length - 1]).after(group_html)
                // 添加点击事件
                $("#groupsend-more").click(function () {
                    deal_more_logic(list)
                })
            }
        }

        //  显示好友ui
        var showFriends_html = function (groupMemberEntitys) {
            var itemsHTML = ''
            var bodyHTML =
                "<div id=\'im-group-member-list-wrapper\' class=\'kchat-im-panel-userlist\'>" +
                "	<div>" +
                "		<div class=\'kchat-talk-list-group\' style='position:relative;' id='step-01'>" +
                "           <ul id=\'im-group-member-list-content\'><li><div style='display: flex'><input id='search_txt' style='width:99%;height:30px' placeholder='请输入id或昵称'/></input></div></li><li><span id='group-send-select'>全选</span> <span id='group-send-cancle'>取消</span></li>" + itemsHTML + "</ul>" +
                "		</div>" +
                "		<div class=\'step-02\' id='step-02' >" +
                "               <div  class=\'footer\' style='display:flex:flex-direction:column;border-top:unset !important; margin-bottom:15px' id='merbers-select-root-2'>" +
                "                   <div id ='select-name-txt-show-2' class='select-name-txt-show'></div>" +
                "                   <div class='member-select-div' id='members-select-div-2'></div>  " +
                "                </div>" +
                "		</div>" +
                "	</div>" +
                "</div>";

            var step = 0;

            var fn_submitCallback = function () {
                //选择好友
                if (step == 0) {
                    //获取选中的
                    var userList = groupMemberEntitys.filter(item => item.selected);
                    if (userList && userList.length > 0) {
                        window.userList = userList.map(item => {
                            return item.user_uid
                        })

                        $('#step-01').hide();
                        $('#step-02').show();
                        $('#merbers-select-root').hide()
                        $('#select-name-txt-show-2').text('选择了' + userList.length + '好友')
                        var user_html = '';
                        $('#members-select-div-2').empty();
                        var i = 0;
                        for (const item of userList) {
                            var user_uid = item.user_uid;
                            var nickname = item.nickNameWithRemark;
                            const defaultColor = RBChatUtils.getBgColor(user_uid)
                            const show_t = nickname.substr(0, 1).toUpperCase();
                            var select_html = "<div class=\'avatar-source human\' id='select-img-uid-" + user_uid + "' style='margin-left: 10px'>" +
                                "                 <div style='background:" + defaultColor + "'>" + show_t + " </div>" +
                                "			<img onerror='javascript:$(this).remove()'  id=\'im-group-member_li_avartarimg_" + user_uid + "\' srcuid=\'" + user_uid + "\' style=\'z-index: 99;\' src=\'" + RBChatUtils.getUserAvatarDownloadURL(user_uid, true) + "\'>" +
                                "		</div>"
                            if (i < PAGE_SIZE)
                                user_html = user_html + select_html
                            else
                                break;

                            i = i + 1;
                        }
                        $('#members-select-div-2').append(user_html)
                        step = step + 1;
                        $('#dialog-footer-okbtn-1').text('发送')

                        // 构建发送区域
                        var send_area = "<div class='kchat-im-panel-main-chat-textarea' id='kchat-im-panel-main-chat-textarea-2' style='position: unset !important;border:1px solid #e2e4e8;z-index:999'>" +
                            '<div class="chat-box_alert" id="im-panel-main-chat-replay-ui-2" style="display:none;font-size: 18px;color: #fff;padding: 5px;"></div>' +
                            ' <div class="chat-box_alert" id="im-panel-main-chat-textarea_fileuphint-2" style="display:none;background: #5bc648;font-size: 12px;color: #fff;padding: 5px;">文件上传中...</div>' +
                            ' <div class="top-bar">' +
                            '<ul style="">' +
                            '<li id="emoji-face-btn">' +
                            '<i id="im-panel-main-chat-textarea_emojiopenbtn-2" class="icon-chat1"></i>' +
                            '<div id="im-panel-main-chat-textarea_emojipopup-2" class="kchat-pop emoji-face-box" style="margin-left:0px" tabindex="-1">' +
                            '</div>' +
                            '</li>' +
                            '<li id="upload-file">' +
                            '<i class="icon-chat2" onclick="$(\'#upload-file-input-2\').click();" title="发送文件"></i>' +
                            '<input type="file" id="upload-file-input-2" style="display: none;">' +
                            '</li>' +
                            '<li id="upload-image">' +
                            '<i class="icon-chat2" onclick="$(\'#upload-image-input-2\').click();" title="发送图片"></i>' +
                            '<input type="file" id="upload-image-input-2" style="display: none;">' +
                            '</li>' +
                            '<li id="upload-video" >' +
                            '<i class="icon-chat2" onclick="$(\'#upload-video-input-2\').click();" title="发送视频"></i>' +
                            '<input type="file" id="upload-video-input-2" style="display: none;">' +
                            '</li>' +
                            '</ul>' +
                            '</div>' +
                            '<textarea id="im-panel-inputcontent-2" class="ember-text-area js-message-content"  placeholder="输入聊天信息 …"></textarea>' +
                            '<textarea id="pic-copy-input-2" style="display:none"></textarea>' +
                            '</div>'
                        "</div>"
                        $('#step-02').append(send_area)

                        //初始表情
                        RBChatChattingContentPaneUI.initEmoji2();
                        // 初始消息发送
                        RBChatChattingContentPaneUI.initFileUplodifive5_groupMsgSend();
                    } else {
                        alert('没有选择要发送的好友!')
                    }
                    // 发送按钮
                } else {
                    // 发送文本消息
                    const text = $('#im-panel-inputcontent-2').val();
                    if (text && text.length > 0) {
                        RBChatChattingContentPaneUI.circleSendGroupMsg(window.userList.length, text, MsgType.TYPE_TEXT, [].concat(window.userList), function () {
                        })
                    } else {
                        alert('发送内容不能为空')
                    }
                }
            }

            // 显示对话框
            that.showGMSDialog("群发助手"
                , "取消"
                , "下一步"
                , bodyHTML
                , dialogId
                , null
                , fn_submitCallback
                , true
                , "min-width: 500px;"
                , null
                , false
                , false);


            init_friends_ui();

            $('#merbers-select-root').hide()

            // 点击全选
            $('#group-send-select').click(function () {
                for (var i = 0; i < groupMemberEntitys.length; i++) {
                    groupMemberEntitys[i].selected = true;
                    that.selectedOneItem(groupMemberEntitys[i].user_uid, true, groupMemberEntitys[i]);
                }
                that.flash_choice_ui(groupMemberEntitys)
            })

            // 取消选择
            $('#group-send-cancle').click(function () {
                for (var i = 0; i < groupMemberEntitys.length; i++) {
                    groupMemberEntitys[i].selected = false;
                    that.selectedOneItem(groupMemberEntitys[i].user_uid, false, groupMemberEntitys[i]);
                }
                that.flash_choice_ui(groupMemberEntitys)
            })

            $('#search_txt').on('input propertychange', function (e) {
                const inputVal = $(this).val();
                if (!inputVal || inputVal.length == 0) {
                    init_friends_ui();
                } else {
                    $("li[gTag='group_send'").remove();
                    $("div[gTag='group_send_more'").remove();
                    const list = groupMemberEntitys.filter(item => item.user_uid && item.user_uid.indexOf(inputVal) > -1 || item.nickNameWithRemark && item.nickNameWithRemark.indexOf(inputVal) > -1)
                    if (list.length > 0) {
                        const c_len = list.length > PAGE_SIZE ? PAGE_SIZE : list.length
                        show_list(list.slice(0, c_len));

                        // 创建更多
                        if (list.length > PAGE_SIZE) {
                            create_more_ui(list)
                        }
                    }
                }
            });
        };


        var localUserUid = LocalUserInfo.getObj().user_uid;
        // 通过rest接口获取好友列表数据
        RBChatRestHelper.submitGetRosterToServer(localUserUid
            , function (returnValue) {
                // 根据接口定义，返回不为空即表示认证成功
                if (!RBChatUtils.isStringEmpty(returnValue)) {
                    // 服务端返回的是一维RosterElementEntity对象数组
                    var rosterList = JSON.parse(returnValue)
                    if (rosterList) {
                        groupMemberEntitys = rosterList
                        showFriends_html(rosterList)
                    }
                    else {
                        RBChatDialogHelper.showAlertDialog_WARN('提示', '当前没有好友信息');
                    }
                }
            }
            , function (errorThrownStr) {
                //alert('好友列表数据读取出错，原因是：'+errorThrownStr);
                RBChatDialogHelper.showAlertDialog_WARN('加载失败', '好友列表数据加载出错，可能是网络故障，请稍后再试！');
            }
        );
    }


    UIModule7.prototype.getLIst = function (groupMemberEntitys) {
        var itemsHTML = ''
        var entityData = groupMemberEntitys;
        // 用户id
        var user_uid = entityData.user_uid;
        // 用户昵称
        var nickname = entityData.nickNameWithRemark;;
        // 本字段仅用于客户端UI界面使用，与服务端无关。表示UI界面上的选中情况。
        var selected = entityData.selected;

        // true表示item里将显示checkbox，否则不显示
        var itemShowCheckBox = true;


        // 如果是“我”则显示“我”标签
        const defaultColor = RBChatUtils.getBgColor(user_uid)
        const show_t = nickname.substr(0, 1).toUpperCase();

        // 将每一个item的html拼接起来
        itemsHTML +=
            "<div>" +
            "		<div class=\'avatar-source human\'>" +
            "           <div style='background:" + defaultColor + "'>" + show_t + " </div>" +
            "			<img onerror='javascript:$(this).remove()'  id=\'im-group-member_li_avartarimg_" + user_uid + "\' srcuid=\'" + user_uid + "\' style=\'z-index: 99;\' src=\'" + RBChatUtils.getUserAvatarDownloadURL(user_uid, true) + "\'>" +
            "		</div>" +
            "		<div class=\'info\'>" +
            "			<h4><span id=\'im-group-member_li_nickname_" + user_uid + "\' class=\'msg_title\'>" + nickname + "</span></h4>" +
            "			<p>" +
            "				<span>ID: " + user_uid + "</span>" +
            (itemShowCheckBox ?
                "			<i id=\'im-group-member_li_checkbox_" + user_uid + "\' class=\'" + (selected ? "weui-icon-success" : "weui-icon-circle") + "\' style='top:0px !important'></i>" : "") +
            "		</div>" +
            "	</div>";
        return itemsHTML;
    }


    /**
    * 转发功能
    */
    UIModule7.prototype.showGroupForWardDialog = function () {
        var that = this;
        var dialogId = that.nextDialogId();
        //  显示好友ui
        var showForward_html = function (list) {
            var itemsHTML = ''
            for (var i = 0; i < list.length; i++) {
                var entityData = list[i];
                // id
                var uid = entityData.uid;
                // 昵称
                var uname = entityData.uname;
                var utype = entityData.utype;
                // 最新消息
                var text = entityData.text;;
                // 本字段仅用于客户端UI界面使用，与服务端无关。表示UI界面上的选中情况。
                var selected = entityData.selected;

                // true表示item里将显示checkbox，否则不显示
                var itemShowCheckBox = true;

                // 如果是“我”则显示“我”标签
                const defaultColor = RBChatUtils.getBgColor(uid)
                const show_t = uname.substr(0, 1).toUpperCase();

                // 将每一个item的html拼接起来
                itemsHTML +=
                    "<li style=\'cursor: pointer;\' id=\'im-group-member_li_" + uid + "\' srcuid=\'" + uid + "\' utype=\'" + utype + "\' nickname='" + uname + "' dataindex=\'" + i + "\' isselected=\'" + (selected ? "1" : "0") + "\'>" +
                    "	<div>" +
                    "		<div class=\'avatar-source human\'>" +
                    "           <div style='background:" + defaultColor + "'>" + show_t + " </div>" +
                    "			<img onerror='javascript:$(this).remove()'  id=\'im-group-member_li_avartarimg_" + uid + "\' srcuid=\'" + uid + "\' style=\'z-index: 99;\' src=\'" + RBChatUtils.getUserAvatarDownloadURL(uid, true) + "\'>" +
                    "		</div>" +
                    "		<div class=\'info\'>" +
                    "			<h4><span id=\'im-group-member_li_nickname_" + uid + "\' class=\'msg_title\'>" + uname + "</span></h4>" +
                    "			<p>" +
                    "				<span style='width:200px'>" + text + "</span>" +
                    (itemShowCheckBox ?
                        "			<i id=\'im-group-member_li_checkbox_" + uid + "\' class=\'" + (selected ? "weui-icon-success" : "weui-icon-circle") + "\' style='top:0px !important'></i>" : "") +
                    "		</div>" +
                    "	</div>" +
                    "</li>";
            }

            var bodyHTML =
                "<div id=\'im-group-member-list-wrapper\' class=\'kchat-im-panel-userlist\'>" +
                "	<div>" +
                "		<div class=\'kchat-talk-list-group\' style='position:relative;' id='step-01'>" +
                "           <ul id=\'im-group-member-list-content\'><li><div style='display: flex'><input id='search_txt' style='width:99%;height:30px' placeholder='请输入会话id或昵称'/></input></div></li><li><span id='group-send-select'>全选</span> <span id='group-send-cancle'>取消</span></li>" + itemsHTML + "</ul>" +
                "		</div>" +
                "		<div class=\'step-02\' id='step-02' >" +
                "               <div  class=\'footer\' style='display:flex:flex-direction:column;border-top:unset !important; margin-bottom:15px' id='merbers-select-root-2'>" +
                "                   <div id ='select-name-txt-show-2' class='select-name-txt-show'></div>" +
                "                   <div class='member-select-div' style='width:375px !important;' id='members-select-div-2'></div>  " +
                "                </div>" +
                "		</div>" +
                "	</div>" +
                "</div>";
            var sending = false;

            // 整理转发消息
            var getForwardMsg = function () {
                const msg = window.forWrardMsg;
                return {
                    content: msg.text,
                    mtype: msg.msgType
                }
            }
            var fn_submitCallback = function () {
                if (sending) {
                    return;
                }
                sending = true;
                const obj = getForwardMsg();
                //点击转发
                const msgContent = obj.content;
                const msgType = obj.mtype;
                const selectlist = that.getSelectedItemsSimple();
                let forWardList = [];
                if (selectlist && selectlist.length > 0) {
                    forWardList = selectlist.map(item => {
                        return {
                            uid: item[0],
                            utype: item[2]
                        }
                    })
                    // 递归发送消息
                    RBChatChattingContentPaneUI.circleSendForwardMsg('#dialog-footer-okbtn-' + dialogId, forWardList.length, msgContent, msgType, [].concat(forWardList), function () {
                        sending = false;
                        that.closeDialog(dialogId);
                    })


                } else {
                    alert('请选择要转发的会话')
                }
            }

            // 显示对话框
            that.showForWardDialog("转发"
                , "取消"
                , "发送"
                , bodyHTML
                , dialogId
                , null
                , fn_submitCallback
                , list.length > 0
                , "min-width: 375px;width: 375px;"
                , null
                , false
                , false);


            var fn_clickItem = function (event) {
                // 取出uid值
                var srcUid = $(this).attr('srcuid');
                // 该行item所对应的返回数据中的数组索引
                var isSelectedValue = $(this).attr('isselected');
                var isSelected = (isSelectedValue == '1' ? true : false);

                if (srcUid) {
                    that.selectedOneItem2(srcUid, !isSelected);
                }
                // 阻止事件继续冒泡
                event.stopPropagation();
            };

            // 点击全选
            $('#group-send-select').click(function () {
                for (var i = 0; i < list.length; i++) {
                    that.selectedOneItem2(list[i].uid, true);
                }
            })

            // 取消选择
            $('#group-send-cancle').click(function () {
                for (var i = 0; i < list.length; i++) {
                    that.selectedOneItem2(list[i].uid, false);
                }
            })


            // 添加点击事件
            for (var i = 0; i < list.length; i++) {
                // 每一个好友请求元数据，都是一个完整的RosterElementEntity对象（详见【接口1008-4-7】接口文档或服务端代码）
                var reqData = list[i];
                var uid = reqData.uid;
                $("#im-group-member_li_" + uid).click(fn_clickItem);
            }

            $('#search_txt').on('input propertychange', function (e) {
                const inputVal = $(this).val();
                if (!inputVal || inputVal.length == 0) {
                    $('#im-group-member-list-content li').css('display', '')
                } else {
                    $('#im-group-member-list-content li').each(function (i, item) {
                        const nickname = $(item).attr('nickname')
                        const srcuid = $(item).attr('srcuid');
                        if (srcuid) {
                            if (nickname && nickname.indexOf(inputVal) > -1 || srcuid && srcuid.indexOf(inputVal) > -1) {
                                $(item).css('display', '')
                            } else {
                                $(item).css('display', 'none')
                            }
                        }

                    });
                }
            });
        };


        //读取本地会话
        const li_list = $('#kchat-im-panel-userlist-alarms').children();
        var show_list = []
        if (li_list && li_list.length > 0) {
            for (var i = 0; i < li_list.length; i++) {
                const item = li_list[i];
                const uid = $(item).attr('im-dataid');
                const utype = $(item).attr('im-alarmtype');
                const uname = $('#alarms_li_msgtitle_' + utype + '_' + uid).text();
                const text = $('#alarms_li_msgcontent_' + utype + '_' + uid).text();
                show_list.push({
                    uid,
                    utype,
                    uname,
                    text
                })
            }
        }
        showForward_html(show_list)
    }

    /**
     * 显示“发送加友请求”对话框（含功能逻辑的实现）。
     *
     * @param friendUserUid 被加者的uid
     * @param friendUserNickName 被加者的昵称
     */
    UIModule7.prototype.showSendAddFriendReqForm = function (friendUserUid, friendUserNickName) {

        var that = this;

        // 对话框id，为了防止全局取id对象发生冲突，建议必须使用
        var dialogId = that.nextDialogId();

        // 要显示于对话框中的form表单html内容
        var bodyHTML =
            "<form>" +
            "	<ul>" +
            "		<li>" +
            "			<div>" +
            "				<textarea id=\'dialog-addfriendreq-form-sayhi-" + dialogId + "\' maxlength=\'100\' class=\'ember-text-area\' placeholder=\'对" + friendUserNickName + "说点什么 ...\' style=\'margin: 0px; height: 110px; width: 320px;\'></textarea>" +
            "				<p class=\'hint\'><i class=\'icon-info\' ></i>您可输入100个字符</p>" +
            "			</div>" +
            "		</li>" +
            "	</ul>" +
            "</form>";

        // 点击"发送请求"按钮要执行的回调函数
        var fn_submitCallback = function () {

            // 取出界面上form表单字段内容
            var saySomthingToHim = $.trim($("#dialog-addfriendreq-form-sayhi-" + dialogId).val());

            // 检查当前要添加的好友是否已经存在于列表中（存在当然就不能重复加好友了）
            // * 注：其实最严谨的方法是服务端判断（实时根据数据结果查询），但通过网络
            // * 与服务端交互因网速原因会影响体验，所以先行在客户端做一个理论上不太严
            // * 谨的判断，先行处理掉可能的重复也是合情合理的
            if (RosterProvider.isUserInRoster(friendUserUid) && RBChatChattingContentPaneUI.checkFriendIsValid(friendUserUid, false)) {
                alert(friendUserNickName + ' 已经是你的好友了，不需要再添加！');
                return;
            }

            // 最大好友数检查
            var localUserInfo = LocalUserInfo.getObj();
            if (!localUserInfo) {
                alert('本地用户信息数据不存在，请重新登陆后再试！');
                return;
            }
            var maxFriend = localUserInfo.maxFriend;
            if (maxFriend > 0) {
                // 不能超过最大好友数
                if (RosterProvider.size() >= maxFriend) {
                    alert('当前的交友规则允许你最多拥有' + maxFriend + '个好友，你无法再添加更多好友了！')
                    return;
                }
            }

            // 调用HTTP REST接口：“【接口1008-3-24】用户A发起的添加好友请求，接口返回值详细情况，详见接口文档或服务端代码。
            RBChatRestHelper.submitAddFriendRequestToServer(friendUserUid, saySomthingToHim
                // 数据读取成功后的回调
                , function (returnValue) {
                    // 先关闭表单输入对话框
                    that.closeDialog(dialogId);
                    // 再显示一个发送成功提示
                    //that.showAlertDialog(null, "请求发送成功，请等待对方处理！");
                    RBChatToastHelper.showToast_OK("发送成功", null);
                }
                // 数据读取失败后的回调
                , function (errorThrownStr) {
                    alert('加友请求发送失败，请稍后再重试！');
                }
            );
        };

        // 显示对话框
        that.showDialog("加为好友"
            , "取消"
            , "发送请求"
            , bodyHTML
            , dialogId
            , null
            , fn_submitCallback
            , true
            , "min-width: 0px;"
            , null
            , false
            , false);
    };

    /**
     * 显示"关于我们"。
     *
     * @returns {UIModule7}
     */
    UIModule7.prototype.showAboutDialog = function () {
        var that = this;
        // 对话框id，为了防止全局取id对象发生冲突，建议必须使用
        var dialogId = this.nextDialogId();

        //获取插件所有的名称
        function getPluginName() {
            var info = "";
            var plugins = navigator.plugins;
            if (plugins.length > 0) {
                for (var i = 0; i < navigator.plugins.length; i++) {
                    info += navigator.plugins[i].name + ";";
                }
            }
            return info;
        }

        var browserInfo = "<dl>";
        var minwidth = "style=\'min-width: 80px;color: #999;\'";
        browserInfo += "<dd><span class=\'label\' " + minwidth + ">浏览器信息：</span><span class=\'content\'>" + RBChatUtils.getBrowserInfo() + "</span></dd>";
        browserInfo += "<dd><span class=\'label\' " + minwidth + ">Cookie支持：</span><span class=\'content\'>" + navigator.cookieEnabled + "</span></dd>";
        browserInfo += "<dd><span class=\'label\' " + minwidth + ">运行平台：</span><span class=\'content\'>" + navigator.platform + "</span></dd>";
        browserInfo += "<dd><span class=\'label\' " + minwidth + ">安装的插件：</span><span class=\'content\'>" + getPluginName() + "</span></dd>";
        browserInfo += "<dd><span class=\'label\' " + minwidth + ">屏幕分辨率：</span><span class=\'content\'>" + window.screen.width + "×" + window.screen.height + "</span></dd>"
        browserInfo += "<dd><span class=\'label\' " + minwidth + ">颜色位深：</span><span class=\'content\'>" + window.screen.colorDepth + "bit</span></dd>";
        browserInfo += "</dl>";

        // 要显示于对话框中的form表单html内容
        var bodyHTML =
            "<div class=\'chat-user-info scrollbar-auto\' style=\'position: relative;\'>" +
            "	<div class=\'chat-user-info-headinfo\'>" +
            "		<div class=\'avatar-wrapper\' style=\'border-radius:12px;margin-right: 15px;\'>" +
            "		<img src=\'images/main_alarms_sns_undefine_icon.png\' style=\'border-radius:8px;\'>" +
            "		</div>" +
            "		<div class=\'info\'>" +
            "		<h4 style=\'max-width:320px;\'>" + PRODUCT_NAME + "</h4>" +
            "		<a style=\'max-width: 320px;color: #999;\' class=\'whatsup\' >版本：" + PRODUCT_VER_NAME + "</a>" +
            "		</div>" +
            "		<div class=\'clear\' style=\'clear: both;\'></div>" +
            "	</div>" +
            browserInfo +
            "   <dl style='border-top: 1px solid #eeeeee;padding-top: 10px;'>" +
            "       <dd><span class=\'label\' " + minwidth + ">版权所有：</span><span class=\'content\'>© 2016-2022 <a href='http://www.52im.net/' target='_blank'>即时通讯网</a></span></dd>" +
            "   </dl>" +
            "</div>";

        // 显示对话框
        that.showDialog("关于我们"
            , "取消"
            , "保存"
            , bodyHTML
            , dialogId
            , null
            , null
            , false
            , null
            , null
            , false
            , false);
    };

    /**
     * 显示创建群组的对话框。
     */
    UIModule7.prototype.showCreateGroupDialog = function () {
        var dialog = RBChatGroupMemberDialogFactory(
            GroupMemberDialogUsed.USED_FOR_CREATE_GROUP, null, true);
        dialog.loadAndShow();
    };

    /**
     * 显示查看/管理群成员的对话框。
     */
    UIModule7.prototype.showViewOrMgrGroupMemberDialog = function (gid, isGroupOwner, isManager = false) {
        var dialog = RBChatGroupMemberDialogFactory(
            GroupMemberDialogUsed.USED_FOR_VIEW_OR_MANAGER_MEMBERS, gid, isGroupOwner, isManager);
        dialog.loadAndShow();
    };

    /**
     * 显示邀请群成员的对话框。
     */
    UIModule7.prototype.showInviteGroupMemberDialog = function (gid, isGroupOwner) {
        var dialog = RBChatGroupMemberDialogFactory(
            GroupMemberDialogUsed.USED_FOR_INVITE_MEMBERS, gid, isGroupOwner);
        dialog.loadAndShow();
    };

    /**
     * 显示转让群主的对话框。
     */
    UIModule7.prototype.showTrasferGroupDialog = function (gid, isGroupOwner) {
        var dialog = RBChatGroupMemberDialogFactory(
            GroupMemberDialogUsed.USED_FOR_TRANSFER, gid, isGroupOwner);
        dialog.loadAndShow();
    };


    //-------------------------------------------------------------
    /**
     * 显示群组名称编辑对话框。
     *
     * @param ge 群组信息（即GroupEntity对象
     * ，详见：http://docs.52im.net/extend/docs/api/rainbowchatserver4_pro/com/x52im/rainbowchat/http/logic/dto/GroupEntity.html）
     */
    UIModule7.prototype.showGroupNameEdit = function (ge) {

        if (!GroupsProvider.isGroupOwner(ge.g_owner_user_uid)) {
            RBChatDialogHelper.showAlertDialog_WARN("只有群主可以修改群名称!");
            return;
        }

        var that = this;
        // 读取个人信息
        var localUserInfoRee = LocalUserInfo.getObj();

        if (localUserInfoRee) {
            // 对话框id，为了防止全局取id对象发生冲突，建议必须使用
            var dialogId = this.nextDialogId();

            // 本地用户部分个人信息字段
            var localUserUid = localUserInfoRee.user_uid;
            var localUserNickname = localUserInfoRee.nickname;

            // 要显示于对话框中的form表单html内容
            var bodyHTML =
                "<form>" +
                "	<ul>" +
                "		<li>" +
                "		<div>" +
                "			<input id=\'dialog-groupinfo-form-edit-gname-" + dialogId + "\' maxlength=\'30\' class=\'text ember-text-field\' type=\'text\' value=\'" + ge.g_name + "\' placeholder=\'请输入群名称\' >" +
                "			<p class=\'hint\'><i class=\'icon-info\' ></i>群名称最多允许30个字符</p>" +
                "		</div>" +
                "		</li>" +
                "	</ul>" +
                "</form>";

            // 点击保存按钮要执行的回调函数
            var fn_submitCallback = function () {

                // 新的群名称
                var newGname = $.trim($("#dialog-groupinfo-form-edit-gname-" + dialogId).val());

                if (RBChatUtils.isStringEmpty(newGname)) {
                    RBChatDialogHelper.showAlertDialog_INFO("只有群主可以修改群名称!");
                    return;
                }

                // 修改后的内容跟修改前的不相等才需要提交哦
                if (ge.g_name == newGname) {
                    // 关闭当前修改对话框
                    that.closeDialog(dialogId);
                    return;
                }

                // 如果内容没有改变，就不需要提交服务器了
                if (ge.g_name == newGname) {
                    // 关闭当前修改对话框
                    that.closeDialog(dialogId);
                    return;
                }

                // 调用HTTP REST接口：“【接口1016-24-8】修改群名称”，具体参数和返回值，详见接口文档或服务端代码。
                RBChatRestHelper.submitGroupNameModifiyToServer(newGname, ge.g_id, localUserUid, localUserNickname
                    // 成功后的回调
                    , function (returnValue) {

                        if (returnValue) {

                            // 返回值为1 表示更新成功，否则失败（详见http rest 手册中的“【接口1016-24-8】”的返回值说明）
                            if ('1' == returnValue) {

                                //********** 关闭当前修改对话框并显示提示信息>
                                that.closeDialog(dialogId);
                                RBChatToastHelper.showToast_OK('修改成功', null);

                                //********** 修改成功后，将数据更新到缓存中>
                                // 刷新本地缓存
                                ge.g_name = newGname;
                                GroupsProvider.updateGroup(ge);

                                //********** 刷新界面显示>
                                // 更新群组列表中的群名称
                                RBChatGroupsUI.updateGroupName(ge.g_id, newGname);
                                // 更新首页“消息”上的群名称显示
                                RBChatAlarmsUI.updateGroupName(ge.g_id, newGname);
                                // 更新界面右边群基本信息显示区的群名称显示
                                RBChatRightDetailUI.refreshGroupBaseInfo(ge.g_id, null);

                                //********** 本地往聊天界面中显示一条群名被"我"修改的系统通知
                                GChatDataHelper.addSystemInfo_groupNameChangedForLocalUser(ge.g_id, newGname);

                                return;
                            }
                            else {
                                RBChatDialogHelper.showAlertDialog_ERROR('修改失败', '群名称修改失败，请稍后再试！');
                            }
                        }
                    }
                    // 失败后的回调
                    , function (errorThrownStr) {
                        RBChatDialogHelper.showAlertDialog_ERROR('修改失败', '群名称修改失败，可能是网络故障，请稍后再试！');
                    }
                );
            };

            // 显示对话框
            that.showDialog("修改群名称"
                , "取消"
                , "保存"
                , bodyHTML
                , dialogId
                , null
                , fn_submitCallback
                , true
                , "min-width: 0px;"
                , null
                , false
                , false);
        }
    };

    /**
     * 显示“我”的群组内昵称编辑对话框。
     *
     * @param ge 群组信息（即GroupEntity对象
     * ，详见：http://docs.52im.net/extend/docs/api/rainbowchatserver4_pro/com/x52im/rainbowchat/http/logic/dto/GroupEntity.html）
     */
    UIModule7.prototype.showGroupInnerNicknameEdit = function (ge) {

        var that = this;
        // 读取个人信息
        var localUserInfoRee = LocalUserInfo.getObj();

        if (localUserInfoRee) {
            // 对话框id，为了防止全局取id对象发生冲突，建议必须使用
            var dialogId = this.nextDialogId();

            // 本地用户部分个人信息字段
            var localUserUid = localUserInfoRee.user_uid;

            // 要显示于对话框中的form表单html内容
            var bodyHTML =
                "<form>" +
                "	<ul>" +
                "		<li>" +
                "		<div>" +
                "			<input id=\'dialog-groupinfo-form-edit-nicknameingroup-" + dialogId + "\' maxlength=\'25\' class=\'text ember-text-field\' type=\'text\' value=\'" + (ge.nickname_ingroup ? ge.nickname_ingroup : "") + "\' placeholder=\'请输入您的昵称\' >" +
                "			<p class=\'hint\'><i class=\'icon-info\' ></i>“我”的群内昵称最长可输入25个字符</p>" +
                "		</div>" +
                "		</li>" +
                "	</ul>" +
                "</form>";

            // 点击保存按钮要执行的回调函数
            var fn_submitCallback = function () {

                // 新的群内昵称
                var newNicknameInGroup = $.trim($("#dialog-groupinfo-form-edit-nicknameingroup-" + dialogId).val());

                // 修改后的内容跟修改前的不相等才需要提交哦
                if (!(ge.nickname_ingroup == newNicknameInGroup)) {
                    // 调用HTTP REST接口：“【接口1016-24-9】修改"我"的群昵称”，具体参数和返回值，详见接口文档或服务端代码。
                    RBChatRestHelper.submitGroupNickNameModifiyToServer(newNicknameInGroup, ge.g_id, localUserUid
                        // 成功后的回调
                        , function (returnValue) {
                            if (returnValue) {

                                // 返回值为1 表示更新成功，否则失败（详见http rest 手册中的“【接口1016-24-8】”的返回值说明）
                                if ('1' == returnValue) {

                                    //********** 关闭当前修改对话框并显示提示信息>
                                    that.closeDialog(dialogId);
                                    RBChatToastHelper.showToast_OK('修改成功', null);

                                    //********** 修改成功后，将数据更新到缓存中>
                                    // 刷新本地缓存
                                    ge.nickname_ingroup = newNicknameInGroup;
                                    GroupsProvider.updateGroup(ge);

                                    //********** 刷新界面显示>
                                    // 更新界面右边群基本信息显示区的群名称显示
                                    RBChatRightDetailUI.refreshGroupBaseInfo(ge.g_id, null);

                                    return;
                                }
                                else {
                                    RBChatDialogHelper.showAlertDialog_ERROR('修改失败', ' “我”的群内昵称修改失败，请稍后再试！');
                                }
                            }
                        }
                        // 失败后的回调
                        , function (errorThrownStr) {
                            RBChatDialogHelper.showAlertDialog_ERROR('修改失败', ' “我”的群内昵称修改失败，可能是网络故障，请稍后再试！');
                        }
                    );
                }
                else {
                    // 关闭当前修改对话框
                    that.closeDialog(dialogId);
                    return;
                }
            };

            // 显示对话框
            that.showDialog("修改“我”的群昵称"
                , "取消"
                , "保存"
                , bodyHTML
                , dialogId
                , null
                , fn_submitCallback
                , true
                , "min-width: 0px;"
                , null
                , false
                , false);
        }
    };

    /**
     * 显示群公告编辑对话框。
     *
     * @param ge {GroupEntity} 群组信息（GroupEntity对象
     * ，详见：http://docs.52im.net/extend/docs/api/rainbowchatserver4_pro/com/x52im/rainbowchat/http/logic/dto/GroupEntity.html）
     */
    UIModule7.prototype.showGroupNoticeEdit = function (ge) {

        var that = this;

        // 读取个人信息
        var localUserInfoRee = LocalUserInfo.getObj();

        // 群相关信息
        var g_owner_user_uid = ge.g_owner_user_uid;
        var g_notice_updateuid = ge.g_notice_updateuid;
        var g_notice_updatenick = ge.g_notice_updatenick;
        var g_notice_updatetime = ge.g_notice_updatetime;
        var g_notice = ge.g_notice;

        if (localUserInfoRee && ge) {
            // 对话框id，为了防止全局取id对象发生冲突，建议必须使用
            var dialogId = this.nextDialogId();

            var isGroupOwner = GroupsProvider.isGroupOwner(g_owner_user_uid);

            // 如果是普通群员且公告为空，则直接提示并不需要打开这个界面
            if (!(isGroupOwner || ge.manage_mark - 0 == 1)
                && RBChatUtils.isStringEmpty(g_notice)) {
                RBChatDialogHelper.showAlertDialog_INFO('友情提示', ' 只有群主与管理可以编辑群公告!');
                return;
            }

            // 是否显示公告编辑者的信息（true表示显示，否则不显示）
            var showEdOwnerInfo = true;
            // 公告修改人信息是空的，就不显示修改人信息的UI界面了
            if (RBChatUtils.isStringEmpty(g_notice_updateuid))
                showEdOwnerInfo = false;

            // 只有群主才可以编辑，否则只能查看
            var canEdit = isGroupOwner;

            var bodyHTML_head = null;
            if (showEdOwnerInfo) {
                bodyHTML_head =
                    "<div class=\'chat-user-info-headinfo\' >" +
                    "	<div class=\'avatar-wrapper\'>" +
                    "		<img src=\'images/default_local_avatar.png\'>" +
                    "		<a target=\'_blank\' href=\'" + RBChatUtils.getUserAvatarDownloadURL(g_notice_updateuid, true) + "\'>" +
                    "			<img src=\'" + RBChatUtils.getUserAvatarDownloadURL(g_notice_updateuid, true) + "\'>" +
                    "		</a>" +
                    "	</div>" +
                    "	<div class=\'info\'>" +
                    "		<h4><a id=\'dialog-editgroup-form-notice_updatenick-" + dialogId + "\' title=\'" + g_notice_updatenick + "\'>" + g_notice_updatenick + "</a></h4>" +
                    "		<span style=\'color:#999\' class=\'whatsup\' title=\'最近编辑时间\'>编辑于: " + g_notice_updatetime + "</span>" +
                    "	</div>" +
                    "	<img style=\'right: 20px;width: 18px;height: 18px;\' class=\'sex\' title=\'最近一次公告编辑者的信息。\' src=\'images/groupchat_notice2.png\'>" +
                    "	<div class=\'clear\' style=\'clear: both;\'></div>" +
                    "</div>";
            }

            var bodyHTML_content = "";
            // 只有群主才可以编辑，否则只能查看
            if (isGroupOwner || ge.manage_mark - 0 == 1) {
                bodyHTML_content =
                    "<dl style=\'padding: 5px 0px 1px 0px;\'>" +
                    "	<form>" +
                    "		<ul>" +
                    "			<li>" +
                    "				<div>" +
                    "					<textarea id=\'dialog-editgroup-form-notice-" + dialogId + "\' maxlength=\'500\' class=\'ember-text-area\' style=\'width: 380px;min-height: 160px;\' placeholder=\'您可在此输入公告内容，请勿涉及非法信息哦 ...\'>" + g_notice + "</textarea>" +
                    "					<p class=\'hint\'><i class=\'icon-info\'></i>公告内容最多可输入500个字符</p>" +
                    "				</div>" +
                    "			</li>" +
                    "		</ul>" +
                    "	</form>" +
                    "</dl>";
            }
            else {
                bodyHTML_content =
                    "<dl>" +
                    "	<dd>" +
                    "		<span style=\'max-width: 340px;min-height: 120px;\' class=\'content\'>" + g_notice + "</span>" +
                    "	</dd>" +
                    "</dl>";
            }

            // 组合成对话框中要显示的完整HTML内容
            var bodyHTML =
                "<div class=\'chat-user-info scrollbar-auto\' style=\'position: relative;min-width: 380px;\'>" +
                (bodyHTML_head ? bodyHTML_head : "") +
                bodyHTML_content +
                "</div>";

            // 点击保存按钮要执行的回调函数
            var fn_submitCallback = function () {
                //that.closeDialog(dialogId);

                // 新的公告内容
                var newGroupNotice = $.trim($("#dialog-editgroup-form-notice-" + dialogId).val());

                // 修改后的内容跟修改前的不相等才需要提交哦
                if (!(g_notice == newGroupNotice)) {
                    // 调用HTTP REST接口：“【接口1016-24-22】修改群公告”，具体参数和返回值，详见接口文档或服务端代码。
                    RBChatRestHelper.submitGroupNoticeModifiyToServer(newGroupNotice, localUserInfoRee.user_uid, ge.g_id
                        // 成功后的回调
                        , function (returnValue) {
                            if (returnValue) {

                                // 返回值为1 表示更新成功，否则失败（详见http rest 手册中的“【接口1016-24-22】”的返回值说明）
                                if ('1' == returnValue) {

                                    //********** 关闭当前修改对话框并显示提示信息>
                                    that.closeDialog(dialogId);
                                    //RBChatToastHelper.showToast_OK('修改成功', null);

                                    //********** 修改成功后，将数据更新到缓存中>
                                    ge.g_notice = newGroupNotice;
                                    // 以下3个字段其实应该是从服务端取过来，但实际上本次就是群主本人修改的，所以完全没必要再浪费服务器的查询，直接本地更新即可（反正只是用于UI显示而已）
                                    ge.g_notice_updateuid = localUserInfoRee.user_uid;
                                    ge.g_notice_updatenick = localUserInfoRee.nickname;
                                    ge.g_notice_updatetime = RBChatUtils.formatDate(new Date(), 'yyyy-MM-dd hh:mm');
                                    // 刷新到本地内存缓存
                                    GroupsProvider.updateGroup(ge);

                                    //********** 刷新显示>
                                    // 更新界面右边群基本信息显示区的群名称显示
                                    RBChatRightDetailUI.refreshGroupBaseInfo(ge.g_id, null);

                                    //********** 本次修改完成后，确认是否自动向所有群员发出新公告，同时回到聊天界面>
                                    if (newGroupNotice) {
                                        var confirmDialogId = RBChatDialogHelper.nextDialogId();
                                        // 确认确认对话框
                                        RBChatDialogHelper.showConfrimDialog('通知确认', '确认', '该公告已修改成功，是否通知全部群成员？', confirmDialogId, function () {
                                            var noticeUpdateMsg = "@全体人员 \n" + "【群公告】" + RBChatUtils.beautySubstring(newGroupNotice, 200, false);
                                            const msgBody = {
                                                origin_text: noticeUpdateMsg,
                                                gid: window.groupInfo.g_id, // 群id
                                                select_obj: [{ nickname: '全体人员', user_uid: '333333' }]
                                            }
                                            //// 将可能的回车字符替换成html里的还行标签，提升体验
                                            //noticeUpdateMsg = noticeUpdateMsg.replace(/\n/g,"<br>");

                                            var fingerPrint = MBProtocalFactory.genFingerPrint();


                                            // 向群内所有人发送此次公告内容
                                            RBChatChattingContentPaneUI.doSendMessageImpl(JSON.stringify(msgBody), 12, function () {
                                                // 关闭当前的确认对话框
                                                RBChatDialogHelper.closeDialog(confirmDialogId);
                                            }, fingerPrint);
                                        });
                                    }

                                    return;
                                }
                                // 返回值为2 修改人已不是群主，本次修改失败！
                                else if ('2' == returnValue) {
                                    RBChatDialogHelper.showAlertDialog_WARN('修改失败', ' 您已不是群主，本次修改失败！');
                                    return;
                                }
                                else {
                                    RBChatDialogHelper.showAlertDialog_ERROR('修改失败', '群公告修改失败，请稍后再试！');
                                }
                            }
                        }
                        // 失败后的回调
                        , function (errorThrownStr) {
                            RBChatDialogHelper.showAlertDialog_ERROR('修改失败', ' 群公告修改失败，可能是网络故障，请稍后再试！');
                        }
                    );
                }
                else {
                    // 关闭当前修改对话框
                    that.closeDialog(dialogId);
                    return;
                }
            };

            // 显示对话框
            that.showDialog("群公告（仅群主与管理可编辑）"
                , "取消"
                , "保存"
                , bodyHTML
                , dialogId
                , null
                , fn_submitCallback
                , isGroupOwner || ge.manage_mark - 0 == 1
                , null
                , null
                , false
                , false);

            // 为编辑者昵称添加点击事件（点击查看编辑者的个人信息）
            if (showEdOwnerInfo) {
                $('#dialog-editgroup-form-notice_updatenick-' + dialogId).click(function (event) {
                    RBChatDialogHelper.showUserInfoFromServer(false, null, g_notice_updateuid, null);
                });
            }
        }
    };

    //## HTML5跨域文件上传组件Uoloadifive的初始化 START --------------------------------
    /**
     * 初始化HTML5文件上传组件（用于本地用户头像的上传功能）。
     * uploadifive的官方API文档地址：http://www.uploadify.com/documentation/
     *
     * @param $destSendBtnObj 头像上传按钮组件
     * @param $avatarObj 头像图片的img对象
     * @see RBChatDialoagHelper.showUserInfo(ree)
     */
    UIModule7.prototype.initLocalAvatarFileUplodifive5 = function ($destSendBtnObj, $avatarObj, dialogId = '') {
        var that = this;
        var logTag = '头像图片';

        // “上传中”提示信息Toast id
        var loadingToastID = null;//RBChatToastHelper.nextToastId();

        $destSendBtnObj.uploadifive({
            // 文件上传的后台处理URL（因uplodifive很难通过form传递参数，只能放以到URL里传过去了。不同于APP端，因Web浏览器不能计算出
            //      MD5码，所以fileName参数就不传了，文件到了服务端后由服务端去计算出MD5文件名（方便存储）就是了）
            'uploadScript': RBChatConfig.WEB_FILE_UPLOAD_CONTROLLER_URL_ROOT
                // 根据服务端的约定，业务类型为：0-图片上传、1-普通文件上传、2-本地用户头像文件上传
                + '?action=2&user_uid=' + IMSDK.getLoginInfo().loginUserId,
            //按钮显示的文字
            'buttonText': '',
            //显示的高度和宽度，默认 height 30；width 120
            'height': 19,
            'width': 19,
            //在浏览窗口底部的文件类型下拉菜单中显示的文本
            'fileTypeDesc': '支持的文件格式：',
            //允许上传的文件后缀
            'fileType': 'image/png,image/jpg,image/jpeg', // 详见：http://www.uploadify.com/documentation/uploadifive/filetype/
            //上传文件页面中，你想要用来作为文件队列的元素的id, 默认为false  自动生成,  不带#
            //'queueID': 'fileQueue',
            //上传文件的大小限制
            'fileSizeLimit': RBChatConfig.UPLOAD_AVATAR_IMAGE_DATA_MAX_LENGTH,
            //上传数量
            'queueSizeLimit': 1000,
            //选择文件后自动上传
            'auto': true,
            //设置为true将允许多文件上传
            'multi': false,
            // 返回一个错误，选择文件的时候触发
            'onError': function (errorType, file) {
                RBChatUtils.logToConsole("【" + logTag + "上传】>>>>>>>. 文件上传出错了，errorCode=" + errorType);

                var errorMsg = 'NA';
                // Get the error message
                switch (errorType) {
                    case '404_FILE_NOT_FOUND':
                        errorMsg = '404 Error';
                        break;
                    case '403_FORBIDDEN':
                        errorMsg = '403 Forbidden';
                        break;
                    case 'FORBIDDEN_FILE_TYPE':
                        errorMsg = 'Forbidden File Type';
                        break;
                    case 'FILE_SIZE_LIMIT_EXCEEDED':
                        errorMsg = '您要上传的' + logTag + '太大了（<strong><font color="#f00">最大允许 '
                            + RBChatConfig.UPLOAD_AVATAR_IMAGE_DATA_MAX_LENGTH
                            + '</font></strong>），本次上传已被取消！';
                        break;
                    default:
                        errorMsg = 'Unknown Error';
                        break;
                }

                // 关闭文件上传提示UI的显示（之所有用延迟关闭，是因为uploadifive控件的设计时，onError调用后，会接着调用onUpload函数，
                // 这样的话，就会导致错误提示显示完成后，UI上确还显示着文件正在上传的信息，这就不合适了！）
                setTimeout(function () {
                    // 先关闭toast
                    RBChatToastHelper.closeToast(loadingToastID);
                }, 30);

                // 再显示错误提示对话框
                RBChatDialogHelper.showAlertDialog_WARN('上传出错', logTag + '上传出错，' + errorMsg);
            },
            'onUpload': function (file) {
                RBChatUtils.logToConsole('【' + logTag + '上传】>>>>>>> onUploadStart,file=' + file);

                // 显示toast提示
                loadingToastID = RBChatToastHelper.showToast_Loading('头像上传中..');
            },
            //检测HTML5失败调用
            'onFallback': function () {
                RBChatDialogHelper.showAlertDialog_INFO('友情提示', "您的浏览器不支持HTML5, 无法实现" + logTag + "上传！");
            },
            //上传成功后执行
            'onUploadComplete': function (file, data) {

                // 必须要加这一条，不然下次上传会提示上次的未完成，不能再上传（数量限制），这
                // 可能中uplodifive的bug，之前swf版本本方法中是不需要单独处理的！！
                $destSendBtnObj.uploadifive('clearQueue');

                // 服务端在文件上传完成后返回的JSON对象，请务必与服务端的文件上传接口中返回的参数保持一致（详见服务端：FileUploader4Web.java）！
                var objFromServer = JSON.parse(data);
                RBChatUtils.logToConsole('【' + logTag + '上传】 文件上传成功，服务端返回的data.fileNameMD5=' + objFromServer.fileNameMD5);

                // 关闭toast显示
                RBChatToastHelper.closeToast(loadingToastID);

                // 服务端返回的上传完成的用户头像文件名
                var avatarFileName = objFromServer.fileNameMD5;

                // 将新头像文件名更新到本地用户信息缓存中（虽然暂时这
                // 个文件名字段没有用到，但为了保持数据一致性，还是顺利更新了吧）
                var localUserInfo = LocalUserInfo.getObj();
                localUserInfo.userAvatarFileName = avatarFileName;
                LocalUserInfo.update(localUserInfo);

                // 刷新主界面窗口左上方UI上的头像图片显示
                RBChatLocalUserUI.refreshAvatarImage();
                // 刷新当前用户信息对话框上的头像图片显示
                if (dialogId) {
                    const l = $('#im-panel-main-rightdetail-content-user-avatar_a-root' + dialogId).children()
                    if (l.length > 0) {
                        l.eq(0).attr('src', RBChatUtils.getUserAvatarDownloadURL(localUserInfo.user_uid, true))
                    } else {
                        $('#im-panel-main-rightdetail-content-user-avatar_a-root' + dialogId).append(" <img id=\'im-panel-main-rightdetail-content-user-avatar_" + dialogId + "\' src=\'" + RBChatUtils.getUserAvatarDownloadURL(localUserInfo.user_uid, true) + "\' onerror='javascript:$(this).remove()'>")
                    }
                } else {
                    if ($avatarObj)
                        $avatarObj.attr('src', RBChatUtils.getUserAvatarDownloadURL(localUserInfo.user_uid, true));
                }
            },
            'onUploadFile': function (file) {
                RBChatUtils.logToConsole('【' + logTag + '上传】onUploadFile> The file ' + file.name + ' finished processing.');
            }
        });
    };

    /**
     * 显示聊天“位置”消息的地图选择对话框。
     */
    UIModule7.prototype.showLocationSelectDialog = function () {
        var dialog = RBChatMsgLocationDialogFactory(true, null);
        dialog.showWithDialog();
    };

    /**
     * 显示聊天“位置”消息的地图查看对话框。
     *
     * @param locationMeta 表示要查看的位置点信
     *            息（见：rhcgat_cache.js文件中的Factory.prototype.createChatMsgEntity_COME_LOCATON()方法）
     */
    UIModule7.prototype.showLocationViewDialog = function (thLocationTitle, thLocationContent, thLongitude, thLatitude) {

        var locationMeta = {
            /** 位置主描述 */
            "locationTitle": thLocationTitle,
            /** 位置详细描述 */
            "locationContent": thLocationContent,
            /** 经度 */
            "longitude": thLongitude,
            /** 纬度 */
            "latitude": thLatitude,
            /** 地图预览图缓存文件名（此字段目前仅用于app产品中，对于web产品而言暂作保留字段，未实际使用之） */
            "prewviewImgFileName": null
        };

        var dialog = RBChatMsgLocationDialogFactory(false, locationMeta);
        dialog.showWithDialog();
    };

    /**
     * 显示用户列表选择对话框。
     */
    UIModule7.prototype.showUserChooserDialog = function (usedForForInit, chatTypeForInit, toIdForInit) {
        var dialog = RBChatUserChooserDialogFactory(
            usedForForInit, chatTypeForInit, toIdForInit);
        dialog.loadAndShow();
    };


    return new UIModule7();
})();