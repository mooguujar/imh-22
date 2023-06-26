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
 * 首页“消息”列表UI模块（是一个windows范围内的全局对象）。
 *
 * ------------------------------------------------------------
 * 【首页通知数据的封装类 - AlarmMessageDto】
 * -[1] 首页"消息"item的类型
 *      int alarmMessageType = AlarmMessageType.undefine;
 * -[2] 首页"消息"item的数据id
 *      String dataId = null;
 * -[3] 首页"消息"item的标题文本
 *      String title = null;
 * -[4] 首页"消息"item的内容文本
 *      String msgContent = null;
 * -[5] 首页"消息"item的java日期时间戳（GMT默认时区），此字段值目前仅用于UI显示，不作它用
 *      long date = 0;
 * -[6] 首页"消息"item的未读数
 *      String flagNum = null;
 *
 * -[7] 首页"消息"item的中存储的额外对象：此参数不是必须的
 *      Object extraObj = null;
 *
 * -[8] 首页"消息"item是否需要置顶（默认false，true表示需要置顶）
 *      boolean alwaysTop = false;
 *
 * -[9] 首页"消息"item是否有头像（此项针对一对一聊天、群聊天，其中一对一聊天时用户可能未设置头像则此值应为false，群聊默认都有群头像，可无件设true）
 *      boolean hasAvatar = true;
 * ------------------------------------------------------------
 */
