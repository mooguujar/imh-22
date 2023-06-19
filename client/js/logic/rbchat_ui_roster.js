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
 * 好友列表UI模块（是一个windows范围内的全局对象）。
 */
var RBChatRosterUI = (function () {

    // 构造器（相当于java里的构造方法）
    var UIModule3 = function (argument){

        if(RBChatUtils.isMobile()){
             // 添加好友按钮
            this.$addFriendBtn = $('#nav_bar_r_1');
            // 没有数据时显示的空数据提示ui根对象
            this.$emptyUIRoot = $('#kchat-im-panel-userlist-empty-roster-phone');
            // 有数据时正常显示数据的ui根对象
            this.$notEmptyUIRoot = $('#kchat-im-panel-userlist-roster-phone');
        }else{
              // 没有数据时显示的空数据提示ui根对象
            this.$emptyUIRoot = $('#kchat-im-panel-userlist-empty-roster');
            // 有数据时正常显示数据的ui根对象
            this.$notEmptyUIRoot = $('#kchat-im-panel-userlist-roster');
             // 添加好友按钮
            this.$addFriendBtn = $('#im-panel-userlist-wrap-roster-addfriend');
        }
    };

    /**
     * 本封装对象的所有初始化动作，放在本函数中执行。
     */
    UIModule3.prototype.init = function () {
        this.initButtonsEvent();
    };

    /**
     * 为按钮增加点击事件处理。
     */
    UIModule3.prototype.initButtonsEvent = function(){
        const that = this;
        const pop = $('#im-panel-userlist-wrap-roster-add-popup-phone');

        var menuItem1Obj = $('#im-panel-userlist-wrap-roster-add-popup-addfriend-phone');
        var menuItem2Obj = $('#im-panel-userlist-wrap-roster-add-popup-addgroup-phone');

        // 点击添加好友按钮的事件处理
        this.$addFriendBtn.click(function(event){
            pop.show();
            event.stopPropagation();  //阻止冒泡
        });
        // 添加好友
        menuItem1Obj.click(function(event){
             // 显示查找用户对话框
             RBChatDialogHelper.showQueryUserForm();
             pop.hide();
        })
        // 创建分组
        menuItem2Obj.click(function(event){
            pop.hide();
            RBChatDialogHelper.showGroupCreateForm();
        })

        // 添加搜索事件
        $('#kchat-im-panel-userlist-empty-roster-input').bind('input porpertychange',function(){
            var  val = $(this).val();
            if(val.length > 0){

                if(RBChatUtils.isMobile()){
                    //匹配值
                    $('#kchat-im-panel-userlist-roster li').each(function(i,item){
                        const name = $(item).find("h4").text()
                        $(item).css('display', name.indexOf(val)>= 0? '':'none');
                    })
                }else{
                    //pc端数据匹配
                    const list  = RosterProvider.getRosterData() || [];
                    const r_list = [];
                    for(var i = 0; i < list.length;i++){
                        const item = list[i];
                        var nickname = item.nickname;
                        var remark = item.friendRemark;
                        var userId = item.user_uid;
                        if(userId.indexOf(val) !=-1 || nickname.toLowerCase().indexOf(val.toLowerCase())!=-1 || remark.toLowerCase().indexOf(val.toLowerCase())!=-1){
                            r_list.push(item)
                        }
                    }
                    that.clear();
                    if(r_list && r_list.length > 0 && r_list.length > 1000){
                        r_list = r_list.slice(0,1000)
                    }
                    r_list.forEach(item=>{
                        that.addOrUpdate(item, false);
                    })
                    
                }

                if(!RBChatUtils.isMobile()){
                  $(".rstore-friend-group").css('display', 'none');
                }
                
                

            }else{
                if(RBChatUtils.isMobile()){
                    $('#kchat-im-panel-userlist-roster li').css('display','')
                }else{
                    that.reloadFromCache();
                }
            }
        })


        $("body").click(function (event) {
            pop.hide();
        });
    };

    UIModule3.prototype.reloadFromCache = function () {
        this.refreshListUI(RosterProvider.getRosterData());
    };

    /**
     * 用新的好友列表数据刷新列表的ui显示。
     *
     * @param reeObjs 使用新的RosterElementEntity对象数组，来刷新列表UI
     */
    UIModule3.prototype.refreshListUI = function (reeObjs) {

        // 先清空显示
        this.clear();
        const that = this;
        if(RBChatUtils.isMobile()){
            if(reeObjs && reeObjs.length > 0){
                for(var i = 0; i<reeObjs.length;i++){
                    var ree = reeObjs[i];
                    that.addOrUpdate(ree, false);
                }
            }
        }else{
            // console.log('好友列表信息', reeObjs)
            RBChatRestHelper.queryFenzu(
                // 数据读取成功后的回调
                function (returnValue) {
                    if(returnValue){
                      // 过滤需要显示的分组
                        const server_group_list = returnValue ?  JSON.parse(returnValue):[];
                        const  group_list = server_group_list.map(item=>{
                            return {
                                groupId: item[0],
                                groupName: item[1],
                                list: []
                            }
                        });
                        // 设置默认未分组
                        group_list.push({
                            groupId: '0',
                            groupName: '未分组',
                            list: []
                        })
                        if(reeObjs && reeObjs.length > 0){
                            for(var i = 0; i<reeObjs.length;i++){
                                var ree = reeObjs[i];
                                const groupId = ree.groupId || '0';
                                const groupName = ree.groupName || '未分组';
                                let groupInfo = group_list.find(item => item.groupId == groupId);
                                // 没有找到分组
                                if(!groupInfo){
                                    groupInfo = {
                                        groupId,
                                        groupName,
                                        list:[]
                                    }
                                    group_list.push(groupInfo)
                                }
                                groupInfo.list.push(ree)
                            }
                        }
                        window.friends_group_list = group_list || [];
                        that.reFlash_count_online_ui();
                        //绘制分组及好友
                        if(group_list.length > 0){
                            const len = group_list.length;
                            for(var i = 0; i<len;i++){
                                const item = group_list[i];
                                // 创建分组
                                that.createFenzu(item.groupId, item.groupName, 0, item.list.length, false, false);
                                // if(i==0){
                                //     that.showFriendsUI(item.groupId)
                                // }
                            }
                        }
                        // 刷新当前好友数量的UI显示，并决定内容面板的显示与否
                        that.refreshRosterItemCountShow();
                    }
                }
                // 数据读取失败后的回调
                , function (errorThrownStr) {
                    //alert('用户的基本信息数据加载出错，原因是：'+errorThrownStr);
                    RBChatDialogHelper.showAlertDialog_WARN('加载失败', '用户分组列表加载出错，可能是网络故障，请稍后再试！');
                }
                , true
                , null
            );
        }
    };

     /**
     * 显好友ui
     */
     UIModule3.prototype.showFriendsUI = function(groupId){
        $("li[bgroup='"+groupId+"']").remove();
        $("div[bgroup='"+groupId+"']").remove();
        const obj =  window.friends_group_list.find(item=> item.groupId- groupId == 0);
        if(obj){
            if(obj.list && obj.list.length > 0){
                const clen = obj.list.length > 20 ? 20:obj.list.length;
                let _list = [].concat(obj.list);
                _list = _list.slice(0,clen);
                _list.reverse()
                for(var j = 0; j < clen;j++){
                    const _item = _list[j];
                    this.addOrUpdate(_item, false, groupId, true);
                }
                // 判断是否需要显示更多
                this.createFenzuMore(groupId)
            }
         }
     }


     
     /**
     * 处理加载更多逻辑
     */
     UIModule3.prototype.fen_zu_more_logic = function(groupId){
        var that = this;
        // 移除更多
        const remove_more = function(){
            const d =  $("div[bgroup='"+groupId+"']");
            if(d){
                d.remove();
            }
        }
        // 加载更多好友数据
        const load_more_friends = function(list){
            const clen = list.length;
            for(var j = 0; j < clen;j++){
                const _item = list[j];
                that.add(_item, false, groupId, false,true);
            }
        }
        //获取当前显示好友的数量
        const c_len =  $("li[bgroup='"+groupId+"']") ? $("li[bgroup='"+groupId+"']").length:0;
        const obj =  window.friends_group_list.find(item=> item.groupId- groupId == 0);
        var end=0;
        if(obj && obj.list.length > 0){
             // 加载数据
             if(c_len < obj.list.length){
                 end =  c_len + 20;
                 // 还没有加载完数据
                 if(end < obj.list.length){
                     //加载数据
                     const _list = obj.list.slice(c_len, end)
                     load_more_friends(_list.reverse())
                 }else{
                    end =  obj.list.length -1;
                    //加载数据
                    const _list = obj.list.slice(c_len, end)
                    load_more_friends(_list.reverse())
                    remove_more();
                 }
             }else{
                remove_more();
             }
         }else{
              remove_more();
         }
     }

    /**
     * 显示分组ui
     */
    UIModule3.prototype.showGroupUI= function(groupId,isShow ){
            var that =this;
            // 收起
            if(!isShow){
                $("#rstore-group-"+groupId).attr('status', '0')
                $("#rstore-group-img-"+groupId).css('transform','rotate(-90deg)')
                $("li[bgroup='"+groupId+"']").remove();
                $("div[bgroup='"+groupId+"']").remove();
            // 展开
            }else{

                 //收起其他ui
                 window.friends_group_list.forEach(item=>{
                    if(item.groupId- groupId != 0)
                        that.showGroupUI(item.groupId,false)
                })

                $("#rstore-group-"+groupId).attr('status', '1')
                $("#rstore-group-img-"+groupId).css('transform','rotate(0deg)')

                // 绘制当前的绘制好友列表
                this.showFriendsUI(groupId)
            }
    }

     /**
     * 初始分组ui
     */
     UIModule3.prototype.initGroupUI= function(){
        var that = this;
        $(".rstore-friend-group").each(function(index,item){
            const stauts = $(item).attr('status');
            const groupId = $(item).attr('groupId');
            that.showGroupUI(groupId, stauts- 0 == 1)
        });
    }

     /**
     * 显示分组ui
     */
     UIModule3.prototype.countGroupUI =function(groupId='0'){
       const obj =  window.friends_group_list.find(item=> item.groupId- groupId == 0);
       if(obj){
            var count =  obj.list.length || 0;
            var on_line_list = obj.list.filter(item=> item.online);
            var online = on_line_list&&on_line_list.length > 0 ? on_line_list.length:0
            $("#rstore-group-count-"+groupId).text(online+"/"+count);
       }
     }

    /**
     * 创建分组
     */
    UIModule3.prototype.createFenzu = function(groupId,groupName,lineCount=0,allCount=0,isFrist=false, isFirstGroup = false){
        const status = isFirstGroup ? '1': '0';
        const  group_html = "<div status='"+status+"' class='rstore-friend-group' groupId='"+groupId+"' id='rstore-group-"+groupId+"'><div class='rstore-friend-group-item1'><img id='rstore-group-img-"+groupId+"' src='images/gourp-open.png'/> <span  id='rstore-group-name-"+groupId+"'>"+groupName+"</span></div> <span id='rstore-group-count-"+groupId+"'>"+lineCount+"/"+allCount+"</span></div>";
        var that = this;
        if(isFrist){
            this.$notEmptyUIRoot.prepend(group_html);
        }
        else{
            this.$notEmptyUIRoot.append(group_html);
        }
        // 默认展开第一个分组
        setTimeout(()=>{
            that.showGroupUI(groupId,isFirstGroup);
            that.countGroupUI(groupId);
        },250)
       
        // 添加点击事件
        $("#rstore-group-"+groupId).click(function(){
            const status = $(this).attr('status')
            that.showGroupUI(groupId,status - 0 == 0)
        })

        if(groupId - 0  != 0){
            // 添加右键修改名称
            $("#rstore-group-"+groupId).bind('contextmenu', function (e) {
                // 右键菜单主div层
                var popupId = "im-panel-msg-popupmenu";
                var oldPopupObj = $("#" + popupId);
                // 如果已经存在则先删除之（jq里选择器选回对象的Length>0表示该元素是存在的）
                if (oldPopupObj.length > 0)
                    oldPopupObj.remove();
                
                    // 构建菜单html内容
                var html =
                '<div id="' + popupId + '" style="display: none;">'
                + '   <div class="kchat-pop ">'
                + '       <ul>'
                +'<li id="im-panel-msg-popupmenu-modify-group-name">修改名称</li>'
                + (groupId - 0  != 0 ? '<li id="im-panel-msg-popupmenu-delete-group">删除分组</li>':'')
                + '       </ul>'
                + '   </div>'
                + '</div>';

                $(html).appendTo('body');
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

                // 点击空白处的事件处理（希望点空白，能自动隐藏菜单层的显示）
                $("body").click(function (event) {
                    newPopupObj.remove();
                });

                // 修改群组名称功能
                $('#im-panel-msg-popupmenu-modify-group-name').click(function(){
                    newPopupObj.remove();
                    RBChatDialogHelper.showGroupModifyNameForm(groupId,groupName);

                })
                // 删除分组
                $('#im-panel-msg-popupmenu-delete-group').click(function(){
                    RBChatRestHelper.deleteFenzu(groupId,
                        // 数据读取成功后的回调
                        function (returnValue) {
                            if(returnValue){
                                // 添加分组
                                that.deal_fen_local_to_last(function(){
                                    newPopupObj.remove();
                                    $("#rstore-group-"+groupId).remove();
                                    $("li[bgroup='"+groupId+"']").remove();
                                    $("div[bgroup='"+groupId+"']").remove();
                                    that.countGroupUI('0');
                                    that.showGroupUI('0',true)
                                });
                               
                            }
        
                        },function(){});
                })

                return false;
            });
        }
    };

    /**
     * 刷新好友总数及在线人数
     */
    UIModule3.prototype.reFlash_count_online_ui = function(){
            let count = 0;
            let online_count = 0;

            if( window.friends_group_list &&  window.friends_group_list.length > 0){
                window.friends_group_list.forEach(item=>{
                    item.list.forEach(item_=>{
                        count ++;
                        if(item_.online){
                            online_count++;
                        }
                    })
                })
            }
            $('#im-panel-userlist-wrap-roster-allcount').text(count)
            $('#im-panel-userlist-wrap-roster-allcount-online').text(online_count)
    }

      /**
     * 保持本地数据数据逻辑
     */
    UIModule3.prototype.deal_fen_local_to_last=function(callBack){
        var that = this;
      // 载入群组列表（载入数据并UI显示）
      RosterProvider.refreshRosterAsync(function () {
                const reeObjs = RosterProvider.getRosterData()
                RBChatRestHelper.queryFenzu(
                    // 数据读取成功后的回调
                    function (returnValue) {
                        if(returnValue){
                          // 过滤需要显示的分组
                            const server_group_list = returnValue ?  JSON.parse(returnValue):[];
                            const  group_list = server_group_list.map(item=>{
                                return {
                                    groupId: item[0],
                                    groupName: item[1],
                                    list: []
                                }
                            });
                            // 设置默认未分组
                            group_list.push({
                                groupId: '0',
                                groupName: '未分组',
                                list: []
                            })
                            if(reeObjs && reeObjs.length > 0){
                                for(var i = 0; i<reeObjs.length;i++){
                                    var ree = reeObjs[i];
                                    const groupId = ree.groupId || '0';
                                    const groupName = ree.groupName || '未分组';
                                    let groupInfo = group_list.find(item => item.groupId == groupId);
                                    // 没有找到分组
                                    if(!groupInfo){
                                        groupInfo = {
                                            groupId,
                                            groupName,
                                            list:[]
                                        }
                                        group_list.push(groupInfo)
                                    }
                                    groupInfo.list.push(ree)
                                }
                            }
                            window.friends_group_list =  group_list

                            //刷新好友 和在线人数
                            that.reFlash_count_online_ui();

                            if(callBack){
                                callBack();
                            }
                        }
                    }
                    // 数据读取失败后的回调
                    , function (errorThrownStr) {
                       
                    }
                    , true
                    , null
                );
        });
    }

     /**
     * 创建分组数据加载更多
     */
     UIModule3.prototype.createFenzuMore = function(groupId){
        const  group_html = "<div class='rstore-friend-group-more' bgroup="+groupId+" groupId='"+groupId+"' id='rstore-group-more-"+groupId+"'><span  id='rstore-group-name-"+groupId+"'>查看更多</span></div>";
        var that = this;
        const obj =  window.friends_group_list.find(item=> item.groupId- groupId == 0);
        if(obj && obj.list.length > 0){
            const d = $("li[bgroup='"+groupId+"']");
            if(d && d.length < obj.list.length ){
                $(d[d.length -1]).after(group_html)
                var that = this;
                // 添加点击事件
                $("#rstore-group-more-"+groupId).click(function(){
                    that.fen_zu_more_logic(groupId)
                })
            }
        }
       
    }


    UIModule3.prototype.newCreateFenzu = function(groupId,groupName,lineCount=0,allCount=0,isFrist=false, isFirstGroup = false){
        const  group_html = "<div class='rstore-friend-group-item1'><img id='rstore-group-img-"+groupId+"' src='images/gourp-open.png'/> <span  id='rstore-group-name-"+groupId+"'>"+groupName+"</span></div> <span id='rstore-group-count-"+groupId+"'>"+lineCount+"/"+allCount+"</span>";
        return group_html;
    };

    UIModule3.prototype.clear = function(){
        // 清空列表ui显示内容
        this.$notEmptyUIRoot.empty();
    };

    /**
     * 指定uid好友是否已经存在于ui中。
     *
     * @param uid 好友的uid
     * @returns {boolean} true表示已存在，否则不存在
     */
    UIModule3.prototype.existsItem = function(uid){
        var $itemObj = $('#roster_li_uid_'+uid);

        // 因为jquery取元素函数返回的结果是以数组形式返回的
        if($itemObj.length > 0)
            return true;

        return false;
    };

    /**
     * 插入或更新一个好友item。
     *
     * @param ree
     * @param toFirst true表示：插入到所有元素的前面（作为第1个）、或更新完成后移到首位，false：表示插入到尾部或者更新完成后不进行位置移动
     * @return boolean true表示本次插入之前此item不存在，否则本次是update而不是全新insert
     */
    UIModule3.prototype.addOrUpdate = function(ree, toFirst, groupId='0',isNewAddFriend=false){
        var uid = ree.user_uid;
        if(this.existsItem(uid)){
            RBChatUtils.logToConsole('【好友列表-addOrUpdate】uid='+uid+'的item已存在【YES】。');

            // 已存在则更新之
            // > 你可以在此实现已存在item的内容更新逻辑（如果需要的话）

            if(toFirst)
                this.moveToFirst(uid, groupId);

            return false;
        }
        else{
            RBChatUtils.logToConsole('【好友列表-insertOrUpdate】uid='+uid+'的item不存在【NO】！');

            // 不存在则新插入之
            this.add(ree, toFirst, groupId, isNewAddFriend);

            return true;
        }
    };

    /**
     * 将指定的好友item移动到首位。
     *
     * @param uid
     */
    UIModule3.prototype.moveToFirst = function(uid, groupId='0'){
        var $itemObj = $('#roster_li_uid_'+uid);

        // 因为jquery取元素函数返回的结果是以数组形式返回的
        if($itemObj.length > 0){
            // 将此元素移到父对象中的第1个
            $itemObj.prependTo(this.$notEmptyUIRoot);
        }
    };

    /**
     * 添加一个好友item到ui上。
     *
     * @param ree RosterElementEntity对象（详见：http://docs.52im.net/extend/docs/api/rainbowchatserver4_pro
     *                          /com/x52im/rainbowchat/http/logic/dto/RosterElementEntity.html）
     * @param toFirst true 表示添加到列表最前面，否则添加到尾部（不传本参数则默认表示加到列表尾部）
     */
    UIModule3.prototype.add = function(ree, toFirst, groupId='0', isNewAddFriend=false, isAddFriendList=false){

        var uid = ree.user_uid;
        var nickname = ree.nickname;
        var remark = ree.friendRemark;
        var avartarFileName = ree.userAvatarFileName;
        var whatsup = ree.whatsUp;
        var hasAvatar = (!RBChatUtils.isStringEmpty(avartarFileName));
        var hasWhatsup = (!RBChatUtils.isStringEmpty(whatsup));

        var contentToShow1 = (hasWhatsup?"[签名] "+whatsup:"UID："+uid+ree.lastBit);
        var contentToShow2 = (hasWhatsup?"[个人签名] "+whatsup:"UID："+uid+ree.lastBit);

        var that = this;

        var  avatarUrl = RBChatUtils.getUserAvatarDownloadURL(uid, true);
        const defaultColor = RBChatUtils.getBgColor(uid)
        const show_t = RBChatUtils.getNickNameWithRemark(ree).substr(0, 1).toUpperCase();
        let isLevel =  !RBChatUtils.isMobile(); //
        let level_css = '';
        let level_html = '';
        var l_html = '';
        if(isLevel){
            level_html = "<p class='other-tip-"+uid+"' noPayDate='"+ree.uedLastRechargeDate+"' noTime='"+ree.nowTime+"' level='"+ree.uedLevel +"' lastloginTime='"+ree.latestOfflineTime+"' >"
            var haveV =false;

            if(ree.uedLastRechargeDate && ree.uedLastRechargeDate.length > 0){
                level_html = level_html+ "<span><font color='red'>"+ RBChatUtils.dateDiff2(ree.uedLastRechargeDate)+"</font></span>"
                haveV = true;
            }
            if(ree.uedLevel - 0 > -1){
                level_html = level_html+ " <span><font color='black'>"+RBChatUtils.leveName(ree.uedLevel)+"</font></span>"
                haveV = true;
            }

            if(ree.latestOfflineTime && ree.latestOfflineTime.length > 0 && !ree.online){
                level_html = level_html + " <span>"+ RBChatUtils.dateDiff2(ree. latestOfflineTime)+'前</span>'
                haveV = true;
            }

            if(!haveV && ree.online){
                level_html = level_html+ " <span><font color='#57dc2d'>在线</font></span>"
                haveV = true;
            }
            
            level_css = " style = 'height:50px !important;'"
            l_html = level_html+'</p>'
           
        }

        // 被删除class
        let beDelClass = 'be-del-hide';
        if(ree.state - 0 == 3){
            beDelClass = 'be-del-show'
        }

        // 准备好好友的html
        var html =
            "<li id=\'roster_li_uid_"+uid+"\'  "+level_css+" title=\'UID: "+uid+"\' im-date=\'"+uid+"\'  bgroup="+groupId+" online='"+(ree.online ? '1':'0')+"'>"
            +"       <div>"
            +"            <a class=\'top-tag\' title=\'Current Tag\'></a>"
            +"            <a class=\'close\' title=\'删除好友\' id=\'roster_del_uid_"+uid+ree.lastBit+"\'></a>"
            +"            <div class=\'avatar-source human\'>"
            +"                 <div style='background:"+defaultColor+"'>"+show_t+" </div>"
            +                (false ?"<img onerror='javascript:$(this).remove()' src=\'"+avatarUrl+"\'>":"")
            + "    <div  class='lixian-tip "+beDelClass+"' bd-flag='bd-"+uid+"'>删</div>"
            +"                 <span id=\'roster_li_unreadflag_"+uid+"\' class=\'im-left-unreadmsg-flagnum\' style=\'display:none;\'>0</span>"
            +"                  <div  class='online_status_"+uid+"' style='height:10px;width:10px;background: "+(ree.online ? '#57dc2d':'#f26c4f')+"; border-radius: 50%;'></div>"
            +"            </div>"
            +"            <div class=\'info\'>"
            +"              <h4 id=\'roster_li_nickname_"+uid+"\'>"+(ree.protectFlag - 0 == 0 ?"<span class=\'user-weihu\' title=\'维护\'>维</span>":"")+RBChatUtils.getNickNameWithRemark(ree)+"</h4>"
            +l_html
            +"              <p>"
            // +"                  <img class=\'smallreddot\' src=\'../../images/roster_list_item_reddot_icon2.png\'>"
            +"                  <span id=\'roster_li_content_"+uid+"\' title=\'"+contentToShow2+"\'>"+contentToShow1+"</span>"
            +"              </p>"
            +"            </div>"
            +"        </div>"
            +"   </li>";
        // 是否是新添加好友
        if(isNewAddFriend){
            $("#rstore-group-"+groupId).after(html)
        }else if(isAddFriendList){
            const d = $("li[bgroup='"+groupId+"']");
            if(d && d.length >0 ){
                $(d[d.length -1]).after(html)
            }
        }else{
             // 添加到好友列表
            if(toFirst){
                this.$notEmptyUIRoot.prepend(html);
            }
            else{
                this.$notEmptyUIRoot.append(html);
            }
        } 

        // 为该好友的“删除”图标添加点击事件
        $("#roster_del_uid_"+uid).click(function(){
            // 执行“删除”操作
            that.deleteWithConfirm(uid,nickname);
            //阻止点击事件继续冒泡（防止点击删除图标的同时，又触发selectItem事件的处理，感觉不够爽）
            event.stopPropagation();
        });

        // item点击事件
        $("#roster_li_uid_"+uid).click(function(){
            // 取出uid值
            //var vid = $("#online_li_vid_"+visitorId).attr('im-date');

            // 设置选中（即打开聊天界面）
            that.selectedFriend(uid);
            RBChatChattingContentPaneUI.showRightChatContent();
            RBChatChattingContentPaneUI.scrollToBottom4IM();
            //alert('打开好友的聊天界面功能稍后实现！！！');
        });

        if(!RBChatUtils.isMobile()){
            $("#roster_li_uid_"+uid).bind('contextmenu', function (e) {
                RBChatRestHelper.queryFenzu(
                    // 数据读取成功后的回调
                    function (returnValue) {
                        const server_group_list = returnValue ?  JSON.parse(returnValue):[];
                        if(server_group_list.length > 0){
                                        // 右键菜单主div层
                            var popupId = "im-panel-msg-popupmenu";
                            var oldPopupObj = $("#" + popupId);
                            // 如果已经存在则先删除之（jq里选择器选回对象的Length>0表示该元素是存在的）
                            if (oldPopupObj.length > 0)
                                oldPopupObj.remove();
                            
                                // 构建菜单html内容
                            var html =
                            '<div id="' + popupId + '" style="display: none;">'
                            + '   <div class="kchat-pop ">'
                            + '       <ul>'
                            for(var i = 0; i < server_group_list.length;i++){
                                const item = server_group_list[i];
                                html = html+"<li id='im-panel-msg-popupmenu-move-group-"+item[0]+"'>移至: "+item[1]+"</li>"
                            }
    
                            htm = html +
                            + '       </ul>'
                            + '   </div>'
                            + '</div>';
    
                            $(html).appendTo('body');
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
    
                            // 点击空白处的事件处理（希望点空白，能自动隐藏菜单层的显示）
                            $("body").click(function (event) {
                                newPopupObj.remove();
                            });
    
                            // 依次添加点击事件
                            for(var i = 0; i < server_group_list.length;i++){
                                const item = server_group_list[i];
                                $("#im-panel-msg-popupmenu-move-group-"+item[0]).click(function(){
                                    RBChatRestHelper.submitMoveFenzu(item[0],uid,function(rv){
                                        if(rv){
                                            that.deal_fen_local_to_last(function(){
                                                newPopupObj.remove();
                                                that.countGroupUI(item[0]);
                                                that.showGroupUI(item[0],true)
                                            });
                                        }else{
                                            alert('操作失败,请重试')
                                        }
                                    },function(){
                                        alert('操作失败,请重试')
                                    })
    
                                })
                            }
    
                        }
    
                    },function(){});
    
                return false;
            });
        }

     

        // 刷新当前好友数量的UI显示，并决定内容面板的显示与否
        this.refreshRosterItemCountShow();

        RBChatUtils.logToConsole('【好友列表UI处理】好友'+uid+'已插入到列表UI中。【OK】');
    };



    /**
     * 带有确认对话框的删除指定uid好友实现函数（包括从UI上删除，并提交服务端进行数据库的数据删除）。
     *
     * @param uid
     * @param nickname
     */
    UIModule3.prototype.deleteWithConfirm = function(uid, nickname){
        //// 利用对话框返回的值 （true 或者 false）
        //if (confirm("确定要删除好友\""+nickname+"\"吗？")) {
        //    this.delete(uid);
        //}

        var that = this;

        // 对话框id，为了防止全局取id对象发生冲突，建议必须使用
        var dialogId = RBChatDialogHelper.nextDialogId();
        // 点击确认按钮要执行的回调函数
        var fn_submitCallback = function (){
            RBChatDialogHelper.closeDialog(dialogId);
            that.delete(uid);


        };

        // 显示确认对话框
        RBChatDialogHelper.showConfrimDialog("确认提示", "确认删除"
            , "此操作也会同时删除与该好友的所有聊天记录，确定要删除好友\""+nickname+"\"吗？", dialogId, fn_submitCallback);
    };

    /**
     * 删除指定uid的好友（包括从UI上删除，并提交服务端进行数据库的数据删除）。
     *
     * @param uid
     */
    UIModule3.prototype.delete = function(uid){

        var that = this;

        var localUserUid = LocalUserInfo.getObj().user_uid;
        var selectedFriendUid = uid;

        // 通过rest接口获取好友列表数据
        RBChatRestHelper.submitDeleteFriendToServer(localUserUid, selectedFriendUid

            // 服务端好友关系数据删除成功
            , function (returnValue){

                // 从好友列表UI中移除
                $("#roster_li_uid_"+uid).remove();
                // 将他的个人信息从好友列表的JS缓存中移除
                RosterProvider.remove(RosterProvider.getIndex(uid));

                // 从JS缓存中移除与指定用户的所有聊天数据
                SingleChattingCache.removeChatCache(uid);

                // 并尝试删除首页“消息”列表中与此人的item
                RBChatAlarmsUI.deleteItem(AlarmMessageType.reviceMessage, uid);

                // 刷新当前好友数量的UI显示，并决定内容面板的显示与否
                that.refreshRosterItemCountShow();

                // 删除成功的信息提示
                RBChatToastHelper.showToast_OK("删除成功", null);
            }
            // 服务端好友关系数据删除失败
            , function (errorThrownStr){
                //alert('好友删除失败，原因是：'+errorThrownStr);
                RBChatDialogHelper.showAlertDialog_WARN("删除失败", "好友删除失败了，请稍后再重试！");
            }
        );
    };

    /**
     * 设置一个好友为选中/聊天状态（并处理相应的数据加载、UI显示等完整逻辑）.
     *
     * 注意：本方法的点击事件处理逻辑跟首页“消息”里的好友聊天item点击处理逻辑是基本
     * 一致的(详见rhchat_ui_module.js的RBChatAlarmsUI对象的selectItem(..)函数)！
     *
     * @param friendUid
     */
    UIModule3.prototype.selectedFriend = function(friendUid){

        RBChatUtils.showChatDetail();

        var _selectedAlarmType = RBChatMainUI.getCurrentSelectedAlarmType();
        var _selectecAlarmDataId = RBChatMainUI.getCurrentSelectedAlarmDataId();

        window.alarms_msg={
            alarmMessageType:_selectedAlarmType,
            dataId:friendUid
        }

        // 如果当前item已经被选中过了，就不需要再次触发selected了
        if ((_selectedAlarmType != -1 && _selectedAlarmType === AlarmMessageType.reviceMessage)
            &&　(_selectecAlarmDataId && friendUid && _selectecAlarmDataId === friendUid)) {
            // console.log('【好友列表选中】当前item已处于selected状态，无需再次触发selected处理(当前_selectedAlarmType='
            //     +_selectedAlarmType+' | _selectecAlarmDataId='
            //     + _selectecAlarmDataId+", 将上将要选中的friendUid="+friendUid+")");

            // ui上显示为选中样式
            // $("#alarms_li_"+_selectedAlarmType+"_"+_selectecAlarmDataId).addClass("active");
        }
        else{
            // 本条设置选中前，如果之前已经有选中，则应首先取消此item的“选中”ui样式
            // 条件：即当_currentChattingUserId不为空且不为'N/A'时即表示是有效的选中
            // 说明：此处的'N/A'是由removeOnlineVisitor时设置，详见对应代码处的注释。
            if (_selectedAlarmType != -1 && (_selectecAlarmDataId && _selectecAlarmDataId !== 'N/A')) {
                $("#roster_li_uid_"+_selectecAlarmDataId).removeClass("active");

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
            _selectedAlarmType = AlarmMessageType.reviceMessage; // 好友聊天，对应的首页“消息”类型默认就是这个
            _selectecAlarmDataId = friendUid;
            RBChatMainUI.setCurrentSelectedAlarm(_selectedAlarmType, _selectecAlarmDataId);

            // console.log('【好友列表选中】您当前点击（选中）的好友是friendUid='+friendUid);

            // ui上显示为选中样式
            $("#roster_li_uid_"+friendUid).addClass("active");

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

            RBChatChattingContentPaneUI.loadCacheHistoryFromCache2(_selectedAlarmType, friendUid);

            // // 载入存放在本地JS缓存中的当前visitor的聊天记录
            // RBChatChattingContentPaneUI.loadChatHistoryFromLocalCache(_selectedAlarmType, friendUid);

            // // 尝试从服务端加载该用户的聊天历史记录
            // RBChatChattingContentPaneUI.loadChattingHistoryFromServer(_selectedAlarmType, friendUid);

            // 加载右边的详情查看功能
            RBChatRightDetailUI.showTabsForSelectedAlarm(AlarmMessageType.reviceMessage, friendUid);
        }
        //
        //// just for debug!!!!!!!!!!!!!!!!!
        //SingleChattingCache.showAllCacheForDebug();
    };

    /**
     * 刷新好友item总数的UI显示，并同时决定内容UI的可见性（当Item数为0时显示空UI，否则显示正常的列表UI，提升体验）。
     */
    UIModule3.prototype.refreshRosterItemCountShow = function(){
        var cntUIObj1 = $('#im-panel-userlist-wrap-roster-allcount');
        var cnt = RosterProvider.size();
        this.reFlash_count_online_ui();

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
     * 刷新列表中好友的选中ui选中样式显示（跟首页“消息”里的item选中内容保持一致！）.
     *
     * 本方法主要用于主界面，左边的主tab列表切换时，即时根据首页“消息”的选中情况，刷新本列表中对应好友的选中样式（不然ui选中样式就不同步了哦）。
     */
    UIModule3.prototype.refreshFriendItemSelectedUI = function(){
        var _selectedAlarmType = RBChatMainUI.getCurrentSelectedAlarmType();
        var _selectecAlarmDataId = RBChatMainUI.getCurrentSelectedAlarmDataId();

        // 将先将所有好友列表的item的ui选中样式清除（也就是#kchat-im-panel-userlist-roster元素的直接子li）
        var $allRosterItems = $('#kchat-im-panel-userlist-roster li');
        $allRosterItems.removeClass('active');

        // 刷新显示对应好友item的选中样式（目的是与首页“消息”里的item选中情况保持同步）
        if (_selectedAlarmType === AlarmMessageType.reviceMessage && (_selectecAlarmDataId && _selectecAlarmDataId !== 'N/A')) {
            $("#roster_li_uid_"+_selectecAlarmDataId).addClass("active");
        }
    };

    /**
     * 更新好友的昵称显示。
     *
     * @param uid
     * @param nicknameWithRemark
     */
    UIModule3.prototype.updateFriendNicknameWithRemark = function (uid, nicknameWithRemark) {
        var $friendNicknameObj = $("#roster_li_nickname_"+uid);
        // >0 表示找到了这个html元素
        if($friendNicknameObj.length > 0){
            if(nicknameWithRemark){
                $friendNicknameObj.text(nicknameWithRemark);
            }
        }
    };

    // 新建本模块对象
    var thisModule = new UIModule3();
    // 调用初始化方法
    thisModule.init();

    return thisModule;// 此种方式用于构造器的方式
    //return new UIModule3();// 此种方式用于构造器的方式
})();