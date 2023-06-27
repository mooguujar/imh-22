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
 * 整个IM主窗体UI模块（是一个windows范围内的全局对象）。
 */
var RBChatMainWindowUI = (function () {

    // 构造器（相当于java里的构造方法）
    var UIModule1 = function (argument) {

        //var hasSwitchedToOffline = false;   // 当前UI是否已切到“已结束”的用户列表上
        this.imWindowOpen = false;             // true表示本im组件的功能窗口是否处理显示（打开）状态，否则表示处于hide状态
        this.imWindowMini = true;              // true表示默认的IM窗口目前处于最小化状态，否则表示最大化状态

        // 设置按钮
        this.$setupBtn = $('#im-panel-header-setup');
    };

    UIModule1.prototype.init = function () {
        this.initMoveIMWindow();
        this.initCloseIMWindow();
        this.initMaxOrMiniIMWindow();
        this.initMsgToneSetup();
        this.initSwitchUserListTabsUI();
        this.initSetupButtonEvent();

        $("#im-header-notification-menu-imbtn").click()

        $("#im-panel-header-operation-open").click()
    };

    /**
     * 初始化打开/关闭IM窗口的事件处理。
     */
    UIModule1.prototype.initCloseIMWindow = function () {

        var that = this;

        $("#im-panel-header-operation-close").click(function () {
            $("#kchat-im-panel").hide();
            that.imWindowOpen = false;
        });

        $("#im-header-notification-menu-imbtn").click(function () {
            $("#kchat-im-panel").toggle();

            that.imWindowOpen = !that.imWindowOpen;
            // 如果窗口当是由关到开的状态改变，则要清除header上的新消息通知
            if (that.imWindowOpen) {
                that.setHeaderNotificatonNewMsgHint(false);
            }
        });
    };

    /**
     * 初始化最大化/最小化IM窗口的事件处理。
     */
    UIModule1.prototype.initMaxOrMiniIMWindow = function () {
        var toMaxBtnObj = $("#im-panel-header-operation-open");
        var toMiniBtnObj = $("#im-panel-header-operation-mini");
        var imWindowObj = $("#kchat-im-panel");

        var that = this;

        toMaxBtnObj.click(function () {
            toMiniBtnObj.show();
            toMaxBtnObj.hide();
            imWindowObj.addClass('ui-draggable-disabled expand');
            //imWindowObj.css({"top":"0"});
            imWindowObj.removeAttr("style");  // 清除拖动时可能的遗留style，不然不能正确显示哦

            that.imWindowMini = false;
        });

        toMiniBtnObj.click(function () {
            toMiniBtnObj.hide();
            toMaxBtnObj.show();
            imWindowObj.removeClass('ui-draggable-disabled expand');
            imWindowObj.removeAttr("style");  // 清除拖动时可能的遗留style，不然不能正确显示哦

            that.imWindowMini = true;
        });
    };

    /**
     * 初始化“声音提配”设置按钮的事件处理。
     *
     * @since 1.5
     */
    UIModule1.prototype.initMsgToneSetup = function () {
        var isOnBtnObj = $("#im-panel-header-operation-audioswitch-ison");
        var isOffBtnObj = $("#im-panel-header-operation-audioswitch-isoff");

        // 先初始化两个按钮的可见性
        var isOn = RBChatUtils.isMsgToneOpenFromCookie();
        if (isOn) {
            isOnBtnObj.show();
            isOffBtnObj.hide();
        }
        else {
            isOnBtnObj.hide();
            isOffBtnObj.show();
        }

        isOnBtnObj.click(function () {
            isOffBtnObj.show();
            isOnBtnObj.hide();
            RBChatUtils.setMsgToneOpenToCookie(false);
            RBChatToastHelper.showToast_OK('提示音已关', null);
        });

        isOffBtnObj.click(function () {
            isOffBtnObj.hide();
            isOnBtnObj.show();
            RBChatUtils.setMsgToneOpenToCookie(true);
            RBChatToastHelper.showToast_OK('提示音已开', null);
        });
    };

    /**
     * 初始化IM窗口的拖动事件处理。
     */
    UIModule1.prototype.initMoveIMWindow = function () {

        var that = this;

        var clicked = "Nope.";
        var mausx = "0";
        var mausy = "0";
        var winx = "0";
        var winy = "0";
        var difx = mausx - winx;
        var dify = mausy - winy;

        $("#kchat-im-panel").mousemove(function (event) {
            mausx = event.pageX;
            mausy = event.pageY;
            winx = $("#kchat-im-panel").offset().left;
            winy = $("#kchat-im-panel").offset().top;
            if (clicked == "Nope.") {
                difx = mausx - winx;
                dify = mausy - winy;
            }

            var newx = event.pageX - difx - $("#kchat-im-panel").css("marginLeft").replace('px', '');
            var newy = event.pageY - dify - $("#kchat-im-panel").css("marginTop").replace('px', '');

            // 只在当im窗口处于最小时状态时才允许拖动
            if (that.imWindowMini)
                $("#kchat-im-panel").css({ top: newy, left: newx });
        });

        $("#im-panel-header").mousedown(function (event) {
            clicked = "Yeah.";
        });
        $("#kchat-im-panel").mouseup(function (event) {
            clicked = "Nope.";
        });
        $("#kchat-im-panel").mouseout(function (event) {
            clicked = "Nope.";
        });
    };

    /**
     * 初始化主界面左侧用户列表顶端的tab标签切换事件处理。
     */
    UIModule1.prototype.initSwitchUserListTabsUI = function () {
        var that = this;

        // 取出所有的子tab对象（就是nav下的所有<a>元素）
        var $allUserListTabs = $('nav.kchat-im-panel-userlist-nav a');
        if ($allUserListTabs) {
            // 循环为每一个tab添加点击事件
            for (var i = 0; i < $allUserListTabs.length; i++) {
                var $tabCell = $($allUserListTabs[i]);

                // 点击事件
                $tabCell.click(function () {

                    /*alert('点击的是$(this).attr='+($(this).attr('data'))
                        +', this.json='+JSON.stringify(this)
                        +', $(this).json='+JSON.stringify($(this)));*/

                    /** 第一步：先设置tab的选中状态 */
                    // 先其它其它tab的选中状态（jquery对象支持对一个数组的所有
                    // 元素进行设置，所以最简单的办法就是给数据所有对象取消选中状态）
                    $allUserListTabs.removeClass('active');
                    // 设置当前tab为选中状态（注意：this为JS原先DOM对象，而$(this)才
                    // 是jQuery对象，因为这个点击事件是由JS自已的事件机制调用，跟jQuery
                    // 无关，所以这个this就是原生DOM而非jQuery对象）
                    $(this).addClass('active');


                    // 取出各tab存放于tabident属性的标识值（用于区分当前点击的到底是什么tab嘛）
                    var tabident = $(this).attr('tabident');

                    //alert('tabindex='+tabindex);


                    /** 第二步：再设置各tab对应列表UI的显示，以及选中tab后要额外做的事（即调用disSelect... 方法） */
                    // 先简单的调用此id通配符方式来隐藏列表ui（这样方便，省的要一个一个判断哪个列表当前处
                    // 于已显示状态并设置不隐藏，下面具体的tab判断代码会具体再设置要显示哪个列表ui）
                    $("div[id^=im-panel-userlist-wrap-]").hide();// 查出以此id为开头的所有对象

                    // 如果点击的是“消息”tab
                    if (tabident == 0) {// 注意：因取出的tabident是字符串，此处不能用===判断哦
                        $('#im-panel-userlist-wrap-alarms').show();
                        that.didSelectAlarmsTab();
                    }
                    else if (tabident == 1) {
                        $('#im-panel-userlist-wrap-roster').show();
                        that.didSelectRosterTab();
                    }
                    else if (tabident == 2) {
                        $('#im-panel-userlist-wrap-groups').show();
                        that.didSelecGroupsTab();
                    }
                });
            }
        }
    };

    /**
     * 为设置按钮增加点击事件处理。
     */
    UIModule1.prototype.initSetupButtonEvent = function () {

        // 弹出菜单层根div
        var $setupPopup = $('#im-panel-header-setup-popup');
        // 各菜单项对象
        //var menuItem1Obj = $('#im-panel-header-setup-popup-action-version');
        var menuItem2Obj = $('#im-panel-header-setup-popup-action-about');
        var menuItem3Obj = $('#im-panel-header-setup-popup-action-help');
        var menuItem4Obj = $('#im-panel-header-setup-popup-action-modifypsw');
        var menuItem5Obj = $('#im-panel-header-setup-popup-action-exit');
        var menuItem6Obj = $('#im-panel-header-setup-popup-action-profile');
        var menuItem7Obj = $('#im-panel-header-setup-popup-action-minapp');
        var menuItem8Obj = $('#im-panel-header-setup-popup-action-hs');


        var $setlixi = $('#im-panel-header-lixian');

        $setlixi.click(function(){

            RBChatRestHelper.setLixianStatus(window.isLiXian ? '1':'2'
                // 数据读取成功后的回调
                , function (returnValue) {
                    if (returnValue) {
                        // 取消离线
                        if(window.isLiXian){
                            $setlixi.text('设置离线')
                        // 设置离线
                        }else{
                            $setlixi.text('取消离线')
                        }
                       
                        window.isLiXian = !window.isLiXian
                    } else {
                        alert('设置失败')
                    }
                }
                // 数据读取失败后的回调
                , function (errorThrownStr) {
                }
            );

           

        })

        // 点击设置按钮的事件处理
        this.$setupBtn.click(function (event) {
            $setupPopup.toggle();
            event.stopPropagation();  //阻止冒泡（否则事件传递到body后，立即又被hide了）
        });

        // 点击空白处的事件处理（希望点空白，能自动隐藏菜单层的显示）
        $("body").click(function (event) {
            $setupPopup.hide();
        });

        //// 各菜单项的点击事件
        //menuItem1Obj.click(function (){
        //    alert('1');
        //    $setupPopup.hide();
        //});
        menuItem2Obj.click(function () {
            RBChatDialogHelper.showAboutDialog();
            $setupPopup.hide();
        });
        menuItem3Obj.click(function () {
            window.open('http://www.52im.net/forum-115-1.html', '_blank');
            $setupPopup.hide();
        });

        menuItem8Obj.click(function(){
            window.open('https://chat.imnono.net/coupon/hs/index.html', '_blank');
            $setupPopup.hide();
        })
        menuItem4Obj.click(function () {
            RBChatDialogHelper.showPasswordEdit();
            $setupPopup.hide();
        });
        menuItem5Obj.click(function () {
            RBChatMainUI.doLogout();
            $setupPopup.hide();
        });
        menuItem6Obj.click(function () {
            // 显用本地用户信息
            RBChatDialogHelper.showLocalUserInfo();
            $setupPopup.hide();
        });
        // 点击我的小程序
        menuItem7Obj.click(function () {
            RBChatDialogHelper.showMyMinAppInfo();
            $setupPopup.hide();
        });

        // 返回按钮
        $('#pop_ups_back').click(function () {
            $('#pop_ups').css({ 'display': 'none' })
        });

        // 我的钱包
        $('#im-panel-header-setup-popup-action-qb').click(function () {
            $setupPopup.hide();
            var localUserUid = LocalUserInfo.getUid();
            var callBack = function (e) {
                var obj = null;
                try {
                    obj = JSON.parse(e.data)
                } catch (e) { }
                if (obj) {
                    if (obj.type - 0 == 4) {
                        var popupId = "im-panel-msg-popupmenu";
                        var oldPopupObj = $("#" + popupId);
                        if (oldPopupObj.length > 0)
                            oldPopupObj.remove();
                    }
                }
            }
            RBChatUtils.showIFrameURL("https://chat.imnono.net/coupon/wallet.html?isWeb=1&userId=" + localUserUid, '我的钱包', callBack)
        });

        // 红包记录
        //   $('#im-panel-header-setup-popup-action-hbjl').click(function (){
        //     $setupPopup.hide();
        //     var localUserUid = LocalUserInfo.getUid();
        //     RBChatUtils.showIFrameURL("https://chat.imnono.net/coupon/redPacketRecord.html?userId=" + localUserUid)
        // });

        // 设置欢迎提示语
        $('#im-panel-header-setup-popup-action-welcome').click(function () {
            $setupPopup.hide();

            var myUserId = LocalUserInfo.getUid()
            // 获取欢迎提示语
            RBChatRestHelper.submitQueryWelecomToServer(myUserId,// 注意此id为本地用户的uid
                // 数据读取成功后的回调
                 function (returnValue) {
                    // 服务端返回的是java对象RosterElementEntity的JSON文本
                    var p = JSON.parse(returnValue == 'null' ? "[\"\",\"\",\"\"]" : returnValue);
                    if(p && p.length > 0){
                        RBChatDialogHelper.showWelcomDialog(p);
                    }
                }
                // 数据读取失败后的回调
                , function (errorThrownStr) {
                    RBChatUtils.logToConsole_ERROR('[前端-GET- 获取网络提示语失败，可能是网络故障，请稍后再试！');
                }
            );
        })

        // 其他设置
        $('#im-panel-header-setup-popup-action-other-set').click(function () {
            $setupPopup.hide();
            RBChatDialogHelper.showOtherSetDialog();
        })
        // 共同的群
        $('#im-panel-header-setup-popup-action-common-group').click(function () {
            $setupPopup.hide();
            RBChatDialogHelper.showCommonGroupDialog();
        })
        // 群发助手
        $('#im-panel-header-setup-popup-action-group-msg-send').click(function () {
            $setupPopup.hide();
            RBChatDialogHelper.showGroupMsgSendDialog();
        })

        // 客户维护
        $('#im-panel-header-setup-popup-action-kehu-weihu').click(function () {
            $setupPopup.hide();
            RBChatDialogHelper.showWeiHuDialog();
        })

        // 发送影片
        $('#upload-mul-moive').click(function () {
            RBChatDialogHelper.showMoivesDialog();
        })

         //自动加群设置
         $('#im-panel-header-setup-popup-action-auto-add-group').click(function(){
            $setupPopup.hide();
            RBChatDialogHelper.showAutoAddGroupDialog()
        })

        //任务列表
        $('#im-panel-header-setup-popup-action-task-weihu').click(function(){
            $setupPopup.hide();
            RBChatDialogHelper.showTaskDialog()
        })
        //申请列表
        $('#im-panel-header-setup-popup-action-friends-list').click(function () {
            $setupPopup.hide();
            RBChatDialogHelper.showOfflineAddFriendsReq();
        })

        setTimeout(() => {
            if (LocalUserInfo.getObj()) {
                const isManager = LocalUserInfo.getObj().isAdmin - 0 == 1;
                isManager ? $('#im-panel-header-setup-popup-action-welcome').show() : $('#im-panel-header-setup-popup-action-welcome').hide();
            }

        }, 1000)
    };

    //UIModule.prototype.isIMWindowOpen = function(){
    //    return this.imWindowOpen;
    //};

    // 用户点击切到“消息”tab后要做的事
    UIModule1.prototype.didSelectAlarmsTab = function () {
        // 无条件取消tab ui上显示的新消息未读提示红点点
        this.setAlarmsUIHasMsg(false);

        // 切换到本tab时，首先刷新列表中item的选中ui选中样式显示（根据“好友”、“群组”列表里的item选中内容保持一致！）.
        RBChatAlarmsUI.refreshAlarmItemSelectedUI();
    };

    // 用户点击切到“好友”tab后要做的事
    UIModule1.prototype.didSelectRosterTab = function () {
        // 切换到本tab时，首先刷新列表中好友的选中ui选中样式显示（跟首页“消息”里的item选中内容保持一致！）
        RBChatRosterUI.refreshFriendItemSelectedUI();
    };

    // 用户点击切到“群组”tab后要做的事
    UIModule1.prototype.didSelecGroupsTab = function () {
        // 切换到本tab时，首先刷新列表中群组的选中ui选中样式显示（跟首页“消息”里的item选中内容保持一致！）
        RBChatGroupsUI.refreshGroupItemSelectedUI();
    };

    /**
     * 首页“消息”的tab是否处于可见状态。
     *
     * @returns {String|false|null|*|jQuery} true表示处于可见状态，否则不可见（已切换到别的tab上了）
     */
    UIModule1.prototype.isAlarmsTabSelected = function () {
        return $('#im-panel-userlist-nav-alarms').is('.active');//.is(":visible");
    };

    /**
     * 设置或取消header处的新消息提示（提示只发生在im窗口处于关闭时）。
     *
     * @param show
     */
    UIModule1.prototype.setHeaderNotificatonNewMsgHint = function (show) {
        var obj = $('#im-header-notification-menu-imbtn-newmsg');
        if (obj)
            obj.remove();

        if (show && !this.imWindowOpen) {
            $("#im-header-notification-menu-imbtn")
                .append('<span id="im-header-notification-menu-imbtn-newmsg" class="msg-normal new-msg"></span>');
        }
    };

    /**
     * 设置或取消设置首页“消息”列表的ui上显示的新消息提示红点点。
     *
     * @param has true表示显示红点点，否则表示取消息显示
     */
    UIModule1.prototype.setAlarmsUIHasMsg = function (has) {
        var uiObj = $('#im-panel-userlist-nav-alarms');

        // 以下代码逻辑可以实现可见与取消可见，但没有一闪一闪动画效果
        //if(has){
        //    uiObj.addClass('has-msg new-msg');
        //}
        //else{
        //    uiObj.removeClass('has-msg new-msg');
        //}

        // 以下代码逻辑看起来有点啰嗦，但一删除一aa，目的就是为了实现一闪一闪动画效果
        // （而用setTimeout的目的，就是为了避免remove后立即add的话，浏览器并不能执行动画效果）
        if (uiObj)
            uiObj.removeClass('has-msg new-msg');
        setTimeout(function () {
            if (has) {
                uiObj.addClass('has-msg new-msg');
            }
        }, 50);
    };

    /**
     * 在IM主面板面上显示Alert信息。
     *
     * @param txt
     * @param iSucess true表显示的是绿色样式的提示信息，否则显示的是红色的警示样式信息
     */
    UIModule1.prototype.showIMPanelAlert = function (txt, iSucess) {
        var alertDivObj = $('#im-panel-header-alert');
        var alertContentObj = $('#im-panel-header-alert_content');

        if (iSucess) {
            alertDivObj.removeClass('warning');
            alertDivObj.addClass('success');
        }
        else {
            alertDivObj.removeClass('success');
            alertDivObj.addClass('warning');
        }

        alertContentObj.text(txt);
        alertDivObj.show();

        // 延时关闭
        setTimeout(function () {
            alertDivObj.hide();
        }, 6000);
    };


    /**
     * IM移动端处理
     *
     * @param txt
     * @param iSucess true表显示的是绿色样式的提示信息，否则显示的是红色的警示样式信息
     */
    function getUrlKey(name) {
        return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(location.href) || [, ""])[1].replace(/\+/g, '%20')) || null;
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
    function _isMobile() {
        // 设备判断
        setHtmlFontSize();
        return RBChatUtils.isMobile();
    }

    // 判断是否是手机
    if (_isMobile()) {
        $('#header_i').css({ 'display': 'block' })
        $('#footer_i').css({ 'display': 'flex' })
        $('#pc-kchat-im-panel-main').empty();
        $('#im-panel-header-setup-popup').empty();
        $('.chat-user-info').css({ 'padding-top': '70px' });
        $('#right_con_closure').css({ 'display': 'flex' });
        $('.container_info').css({ 'background': 'rgba(0, 0, 0, .45)' });
        $('.send_hint').hide();
        $('#left_con').css({ 'background': 'rgba(0, 0, 0, .45)' });
    } else {
        $('#phone_chat').empty();
        $('.mine_box').empty();

    }
    setTimeout(() => {
        $('body').css({ 'display': 'block' });
    }, 500)


    /**
     * 显示中间内容
     * @param {*} index 
     */
    function showCenter(index) {
        index == 0 ? $('#phone-friends-list').show() : $('#phone-friends-list').hide();
        index == 1 ? $('#phone-conversation-list').show() : $('#phone-conversation-list').hide();
        index == 2 ? $('#phone-group-list').show() : $('#phone-group-list').hide();
    }

    /**
     * 显示搜索结果
     * @param {*} val 
     */
    function showSearchResult(val) {
        //会话搜索
        if (window.tab_select - 0 == 1) {
            if (val.length > 0) {
                //匹配值
                $('#kchat-im-panel-userlist-alarms-phone li').each(function (i, item) {
                    const name = $(item).find(".msg_title ").text()
                    $(item).css('display', name.indexOf(val) >= 0 ? '' : 'none');
                })

            } else {
                $('#kchat-im-panel-userlist-alarms-phone li').css('display', '')
            }
        }

        // 好友搜索
        if (window.tab_select - 0 == 0) {
            if (val.length > 0) {
                //匹配值
                $('#kchat-im-panel-userlist-roster-phone li').each(function (i, item) {
                    const name = $(item).find("h4").text()
                    $(item).css('display', name.indexOf(val) >= 0 ? '' : 'none');
                })
            } else {
                $('#kchat-im-panel-userlist-roster-phone li').css('display', '')
            }
        }

        // 群组搜索
        if (window.tab_select - 0 == 2) {
            if (val.length > 0) {
                //匹配值
                $('#kchat-im-panel-userlist-groups-phone li').each(function (i, item) {
                    const name = $(item).find("h4 span").text()
                    $(item).css('display', name.indexOf(val) >= 0 ? '' : 'none');
                })

            } else {
                $('#kchat-im-panel-userlist-groups-phone li').css('display', '')
            }

        }
    }

    window.tab_select = 1;

    if(window.tab_select == 1){
        $(".nav_bar").addClass('hidden');
    }

    // 查看全部点击
    $('#query-my-minapp-all').click(function(){
        RBChatDialogHelper.showMyMinAppInfo();
    })

    const im_pid = Number(sessionStorage.getItem('im_pid'))
    if(!im_pid){
        $("#dk_img").remove()
    } else {
        $("#dk_img").attr('src', `/images/logo_${im_pid}.png`)
    }
    if(im_pid == 1){
        $('.nav_active').css({ 'background': '#ffdc30' })
        $('.nav_bar').css({ 'background': '#ffdc30' })
    } else {
        $('.nav_active').css({ 'background': 'linear-gradient(to bottom right, #19abf5, #68ff87)' })
        $('.nav_bar').css({ 'background': 'linear-gradient(to bottom right, #19abf5, #68ff87)' })
    }


    // 移动端footer点击效果
    $('.dom_item').click(function () {
        var _index = $(this).index();
        $('.first-my-minapp').hide();
        if (_index == 0) {
            $('#kchat-im-panel-userlist-roster-phone li').css('display', '')
            $('#phone_center').css({ 'display': 'none' })
            $('.search').css({ 'display': 'block' })
            $('.nav_bar_t').html('联系人')
        } else if (_index == 1) {
            $('#phone_center').css({ 'display': 'none' })
            $('.search').css({ 'display': 'block' })
            $('.nav_bar_t').html('消息')
            if($('.first-my-minapp-row2').children().length > 0){
                $('.first-my-minapp').show();
            }
            RBChatUtils.showFirstPageMinApp();
        } else if (_index == 2) {
            $('#kchat-im-panel-userlist-groups-phone li').css('display', '')
            $('#phone_center').css({ 'display': 'none' })
            $('.search').css({ 'display': 'block' })
            $('.nav_bar_t').html('群组')
        } else {
            $('#phone_center').css({ 'display': 'block' })
        }

        window.tab_select = _index;
        showCenter(_index);
        $('#cancel').click();


        // 选中字体颜色
        $('.dom_item').removeClass('nav_active');
        $('.dom_item').css({ 'background': 'none' })
        $(this).addClass('nav_active');
        if(im_pid == 1){
            $('.nav_active').css({ 'background': '#ffdc30' })
        } else {
            $('.nav_active').css({ 'background': 'linear-gradient(to bottom right, #19abf5, #68ff87)' })
        }


        // 控制顶部导航栏右侧按钮
        $.each($('.nav_bar_r'), function (index, value) {
            if (_index == index) {
                if(_index == 1 || window.tab_select == 1){
                    $(".nav_bar").addClass('hidden');
                } else {
                    $(".nav_bar").removeClass('hidden');
                }
                $(`#nav_bar_r_${index}`).removeClass('hidden');
            } else {
                $(`#nav_bar_r_${index}`).addClass('hidden');
            }
        });
    })

    // 添加搜索绑定事件
    $('#focus').bind('input porpertychange', function () {
        var val = $(this).val();
        showSearchResult(val)
    })

    // 搜索框点击
    $('.search_n').click(function () {
        var _index = $(this).index();
        $('.search_y').css({ 'display': 'block' })
        $('.search_n').css({ 'display': 'none' })
        $('#focus').val('')
        $('#focus').focus()
    })
    $('#cancel').click(function () {
        showSearchResult('');
        $('.search_y').css({ 'display': 'none' })
        $('.search_n').css({ 'display': 'flex' })
    })




    // 新建本模块对象
    var thisModule = new UIModule1();
    // 调用初始化方法
    thisModule.init();

    return thisModule;// 此种方式用于构造器的方式
})();