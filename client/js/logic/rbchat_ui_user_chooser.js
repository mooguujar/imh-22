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
 * 显示好友选择对话框的工厂函数（调用本函数将新建并返回一个好友选择对话框的新对象）.
 *
 * 【RBChatUserChooserDialogFactory的代码设计模式和思路说明】：
 *  - 1）RBChatUserChooserDialogFactory相当于一个函数，此函数的目的是返回一个新的 RBChatUserChooserDialog
 *      对象，而RBChatUserChooserDialog 对象才是对话框逻辑的封装实现者。
 *  - 2）调用RBChatUserChooserDialogFactory时，只需要像普通的JS函数一样调用即可，而且它的返回值每次都是一个新
 *      的RBChatUserChooserDialog对象。
 *  - 3）RBChatUserChooserDialogFactory作为函数套在RBChatUserChooserDialog的外面，只是为了更好地进行代码封
 *      装，而不至于让RBChatUserChooserDialog类的代码显的分散和杂乱而已。
 *
 * @param usedForForInit 用途，详见：rbchat_config.js中的UserChooserDialogUsed对象
 * @param chatTypeForInit 聊天类型（比如：用于一对一聊还是群聊中），详见：rbchat_config.js中的ChatModeType对象
 * @param toIdForInit 本界面选中的数据要发送给的目标id，注意：目前本字段仅用于 usedForForInit==USED_FOR_SEND_CONTACT_MESSAGE && chatType=好友或陌生人聊天时
 *      ，其它情况下本参数无意义，可以填null！
 * @returns {*} RBChatGroupMemberDialog对象
 */
