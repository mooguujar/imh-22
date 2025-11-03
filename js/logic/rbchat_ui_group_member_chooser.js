
RBChatGroupMemberDialogFactory = function(usedFor, gid, isGroupOwner, isManager=false){

    // 构造器（相当于java里的构造方法）
    var RBChatGroupMemberDialog = function (a1, a2, a3,a4) {
        /** 调用者传进来的参数：本界面的用途 */
        this.usedForForInit = a1;
        /** 调用者传进来的参数：本参数在 {@link #usedForForInit}==USED_FOR_CREATE_GROUP 时无意义 */
        this.gidForInit = a2;
        /** 调用者传进来的参数：打开本界面的是否是本群群主 */
        this.isGroupOwnerForInit = a3;
        this.isManagerInit = a4;

        // console.log("a1-4",a1,a2,a3,a4)

        RBChatUtils.logToConsole("【群成员查看】调用者传进来的参数：usedForForInit="
            +this.usedForForInit+", gidForInit="+this.gidForInit+", isGroupOwnerForInit="+this.isGroupOwnerForInit);

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

        if(this.usedForForInit == GroupMemberDialogUsed.USED_FOR_CREATE_GROUP) {
            this.title = "创建群组";
            this.showCheckBox = true;
            this.descForNoData = "<span>暂无更多数据</span><br><span>请回到主界面添加更多好友</span>"
        }
        else if(this.usedForForInit == GroupMemberDialogUsed.USED_FOR_VIEW_OR_MANAGER_MEMBERS || this.usedForForInit == 11) {
            if(this.usedForForInit == 11){
                this.title = "选择提醒的人";
                this.isOKBtnShow = true;
                this.showCheckBox = true;
                this.descForNoData = "<span>暂无群组成员数据</span>"
            }else{
                 // 普通群员（只能查看群组成员）
            if(!(this.isGroupOwnerForInit || this.isManagerInit)) {
                this.title = "查看群员";
                this.isOKBtnShow = false;
                this.showCheckBox = false;
                this.descForNoData = "<span>暂无群组成员数据</span>"
            }
            // 群主（可以删除群员）
            else {
                this.title = "管理群员";
                this.isOKBtnShow = true;
                this.showCheckBox = true;
                this.descForNoData = "<span>暂无群组成员数据</span>"
            }
            }
           
        }
        else if(this.usedForForInit == GroupMemberDialogUsed.USED_FOR_INVITE_MEMBERS) {
            this.title = "邀请入群";
            this.descForNoData = "<span>暂无更多好友</span><br><span>请回到主界面添加更多好</span>"
        }
        else if(this.usedForForInit == GroupMemberDialogUsed.USED_FOR_TRANSFER) {
            this.title = "选择新群主";
            this.singleSelection = true;
            this.descForNoData = "<span>暂无更多好友供选择</span>"
        }
        else if(this.usedForForInit == GroupMemberDialogUsed.USED_FOR_INVIE_GROUP) {
            this.title = "一键拉群";
            this.singleSelection = false;
            this.descForNoData = "<span>暂无更多群聊供选择</span>"
        }
        else if(this.usedForForInit == GroupMemberDialogUsed.RE_CALL) {
            this.title = "消息撤回记录";
            this.singleSelection = false;
            this.descForNoData = "<span>暂无消息撤回记录</span>"
        }
    };

    /**
     * 根据不同的场景功能，决定对话框里的数据、ui显示及后绪的功能逻辑。
     *
     *
     * @see #showWithDialog()
     */
    RBChatGroupMemberDialog.prototype.loadAndShow = async function(){

        var that = this;
        var m_parms = JSON.stringify({gid:this.gidForInit, loginName:''})
        // console.log( m_parms)

        // 准备创建群数据（直接取我的本地好友列表即可）
        if(this.usedForForInit == GroupMemberDialogUsed.USED_FOR_CREATE_GROUP) {
            var memberList = new Array();

            // 我的好友列表数据（RosterElementEntity数组）
            // RosterElementEntity对象详见：http://docs.52im.net/extend/docs/api/rainbowchatserver4_pro/com/x52im/rainbowchat/http/logic/dto/RosterElementEntity.html
            var myRoster = RosterProvider.getRosterData();
            if (myRoster && myRoster.length > 0) {
                //for (RosterElementEntity ree : myRoster.getDataList())
                for (var i = 0;i< myRoster.length; i++) {
                    // RosterElementEntity对象
                    var ree = myRoster[i];

                    // 构造一个新的 GroupMemberEntity 对象
                    var m = this.constructFromRosterElement(ree);
                    if(m)
                        memberList.push(m);
                }
            }

            this.showWithDialog(memberList);
        }
        // 显示查看群成员数据
        else if(this.usedForForInit == GroupMemberDialogUsed.USED_FOR_VIEW_OR_MANAGER_MEMBERS || this.usedForForInit == 11){
            that.showWithMangerDialog();
        }
        // 显示邀请入群数据（可以被邀请的人条件是：“是我的好友” && “还没加入该群”）
        else if(this.usedForForInit == GroupMemberDialogUsed.USED_FOR_INVITE_MEMBERS) {
             // 可以被邀请的好友(GroupMemberEntity数组)
             var willBeInvite = new Array();
             // 我的当前好友列表（RosterElementEntity数组）
             var myRoster = RosterProvider.getRosterData();
             // 好有列表
             var uids = myRoster.map(item=> item.user_uid);
            // 通过rest接口获取好友列表数据
            RBChatRestHelper.submit1008_2_77_Server(this.gidForInit,uids
                , function (returnValue){
                    willBeInvite = myRoster.map(item=>{
                        var m = that.constructFromRosterElement(item);
                        if(m){
                            m.markname  = m.nickname;
                            m.lastBit = ''; //item.lastBit;
                            if(item.friendRemark && item.friendRemark.length > 0){
                                m.nickname = item.friendRemark;
                            }
                        }
                        return m;
                    })
                    // 过滤不在群里的好友
                    if(returnValue && returnValue.length > 0){
                        willBeInvite = willBeInvite.filter(item=> returnValue.indexOf('[\"'+item.user_uid+'\"]')==-1);
                    }
                    // UI上显示出来
                    that.showWithDialog(willBeInvite);
                }
                , function (errorThrownStr){
                    //alert('好友列表数据读取出错，原因是：'+errorThrownStr);
                    RBChatDialogHelper.showAlertDialog_WARN('加载失败', '邀请好友数据加载出错，可能是网络故障，请稍后再试！');
                }
            );
        }
        // 转让群（群主可以转让给本群内除已之外的其他人）
        else if(this.usedForForInit == GroupMemberDialogUsed.USED_FOR_TRANSFER){
            // 调用HTTP REST接口：“【接口1016-25-9】查询群成员列表的接口”，具体参数和返回值，详见接口文档或服务端代码。
            // RBChatRestHelper.submitGetGroupMembersListFromServer(m_parms
            //     // 成功后的回调
            //     , function (returnValue) {
            //         if (returnValue) {
            //             // 服务端返回的是ArrayList<GroupMemberEntity>对象数组
            //             var groupMembers = JSON.parse(returnValue);
            //             // 如果返回数据不为空
            //             if (groupMembers && groupMembers.length > 0) {

            //                 // 本地用户uid
            //                 var localUserUid = LocalUserInfo.getUid();
            //                 if(localUserUid){

            //                     // 以下代码用来找到"我"在群成员列表中的索引
            //                     var indexOfMe = -1;
            //                     for(var i=0; i<groupMembers.length; i++) {
            //                         var groupMembersUid = groupMembers[i].user_uid;
            //                         if(localUserUid == groupMembersUid) {
            //                             indexOfMe = i;
            //                             break;
            //                         }
            //                     }

            //                     // 将"我"从群成员列表数据集合中删除
            //                     if(indexOfMe != -1)
            //                         groupMembers.splice(indexOfMe, 1);
            //                 }

            //                 // UI界面上显示出来
            //                 that.showWithDialog(groupMembers);
            //             }
            //             else{
            //                 RBChatDialogHelper.showAlertDialog_WARN('无法转让', '群内成员不足，没有可供选择的转让对象！');
            //             }
            //         }
            //         else{
            //             RBChatUtils.logToConsole_WARN('拉取群成员数据完成，但returnValue为空！');
            //         }
            //     }
            //     // 失败后的回调
            //     , function (errorThrownStr){
            //         RBChatDialogHelper.showAlertDialog_WARN('加载失败', '拉取群成员列表数据失败了，可能是网络故障，请稍后再试！');
            //     }
            // );

            that.showWithMangerDialog();
        }
        // 显示一键入群数据（可以被邀请的人条件是：“是我的好友” && “还没加入该群”）
        else if(this.usedForForInit == GroupMemberDialogUsed.USED_FOR_INVIE_GROUP) {
            const arr = []
            const allGroup = GroupsProvider.getGroupsListData()
            let userGroupIds
            if (window._curUserGroup.uid != this.gidForInit) {
                const fn = () => {
                    return new Promise(resolve => {
                        RBChatRestHelper.submitGetUserGroupsToServer(this.gidForInit, (res) => {
                            resolve(JSON.parse(res || '[]'))
                        }) 
                    })
                }
                const res = await fn()
                userGroupIds = res.map(item => item[0])
            } else {
                userGroupIds = window._curUserGroup.data.map(item => item[0])
            }
            allGroup.forEach(group => {
                if ((!GroupsProvider.isGroupOwner(group.g_owner_user_uid) && group.manage_mark != 1) || userGroupIds.includes(group.g_id)) return
                arr.push(group)
            })

            // 可以被邀请的好友(GroupMemberEntity数组)
            // var willBeInvite = new Array();
            // 我的当前好友列表（RosterElementEntity数组）
            // var myRoster = RosterProvider.getRosterData();
            // 好有列表

            // UI上显示出来
            that.showWithDialog2(arr);
        }
        // 显示消息撤回记录
        else if(this.usedForForInit == GroupMemberDialogUsed.RE_CALL) {
            let userGroupIds
            if (window._curUserGroup?.uid != this.gidForInit) {
                const fn = () => {
                    return new Promise(resolve => {
                        RBChatRestHelper.submitGetUserGroupsToServer(this.gidForInit, (res) => {
                            resolve(JSON.parse(res || '[]'))
                        }) 
                    })
                }
                const res = await fn()
                userGroupIds = res.map(item => item[0])
            } else {
                userGroupIds = window._curUserGroup.data.map(item => item[0])
            }
            // const getGroupMember = () => {
            //     return new Promise(resolve => {
            //         RBChatRestHelper.submitGetGroupMembersListFromServer(JSON.stringify({gid: that.gidForInit, loginName: ''}) 
            //             // 成功后的回调
            //             , function (returnValue) {
            //                 if (returnValue) {
            //                     // 服务端返回的是ArrayList<GroupMemberEntity>对象数组
            //                     var groupMemberEntitys = JSON.parse(returnValue);
                              
            //                     resolve(groupMemberEntitys)
            //                 }
            //             }
            //         );
            //     })
            // }
            const getList = () => {
                return new Promise(resolve => {
                    RBChatRestHelper.queryGroupCehuiMsg(this.gidForInit, (res) => {
                        const _data = JSON.parse(res || '[]')
                        resolve(_data)
                    })
                })
            }

            const list = await getList()
            // const groupMember = await getGroupMember()
            const arr = list.map(item => {
                const _info = JSON.parse(item[2] || '{}')
                const _uid = _info.beUid || _info.uid
                // const inGroup = groupMember.find(user => user.user_uid == _uid)
                const isManager = window.managerIds.includes(_uid)
                return {
                    msgType: item[0],
                    content: item[1],
                    time: item[3],
                    heade_photo: item[4],
                    g_id: _uid,
                    g_uid: _uid,
                    isManager,
                    g_name: _info.beNickName || _info.nickName,
                    canKickGroup: !isManager,
                    ..._info
                }
            })

            // UI上显示出来
            that.showWithDialog3(arr);
        }
    };

    // 绘制好友ui
    RBChatGroupMemberDialog.prototype.drawFriendsUI = function(ls_list){

        const inputVal =  $('#search_txt').val();
        var groupMemberEntitys  = ls_list;
        window.groupMemberEntitys = groupMemberEntitys
        // 输入框有值，则显示过滤值
        if(inputVal && inputVal.length > 0){
            const r_list = groupMemberEntitys.filter(item=> item.nickname&& item.nickname.indexOf(inputVal) > -1 
            || item.user_uid&& item.user_uid.indexOf(inputVal) > -1 || item.nickname_ingroup&& item.nickname_ingroup.indexOf(inputVal) > -1)
            window.groupMemberEntitys = r_list;
            groupMemberEntitys = r_list;
        }

          // 每页显示50
          const  PAGE_SIZE = 50;
          var that = this;
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

            //   console.info('[成员列表-item点击] dataIndex='+dataIndex+',srcUid='+srcUid
            //       +', isSelected='+isSelected+",isSelected="+isSelected
            //       +', groupMemberEntitys.index='+JSON.stringify(groupMemberEntitys[dataIndex]));

              if(srcUid){

                  // 界面支持checkbox的模式下，才需要进行check逻辑处理
                  if(that.showCheckBox){

                      // 如果当前模式是删除群员，且该行是群主自已时，就不允许响应选择状态的改变哦
                      if(!that.isGroupOwnerCanNotDeleteHimself(srcUid)) {
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
                  }
                  // 否则点击item就显示该人员的个人信息
                  else{
                      RBChatDialogHelper.showUserInfoFromServer(false, null, srcUid, null);
                  }
              }

              // 设置确认按钮的显示
            //   that.setOkButtonForSelected(dialogId, that.getSelectedCount());

              // 阻止事件继续冒泡
              event.stopPropagation();
          };

             // 初始ui显示
          var init_friends_ui = function(){
              $("li[gTag='group_send'").remove();
              $("div[gTag='group_send_more'").remove();
              const c_len = groupMemberEntitys.length> PAGE_SIZE ? PAGE_SIZE:groupMemberEntitys.length
              show_list(groupMemberEntitys.slice(0,c_len));

              // 创建更多
              if(groupMemberEntitys.length> PAGE_SIZE){
                  create_more_ui(groupMemberEntitys)
              }
          }

        // 绘制好友
          var  show_list = function(groupMemberEntitys,isFrist=true){
              var itemsHTML = '';
                      // 用数据构建成员列表的html
              for(var i = 0; i<groupMemberEntitys.length;i++) {

                  // 每一个元数据，都是一个完整的GroupMemberEntity对象（详见【接口1016-25-9】接口文档或服务端代码）
                  // GroupMemberEntity对象详见：http://docs.52im.net/extend/docs/api/rainbowchatserver4_pro/com/x52im/rainbowchat/http/logic/dto/GroupMemberEntity.html
                  var entityData = groupMemberEntitys[i];

                  // 用户id
                  var user_uid = entityData.user_uid;

                  // @屏蔽调自己
                  if(that.usedForForInit == 11){
                      var localUserUid = LocalUserInfo.getUid();
                      if(user_uid == localUserUid){
                          continue;
                      }
                  }
                  // 本群昵称
                  var nickname_ingroup = entityData.nickname_ingroup;
                  // 用户昵称
                  var nickname = entityData.nickname;
                  // 本字段仅用于客户端UI界面使用，与服务端无关。表示UI界面上的选中情况。
                  var selected = entityData.selected;

                  // true表示item里将显示checkbox，否则不显示
                  var itemShowCheckBox = false;
                  // true表示item里将显示“群主”标签，否则不显示
                  var itemShowOwnerFlag = false;
                  // true表示item里将显示“我”标签，否则不显示
                  var itemShowMeFlag = false;

                  var markname= entityData.markname || nickname;

                          // 是否显示选择框
                      if(that.showCheckBox) {
                          // 在删除群员的模下，群主不能删除自已！
                          if(that.isGroupOwnerCanNotDeleteHimself(user_uid))
                              itemShowCheckBox = false;
                          else
                              itemShowCheckBox = true;
                      }
                      else {
                          itemShowCheckBox = false;
                      }

              
                  // 该群对应的群信息（即GroupEntity对象）
                  var ge = GroupsProvider.getGroupInfoByGid(that.gidForInit);
                  // 如果当前行是群主，则显示群主标签
                  if(ge && (entityData.user_uid == ge.g_owner_user_uid)){
                      itemShowCheckBox = false;
                      itemShowOwnerFlag = true;
                  }
                  
                  else
                      itemShowOwnerFlag = false;

                  if(that.usedForForInit == 11){
                      itemShowCheckBox = true;
                  }

                  // 如果是“我”则显示“我”标签
                  itemShowMeFlag = (that.isMyself(user_uid)?true:false);

                  const defaultColor = RBChatUtils.getBgColor(user_uid)
                  const show_t = GroupsProvider.getMickNameInGroup(nickname, nickname_ingroup).substr(0, 1).toUpperCase();

                   // 会员信息
                    var level_html = '';
                    if(!RBChatUtils.isMobile()){
                        if(entityData.uedLevel && entityData.uedLevel - 0 > -1 ){
                            level_html = level_html + "<span class='level-name m-left'>"+RBChatUtils.leveName(entityData.uedLevel)+"</span>";
                        }
                        if(entityData.uedLastRechargeDate && entityData.uedLastRechargeDate.length > 0){
                            level_html = level_html + "<span class='m-left'><font color='red'>"+RBChatUtils.dateDiff(entityData.nowTime, entityData.uedLastRechargeDate)+"</font>未存款 </span>"
                        }
    
                        if(entityData.uedMoney && entityData.uedMoney.length > 0){
                            level_html = level_html + "<span class='m-left'><font color='black'>"+RBChatUtils.formatMoney(entityData.uedMoney)+"</font></span>"
                        }
    
                        if(entityData.adminNickname && entityData.adminNickname.length > 0){
                            level_html = level_html + "<span class='m-left'> 群管:"+entityData.adminNickname+"</span>"
                        }
    
                    }
                    entityData.lastBit = null;
                   
                  // 将每一个item的html拼接起来
                  itemsHTML +=
                      "<li style=\'cursor: pointer;\' gTag='group_send' id=\'im-group-member_li_"+user_uid+"\' srcuid=\'"+user_uid+"\' nickname='"+GroupsProvider.getMickNameInGroup(nickname, nickname_ingroup)+"' dataindex=\'"+i+"\' isselected=\'"+(selected?"1":"0")+"\'>"+
                      "	<div>"+
                      "		<div class=\'avatar-source human\'>"+
                      "                 <div style='background:"+defaultColor+"'>"+show_t+" </div>"+
                      "			<img onerror='javascript:$(this).remove()'  id=\'im-group-member_li_avartarimg_"+user_uid+"\' srcuid=\'"+user_uid+"\' style=\'z-index: 99;\' src=\'"+RBChatUtils.getUserAvatarDownloadURL(user_uid, true)+"\'>"+
                      "		</div>"+
                      "		<div class=\'info\'>"+
                      "			<h4 style='display:flex'><span id=\'im-group-member_li_nickname_"+user_uid+"\' markname='"+markname+"' class=\'msg_title\'>"+GroupsProvider.getMickNameInGroup(nickname, nickname_ingroup)+"</span>"+level_html+"</h4>"+
                      "			<p>"+
                      (RBChatUtils.isMobile() && that.usedForForInit == 11 ? "":"				<span class=\'group_member_id\'>ID: "+user_uid+(entityData.lastBit?entityData.lastBit:"")+"</span>")+
                      (that.usedForForInit!=11 && entityData.manage_mark-0 == 1?
                          "				<span class=\'group_owner_flag\' title=\'我是管理员！\'>管理员</span>":"")+
                      (that.usedForForInit!=11 &&itemShowOwnerFlag?
                          "				<span class=\'group_owner_flag\' title=\'我是群主！\'>群主</span>":"")+
                      (that.usedForForInit!=11 &&itemShowMeFlag?
                          "				<span class=\'group_me\' title=\'我自已！\'>我</span>":"")+
                          (entityData.forbidStatus-0 == 2?
                            "				<span class=\'group_me\' title=\'禁言中\'>禁言中</span>":"")+
                      "			</p>"+
                      (itemShowCheckBox?
                          "			<i id=\'im-group-member_li_checkbox_"+user_uid+"\' class=\'"+(selected?"weui-icon-success":"weui-icon-circle")+"\'></i>":"")+
                      "		</div>"+
                      "	</div>"+
                      "</li>";
              }

              if(isFrist){
                  $('#im-group-member-list-content').append(itemsHTML)
              }else{
                  const d = $("li[gTag='group_send'");
                  $(d[d.length -1]).after(itemsHTML)
              }

              //事件点击
              for(var i = 0; i<groupMemberEntitys.length;i++){
                  // 每一个好友请求元数据，都是一个完整的RosterElementEntity对象（详见【接口1008-4-7】接口文档或服务端代码）
                  var reqData = groupMemberEntitys[i];
                  var uid = reqData.user_uid;
                  var ge = GroupsProvider.getGroupInfoByGid(that.gidForInit);
                  if(that.usedForForInit == 11){
                      $("#im-group-member_li_"+uid).click(fn_clickItem);
                  }else{
                        // 如果当前行是群主，则显示群主标签
                      if(ge && (uid == ge.g_owner_user_uid)){
                          
                      }else{
                          // 为每一行的item增加点击事件
                          $("#im-group-member_li_"+uid).click(fn_clickItem);
                      }
                  }
                  // 为每一行的item头像增加点击事件
                  $("#im-group-member_li_avartarimg_"+uid).click(fn_clickHead);
              }

          }
          
          // 处理点击加载
          var deal_more_logic = function(groupMemberEntitys){
              // 移除更多
              const remove_more = function(){
                  const d =  $("div[gTag='group_send_more']");
                  if(d){
                      d.remove();
                  }
              }
              //获取当前显示好友的数量
              const c_len =  $("li[gTag='group_send']") ? $("li[gTag='group_send']").length:0;
              var end = 0;
              // 加载数据
              if(c_len < groupMemberEntitys.length){
                  end =  c_len + PAGE_SIZE;
                  // 还没有加载完数据
                  if(end < groupMemberEntitys.length){
                      //加载数据
                      const _list = groupMemberEntitys.slice(c_len, end)
                      show_list(_list.reverse(),false)
                  }else{
                  end =  groupMemberEntitys.length -1;
                  //加载数据
                  const _list = groupMemberEntitys.slice(c_len, end)
                  show_list(_list.reverse(),false)
                  remove_more();
                  }
              }else{
              remove_more();
              }
          }
          // 创建加载更多
          var create_more_ui = function(list){
              const  group_html = "<div class='rstore-friend-group-more' gTag='group_send_more'  id='groupsend-more'><span>查看更多</span></div>";
              const d = $("li[gTag='group_send'");
              if(d){
                  $(d[d.length -1]).after(group_html)
                  // 添加点击事件
                  $("#groupsend-more").click(function(){
                      deal_more_logic(list)
                  })
              }
          }

          init_friends_ui()
    }

        // 绘制群聊ui
        RBChatGroupMemberDialog.prototype.drawGroupUI = function(ls_list, isSearch){
            const inputVal =  $('#search_txt').val();
            var groupMemberEntitys  = ls_list;
            if (!isSearch) {
                window.groupMemberEntitys = groupMemberEntitys
            }
            // 输入框有值，则显示过滤值
            if(inputVal && inputVal.length > 0 && !isSearch){
                const r_list = groupMemberEntitys.filter(item=> item.nickname&& item.nickname.indexOf(inputVal) > -1 
                || item.user_uid&& item.user_uid.indexOf(inputVal) > -1 || item.nickname_ingroup&& item.nickname_ingroup.indexOf(inputVal) > -1)
                window.groupMemberEntitys = r_list;
                groupMemberEntitys = r_list;
            }
    
              // 每页显示50
              const  PAGE_SIZE = 50;
              var that = this;
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
    
                //   console.info('[成员列表-item点击] dataIndex='+dataIndex+',srcUid='+srcUid
                //       +', isSelected='+isSelected+",isSelected="+isSelected
                //       +', groupMemberEntitys.index='+JSON.stringify(groupMemberEntitys[dataIndex]));
    
                  if(srcUid){
    
                      // 界面支持checkbox的模式下，才需要进行check逻辑处理
                      if(that.showCheckBox){
    
                          // 如果当前模式是删除群员，且该行是群主自已时，就不允许响应选择状态的改变哦
                          if(!that.isGroupOwnerCanNotDeleteHimself(srcUid)) {
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
                      }
                      // 否则点击item就显示该人员的个人信息
                      else{
                          RBChatDialogHelper.showUserInfoFromServer(false, null, srcUid, null);
                      }
                  }
    
                  // 设置确认按钮的显示
                //   that.setOkButtonForSelected(dialogId, that.getSelectedCount());
    
                  // 阻止事件继续冒泡
                  event.stopPropagation();
              };
    
                 // 初始ui显示
              var init_friends_ui = function(){
                  $("li[gTag='group_send'").remove();
                  $("div[gTag='group_send_more'").remove();
                  const c_len = groupMemberEntitys.length> PAGE_SIZE ? PAGE_SIZE:groupMemberEntitys.length
                  show_list(groupMemberEntitys.slice(0,c_len));
    
                  // 创建更多
                  if(groupMemberEntitys.length> PAGE_SIZE){
                      create_more_ui(groupMemberEntitys)
                  }
              }
    
            // 绘制好友
              var  show_list = function(groupMemberEntitys,isFrist=true){
                  var itemsHTML = '';
                          // 用数据构建成员列表的html
                  for(var i = 0; i<groupMemberEntitys.length;i++) {
    
                      // 每一个元数据，都是一个完整的GroupMemberEntity对象（详见【接口1016-25-9】接口文档或服务端代码）
                      // GroupMemberEntity对象详见：http://docs.52im.net/extend/docs/api/rainbowchatserver4_pro/com/x52im/rainbowchat/http/logic/dto/GroupMemberEntity.html
                      var entityData = groupMemberEntitys[i];
                      // 本字段仅用于客户端UI界面使用，与服务端无关。表示UI界面上的选中情况。
                      var selected = entityData.selected;
    
                      // 用户id
                      var g_uid = entityData.g_id;
                      var markname= entityData.g_name
    
                      // true表示item里将显示checkbox，否则不显示
                      var itemShowCheckBox = true;
    
                      const defaultColor = RBChatUtils.getBgColor(g_uid)
                      const show_t = markname.substr(0, 1).toUpperCase();
                      const isManager = window.managerIds.includes(g_uid)
                      const avatarUrl = entityData.heade_photo && entityData.heade_photo.length > 0 ? RBChatConfig.FILE_HTTPS_URL + '/head/'+entityData.heade_photo:'';
                      const params = JSON.stringify({ ...entityData, currentChatId: that.gidForInit })
                      if (that.usedForForInit == GroupMemberDialogUsed.RE_CALL) {
                        const html = RBChatChattingContentPaneUI.getMsgHtml(entityData.content, entityData.msgType, g_uid)
                        // 将每一个item的html拼接起来
                        itemsHTML +=
                        "<li style=\'height: auto;\' gTag='group_send' id=\'im-group-member_li_"+g_uid+"\' srcuid=\'"+g_uid+"\' dataindex=\'"+i+"\' isselected=\'"+(selected?"1":"0")+"\'>"+
                        "	<div>"+
                        "		<div class=\'avatar-source human\'>"+
                      "                 <div style='background:"+defaultColor+"'>"+show_t+" </div>"+
                      "			<img onerror='javascript:$(this).remove()'  id=\'im-group-member_li_avartarimg_"+g_uid+"\' srcuid=\'"+g_uid+"\' style=\'z-index: 99;\' src=\'"+avatarUrl+"\'>"+
                        "		</div>"+
                        "		<div class=\'info reCall-info\'>"+
                        "			<h4 id=\'im-group-member_li_nickname_"+g_uid+"\' markname='"+markname+"' style='display:flex;align-items: center;height: 100%;line-height: 40px;flex-direction: column;'><span class=\'msg_title\' style='max-width: 380px;line-height: 20px;width: 100%;'>"+entityData.g_name+"</span><span class=\'msg_title\' style='max-width: 380px;line-height: 20px;width: 100%;color: #999b9f;'>ID: "+g_uid+"</span></h4>"+
                        " <div>" +
                        ` ${!isManager ? `<span class=\'button\' onclick='RBChatChattingContentPaneUI.fengjinUser(${g_uid})'>封禁</span>` : ''}` +
                        ` ${entityData.canKickGroup ? `<span class=\'button\' onclick='RBChatChattingContentPaneUI.removeGroup(${params})'>踢出群聊</span>` : ''}` +
                        " </div>" +
                        "		</div>"+
                        "	</div>"+
                        " <div style=\'margin-top: 10px;\'>" +

                        " 内容：" + html +
                        " <br/>时间：" + entityData.time +
                        " </div>" +
                        "</li>";
                      } else {
                        // 将每一个item的html拼接起来
                        itemsHTML +=
                        "<li style=\'cursor: pointer;\' gTag='group_send' id=\'im-group-member_li_"+g_uid+"\' srcuid=\'"+g_uid+"\' dataindex=\'"+i+"\' isselected=\'"+(selected?"1":"0")+"\'>"+
                        "	<div>"+
                        "		<div class=\'avatar-source human\'>"+
                        "                 <div style='background:"+defaultColor+"'>"+show_t+" </div>"+
                        "			<img onerror='javascript:$(this).remove()' style=\'z-index: 99;\' src=\'"+avatarUrl+"\'>"+
                        "		</div>"+
                        "		<div class=\'info qaaa\'>"+
                        "			<h4 id=\'im-group-member_li_nickname_"+g_uid+"\' markname='"+markname+"' style='display:flex;align-items: center;height: 100%;'><span class=\'msg_title\' style='max-width: 380px;'>"+entityData.g_name+"</span></h4>"+
                        "			<p>"+
                        "				<span>群ID:" + g_uid +"</span>" +
                        "			</p>" +
                        (itemShowCheckBox?
                            "			<i id=\'im-group-member_li_checkbox_"+g_uid+"\' class=\'"+(selected?"weui-icon-success":"weui-icon-circle")+"\'></i>":"")+
                        "		</div>"+
                        "	</div>"+
                        "</li>";
                      }
                  }
                  if(isFrist){
                      $('#im-group-member-list-content').append(itemsHTML)
                  }else{
                      const d = $("li[gTag='group_send'");
                      $(d[d.length -1]).after(itemsHTML)
                  }
    
                  //事件点击
                  for(var i = 0; i<groupMemberEntitys.length;i++){
                      // 每一个好友请求元数据，都是一个完整的RosterElementEntity对象（详见【接口1008-4-7】接口文档或服务端代码）
                      var reqData = groupMemberEntitys[i];
                      var uid = reqData.g_id;
                      $("#im-group-member_li_"+uid).click(fn_clickItem);
                      // 为每一行的item头像增加点击事件
                      $("#im-group-member_li_avartarimg_"+uid).click(fn_clickHead);
                  }
    
              }
              
              // 处理点击加载
              var deal_more_logic = function(groupMemberEntitys){
                  // 移除更多
                  const remove_more = function(){
                      const d =  $("div[gTag='group_send_more']");
                      if(d){
                          d.remove();
                      }
                  }
                  //获取当前显示好友的数量
                  const c_len =  $("li[gTag='group_send']") ? $("li[gTag='group_send']").length:0;
                  var end = 0;
                  // 加载数据
                  if(c_len < groupMemberEntitys.length){
                      end =  c_len + PAGE_SIZE;
                      // 还没有加载完数据
                      if(end < groupMemberEntitys.length){
                          //加载数据
                          const _list = groupMemberEntitys.slice(c_len, end)
                          show_list(_list.reverse(),false)
                      }else{
                      end =  groupMemberEntitys.length -1;
                      //加载数据
                      const _list = groupMemberEntitys.slice(c_len, end)
                      show_list(_list.reverse(),false)
                      remove_more();
                      }
                  }else{
                  remove_more();
                  }
              }
              // 创建加载更多
              var create_more_ui = function(list){
                  const  group_html = "<div class='rstore-friend-group-more' gTag='group_send_more'  id='groupsend-more'><span>查看更多</span></div>";
                  const d = $("li[gTag='group_send'");
                  if(d){
                      $(d[d.length -1]).after(group_html)
                      // 添加点击事件
                      $("#groupsend-more").click(function(){
                          deal_more_logic(list)
                      })
                  }
              }
    
              init_friends_ui()
        }


     /**
     * 将准备好的列表数据在UI上显示出来，并自动根据业务类型显示相应的功能等。
     *
     * @param groupMemberEntitys 列表数据列表（即GroupMemberEntity对象数组）
     */
     RBChatGroupMemberDialog.prototype.showWithMangerDialog = function(){
        var that = this;
        var bodyHTML =
        "<div id=\'im-group-member-list-wrapper\' class=\'kchat-im-panel-userlist\'>"+
        "	<div>"+
        "		<div class=\'kchat-talk-list-group\'>"+
  
        " <ul id=\'im-group-member-list-content\'>"+"<li><div style='display: flex;justify-content: space-between'><input id='search_txt' style='width:90%;height:30px' placeholder='请输入id或昵称'/></input> <button id='manger-query'>查询</button></div>"+"</li></ul>"+
        "		<div id=\'im-group-member-list-empty\' class=\'kchat-talk-list-empty\' "+">"+
        "			<i class=\'icon-talk1\' style=\'font-size: 60px;\'></i>"+
        "			<p id='empty-tips'>请输入用户id或者昵称,点击‘查询’按钮进行搜索</p>"+
        "		</div>"+
        "		</div>"+
        "	</div>"+
        "</div>";

        var fn_clickItem = function(event){

            // 取出uid值
            var srcUid = $(this).attr('srcuid');
            // 该行item所对应的返回数据中的数组索引
            var dataIndex = $(this).attr('dataIndex');

            var isSelectedValue = $(this).attr('isselected');
            var isSelected = (isSelectedValue == '1'?true:false);

            if(srcUid){

                // 界面支持checkbox的模式下，才需要进行check逻辑处理
                if(that.showCheckBox){

                    // 如果当前模式是删除群员，且该行是群主自已时，就不允许响应选择状态的改变哦
                    if(!that.isGroupOwnerCanNotDeleteHimself(srcUid)) {
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
                }
                // 否则点击item就显示该人员的个人信息
                else{
                    RBChatDialogHelper.showUserInfoFromServer(false, null, srcUid, null);
                }
            }

            // 设置确认按钮的显示
            that.setOkButtonForSelected(dialogId, that.getSelectedCount(),reflash_user);

            // 阻止事件继续冒泡
            event.stopPropagation();
        };

         // 实现对话框中的列表Item的头像点击事件处理
        var fn_clickHead = function(event){
            // 取出uid值
            var srcUid = $(this).attr('srcuid');
            // 点击显示个人信息
            RBChatDialogHelper.showUserInfoFromServer(false, null, srcUid, null);
            // 阻止事件继续冒泡
            event.stopPropagation();
        };

        // 点击保存按钮要执行的回调函数
        var fn_submitCallback = function () {
            if(that.usedForForInit == 11){
                that.toTip(dialogId)
            }else{
                if(that.usedForForInit == GroupMemberDialogUsed.USED_FOR_VIEW_OR_MANAGER_MEMBERS) {
                    // 向服务端提交删除群员请求
                    that.submitDeleteGroupMemberAsyncTask(dialogId,reflash_user);
                }
                // 转让群
                else if(that.usedForForInit == GroupMemberDialogUsed.USED_FOR_TRANSFER){
                    // 向服务端提交转让群主请求
                    that.submitTransferGroupAsyncTask(dialogId,reflash_user);
                }
            }
           
        };

        // 绘制群成员列表
        var show_list = function(groupMemberEntitys){
            var itemsHTML = '';
            // 用数据构建成员列表的html
            for(var i = 0; i<groupMemberEntitys.length;i++) {
                // 每一个元数据，都是一个完整的GroupMemberEntity对象（详见【接口1016-25-9】接口文档或服务端代码）
                // GroupMemberEntity对象详见：http://docs.52im.net/extend/docs/api/rainbowchatserver4_pro/com/x52im/rainbowchat/http/logic/dto/GroupMemberEntity.html
                var entityData = groupMemberEntitys[i];
                // 用户id
                var user_uid = entityData.user_uid;
                // @屏蔽调自己
                if(that.usedForForInit == 11){
                    var localUserUid = LocalUserInfo.getUid();
                    if(user_uid == localUserUid){
                        continue;
                    }
                }
                // 本群昵称
                var nickname_ingroup = entityData.nickname_ingroup;
                // 用户昵称
                var nickname = entityData.nickname;
                // 本字段仅用于客户端UI界面使用，与服务端无关。表示UI界面上的选中情况。
                var selected = entityData.selected;

                // true表示item里将显示checkbox，否则不显示
                var itemShowCheckBox = false;
                // true表示item里将显示“群主”标签，否则不显示
                var itemShowOwnerFlag = false;
                // true表示item里将显示“我”标签，否则不显示
                var itemShowMeFlag = false;
                var markname= entityData.markname || nickname;
                // 是否显示选择框
                if(that.showCheckBox) {
                    // 在删除群员的模下，群主不能删除自已！
                    if(that.isGroupOwnerCanNotDeleteHimself(user_uid))
                        itemShowCheckBox = false;
                    else
                        itemShowCheckBox = true;
                }
                else {
                    itemShowCheckBox = false;
                }


                // 该群对应的群信息（即GroupEntity对象）
                var ge = GroupsProvider.getGroupInfoByGid(that.gidForInit);
                // 如果当前行是群主，则显示群主标签
                if(ge && (entityData.user_uid == ge.g_owner_user_uid)){
                    itemShowCheckBox = false;
                    itemShowOwnerFlag = true;
                }

                else
                    itemShowOwnerFlag = false;

                if(that.usedForForInit == 11){
                    itemShowCheckBox = true;
                }

               // 会员信息
               var level_html = '';
               if(!RBChatUtils.isMobile()){
                    if(entityData.uedLevel && entityData.uedLevel - 0 > -1 ){
                        level_html = level_html + "<span class='level-name m-left'>"+RBChatUtils.leveName(entityData.uedLevel)+"</span>";
                    }
                    if(entityData.uedLastRechargeDate && entityData.uedLastRechargeDate.length > 0){
                        level_html = level_html + "<span class='m-left'><font color='red'>"+RBChatUtils.dateDiff(entityData.nowTime, entityData.uedLastRechargeDate)+"</font>未存款 </span>"
                    }
    
                    if(entityData.uedMoney && entityData.uedMoney.length > 0){
                    level_html = level_html + "<span class='m-left'><font color='black'>"+RBChatUtils.formatMoney(entityData.uedMoney)+"</font></span>"
                    }
    
                    if(entityData.adminNickname && entityData.adminNickname.length > 0){
                        level_html = level_html + "<span class='m-left'> 群管:"+entityData.adminNickname+"</span>"
                    }
               }
               
                // 如果是“我”则显示“我”标签
                itemShowMeFlag = (that.isMyself(user_uid)?true:false);

                const defaultColor = RBChatUtils.getBgColor(user_uid)
                const show_t = GroupsProvider.getMickNameInGroup(nickname, nickname_ingroup).substr(0, 1).toUpperCase();

                // 将每一个item的html拼接起来
                itemsHTML +=
                    "<li style=\'cursor: pointer;\' gTag='group_send' id=\'im-group-member_li_"+user_uid+"\' srcuid=\'"+user_uid+"\' nickname='"+GroupsProvider.getMickNameInGroup(nickname, nickname_ingroup)+"' dataindex=\'"+i+"\' isselected=\'"+(selected?"1":"0")+"\'>"+
                    "	<div>"+
                    "		<div class=\'avatar-source human\'>"+
                    "                 <div style='background:"+defaultColor+"'>"+show_t+" </div>"+
                    "			<img onerror='javascript:$(this).remove()'  id=\'im-group-member_li_avartarimg_"+user_uid+"\' srcuid=\'"+user_uid+"\' style=\'z-index: 99;\' src=\'"+RBChatUtils.getUserAvatarDownloadURL(user_uid, true)+"\'>"+
                    "		</div>"+
                    "		<div class=\'info\'>"+
                    "			<h4 style='display:flex;'><span id=\'im-group-member_li_nickname_"+user_uid+"\' markname='"+markname+"' class=\'msg_title\'>"+GroupsProvider.getMickNameInGroup(nickname, nickname_ingroup)+"</span>"+level_html+"</h4>"+
                    "			<p>"+
                    (RBChatUtils.isMobile() && that.usedForForInit == 11 ? "":"				<span class=\'group_member_id\'>ID: "+user_uid+(entityData.lastBit?entityData.lastBit:"")+"</span>")+
                    (that.usedForForInit!=11 && entityData.manage_mark-0 == 1?
                        "				<span class=\'group_owner_flag\' title=\'我是管理员！\'>管理员</span>":"")+
                    (that.usedForForInit!=11 &&itemShowOwnerFlag?
                        "				<span class=\'group_owner_flag\' title=\'我是群主！\'>群主</span>":"")+
                    (that.usedForForInit!=11 &&itemShowMeFlag?
                        "				<span class=\'group_me\' title=\'我自已！\'>我</span>":"")+
                    (entityData.forbidStatus-0 == 2?
                            "				<span class=\'group_me\' title=\'禁言中\'>禁言中</span>":"")+
                    "			</p>"+
                    (itemShowCheckBox?
                        "			<i id=\'im-group-member_li_checkbox_"+user_uid+"\' class=\'"+(selected?"weui-icon-success":"weui-icon-circle")+"\'></i>":"")+
                    "		</div>"+
                    "	</div>"+
                    "</li>";
            }

            $('#im-group-member-list-content').append(itemsHTML)

            //事件点击
            for(var i = 0; i<groupMemberEntitys.length;i++){
                // 每一个好友请求元数据，都是一个完整的RosterElementEntity对象（详见【接口1008-4-7】接口文档或服务端代码）
                var reqData = groupMemberEntitys[i];
                var uid = reqData.user_uid;
                var ge = GroupsProvider.getGroupInfoByGid(that.gidForInit);
                if(that.usedForForInit == 11){
                    $("#im-group-member_li_"+uid).click(fn_clickItem);
                }else{
                    // 如果当前行是群主，则显示群主标签
                    if(ge && (uid == ge.g_owner_user_uid)){

                    }else{
                        // 为每一行的item增加点击事件
                        $("#im-group-member_li_"+uid).click(fn_clickItem);
                    }
                }
                // 为每一行的item头像增加点击事件
                $("#im-group-member_li_avartarimg_"+uid).click(fn_clickHead);
            }

        }

        //查询群成员
        var query_group_user = function(name){
            var m_parms = JSON.stringify({gid:that.gidForInit, loginName:name})
            RBChatRestHelper.submitGetGroupMembersListFromServer(m_parms
                // 成功后的回调
                , function (returnValue) {
                    if (returnValue) {
                        // 服务端返回的是ArrayList<GroupMemberEntity>对象数组
                        var groupMembers = JSON.parse(returnValue);
                        $("li[gTag='group_send'").remove();
                        // 如果返回数据不为空
                        if (groupMembers && groupMembers.length > 0) {
                            
                            $('#im-group-member-list-empty').hide();
                            show_list(groupMembers);
                        }
                        else{
                            $('#im-group-member-list-empty').show();
                            $('#empty-tips').text('没有找到相关的用户');
                        }
                    }
                    else{
                        RBChatUtils.logToConsole_WARN('拉取群成员数据完成，但returnValue为空！');
                    }
                }
                // 失败后的回调
                , function (errorThrownStr){
                    RBChatDialogHelper.showAlertDialog_WARN('加载失败', '拉取群成员列表数据失败了，可能是网络故障，请稍后再试！');
                }
            );
        }

        var reflash_user = function(){
            setTimeout(function(){
                query_group_user($('#search_txt').val());
            },1000);
        }

        // 对话框id，为了防止全局取id对象发生冲突，建议必须使用
        var dialogId = RBChatDialogHelper.nextDialogId();

        console.log(1232131)
        // 所有item的html拼接完成后，显示在对话模框里
        RBChatDialogHelper.showDialog(this.title
            , "取消"
            , "确定"
            , bodyHTML
            , dialogId
            , null
            , fn_submitCallback
            , this.isOKBtnShow
            , "min-width: 500px;"
            , "padding: 0;"
            , true
            , false);

        // 设置确认按钮的显示
        this.setOkButtonForSelected(dialogId, this.getSelectedCount(),reflash_user);

        $('#manger-query').click(function(){
                var input_text = $('#search_txt').val();
                if(input_text && input_text.length > 0){
                    query_group_user(input_text);
                }else{
                    alert('用户id或昵称不能为空!');
                }
        });

         // 默认添加全体人员
         if(that.usedForForInit == 11){
            var user_list = [{
                user_uid:333333,
                nickname:'全体人员',
                nickname_ingroup:'全体人员',
                selected: false,
            }];
            // 如果返回数据不为空
            if (user_list && user_list.length > 0) {
                            
                $('#im-group-member-list-empty').hide();
                show_list(user_list);
            }
            else{
                $('#im-group-member-list-empty').show();
                $('#empty-tips').text('没有找到相关的用户');
            }
        }
     }

    /**
     * 将准备好的列表数据在UI上显示出来，并自动根据业务类型显示相应的功能等。
     *
     * @param groupMemberEntitys 列表数据列表（即GroupMemberEntity对象数组）
     */
    RBChatGroupMemberDialog.prototype.showWithDialog = function(groupMemberEntitys){

        var that = this;
        var PAGE_SIZE = 50
        window.groupMemberEntitys = groupMemberEntitys || []
        // 绘制好友
        var show_list = function(groupMemberEntitys,isFrist=true){
            var itemsHTML = '';
            // 用数据构建成员列表的html
            for(var i = 0; i<groupMemberEntitys.length;i++) {

                // 每一个元数据，都是一个完整的GroupMemberEntity对象（详见【接口1016-25-9】接口文档或服务端代码）
                // GroupMemberEntity对象详见：http://docs.52im.net/extend/docs/api/rainbowchatserver4_pro/com/x52im/rainbowchat/http/logic/dto/GroupMemberEntity.html
                var entityData = groupMemberEntitys[i];

                // 用户id
                var user_uid = entityData.user_uid;

                // @屏蔽调自己
                if(that.usedForForInit == 11){
                    var localUserUid = LocalUserInfo.getUid();
                    if(user_uid == localUserUid){
                        continue;
                    }
                }
                // 本群昵称
                var nickname_ingroup = entityData.nickname_ingroup;
                // 用户昵称
                var nickname = entityData.nickname;
                // 本字段仅用于客户端UI界面使用，与服务端无关。表示UI界面上的选中情况。
                var selected = entityData.selected;

                // true表示item里将显示checkbox，否则不显示
                var itemShowCheckBox = false;
                // true表示item里将显示“群主”标签，否则不显示
                var itemShowOwnerFlag = false;
                // true表示item里将显示“我”标签，否则不显示
                var itemShowMeFlag = false;

                var markname= entityData.markname || nickname;

                // 是否显示选择框
                if(that.showCheckBox) {
                    // 在删除群员的模下，群主不能删除自已！
                    if(that.isGroupOwnerCanNotDeleteHimself(user_uid))
                        itemShowCheckBox = false;
                    else
                        itemShowCheckBox = true;
                }
                else {
                    itemShowCheckBox = false;
                }


                // 该群对应的群信息（即GroupEntity对象）
                var ge = GroupsProvider.getGroupInfoByGid(that.gidForInit);
                // 如果当前行是群主，则显示群主标签
                if(ge && (entityData.user_uid == ge.g_owner_user_uid)){
                    itemShowCheckBox = false;
                    itemShowOwnerFlag = true;
                }

                else
                    itemShowOwnerFlag = false;

                if(that.usedForForInit == 11){
                    itemShowCheckBox = true;
                }

               // 会员信息
               var level_html = '';
               if(!RBChatUtils.isMobile()){
                    if(entityData.uedLevel && entityData.uedLevel - 0 > -1 ){
                        level_html = level_html + "<span class='level-name m-left'>"+RBChatUtils.leveName(entityData.uedLevel)+"</span>";
                    }
                    if(entityData.uedLastRechargeDate && entityData.uedLastRechargeDate.length > 0){
                        level_html = level_html + "<span class='m-left'><font color='red'>"+RBChatUtils.dateDiff(entityData.nowTime, entityData.uedLastRechargeDate)+"</font>未存款 </span>"
                    }
    
                    if(entityData.uedMoney && entityData.uedMoney.length > 0){
                    level_html = level_html + "<span class='m-left'><font color='black'>"+RBChatUtils.formatMoney(entityData.uedMoney)+"</font></span>"
                    }
    
                    if(entityData.adminNickname && entityData.adminNickname.length > 0){
                        level_html = level_html + "<span class='m-left'> 群管:"+entityData.adminNickname+"</span>"
                    }
               }
               


                // 如果是“我”则显示“我”标签
                itemShowMeFlag = (that.isMyself(user_uid)?true:false);

                const defaultColor = RBChatUtils.getBgColor(user_uid)
                const show_t = GroupsProvider.getMickNameInGroup(nickname, nickname_ingroup).substr(0, 1).toUpperCase();

                // 将每一个item的html拼接起来
                itemsHTML +=
                    "<li style=\'cursor: pointer;\' gTag='group_send' id=\'im-group-member_li_"+user_uid+"\' srcuid=\'"+user_uid+"\' nickname='"+GroupsProvider.getMickNameInGroup(nickname, nickname_ingroup)+"' dataindex=\'"+i+"\' isselected=\'"+(selected?"1":"0")+"\'>"+
                    "	<div>"+
                    "		<div class=\'avatar-source human\'>"+
                    "                 <div style='background:"+defaultColor+"'>"+show_t+" </div>"+
                    "			<img onerror='javascript:$(this).remove()'  id=\'im-group-member_li_avartarimg_"+user_uid+"\' srcuid=\'"+user_uid+"\' style=\'z-index: 99;\' src=\'"+RBChatUtils.getUserAvatarDownloadURL(user_uid, true)+"\'>"+
                    "		</div>"+
                    "		<div class=\'info\'>"+
                    "			<h4 style='display:flex;'><span id=\'im-group-member_li_nickname_"+user_uid+"\' markname='"+markname+"' class=\'msg_title\'>"+GroupsProvider.getMickNameInGroup(nickname, nickname_ingroup)+"</span>"+level_html+"</h4>"+
                    "			<p>"+
                    (RBChatUtils.isMobile() && that.usedForForInit == 11 ? "":"				<span class=\'group_member_id\'>ID: "+user_uid+(entityData.lastBit?entityData.lastBit:"")+"</span>")+
                    (that.usedForForInit!=11 && entityData.manage_mark-0 == 1?
                        "				<span class=\'group_owner_flag\' title=\'我是管理员！\'>管理员</span>":"")+
                    (that.usedForForInit!=11 &&itemShowOwnerFlag?
                        "				<span class=\'group_owner_flag\' title=\'我是群主！\'>群主</span>":"")+
                    (that.usedForForInit!=11 &&itemShowMeFlag?
                        "				<span class=\'group_me\' title=\'我自已！\'>我</span>":"")+
                    (entityData.forbidStatus-0 == 2?
                            "				<span class=\'group_me\' title=\'禁言中\'>禁言中</span>":"")+
                    "			</p>"+
                    (itemShowCheckBox?
                        "			<i id=\'im-group-member_li_checkbox_"+user_uid+"\' class=\'"+(selected?"weui-icon-success":"weui-icon-circle")+"\'></i>":"")+
                    "		</div>"+
                    "	</div>"+
                    "</li>";
            }

            if(isFrist){
                $('#im-group-member-list-content').append(itemsHTML)
            }else{
                const d = $("li[gTag='group_send'");
                $(d[d.length -1]).after(itemsHTML)
            }

            //事件点击
            for(var i = 0; i<groupMemberEntitys.length;i++){
                // 每一个好友请求元数据，都是一个完整的RosterElementEntity对象（详见【接口1008-4-7】接口文档或服务端代码）
                var reqData = groupMemberEntitys[i];
                var uid = reqData.user_uid;
                var ge = GroupsProvider.getGroupInfoByGid(that.gidForInit);
                if(that.usedForForInit == 11){
                    $("#im-group-member_li_"+uid).click(fn_clickItem);
                }else{
                    // 如果当前行是群主，则显示群主标签
                    if(ge && (uid == ge.g_owner_user_uid)){

                    }else{
                        // 为每一行的item增加点击事件
                        $("#im-group-member_li_"+uid).click(fn_clickItem);
                    }
                }
                // 为每一行的item头像增加点击事件
                $("#im-group-member_li_avartarimg_"+uid).click(fn_clickHead);
            }

        }

        // 处理点击加载
        var deal_more_logic = function(groupMemberEntitys){
            // 移除更多
            const remove_more = function(){
                const d =  $("div[gTag='group_send_more']");
                if(d){
                    d.remove();
                }
            }
            //获取当前显示好友的数量
            const c_len =  $("li[gTag='group_send']") ? $("li[gTag='group_send']").length:0;
            var end = 0;
            // 加载数据
            if(c_len < groupMemberEntitys.length){
                end =  c_len + PAGE_SIZE;
                // 还没有加载完数据
                if(end < groupMemberEntitys.length){
                    //加载数据
                    const _list = groupMemberEntitys.slice(c_len, end)
                    show_list(_list.reverse(),false)
                }else{
                end =  groupMemberEntitys.length -1;
                //加载数据
                const _list = groupMemberEntitys.slice(c_len, end)
                show_list(_list.reverse(),false)
                remove_more();
                }
            }else{
            remove_more();
            }
        }

        // 初始ui显示
        var init_friends_ui = function(list){
            $("li[gTag='group_send'").remove();
            $("div[gTag='group_send_more'").remove();
            let  r_list = list? list: groupMemberEntitys;
            const c_len = r_list.length > PAGE_SIZE ? PAGE_SIZE:r_list.length
            show_list(r_list.slice(0,c_len));

            // 创建更多
            if(r_list.length> PAGE_SIZE){
                create_more_ui(r_list)
            }
        };
        var fn_clickItem = function(event){

            // 取出uid值
            var srcUid = $(this).attr('srcuid');
            // 该行item所对应的返回数据中的数组索引
            var dataIndex = $(this).attr('dataIndex');

            var isSelectedValue = $(this).attr('isselected');
            var isSelected = (isSelectedValue == '1'?true:false);

            if(srcUid){

                // 界面支持checkbox的模式下，才需要进行check逻辑处理
                if(that.showCheckBox){

                    // 如果当前模式是删除群员，且该行是群主自已时，就不允许响应选择状态的改变哦
                    if(!that.isGroupOwnerCanNotDeleteHimself(srcUid)) {
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
        // 创建加载更多
        var create_more_ui = function(list){
            const  group_html = "<div class='rstore-friend-group-more' gTag='group_send_more'  id='groupsend-more'><span>查看更多</span></div>";
            const d = $("li[gTag='group_send'");
            if(d){
                $(d[d.length -1]).after(group_html)
                // 添加点击事件
                $("#groupsend-more").click(function(){
                    deal_more_logic(list)
                })
            }
        }
        // 实现对话框中的列表Item的头像点击事件处理
        var fn_clickHead = function(event){
            // 取出uid值
            var srcUid = $(this).attr('srcuid');
            // 点击显示个人信息
            RBChatDialogHelper.showUserInfoFromServer(false, null, srcUid, null);
            // 阻止事件继续冒泡
            event.stopPropagation();
        };

        if(groupMemberEntitys && groupMemberEntitys.length > 0){
            // 构建所有item的html
           
            // 是否有item行
            var isHasItems = (groupMemberEntitys.length > 0);
           
            // 默认添加全体人员
            if(this.usedForForInit == 11){
                groupMemberEntitys.unshift({
                    user_uid:333333,
                    nickname:'全体人员',
                    nickname_ingroup:'全体人员',
                    selected: false,
                })
            }

            //this.usedForForInit == GroupMemberDialogUsed.USED_FOR_INVITE_MEMBERS

       
            // 置空
            $('#im-group-member-list-content').empty();

            // 将拼接好的html整好到即将到放dialog中的body的html中
            var bodyHTML =
                "<div id=\'im-group-member-list-wrapper\' class=\'kchat-im-panel-userlist\'>"+
                "	<div>"+
                "		<div class=\'kchat-talk-list-group\'>"+
                //			<!-- 当列表数据为空时要显示的提示信息 -->
                "		<div id=\'im-group-member-list-empty\' class=\'kchat-talk-list-empty\' "+(isHasItems?"style=\'display: none;\'>":"")+">"+
                "			<i class=\'icon-talk1\' style=\'font-size: 60px;\'></i>"+
                "			<p>"+this.descForNoData+"</p>"+
                "		</div>"+
                //			<!-- 动态组织的数据UI -->
                (isHasItems?("<ul id=\'im-group-member-list-content\'>"+(this.usedForForInit == GroupMemberDialogUsed.USED_FOR_INVITE_MEMBERS || this.usedForForInit == 11 || this.usedForForInit == GroupMemberDialogUsed.USED_FOR_VIEW_OR_MANAGER_MEMBERS?"<li><div style='display: flex'><input id='search_txt' style='width:99%;height:30px' placeholder='请输入id或昵称'/></input></div>":'')+"" +"</ul>"):"")+
                "		</div>"+
                "	</div>"+
                "</div>";

            // 对话框id，为了防止全局取id对象发生冲突，建议必须使用
            var dialogId = RBChatDialogHelper.nextDialogId();

            // 点击保存按钮要执行的回调函数
            var fn_submitCallback = function () {
                if(that.usedForForInit == 11){
                    that.toTip(dialogId)
                }else{
                        // 创建群
                    if(that.usedForForInit == GroupMemberDialogUsed.USED_FOR_CREATE_GROUP) {
                        if (that.getSelectedItems().length > 0) {
                            // 向服务端提交建群请求
                            that.submitCreateGroupAsyncTask(dialogId);
                        }
                        else {
                            RBChatToastHelper.showToast_WARN("请选择好友", null);
                        }
                    }
                    // 如果是群主进入到查看群成员界面，则是可以删除群员的
                    else if(that.usedForForInit == GroupMemberDialogUsed.USED_FOR_VIEW_OR_MANAGER_MEMBERS) {
                        // 向服务端提交删除群员请求
                        that.submitDeleteGroupMemberAsyncTask(dialogId);
                    }
                    // 邀请入群
                    else if(that.usedForForInit == GroupMemberDialogUsed.USED_FOR_INVITE_MEMBERS){
                        // 向服务端提交邀请群员请求
                        that.submitInviteToGroupAsyncTask(dialogId);
                    }
                    // 转让群
                    else if(that.usedForForInit == GroupMemberDialogUsed.USED_FOR_TRANSFER){
                        // 向服务端提交转让群主请求
                        that.submitTransferGroupAsyncTask(dialogId);
                    }
                }
               
            };

            // 所有item的html拼接完成后，显示在对话模框里
        console.log(1232131)
            RBChatDialogHelper.showDialog(this.title
                , "取消"
                , "确定"
                , bodyHTML
                , dialogId
                , null
                , fn_submitCallback
                , this.isOKBtnShow
                , "min-width: 500px;"
                , "padding: 0;"
                , true
                , false);

           
            // 设置确认按钮的显示
            this.setOkButtonForSelected(dialogId, this.getSelectedCount());

            this.drawFriendsUI(groupMemberEntitys);
           
            // 将事件循环添加到html的DOM对象上
            if(isHasItems){
                $('#search_txt').on('input propertychange', function (e){
                    const inputVal = $(this).val();
                    if(!inputVal || inputVal.length == 0){
                       init_friends_ui(window.groupMemberEntitys);
                    }else{
                        $("li[gTag='group_send'").remove();
                        $("div[gTag='group_send_more'").remove();
                        const list =window.groupMemberEntitys.filter(item=> item.nickname&& item.nickname.indexOf(inputVal) > -1 || item.user_uid&& (item.user_uid+"").indexOf(inputVal) > -1 || item.nickname_ingroup&& item.nickname_ingroup.indexOf(inputVal) > -1)
                        if(list.length > 0){
                            const c_len = list.length> PAGE_SIZE ? PAGE_SIZE :list.length
                            show_list(list.slice(0,c_len));
                            
                            // 创建更多
                            if(list.length> PAGE_SIZE){
                                create_more_ui(list)
                            }
                        }
                    }
                });
            }
        }
        // 数据为空时
        else{
            RBChatUtils.logToConsole('【RBChatGroupMemberDialog.show】成员列表数据为空，本次解析已结束。');

            // 给一个空数据提示，提升用户体验
            RBChatDialogHelper.showNoDataDialog(null, "暂无更多数据");
        }
    };

    /**
     * 将准备好的列表数据在UI上显示出来，并自动根据业务类型显示相应的功能等。
     *
     * @param groupMemberEntitys 列表数据列表（即GroupMemberEntity对象数组）
     */
    RBChatGroupMemberDialog.prototype.showWithDialog2 = function(groupMemberEntitys){

        var that = this;
        var PAGE_SIZE = 50
        window.groupMemberEntitys = groupMemberEntitys || []
        // 绘制好友
        var show_list = function(groupMemberEntitys,isFrist=true){
            var itemsHTML = '';
            // 用数据构建成员列表的html
            for(var i = 0; i<groupMemberEntitys.length;i++) {
                // 每一个元数据，都是一个完整的GroupMemberEntity对象（详见【接口1016-25-9】接口文档或服务端代码）
                // GroupMemberEntity对象详见：http://docs.52im.net/extend/docs/api/rainbowchatserver4_pro/com/x52im/rainbowchat/http/logic/dto/GroupMemberEntity.html
                var entityData = groupMemberEntitys[i];

                // 本字段仅用于客户端UI界面使用，与服务端无关。表示UI界面上的选中情况。
                var selected = entityData.selected;

                // true表示item里将显示checkbox，否则不显示
                var itemShowCheckBox = true;

                const defaultColor = RBChatUtils.getBgColor(entityData.g_id)
                console.log(entityData, 1251666641)
                const show_t = entityData.g_name.substr(0, 1).toUpperCase();

                var  avatarUrl = RBChatUtils.getGroupAvatarDownloadURL(entityData.g_id, false);

                // 将每一个item的html拼接起来
                itemsHTML +=
                    "<li style=\'cursor: pointer;\' gTag='group_send' id=\'im-group-member_li_"+entityData.g_id+"\' dataindex=\'"+i+"\' isselected=\'"+(selected?"1":"0")+"\'>"+
                    "	<div>"+
                    "		<div class=\'avatar-source human\'>"+
                    "                 <div style='background:"+defaultColor+"'>"+show_t+" </div>"+
                    "			<img onerror='javascript:$(this).remove()' style=\'z-index: 99;\' src=\'"+avatarUrl+"\'>"+
                    "		</div>"+
                    "		<div class=\'info\'>"+
                    "			<h4 style='display:flex;'><span class=\'msg_title\'>"+entityData.g_name+"</span>"+level_html+"</h4>"+
                    (itemShowCheckBox?
                        "			<i id=\'im-group-member_li_checkbox_"+user_uid+"\' class=\'"+(selected?"weui-icon-success":"weui-icon-circle")+"\'></i>":"")+
                    "		</div>"+
                    "	</div>"+
                    "</li>";
            }

            if(isFrist){
                $('#im-group-member-list-content').append(itemsHTML)
            }else{
                const d = $("li[gTag='group_send'");
                $(d[d.length -1]).after(itemsHTML)
            }

            //事件点击
            for(var i = 0; i<groupMemberEntitys.length;i++){
                // 每一个好友请求元数据，都是一个完整的RosterElementEntity对象（详见【接口1008-4-7】接口文档或服务端代码）
                var reqData = groupMemberEntitys[i];
                var uid = reqData.g_id;
                console.log(uid, 12431241555)
                if(that.usedForForInit == 11){
                    $("#im-group-member_li_"+uid).click(fn_clickItem);
                }else{
                    $("#im-group-member_li_"+uid).click(fn_clickItem);
                }
                // 为每一行的item头像增加点击事件
                $("#im-group-member_li_avartarimg_"+uid).click(fn_clickHead);
            }

        }

        // 处理点击加载
        var deal_more_logic = function(groupMemberEntitys){
            // 移除更多
            const remove_more = function(){
                const d =  $("div[gTag='group_send_more']");
                if(d){
                    d.remove();
                }
            }
            //获取当前显示好友的数量
            const c_len =  $("li[gTag='group_send']") ? $("li[gTag='group_send']").length:0;
            var end = 0;
            // 加载数据
            if(c_len < groupMemberEntitys.length){
                end =  c_len + PAGE_SIZE;
                // 还没有加载完数据
                if(end < groupMemberEntitys.length){
                    //加载数据
                    const _list = groupMemberEntitys.slice(c_len, end)
                    show_list(_list.reverse(),false)
                }else{
                end =  groupMemberEntitys.length -1;
                //加载数据
                const _list = groupMemberEntitys.slice(c_len, end)
                show_list(_list.reverse(),false)
                remove_more();
                }
            }else{
            remove_more();
            }
        }

        // 初始ui显示
        var init_friends_ui = function(list){
            $("li[gTag='group_send'").remove();
            $("div[gTag='group_send_more'").remove();
            let  r_list = list? list: groupMemberEntitys;
            const c_len = r_list.length > PAGE_SIZE ? PAGE_SIZE:r_list.length
            show_list(r_list.slice(0,c_len));

            // 创建更多
            if(r_list.length> PAGE_SIZE){
                create_more_ui(r_list)
            }
        };
        var fn_clickItem = function(event){

            // 取出uid值
            var srcUid = $(this).attr('srcuid');
            // 该行item所对应的返回数据中的数组索引
            var dataIndex = $(this).attr('dataIndex');

            var isSelectedValue = $(this).attr('isselected');
            var isSelected = (isSelectedValue == '1'?true:false);

            if(srcUid){

                // 界面支持checkbox的模式下，才需要进行check逻辑处理
                if(that.showCheckBox){

                    // 如果当前模式是删除群员，且该行是群主自已时，就不允许响应选择状态的改变哦
                    if(!that.isGroupOwnerCanNotDeleteHimself(srcUid)) {
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
        // 创建加载更多
        var create_more_ui = function(list){
            const  group_html = "<div class='rstore-friend-group-more' gTag='group_send_more'  id='groupsend-more'><span>查看更多</span></div>";
            const d = $("li[gTag='group_send'");
            if(d){
                $(d[d.length -1]).after(group_html)
                // 添加点击事件
                $("#groupsend-more").click(function(){
                    deal_more_logic(list)
                })
            }
        }
        // 实现对话框中的列表Item的头像点击事件处理
        var fn_clickHead = function(event){
            // 取出uid值
            var srcUid = $(this).attr('srcuid');
            // 点击显示个人信息
            RBChatDialogHelper.showUserInfoFromServer(false, null, srcUid, null);
            // 阻止事件继续冒泡
            event.stopPropagation();
        };

        if(groupMemberEntitys && groupMemberEntitys.length > 0){
            // 构建所有item的html
            
            // 是否有item行
            var isHasItems = (groupMemberEntitys.length > 0);
            
            // 默认添加全体人员
            if(this.usedForForInit == 11){
                groupMemberEntitys.unshift({
                    user_uid:333333,
                    nickname:'全体人员',
                    nickname_ingroup:'全体人员',
                    selected: false,
                })
            }

            //this.usedForForInit == GroupMemberDialogUsed.USED_FOR_INVITE_MEMBERS

        
            // 置空
            $('#im-group-member-list-content').empty();

            // 将拼接好的html整好到即将到放dialog中的body的html中
            var bodyHTML =
                "<div id=\'im-group-member-list-wrapper\' class=\'kchat-im-panel-userlist\'>"+
                "	<div>"+
                "		<div class=\'kchat-talk-list-group\'>"+
                //			<!-- 当列表数据为空时要显示的提示信息 -->
                "		<div id=\'im-group-member-list-empty\' class=\'kchat-talk-list-empty\' "+(isHasItems?"style=\'display: none;\'>":"")+">"+
                "			<i class=\'icon-talk1\' style=\'font-size: 60px;\'></i>"+
                "			<p>"+this.descForNoData+"</p>"+
                "		</div>"+
                //			<!-- 动态组织的数据UI -->
                (isHasItems?("<ul id=\'im-group-member-list-content\'><li><div style='display: flex'><input id='search_txt' style='width:99%;height:30px' placeholder='请输入群ID或群名'/></input></div>" +"</ul>"):"")+
                "		</div>"+
                "	</div>"+
                "</div>";

            // 对话框id，为了防止全局取id对象发生冲突，建议必须使用
            var dialogId = RBChatDialogHelper.nextDialogId();

            // 点击保存按钮要执行的回调函数
            var fn_submitCallback = function () {
                that.submitInviteToGroupAsyncTask2(dialogId)
            };

            // 所有item的html拼接完成后，显示在对话模框里
        console.log(1232131)
            RBChatDialogHelper.showDialog(this.title
                , "取消"
                , "确定"
                , bodyHTML
                , dialogId
                , null
                , fn_submitCallback
                , this.isOKBtnShow
                , "min-width: 500px;"
                , "padding: 0;"
                , true
                , false);

            
            // 设置确认按钮的显示
            this.setOkButtonForSelected(dialogId, this.getSelectedCount());

            this.drawGroupUI(groupMemberEntitys);
            
            // 将事件循环添加到html的DOM对象上
            if(isHasItems){
                $('#search_txt').on('input propertychange', function (e){
                    const inputVal = $(this).val();
                    if(!inputVal || inputVal.length == 0){
                        that.drawGroupUI(window.groupMemberEntitys);
                    }else{
                        $("li[gTag='group_send'").remove();
                        $("div[gTag='group_send_more'").remove();
                        const list =window.groupMemberEntitys.filter(item=> item.g_name.indexOf(inputVal) > -1 || item.g_id.indexOf(inputVal) > -1)
                        if(list.length > 0){
                            that.drawGroupUI(list, true);
                        }
                    }
                });
            }
        }
        // 数据为空时
        else{
            RBChatUtils.logToConsole('【RBChatGroupMemberDialog.show】成员列表数据为空，本次解析已结束。');

            // 给一个空数据提示，提升用户体验
            RBChatDialogHelper.showNoDataDialog(null, "暂无可邀请的群聊");
        }
    };

    /**
     * 
     *
     * @param groupMemberEntitys 列表数据列表（即GroupMemberEntity对象数组）
     */
    RBChatGroupMemberDialog.prototype.showWithDialog3 = function(groupMemberEntitys){

        var that = this;
        var PAGE_SIZE = 50
        window.groupMemberEntitys = groupMemberEntitys || []
        // 绘制好友
        var show_list = function(groupMemberEntitys,isFrist=true){
            var itemsHTML = '';
            // 用数据构建成员列表的html
            for(var i = 0; i<groupMemberEntitys.length;i++) {
                // 每一个元数据，都是一个完整的GroupMemberEntity对象（详见【接口1016-25-9】接口文档或服务端代码）
                // GroupMemberEntity对象详见：http://docs.52im.net/extend/docs/api/rainbowchatserver4_pro/com/x52im/rainbowchat/http/logic/dto/GroupMemberEntity.html
                var entityData = groupMemberEntitys[i];

                // 本字段仅用于客户端UI界面使用，与服务端无关。表示UI界面上的选中情况。
                var selected = entityData.selected;

                // true表示item里将显示checkbox，否则不显示
                var itemShowCheckBox = true;

                const defaultColor = RBChatUtils.getBgColor(entityData.g_id)
                const show_t = entityData.g_name.substr(0, 1).toUpperCase();

                var  avatarUrl = RBChatUtils.getGroupAvatarDownloadURL(entityData.g_id, false);

                // 将每一个item的html拼接起来
                itemsHTML +=
                    "<li style=\'cursor: pointer;\' gTag='group_send' id=\'im-group-member_li_"+entityData.g_id+"\' dataindex=\'"+i+"\' isselected=\'"+(selected?"1":"0")+"\'>"+
                    "	<div>"+
                    "		<div class=\'avatar-source human\'>"+
                    "                 <div style='background:"+defaultColor+"'>"+show_t+" </div>"+
                    "			<img onerror='javascript:$(this).remove()' style=\'z-index: 99;\' src=\'"+avatarUrl+"\'>"+
                    "		</div>"+
                    "		<div class=\'info\'>"+
                    "			<h4 style='display:flex;'><span class=\'msg_title\'>"+entityData.g_name+"</span>"+level_html+"</h4>"+
                    (itemShowCheckBox?
                        "			<i id=\'im-group-member_li_checkbox_"+user_uid+"\' class=\'"+(selected?"weui-icon-success":"weui-icon-circle")+"\'></i>":"")+
                    "		</div>"+
                    "	</div>"+
                    "</li>";
            }

            if(isFrist){
                $('#im-group-member-list-content').append(itemsHTML)
            }else{
                const d = $("li[gTag='group_send'");
                $(d[d.length -1]).after(itemsHTML)
            }

            //事件点击
            for(var i = 0; i<groupMemberEntitys.length;i++){
                // 每一个好友请求元数据，都是一个完整的RosterElementEntity对象（详见【接口1008-4-7】接口文档或服务端代码）
                var reqData = groupMemberEntitys[i];
                var uid = reqData.g_id;
                console.log(uid, 12431241555)
                if(that.usedForForInit == 11){
                    $("#im-group-member_li_"+uid).click(fn_clickItem);
                }else{
                    $("#im-group-member_li_"+uid).click(fn_clickItem);
                }
                // 为每一行的item头像增加点击事件
                $("#im-group-member_li_avartarimg_"+uid).click(fn_clickHead);
            }

        }

        // 处理点击加载
        var deal_more_logic = function(groupMemberEntitys){
            // 移除更多
            const remove_more = function(){
                const d =  $("div[gTag='group_send_more']");
                if(d){
                    d.remove();
                }
            }
            //获取当前显示好友的数量
            const c_len =  $("li[gTag='group_send']") ? $("li[gTag='group_send']").length:0;
            var end = 0;
            // 加载数据
            if(c_len < groupMemberEntitys.length){
                end =  c_len + PAGE_SIZE;
                // 还没有加载完数据
                if(end < groupMemberEntitys.length){
                    //加载数据
                    const _list = groupMemberEntitys.slice(c_len, end)
                    show_list(_list.reverse(),false)
                }else{
                end =  groupMemberEntitys.length -1;
                //加载数据
                const _list = groupMemberEntitys.slice(c_len, end)
                show_list(_list.reverse(),false)
                remove_more();
                }
            }else{
            remove_more();
            }
        }

        // 初始ui显示
        var init_friends_ui = function(list){
            $("li[gTag='group_send'").remove();
            $("div[gTag='group_send_more'").remove();
            let  r_list = list? list: groupMemberEntitys;
            const c_len = r_list.length > PAGE_SIZE ? PAGE_SIZE:r_list.length
            show_list(r_list.slice(0,c_len));

            // 创建更多
            if(r_list.length> PAGE_SIZE){
                create_more_ui(r_list)
            }
        };
        var fn_clickItem = function(event){

            // 取出uid值
            var srcUid = $(this).attr('srcuid');
            // 该行item所对应的返回数据中的数组索引
            var dataIndex = $(this).attr('dataIndex');

            var isSelectedValue = $(this).attr('isselected');
            var isSelected = (isSelectedValue == '1'?true:false);

            if(srcUid){

                // 界面支持checkbox的模式下，才需要进行check逻辑处理
                if(that.showCheckBox){

                    // 如果当前模式是删除群员，且该行是群主自已时，就不允许响应选择状态的改变哦
                    if(!that.isGroupOwnerCanNotDeleteHimself(srcUid)) {
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
        // 创建加载更多
        var create_more_ui = function(list){
            const  group_html = "<div class='rstore-friend-group-more' gTag='group_send_more'  id='groupsend-more'><span>查看更多</span></div>";
            const d = $("li[gTag='group_send'");
            if(d){
                $(d[d.length -1]).after(group_html)
                // 添加点击事件
                $("#groupsend-more").click(function(){
                    deal_more_logic(list)
                })
            }
        }
        // 实现对话框中的列表Item的头像点击事件处理
        var fn_clickHead = function(event){
            // 取出uid值
            var srcUid = $(this).attr('srcuid');
            // 点击显示个人信息
            RBChatDialogHelper.showUserInfoFromServer(false, null, srcUid, null);
            // 阻止事件继续冒泡
            event.stopPropagation();
        };

        if(groupMemberEntitys && groupMemberEntitys.length > 0){
            // 构建所有item的html
            
            // 是否有item行
            var isHasItems = (groupMemberEntitys.length > 0);
            
            // 默认添加全体人员
            if(this.usedForForInit == 11){
                groupMemberEntitys.unshift({
                    user_uid:333333,
                    nickname:'全体人员',
                    nickname_ingroup:'全体人员',
                    selected: false,
                })
            }

            //this.usedForForInit == GroupMemberDialogUsed.USED_FOR_INVITE_MEMBERS

        
            // 置空
            $('#im-group-member-list-content').empty();

            // 将拼接好的html整好到即将到放dialog中的body的html中
            var bodyHTML =
                "<div id=\'im-group-member-list-wrapper\' class=\'kchat-im-panel-userlist\'>"+
                "	<div>"+
                "		<div class=\'kchat-talk-list-group\'>"+
                //			<!-- 当列表数据为空时要显示的提示信息 -->
                //			<!-- 动态组织的数据UI -->
                (isHasItems?("<ul id=\'im-group-member-list-content\'><li><div style='display: flex'><input id='search_txt' style='width:99%;height:30px' placeholder='请输入用户ID或昵称'/></input></div>" +"</ul>"):"")+
                "		<div id=\'im-group-member-list-empty\' class=\'dasdasd kchat-talk-list-empty\' "+(isHasItems?"style=\'display: none;\'>":"")+
                "			<i class=\'icon-talk1\' style=\'font-size: 60px;\'></i>"+
                "			<p>"+this.descForNoData+"</p>"+
                "		</div>"+
                "		</div>"+
                "	</div>"+
                "</div>";

            // 对话框id，为了防止全局取id对象发生冲突，建议必须使用
            var dialogId = RBChatDialogHelper.nextDialogId();

            // 点击保存按钮要执行的回调函数
            var fn_submitCallback = function () {
                if (that.usedForForInit == GroupMemberDialogUsed.RE_CALL) {
                    RBChatDialogHelper.closeDialog(dialogId);
                    return
                }
                that.submitInviteToGroupAsyncTask2(dialogId)
            };

            // 所有item的html拼接完成后，显示在对话模框里
            RBChatDialogHelper.showDialog(this.title
                , "取消"
                , "确定1"
                , bodyHTML
                , dialogId
                , null
                , fn_submitCallback
                , this.isOKBtnShow
                , "min-width: 500px;"
                , "padding: 0;"
                , true
                , false);

            
            // 设置确认按钮的显示
            this.setOkButtonForSelected(dialogId, this.getSelectedCount());

            this.drawGroupUI(groupMemberEntitys);
            
            // 将事件循环添加到html的DOM对象上
            if(isHasItems){
                $('#search_txt').on('input propertychange', function (e){
                    const inputVal = $(this).val();
                    if(!inputVal || inputVal.length == 0){
                        that.drawGroupUI(window.groupMemberEntitys);
                    }else{
                        $("li[gTag='group_send'").remove();
                        $("div[gTag='group_send_more'").remove();
                        const list = window.groupMemberEntitys.filter(item=> item.g_name.indexOf(inputVal) > -1 || item.g_id.indexOf(inputVal) > -1)
                        if(list.length > 0){
                            $('#im-group-member-list-empty').hide()
                            that.drawGroupUI(list, true);
                        } else {
                            $('#im-group-member-list-empty').show()
                        }
                    }
                });
            }
        }
        // 数据为空时
        else{
            RBChatUtils.logToConsole('【RBChatGroupMemberDialog.show】成员列表数据为空，本次解析已结束。');

            // 给一个空数据提示，提升用户体验
            RBChatDialogHelper.showNoDataDialog(null, "暂无撤回消息");
        }
    };

    /**
     * 取消所有item的选中（状态）。
     */
    RBChatGroupMemberDialog.prototype.unSelectedAllItem = function() {
        // 所有的item
        var itemList = $('#im-group-member-list-content').children();
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
    RBChatGroupMemberDialog.prototype.selectedOneItem = function(uid, toSelected){

        var itemObj = $('#im-group-member_li_'+uid);
        // 取出uid值
        var srcUid = itemObj.attr('srcuid');

        // 设置选中状态的属性值
        itemObj.attr('isselected', toSelected?'1':'0');

        // 重置checkbox的ui显示
        var checkboxObj =  $('#im-group-member_li_checkbox_'+uid);
        // 先清除所有class
        checkboxObj.removeClass();
        // 再设置class（选中或未选中状态的class样式）
        checkboxObj.addClass(toSelected?'weui-icon-success':'weui-icon-circle');
    };

    /**
     * 获得单选模式下被选中的用户.
     *
     * @return GroupMemberEntity
     */
    RBChatGroupMemberDialog.prototype.getSingleSelectedUser = function() {
        var retGme = null;

        // 所有的item
        var itemList = $('#im-group-member-list-content').children();
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
                    var nickname = $('#im-group-member_li_nickname_'+srcUid).attr('markname');

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
     * 获得选中的行（只包含简单的列，主要用于提交到服务端，不必要的字段就没有必要一起发过去浪费流量）。
     * <b>注意：</b>本方法返回的集合，通常用于提交到服务端的http接口，因而要与对应的接口要求字段保持一致哦！！！
     *
     * @return {Array<Array>} 选中的item数组的2维数据形式
     */
    RBChatGroupMemberDialog.prototype.getSelectedItemsSimple= function() {

        var items = new Array();

        // 所有的item
        var itemList = $('#im-group-member-list-content').children();
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
                    var nickname = $('#im-group-member_li_nickname_' + srcUid).attr('markname');

                    // 数组
                    var row = new Array();
                    row.push(this.gidForInit);
                    row.push(srcUid);
                    row.push(nickname);

                    items.push(row);
                }
            }
        }

        return items;
    };

    /**
     * 获得当前选中的行。
     *
     * @return {Array<obj>} 对象数组
     */
    RBChatGroupMemberDialog.prototype.getSelectedItems = function() {
        var items = new Array();

        // 所有的item
        var itemList = $('#im-group-member-list-content').children();
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
                    var nickname = $('#im-group-member_li_nickname_' + srcUid).attr('markname');

                    // JS对象
                    var obj = {
                        'g_id'    : this.gidForInit,
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
    RBChatGroupMemberDialog.prototype.getSelectedCount = function() {
        var cnt = 0;
        var itemList = $('#im-group-member-list-content').children();
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
    RBChatGroupMemberDialog.prototype.resetOkButton = function(dialogId,callBack=null) {
        // console.log('resetOkButton',this.usedForForInit,this.isGroupOwnerForInit,dialogId,this.usedForForInit == GroupMemberDialogUsed.USED_FOR_VIEW_OR_MANAGER_MEMBERS && (this.isGroupOwnerForInit ||  this.isManagerInit))
        var $btnOK = $('#dialog-footer-okbtn-'+dialogId);
        // $btnOK.removeClass('btn-blue');
        // $btnOK.addClass('btn-blue-light')
        var that = this;
        const hasOp = RBChatUtils.getOpAdmin()
        // 群主使用查看群员功能时，确认按钮显示为删除
        if( this.usedForForInit == GroupMemberDialogUsed.USED_FOR_VIEW_OR_MANAGER_MEMBERS && (this.isGroupOwnerForInit ||  this.isManagerInit)){
            $btnOK.text("删除");
            $('#set_manager').remove();
            $('#cancle_manager').remove();
            $('#cancle_forbid').remove();
            $('#set_forbid').remove();
            // 群主才有 设置和取消管理员权限
            if(this.isGroupOwnerForInit){
                const _html = `
                    <a class='btn fr btn-blue' id='set_manager'>设置群管</a> 
                    <a class='btn fr btn-blue' id='cancle_manager'>取消群管</a>
                    ${hasOp ? "<a class='btn fr btn-blue' id='cancle_forbid'>取消禁言</a><a class='btn fr btn-blue' id='set_forbid'>禁言</a>" : ''}
                `
                $('#dialog-footer-'+dialogId).append(_html);
                var dialogId = RBChatDialogHelper.nextDialogId();
                $('#set_manager').click(function(){
                    const cb = () => {
                        const willBeDelete = that.getSelectedItemsSimple();
                        willBeDelete.forEach(item => {
                            const _el = $(`#im-group-member_li_${item[1]} .group_member_id`)
                            if (!$(`#im-group-member_li_${item[1]} .group_owner_flag`).length) {
                                _el.after('<span class=\'group_owner_flag\' title=\'我是管理员！\'>管理员</span>')
                            }
                        })
                        that.unSelectedAllItem()
                    }
                    that.submitSetManageAsyncTask(dialogId,'1', cb)
                });
                $('#cancle_manager').click(function(){
                    const cb = () => {
                        const willBeDelete = that.getSelectedItemsSimple();
                        willBeDelete.forEach(item => {
                          const _el = $(`#im-group-member_li_${item[1]} .group_owner_flag`)
                          _el.remove()
                        })
                        that.unSelectedAllItem()
                    }
                    that.submitSetManageAsyncTask(dialogId,'2',cb)
                });    
                $('#cancle_forbid').click(function(){
                    const cb = () => {
                        const willBeDelete = that.getSelectedItemsSimple();
                        willBeDelete.forEach(item => {
                          const _el = $(`#im-group-member_li_${item[1]} .group_me`)
                          _el.remove()
                        })
                        that.unSelectedAllItem()
                    }
                    that.submitSetForBidAsyncTask(dialogId,'1', cb)
                });
                $('#set_forbid').click(function(){
                    const cb = () => {
                        const willBeDelete = that.getSelectedItemsSimple();
                        willBeDelete.forEach(item => {
                          const _el = $(`#im-group-member_li_${item[1]} .info > p`)
                          if (!$(`#im-group-member_li_${item[1]} .group_me`).length) {
                            _el.append('<span class=\'group_me\' title=\'禁言中\'>禁言中</span>')
                          }
                        })
                        that.unSelectedAllItem()
                    }
                    that.submitSetForBidAsyncTask(dialogId,'2',cb)
                });
            // 群管
            }else{
                if (!hasOp) return
                $('#dialog-footer-'+dialogId).append("<a class='btn fr btn-blue' id='cancle_forbid'>取消禁言</a><a class='btn fr btn-blue' id='set_forbid'>禁言</a>");
                var dialogId = RBChatDialogHelper.nextDialogId();
                $('#cancle_forbid').click(function(){
                    const cb = () => {
                        const willBeDelete = that.getSelectedItemsSimple();
                        willBeDelete.forEach(item => {
                          const _el = $(`#im-group-member_li_${item[1]} .group_me`)
                          _el.remove()
                        })
                        that.unSelectedAllItem()
                    }
                    that.submitSetForBidAsyncTask(dialogId,'1',cb)
                });
                $('#set_forbid').click(function(){
                    const cb = () => {
                        const willBeDelete = that.getSelectedItemsSimple();
                        willBeDelete.forEach(item => {
                          const _el = $(`#im-group-member_li_${item[1]} .info > p`)
                          if (!$(`#im-group-member_li_${item[1]} .group_me`).length) {
                            _el.append('<span class=\'group_me\' title=\'禁言中\'>禁言中</span>')
                          }
                        })
                        that.unSelectedAllItem()
                    }
                    that.submitSetForBidAsyncTask(dialogId,'2',cb)
                });
            }
        }    
        else
            $btnOK.text(that.usedForForInit == GroupMemberDialogUsed.RE_CALL ? "关闭" : '确定');
    };

    /**
     * 决置确认按钮的可用性。
     *
     * @param enabled true表示可用，false表示禁用
     */
    RBChatGroupMemberDialog.prototype.setOkButtonEnable = function(dialogId, enabled,callBack=null) {
        var $btnOK = $('#dialog-footer-okbtn-'+dialogId);
        if(enabled) {
            $btnOK.removeClass('btn-blue-light');
            $btnOK.addClass('btn-blue');
        }
        else {
            this.resetOkButton(dialogId,callBack);
        }
    };

    /**
     * 设置确认按钮上的选中数量，并根据选中数据量决定按钮是否可点击。
     *
     * @param selectedCount 已选中的行数
     */
    RBChatGroupMemberDialog.prototype.setOkButtonForSelected = function(dialogId, selectedCount,callBack=null) {
        if(selectedCount > 0) {
            this.setOkButtonEnable(dialogId, true,callBack);

            var $btnOK = $('#dialog-footer-okbtn-'+dialogId);
            // 群主使用查看群员功能时，确认按钮显示为删除
            if(this.usedForForInit == GroupMemberDialogUsed.USED_FOR_VIEW_OR_MANAGER_MEMBERS && this.isGroupOwnerForInit)
                $btnOK.text("删除("+selectedCount+")");
            else if(this.usedForForInit == GroupMemberDialogUsed.USED_FOR_TRANSFER)
                $btnOK.text("确定");
            else
                $btnOK.text("确定("+selectedCount+")");
        }
        else {
            this.setOkButtonEnable(dialogId, false,callBack);
        }
    };

    /**
     * 该行群成员是不是"我"自已。
     *
     * @param currentRow_userUid 该行数据对应的用户uid
     * @return {boolean} true表示是，否则不是
     */
    RBChatGroupMemberDialog.prototype.isMyself = function(currentRow_userUid){
        var s = false;
        // 本地用户信息
        var localUserInfo = LocalUserInfo.getObj();

        // 如果当前显示行就是自已
        if (localUserInfo
            && currentRow_userUid
            && currentRow_userUid == localUserInfo.user_uid)
        {
            s = true;
        }

        return s;
    };

    /**
     * 判断当前界面模式是不是删除群员且当前行正是群主自已（本方法的作用是用于删除
     * 群成员的界面时，不要让群主把自已给删除罗！）.
     *
     * @param currentRow_userUid 该行数据对应的用户uid
     * @return {boolean} true表示当前行正是群主自已且当前界面模式为删除群成员，否则不是
     */
    RBChatGroupMemberDialog.prototype.isGroupOwnerCanNotDeleteHimself = function( currentRow_userUid) {
        var s = false;

        // 此判断表示是否是处于删除群成员的界面模式下
        if(this.usedForForInit == GroupMemberDialogUsed.USED_FOR_VIEW_OR_MANAGER_MEMBERS && this.isGroupOwnerForInit) {
            // 且当前显示行就是群主自已，就不需要显示选择框了（难道他自已还有删除自已啊？！）
            if(this.isMyself(currentRow_userUid))
                return true;
        }

        return s;
    };

    /**
     * 构造一个GroupMemberEntity对象。
     *
     * @param ree RosterElementEntity对象
     * @return {*} 返回GroupMemberEntity对象
     */
    RBChatGroupMemberDialog.prototype.constructFromRosterElement = function(ree) {
        if(ree) {
            // GroupMemberEntity 对象
            var m = {
                'g_id' : this.gidForInit,
                'user_uid': ree.user_uid,
                'nickname': ree.nickname,
                'selected': false,
                'userAvatarFileName': ree.userAvatarFileName
            };

            return m;
        }
        return null;
    };

    /**
     * 提交转让群主请求到服务端，以及转让成功后的UI界面显示等完整处理逻辑。
     *
     * @param dialogId
     */
    RBChatGroupMemberDialog.prototype.submitTransferGroupAsyncTask = function(dialogId,callback=null){

        var that = this;

        // 本地用户信息
        var localUserUid = LocalUserInfo.getUid();
        if(localUserUid) {

            // 新群主信息
            var transferTo = this.getSingleSelectedUser();
            if (transferTo) {

                var transgerNickname = GroupsProvider.getMickNameInGroup(transferTo.nickname, transferTo.nickname_ingroup);

                // 调用HTTP REST接口：“【接口1016-24-25】转让本群”，具体参数和返回值，详见接口文档或服务端代码。
                RBChatRestHelper.submitTransferGroupToServer(localUserUid, transferTo.user_uid, transgerNickname, this.gidForInit
                    // 成功后的回调
                    , function (returnValue) {
                        if (returnValue) {
                            // 转让成功
                            if ('1' == returnValue) {

                                // 先关闭成员选择对话框
                                RBChatDialogHelper.closeDialog(dialogId);
                                // 显示一个toast提示
                                // RBChatToastHelper.showToast_OK('转让成功！', null);

                                var ge = GroupsProvider.getGroupInfoByGid(that.gidForInit);
                                if(ge) {
                                    // 更新新群主uid
                                    ge.g_owner_user_uid = transferTo.user_uid;
                                    // 更新新群主昵称
                                    ge.g_owner_name = transgerNickname;

                                    // 先：更新本地缓存中的群组基本信息数据
                                    GroupsProvider.updateGroup(ge);
                                    // 再：刷新新群组基本信息的UI显示
                                    RBChatRightDetailUI.refreshGroupBaseInfo(that.gidForInit, null);
                                    // 同时：取消群组列表中的“群主”标识显示
                                    RBChatGroupsUI.updateGroupOwnerFlagShow(that.gidForInit, false);
                                    // 最后：往聊天界面中显示一条被"我"(我就是群主自已了，不然哪有转让权限)转让群主权限
                                    //成功的系统通知给"自已"看（此通知并非服务器发出，而是本地准备好的，仅用UI显示）
                                    GChatDataHelper.addSystenInfo_transferSucessForLocalUser(ge.g_owner_name, that.gidForInit, ge.g_name)
                                }
                            }
                            else if ('2' == returnValue) {
                                RBChatDialogHelper.showAlertDialog_WARN('转让失败', '您已不是群主，本次转让失败！');
                            }
                            else if ('3' == returnValue) {
                                RBChatDialogHelper.showAlertDialog_WARN('转让失败', transgerNickname + '不在群内，本次转让失败！');
                            }
                        }
                        else {
                            RBChatUtils.logToConsole_WARN('[submitTransferGroupAsyncTask] 转让群主请求完成，但服务端返回值是空！(' + returnValue + ')');
                        }
                    }
                    // 失败后的回调
                    , function (errorThrownStr) {
                        RBChatDialogHelper.showAlertDialog_WARN('转让失败', '转让群主失败了，可能是网络故障，请稍后再试！');
                    }
                );
            }
            else{
                RBChatDialogHelper.showAlertDialog_WARN('转让失败', '没有选中转让的对象！');
            }
        }
    };

    /**
     * 提交邀请群成员请求到服务端，以及邀请成功后的UI界面显示等完整处理逻辑。
     *
     * @param dialogId
     */
    RBChatGroupMemberDialog.prototype.submitInviteToGroupAsyncTask = function(dialogId){

        var that = this;

        // 本地用户信息
        var localUser = LocalUserInfo.getObj();
        if(localUser){

            // 要邀请的群员列表（2维数组）
            var willBeInvite = this.getSelectedItemsSimple();
            if(willBeInvite != null && willBeInvite.length > 0 ) {

                // 调用HTTP REST接口：“【接口1016-24-24】邀请入群”，具体参数和返回值，详见接口文档或服务端代码。
                RBChatRestHelper.submitInviteToGroupToServer(localUser.user_uid, localUser.nickname, this.gidForInit, willBeInvite
                    // 成功后的回调
                    , function (returnValue) {
                        if (returnValue) {
                            // 邀请成功
                            if ('1' == returnValue) {

                                // 群组信息（GroupEntity对象）
                                var ge = GroupsProvider.getGroupInfoByGid(that.gidForInit);
                                if(ge) {
                                    var membersBeInvite = that.getSelectedItems();

                                    // 先关闭成员选择对话框
                                    RBChatDialogHelper.closeDialog(dialogId);
                                    // 显示一个toast提示
                                    // RBChatToastHelper.showToast_OK('邀请成功！', null);

                                    //// 先：邀请群成员后更新群信息UI里的群成员数
                                    //RBChatRightDetailUI.updateGroupMembersCountShow(that.gidForInit, membersBeInvite.length);
                                    // 先：更新本地缓存数据中的当前群成员总数
                                    GroupsProvider.updateGroupMemberCount(that.gidForInit, membersBeInvite.length);
                                    // 再：刷新新群组基本信息的UI显示
                                    RBChatRightDetailUI.refreshGroupBaseInfo(that.gidForInit, null);
                                    // 最后：往聊天界面中显示一条被"我"邀请入群成功的系统通知给"自已"看（此通知并非服务器发出，而是本地准备好的，仅用UI显示）
                                    // GChatDataHelper.addSystenInfo_inviteMembersSucessForLocalUser(membersBeInvite, that.gidForInit, ge.g_name);

                                    // 因群员数量的变更，即时更新群头像的显示哦
                                    that.forceRefreshGroupAvatarShow(that.gidForInit);
                                }
                            }
                            // 邀请失败
                            else{
                                RBChatDialogHelper.showAlertDialog_WARN('邀请失败', '邀请群员失败，请稍后再试！');
                            }
                        }
                        else {
                            RBChatUtils.logToConsole_WARN('[submitInviteToGroupAsyncTask] 邀请群员请求完成，但服务端返回值是空！('+returnValue+')');
                        }
                    }
                    // 失败后的回调
                    , function (errorThrownStr){
                        RBChatDialogHelper.showAlertDialog_WARN('邀请失败', '邀请好友入群失败了，可能是网络故障，请稍后再试！');
                    }
                );
            }
            else{
                RBChatDialogHelper.showAlertDialog_WARN('邀请失败', '没有需要邀请的对象！');
            }
        }
    };

    /**
     * 一键拉群
     *
     * @param dialogId
     */
    RBChatGroupMemberDialog.prototype.submitInviteToGroupAsyncTask2 = function(dialogId){

        var that = this;

        // 本地用户信息
        var localUser = LocalUserInfo.getObj();
        if(localUser){

            // 要邀请的群员列表（2维数组）
            var willBeInvite = this.getSelectedItemsSimple();
            if(willBeInvite != null && willBeInvite.length > 0 ) {
                let cbNums = 0
                let requestNums = willBeInvite.length
                let errGroup = []
                willBeInvite.forEach(item => {
                    let newItems = [item[1], item[0], item[2]]
                    // this.gidForInit = a2;
                    // /** 调用者传进来的参数：打开本界面的是否是本群群主 */
                    // this.isGroupOwnerForInit = a3;
                    // {"invite_uid":"424387","invite_nickname":"戏如人生","invite_to_gid":"0000001256","members":"[\"0000001256\",\"424559\",\"测试群\"]"}
                    // {"invite_uid":"434844","invite_nickname":"转身离开","invite_to_gid":"0000007586","members":"[[\"0000007586\",\"490872\",\"小小小韩\"]]"}
                    // 调用HTTP REST接口：“【接口1016-24-24】邀请入群”，具体参数和返回值，详见接口文档或服务端代码。
                    RBChatRestHelper.submitInviteToGroupToServer(localUser.user_uid, localUser.nickname, newItems[0], [newItems]
                        // 成功后的回调
                        , function (returnValue) {
                            debugger
                            cbNums++
                            if (returnValue) {
                                // 邀请成功
                                if ('1' == returnValue) {
                                    // 群组信息（GroupEntity对象）
                                    var ge = GroupsProvider.getGroupInfoByGid(newItems[0]);
                                    if(ge) {
                                        var membersBeInvite = that.getSelectedItems();

                                        if (cbNums >= requestNums) {
                                            if (window.RBChatMainUI.getCurrentSelectedAlarmDataId() == newItems[1]) {
                                                RBChatRightDetailUI.didSelectSingleUserBaseInfoTab(newItems[1])
                                            }
                                            // 先关闭成员选择对话框
                                            RBChatDialogHelper.closeDialog(dialogId);
                                            // 显示一个toast提示
                                            // RBChatToastHelper.showToast_OK('邀请成功！', null);
                                        }

                                        //// 先：邀请群成员后更新群信息UI里的群成员数
                                        //RBChatRightDetailUI.updateGroupMembersCountShow(that.gidForInit, membersBeInvite.length);
                                        // 先：更新本地缓存数据中的当前群成员总数
                                        GroupsProvider.updateGroupMemberCount(newItems[0], membersBeInvite.length);
                                        // 再：刷新新群组基本信息的UI显示
                                        // RBChatRightDetailUI.refreshGroupBaseInfo(newItems[0], null);
                                        // 最后：往聊天界面中显示一条被"我"邀请入群成功的系统通知给"自已"看（此通知并非服务器发出，而是本地准备好的，仅用UI显示）
                                        // GChatDataHelper.addSystenInfo_inviteMembersSucessForLocalUser(membersBeInvite, that.gidForInit, ge.g_name);

                                        // 因群员数量的变更，即时更新群头像的显示哦
                                        // that.forceRefreshGroupAvatarShow(newItems[0]);
                                    }
                                }
                                // 邀请失败
                                else{
                                    errGroup.push(item[2])
                                    if (cbNums >= requestNums) {
                                        RBChatToastHelper.showToast_WARN(`${errGroup.join(',')}邀请失败，请稍后尝试!`, null, 'toast');
                                        RBChatDialogHelper.showAlertDialog_WARN('邀请失败', '邀请群员失败，请稍后再试！');
                                    }
                                }
                            }
                            else {
                                errGroup.push(item[2])
                                if (cbNums >= requestNums) {
                                    RBChatToastHelper.showToast_WARN(`${errGroup.join(',')}邀请失败，请稍后尝试!`, null, 'toast');
                                    RBChatUtils.logToConsole_WARN('[submitInviteToGroupAsyncTask] 邀请群员请求完成，但服务端返回值是空！('+returnValue+')');
                                }
                            }
                        }
                        // 失败后的回调
                        , function (errorThrownStr){
                            cbNums++
                            errGroup.push(item[2])
                            if (cbNums >= requestNums) {
                                RBChatToastHelper.showToast_WARN(`${errGroup.join(',')}邀请失败，请稍后尝试!`, null, 'toast');
                                RBChatDialogHelper.showAlertDialog_WARN('邀请失败', '邀请好友入群失败了，可能是网络故障，请稍后再试！');
                            }
                        }
                    );
                })
            }
            else{
                RBChatDialogHelper.showAlertDialog_WARN('邀请失败', '没有需要邀请的对象！');
            }
        }
    };

    /**
     * 提交删除群成员请求到服务端，以及删除成功后的UI界面显示等完整处理逻辑。
     *
     * @param dialogId
     */
    RBChatGroupMemberDialog.prototype.submitDeleteGroupMemberAsyncTask = function(dialogId ,callBack = null){

        var that = this;

        // 本地用户信息
        var localUser = LocalUserInfo.getObj();
        if(localUser){

            // 要删除的群员列表（2维数组）
            var willBeDelete = this.getSelectedItemsSimple();
            if(willBeDelete != null && willBeDelete.length > 0 ) {

                // 调用HTTP REST接口：“【接口1016-24-23】删除群成员或退群”，具体参数和返回值，详见接口文档或服务端代码。
                RBChatRestHelper.submitDeleteOrQuitGroupToServer(localUser.user_uid, localUser.nickname, this.gidForInit, willBeDelete
                    // 成功后的回调
                    , function (returnValue) {
                        if (returnValue) {
                            // 删除成功
                            if('1' == returnValue){

                                // 群组信息（GroupEntity对象）
                                var ge = GroupsProvider.getGroupInfoByGid(that.gidForInit);
                                if(ge) {
                                    var membersBeDelete = that.getSelectedItems();

                                    // 先关闭成员选择对话框
                                    RBChatDialogHelper.closeDialog(dialogId);
                                    // 显示一个toast提示
                                    // RBChatToastHelper.showToast_OK('删除成功！', null);

                                    //// 先：删除群成员后更新群信息UI里的群成员数
                                    //RBChatRightDetailUI.updateGroupMembersCountShow(that.gidForInit, -membersBeDelete.length);
                                    // 先：更新本地缓存数据中的当前群成员总数
                                    GroupsProvider.updateGroupMemberCount(that.gidForInit, -membersBeDelete.length);
                                    // 再：刷新新群组基本信息的UI显示
                                    RBChatRightDetailUI.refreshGroupBaseInfo(that.gidForInit, null);
                                    // 最后：往聊天界面中显示一条被"我"(我就是群主自已了，不然哪有移除权限)删除群员成功
                                    // 的系统通知给"自已"看（此通知并非服务器发出，而是本地准备好的，仅用UI显示）
                                    GChatDataHelper.addSystenInfo_removeMembersSucessForLocalUser(membersBeDelete, that.gidForInit, ge.g_name);

                                    // 因群员数量的变更，即时更新群头像的显示哦
                                    that.forceRefreshGroupAvatarShow(that.gidForInit);
                                }
                                if(callBack){
                                    callBack()
                                }
                            }
                            // 删除失败
                            else{
                                RBChatDialogHelper.showAlertDialog_WARN('删除失败', '删除群员失败，请稍后再试！');
                            }
                        }
                        else {
                            RBChatUtils.logToConsole_WARN('[submitDeleteGroupMemberAsyncTask] 删除员请求完成，但服务端返回值是空！('+returnValue+')');
                        }
                    }
                    // 失败后的回调
                    , function (errorThrownStr){
                        RBChatDialogHelper.showAlertDialog_WARN('删除失败', '删除群员失败了，可能是网络故障，请稍后再试！');
                    }
                );
            }
            else{
                RBChatDialogHelper.showAlertDialog_WARN('删除失败', '没有需要删除的群成员！');
            }
        }
    };

    RBChatGroupMemberDialog.prototype.search_click=function(){
        var that = this;
        $('#search_txt').on('input propertychange', function (e){
            const inputVal = $(this).val();
            if(!inputVal || inputVal.length == 0){
                $('#im-group-member-list-content li').css('display','')
            }else{
                $('#im-group-member-list-content li').each(function(i,item){
                    const nickname = $(item).attr('nickname')
                    const srcuid = $(item).attr('srcuid');
                    if(srcuid){ 
                        if(nickname && nickname.indexOf(inputVal) >-1 || srcuid && srcuid.indexOf(inputVal) >-1){
                            $(item).css('display','')
                        }else{
                            $(item).css('display','none')
                        }
                    }
                   
                });
            }
        });
            
      
    }


    // 刷新ui
    RBChatGroupMemberDialog.prototype.reflashMemberUi = function(){
        var m_parms = JSON.stringify({gid:this.gidForInit, loginName:''})
        var that = this;
        RBChatRestHelper.submitGetGroupMembersListFromServer(m_parms 
            // 成功后的回调
            , function (returnValue) {
                if (returnValue) {
                    // 服务端返回的是ArrayList<GroupMemberEntity>对象数组
                    var groupMemberEntitys = JSON.parse(returnValue);
                  
                    that.drawFriendsUI(groupMemberEntitys);
                }
                else{
                    RBChatUtils.logToConsole_WARN('群成员列表数据获取完成，但returnValue为空！');
                }
            }
            // 失败后的回调
            , function (errorThrownStr){
                RBChatDialogHelper.showAlertDialog_WARN('加载失败', '群成员列表数据获取失败了，可能是网络故障，请稍后再试！');
            }
        );
    }

       /**
     *  
     *  @ 群员
     * @param dialogId
     */
     RBChatGroupMemberDialog.prototype.toTip = function(dialogId,manage_mark){

            // 本地用户信息
            var localUser = LocalUserInfo.getObj();
            if(localUser){
                // 要删除的群员列表（2维数组）
                var willBeDelete = this.getSelectedItemsSimple();
                if(willBeDelete != null && willBeDelete.length > 0 ) {
                    var user_ids = ''
                    for(var i = 0; i < willBeDelete.length;i++){
                        var item = willBeDelete[i]
                        if(user_ids.length > 0){
                            user_ids = user_ids + ' @'+item[2]
                        }else{
                            user_ids = ''+item[2]
                        }
                    }
                    // 设置需要提醒的人
                    window.groupSelectTipsUser = willBeDelete;
                    const t = RBChatSmallWindowUI.getWindowDom('.im-panel-inputcontent').val();
                    RBChatSmallWindowUI.getWindowDom('.im-panel-inputcontent').val(t+user_ids)
                   
                    RBChatDialogHelper.closeDialog(dialogId);
                }
                else{
                    RBChatDialogHelper.showAlertDialog_WARN('提示', '没有选择需要提醒的群成员！');
                }
            }
        };


    /**
     *  设置/取消禁言
     *
     * @param dialogId
     */
    RBChatGroupMemberDialog.prototype.submitSetForBidAsyncTask = function(dialogId,forbid,callBack=null){
        var that = this;
        // 本地用户信息
        var localUser = LocalUserInfo.getObj();
        if(localUser){
            // 要删除的群员列表（2维数组）
            var willBeDelete = this.getSelectedItemsSimple();
            if(willBeDelete != null && willBeDelete.length > 0 ) {
                var user_ids = ''
                for(var i = 0; i < willBeDelete.length;i++){
                    var item = willBeDelete[i]
                    if(user_ids.length > 0){
                        user_ids = user_ids + ','+item[1]
                    }else{
                        user_ids = item[1]
                    }
                }
                RBChatRestHelper.set_forbid_status(user_ids
                    ,forbid, window.groupInfo.g_id,function(res){
                        if(callBack){
                            callBack();
                        }else{
                            that.reflashMemberUi(dialogId)
                        }
                       
                },null)
            }
            else{
                RBChatDialogHelper.showAlertDialog_WARN('提示', '没有需要设置的群成员！');
            }
        }
    }

      /**
     *  设置/取消群管理
     *
     * @param dialogId
     */
    RBChatGroupMemberDialog.prototype.submitSetManageAsyncTask = function(dialogId,manage_mark,callBack=null){

        var that = this;

        // 本地用户信息
        var localUser = LocalUserInfo.getObj();
        if(localUser){
            // 要删除的群员列表（2维数组）
            var willBeDelete = this.getSelectedItemsSimple();
            if(willBeDelete != null && willBeDelete.length > 0 ) {
                var user_ids = ''
                for(var i = 0; i < willBeDelete.length;i++){
                    var item = willBeDelete[i]
                    if(user_ids.length > 0){
                        user_ids = user_ids + ','+item[1]
                    }else{
                        user_ids = item[1]
                    }
                }
                // 调用HTTP REST接口：“【接口1016-24-23】删除群成员或退群”，具体参数和返回值，详见接口文档或服务端代码。
                RBChatRestHelper.submitSetManageToServer(this.gidForInit,user_ids, manage_mark
                    // 成功后的回调
                    , function (returnValue) {
                        if (returnValue - 0 == 0) {
                            if (callBack){
                                callBack()
                            }else{
                                that.reflashMemberUi(dialogId)
                            }
                        }
                        else {
                            RBChatDialogHelper.showAlertDialog_WARN('提示', '设置失败,请重试');
                        }
                    }
                    // 失败后的回调
                    , function (errorThrownStr){
                        RBChatDialogHelper.showAlertDialog_WARN('提示', '设置失败,请重试');
                    }
                );
            }
            else{
                RBChatDialogHelper.showAlertDialog_WARN('提示', '没有需要设置的群成员！');
            }
        }
    };

    /**
     * 提交创建群请求到服务端，以及建群成功后的UI界面显示等完整处理逻辑。
     *
     * @param dialogId
     */
    RBChatGroupMemberDialog.prototype.submitCreateGroupAsyncTask = function(dialogId){

        var that = this;

        // 本地用户信息
        var localUser = LocalUserInfo.getObj();
        if(localUser){

            // 要创建群的群组成员（一组GroupMemberEntity数组）
            var members = this.getSelectedItems();

            // 创建群时，群成员要加上"我自已"啊
            if(members.length > 0 && localUser) {
                // "我自已"
                var myself ={
                    'user_uid': localUser.user_uid,
                    'nickname': localUser.nickname,
                    //'userAvatarFileName' : localUser.userAvatarFileName
                };

                // 加入到群成员数据列表中（放到数组尾）
                members.unshift(myself);
            }

            // 调用HTTP REST接口：“【接口1016-24-7】创建群组”，具体参数和返回值，详见接口文档或服务端代码。
            RBChatRestHelper.submitCreateGroupToServer(localUser.user_uid, localUser.nickname, members
                // 成功后的回调
                , function (returnValue) {
                    if (returnValue) {

                        // 返回值“0”表示服务端虽成功处理完成接口请求，但建群是失败的！(详见"【接口1016-24-7】"文档)
                        if("0" == returnValue){
                            RBChatDialogHelper.showAlertDialog_WARN('失败提示', '建群失败，请稍后再试！');
                            return;
                        }
                        // 建群成功
                        else{
                            // 建成功时，服务端返回的是封装了新群基本信息的GroupEntity对象，
                            // GroupEntity对象详见：http://docs.52im.net/extend/docs/api/rainbowchatserver4_pro/com/x52im/rainbowchat/http/logic/dto/GroupEntity.html
                            var newGroup = JSON.parse(returnValue);

                            if(newGroup){
                                // 先关闭成员选择对话框
                                RBChatDialogHelper.closeDialog(dialogId);
                                // 显示一个toast提示
                                // RBChatToastHelper.showToast_OK('建群成功了！', null);

                                // 新群组基本信息对象放入本地群组列表缓存中
                                GroupsProvider.putGroup(0, newGroup);
                                // 在群组列表中的UI中显示出该新建的群组item
                                RBChatGroupsUI.add(newGroup, true);
                                // 往聊天界面中显示一条被"我"邀请入群成功的系统通知给"自已"看（此通知并非服务器发出，而是本地准备好的，仅用UI显示）
                                GChatDataHelper.addSystenInfo_inviteMembersSucessForLocalUser(members, newGroup.g_id, newGroup.g_name);
                                // 进入刚建好的这个群组聊天界面
                                RBChatAlarmsUI.selectedItem(AlarmMessageType.groupChatMessage, newGroup.g_id);
                            }
                            else{
                                RBChatUtils.logToConsole_WARN('[submitCreateGroupAsyncTask] 建群请求完成，但 newGroup 是空！('+newGroup+')');
                            }
                        }
                    }
                    else {
                        RBChatUtils.logToConsole_WARN('[submitCreateGroupAsyncTask] 建群请求完成，但服务端返回值是空！('+returnValue+')');
                    }
                }
                // 失败后的回调
                , function (errorThrownStr){
                    RBChatDialogHelper.showAlertDialog_WARN('创建失败', '创建群组失败了，可能是网络故障，请稍后再试！');
                }
            );
        }
        else{
            RBChatUtils.logToConsole_WARN('[submitCreateGroupAsyncTask] 本地用户信息数据是空！('+localUser+')');
        }
    };

    /**
     * 强制刷新群组头像在各处的显示（此种情况主要用于：群成员变动等情况时，群头像可能已经在服务端重新生成，刷新的目的是为了及时同步显示之）。
     *
     * @param gid
     */
    RBChatGroupMemberDialog.prototype.forceRefreshGroupAvatarShow = function(gid){
        RBChatAlarmsUI.updateGroupAvatarShow(gid);
        RBChatGroupsUI.updateGroupAvatarShow(gid);
        RBChatRightDetailUI.refreshGroupAvatarShow(gid);
    };


    // 注意：此处的参数是传递给 RBChatGroupMemberDialog 的构造函数的哦
    return new RBChatGroupMemberDialog(usedFor, gid, isGroupOwner, isManager);
};