var RBChatAlarmsUI = (function () {

    // 构造器（相当于java里的构造方法）
    var UIModule4 = function (argument) {

        if(RBChatUtils.isMobile()){
            // 没有数据时显示的空数据提示ui根对象
            this.$emptyUIRoot = $('#kchat-im-panel-userlist-empty-alarms-phone');
            // 有数据时正常显示数据的ui根对象
            this.$notEmptyUIRoot = $('#kchat-im-panel-userlist-alarms-phone');
             // 更多按钮
             this.$moreBtn = $('#nav_bar_r_1');
        }else{
            // 没有数据时显示的空数据提示ui根对象
            this.$emptyUIRoot = $('#kchat-im-panel-userlist-empty-alarms');
            // 有数据时正常显示数据的ui根对象
            this.$notEmptyUIRoot = $('#kchat-im-panel-userlist-alarms');
             // 更多按钮
            this.$moreBtn = $('#im-panel-userlist-wrap-alarms-more');
        }
      
    };

    /**
     * 本封装对象的所有初始化动作，放在本函数中执行。
     */
    UIModule4.prototype.init = function () {
        this.initButtonsEvent();
    };

    /**
     * 为各种按钮增加点击事件处理。
     */
    UIModule4.prototype.initButtonsEvent = function () {

        //------------------------------- “+”按钮的事件处理 START
        // 弹出菜单层根div
        var $morePopup = $('#im-panel-userlist-wrap-alarms-add-popup');

        // 各菜单项对象
        var menuItem1Obj = $('#im-panel-userlist-wrap-alarms-add-popup-addfriend');
        var menuItem2Obj = $('#im-panel-userlist-wrap-alarms-add-popup-addgroup');

        if(RBChatUtils.isMobile()){
            $morePopup = $('#im-panel-userlist-wrap-alarms-add-popup-phone');

            // 各菜单项对象
           menuItem1Obj = $('#im-panel-userlist-wrap-alarms-add-popup-addfriend-phone');
           menuItem2Obj = $('#im-panel-userlist-wrap-alarms-add-popup-addgroup-phone');
        }

        // 添加搜索事件
        $('#im-panel-userlist-wrap-alarms-search-input').bind('input porpertychange', function () {
            var val = $(this).val();
            if (val.length > 0) {
                //匹配值
                $('#kchat-im-panel-userlist-alarms li').each(function (i, item) {
                    const name = $(item).find(".msg_title ").text()
                    $(item).css('display', name.indexOf(val) >= 0 ? '' : 'none');
                })

            } else {
                $('#kchat-im-panel-userlist-alarms li').css('display', '')
            }
        })

        // 点击设置按钮的事件处理
        this.$moreBtn.click(function (event) {
            $morePopup.toggle();
            event.stopPropagation();  //阻止冒泡（否则事件传递到body后，立即又被hide了）
        });

        // 各菜单项的点击事件
        menuItem1Obj.click(function () {
            RBChatDialogHelper.showQueryUserForm();
            $morePopup.hide();
        });
        menuItem2Obj.click(function () {
            //alert('本功能稍后实现！');
            //RBChatDialogHelper.showAlertDialog_INFO('友情提示', '本功能稍后实现！');

            //var dialog = RBChatGroupMemberDialogFactory(
            //    GroupMemberDialogUsed.USED_FOR_CREATE_GROUP, null, true);
            //dialog.loadAndShow();

            RBChatDialogHelper.showCreateGroupDialog();

            $morePopup.hide();
        });

        // 点击空白处的事件处理（希望点空白，能自动隐藏菜单层的显示）
        $("body").click(function (event) {
            $morePopup.hide();
        });
        //------------------------------- “+”按钮的事件处理 END

    };

    /**
     * 重新加载历史数据、离线数据并在ui上显示（可用于界面刷新按钮功能时）。
     *
     * @param fn_callback_complete 通知此回调，整个reload成功完成。此回调
     * 非必须参数，可用于调用者在本函数中的ajax异步调用完成后再进行其它的事情处理
     */
    UIModule4.prototype.reload = function (fn_callback_complete) {
        var that = this;

        // 获取小程序列表
        RBChatRestHelper.queryMinAppListFromServer(function (res) {
            const obj_list = JSON.parse(res);
            window.app_applets = obj_list;
        });
        
        // 查询表情列表
        RBChatRestHelper.query_face_type_list(function (res) {
            const obj_list = JSON.parse(res);
            window.bg_face_list = obj_list || [];
        });

        //*** 【重要说明】：以下异步ajax调用，为了保证数据加载顺序，后一个ajax调用是在
        //***             前一个ajax调用成功后执行的，代码看起来不够优雅，但js里只能这样了。

        // 【【1】AJAX异步接口调用】从服务端异步加载聊天历史（就是显示在首页“消息”里的item）
        AlarmsProvider.refreshHistoryChattingAlarmsAsync(function (alarmsHistoryArrays) {
            // 将加载完成后的聊天历史在UI上显示出来
            that.refreshHistoryChattingAlarmsUI(alarmsHistoryArrays);
            
            // 会话列表
            // console.log('会话列表', alarmsHistoryArrays)
            // 【【2】AJAX异步接口调用】从服务端异步加载“离线聊天消息”
            // 补充：回调参数的数据意义，请详见http rest【接口1008-4-8】的文档说明，或者服务端源码
            SingleChattingCache.loadOfflineMessagesAsync(null, function (offlineMessagesList) {
                // 在界面上显示出来
                that.refreshOfflineMessagesToUI(offlineMessagesList);
                // console.log('离线数据', offlineMessagesList
                // 【【3】AJAX异步接口调用】从服务端异步加载“未处理的加好友请求”（并显示在首页“消息”里）
                // 补充：回调参数的数据意义，请详见http rest【接口1008-4-9】的文档说明，或者服务端源码
                AlarmsProvider.refreshOfflineAddFriendReqAlarmAsync(function (req_count, latest_req_obj) {
                    // 未处理数大于0时
                    if (req_count && req_count > 0) {

                        // 请求时间戳
                        var reqTimestamp = null;
                        // 请求者昵称
                        var reqNickname = latest_req_obj.nickname;

                        // 如果最近一个加好友请求的数据封装对象不为空，就从中取出需要的据（具体对象字段
                        // ，请详见http rest【接口1008-4-9】的文档说明，或者服务端源码）
                        if (latest_req_obj) {
                            reqTimestamp = latest_req_obj.ex10;
                        }

                        // 在界面上显示出来
                        that.refreshAddFriendReqAlarmUI(reqNickname, reqTimestamp, req_count);

                        // 通知回调，整个reload成功完成
                        if (fn_callback_complete) {
                            fn_callback_complete();
                        }
                    }
                });
            });
        });

        //初始加载收藏表情
        RBChatRestHelper.query_love_face(function(res){
            var ree = JSON.parse(res == 'null' ? '[]' : res);
            window.love_face_list = ree
          },null)
    };

    /**
     * 刷新聊天记录item在首页“消息”列表中的ui显示。
     *
     * @param arrayArrays 使用历史聊天记录2维数组数据，来刷新列表UI
     */
    //UIModule4.prototype.refreshListUI = function (arrayArrays) {
    UIModule4.prototype.refreshHistoryChattingAlarmsUI = function (arrayArrays) {
        
        // 先清空显示
        this.clear();

        // 再用新的数据构建列表ui
        if (arrayArrays && arrayArrays.length > 0) {

            this.$notEmptyUIRoot.show();
            this.$emptyUIRoot.hide();
            // 标准的for循环：遍历 Array[Array对象] 2维数组，
            // 数组内各单元的数据意义，详见http rest 接口“【接口1008-26-7】”的文档说明（或对照服务端代码）
            for (var i = 0; i < arrayArrays.length; i++) {

                var row = arrayArrays[i];

                var chatUserUid = row[0];
                var chatUserNickname = row[1];
                var msgType = row[2];        // 聊天消息类型，见MsgBodyRoot类中的定义，详见：http://docs.52im.net/extend/docs/api/rainbowchatserver4_pro/constant-values.html#com.x52im.rainbowchat.im.dto.MsgBodyRoot.CHAT_TYPE_GROUP$CHAT
                var msgContent = row[3];
                var msgTimestamp = row[5];   // 消息时间（java时间戳）

                var isFriend = row[7];       // 此聊天对象是否是“我”的好友，本字段值为：0或1

                var chatType = row[8];       // 2表示群聊，否则是单聊（See ChatModeType）
                var gid = row[9];            // 群id（群聊消息时有意义）
                var gname = row[10];         // 群名称（群聊消息时有意义）

                var alarmData = null;

                var noPayDate =  row[11];
                var level = row[12];
                var noTime = row[13]
                var online = row[14] - 0 == 0 ? false:true;
                var lastLoginTime = row[15]
                var cmoney = row[16]
                var state = row.length > 17 ? row[17]:''
                var weihu = row.length > 18 ? row[18]:''
                // 群聊消息
                if (chatType == ChatModeType.CHAT_TYPE_GROUP$CHAT) {

                    // 群聊消息的发出者uid
                    var srcUid = row[6];
                    // true表示是我自已发出的群聊消息
                    var isMe = (srcUid == LocalUserInfo.getUid);

                    // 我自已发出的消息，在首页“消息”里显示时，不需要显示昵称了（就像微信一样）
                    alarmData = AlarmsProvider.createAGroupChatMsgAlarm(msgType, msgContent, gname, gid, isMe ? null : chatUserNickname
                        , RBChatUtils.isStringEmpty(msgTimestamp) ? RBChatUtils.getCurrentUTCTimestamp() : msgTimestamp);
                }
                // 单聊消息
                else {
                    // 是“我”的好友
                    if (isFriend == 1) {
                        alarmData = AlarmsProvider.createChatMessageAlarm(
                            msgType, msgContent, chatUserNickname, chatUserUid
                            , RBChatUtils.isStringEmpty(msgTimestamp) ? RBChatUtils.getCurrentUTCTimestamp() : msgTimestamp);
                    }
                    else {
                        alarmData = AlarmsProvider.createATempChatMsgAlarm(
                            msgType, msgContent, chatUserNickname, chatUserUid
                            , RBChatUtils.isStringEmpty(msgTimestamp) ? RBChatUtils.getCurrentUTCTimestamp() : msgTimestamp);
                    }
                }
                alarmData.noPayDate = noPayDate;
                alarmData.level = level;
                alarmData.noTime = noTime;
                alarmData.online = online;
                alarmData.lastLoginTime = lastLoginTime;
                alarmData.cmoney = cmoney
                alarmData.state = state;
                alarmData.weihu = weihu;

                // 将数据插入到UI界面中显示之
                this.insertItem(alarmData, false);
            }
        }
        else {
            this.$notEmptyUIRoot.hide();
            this.$emptyUIRoot.show();
        }
    };

    /**
     * 刷新“未处理好友请求”的item在首页“消息”列表中的ui显示。
     *
     * @param latestReqNickname 最新一次好友请求者的昵称
     * @param latestReqTimestamp 最新一次好友请求时间戳
     * @param unprocessedCount 未处理的好友请求总数量
     */
    UIModule4.prototype.refreshAddFriendReqAlarmUI = function (latestReqNickname, latestReqTimestamp, unprocessedCount) {

        // 在首页“消息”列表中显示一个item，方便点击查看所有好友请求列表
        var alarmMessageDTO = AlarmsProvider.createAddFriendReqMergeAlarm(latestReqNickname, latestReqTimestamp);//, srcUserInfo.user_uid);
        //processRecivedMessage(false, false, alarmMessageDTO, null);
        // 插入或更新首页“消息”item的本地缓存数据模型
        this.insertOrUpdate(alarmMessageDTO, true);
        // ui上显示未读标识
        //this.addUnread(alarmMessageDTO.alarmMessageType
        //    , LocalUserInfo.getUid()//alarmMessageDTO.dataId
        //    , unprocessedCount);
        this.addUnread_for_addFriendReq(unprocessedCount);
    };

    /**
     * 拉取离线消息并显示到UI界面上。
     *
     * @param offlineMessagesList 1维Vector<OfflineMsgDTO>对象数组，对象OfflineMsgDTO的文档
     * ，详见：http://docs.52im.net/extend/docs/api/rainbowchatserver4_pro/com/x52im/rainbowchat/http/logic/dto/OfflineMsgDTO.html
     */
    UIModule4.prototype.refreshOfflineMessagesToUI = function (offlineMessagesList) {

        if (offlineMessagesList && offlineMessagesList.length > 0) {

            RBChatUtils.logToConsole("【refreshOfflineMessagesToUI】离线消息读取成功，共有消息条数：" + offlineMessagesList.length);
            // 会话列表数量
            sessions_count={};
            // 循环遍历
            offlineMessagesList.forEach(item=>{
                // 聊天模式
                var chatType = item.chat_type;
                // 群聊
                if (chatType == ChatModeType.CHAT_TYPE_GROUP$CHAT){
                    var toGid = item.group_id;
                    var gobj = sessions_count[toGid];
                    if(gobj){
                        gobj.unread_num = gobj.unread_num + 1;
                    }else{
                        gobj = {
                            alram_type: AlarmMessageType.groupChatMessage,
                            unread_num : 1
                        };
                        sessions_count[toGid] = gobj;
                    }
                // 私聊
                }else{
                    var fromUid = item.user_uid;
                    var gobj = sessions_count[fromUid];
                    if(gobj){
                        gobj.unread_num = gobj.unread_num + 1;
                    }else{
                        var  isTemp = RosterProvider.isUserInRoster(fromUid)? AlarmMessageType.reviceMessage:AlarmMessageType.tempChatMessage;
                        gobj = {
                            alram_type: isTemp,
                            unread_num : 1
                        };
                        sessions_count[fromUid] = gobj;
                    }
                }
            });
            // 设置未读消息
            for(key in sessions_count){
                var obj = sessions_count[key];
                this.setUnread(obj.alram_type, key, obj.unread_num);
            }

            // 刷新总未读alarm数的UI显示
            this.refreshAlarmsTotalUnreadCountShow();

        }
    };

    /**
     * 清空列表的UI。
     */
    UIModule4.prototype.clear = function () {
        // 清空列表ui显示内容
        this.$notEmptyUIRoot.empty();

        //** 刷新当前的消息数UI显示
        this.refreshAlarmsItemCountShow();
    };

    /**
     * 指定首页“消息”类型的item是否已经存在于ui中。
     *
     * @param alarmMessageType
     * @param dataId
     * @returns {boolean} true表示已存在，否则不存在
     */
    UIModule4.prototype.existsItem = function (alarmMessageType, dataId) {
        var $itemObj = $('#alarms_li_' + alarmMessageType + '_' + dataId);

        // 因为jquery取元素函数返回的结果是以数组形式返回的
        if ($itemObj.length > 0)
            return true;

        return false;
    };

    /**
     * 删除首页“消息”里指定类型item的UI（包括相关的连动UI逻辑处理）。
     *
     * @param alarmMessageType
     * @param dataId
     * @returns {boolean} true表示已删除，否则不是
     */
    UIModule4.prototype.deleteItem = function (alarmMessageType, dataId) {
        if (this.existsItem(alarmMessageType, dataId)) {

            // 将item从从ui上移除
            $('#alarms_li_' + alarmMessageType + '_' + dataId).remove();

            // 如果删除的是当前正在聊天中的首页“消息”item，则还需要额外做些事
            if (RBChatMainUI.isCurrentSelectedAlarm(AlarmMessageType.reviceMessage, dataId)
                || RBChatMainUI.isCurrentSelectedAlarm(AlarmMessageType.tempChatMessage, dataId)
                || RBChatMainUI.isCurrentSelectedAlarm(AlarmMessageType.groupChatMessage, dataId)) {

                // 清空聊天内容区UI
                RBChatChattingContentPaneUI.clearChatPane();

                // 清空右边详情功能区的tabs
                RBChatRightDetailUI.clearTabs();
                // 清空右边详细功能区的中间内容UI
                RBChatRightDetailUI.clearDetailContent();
                // 清空右边详细功能区的底部UI
                RBChatRightDetailUI.clearBottom();

                // 重置当前已被选中的首页“消息”的item标识
                RBChatMainUI.setCurrentSelectedAlarm(-1, null);

                // 请除此聊天对象的历史记录加载标识
                RBChatChattingContentPaneUI.removeSingleChatHistoryCurrentPages(dataId);
            }

            //** 刷新当前的消息数UI显示
            this.refreshAlarmsItemCountShow();

            return true;
        }

        return false;
    };

    /**
     * 插入或更新一个item。
     *
     * @param amd
     * @param toFirst true表示：插入到所有元素的前面（作为第1个）、或更新完成后移到首位，false：表示插入到尾部或者更新完成后不进行位置移动
     * @return boolean true表示本次插入之前此item不存在，否则本次是update而不是全新insert
     */
    UIModule4.prototype.insertOrUpdate = function (amd, toFirst, isGroupMsgSend=false) {
        if (this.existsItem(amd.alarmMessageType, amd.dataId)) {
            RBChatUtils.logToConsole('【首页“消息”-insertOrUpdate】alarmMessageType=' + amd.alarmMessageType + ', dataId=' + amd.dataId + '的item已存在【YES】。');

            // 已存在则更新之
            this.updateItemContent(amd.alarmMessageType, amd.dataId, amd.date, amd.msgContent, amd.title);

            if (toFirst)
                this.moveToFirst(amd.alarmMessageType, amd.dataId);

            return false;
        }
        else {
            RBChatUtils.logToConsole('【首页“消息”-insertOrUpdate】alarmMessageType=' + amd.alarmMessageType + ', dataId=' + amd.dataId + '的item不存在【NO】！');

            // 不存在则新插入之
            this.insertItem(amd, toFirst,isGroupMsgSend);

            return true;
        }
    };

    /**
     * 将指定的item移动到首位。
     *
     * @param alarmMessageType
     * @param dataId
     */
    UIModule4.prototype.moveToFirst = function (alarmMessageType, dataId) {
        var $itemObj = $('#alarms_li_' + alarmMessageType + '_' + dataId);
        // 因为jquery取元素函数返回的结果是以数组形式返回的
        if ($itemObj.length > 0) {
            const  flag = dataId;
            let _notip =  RBChatUtils.isKeyVal('noTipStr',flag);
            //元素已经置顶/免打扰，不做处理
            if($itemObj.attr('beTop') || _notip){

            }else{
                const l = $("#kchat-im-panel-userlist-alarms li[beTop='true'");
                if(l && l.length > 0){
                   l.eq(l.length-1).after($itemObj)
                }else{
                     // 将此元素移到父对象中的第1个
                    $itemObj.prependTo(this.$notEmptyUIRoot);
                }
            }
        }
    };

    /**
     * 设置取消置顶ui
     * @param {*} id 
     * @param {*} cancle 
     */
    UIModule4.prototype.setCancleTopUI = function(id, cancle){
        // 取消
        if(cancle){
            $(id).removeAttr('beTop');
            $(id).removeAttr('class');
            const l = $("#kchat-im-panel-userlist-alarms li[beTop='true'");
            // 把元素移动到置顶会员后面
            if(l && l.length > 1){
                l.eq(l.length-1).after($(id))
            }
        //设置
        }else{
            $(id).attr('beTop', 'true');
            $(id).attr('class', 'active');
            // 放到首位
            $(id).prependTo(this.$notEmptyUIRoot);
        }
    }

    /**
     * 设置消息免打扰ui
     * @param {*} id 
     * @param {*} cancle 
     * @returns 
     */
    UIModule4.prototype.setNoTipUI = function(id, cancle){
        $(id).removeClass(cancle ? 'im-left-unreadmsg-flagnum':'no-tip-bg');
        $(id).addClass(cancle ?'no-tip-bg':'im-left-unreadmsg-flagnum');
    }


    UIModule4.prototype.insertItem = function (amd, toFirst, isGroupMsgSend = false) {
        // "消息"类型
        var alarmMessageType = amd.alarmMessageType;
        var dataId = amd.dataId;
        // 标题文本
        var title = amd.title;//RBChatUtils.beautySubstring(amd.title, 6, true);
        // 内容文本
        var alarmContent = amd.msgContent;
        // 日期时间的时间戳形式（单位：毫秒）
        var dateTimestamp = amd.date;
        //// 未读消息数
        //var flagNum = amd.flagNum;

        // 时期时间的友好字符串形式
        var dateHuman = (dateTimestamp ? RBChatUtils.getTimeStringAutoShort(dateTimestamp, false, false) : "");
        // 内容是否为空
        var hasContent = (!RBChatUtils.isStringEmpty(alarmContent));
        // item里的文本内容
        var contentToShow = (hasContent ? alarmContent : "点击进入 ...");
        contentToShow = contentToShow.replace(new RegExp('<br/>', 'g'), '').replace(new RegExp('<br>', 'g'), '').replace(new RegExp('\n', 'g'), '')
        var that = this;

        // 默认的头像或图标url地址（当用户没有设置头像等情况下，就显示这个默认的）
        var iconUrl_default = null;
        // 真正的头像url地址（如果用户设置了头像、群有群图标等，就会在默认图标上显示这个）
        var iconUrl = null;

        // 是否可以被删除
        var canDelete = false;

        //** 按照提示类型的不同进行各自的数据设置逻辑
        if (alarmMessageType == AlarmMessageType.addFriendBeReject
            || alarmMessageType == AlarmMessageType.reviceMessage) {
            // 加好友请求被拒的消息显示时的默认头像
            if (alarmMessageType == AlarmMessageType.addFriendBeReject)
                iconUrl_default = '../images/main_alarms_sns_addfriendreject2r_message_icon.png';
            // 收到的聊天消息时的默认头像
            else if (alarmMessageType == AlarmMessageType.reviceMessage) {
                iconUrl_default = '../images/main_alarms_chat_message_icon.png';

                //## 额外的代码逻辑：
                // 既然现在是正式好友了，尝试删除之前临时聊天时在首页留下的消息，否则看起来不好看撒（又是临时聊天的又是正式聊天的）
                this.deleteItem(AlarmMessageType.tempChatMessage, dataId);

                // 可被删除
                canDelete = true;
            }

            // 尝试拼接真正的头像加载url（即使该用户未设置头像，此url也会返回1像素透明图片，也就不会挡住默认头像的显示了）
            iconUrl = RBChatUtils.getUserAvatarDownloadURL(dataId, true);
        }
        // 陌生人/临时聊天
        else if (alarmMessageType == AlarmMessageType.tempChatMessage) {
            // 先设定一个默认图标
            iconUrl_default = '../images/main_alarms_tenpchat_message_icon.png';
            // 尝试拼接真正的头像加载url（即使该用户未设置头像，此url也会返回1像素透明图片，也就不会挡住默认头像的显示了）
            iconUrl = RBChatUtils.getUserAvatarDownloadURL(dataId, true);

            //## 额外的代码逻辑：
            // 既然现在要显示的陌生人首页"消息"，则首先尝试删除之前正式聊天时在首页留
            // 下的消息item，否则用户会认为是bug（又是临时聊天的又是正式聊天的）
            this.deleteItem(AlarmMessageType.reviceMessage, dataId);

            // 可被删除
            canDelete = true;
        }
        // 群组聊天
        else if (alarmMessageType == AlarmMessageType.groupChatMessage) {
            iconUrl_default = '../images/groupchat_groups_icon_default.png';
            // 尝试拼接真正的群头像加载url
            iconUrl = RBChatUtils.getGroupAvatarDownloadURL(dataId, true);

            // 可被删除
            canDelete = true;
        }
        // 加好友请求
        else if (alarmMessageType == AlarmMessageType.addFriendRequest)
            iconUrl_default = '../images/main_alarms_sns_addfriendrequest_message_icon.png';
        else if (alarmMessageType == AlarmMessageType.systemDevTeam)
            iconUrl_default = '../images/main_alarms_sns_undefine_icon.png';
        else if (alarmMessageType == AlarmMessageType.systemQNA)
            iconUrl_default = '../images/main_alarms_sns_undefine_icon.png';
        else {
            iconUrl_default = '../images/main_alarms_system_message_icon.png';
        }

        var titleFlag = "";
        if (alarmMessageType == AlarmMessageType.tempChatMessage) {
            titleFlag = "<span class=\'msg_title_flag\' title=\'陌生人\' >陌</span>";
        }
        else if (alarmMessageType == AlarmMessageType.groupChatMessage) {
            titleFlag = "<span class=\'msg_title_flag_group\' title=\'群聊\'>群</span>";
        }
        // 添加维护
        if(amd.alarmMessageType -0 == 4 && amd.weihu - 0 == 0){
            titleFlag = titleFlag+ "<span class=\'user-weihu\' title=\'维护\'>维</span>";
        }
        
        const defaultColor = RBChatUtils.getBgColor(dataId)
        const show_t = title && title.length > 0 ? title.substr(0, 1).toUpperCase():'陌';

        var localUserUid = LocalUserInfo.getUid();
        const avId = "alarms_li_icon_" + alarmMessageType + "_" + dataId
        const  flag = alarmMessageType+'_'+dataId+'_'+localUserUid;
        const  flag1 = dataId;
        let is2Top =  RBChatUtils.isKeyVal('2topStr',flag);
        let _notip =  RBChatUtils.isKeyVal('noTipStr',flag1);

        // 添加置顶效果
        let tempStr = ''
        let  noTipclass = 'im-left-unreadmsg-flagnum'
        if(is2Top){
            tempStr = " beTop='true' class='active' "
        }

        if(_notip){
            noTipclass = 'im-left-unreadmsg-flagnum no-tip-bg'
        }

        let isLevel = alarmMessageType - 0 == 4 && !RBChatUtils.isMobile(); //
        let level_css = '';
        let level_html = '';
        var l_html = '';

        // 被删除得class
        let  beDelClass = 'be-del-hide';
        if(amd.state - 0 == 3){
            beDelClass = 'be-del-show' 
        }


        //** 准备好item的html
        var html=
            "<li id=\'alarms_li_" + alarmMessageType + "_" + dataId + "\'  "+ tempStr + level_css+"    im-alarmtype=\'" + alarmMessageType + "\' im-dataid=\'" + dataId + "\'>"
            + "       <div>"
            +"                 <div class='tip_my' id='tip_my_"+dataId+"'+><img src='/images/group-tip.png'/></div>"
            + "            <a class=\'top-tag\' title=\'Current Tag\'></a>"
            + (canDelete ? " <a class=\'close\' title=\'删除消息\' id=\'alarms_li_del_" + alarmMessageType + "_" + dataId + "\'></a>" : "")
            + "            <div class=\'avatar-source human\'>"
            + "                 <div  id=\'" + avId + "default\' style='background:" + defaultColor + "'>" + show_t + " </div>"
            + (true ? "        <img id=\'" + avId + "\' src=\'" + iconUrl + "\' onerror='javascript:$(this).remove()' >" : "")
            + "    <div  class='lixian-tip  "+beDelClass+"' bd-flag='bd-"+dataId+"'>删</div>"

            + "                 <span id=\'alarms_li_unreadflag_" + alarmMessageType + "_" + dataId + "\' class=\'"+noTipclass+" \' style=\'display:none;\'>0</span>"
            + (!RBChatUtils.isMobile() && alarmMessageType - 0 == 4 ? "   <div  class='online_status_"+dataId+"' style='height:10px;width:10px;background:"+(amd.online?"#57dc2d":"#f26c4f")+" ; border-radius: 50%;'></div>":"")
            + "            </div>"
            + "            <div class=\'info\'>"
            + "              <h4>" + titleFlag + "<span id=\'alarms_li_msgtitle_" + alarmMessageType + "_" + dataId + "\' class=\'msg_title " + (RBChatUtils.isStringEmpty(titleFlag) ? "" : "msg_title_has_flag") + "\'>" + title + "</span><span id=\'alarms_li_msgtime_" + alarmMessageType + "_" + dataId + "\' class=\'msg_time\'>" + dateHuman + "</span></h4>"
            + l_html
            + "              <p>"
            + "                  <span id=\'alarms_li_msgcontent_" + alarmMessageType + "_" + dataId + "\' title=\'" + contentToShow + "\'>"
            + RBChatUtils.replacePlaceholderForAlarmsItemContent(RBChatChattingContentPaneUI.replaceEmojiPlaceholderToHTML(contentToShow))//+contentToShow
            + "</span>"
            + "              </p>"
            + "            </div>"
            + "        </div>"
            + "   </li>";

        //** 添加到"消息"列表
        if(isGroupMsgSend){
            const l = $("#kchat-im-panel-userlist-alarms li[beTop='true'");
            if(l && l.length > 0){
               l.eq(l.length-1).after(html)
            }else{
                if (toFirst || is2Top)
                    this.$notEmptyUIRoot.prepend(html);
                else
                    this.$notEmptyUIRoot.append(html);
                }
        }else{
            if (toFirst || is2Top)
                this.$notEmptyUIRoot.prepend(html);
            else
                this.$notEmptyUIRoot.append(html);
        }
       

        // 添加免打扰和置顶功能
        $("#alarms_li_" + alarmMessageType + "_" + dataId).bind('contextmenu', function (e) {
            var popupId = "im-panel-msg-popupmenu";
            var oldPopupObj = $("#" + popupId);
            // 如果已经存在则先删除之（jq里选择器选回对象的Length>0表示该元素是存在的）
            if (oldPopupObj.length > 0)
                oldPopupObj.remove();

           const isTop = RBChatUtils.isKeyVal('2topStr',flag);
           const isNoTip = RBChatUtils.isKeyVal('noTipStr',flag1);
           console.log('免打扰数据', flag1, isNoTip)

            var html_ =
                '<div id="' + popupId + '" style="display: none;">'
                + '   <div class="kchat-pop">'
                + '       <ul>'
                + '    <li id="im-panel-msg-popupmenu-totop">'+(isTop?'取消置顶':'设置置顶')+'</li>'
                + '    <li id="im-panel-msg-popupmenu-no-tip">'+(isNoTip?'取消免打扰':'设置免打扰')+'</li>'
                + '    <li id="im-panel-msg-popupmenu-close-f">清理聊天记录</li>'
                + '    <li id="im-panel-msg-popupmenu-close-d">关闭聊天窗口</li>'

                + '       </ul>'
                + '   </div>'
                + '</div>';

            $(html_).appendTo('body');
            // 菜单对象
            var newPopupObj = $("#" + popupId);
            // 鼠标点击坐标
            // var x = e.originalEvent.x || e.originalEvent.layerX || 0;
            // var y = e.originalEvent.y || e.originalEvent.layerY || 0;
            var x = e.clientX;
            var y = e.clientY;
            // 在鼠标点击的位置显示菜单
            newPopupObj.css("top", y + "px");
            newPopupObj.css("left", x + "px");
            newPopupObj.show();

            $("body").click(function (event) {
                newPopupObj.remove();
            });


             // 清理聊天记录
             $('#im-panel-msg-popupmenu-close-f').click(function(){
                newPopupObj.remove();

                 //** 【1】先清空聊天界面
                 RBChatChattingContentPaneUI.setChatPaneEmpty();
                 SingleChattingCache.removeChatCache(dataId);
                 GroupChattingCache.removeChatCache(dataId);
            })

            //关闭聊天窗口
            $('#im-panel-msg-popupmenu-close-d').click(function(){
                newPopupObj.remove();
                $("#alarms_li_del_" + alarmMessageType + "_" + dataId).click();
            })

            //置顶
            $('#im-panel-msg-popupmenu-totop').click(function(){
                // 取消置顶操作
               if(isTop){
                   RBChatUtils.cancleKeyVal('2topStr',flag)
               //设置置顶操作
               }else{
                  RBChatUtils.setKeyVal('2topStr',flag);
               }
               that.setCancleTopUI("#alarms_li_" + alarmMessageType + "_" + dataId,isTop);
                newPopupObj.remove();
            })

            // 消息面打扰
            $('#im-panel-msg-popupmenu-no-tip').click(function(){

                // 本地设置
                var  localNoTipSet = function(){
                        // 取消免打扰操作
                    if(isNoTip){
                            RBChatUtils.cancleKeyVal('noTipStr',flag1)
                        //设置免打扰操作
                        }else{
                            RBChatUtils.setKeyVal('noTipStr',flag1);
                        }
                        that.setNoTipUI("#alarms_li_unreadflag_" + alarmMessageType + "_" + dataId ,!isNoTip);
                        newPopupObj.remove();
                }
                // 发起接口
                const  isGroup = alarmMessageType == AlarmMessageType.groupChatMessage;
                RBChatRestHelper.setMyNoTip(isGroup?'2':'1',isNoTip?'CANCEL':'ADD',dataId,function(){
                    localNoTipSet();
                },function(){
                    localNoTipSet();
                });

              
            })
            return false;
        });


        if (canDelete) {
            //** 为该“消息”的“删除”图标添加点击事件
            $("#alarms_li_del_" + alarmMessageType + "_" + dataId).click(function (event) {
                // 执行“删除”操作
                that.deleteWithConfirm(alarmMessageType, dataId);
                //阻止点击事件继续冒泡（防止点击删除图标的同时，又触发selectItem事件的处理，感觉不够爽）
                event.stopPropagation();
            });
        }

        //** 为“消息”列表的item添加点击事件处理
        $("#alarms_li_" + alarmMessageType + "_" + dataId).click(function () {
            //// 取出vid值
            ////var vid = $("#online_li_vid_"+visitorId).attr('im-date');
           
            // 如果点击的是：一对一好友聊天、陌生人/临时聊天、群组聊天
            if (alarmMessageType == AlarmMessageType.reviceMessage
                || alarmMessageType == AlarmMessageType.tempChatMessage
                || alarmMessageType == AlarmMessageType.groupChatMessage) {
                // 设置选中
                that.selectedItem(alarmMessageType, dataId);
                RBChatChattingContentPaneUI.showRightChatContent();
                RBChatChattingContentPaneUI.scrollToBottom4IM();

                window.alarms_msg={
                    alarmMessageType,
                    dataId
                }
            }
            // 如果点击的是：加好友请求
            else if (alarmMessageType == AlarmMessageType.addFriendRequest) {
                // 显示加好友请求列表界面
                RBChatDialogHelper.showOfflineAddFriendsReq();
            }
            // 如果点击的是：加好友请求被拒绝的通知
            else if (alarmMessageType == AlarmMessageType.addFriendBeReject) {
                // 点击此类消息时，就弹出该用户的个人信息显示吧
                RBChatDialogHelper.showUserInfoFromServer(false, null, dataId, null);
                // 清空未读数
                that.resetUnread(alarmMessageType, dataId);
            }
            else {
                //alert('未定义的消息类型！');
                RBChatDialogHelper.showAlertDialog_INFO('友情提示', '未定义的消息类型！');
            }
        });

        //** 刷新当前的消息数UI显示
        this.refreshAlarmsItemCountShow();

        RBChatUtils.logToConsole('【\"消息\"列表UI处理】alarmMessageType=' + alarmMessageType + ', dataId=' + dataId + '已插入到列表UI中。【OK】');
    };


    /**
     * 更新首页“消息”列表中用户Item上的title。
     *
     * @param alarmMessageType
     * @param dataId
     * @param newTitle
     */
    UIModule4.prototype.updateItemTitle = function (alarmMessageType, dataId, newTitle) {

        var $msgTitleObj = $("#alarms_li_msgtitle_" + alarmMessageType + "_" + dataId);
        // >0 表示找到了这个html元素
        if ($msgTitleObj.length > 0) {
            if (newTitle) {
                $msgTitleObj.text(newTitle);
            }
        }
    };

    /**
     * 更新首页“消息”列表中用户Item上显示的最近消息时间和消息内容。
     *
     * @param time
     * @param msgContent
     */
    UIModule4.prototype.updateItemContent = function (alarmMessageType, dataId, time, msgContent, title) {
        var msgTimeObj = $("#alarms_li_msgtime_" + alarmMessageType + "_" + dataId);
        var magContentObj = $("#alarms_li_msgcontent_" + alarmMessageType + "_" + dataId);
        var msgTitleObj = $("#alarms_li_msgtitle_" + alarmMessageType + "_" + dataId);

        msgTimeObj.text(time ? RBChatUtils.getTimeStringAutoShort(time, false, false) : "");

        if (msgContent) {

            // 先对表情占位符、特殖消息标签占位符进行替换
            var msgContentAfter = RBChatUtils.replacePlaceholderForAlarmsItemContent(
                RBChatChattingContentPaneUI.replaceEmojiPlaceholderToHTML(msgContent));

            msgContentAfter = msgContentAfter.replace(new RegExp('<br/>', 'g'), '').replace(new RegExp('<br>', 'g'), '').replace(new RegExp('\n', 'g'), '')

            //magContentObj.html(msgContent);
            magContentObj.html(msgContentAfter);// 不用.text()的得因是 .text()会把内容中的html进行转义，而.html()则不会
            magContentObj.attr('title', msgContent);
        }
        else {
            magContentObj.text('没有更多消息');
            magContentObj.attr('title', '没有更多消息');
        }

        if (title) {
            msgTitleObj.text(title);//RBChatUtils.beautySubstring(title, 10, false));
        }
    };

    /**
     * 对指定的item显示“草稿”。
     *
     * @param alarmMessageType
     * @param dataId
     * @param draft 草稿内容
     * @since 2.0
     */
    UIModule4.prototype.setDraftShow = function (alarmMessageType, dataId, draft) {
        var magContentObj = $("#alarms_li_msgcontent_" + alarmMessageType + "_" + dataId);
        if (draft) {

            // 草稿内容的显示“头部”
            var draftWithHead = '<span class="msg-flag-red">[草稿] </span>' + draft;

            // 先对表情占位符、特殖消息标签占位符进行替换
            //var msgContentAfter = RBChatUtils.replacePlaceholderForAlarmsItemContent(
            //    RBChatChattingContentPaneUI.replaceEmojiPlaceholderToHTML(draftWithHead));
            var msgContentAfter = RBChatChattingContentPaneUI.replaceEmojiPlaceholderToHTML(draftWithHead);
            if(msgContentAfter)
            msgContentAfter = msgContentAfter.replace(new RegExp('<br/>', 'g'), '').replace(new RegExp('<br>', 'g'), '').replace(new RegExp('\n', 'g'), '')

            // 不用.text()的得因是 .text()会把内容中的html进行转义，而.html()则不会
            magContentObj.html(msgContentAfter);
        } else {
            this.clearDraftShow(alarmMessageType, dataId);
        }
    };

    /**
     * 取消对指定的item显示“草稿”。
     *
     * @param alarmMessageType
     * @param dataId
     * @since 2.0
     */
    UIModule4.prototype.clearDraftShow = function (alarmMessageType, dataId) {
        var magContentObj = $("#alarms_li_msgcontent_" + alarmMessageType + "_" + dataId);

        // title里是正常的显示内容
        var title = magContentObj.attr('title');

        // 先对表情占位符、特殖消息标签占位符进行替换
        var msgContentAfter = RBChatUtils.replacePlaceholderForAlarmsItemContent(
            RBChatChattingContentPaneUI.replaceEmojiPlaceholderToHTML(title));
        
        if(msgContentAfter)
            msgContentAfter = msgContentAfter.replace(new RegExp('<br/>', 'g'), '').replace(new RegExp('<br>', 'g'), '').replace(new RegExp('\n', 'g'), '')

        // 将title内容显示到content里就是回复原先的显示了
        magContentObj.html(msgContentAfter);
    };

    /**
     * 单独的群聊item的名称更新。
     *
     * @param newGroupName 新的群聊名称
     * @since 1.3
     */
    UIModule4.prototype.updateGroupName = function (gid, newGroupName) {
        var msgTitleObj = $("#alarms_li_msgtitle_" + AlarmMessageType.groupChatMessage + "_" + gid);
        if (msgTitleObj && newGroupName) {
            msgTitleObj.text(newGroupName);
        }
    };

    /**
     * 刷新群组头像的显示（此种情况主要用于：群成员变动时，群头像可能已经在服务端重新生成，刷新的目的是为了及时同步显示之）。
     *
     * @param gid
     */
    UIModule4.prototype.updateGroupAvatarShow = function (gid) {
        var $avatar = $('#alarms_li_icon_' + AlarmMessageType.groupChatMessage + '_' + gid);
        if ($avatar) {
            $avatar.attr('src', RBChatUtils.getGroupAvatarDownloadURL(gid, true));
        }
    };

    /**
     * 带有确认对话框的删除“消息”实现函数（包括从UI上删除，并提交服务端进行数据库的数据删除）。
     *
     * @param uid
     * @param nickname
     */
    UIModule4.prototype.deleteWithConfirm = function (alarmMessageType, dataId) {
        var that = this;

        // 对话框id，为了防止全局取id对象发生冲突，建议必须使用
        var dialogId = RBChatDialogHelper.nextDialogId();
        // 点击确认按钮要执行的回调函数
        var fn_submitCallback = function () {
            RBChatDialogHelper.closeDialog(dialogId);
            that.delete(alarmMessageType, dataId);
        };

        // 显示确认对话框
        RBChatDialogHelper.showConfrimDialog("确认提示", "确认删除"
            , "此操作将删除与此相关的所有聊天记录，确定要删除吗？", dialogId, fn_submitCallback);
    };

    /**
     * 删除指定的“消息”（包括从UI上删除，并提交服务端进行数据库的数据删除）。
     *
     * @param alarmMessageType
     * @param dataId
     */
    UIModule4.prototype.delete = function (alarmMessageType, dataId) {

        var that = this;

        if (alarmMessageType == AlarmMessageType.tempChatMessage
            || alarmMessageType == AlarmMessageType.reviceMessage
            || alarmMessageType == AlarmMessageType.groupChatMessage) {

            var localUserUid = LocalUserInfo.getObj().user_uid;

            var isDeleteGroupChatting = (alarmMessageType == AlarmMessageType.groupChatMessage);

            // 调用HTTP REST接口：“【接口1008-4-22】删除个人全部聊天消息记录”，具体参数和返回值，详见接口文档或服务端代码。
            RBChatRestHelper.submitDeleteChattingMsgToServer(isDeleteGroupChatting, dataId, localUserUid, dataId

                // 服务端好友关系数据删除成功
                , function (returnValue) {
                    console.log('删除记录', returnValue)
                    if (returnValue) {

                        // 服务端执行删除成功
                        if ('1' == returnValue) {

                            // 如果是单聊（好友聊、陌生人聊）
                            if (alarmMessageType == AlarmMessageType.tempChatMessage
                                || alarmMessageType == AlarmMessageType.reviceMessage) {
                                // 从JS缓存中移除与指定好友的所有聊天数据
                                SingleChattingCache.removeChatCache(dataId);
                            }
                            // 如果是群聊
                            else if (alarmMessageType == AlarmMessageType.groupChatMessage) {
                                // 从缓存中删除此群聊天记录
                                GroupChattingCache.removeChatCache(dataId);
                            }

                            // 并尝试删除首页“消息”列表UI中的item
                            that.deleteItem(alarmMessageType, dataId);

                            // 删除成功的信息提示
                            RBChatToastHelper.showToast_OK("删除成功", null);
                        }
                    }
                    else {
                        RBChatUtils.logToConsole_WARN('[submitDeleteChattingMsgToServer] 删除“消息”请求完成，但服务端返回值是空！(' + returnValue + ')');
                    }
                }
                // 失败后的回调
                , function (errorThrownStr) {
                    RBChatDialogHelper.showAlertDialog_WARN('删除失败', '删除“消息”失败了，可能是网络故障，请稍后再试！');
                }
            );
        }
        else {
            RBChatDialogHelper.showAlertDialog_INFO('目前不支持此类“消息”的删除（alarmMessageType=' + alarmMessageType + '，dataId=' + dataId + '）');
        }
    };


    /**
     * 设置一个item为选中状态（并处理相应的数据加载、UI显示等完整逻辑）.
     *
     * @param alarmMessageType
     * @param dataId
     */
    UIModule4.prototype.selectedItem = function (alarmMessageType, dataId) {

        // ** 【补充说明】：
        // 1）当点击的是好友或陌生人聊天消息item时，跟 rbchat_ui_module.js中的RBChatRosterUI对象的.selectFriend(..)函数的代码逻辑是一致的！

        RBChatUtils.showChatDetail();

        var _selectedAlarmType = RBChatMainUI.getCurrentSelectedAlarmType();
        var _selectecAlarmDataId = RBChatMainUI.getCurrentSelectedAlarmDataId();

        // 如果当前item已经被选中过了，就不需要再次触发selected了
        //d.getElementById("IM-chat-visitorName").innerHTML = constructVisitorName(visitorId);
        if ((_selectedAlarmType != -1 && alarmMessageType != -1 && _selectedAlarmType === alarmMessageType)
            && (_selectecAlarmDataId && dataId && _selectecAlarmDataId === dataId)) {
            // console.log('【首页\"消息\"处理】当前item已处于selected状态，无需再次触发selected处理(当前已选中_selectedContentType='
            //     +_selectedAlarmType+' | _selectecContentId='
            //     + _selectecAlarmDataId+", 马上将要选中alarmMessageType="+alarmMessageType+"|dataId="+dataId+")");

            // ui上显示为选中样式
            //$("#alarms_li_"+_selectedAlarmType+"_"+_selectecAlarmDataId).addClass("active");
        }
        else {
            // 本条设置选中前，如果之前已经有选中，则应首先取消此item的“选中”ui样式
            // 条件：即当_currentChattingUserId不为空且不为'N/A'时即表示是有效的选中
            // 说明：此处的'N/A'是由removeOnlineVisitor时设置，详见对应代码处的注释。
            if (_selectedAlarmType != -1 && (_selectecAlarmDataId && _selectecAlarmDataId !== 'N/A')) {
                if(!$("#alarms_li_" + _selectedAlarmType + "_" + _selectecAlarmDataId).attr('beTop')){
                  $("#alarms_li_" + _selectedAlarmType + "_" + _selectecAlarmDataId).removeClass("active");
                }
               
                // 保存聊天文本输入框中未发出的内容为草稿
                var draft = RBChatChattingContentPaneUI.getInputContent();
                if (!RBChatChattingContentPaneUI.isInputContentEmpty()) {
                    // 保存
                    MessagesDraftCache.putDraft(_selectedAlarmType, _selectecAlarmDataId, draft);
                    // 清空输入框
                    RBChatChattingContentPaneUI.clearInputContent();
                    // 首页“消息”的对应item上，更新显示内容为“[草稿]。。。。”
                    RBChatAlarmsUI.setDraftShow(_selectedAlarmType, _selectecAlarmDataId, draft);
                }
            }

            // 设置当前id为最新选中的DOM id
            _selectedAlarmType = alarmMessageType;
            _selectecAlarmDataId = dataId;
            RBChatMainUI.setCurrentSelectedAlarm(alarmMessageType, dataId);

            //window.alert('您点击的是vid='+_selectecOnlineVisitorId);//visitorId);
            // console.log('【首页\"消息\"处理】您当前点击（选中）的是type='+_selectedAlarmType+',id=' + _selectecAlarmDataId);

            // ui上显示为选中样式
            $("#alarms_li_" + _selectedAlarmType + "_" + _selectecAlarmDataId).addClass("active");

            // 恢复聊天文本输入框中未发出的草稿内容
            if (MessagesDraftCache.containsDraft(_selectedAlarmType, _selectecAlarmDataId)) {
                // 恢复草稿到输入框
                RBChatChattingContentPaneUI.setInputContent(MessagesDraftCache.getDraft(_selectedAlarmType, _selectecAlarmDataId));
                // 清除“草稿”缓存
                MessagesDraftCache.removeDraft(_selectedAlarmType, _selectecAlarmDataId);
                // 清除首页“消息”的对应item上的“[草稿]。。。。”的内容显示
                RBChatAlarmsUI.clearDraftShow(_selectedAlarmType, _selectecAlarmDataId);
            }

            // 输入框获得焦点
            RBChatChattingContentPaneUI.foucusToInputContent();

            // 取消未读标识的显示（如果已显示未读标识的话）
            //setOnlineVisitorUnread(visitorId, false);
            this.resetUnread(alarmMessageType, dataId);

            //判断是群聊还是私聊
            var isGroupChatting = (AlarmMessageType.groupChatMessage === alarmMessageType);
            if(isGroupChatting){
                //this.loadChatHistoryFromLocalCache(alarmMessageType, dataId);
                RBChatChattingContentPaneUI.loadCacheHistoryFromCache2(alarmMessageType, dataId);
                // 加载右边的详情查看功能
                RBChatRightDetailUI.showTabsForSelectedAlarm(alarmMessageType, dataId);
            }else{
                // 先加载上次阅读时间
                window.lastReadTime = null;
                RBChatRestHelper.submitGetMsgRedTime(dataId,function(returnValue){
                    if(returnValue && returnValue.length > 0){
                        window.lastReadTime = returnValue;
                    }
                    //this.loadChatHistoryFromLocalCache(alarmMessageType, dataId);
                    RBChatChattingContentPaneUI.loadCacheHistoryFromCache2(alarmMessageType, dataId);
                    // 加载右边的详情查看功能
                    RBChatRightDetailUI.showTabsForSelectedAlarm(alarmMessageType, dataId);

                },function(){})

            }

        }

        //// TODO just for debug!!!!!!!!!!!!!!!!!
        //SingleChattingCache.showAllCacheForDebug();
    };

    UIModule4.prototype.resetUnread_for_addFriendReq = function () {
        // ui上显示未读标识
        this.resetUnread(AlarmMessageType.addFriendRequest, LocalUserInfo.getUid());
    };

    UIModule4.prototype.addUnread_for_addFriendReq = function (unReadCountToAdd) {
        // ui上叠加显示未读标识
        this.addUnread(AlarmMessageType.addFriendRequest, LocalUserInfo.getUid(), unReadCountToAdd);
    };

    UIModule4.prototype.setUnread_for_addFriendReq = function (totalUnprocessedCount) {
        // ui上显示未读标识
        this.setUnread(AlarmMessageType.addFriendRequest, LocalUserInfo.getUid(), totalUnprocessedCount);
    };

    /**
     * 清除"消息"列表里指定id的未读标识。
     *
     * @param dataId
     */
    UIModule4.prototype.resetUnread = function (alarmType, dataId) {
        //this.setUnread(alarmType, dataId, 0);//-99999999);
        var unReadObj = $("#alarms_li_unreadflag_" + alarmType + "_" + dataId);
        unReadObj.text(0);
        unReadObj.hide();

        // 刷新总未读alarm数的UI显示
        this.refreshAlarmsTotalUnreadCountShow();
    };

    /**
     * 增加"消息"列表里指定id的未读数标识（如果设置后该item的未读数大于0则会显示之，否则调用方法相当于hide之）。
     *
     * @param dataId 来自哪一个id
     * @param unReadCount 本次要加入的未读数量（会加到之前的未读数上）
     */
    UIModule4.prototype.addUnread = function (alarmType, dataId, unReadCountToAdd) {
        var unReadObj = $("#alarms_li_unreadflag_" + alarmType + "_" + dataId);

        // 取出原先的未读数
        var oldUnReadNum = unReadObj.text();
        if (!oldUnReadNum) {
            oldUnReadNum = 0;
        }

        if (!unReadCountToAdd) {
            unReadCountToAdd = 0;
        }

        // 新的未读数为原未读数与数的未读数相加
        var newUnReadNum = parseInt(oldUnReadNum) + parseInt(unReadCountToAdd);

        // 新的未读数大于0则显示之
        if (newUnReadNum && newUnReadNum > 0) {
            // 设new-msg属性，从而显示出闪动效果（不过，如果前一次已设过此属性，则再次设置是不会有效果滴）
            //设置是否闪动提示
            const  flag = dataId;
            let _notip =  RBChatUtils.isKeyVal('noTipStr',flag);
            if(!_notip){
                unReadObj.addClass("new-msg");
            }else{
                unReadObj.removeClass("new-msg");
            }
            
            unReadObj.text(newUnReadNum);
            unReadObj.show();
        }
        // 否则把这个未读数组件Hide掉
        else {
            newUnReadNum = 0;
            unReadObj.text(newUnReadNum);
            unReadObj.hide();
        }

        // 刷新总未读alarm数的UI显示
        this.refreshAlarmsTotalUnreadCountShow();
    };

    /**
     * 设置"消息"列表里指定id的未读数标识（如果设置后该item的未读数大于0则会显示之，否则调用方法相当于hide之）。
     *
     * @param dataId 来自哪一个id
     * @param newTotalUnReadCount 本次要设置的新未读数量（替换之前的未读数）
     */
    UIModule4.prototype.setUnread = function (alarmType, dataId, newTotalUnReadCount) {
        var unReadObj = $("#alarms_li_unreadflag_" + alarmType + "_" + dataId);

        if (!newTotalUnReadCount || newTotalUnReadCount < 0) {
            newTotalUnReadCount = 0;
        }

        // 新的未读数大于0则显示之
        if (newTotalUnReadCount > 0) {
            // 设new-msg属性，从而显示出闪动效果（不过，如果前一次已设过此属性，则再次设置是不会有效果滴）
            const  flag = dataId;
            let _notip =  RBChatUtils.isKeyVal('noTipStr',flag);
            if(!_notip){
                unReadObj.addClass("new-msg");
            }else{
                unReadObj.removeClass("new-msg");
            }
            unReadObj.text(newTotalUnReadCount);
            unReadObj.show();
        }
        // 否则把这个未读数组件Hide掉
        else {
            unReadObj.text(newTotalUnReadCount);
            unReadObj.hide();
        }
    };

    ///**
    // * 设置或取消设置首页“消息”的ui上显示的新消息提示红点点。
    // *
    // * @param has true表示显示红点点，否则表示取消息显示
    // */
    //UIModule4.prototype.setOnlineUIHasMsg = function(has){
    //    var uiObj = $('#im-panel-userlist-nav-alarms');
    //    if(has){
    //        uiObj.addClass('has-msg');
    //    }
    //    else{
    //        uiObj.removeClass('has-msg');
    //    }
    //};

    /**
     * 刷新总未读alarm数的UI显示。
     */
    UIModule4.prototype.refreshAlarmsTotalUnreadCountShow = function () {
        var cnt = this.getTotalUnreadCount();
        obj = {
            unReadNum : cnt > 0 ? cnt:0,
            from:'chat'
        }
        console.log('发送message-',obj)
        // 发送聊天消息，
        window.parent.postMessage(JSON.stringify(obj),'*');
    };

    /**
     * 刷新item总数的UI显示，并同时决定内容UI的可见性（当Item数为0时显示空UI，否则显示正常的列表UI，提升体验）。
     */
    UIModule4.prototype.refreshAlarmsItemCountShow = function () {
        var cntUIObj1 = $('#im-panel-userlist-wrap-alarms-allitems');
        //var cntUIObj2 = $('#im-panel-userlist-currentuserscount2');

        var cnt = this.getAlarmsCount();

        if (cnt) {
            cntUIObj1.text(cnt);
            if (this.$notEmptyUIRoot.css('display') == 'none') {
                this.$notEmptyUIRoot.show();
            }

            if (this.$emptyUIRoot.css('display') == 'block') {
                this.$emptyUIRoot.hide();
            }
            //cntUIObj2.text(cnt);
        }
        else {
            cntUIObj1.text(0);
            this.$notEmptyUIRoot.hide();
            this.$emptyUIRoot.show();
            //cntUIObj2.text(0);
        }

        //var count = getAlarmsCount();
        //if (count == 0) {
        //    $('#im-panel-nouser').css({
        //        'display': 'block'
        //    });
        //}
    };

    /**
     * 获取首页“消息”列表中的item总数。
     *
     * @returns {number}
     */
    UIModule4.prototype.getAlarmsCount = function () {
        return this.$notEmptyUIRoot.children().length;
    };

    /**
     * 获取首页“消息”列表中所有item的未读总数。
     *
     * @returns {number}
     */
    UIModule4.prototype.getTotalUnreadCount = function () {

        var objArray = $("span[id^=alarms_li_unreadflag_]");

        var totalCount = 0;

        //console.info(">>>>>>>>>>>>>>>>>>>>>>>> "+JSON.stringify(objArray));

        for (var i = 0; i < objArray.length; i++) {
            var obj = $(objArray[i]);

            //console.info(">>>>>>>>>>>>>>>>>>>>>>>> i="+i+", obj_json="+JSON.stringify(obj));

            if (obj) {
                var unreadNumStr = obj.text();

                //console.info(">>>>>>>>>>>>>>>>>>>>>>>> i="+i+", unreadNumStr="+unreadNumStr);
                if (unreadNumStr) {
                    totalCount += parseInt(unreadNumStr);
                }
            }
        }

        return totalCount;
    };

    /**
     * 刷新列表中item的选中ui选中样式显示（根据“好友”、“群组”列表里的item选中内容保持一致！）.
     *
     * 本方法主要用于主界面，左边的主tab列表切换时，即时根据“好友”、“群组”列表里的选中情况，刷新本列表中对应item的选中样式（不然ui选中样式就不同步了哦）。
     */
    UIModule4.prototype.refreshAlarmItemSelectedUI = function () {
        var _selectedAlarmType = RBChatMainUI.getCurrentSelectedAlarmType();
        var _selectecAlarmDataId = RBChatMainUI.getCurrentSelectedAlarmDataId();

        // 当前已选中的"消息"类型为“好友”、“群组”时，才需要进行ui选中样式同步
        if (_selectedAlarmType === AlarmMessageType.reviceMessage
            || _selectedAlarmType === AlarmMessageType.groupChatMessage) {

            if (_selectecAlarmDataId && _selectecAlarmDataId !== 'N/A') {

                // 将先将所有item的ui选中样式清除（也就是#kchat-im-panel-userlist-alarms元素的直接子li）
                var $allRosterItems = $("#kchat-im-panel-userlist-alarms li[betop!='true']");
                $allRosterItems.removeClass('active');

                // 刷新显示对应item的选中样式（目的是与“好友”、“群组”列表里的item选中情况保持同步）
                $("#alarms_li_" + _selectedAlarmType + "_" + _selectecAlarmDataId).addClass("active");
            }
        }
    };


    // 新建本模块对象
    var thisModule = new UIModule4();
    // 调用初始化方法
    thisModule.init();

    return thisModule;// 此种方式用于构造器的方式
})();