RBChatUserChooserDialogFactory = function(usedForForInit, chatTypeForInit, toIdForInit){

    // 构造器（相当于java里的构造方法）
    var RBChatUserChooserDialog = function (a1, a2, a3) {

        /**
         * 调用者传进来的参数：：本界面的业务用途（比如：用于什么功能）。
         * @see rbchat_config.js中的UserChooserDialogUsed对象 */
        this.usedForForInit = a1;
        /**
         * 调用者传进来的参数：聊天类型（比如：用于一对一聊还是群聊中）。
         * @see rbchat_config.js中的ChatModeType对象 */
        this.chatTypeForInit = a2;
        /**
         * 调用者传进来的参数：本界面选中的数据要发送给的目标id
         * 注意：目前本字段仅用于 #usedForForInit==USED_FOR_SEND_CONTACT_MESSAGE && chatType=好友或陌生人聊天时
         *      ，其它情况下本参数无意义，可以填null！*/
        this.toIdForInit = a3;

        RBChatUtils.logToConsole("【用户选择界面】调用者传进来的参数：usedForForInit="
            +this.usedForForInit+", chatTypeForInit="+this.chatTypeForInit+", toIdForInit="+this.toIdForInit);

        // 是否显示选择框
        this.showCheckBox = true;
        // 是否支持单选
        this.singleSelection = false;
        // 对话框标题内容
        this.title = "";
        // 无列表数据时要显示的文本信息
        this.descForNoData = "";
        // 是否显示“确认”按钮
        this.isOKBtnShow = true;

        if(this.usedForForInit == UserChooserDialogUsed.USED_FOR_SEND_CONTACT_MESSAGE) {
            this.title = "选择好友";
            this.isOKBtnShow = true;
            this.showCheckBox = true;
            this.singleSelection = true;
            this.descForNoData = "<span>暂无更多数据供选择</span>"
        }
    };

    /**
     * 根据不同的场景功能，决定对话框里的数据、ui显示及后绪的功能逻辑。
     *
     *
     * @see #showWithDialog()
     */
    RBChatUserChooserDialog.prototype.loadAndShow = function(){

        var that = this;

        // 准备创建群数据（直接取我的本地好友列表即可）
        if(this.usedForForInit == UserChooserDialogUsed.USED_FOR_SEND_CONTACT_MESSAGE) {
            var memberList = new Array();

            // 我的好友列表数据（RosterElementEntity数组）
            // RosterElementEntity对象详见：http://docs.52im.net/extend/docs/api/rainbowchatserver4_pro/com/x52im/rainbowchat/http/logic/dto/RosterElementEntity.html
            var myRoster = RosterProvider.getRosterData();
            if (myRoster && myRoster.length > 0) {
                //for (RosterElementEntity ree : myRoster.getDataList())
                for (var i = 0;i< myRoster.length; i++) {
                    // RosterElementEntity对象
                    var ree = myRoster[i];

                    // 当是一对一聊天（好友或陌生人时），要对可选的名片列表去除接收者自已（向他发送他自已的名片就没意义了，微信也是这种逻辑）
                    if((chatTypeForInit == ChatModeType.CHAT_TYPE_FRIEND$CHAT || chatTypeForInit == ChatModeType.CHAT_TYPE_GUEST$CHAT )
                        && toIdForInit != null
                        && toIdForInit == ree.user_uid)
                    {
                        continue;
                    }

                    // 构造一个新的 UserEntity 对象
                    var m = this.constructFromRosterElement(ree);
                    if(m)
                        memberList.push(m);
                }
            }

            this.showWithDialog(memberList);
        }
        //else if (..){
        //}
    };

    /**
     * 将准备好的列表数据在UI上显示出来，并自动根据业务类型显示相应的功能等。
     *
     * @param userEntitys 列表数据列表（即UserEntity对象数组）
     */
    RBChatUserChooserDialog.prototype.showWithDialog = function(userEntitys) {

        var that = this;

        if(userEntitys && userEntitys.length > 0){

            RBChatUtils.logToConsole('【RBChatUserChooserDialog.show】用户列表数据行数：'+userEntitys.length);

            // 构建所有item的html
            var itemsHTML = '';
            // 是否有item行
            var isHasItems = (userEntitys.length > 0);

            // 用数据构建列表的html
            for(var i = 0; i<userEntitys.length;i++) {

                // 每一个元数据，都是一个完整的UserEntity对象
                var entityData = userEntitys[i];

                // 用户id
                var user_uid = entityData.user_uid;
                // 用户昵称
                var nickname = entityData.nickname;
                // 本字段仅用于客户端UI界面使用，与服务端无关。表示UI界面上的选中情况。
                var selected = entityData.selected;

                RBChatUtils.logToConsole('》》》》》该行用户数据为：'+entityData+", "+JSON.stringify(entityData));

                // true表示item里将显示checkbox，否则不显示
                var itemShowCheckBox = false;
                // 是否显示选择框
                if(this.showCheckBox) {
                    itemShowCheckBox = true;
                }
                else {
                    itemShowCheckBox = false;
                }

                // 将每一个item的html拼接起来
                itemsHTML +=
                    "<li style=\'cursor: pointer;\' id=\'im-user-chooser_li_"+user_uid+"\' srcuid=\'"+user_uid+"\' dataindex=\'"+i+"\' isselected=\'"+(selected?"1":"0")+"\'>"+
                    "	<div>"+
                    "		<div class=\'avatar-source human\'>"+
                    "			<img id=\'im-user-chooser_li_avartarimg_"+user_uid+"\' srcuid=\'"+user_uid+"\' style=\'z-index: 99;\' src=\'"+RBChatUtils.getUserAvatarDownloadURL(user_uid, true)+"\'>"+
                    "		</div>"+
                    "		<div class=\'info\'>"+
                    "			<h4><span id=\'im-user-chooser_li_nickname_"+user_uid+"\' class=\'msg_title\'>"+nickname+"</span></h4>"+
                    "			<p>"+
                    "				<span>ID: "+user_uid+"</span>"+
                    "			</p>"+
                    (itemShowCheckBox?
                        "			<i id=\'im-user-chooser_li_checkbox_"+user_uid+"\' class=\'"+(selected?"weui-icon-success":"weui-icon-circle")+"\'></i>":"")+
                    "		</div>"+
                    "	</div>"+
                    "</li>";
            }

            // 将拼接好的html整好到即将到放dialog中的body的html中
            var bodyHTML =
                "<div id=\'im-user-chooser-list-wrapper\' class=\'kchat-im-panel-userlist\'>"+
                "	<div>"+
                "		<div class=\'kchat-talk-list-group\'>"+
                //			<!-- 当列表数据为空时要显示的提示信息 -->
                "		<div id=\'im-user-chooser-list-empty\' class=\'kchat-talk-list-empty\' "+(isHasItems?"style=\'display: none;\'>":"")+">"+
                "			<i class=\'icon-talk1\' style=\'font-size: 60px;\'></i>"+
                "			<p>"+this.descForNoData+"</p>"+
                "		</div>"+
                //			<!-- 动态组织的数据UI -->
                (isHasItems?("<ul id=\'im-user-chooser-list-content\'>"+itemsHTML +"</ul>"):"")+
                "		</div>"+
                "	</div>"+
                "</div>";

            // 对话框id，为了防止全局取id对象发生冲突，建议必须使用
            var dialogId = RBChatDialogHelper.nextDialogId();

            // 点击保存按钮要执行的回调函数
            var fn_submitCallback = function () {

                // 选择要发送的个人名片
                if (usedForForInit == UserChooserDialogUsed.USED_FOR_SEND_CONTACT_MESSAGE) {

                    // UserEntity对象
                    var ue = that.getSingleSelectedUser();
                    if (ue) {

                        RBChatUtils.logToConsole("【RBChatUserChooserDialog.show】选择完成，uid="
                            + ue.user_uid + ", uname=" + ue.nickname);

                        var fn_sucess_send = function () {
                            // 关闭用户选择对话框
                            RBChatDialogHelper.closeDialog(dialogId);
                        };

                        // 发出消息指令
                        RBChatChattingContentPaneUI.doSendContactMessage4IM(ue.user_uid, ue.nickname , fn_sucess_send);
                    }
                    else {
                        RBChatToastHelper.showAlertDialog_WARN("无法发送", "选择结果为空!");
                    }

                    //alert('点击了确认按钮。dialogId='+dialogId);
                }
            };

            // 所有item的html拼接完成后，显示在对话模框里
            RBChatDialogHelper.showDialog(this.title
                , "取消"
                , "确认"
                , bodyHTML
                , dialogId
                , null
                , fn_submitCallback
                , this.isOKBtnShow
                , "max-width: 500px;"
                , "padding: 0;"
                , true
                , false);

            // 设置确认按钮的显示
            this.setOkButtonForSelected(dialogId, this.getSelectedCount());

            // 实现对话框中的列表Item的头像点击事件处理
            var fn_clickHead = function(event){
                // 取出uid值
                var srcUid = $(this).attr('srcuid');
                // 点击显示个人信息
                RBChatDialogHelper.showUserInfoFromServer(false, null, srcUid, null);
                // 阻止事件继续冒泡
                event.stopPropagation();
            };

            // 实现对话框中的列表点击item事件处理
            var fn_clickItem = function(event){

                // 取出uid值
                var srcUid = $(this).attr('srcuid');
                // 该行item所对应的返回数据中的数组索引
                var dataIndex = $(this).attr('dataIndex');

                var isSelectedValue = $(this).attr('isselected');
                var isSelected = (isSelectedValue == '1'?true:false);

                console.info('[用户选择列表-item点击] dataIndex='+dataIndex+',srcUid='+srcUid
                    +', isSelected='+isSelected+",isSelected="+isSelected
                    +', userEntitys.index='+JSON.stringify(userEntitys[dataIndex]));

                if(srcUid){

                    // 界面支持checkbox的模式下，才需要进行check逻辑处理
                    if (that.showCheckBox) {
                        // 支持多选
                        if (!that.singleSelection) {
                            //contentData.setSelected(!contentData.isSelected());
                            that.selectedOneItem(srcUid, !isSelected);
                        }
                        // 支持单选
                        else {
                            // 先取消其它的选中
                            that.unSelectedAllItem();
                            // 再选中当前
                            //contentData.setSelected(true);
                            that.selectedOneItem(srcUid, true);
                        }

                    }
                    // 否则点击item就显示该人员的个人信息
                    else{
                        RBChatDialogHelper.showUserInfoFromServer(false, null, srcUid, null);
                    }
                }

                // 设置确认按钮的显示
                that.setOkButtonForSelected(dialogId, that.getSelectedCount());

                // 阻止事件继续冒泡
                event.stopPropagation();
            };

            // 将事件循环添加到html的DOM对象上
            if(isHasItems){
                for(var i = 0; i<userEntitys.length;i++){

                    // 每一个好友请求元数据，都是一个完整的RosterElementEntity对象（详见【接口1008-4-7】接口文档或服务端代码）
                    var reqData = userEntitys[i];
                    var uid = reqData.user_uid;

                    // 为每一行的item增加点击事件
                    $("#im-user-chooser_li_"+uid).click(fn_clickItem);
                    // 为每一行的item头像增加点击事件
                    $("#im-user-chooser_li_avartarimg_"+uid).click(fn_clickHead);
                }
            }
        }
        // 数据为空时
        else{
            RBChatUtils.logToConsole('【RBChatUserChooserDialog.show】列表数据为空，本次解析已结束。');

            // 给一个空数据提示，提升用户体验
            RBChatDialogHelper.showNoDataDialog(null, "暂无更多数据");
        }
    };

    /**
     * 取消所有item的选中（状态）。
     */
    RBChatUserChooserDialog.prototype.unSelectedAllItem = function() {
        // 所有的item
        var itemList = $('#im-user-chooser-list-content').children();
        // 遍历每一个item
        for(var i=0;i<itemList.length;i++){
            var item = itemList[i];

            if(item){
                var itemObj = $(item);
                // 取出uid值
                var srcUid = itemObj.attr('srcuid');
                // 清除选中状态
                this.selectedOneItem(srcUid, false);
            }
        }
    };

    /**
     * 设定一个item为选中状态。
     *
     * @param uid
     * @param toSelected
     */
    RBChatUserChooserDialog.prototype.selectedOneItem = function(uid, toSelected){

        var itemObj = $('#im-user-chooser_li_'+uid);
        // 取出uid值
        var srcUid = itemObj.attr('srcuid');

        // 设置选中状态的属性值
        itemObj.attr('isselected', toSelected?'1':'0');

        // 重置checkbox的ui显示
        var checkboxObj =  $('#im-user-chooser_li_checkbox_'+uid);
        // 先清除所有class
        checkboxObj.removeClass();
        // 再设置class（选中或未选中状态的class样式）
        checkboxObj.addClass(toSelected?'weui-icon-success':'weui-icon-circle');
    };

    /**
     * 获得单选模式下被选中的用户.
     *
     * @return UserEntity
     */
    RBChatUserChooserDialog.prototype.getSingleSelectedUser = function() {
        var retGme = null;

        // 所有的item
        var itemList = $('#im-user-chooser-list-content').children();
        // 遍历每一个item
        for(var i=0;i<itemList.length;i++){
            var item = itemList[i];
            if(item){
                var itemObj = $(item);
                var isSelected = (itemObj.attr('isselected') == '1');

                // 如果该item是“选中”的
                if(isSelected){
                    // 取出uid值
                    var srcUid = itemObj.attr('srcuid');
                    var nickname = $('#im-user-chooser_li_nickname_'+srcUid).text();

                    // JS对象
                    retGme = {
                        'user_uid': srcUid,
                        'nickname': nickname
                    };

                    // 跳出循环
                    break;
                }
                else{
                    // 继续循环，以尝试找到处于“选中”状态的item
                    continue;
                }
            }
        }

        return retGme;
    };

    /**
     * 获得当前选中的行。
     *
     * @return {Array<obj>} 对象数组
     */
    RBChatUserChooserDialog.prototype.getSelectedItems = function() {
        var items = new Array();

        // 所有的item
        var itemList = $('#im-user-chooser-list-content').children();
        // 遍历每一个item
        for(var i=0;i<itemList.length;i++) {
            var item = itemList[i];
            if (item) {
                var itemObj = $(item);
                var isSelected = (itemObj.attr('isselected') == '1');

                // 如果该item是“选中”的
                if (isSelected) {
                    // 取出uid值
                    var srcUid = itemObj.attr('srcuid');
                    var nickname = $('#im-user-chooser_li_nickname_' + srcUid).text();

                    // JS对象
                    var obj = {
                        'user_uid': srcUid,
                        'nickname': nickname
                    };

                    items.push(obj);
                }
            }
        }

        return items;
    };

    /**
     * 返回选中的行数。
     *
     * @return {Number} 选中的行数
     */
    RBChatUserChooserDialog.prototype.getSelectedCount = function() {
        var cnt = 0;
        var itemList = $('#im-user-chooser-list-content').children();
        for(var i=0;i<itemList.length;i++) {
            var item = itemList[i];

            if (item) {
                if($(item).attr('isselected') == '1'){
                    cnt += 1;
                }
            }
        }
        return cnt;
    };

    /**
     * 重置确认为初始状态：不可点击、文字内容显示为"确定"、以及按钮的UI样式为半透明效果。
     */
    RBChatUserChooserDialog.prototype.resetOkButton = function(dialogId) {
        var $btnOK = $('#dialog-footer-okbtn-'+dialogId);
        $btnOK.removeClass('btn-blue');
        $btnOK.addClass('btn-blue-light')

        if(this.usedForForInit == UserChooserDialogUsed.USED_FOR_SEND_CONTACT_MESSAGE )
            $btnOK.text("发送此名片");
        else
            $btnOK.text("确定");
    };

    /**
     * 决置确认按钮的可用性。
     *
     * @param enabled true表示可用，false表示禁用
     */
    RBChatUserChooserDialog.prototype.setOkButtonEnable = function(dialogId, enabled) {
        var $btnOK = $('#dialog-footer-okbtn-'+dialogId);
        if(enabled) {
            $btnOK.removeClass('btn-blue-light');
            $btnOK.addClass('btn-blue');
        }
        else {
            this.resetOkButton(dialogId);
        }
    };

    /**
     * 设置确认按钮上的选中数量，并根据选中数据量决定按钮是否可点击。
     *
     * @param selectedCount 已选中的行数
     */
    RBChatUserChooserDialog.prototype.setOkButtonForSelected = function(dialogId, selectedCount) {
        if(selectedCount > 0) {
            this.setOkButtonEnable(dialogId, true);

            var $btnOK = $('#dialog-footer-okbtn-'+dialogId);
            if(this.usedForForInit == UserChooserDialogUsed.USED_FOR_SEND_CONTACT_MESSAGE)
                $btnOK.text("发送此名片");
            else
                $btnOK.text("确定("+selectedCount+")");
        }
        else {
            this.setOkButtonEnable(dialogId, false);
        }
    };

    /**
     * 构造一个UserEntity对象。
     *
     * @param ree RosterElementEntity对象
     * @return {*} 返回UserEntity对象
     */
    RBChatUserChooserDialog.prototype.constructFromRosterElement = function(ree) {
        if(ree) {
            // UserEntity 对象
            var m = {
                'user_uid': ree.user_uid,
                'nickname': ree.nickname,
                'selected': false
            };

            return m;
        }
        return null;
    };


    // 注意：此处的参数是传递给 RBChatUserChooserDialog 的构造函数的哦
    return new RBChatUserChooserDialog(usedForForInit, chatTypeForInit, toIdForInit);
};