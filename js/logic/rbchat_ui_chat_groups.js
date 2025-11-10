
var RBChatGroupsUI = (function () {
    const eventBus = window.App.EventBus;

    // 构造器（相当于java里的构造方法）
    var UIModule3_2 = function (argument){

       

        if(RBChatUtils.isMobile()){
             // 没有数据时显示的空数据提示ui根对象
            this.$emptyUIRoot = $('#kchat-im-panel-userlist-empty-groups-phone');
            // 有数据时正常显示数据的ui根对象
            this.$notEmptyUIRoot = $('#kchat-im-panel-userlist-groups-phone');
             // 创建群组按钮
            this.$createGroupBtn = $('#nav_bar_r_2');
        }else{
             // 没有数据时显示的空数据提示ui根对象
            this.$emptyUIRoot = $('#kchat-im-panel-userlist-empty-groups');
            // 有数据时正常显示数据的ui根对象
            this.$notEmptyUIRoot = $('#kchat-im-panel-userlist-groups');
             // 创建群组按钮
            this.$createGroupBtn = $('#im-panel-userlist-wrap-groups-creategroup');
        }
       
    };

    /**
     * 本封装对象的所有初始化动作，放在本函数中执行。
     */
    UIModule3_2.prototype.init = function () {
        this.initButtonsEvent();
    };

    /**
     * 为按钮增加点击事件处理。
     */
    UIModule3_2.prototype.initButtonsEvent = function(){

         // 添加搜索事件
         $('#kchat-im-panel-userlist-groups-input').bind('input porpertychange',function(){
            var  val = $(this).val();
            if(val.length > 0){
                //匹配值
                $('#kchat-im-panel-userlist-groups li').each(function(i,item){
                    const name = $(item).find("h4 span").text()
                    $(item).css('display', name.indexOf(val)>= 0? '':'none');
                })

            }else{
                $('#kchat-im-panel-userlist-groups li').css('display','')
            }
        })

        // 点击添加好友按钮的事件处理
        this.$createGroupBtn.click(function(event){
            // 显示创建群聊对话框
            RBChatDialogHelper.showCreateGroupDialog();
            // 阻止事件冒泡
            event.stopPropagation();
        });
    };

    UIModule3_2.prototype.reloadFromCache = function () {
        this.refreshListUI(GroupsProvider.getGroupsListData());
    };

    /**
     * 用新的群组列表数据刷新列表的ui显示。
     *
     * @param reeObjs 使用新的GroupEntity对象数组，来刷新列表UI
     */
    UIModule3_2.prototype.refreshListUI = function (reeObjs) {

        // 先清空显示
        this.clear();

        // 再用新的数据构建列表ui
        if(reeObjs && reeObjs.length > 0){
            for(var i = 0; i<reeObjs.length;i++){
                var ree = reeObjs[i];
                this.add(ree, false);
            }
            // this.newAdd(reeObjs, false)
        }

        // 刷新当前群聊数量的UI显示，并决定内容面板的显示与否
        this.refreshGroupsItemCountShow();
    };

    UIModule3_2.prototype.clear = function(){
        // 清空列表ui显示内容
        this.$notEmptyUIRoot.empty();
    };

    /**
     * 添加一个群组item到ui上。
     *
     * @param ree GroupEntity对象（详见：http://docs.52im.net/extend/docs/api/rainbowchatserver4_pro/com/x52im/rainbowchat/http/logic/dto/GroupEntity.html）
     * @param toFirst true 表示添加到列表最前面，否则添加到尾部（不传本参数则默认表示加到列表尾部）
     */
    UIModule3_2.prototype.add = function(ge, toFirst){

        var gid = ge.g_id;
        var gname = ge.g_name;
        /** 当前群员数 */
        var g_member_count = ge.g_member_count;
        /** 群主uid */
        var g_owner_user_uid = ge.g_owner_user_uid;
        /** 群创建时间 */
        var create_time = ge.create_time;

        //var avartarFileName = ree.userAvatarFileName;
        //var whatsup = ree.whatsUp;
        //var hasAvatar = (!RBChatUtils.isStringEmpty(avartarFileName));
        //var hasWhatsup = (!RBChatUtils.isStringEmpty(whatsup));
        //
        //var contentToShow1 = (hasWhatsup?"[签名] "+whatsup:"UID："+uid);
        //var contentToShow2 = (hasWhatsup?"[个人签名] "+whatsup:"UID："+uid);

        // true表示本地用户就是该群的群主，否则不是
        var localUserIsGroupOwner = GroupsProvider.isGroupOwner(g_owner_user_uid);

        var that = this;

        var  avatarUrl = RBChatUtils.getGroupAvatarDownloadURL(gid, false);
        const defaultColor = RBChatUtils.getBgColor(gid)
        const show_t = gname.substr(0, 1).toUpperCase();
    
         const _gg_id = "group_li_gavatar_"+gid;
        // 准备好item的html
        var html =
            "<li id=\'group_li_gid_"+gid+"\' title=\'GID: "+gid+"\' im-date=\'"+gid+"\'>"+
            "    <div>"+
            "	<a class=\'top-tag\' title=\'Current Tag\'></a>"+
            "	<div class=\'avatar-source human\'>"+
            "        <div style='background:"+defaultColor+"'>"+show_t+" </div>"+
            // "	    <img id=\'"+_gg_id+"\' src=\'"+avatarUrl+"\' onerror='javascript:$(this).remove()'>"+
            "	    <img "+(localUserIsGroupOwner?"":"style=\'display:none;\'")+" title=\'我是该群的群主!\' id=\'li-group-ownerflag_"+gid+"\' class=\'group-ownerflag\' src=\'../images/groupchat_grous_list_item_owner2.png\'>"+
            "	</div>"+
            "	<div class=\'info\'>"+
            "	    <h4><span id=\'group_li_gname_"+gid+"\'>"+gname+"</span></h4>"+
            "	    <p>"+
            "		<span>创建于 "+create_time+"</span>"+
            //"		<img id=\'li-group-silentflag\' src=\'../../images/main_alarms_list_item_icon_notify.png\'>"+
            "	    </p>"+
            "	</div>"+
            "    </div>"+
            "</li>";

        // 添加到群组列表
        if(toFirst){
            this.$notEmptyUIRoot.prepend(html);
        }
        else{
            this.$notEmptyUIRoot.append(html);
        }

        // 点击事件
        $("#group_li_gid_"+gid).click(function(){
            // 取出uid值
            //var vid = $("#online_li_vid_"+visitorId).attr('im-date');

            // 设置选中（即打开聊天界面）
            that.selectedGroup(gid);
            RBChatChattingContentPaneUI.showRightChatContent();
            RBChatChattingContentPaneUI.scrollToBottom4IM(gid);
            
            setTimeout(() => {
                document.querySelector('.im-panel-inputcontent')?.focus()
            })


            $('#im-panel-main-chatcontentpane-toplevel').css({ 'display': 'block' });
            $('#footer_i').css({ 'display': 'none' });
            $('#chat_top_name').text(gname);
            //alert('打开群组的聊天界面功能稍后实现！！！');
        });

        // eventBus.emit('conversations:add1', {
        //     ge,
        //     ...ge, html, toFirst,
        //     gid, gname, g_member_count, g_owner_user_uid, create_time,
        //     localUserIsGroupOwner, defaultColor, show_t, avatarUrl
        //  });


        // 刷新当前群组数量的UI显示，并决定内容面板的显示与否
        this.refreshGroupsItemCountShow();

        RBChatUtils.logToConsole('【群组列表UI处理】群组'+gid+'已插入到列表UI中。【OK】');
    };
    UIModule3_2.prototype.getaddList = function(ree, toFirst){
        let ge = ree
        var gid = ge.g_id;
        var gname = ge.g_name;
        /** 当前群员数 */
        var g_member_count = ge.g_member_count;
        /** 群主uid */
        var g_owner_user_uid = ge.g_owner_user_uid;
        /** 群创建时间 */
        var create_time = ge.create_time;

        //var avartarFileName = ree.userAvatarFileName;
        //var whatsup = ree.whatsUp;
        //var hasAvatar = (!RBChatUtils.isStringEmpty(avartarFileName));
        //var hasWhatsup = (!RBChatUtils.isStringEmpty(whatsup));
        //
        //var contentToShow1 = (hasWhatsup?"[签名] "+whatsup:"UID："+uid);
        //var contentToShow2 = (hasWhatsup?"[个人签名] "+whatsup:"UID："+uid);

        // true表示本地用户就是该群的群主，否则不是
        var localUserIsGroupOwner = GroupsProvider.isGroupOwner(g_owner_user_uid);

        var that = this;

        var  avatarUrl = RBChatUtils.getGroupAvatarDownloadURL(gid, false);
        const defaultColor = RBChatUtils.getBgColor(gid)
        const show_t = gname.substr(0, 1).toUpperCase();

        const _gg_id = "group_li_gavatar_"+gid;
        // 准备好item的html
        var html =
            "<div>"+
            "	<a class=\'top-tag\' title=\'Current Tag\'></a>"+
            "	<div class=\'avatar-source human\'>"+
            "        <div style='background:"+defaultColor+"'>"+show_t+" </div>"+
            "	    <img id=\'"+_gg_id+"\' src=\'"+avatarUrl+"\' onerror='javascript:$(this).remove()'>"+
            "	    <img "+(localUserIsGroupOwner?"":"style=\'display:none;\'")+" title=\'我是该群的群主!\' id=\'li-group-ownerflag_"+gid+"\' class=\'group-ownerflag\' src=\'../images/groupchat_grous_list_item_owner2.png\'>"+
            "	</div>"+
            "	<div class=\'info\'>"+
            "	    <h4><span id=\'group_li_gname_"+gid+"\'>"+gname+"</span></h4>"+
            "	    <p>"+
            "		<span>创建于 "+create_time+"</span>"+
            //"		<img id=\'li-group-silentflag\' src=\'../../images/main_alarms_list_item_icon_notify.png\'>"+
            "	    </p>"+
            "	</div>"+
            "</div>";
            return html;
    };
    UIModule3_2.prototype.newAdd = function(ree){
        var that = this;
        const len = ree.length;
        let el = document.getElementById('kchat-im-panel-userlist-groups');
        var getClickList = function (reeF, toFirst){
            var ge = reeF
            var gid = ge.g_id;
            // 点击事件
            $("#group_li_gid_"+gid).click(function(){
                // 取出uid值
                // 设置选中（即打开聊天界面）
                that.selectedGroup(gid);
                RBChatChattingContentPaneUI.showRightChatContent();
                RBChatChattingContentPaneUI.scrollToBottom4IM(gid);
                //alert('打开群组的聊天界面功能稍后实现！！！');
            });

        }
        setTimeout(() => {
            // 插入十万条数据
            const total =len;
            // 一次20条，可根据性能问题自己调整
            const MAX_ONCE = 20;
            // 渲染数据需要的次数
            const loopCount = total / MAX_ONCE + (total%MAX_ONCE == 0 ? 0:1);
            let countOfRender = 0;
            function add() {
                // 优化，不允许插入数据引起回流
                const fragment = document.createDocumentFragment();
                for (let i = 0; i < MAX_ONCE; i++) {
                    if(countOfRender*MAX_ONCE+i < total){
                        const item = ree[countOfRender*MAX_ONCE+i]
                        var gid = item.g_id;
                        const li = document.createElement("li");
                        li.setAttribute("id",`group_li_gid_${gid}`);
                        li.setAttribute("title",`GID ${gid}`);
                        li.setAttribute("im-date",`${gid}`);
                        li.innerHTML = that.getaddList(item, false)
                        fragment.appendChild(li);
                    }
                }
                el.appendChild(fragment);
                countOfRender += 1;
                loop();
            }

            function loop() {
                if (countOfRender < loopCount) {
                    window.requestAnimationFrame(add);
                }
            }

            loop();
            setTimeout(() => {
                getCkickF()
            }, 250);

        }, 0);

        // 调用点击事件
        var getCkickF = function (){
            for(var i = 0; i< ree.length; i++){
                const item = ree[i];
                getClickList(item, false)
            }
            that.refreshGroupsItemCountShow();
        }
    };

    /**
     * 更新群名称的UI显示。
     *
     * @param gid 要被更新的群id
     * @param newGroupName 新的群名称
     */
    UIModule3_2.prototype.updateGroupName = function(gid, newGroupName){
        var gnameItemObj = $("#group_li_gname_"+gid);
        if(newGroupName){
            gnameItemObj.text(newGroupName);
        }
    };

    /**
     * 更新列表Item中指定群的“群主”标志的可见性。
     *
     * @param gid
     * @param isGroupOwner true表示可见，否则不可见
     */
    UIModule3_2.prototype.updateGroupOwnerFlagShow = function(gid, isGroupOwner){
        var $obj = $("#li-group-ownerflag_"+gid);
        if(isGroupOwner){
            $obj.show();
        }
        else{
            $obj.hide();
        }
    };

    /**
     * 刷新群组头像的显示（此种情况主要用于：群成员变动时，群头像可能已经在服务端重新生成，刷新的目的是为了及时同步显示之）。
     *
     * @param gid
     */
    UIModule3_2.prototype.updateGroupAvatarShow = function(gid){
        var $avatar = $('#group_li_gavatar_'+gid)
        if($avatar){
            $avatar.attr('src', RBChatUtils.getGroupAvatarDownloadURL(gid, true));
        }
    };

    /**
     * 将群组的item从UI列表中删除。
     *
     * @param gid
     */
    UIModule3_2.prototype.deleteItem = function(gid){
        // 将item从从ui列表上移除
        $('#group_li_gid_'+gid).remove();
    };

    /**
     * 设置一个群组为选中/聊天状态（并处理相应的数据加载、UI显示等完整逻辑）.
     *
     * 注意：本方法的点击事件处理逻辑跟首页“消息”里的群组聊天item点击处理逻辑是基本
     * 一致的(详见rhchat_ui_module.js的RBChatAlarmsUI对象的selectItem(..)函数)！
     *
     * @param gid
     */
    UIModule3_2.prototype.selectedGroup = function(gid){

        RBChatUtils.showChatDetail();

        var _selectedAlarmType = RBChatMainUI.getCurrentSelectedAlarmType();
        var _selectecAlarmDataId = RBChatMainUI.getCurrentSelectedAlarmDataId();

        // 如果当前item已经被选中过了，就不需要再次触发selected了
        if ((_selectedAlarmType != -1 && _selectedAlarmType === AlarmMessageType.groupChatMessage)
            &&　(_selectecAlarmDataId && gid && _selectecAlarmDataId === gid)) {
            // console.log('【群组列表选中】当前item已处于selected状态，无需再次触发selected处理(当前_selectedAlarmType='
            //     +_selectedAlarmType+' | _selectecAlarmDataId='
            //     + _selectecAlarmDataId+", 上将要选中的gid="+gid+")");

            // ui上显示为选中样式
            //$("#alarms_li_"+_selectedAlarmType+"_"+_selectecAlarmDataId).addClass("active");
        }
        else{
            // 本条设置选中前，如果之前已经有选中，则应首先取消此item的“选中”ui样式
            // 条件：即当_currentChattingUserId不为空且不为'N/A'时即表示是有效的选中
            // 说明：此处的'N/A'是由removeOnlineVisitor时设置，详见对应代码处的注释。
            if (_selectedAlarmType != -1 && (_selectecAlarmDataId && _selectecAlarmDataId !== 'N/A')) {
                $("#group_li_gid_"+_selectecAlarmDataId).removeClass("active");

                // 保存聊天文本输入框中未发出的内容为草稿
                var draft = RBChatChattingContentPaneUI.getInputContent();
                if(!RBChatChattingContentPaneUI.isInputContentEmpty()) {
                    // 保存
                    MessagesDraftCache.putDraft(_selectedAlarmType, _selectecAlarmDataId, draft);
                    // 清空输入框
                    RBChatChattingContentPaneUI.clearInputContent();
                    // 首页“消息”的对应item上，更新显示内容为“[草稿]。。。。”
                    RBChatAlarmsUI.setDraftShow(_selectedAlarmType, _selectecAlarmDataId, draft);
                }
            }

            // 设置当前id为最新选中的DOM id
            _selectedAlarmType = AlarmMessageType.groupChatMessage; // 群组聊天，对应的首页“消息”类型默认就是这个
            _selectecAlarmDataId = gid;
            if (window._chatType != 'window') {
                RBChatMainUI.setCurrentSelectedAlarm(_selectedAlarmType, _selectecAlarmDataId);
            }

            // console.log('【群组列表选中】您当前点击（选中）的好友是gid='+gid);

            // ui上显示为选中样式
            $("#group_li_gid_"+gid).addClass("active");

            // 恢复聊天文本输入框中未发出的草稿内容
            if(MessagesDraftCache.containsDraft(_selectedAlarmType, _selectecAlarmDataId)){
                // 恢复草稿到输入框
                RBChatChattingContentPaneUI.setInputContent(MessagesDraftCache.getDraft(_selectedAlarmType, _selectecAlarmDataId));
                // 清除“草稿”缓存
                MessagesDraftCache.removeDraft(_selectedAlarmType, _selectecAlarmDataId);
                // 清除首页“消息”的对应item上的“[草稿]。。。。”的内容显示
                RBChatAlarmsUI.clearDraftShow(_selectedAlarmType, _selectecAlarmDataId);
            }

            // 输入框获得焦点
            RBChatChattingContentPaneUI.foucusToInputContent();

            // 同时取消首页“消息”item上的未读标识的显示（如果已显示未读标识的话）
            //setOnlineVisitorUnread(visitorId, false);
            RBChatAlarmsUI.resetUnread(_selectedAlarmType, _selectecAlarmDataId);

            window.alarms_msg={
                alarmMessageType:_selectedAlarmType,
                dataId:gid
            }

            RBChatChattingContentPaneUI.loadCacheHistoryFromCache2(_selectedAlarmType, gid)

            // // 载入存放在本地JS缓存中的当前visitor的聊天记录
            RBChatChattingContentPaneUI.loadChatHistoryFromLocalCache(_selectedAlarmType, gid);

            // // 尝试从服务端加载该用户的聊天历史记录
            RBChatChattingContentPaneUI.loadChattingHistoryFromServer(_selectedAlarmType, gid);

            // 加载右边的详情查看功能
            RBChatRightDetailUI.showTabsForSelectedAlarm(AlarmMessageType.groupChatMessage, gid);
        }
        //
        //// just for debug!!!!!!!!!!!!!!!!!
        //SingleChattingCache.showAllCacheForDebug();
    };

    /**
     * 刷新群组item总数的UI显示，并同时决定内容UI的可见性（当Item数为0时显示空UI，否则显示正常的列表UI，提升体验）。
     */
    UIModule3_2.prototype.refreshGroupsItemCountShow = function(){
        var cntUIObj1 = $('#im-panel-userlist-wrap-groups-allcount');
        var cnt = GroupsProvider.size();

        if(cnt){
            cntUIObj1.text(cnt);
            if(this.$notEmptyUIRoot.css('display')== 'none') {
                this.$notEmptyUIRoot.show();
            }

            if(this.$emptyUIRoot.css('display')== 'block'){
                this.$emptyUIRoot.hide();
            }
            //cntUIObj2.text(cnt);
        }
        else{
            cntUIObj1.text(0);
            this.$notEmptyUIRoot.hide();
            this.$emptyUIRoot.show();
            //cntUIObj2.text(0);
        }
    };

    /**
     * 刷新列表中群组的选中ui选中样式显示（跟首页“消息”里的item选中内容保持一致！）.
     *
     * 本方法主要用于主界面，左边的主tab列表切换时，即时根据首页“消息”的选中情况，刷新本列表中对应群组的选中样式（不然ui选中样式就不同步了哦）。
     */
    UIModule3_2.prototype.refreshGroupItemSelectedUI = function(){
        var _selectedAlarmType = RBChatMainUI.getCurrentSelectedAlarmType();
        var _selectecAlarmDataId = RBChatMainUI.getCurrentSelectedAlarmDataId();

        // 将先将所有群组列表的item的ui选中样式清除（也就是#kchat-im-panel-userlist-groups元素的直接子li）
        var $allRosterItems = $('#kchat-im-panel-userlist-groups li');
        $allRosterItems.removeClass('active');

        // 刷新显示对应群组item的选中样式（目的是与首页“消息”里的item选中情况保持同步）
        if (_selectedAlarmType === AlarmMessageType.groupChatMessage && (_selectecAlarmDataId && _selectecAlarmDataId !== 'N/A')) {
            $("#group_li_gid_"+_selectecAlarmDataId).addClass("active");
        }
    };


    // 新建本模块对象
    var thisModule = new UIModule3_2();
    // 调用初始化方法
    thisModule.init();

    return thisModule;// 此种方式用于构造器的方式
})();