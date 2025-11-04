
var RBChatRightDetailUI = (function () {

    // 构造器（相当于java里的构造方法）
    var UIModule6 = function (argument) {

    };

    // 选中首页“消息”的item时，在主UI的右边显示对应的详情查看tabs
    UIModule6.prototype.showTabsForSelectedAlarm = function(alarmMessageType, uid){
        if (!RBChatSmallWindowUI.checkIsWindow(uid)) {
            this.clearTabs();
            this.clearDetailContent();
            this.clearBottom();
        } else if (window.scrollInfo?.beyongDataId == uid) {
            this.clearTabs('parent');
            this.clearDetailContent('parent');
        }
        try {
            const _dataId = $('#kchat-im-panel #im-panel-main-rightdetail-content').attr('dataId')
            if ((!_dataId && RBChatSmallWindowUI.checkIsWindow(uid)) || (RBChatSmallWindowUI.checkIsWindow(uid) && _dataId == uid)) {
                RBChatSmallWindowUI.getWindowDom('#im-panel-main-rightdetail-content', null, uid).empty();
                RBChatSmallWindowUI.getWindowDom('#kchat-im-panel .im-panel-inputcontent', null, uid).attr('placeholder', '禁言中 …')
                RBChatSmallWindowUI.getWindowDom('#kchat-im-panel .im-panel-inputcontent', null, uid).attr('disabled', true)
            } else {
                RBChatSmallWindowUI.getWindowDom('#kchat-im-panel .im-panel-inputcontent', null, uid).attr('placeholder', '输入聊天信息，按 Enter 键快速发送 …')
                RBChatSmallWindowUI.getWindowDom('#kchat-im-panel .im-panel-inputcontent', null, uid).attr('disabled', false)
            }
        } catch (err) {}

        var that = this;

        var navObj = $('#im-panel-header-righttabs');

        if (RBChatSmallWindowUI.checkIsWindow(uid)) {
            navObj = RBChatSmallWindowUI.getWindowDom(`.im-panel-main-rightdetail-content-nav`, null, uid)
        }

        // 对应的是好友聊天消息、陌生人聊天消息时
        if(alarmMessageType == AlarmMessageType.tempChatMessage
            || alarmMessageType == AlarmMessageType.reviceMessage){

            var isFriend = (alarmMessageType == AlarmMessageType.reviceMessage);

            var baseInfoTabHTML = '<a id=\"im-panel-header-righttabs-singleuser-baseinfo\" tabident=\"0\">'+(isFriend?'好友':'对方')+'信息</a>';
            // var photosTabHTML = '<a id=\"im-panel-header-righttabs-singleuser-photos\" tabident=\"1\">'+(isFriend?'好友':'对方')+'相册</a>';
            // var voicesTabHTML = '<a id=\"im-panel-header-righttabs-singleuser-voices\" tabident=\"2\">语音介绍</a>';

            if (RBChatSmallWindowUI.checkIsWindow(uid)) {
                navObj.empty()
                baseInfoTabHTML = '<a class=\"im-panel-header-righttabs-singleuser-baseinfo\" tabident=\"0\">'+(isFriend?'好友':'对方')+'信息</a>';
            }

            navObj.append(baseInfoTabHTML);
            // navObj.append(photosTabHTML);
            // navObj.append(voicesTabHTML);

            // 重置聊天信息
            window.groupInfo = null;

            // 为本次添加的所有子tab对象增加点击切换事件（子tab就是nav下的所有<a>元素）
            var $allTabs = $('#im-panel-header-righttabs a');
            if (RBChatSmallWindowUI.checkIsWindow(uid)) {
                $allTabs = RBChatSmallWindowUI.getWindowDom(`.im-panel-main-rightdetail-content-nav a`, null, uid)
                
            }
            if($allTabs) {
                // 循环为每一个tab添加点击事件
                for(var i=0; i<$allTabs.length; i++) {
                    var $tabCell = $($allTabs[i]);

                    // 点击事件
                    $tabCell.click(function(){

                        /** 第一步：先设置tab的选中状态 */
                        // 先其它其它tab的选中状态（jquery对象支持对一个数组的所有
                        // 元素进行设置，所以最简单的办法就是给数据所有对象取消选中状态）
                        $allTabs.removeClass('active');
                        // 设置当前tab为选中状态（注意：this为JS原先DOM对象，而$(this)才
                        // 是jQuery对象，因为这个点击事件是由JS自已的事件机制调用，跟jQuery
                        // 无关，所以这个this就是原生DOM而非jQuery对象）
                        $(this).addClass('active');

                        // 取出各tab存放于tabident属性的标识值（用于区分当前点击的到底是什么tab嘛）
                        var tabident = $(this).attr('tabident');

                        //alert('tabindex='+tabindex);

                        /** 第二步：再设置各tab对应列表UI的显示，以及选中tab后要额外做的事（即调用disSelect... 方法） */
                        //    // 先简单的调用此id通配符方式来隐藏列表ui（这样方便，省的要一个一个判断哪个列表当前处
                        //    // 于已显示状态并设置不隐藏，下面具体的tab判断代码会具体再设置要显示哪个列表ui）
                        //$("div[id^=im-panel-userlist-wrap-]").hide();// 查出以此id为开头的所有对象

                        // 如果点击的是“个人信息”ta
                        if(tabident == 0) {// 注意：因取出的tabident是字符串，此处不能用===判断哦,
                            //$('#im-panel-userlist-wrap-alarms').show();
                            that.didSelectSingleUserBaseInfoTab(uid);
                        }
                        else if(tabident == 1) {
                            //$('#im-panel-userlist-wrap-roster').show();
                            that.didSelectSingleUserPhotosTab(uid);
                        }
                        else if(tabident == 2){
                            //$('#im-panel-userlist-wrap-groups').show();
                            that.didSelectSingleUserVoicesTab(uid);
                        }
                    });
                }

                if (RBChatSmallWindowUI.checkIsWindow(uid)) {
                    $(`#${RBChatSmallWindowUI.getWindowId(uid)} .im-panel-header-righttabs-singleuser-baseinfo`).click();
                } else {
                    $('#im-panel-header-righttabs-singleuser-baseinfo').click();
                }
                // 默认显示第一个tab的内容
                // FIXME: 建议可按需停用以下代码，因次切换用户都会加载用户基本数据，在网络不好的情况会，会给人IM加载体验不好的坏印象
            }
        }
        // 群聊天消息时
        else if(alarmMessageType == AlarmMessageType.groupChatMessage){
            // 在UI上显示Tab
            var groupBaseInfoTabHTML = '<a id=\"im-panel-header-righttabs-group-baseinfo\" tabident=\"0\" class=\"active\">群组信息</a>';
            if (RBChatSmallWindowUI.checkIsWindow(uid)) {
                navObj.empty()
            }
            navObj.append(groupBaseInfoTabHTML);

            // tab点击事件
            RBChatSmallWindowUI.getWindowDom('#im-panel-header-righttabs-group-baseinfo', null, uid).click(function(){
                // 加载并显示群基本信息
                that.loadGroupBaseInfoFromServer(uid);
            });

            // 默认显示第一个tab的内容
            RBChatSmallWindowUI.getWindowDom('#im-panel-header-righttabs-group-baseinfo', null, uid).click();//this.showGroupBaseInfo(GroupsProvider.getGroupInfoByGid(uid));
        }

        // FIXME 提示： 如果还有其它类型，请在此处理tab的显示逻辑
    };

    /**
     * 当前已选中用户基本信息tab后，要做的事。
     *
     * @param uid
     */
    UIModule6.prototype.didSelectSingleUserBaseInfoTab = function(uid){
        this.loadSingleUserBaseInfoFromServer(uid);
    };

    /**
     * 当前已选中用户个人相册tab后，要做的事。
     *
     * @param uid
     */
    UIModule6.prototype.didSelectSingleUserPhotosTab = function(uid){
        this.loadSingerUserPhotosListFromServer(uid);
    };

    /**
     * 当前已选中用户语音介绍tab后，要做的事。
     *
     * @param uid
     */
    UIModule6.prototype.didSelectSingleUserVoicesTab = function(uid){
        this.loadSingerUserVoicesListFromServer(uid);
    };

    /**
     * 显示用户（好友或陌生人）的个人基本信息。
     *
     * @param ree RosterElementEntity对象（对应字段详见：
     * http://docs.52im.net/extend/docs/api/rainbowchatserver4_pro/com/x52im/rainbowchat/http/logic/dto/RosterElementEntity.html）。
     *
     * @see RBChatDialogHelper.showUserInfo(ree)
     */
    UIModule6.prototype.showSingerUserBaseInfo = function(ree,groups=null, chatId){

        var uid = ree.user_uid;
        var nickname = ree.nickname;
        var whatsup = ree.whatsUp;
        var mail = ree.user_mail;
        var register_time = ree.register_time;
        var latest_login_time = ree.latestOfflineTime;
        var latest_login_ip = ree.latest_login_ip;
        var userDesc = ree.userDesc;
        var  memberRemark = ree.memberRemark ?ree.memberRemark:'未设置'
        var sourceTxt = '其他';
        if(ree.sourceType == 'DS'){
            sourceTxt = '袋鼠or快直播'
        }
        if(ree.sourceType == 'YY'){
            sourceTxt = '元友'
        }

        // console.log('用户信息', )

        var isMan = ('1' == ree.user_sex);
        var isFriend = ree.isFriend == '1' || RosterProvider.isUserInRoster(uid);

        if(latest_login_time){}
            // latest_login_time = RBChatUtils.utcTimestampToString(latest_login_time);
        else
            latest_login_time = '从未登陆';
        /* if (ree.online){
            latest_login_time = '当前在线'
        } */
        if (ree.isOnline == 1 || ree.onlineWeb == 1){
            latest_login_time = '当前在线'
        }

        if(!whatsup)
            whatsup = '此人超懒，什么都没留下...';

        if(!userDesc)
            userDesc = '没有更多说明...';

        var groups_html='';
        if(groups){
            var temp_groups = groups.map(item=>{
                return item[0]+' '+item[1];
            })
            groups_html = temp_groups.join('<br/>')
        }

        // 是群管
        const isManager = LocalUserInfo.getObj().isAdmin - 0 == 1;


        const defaultColor = RBChatUtils.getBgColor(uid)
        const show_t = nickname.substr(0, 1).toUpperCase();
        const groups_show_status = localStorage.getItem('group_show_status_'+uid);
        let is_member_remark_fold = true

        // 会员备注 展开与折叠
        // window.fold_member_remark_status_change = function(){
        //     if (is_member_remark_fold) {
        //         is_member_remark_fold = false
        //         $('#member_remark_fold_btn').text('折叠')
        //         $('#im-panel-main-rightdetail-content-lb-remark4friend-2').addClass('unfold')
        //     } else {
        //         is_member_remark_fold = true
        //         $('#member_remark_fold_btn').text('展开')
        //         $('#im-panel-main-rightdetail-content-lb-remark4friend-2').removeClass('unfold')
        //     }
            
        // }

        // 关于好友的显示与隐藏
        window.show_groups_status_change = function(uid){
            const  key  = 'group_show_status_'+uid;
            const d = localStorage.getItem(key);
            // 隐藏切到显示
            if(d){
                RBChatSmallWindowUI.getWindowDom('.groups_content', null, uid).show();
                localStorage.removeItem(key);
                RBChatSmallWindowUI.getWindowDom('.groups_content_bt', null, uid).text('隐藏')
            // 显示切到隐藏
            }else{
                RBChatSmallWindowUI.getWindowDom('.groups_content', null, uid).hide();
                localStorage.setItem(key,'1')
                RBChatSmallWindowUI.getWindowDom('.groups_content_bt', null, uid).text('显示')
            }
        }

        window.refresh_friend = (uid) => {
            RBChatRestHelper.submitGetUserInfoToServer(false, null, uid
                // 数据读取成功后的回调
                , (returnValue) => {
                    // 服务端返回的是java对象RosterElementEntity的JSON文本
                    const ree2 = JSON.parse(returnValue);
                    // if (!RBChatSmallWindowUI.checkIsWindow(uid) && window.scrollInfo?.beyongDataId != uid) {
                    //     return
                    // }
                    if(ree2){
                        this.showSingerUserBaseInfo(ree2, groups, uid);
                    }
                    else {
                        RBChatUtils.logToConsole('[前端-GET-【接口1008-3-8】用户/好友的个人信息获取接口返回值解析后] 数据为空，' +
                            '无需进入ui处理代码。(returnValue=' + returnValue + ')', true);
                    }
                }
                // 数据读取失败后的回调
                , function (errorThrownStr){
                    //alert('用户'+uid+'的基本信息数据读取出错，原因是：'+errorThrownStr);
                    RBChatDialogHelper.showAlertDialog_WARN('加载失败', '用户'+uid+'的基本信息数据读取出错，可能是网络故障，请稍后再试！');
                }
                , false
                , null
                , window._chatType != 'window'
            );
        }

        let  noPayDate = '';
        if(ree.uedLastRechargeDate && ree.nowTime){
            noPayDate = RBChatUtils.dateDiff(ree.nowTime, ree.uedLastRechargeDate);
        }

        window.userActttnotFound = function(obj){
            obj.parent().parent().children().eq(0).css('background', defaultColor)
            obj.remove()
        }

       // if(RBChatUtils.isMobile()){
            $('#chat_top_name').text(RBChatUtils.getNickNameWithRemark(ree))
      //  }

        const deviceMapping = {
            '0': '安卓',
            '1': 'IOS',
            '2': 'Web'
        } 
        const deviceType = deviceMapping[ree.ct] || '其他'
        const agentUid = ree.agentUid == '0' || !ree.agentUid ? '无' : ree.agentUid
        const agentUed = ree.agentUed == '0' || !ree.agentUed ? '无' : ree.agentUed
        // var heade_photo = ree.userAvatarFileName && ree.userAvatarFileName.length > 0 ? 'https://oss.nongzhiw.cn/head/'+ree.userAvatarFileName:'';
        var heade_photo = ree.userAvatarFileName && ree.userAvatarFileName.length > 0 ? RBChatConfig.FILE_HTTPS_URL + '/head/'+ree.userAvatarFileName:'';
        var html =
            '<div class=\"chat-user-info-headinfo\">'+
            '   <div class="avatar-wrapper">'+ 
            "       <div id=\'im-panel-main-rightdetail-content-user-default-avatar-"+uid+"\'  class='avator' >"+show_t+" </div>"+
            '       <a target=\"_blank\" href=\"'+heade_photo+'\">'+
            '           <img onerror=\'javascript:userActttnotFound($(this))\' id=\"im-panel-main-rightdetail-content-user-avatar\" src=\"'+heade_photo+'\">'+
            '       </a>'+
            '   </div>'+
            '   <div class=\"info\">'+
            '       <h4 class=\"im-panel-main-rightdetail-content-user-showname\" title=\"'+RBChatUtils.getNickNameWithRemark(ree)+'\">'+nickname+'</h4>'+
            '       <span style=\'cursor: pointer\' class=\"im-panel-main-rightdetail-content-user-whatsup\" title=\"[个性签名] '+whatsup+'\">'+whatsup+'</span>'+
            '   </div>'+
            '   <img id=\"im-panel-main-rightdetail-content-sexicon\" class=\"sex\" title="'+(isMan?'性别：男':'性别：女')+'" src=\"'+(isMan?'images/sns_friend_list_form_item_male_img.png':'images/sns_friend_list_form_item_female_img.png')+'\">'+
            (isFriend?'':'<span id=\"im-panel-main-rightdetail-content-guestflag\" class=\"guest_flag\" title=\"陌生人\">陌生人</span>')+
            '   <div class=\"clear\" style=\"clear: both;\"></div>'+
            '</div>'+
            '<dl class=\"im-panel-main-rightdetail-content-editremark4friend-layout\" style="\"'+(isFriend?"":"display:none;")+'\">'+
            '   <dt>设置备注 <i class=\"im-panel-main-rightdetail-content-editremark4friend-btn icon-edit\"></i></dt>'+
            '   <dd><span class=\"label\">好友备注：</span><span class=\"im-panel-main-rightdetail-content-lb-remark4friend content content_autowrap\">'+""+'</span></dd>'+
            '   <dd><span class=\"label\">更多描述：</span><span class=\"im-panel-main-rightdetail-content-lb-moredesc4friend content\" style=\"display: inline;\">'+""+'</span></dd>'+
            '</dl>'+
            '</div>'+
            '<dl class=\"im-panel-main-rightdetail-content-editremark4friend-layout-2\" style="\"'+(isFriend?"":"display:none;")+'\">'+
            '   <dt>会员备注(群管共享) <i class=\"im-panel-main-rightdetail-content-editremark4friend-btn-2 icon-edit\"></i></dt>'+
            '   <dd><span class=\"label\">备注信息：</span><div class="text-container"><p class=\"im-panel-main-rightdetail-content-lb-remark4friend-2 content content_autowrap\">'+memberRemark+'</p><span id="member_remark_fold_btn" class="member_remark_fold_btn">展开</span></div></dd>'+
            '</dl>'+
            '<dl>'+
            '   <dt>所在群组 <a class="groups_content_bt" href="javascript:show_groups_status_change(\''+uid+'\')">'+(groups_show_status?'显示':'隐藏')+'</a></dt>'+
            '   <dd class="groups_content" id="groups_content_' + uid +'">'+groups_html+'</dd>'+
            '</dl>'+
            '<dl>'+
            '   <dt>基本信息</dt>'+
            '   <dd class=\"im-panel-main-rightdetail-content-user-originalname-layout\"><span class=\"label\">昵称：</span><span class=\"content\">'+nickname+'</span></dd>'+
            '   <dd><span class=\"label\">ID号：</span><span class=\"content\">'+uid+ree.lastBit+'</span></dd>'+
            // '   <dd><span class=\"label\">手机号：</span><span class=\"content\">'+mail+'</span></dd>'+
            (isManager ?'   <dd><span class=\"label\">UED账号：</span><span class=\"content\" class=\'im-panel-main-rightdetail-content-eidtUED-content\'>'+(ree.uedUsername && ree.uedUsername.length > 0 ?ree.uedUsername: '无')+'</span><i class=\"im-panel-main-rightdetail-content-eidtUED-btn icon-edit\"/></dd>':"")+
            (isManager?'   <dd><span class=\"label\">VIP等级：</span><span class=\"content\">'+RBChatUtils.leveName(ree.uedLevel)+'</span></dd>':"")+
            (isManager?'   <dd><span class=\"label\">注册来源：</span><span class=\"content\">'+sourceTxt+'</span></dd>':"")+
            (isManager?'   <dd><span class=\"label\">设备类型：</span><span class=\"content\">'+deviceType+'</span></dd>':"")+
            (isManager?'   <dd><span class=\"label\">用户类型：</span><span class=\"content\">'+(ree.userType - 0 == 1?'游客':'注册用户' )+'</span></dd>':"")+
            (isManager?'   <dd><span class=\"label\">UED充值金额：</span><span class=\"content\">'+(ree.uedMoney||'')+'</span></dd>':"")+
            (isManager?'   <dd><span class=\"label\">UED用户总输赢：</span><span class=\"content\">'+(ree.uedTotalWinLoss||'')+'</span></dd>':"")+
            (isManager?'   <dd><span class=\"label\">UED上次存款时间：</span><span class=\"content\">'+(ree.uedLastRechargeDate||'')+'</span></dd>':"")+
            (isManager?'   <dd><span class=\"label\">未存款时间：</span><span class=\"content\">'+(noPayDate ||'')+'</span></dd>':"")+
            (isManager ?'   <dd><span class=\"label\">维护记录：</span><i class=\"im-panel-main-rightdetail-content-eidtwhued-btn icon-edit\"/></dd>':"")+
            (isManager ?'   <dd><span class=\"label\">召回记录：</span><i class=\"im-panel-main-rightdetail-content-eidtzhued-btn icon-edit\"/></dd>':"")+
            (isManager ?'   <dd><span class=\"label\">短信发送：</span><i class=\"im-panel-main-rightdetail-content-send-cmsmsg-btn icon-edit\"/></dd>':"")+

            '   <dd><span class=\"label\">注册时间：</span><span class=\"content\">'+register_time+'</span></dd>'+
            '   <dd><span class=\"label\">最近上线：</span><span class=\"content\">'+latest_login_time+'</span></dd>'+
            (isManager?'   <dd><span class=\"label\">登陆IP：</span><span class=\"content\">'+ree.latest_login_ip+'</span></dd>':"")+
            (isManager?'   <dd><span class=\"label\">注册IP：</span><span class=\"content\">'+ree.registerIp+'</span></dd>':"")+
            (isManager?'   <dd><span class=\"label\">登陆地址：</span><span class=\"content label-loginAddress\"></span></dd>':"")+
            (isManager?'   <dd><span class=\"label\">代理群管id ：</span><span class=\"content\">'+agentUid+'</span></dd>':"")+
            (isManager?'   <dd><span class=\"label\">代理群管ued ：</span><span class=\"content\">'+agentUed+'</span></dd>':"")+
            (isManager?'   <dd><span class=\"label\">UED首存时间：</span><span class=\"content\">'+(ree.uedFirstRechargeDate || '')+'</span></dd>':"")+
            // '   <dd><span class=\"label\">最近 IP：</span><span class=\"content\">'+latest_login_ip+'</span></dd>'+
            '</dl>'+
            '<dl>'+
            '   <dt>其它说明</dt>'+
            '   <dd><span class=\"content\">'+userDesc+'</span></dd>'+
            '</dl>'+
            '<dl class=\"kf5-chat-tag\">'+
            '<dd class=\"invite-tag add-tag\" style=\"margin-right: 10px;\">'+(isFriend?'<a class=\"im-panel-main-rightdetail-content-inviteGroup-btn btn btn-sm btn-blue blue btn-hollow\">一键拉群</a>':'')+'</dd>'+
            '   <dd class=\"add-tag\">'+(isFriend?'<a class=\"im-panel-main-rightdetail-content-delfriend-btn btn btn-sm btn-red red btn-hollow\">删除好友</a>':'<a class=\"im-panel-main-rightdetail-content-addfriend-btn btn btn-sm btn-blue blue btn-hollow\">加为好友</a>')+'</dd>'+
            '</dl>'
        ;

        let $parent = $('#im-panel-main-rightdetail-content');
        if (RBChatSmallWindowUI.checkIsWindow(chatId)) {
            $parent = $(`#${RBChatSmallWindowUI.getWindowId(chatId)} .im-panel-main-rightdetail-content`)
        }
        $parent.attr('dataId', chatId)
        $parent.empty();
        $parent.append(html);
        RBChatUtils.getCityByIP(ree.latest_login_ip).then(res => {
            document.querySelector('.chat-user-info .label-loginAddress').innerHTML = res
        })
        var localUserUid = LocalUserInfo.getObj().user_uid;

        //所在群组隐藏
        /* if(groups_show_status){
            $('#groups_content').show();
        } */
       // 改成默认隐藏
       localStorage.setItem('group_show_status_'+uid, '0'); // 默认隐藏
        RBChatSmallWindowUI.getWindowDom('.groups_content', null, chatId).hide();
        //维护记录
        RBChatSmallWindowUI.getWindowDom('.im-panel-main-rightdetail-content-eidtwhued-btn', null, chatId).click(function(){
             const tt = RBChatSmallWindowUI.getWindowDom('.im-panel-main-rightdetail-content-eidtUED-content', null, chatId).text();
             var name=''
             if(tt != '无'){
                name = tt;
             }
             window.open("https://crm.shuoqiudi100.com/#/addProtect?userUid="+ ree.user_uid+"&ued_username="+name+"&im_id="+localUserUid,'添加维护记录','height=500,width=1200,top=200,left=200')

        })

         //召回记录
         RBChatSmallWindowUI.getWindowDom('.im-panel-main-rightdetail-content-eidtzhued-btn', null, chatId).click(function(){
            const tt = RBChatSmallWindowUI.getWindowDom('.im-panel-main-rightdetail-content-eidtUED-content', null, chatId).text();
            if(tt != '无'){
                window.open("https://crm.shuoqiudi100.com/#/addContactDetail?ued_username="+tt+"&im_id="+localUserUid,'添加召回记录','height=700,width=1200,top=100,left=200')
            }else{
               alert('编辑该记录，要求UED账号不能为空!')
            }
        })

        // 短信发送
        RBChatSmallWindowUI.getWindowDom('.im-panel-main-rightdetail-content-send-cmsmsg-btn', null, chatId).click(function(){
            RBChatDialogHelper.showSendMsgForm(uid);
        })


        if(isManager){
            RBChatSmallWindowUI.getWindowDom('.im-panel-main-rightdetail-content-eidtUED-btn', null, chatId).click(function () {
                RBChatDialogHelper.showUEDAcountEdit(ree)
            });
        }
       

        // 显示关于好友备注的ui显示内容和逻辑
        this.refreshFriendRemark(isFriend, ree);

        // 增加按钮事件处理
        if(isFriend){
            // 删除好友的事件处理
            RBChatSmallWindowUI.getWindowDom('.im-panel-main-rightdetail-content-delfriend-btn', null, chatId).click(function(){
                RBChatRosterUI.deleteWithConfirm(uid,nickname);
            });
            // 一键拉群的事件处理
            RBChatSmallWindowUI.getWindowDom('.im-panel-main-rightdetail-content-inviteGroup-btn', null, chatId).click(function(){
                RBChatDialogHelper.showInviteGroupMemberDialog2(uid, nickname);
            });
        }
        else{
            // 添加好友的事件处理
            RBChatSmallWindowUI.getWindowDom('.im-panel-main-rightdetail-content-addfriend-btn', null, chatId).click(function(){
                RBChatDialogHelper.showSendAddFriendReqForm(uid, nickname);
            });
        }

        // 在对话框架中单独显示完整的个性签名内容
        RBChatSmallWindowUI.getWindowDom('.im-panel-main-rightdetail-content-user-whatsup', null, chatId).click(function(){
            RBChatDialogHelper.showAlertDialog_INFO("个性签名", whatsup);
        });

        if(isFriend) {
            // 设置备注功能的按钮事件处理
            RBChatSmallWindowUI.getWindowDom('.im-panel-main-rightdetail-content-editremark4friend-btn', null, chatId).click(function () {
                RBChatDialogHelper.showFriendRemarkEdit(ree)
            });

             // 设置备注功能的按钮事件处理
             RBChatSmallWindowUI.getWindowDom('.im-panel-main-rightdetail-content-editremark4friend-btn-2', null, chatId).click(function () {
                RBChatDialogHelper.showFriendRemarkEdit2(ree)
            });
        }

        // ======== 会员备注 展开折叠 start ===========

        // 初次加载时检查按钮显示情况
        this.updateMemberRemarkButtonVisibility();

        RBChatSmallWindowUI.getWindowDom('.member_remark_fold_btn', null, chatId).on('click', function () {
            console.log(RBChatSmallWindowUI.getWindowDom('.text-container', null, chatId), 12321321)
            if (RBChatSmallWindowUI.getWindowDom('.text-container', null, chatId).hasClass('expanded')) {
                RBChatSmallWindowUI.getWindowDom('.text-container', null, chatId).removeClass('expanded');
                RBChatSmallWindowUI.getWindowDom('.member_remark_fold_btn', null, chatId).text('展开');
            } else {
                RBChatSmallWindowUI.getWindowDom('.text-container', null, chatId).addClass('expanded');
                RBChatSmallWindowUI.getWindowDom('.member_remark_fold_btn', null, chatId).text('折叠');
            }
        });
        // ======== 会员备注 展开折叠 end ===========
    };

    // 检测会员备注文本是否超出两行，从而设置是否显示展开/折叠按钮
    UIModule6.prototype.updateMemberRemarkButtonVisibility = function (isReset) {
        if (isReset && RBChatSmallWindowUI.getWindowDom('.text-container').hasClass('expanded')) {
            RBChatSmallWindowUI.getWindowDom('.text-container').removeClass('expanded');
            RBChatSmallWindowUI.getWindowDom('.member_remark_fold_btn').text('展开');
        }
        var $textElement = RBChatSmallWindowUI.getWindowDom('.im-panel-main-rightdetail-content-lb-remark4friend-2')
        var isOverflowing = $textElement[0].scrollHeight > $textElement[0].clientHeight;
        // console.log('----updateButtonVisibility----', {isOverflowing}, $textElement.scrollHeight, $textElement.clientHeight );
        if (isOverflowing) {
            RBChatSmallWindowUI.getWindowDom('.member_remark_fold_btn').show(); // 显示展开按钮
        } else {
            RBChatSmallWindowUI.getWindowDom('.member_remark_fold_btn').hide(); // 隐藏展开按钮
        }
    }

    /**
     * 刷新关于好友备注的ui显示内容和逻辑.
     *
     * @param isFriend {boolean} 是否是好友
     * @param friendInfo {RosterElementEntity} 好友数据对象
     */
    UIModule6.prototype.refreshFriendRemark = function(isFriend, friendInfo){

        // var isFriend = RosterProvider.isUserInRoster(uid);

        const uid = friendInfo.user_uid
        var $layoutSetupRemark = RBChatSmallWindowUI.getWindowDom('.im-panel-main-rightdetail-content-editremark4friend-layout', null, uid);
        var $layoutSetupRemark2 = RBChatSmallWindowUI.getWindowDom('.im-panel-main-rightdetail-content-editremark4friend-layout-2', null, uid);
        var $layoytOriginalNickname = RBChatSmallWindowUI.getWindowDom('.im-panel-main-rightdetail-content-user-originalname-layout', null, uid);
        var $viewNickname = RBChatSmallWindowUI.getWindowDom('.im-panel-main-rightdetail-content-user-showname', null, uid);
        // var $viewOriginalNickname = $('#im-panel-main-rightdetail-content-user-originalname');
        var $viewRemark = RBChatSmallWindowUI.getWindowDom('.im-panel-main-rightdetail-content-lb-remark4friend', null, uid);
        var $viewMobileNum = $('#im-panel-main-rightdetail-content-lb-mobilenum4friend', null, uid);
        var $viewMoreDesc = RBChatSmallWindowUI.getWindowDom('.im-panel-main-rightdetail-content-lb-moredesc4friend', null, uid);

        if(isFriend) {
            $layoutSetupRemark.show();
            $layoutSetupRemark2.show();

            var hasRemak = !RBChatUtils.isStringEmpty(friendInfo.friendRemark);
            if (hasRemak)
                $layoytOriginalNickname.show();
            else
                $layoytOriginalNickname.hide();

            var nicknameWithRemark = RBChatUtils.getNickNameWithRemark(friendInfo);
            var friendRemark = hasRemak ? friendInfo.friendRemark : "未设置";
            var friendMobileNum = !RBChatUtils.isStringEmpty(friendInfo.friendMobileNum) ? friendInfo.friendMobileNum : "未设置";
            var friendMoreDesc = !RBChatUtils.isStringEmpty(friendInfo.friendMoreDesc) ? friendInfo.friendMoreDesc : "未设置";

            // console.info('>>>>>>>>>>>>>>>>>>>>>>>>>>>> nicknameWithRemark='+nicknameWithRemark
            //     +', friendRemark='+friendRemark+', friendMobileNum='+friendMobileNum+', friendMoreDesc='+friendMoreDesc);

            $viewNickname.text(nicknameWithRemark)
            if ($($viewNickname).closest('.small-window-box')) {
                $($viewNickname).closest('.small-window-box').find('.small-window-box-header-title').text(nicknameWithRemark)
            }
            $viewRemark.text(friendRemark);
            $viewMobileNum.text(friendMobileNum);
            $viewMoreDesc.text(friendMoreDesc);
        }
        else{
            $layoutSetupRemark.hide();
            $layoutSetupRemark2.hide();
            $layoytOriginalNickname.hide();
        }
    };


    /**
     * 显示用户的个人相册列表。
     *
     * @param originalDataRows 数据单元中的字段定义，请见“【接口1008-10-9】”的接口文档说明
     */
    UIModule6.prototype.showSingerUserPhotosList = function(originalDataRows){

        var $parent = $('#im-panel-main-rightdetail-content');

        var $list = $("<ul class=\"chat-user-photos-gallery\"></ul>");

        if(originalDataRows && originalDataRows.length > 0){

            // 循环解析每一行数据（数据单元中的字段定义，请见“【接口1008-10-9】”的接口文档说明）
            for(var i=0; i<originalDataRows.length; i++)
            {
                var row = originalDataRows[i];

                var j = 0;
                var resource_id = row[j++];
                var res_file_name = row[j++];
                var res_human_size = row[j++];
                var res_size = row[j++];
                var view_count = row[j++];
                var create_time = row[j++];

                var imgHttpURL = RBChatUtils.getPhotoDownloadURL(res_file_name);
                var imgThunmbHttpURL = RBChatUtils.getPhotoDownloadURL('th_'+res_file_name);

                var htmlOfItem =
                    '<li>' +
                    '   <div class=\"pic\">' +
                    '       <a href=\"'+imgHttpURL+'\" target=\"_blank\">' +
                    '           <img src=\"'+imgThunmbHttpURL+'\">' +
                    '       </a>' +
                    '   </div>' +
                    '   <div class=\"title\">' +
                    '       <div class=\"title-content\">' +
                    '           <img src=\"images/main_more_profile_photo_view_icon.png\">' +
                    '           <span>'+view_count+'</span>' +
                    '           <span class=\"size\">'+res_human_size+'</span>' +
                    '       </div>' +
                    '   </div>' +
                    '</li>';

                $list.append(htmlOfItem);
            }

            $parent.append($list);
        }
        else{
            // 空数据UI提示
            this.setDetailContentEmpty('还未上传过照片', 'icon-assignment-ind');
        }
    };

    /**
     * 刷新群组基本信息的UI显示。
     * 说明：本方法，主要用于在群组基本信息的UI已经显示的情况下，群组信息数据已经发生了变化时，重新刷新UI的显示时使用。
     *
     * @param gid 要更新的群组id
     * @param ge 新的群组信息数据，本参数可为空，当为空时将自动取缓存中的群组信息来显示
     */
    UIModule6.prototype.refreshGroupBaseInfo = function(gid, ge){
        this.clearDetailContent();
        this.clearBottom();
        this.showGroupBaseInfo(ge?ge:GroupsProvider.getGroupInfoByGid(gid));
    };

    /**
     * 刷新群组头像的显示（此种情况主要用于：群成员变动时，群头像可能已经在服务端重新生成，刷新的目的是为了及时同步显示之）。
     *
     * @param gid
     */
    UIModule6.prototype.refreshGroupAvatarShow = function(gid){
        var $avatar = $('#im-panel-main-rightdetail-content-group-avatar-'+gid);
        if($avatar){
            $avatar.attr('src', RBChatUtils.getGroupAvatarDownloadURL(gid, true));
        }
    };

    /**
     * 显示群组基本信息。
     *
     * @param ge GroupEntity对象（详见：
     * http://docs.52im.net/extend/docs/api/rainbowchatserver4_pro/com/x52im/rainbowchat/http/logic/dto/GroupEntity.html）
     */
    UIModule6.prototype.showGroupBaseInfo = function(ge, chatId){

        var that = this;

        var gid = ge.g_id;
        var gname = ge.g_name;
        var g_owner_user_uid = ge.g_owner_user_uid;
        var ownerName = ge.g_owner_name;
        var nickNameInGroup = GroupsProvider.getMyNickNameInGroup(ge.nickname_ingroup);
        var g_notice = RBChatChattingContentPaneUI.replaceEmojiPlaceholderToHTML(ge.g_notice);
        var g_member_count = ge.g_member_count;
        var create_user_name = ge.create_user_name;
        var create_time = ge.create_time;

        var localUserIsGroupOwner = GroupsProvider.isGroupOwner(g_owner_user_uid);
        var noticeIsEmpty = RBChatUtils.isStringEmpty(g_notice);

        // 本地用户信息对象
        var localUserInfo = LocalUserInfo.getObj();
        let forbid_status = ge.forbid_status;

        const defaultColor = RBChatUtils.getBgColor(gid)
        const show_t = gname.substr(0, 1).toUpperCase();

        window.groupTTnotFound = function(obj){
            obj.parent().children().eq(0).css('background', defaultColor)
            obj.remove()
        }

       // if(RBChatUtils.isMobile()){
            $('#chat_top_name').text(gname)
        // }
        const hasOp = RBChatUtils.getOpAdmin()
        // var head_photo = ge.group_avatar_file_name&&ge.group_avatar_file_name.length > 0 ?'https://oss.nongzhiw.cn/head/'+ge.group_avatar_file_name:'';
        var head_photo = ge.group_avatar_file_name&&ge.group_avatar_file_name.length > 0 ? RBChatConfig.FILE_HTTPS_URL + '/head/'+ge.group_avatar_file_name:'';
        /** 显示基本信息内容 */
        var html =
            "<div class=\'chat-user-info-headinfo\'>"+
            "	<div class=\'avatar-wrapper\'>"+
            "       <div id=\'im-panel-main-rightdetail-content-group-default-avatar-"+gid+"\'  class='avator' >"+show_t+" </div>"+
            "		<img  onerror='javascript:groupTTnotFound($(this))' id=\'im-panel-main-rightdetail-content-group-avatar-"+gid+"\' src=\'"+head_photo+"\'>"+
            (localUserIsGroupOwner ?"<input type=\'file\' name=\'im-panel-main-rightdetail-content-group-uploadavatar_"+gid+"\' id=\'im-panel-main-rightdetail-content-group-uploadavatar_"+gid+"\' />":"")+
            "	</div>"+
            "	<div class=\'info\'>"+
            "		<h4 id=\'im-panel-main-rightdetail-content-group-showname\' title=\'"+gname+"\'>"+gname+"</h4>"+
            "		<span class=\'gray\'>群ID: "+gid+"</span>"+
            "	</div>"+
            (localUserIsGroupOwner?
                "	<a>"+
                "		<i id=\'im-panel-main-rightdetail-content-editgname-btn\' class=\'icon-edit edit_gname\'></i>"+
                "	</a>":"")+
            "	<div class=\'clear\' style=\'clear: both;\'></div>"+
            "</div>"+
            "<dl>"+
            "	<dt>基本信息</dt>"+
            "	<dd><span class=\'label\'>当前群主：</span><span class=\'content\'><a style=\'color: #28a0ff\' id=\'im-panel-main-rightdetail-content-viewowner4group-btn\'>"+ownerName+"</a></span>"+(localUserIsGroupOwner?"<span class=\'flag\' title=\'我是此群的群主！\'>我</span>":"")+"</dd>"+
            "	<dd><span class=\'label\'>群内昵称：</span><span class=\'content\'><a id=\'im-panel-main-rightdetail-content-editnick4group-link\'>"+nickNameInGroup+"</a><i id=\'im-panel-main-rightdetail-content-editnick4group-btn\' class=\'icon-edit\'></i></span></dd>"+
            "	<dd><span class=\'label\'>群创建者：</span><span class=\'content\'>"+create_user_name+"</span></dd>"+
            (ge.manage_mark - 0 == 1 || localUserIsGroupOwner ? "	<dd><span class=\'label\'>总/在线(人数)：</span><span class=\'content\'>"+ge.g_member_count+" / "+ge.online+"</span></dd>":"")+
            "	<dd><span class=\'label\'>建群时间：</span><span class=\'content\'>"+create_time+"</span></dd>"+
            "</dl>"+
            "<dl>"+
            "	<dt>本群公告</dt>"+
            "	<dd><span class=\'content\'><a "+(noticeIsEmpty?"":"style=\'color: ##999b9f;\'")+"id=\'im-panel-main-rightdetail-content-viewnotice-btn\'>"+(noticeIsEmpty?"还没有设置公告，群主可点击进行设置!":g_notice)+"</a>"+( ge.manage_mark - 0 == 1 || localUserIsGroupOwner?"<i id=\'im-panel-main-rightdetail-content-editnotice-btn\' class=\'icon-edit\'></i>":"")+"</span></dd>"+
            "</dl>"+
            ((ge.manage_mark - 0 == 1 || localUserIsGroupOwner)? "<dl class=\'kf5-chat-tag\'>"+
            "	<dt>群员信息</dt>"+
            "	<dd class=\'add-tag\' style=\'margin-top: 5px;\'>"+
            (hasOp ? "<a class=\'btn btn-fb btn-sm btn-blue blue btn-hollow\' id=\'im-panel-main-rightdetail-bottom-viewmforbid-btn\'> 全员禁言<span id=\'im-panel-main-rightdetail-bottom-forbid_status\'>("+(ge.forbid_status - 0 == 1? '开':'关')+")</span></a>" : "") +
            "		<a class=\'btn btn-fb btn-sm btn-blue blue btn-hollow\' id=\'im-panel-main-rightdetail-bottom-viewmembers4group-btn\'>管理群员<span id=\'im-panel-main-rightdetail-bottom-memberscount4group\'>("+g_member_count+"人)</span></a>"+
            "		<a class=\'btn btn-fb btn-sm btn-blue blue btn-hollow\' id=\'im-panel-main-rightdetail-bottom-invitemember4group-btn\' style=\'margin-left: 10px;\'>邀请入群</a>"+
            "	</dd>"+
            "</dl>" : "");

        let $parent = $('#im-panel-main-rightdetail-content');
        if (RBChatSmallWindowUI.checkIsWindow(chatId)) {
            $parent = $(`#${RBChatSmallWindowUI.getWindowId(chatId)} .im-panel-main-rightdetail-content`)
            $(`#${RBChatSmallWindowUI.getWindowId(chatId)} .small-window-box-header-title`).text(gname)
            RBChatSmallWindowUI.updateUserGroupInfoCache(chatId, ge)
        }
        $parent.empty();
        $parent.append(html);

        /** 显示底部操作按钮 */
        var bottomHtml = (localUserIsGroupOwner? "<p><a id=\'im-panel-main-rightdetail-bottom-transfer4group-btn\' class=\'link transfer_group\'>转让本群</a><span class=\'pipe\'>/</span><a id=\'im-panel-main-rightdetail-bottom-dismiss4group-btn\' class=\'link_red\'>解散本群</a></p>"
            : "<p><a id=\'im-panel-main-rightdetail-bottom-quit4group-btn\' class=\'link_red\'>退出本群</a></p>");
        this.setBottom(bottomHtml);

        if(localUserIsGroupOwner){
            this.initLocalAvatarFileUplodifive5(gid,$("#im-panel-main-rightdetail-content-group-uploadavatar_"+gid)
            , 'im-panel-main-rightdetail-content-group-avatar-'+gid,'im-panel-main-rightdetail-content-group-default-avatar-'+gid);
        }
        /** 查看/管理群成员的按钮事件处理 */
        RBChatSmallWindowUI.getWindowDom("#im-panel-main-rightdetail-bottom-viewmembers4group-btn", null, chatId).click(function(){
            RBChatDialogHelper.showViewOrMgrGroupMemberDialog(gid, localUserIsGroupOwner, ge.manage_mark - 0 == 1);
        });
        /** 邀请入群的按钮事件处理 */
        RBChatSmallWindowUI.getWindowDom("#im-panel-main-rightdetail-bottom-invitemember4group-btn", null, chatId).click(function(){
            RBChatDialogHelper.showInviteGroupMemberDialog(gid, localUserIsGroupOwner);
        });
        /** 全员禁言 */
        RBChatSmallWindowUI.getWindowDom('#im-panel-main-rightdetail-bottom-viewmforbid-btn', null, chatId).click(function(){
            RBChatRestHelper.submitForbidToServer(gid,gname,forbid_status - 0 == 1 ? "0": "1"
                // 数据读取成功后的回调
                , function (returnValue) {
                    if(returnValue - 0 == 0){
                        forbid_status = forbid_status - 0 == 1 ? '0': '1'
                        $('#im-panel-main-rightdetail-bottom-forbid_status').text('('+(forbid_status - 0 == 1?'开':'关')+')')
                    }else{
                        RBChatDialogHelper.showAlertDialog_WARN('提示', '设置失败');
                    }
                   
                }
                // 数据读取失败后的回调
                , function (errorThrownStr){
                    RBChatDialogHelper.showAlertDialog_WARN('提示', '设置失败');
                }
            );
        })

        /** 其它按钮事件（本地用户就是此群的群主） */
        if(localUserIsGroupOwner){
            // 群主转让的按钮事件处理
            RBChatSmallWindowUI.getWindowDom("#im-panel-main-rightdetail-bottom-transfer4group-btn", null, chatId).click(function(){
                RBChatDialogHelper.showTrasferGroupDialog(gid, localUserIsGroupOwner);
            });

            // 解散群组功能的按钮事件处理
            RBChatSmallWindowUI.getWindowDom("#im-panel-main-rightdetail-bottom-dismiss4group-btn", null, chatId).click(function(){
                that.doDismissGroupToServer(gid, nickNameInGroup, localUserIsGroupOwner, localUserInfo);
            });

            // 修改群名称功能的按钮事件处理
            RBChatSmallWindowUI.getWindowDom("#im-panel-main-rightdetail-content-editgname-btn", null, chatId).click(function(){
                RBChatDialogHelper.showGroupNameEdit(ge);
            });
        }
        /** 其它按钮事件（本地用户不是此群的群主） */
        else{
            // 退出群聊功能的按钮事件处理
            RBChatSmallWindowUI.getWindowDom("#im-panel-main-rightdetail-bottom-quit4group-btn", null, chatId).click(function(){
                that.doQuitGroupToServer(gid, localUserIsGroupOwner, localUserInfo);
            });
        }

        /** 修改"我"的群内昵称功能的按钮事件处理 */
        var clickEditGrupInnerNickname = function(event){
            RBChatDialogHelper.showGroupInnerNicknameEdit(ge);
        };
        RBChatSmallWindowUI.getWindowDom("#im-panel-main-rightdetail-content-editnick4group-link", null, chatId).click(clickEditGrupInnerNickname);
        RBChatSmallWindowUI.getWindowDom("#im-panel-main-rightdetail-content-editnick4group-btn", null, chatId).click(clickEditGrupInnerNickname);

        /** 查看或编辑群公告的按钮事件处理 */
        var clickViewOrEditNotice = function(event){
            RBChatDialogHelper.showGroupNoticeEdit(ge);
        };
        RBChatSmallWindowUI.getWindowDom("#im-panel-main-rightdetail-content-viewnotice-btn", null, chatId).click(clickViewOrEditNotice);
        RBChatSmallWindowUI.getWindowDom("#im-panel-main-rightdetail-content-editnotice-btn", null, chatId).click(clickViewOrEditNotice);

        /** 查看群主个人信息的按钮事件处理 */
        RBChatSmallWindowUI.getWindowDom("#im-panel-main-rightdetail-content-viewowner4group-btn", null, chatId).click(function(event){
            RBChatDialogHelper.showUserInfoFromServer(false, null, g_owner_user_uid, null);
        });
    };

    ///**
    // * 更新群组成员数量的UI显示。
    // *
    // * @param deltaCount 变化的数量（正数表示加群员数，负数表示减群员数）
    // */
    //UIModule6.prototype.updateGroupMembersCountShow = function(gid, deltaCount){
    //    var uiObj = $("#im-panel-main-rightdetail-bottom-memberscount4group");
    //    var ge = GroupsProvider.getGroupInfoByGid(gid);
    //
    //    if(uiObj && ge) {
    //
    //        // 该群删除成员前的总成员数
    //        var currentMemberCount = 1;
    //        var currentMemberCountStr = ge.g_member_count;
    //        if (currentMemberCountStr) {
    //            currentMemberCount = parseInt(currentMemberCountStr);
    //        }
    //        if (currentMemberCount < 1)
    //            currentMemberCount = 1;
    //
    //        // 新的总数
    //        var newCount = currentMemberCount + parseInt(deltaCount);
    //        // 更新ui显示
    //        uiObj.text("("+newCount+"人)");
    //    }
    //};

    UIModule6.prototype.initLocalAvatarFileUplodifive5 = function(gid,$destSendBtnObj, apid,adefaultip)
    {
        var that = this;
        var logTag = '头像图片';

        // “上传中”提示信息Toast id
        var loadingToastID = null;//RBChatToastHelper.nextToastId();

        $destSendBtnObj.uploadifive({
            // 文件上传的后台处理URL（因uplodifive很难通过form传递参数，只能放以到URL里传过去了。不同于APP端，因Web浏览器不能计算出
            //      MD5码，所以fileName参数就不传了，文件到了服务端后由服务端去计算出MD5文件名（方便存储）就是了）
            'uploadScript': RBChatConfig.WEB_FILE_UPLOAD_CONTROLLER_URL_ROOT
                // 根据服务端的约定，业务类型为：0-图片上传、1-普通文件上传、2-本地用户头像文件上传
                +'?action=3&user_uid='+gid,
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
            'fileSizeLimit':RBChatConfig.UPLOAD_AVATAR_IMAGE_DATA_MAX_LENGTH,
            //上传数量
            'queueSizeLimit' : 1000,
            //选择文件后自动上传
            'auto': true,
            //设置为true将允许多文件上传
            'multi': false,
            // 返回一个错误，选择文件的时候触发
            'onError':function(errorType, file){
                RBChatUtils.logToConsole("【"+logTag+"上传】>>>>>>>. 文件上传出错了，errorCode="+errorType);

                var errorMsg = 'NA';
                // Get the error message
                switch(errorType) {
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
                        errorMsg = '您要上传的'+logTag+'太大了（<strong><font color="#f00">最大允许 '
                            +RBChatConfig.UPLOAD_AVATAR_IMAGE_DATA_MAX_LENGTH
                            +'</font></strong>），本次上传已被取消！';
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
                RBChatDialogHelper.showAlertDialog_WARN('上传出错', logTag+'上传出错，'+errorMsg);
            },
            'onUpload': function(file) {
                RBChatUtils.logToConsole('【'+logTag+'上传】>>>>>>> onUploadStart,file='+file);

                // 显示toast提示
                loadingToastID = RBChatToastHelper.showToast_Loading('头像上传中..');
            },
            //检测HTML5失败调用
            'onFallback':function(){
                RBChatDialogHelper.showAlertDialog_INFO('友情提示', "您的浏览器不支持HTML5, 无法实现"+logTag+"上传！");
            },
            //上传成功后执行
            'onUploadComplete': function (file, data) {

                // 必须要加这一条，不然下次上传会提示上次的未完成，不能再上传（数量限制），这
                // 可能中uplodifive的bug，之前swf版本本方法中是不需要单独处理的！！
                $destSendBtnObj.uploadifive('clearQueue');
                // 服务端在文件上传完成后返回的JSON对象，请务必与服务端的文件上传接口中返回的参数保持一致（详见服务端：FileUploader4Web.java）！
                var objFromServer = JSON.parse(data);
                RBChatUtils.logToConsole('【'+logTag+'上传】 文件上传成功，服务端返回的data.fileNameMD5='+objFromServer.fileNameMD5);
                // var head_photo = 'https://oss.nongzhiw.cn/head/'+objFromServer.fileNameMD5;
                var head_photo = RBChatConfig.FILE_HTTPS_URL + '/head/'+objFromServer.fileNameMD5;
                // 关闭toast显示
                RBChatToastHelper.closeToast(loadingToastID)

                // 刷新当前用户信息对话框上的头像图片显示
                const dom = document.getElementById(apid)
                if(dom){
                    $('#'+apid).attr('src',head_photo);
                }else{
                   
                    $('#'+adefaultip).after("<img  onerror='javascript:$(this).remove()' id=\'"+apid+"\' src=\'"+head_photo+"\'>")
                }
                // 更新列表里面的头像
                // RBChatUtils.updateGroupAvatar(gid);

            },
            'onUploadFile' : function(file) {
                RBChatUtils.logToConsole('【'+logTag+'上传】onUploadFile> The file ' + file.name + ' finished processing.');
            }
        });
    };


    /**
     * 显示用户的个人语音留言列表。
     *
     * @param originalDataRows 数据单元中的字段定义，请见“【接口1008-10-9】”的接口文档说明
     */
    UIModule6.prototype.showSingerUserVoicesList = function(originalDataRows){

        var $parent = $('#im-panel-main-rightdetail-content');

        if(originalDataRows && originalDataRows.length > 0){

            // 循环解析每一行数据（数据单元中的字段定义，请见“【接口1008-10-9】”的接口文档说明）
            for(var i=0; i<originalDataRows.length; i++)
            {
                var row = originalDataRows[i];

                var j = 0;
                var resource_id = row[j++];
                var res_file_name = row[j++];
                var res_human_size = row[j++];
                var res_size = row[j++];
                var view_count = row[j++];
                var create_time = row[j++];

                var fileHttpURL = RBChatUtils.getPVoiceDownloadURL(res_file_name);

                var htmlOfItem =
                    '<audio src=\"'+fileHttpURL+'\" preload=\"metadata\" controls=\"controls\"></audio>';

                $parent.append(htmlOfItem);
            }
        }
        else{
            // 空数据UI提示
            this.setDetailContentEmpty('还未上传语音介绍', 'icon-perm-camera-m');
        }
    };

    /**
     * 清空所有tabs。
     */
    UIModule6.prototype.clearTabs = function(type){
        RBChatSmallWindowUI.getWindowDom('#im-panel-header-righttabs', type).empty();
    };

    /**
     * 清空内容区（中间）.
     */
    UIModule6.prototype.clearDetailContent = function(type){
        // RBChatSmallWindowUI.getWindowDom('#im-panel-main-rightdetail-content', type).empty();
    };

    /**
     * 设置内容区的内容为空UI（主要用于没有数据时，显示友好提示，提升体验）。
     */
    UIModule6.prototype.setDetailContentEmpty = function(hintText, icon){
        var emptyHTML =
            "<div id=\'im-panel-main-chatcontentpane-empty\' class=\'kchat-talk-list-empty\'>"+
            "	<i class=\'"+icon+"\' style=\'font-size: 70px;\'></i>"+
            "	<p>"+hintText+"</p>"+
            "</div>";
        this.clearDetailContent();
        RBChatSmallWindowUI.getWindowDom('#im-panel-main-rightdetail-content').append(emptyHTML);
    };

    /**
     * 设置底部内容的显示。
     *
     * @param bottomContentHtml
     */
    UIModule6.prototype.setBottom = function(bottomContentHtml){
        this.clearBottom();
        RBChatSmallWindowUI.getWindowDom('#im-panel-main-rightdetail-bottom').append(bottomContentHtml);
    };

    /**
     * 清空底部区.
     */
    UIModule6.prototype.clearBottom = function(){
        RBChatSmallWindowUI.getWindowDom('#im-panel-main-rightdetail-bottom').empty();
    };

    /**
     * 从服务端载入指定群组的基本信息，并显示在界面右边的详情显示区域里。
     *
     * @param uid
     */
    UIModule6.prototype.loadGroupBaseInfoFromServer = function(gid){

        var that = this;
        // 先清空UI显示
        this.clearDetailContent();
        this.clearBottom();

        var myUserId = LocalUserInfo.getUid()
        // 调用HTTP REST接口：“【接口1016-25-8】查询群基本信息”，接口返回值详细情况，详见接口文档或服务端代码。
        // 开始从服务端查询指定gid的群组基本信息，同时尝试在ui上显示之
        RBChatRestHelper.submitGetGroupInfoToServer(gid, myUserId
            // 数据读取成功后的回调
            , function (returnValue) {
                var needAlert = true;

                // 服务端返回的是java对象GroupEntity的JSON文本
                var groupInfo = JSON.parse(returnValue);
                const _curGid = RBChatMainUI.getCurrentSelectedAlarmDataId()
                // 当前会话id跟接口返回会话信息不一致时，不做处理
                if (_curGid && groupInfo.g_id != _curGid && 
                    ( (window._chatType != 'window' && !RBChatSmallWindowUI.checkIsWindow(gid))
                        || (window._chatType == 'window' && !RBChatSmallWindowUI.checkIsWindow(gid))
                    )
                ) return
                window.groupInfo = groupInfo;
                if(groupInfo){

                    // 在查到的信息里看看我是否还要此群中
                    var imIsInThisGroup = (groupInfo.imIsInGroup == '1'?true:false);
                    // 我已不在此群里了
                    if(!imIsInThisGroup) {
                        RBChatUtils.logToConsole_WARN("【查询群信息】gid="+gid+", myUserId="+myUserId+" 【结果：NO-我已不在此群内！】(尝试清除群列表缓存中的记录）");
                        // 尝试更新一下本地群列表（这可能是网络延迟或网络不好的时候，没有加载到最新的群列表，正好此时更新一下）
                        GroupsProvider.removeByGid(gid);
                    }
                    // 我在此群里
                    else {
                        RBChatUtils.logToConsole_INFO("【查询群信息】gid="+gid+", myUserId="+myUserId+" 【结果：YES-我在此群内】(尝试更新群列表缓存中的信息为最新）");

                        needAlert = false;

                        // 将取到的最新群信息先更新到本地群信息缓存中
                        GroupsProvider.updateGroup(groupInfo); 

                        // 在UI上显示查询到的群信息
                        that.showGroupBaseInfo(groupInfo, gid);

                        // 尝试更新首页“消息”上显示的群名称（尽最大可能保证在网络不佳等情况下，导致群名称不是最新的情况时，能及时被纠正）
                        RBChatAlarmsUI.updateGroupName(gid, groupInfo.g_name);
                        // 更新群列表中的群名称显示（尽最大可能保证在网络不佳等情况下，导致群名称不是最新的情况时，能及时被纠正）
                        RBChatGroupsUI.updateGroupName(gid, groupInfo.g_name);
                        // 更新群列表中的群主标识显示（尽最大可能保证在网络不佳等情况下，导致群名称不是最新的情况时，能及时被纠正）
                        RBChatGroupsUI.updateGroupOwnerFlagShow(gid, GroupsProvider.isGroupOwner(groupInfo.g_owner_user_uid));

                        // 判断是否群属于禁言中
                        // 禁言初始
                        RBChatSmallWindowUI.getWindowDom('#kchat-im-panel-main-chat-textarea').css('pointer-events','');
                        RBChatSmallWindowUI.getWindowDom('.im-panel-inputcontent').attr('placeholder','输入聊天信息，按 Enter 键快速发送 …')
                        RBChatSmallWindowUI.getWindowDom('.im-panel-inputcontent').removeAttr("disabled"); 
                        //禁言中
                        if(groupInfo.forbid_status - 0 == 1){
                            // 群主和管理不受禁言控制
                            if(!(groupInfo.manage_mark - 0 == 1 || groupInfo.g_owner_user_uid == myUserId)){
                                RBChatSmallWindowUI.getWindowDom('#kchat-im-panel-main-chat-textarea').css('pointer-events','none');
                                RBChatSmallWindowUI.getWindowDom('.im-panel-inputcontent').attr('placeholder','禁言中 …')
                                RBChatSmallWindowUI.getWindowDom('.im-panel-inputcontent').attr('disabled',true)
                                RBChatSmallWindowUI.getWindowDom('.im-panel-inputcontent').val('');
                            }
                        }

                    }
                }
                else {
                    RBChatUtils.logToConsole_WARN('[前端-GET-【接口1016-25-8】查询群基本信息接口返回值解析后] 数据为空，' +
                        '无需进入ui处理代码。(returnValue=' + returnValue + ')', true);
                }

                if(needAlert) {
                    // 该群不存在
                    RBChatDialogHelper.showAlertDialog_WARN('加载失败', '没有查到该群信息，该群已解散或您已不在群内！');
                }
            }
            // 数据读取失败后的回调
            , function (errorThrownStr){
                RBChatDialogHelper.showAlertDialog_WARN('加载失败', '群'+gid+'的基本信息数据读取出错，可能是网络故障，请稍后再试！');
            }
        );
    };

    /**
     * 从服务端载入指定人员的基本信息，并显示在界面右边的详情显示区域里。
     *
     * @param uid
     */
    UIModule6.prototype.loadSingleUserBaseInfoFromServer = function(uid){

        var that = this;
        if (RBChatMainUI.getCurrentSelectedAlarmDataId() == uid) {
            RBChatSmallWindowUI.getWindowDom('#im-panel-main-rightdetail-content', 'parent').empty();
            // this.clearDetailContent('parent');
        }

        // 调用HTTP REST接口：“【接口1008-3-8】获取用户/好友的个人信息”，接口返回值详细情况，详见接口文档或服务端代码。
        //查询拥有的共同群
        let userGroups = null
        RBChatRestHelper.submitGetUserGroupsToServer(uid, function(s){
            userGroups = JSON.parse(s);
            window._curUserGroup = {
                uid,
                data: userGroups
            }
            var groups_html='';
            if(userGroups){
                var temp_groups = userGroups.map(item=>{
                    return item[0]+' '+item[1];
                })
                groups_html = temp_groups.join('<br/>')
                $(`#groups_content_${uid}`).html(groups_html)
                // document.querySelector(`#groups_content_${uid}`).innerHTML = groups_html
            }
        },null, false, window._chatType != 'window')

        // 开始从服务端查询指定uid的用户基本信息，同时尝试在ui上显示之
        RBChatRestHelper.submitGetUserInfoToServer(false, null, uid
            // 数据读取成功后的回调
            , function (returnValue) {
                // 服务端返回的是java对象RosterElementEntity的JSON文本
                var ree = JSON.parse(returnValue);
                // if (!RBChatSmallWindowUI.checkIsWindow(uid) && window.scrollInfo?.beyongDataId != uid) {
                //     return
                // }
                if(ree){
                    that.showSingerUserBaseInfo(ree, userGroups, uid);
                }
                else {
                    RBChatUtils.logToConsole('[前端-GET-【接口1008-3-8】用户/好友的个人信息获取接口返回值解析后] 数据为空，' +
                        '无需进入ui处理代码。(returnValue=' + returnValue + ')', true);
                }
            }
            // 数据读取失败后的回调
            , function (errorThrownStr){
                //alert('用户'+uid+'的基本信息数据读取出错，原因是：'+errorThrownStr);
                RBChatDialogHelper.showAlertDialog_WARN('加载失败', '用户'+uid+'的基本信息数据读取出错，可能是网络故障，请稍后再试！');
            }
            , false
            , null
            , window._chatType != 'window'
        );

    };

    /**
     * 从服务端载入指定人员的个人相册列表，并显示在界面右边的详情显示区域里。
     *
     * @param uid
     */
    UIModule6.prototype.loadSingerUserPhotosListFromServer = function(uid){

        var that = this;

        // 先清空UI显示
        this.clearDetailContent();

        // 调用HTTP REST接口：“【接口1008-3-8】获取用户/好友的个人信息”，接口返回值详细情况，详见接口文档或服务端代码。
        // 开始从服务端查询指定uid的用户基本信息，同时尝试在ui上显示之
        RBChatRestHelper.queryPhotosOrVoicesListFromServer(uid, 0
            // 数据读取成功后的回调
            , function (returnValue) {

                // 服务端返回的是java对象Vector<Vector>表示的2维数组的JSON文本
                var vecs = JSON.parse(returnValue);

                if(vecs){
                    that.showSingerUserPhotosList(vecs);
                }
                else {
                    RBChatUtils.logToConsole('[前端-GET-【接口1008-10-9】用户个人相册列表获取接口返回值解析后] 数据为空，' +
                        '无需进入ui处理代码。(returnValue=' + returnValue + ')', true);
                }
            }
            // 数据读取失败后的回调
            , function (errorThrownStr){
                //alert('用户'+uid+'的个人相册列表数据读取出错，原因是：'+errorThrownStr);
                RBChatDialogHelper.showAlertDialog_WARN('加载失败', '用户'+uid+'的个人相册列表数据读取出错，可能是网络故障，请稍后再试！');
            }
        );
    };

    /**
     * 从服务端载入指定人员的个人语音留言列表，并显示在界面右边的详情显示区域里。
     *
     * @param uid
     */
    UIModule6.prototype.loadSingerUserVoicesListFromServer = function(uid){

        var that = this;

        // 先清空UI显示
        this.clearDetailContent();

        // 调用HTTP REST接口：“【接口1008-3-8】获取用户/好友的个人信息”，接口返回值详细情况，详见接口文档或服务端代码。
        // 开始从服务端查询指定uid的用户基本信息，同时尝试在ui上显示之
        RBChatRestHelper.queryPhotosOrVoicesListFromServer(uid, 1
            // 数据读取成功后的回调
            , function (returnValue) {

                // 服务端返回的是java对象Vector<Vector>表示的2维数组的JSON文本
                var vecs = JSON.parse(returnValue);

                if(vecs){
                    that.showSingerUserVoicesList(vecs);
                }
                else {
                    RBChatUtils.logToConsole('[前端-GET-【接口1008-10-9】用户个人语音介绍列表获取接口返回值解析后] 数据为空，' +
                        '无需进入ui处理代码。(returnValue=' + returnValue + ')', true);
                }
            }
            // 数据读取失败后的回调
            , function (errorThrownStr){
                //alert('用户'+uid+'个人语音介绍列表数据读取出错，原因是：'+errorThrownStr);
                RBChatDialogHelper.showAlertDialog_WARN('加载失败', '用户'+uid+'个人语音介绍列表数据读取出错，可能是网络故障，请稍后再试！');
            }
        );
    };

    /**
     * 向服务端提交解散群组的完整处理逻辑。
     *
     * @param gid
     * @param nickNameInGroup
     * @param localUserIsGroupOwner
     * @param localUserInfo
     */
    UIModule6.prototype.doDismissGroupToServer = function(gid, nickNameInGroup, localUserIsGroupOwner, localUserInfo){
        if(!localUserIsGroupOwner) {
            RBChatDialogHelper.showAlertDialog_INFO('友情提示', '只有群主才能解散群!');
            return;
        }

        // 对话框id，为了防止全局取id对象发生冲突，建议必须使用
        var dialogId = RBChatDialogHelper.nextDialogId();
        // 点击对话框确认按钮要执行的回调函数
        var fn_submitCallback = function (){
            // 先关闭确认对话框的显示
            RBChatDialogHelper.closeDialog(dialogId);

            // 调用HTTP REST接口：“【接口1016-24-26】解散群（仅开放给群主）”，具体参数和返回值，详见接口文档或服务端代码。
            RBChatRestHelper.submitDismissGroupToServer(localUserInfo.user_uid, nickNameInGroup, gid
                // 成功后的回调
                , function (returnValue) {

                    if(returnValue){

                        // 返回值为1 表示解散成功，否则失败（详见http rest 手册中的“【接口1016-24-26】”的返回值说明）
                        if('1' == returnValue){

                            // 先关闭当前确认对话框
                            RBChatDialogHelper.closeDialog(dialogId);
                            // toast提示
                            // RBChatToastHelper.showToast_OK('解散成功', null);

                            // 从缓存中清除此群信息
                            GroupsProvider.removeByGid(gid);
                            // 从缓存中删除此群聊天记录
                            GroupChattingCache.removeChatCache(gid);

                            // 从群组列表ui上清除此群显示
                            RBChatGroupsUI.deleteItem(gid);
                            // 从首页“消息”上清除此群组有关的所有UI信息（包括清除与此聊有关的聊天界面等信息）
                            RBChatAlarmsUI.deleteItem(AlarmMessageType.groupChatMessage, gid);
                        }
                        else if('2' ==  returnValue){
                            RBChatDialogHelper.showAlertDialog_WARN('失败提示', '您已不是群主，本次解散群失败！');
                        }
                    }
                    else {
                        RBChatUtils.logToConsole_WARN('[submitDismissGroupToServer] 解散群组请求完成，但服务端返回值是空！('+returnValue+')');
                    }
                }
                // 失败后的回调
                , function (errorThrownStr){
                    RBChatDialogHelper.showAlertDialog_ERROR('解散失败', '群组解散失败，可能是网络故障，请稍后再试！');
                }
            );
        };

        // 显示确认对话框
        RBChatDialogHelper.showConfrimDialog("确认提示", "确定解散"
            , "一旦解散群，所有与此群有关的记录都会被删除，确认解散吗？", dialogId, fn_submitCallback);
    };

    /**
     * 向服务端提交退出群聊的完整处理逻辑。
     *
     * @param gid
     * @param localUserIsGroupOwner
     * @param localUserInfo
     */
    UIModule6.prototype.doQuitGroupToServer = function(gid, localUserIsGroupOwner, localUserInfo){
        if(localUserIsGroupOwner) {
            RBChatDialogHelper.showAlertDialog_INFO('友情提示', '您是本群群主，请使用\"解散本群\"功能!');
            return;
        }

        // 对话框id，为了防止全局取id对象发生冲突，建议必须使用
        var dialogId = RBChatDialogHelper.nextDialogId();
        // 点击对话框中确认按钮要执行的回调函数
        var fn_submitCallback = function () {
            // 先关闭确认对话框的显示
            RBChatDialogHelper.closeDialog(dialogId);

            // 要提交的数据参见接口文档（退群接口重用的就是删除群成员接口）
            var d = new Array();
            var row = new Array();
            row.push(gid);
            row.push(localUserInfo.user_uid);
            row.push(localUserInfo.nickname);
            d.push(row);

            // 调用HTTP REST接口：“【接口1016-24-23】退群”，具体参数和返回值，详见接口文档或服务端代码。
            RBChatRestHelper.submitDeleteOrQuitGroupToServer(localUserInfo.user_uid, localUserInfo.nickname, gid, d
                // 成功后的回调
                , function (returnValue) {
                    if (returnValue) {
                        // 退群成功
                        if('1' == returnValue){

                            // 先关闭当前确认对话框
                            RBChatDialogHelper.closeDialog(dialogId);
                            // toast提示
                            // RBChatToastHelper.showToast_OK('退群成功', null);

                            // 从缓存中清除此群信息
                            GroupsProvider.removeByGid(gid);
                            // 从缓存中删除此群聊天记录
                            GroupChattingCache.removeChatCache(gid);

                            // 从群组列表ui上清除此群显示
                            RBChatGroupsUI.deleteItem(gid);
                            // 从首页“消息”上清除此群组有关的所有UI信息（包括清除与此聊有关的聊天界面等信息）
                            RBChatAlarmsUI.deleteItem(AlarmMessageType.groupChatMessage, gid);
                        }
                        // 退群失败
                        else{
                            RBChatDialogHelper.showAlertDialog_WARN('退群失败', '退出此群失败了，请稍后再试！');
                        }
                    }
                    else {
                        RBChatUtils.logToConsole_WARN('[submitDeleteOrQuitGroupToServer] 退群请求完成，但服务端返回值是空！('+returnValue+')');
                    }
                }
                // 失败后的回调
                , function (errorThrownStr){
                    RBChatDialogHelper.showAlertDialog_WARN('退群失败', '退出此群失败了，可能是网络故障，请稍后再试！');
                }
            );
        };

        // 显示确认对话框
        RBChatDialogHelper.showConfrimDialog("确认提示", "确定退群"
            , "一旦退群，与此群有关的记录都会被删除，确认退群吗？", dialogId, fn_submitCallback);
    };


    return new UIModule6();
})();