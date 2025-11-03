
'use strict';

/**
 * 缓存管理类。
 *
 * 使用面向对向的方式调用实现方法，是为了规范代码的引用和调用，否则浏览器端引用的JS一多，
 * 各种交叉调用会让代码看起来异常混乱。
 *
 * @author Jack Jiang(http://www.52im.net/space-uid-1.html)
 * @version 1.0
 */


/**
 * 当前登陆用户的个人信息全局对象。
 * 本对象在用户登陆成功后被设置，后绪的个人信息显示、更新等统一使用本对象来完成即可。
 *
 * 详见：http://docs.52im.net/extend/docs/api/rainbowchatserver4_pro/com/x52im/rainbowchat/http/logic/dto/RosterElementEntity.html
 */
var LocalUserInfo = (function () {

    // 构造器（相当于java里的构造方法）
    var Cache1 = function (argument){
        //
    };

    /**
     * 初始化。
     * 在使用本 LocalUserInfo 对象前，请务必确保执行可一次本函数。
     */
    Cache1.prototype.initFromCookie = function(){
        this.localUserInfo = RBChatUtils.getAuthedLocalUserInfoFromCookie();;
    };

    /**
     * 获取本地用户地uid。
     *
     * @returns {如果成功取出}
     * @see getObj_AlertIfNotExist()
     */
    Cache1.prototype.getUid = function(){
        return this.getObj_AlertIfNotExist().user_uid;
    };

    /**
     * 获取本地用户的个人信息（这个信息是在登陆时获取到的）。
     *
     * @returns {如果成功取出}
     */
    // 如不使用prototype则相当于静态方法，否则如果使用prototype则相当于实例方法，需要new了才能使用哦！
    Cache1.prototype.getObj = function(){
        //return RBChatUtils.getAuthedLocalUserInfoFromCookie();
        return this.localUserInfo;
    };

    /**
     * 获取本地用户的个人信息（这个信息是在登陆时获取到的），本方法将在读取到本地用户信息为空时给一个alert提示给用户。
     *
     * @returns {如果成功取出}
     * @see getObj()
     */
        // 如不使用prototype则相当于静态方法，否则如果使用prototype则相当于实例方法，需要new了才能使用哦！
    Cache1.prototype.getObj_AlertIfNotExist = function(){
        //var localUserInfo = this.getObj();
        if(this.localUserInfo) {
            return this.localUserInfo;
        }
        else{
            alert('本地用户数据不存在，请重新登陆后再使用！');
            return null;
        }
    };

    /**
     * 保存最新的本地用户个人信息。
     *
     * @param localUserInfoObj
     */
        // 如不使用prototype则相当于静态方法，否则如果使用prototype则相当于实例方法，需要new了才能使用哦！
    Cache1.prototype.update = function(localUserInfoObj){
        if(!localUserInfoObj){
            console.info('【LocalUserInfo.save()】要save的localUserInfo是空的？localUserInfo='+localUserInfoObj);
        }

        // 将新的用户信息对象更新到缓存中
        var oldLoginUserToken = this.token;
        var newLoginUserToken = localUserInfoObj.token;
        this.localUserInfo = localUserInfoObj;
        if(!newLoginUserToken)
            this.localUserInfo.token = oldLoginUserToken;

        // 同时存一份到cookie中
        RBChatUtils.saveAuthedLocalUserInfoToCookie(localUserInfoObj)
    };

    /**
     * 从Cookie中清除上次登陆获取到的个人信息（切换账号或重新登陆的情况下，请调用本函数）。
     */
    Cache1.prototype.clear = function(){
        this.localUserInfo = null;
        // save空内容，即表示从本地cookie中删除本地用户的个人信息数据
        RBChatUtils.saveAuthedLocalUserInfoToCookie(null);
    };

    /**
     * 从服务端加载最新的本地用户信息（并保存到本地缓存、cookie中）。
     *
     * @param fn_callback_ok 本地用户信息加载成功后将调用本回调，本参数为空时将不调用
     */
    Cache1.prototype.reloadFromServer = function(fn_callback_ok){

        var that = this;

        // 调用HTTP REST接口：“【接口1008-3-8】获取用户/好友的个人信息”，接口返回值详细情况，详见接口文档或服务端代码。
        // 开始从服务端查询指定uid的用户基本信息，同时尝试在ui上显示之
        RBChatRestHelper.submitGetUserInfoToServer(false, null, this.getUid() // 注意此id为本地用户的uid
            // 数据读取成功后的回调
            , function (returnValue) {
                // 服务端返回的是java对象RosterElementEntity的JSON文本
                var ree = JSON.parse(returnValue);
                window.isLiXian = ree.offlineState - 0 == 2; //设置离线状态

                if(ree){
                    that.update(ree);

                    if(fn_callback_ok)
                        fn_callback_ok();
                }
                else {
                    RBChatUtils.logToConsole_WARN('[前端-GET-【接口1008-3-8】[reloadFromServer]本地用户个人信息获取接口返回值解析后] 数据为空，' +
                        '无需进入ui处理代码。(returnValue=' + returnValue + ')', true);
                }
            }
            // 数据读取失败后的回调
            , function (errorThrownStr){
                RBChatUtils.logToConsole_ERROR('[前端-GET-【接口1008-3-8】[reloadFromServer]本地用户的基本信息数据读取出错，可能是网络故障，请稍后再试！');
            }
            , false
            , "加载最新本地用户信息接口"
        );
    };

    //window.LocalUserInfo = cache;
    //return Cache;    // 此种适合非构造器的方式（即各function都是非prototype的方式定义），参考资料：https://www.cnblogs.com/mq0036/p/3934867.html
    return new Cache1();// 此种方式用于构造器的方式
})();


/**
 * 好友列表数据提供者（即好友列表全局数据模型）.
 */
var RosterProvider = (function () {

    // 构造器（相当于java里的构造方法）
    var Cache2 = function (argument){

        // 好友列表数据模型，数据为一维RosterElementEntity对象数组
        this.rosterData = new Array();
    };

    /**
     * 刷新好友列表(异步方式从服务端加载最新好友列表数据并缓存起来).
     *
     * @param fn_callback_for_success 回调函数，当本参数不为空时，数据加载成后后会通知此回函数，此回调函数里可以实现UI的刷新逻辑等
     */
    Cache2.prototype.refreshRosterAsync = function (fn_callback_for_success) {
        return new Promise((resolve) => {
            var localUserUid = LocalUserInfo.getObj().user_uid;

            var that = this;

            // 通过rest接口获取好友列表数据
            RBChatRestHelper.submitGetRosterToServer(localUserUid
                , function (returnValue){

                    // 根据接口定义，返回不为空即表示认证成功
                    if(!RBChatUtils.isStringEmpty(returnValue))
                    {
                        // 服务端返回的是一维RosterElementEntity对象数组
                        var rosterList = JSON.parse(returnValue)

                        if(rosterList){
                            RBChatUtils.logToConsole('【refreshRosterAsync】服务端返回的好友数据行数：'+rosterList.length);

                            // 用最新的好友表数据刷新好友列表
                            that.putFriends(rosterList);
                        }
                        else{
                            RBChatUtils.logToConsole('【refreshRosterAsync】服务端返回的好友数据为空，本次拉取已结束。');
                        }

                        resolve()
                        // 回调通知
                        if(fn_callback_for_success)
                            fn_callback_for_success();
                    }
                }
                , function (errorThrownStr){
                    resolve()
                    //alert('好友列表数据读取出错，原因是：'+errorThrownStr);
                    RBChatDialogHelper.showAlertDialog_WARN('加载失败', '好友列表数据加载出错，可能是网络故障，请稍后再试！');
                }
            );
        })
    };

    /**
     * 加入一个新的好友信息对象.
     *
     * @param index
     * @param reeObj RosterElementEntity对象（详见：http://docs.52im.net/extend/docs/api/rainbowchatserver4_pro
     *                          /com/x52im/rainbowchat/http/logic/dto/RosterElementEntity.html）
     */
    Cache2.prototype.putFriend = function(index, reeObj) {
        // 如果该好友已经存在于好友列表中（此种情况可能是服务端处理出错了
        // ，重复把好友信息发过来了，理论上此种边界问题不太可能存在），则
        // 发过来的对象覆盖上去（怎么说也算是最新数据了）
        if(this.isUserInRoster(reeObj.user_uid)) {
            // 用splice实现替换
            this.rosterData.splice(this.getIndex(reeObj.user_uid), 1, reeObj);
            return;
        }

        // 否则就是直接add到指定引位置（注意：splice函数的用法哦）
        this.rosterData.splice(index, 0, reeObj);
    };

    /**
     * @see #putFriend(int, RosterElementEntity)
     *
     * @param reeObj RosterElementEntity对象（详见：http://docs.52im.net/extend/docs/api/rainbowchatserver4_pro
     *                          /com/x52im/rainbowchat/http/logic/dto/RosterElementEntity.html）
     */
    Cache2.prototype.putFriendWithRee = function(reeObj)
    {
        // 默认将新好友加到列表头部
        this.putFriend(0, reeObj);
    };

    /**
     * 用新的好友列表数据集合覆盖原有的数据。
     *
     * @param newDatas 一维RosterElementEntity对象数组
     */
    Cache2.prototype.putFriends = function(newDatas)
    {
        // 先清空原先的数组（注意splice的用法和参数的含义哦）
        this.rosterData.splice(0, this.rosterData.length);

        // 再逐个放入数组元素
        for(var i=0;i<newDatas.length;i++){
            var ree = newDatas[i];
            // 注意splice函数的用法（向i索引处放入元素）
            this.rosterData.splice(i, 0, ree);
        }
    };

    /**
     * 移除列表中指定单元的元素.
     *
     * @param index 要删除的数组引位置
     * @return true表示删除成功，否则表示失败或者不存在
     */
    Cache2.prototype.remove = function(index) {
        //return rosterData.remove(index, notifyObserver) != null;
        if(index >=0 && index < this.rosterData.length) {
            this.rosterData.splice(index, 1); // 删除index位置的1个元素
        }
        else{
            alert('不合法的index：'+index+', 清除好友缓存失败。');
        }
    };

    /**
     * 返回好友列表数据集合.
     * <p>
     * <b>注意：</b>如果好友列表为null则本方法将尝试先去服务端读取，然后再返回.
     *
     * @return 一维RosterElementEntity对象数组（RosterElementEntity对象详见：
     *          http://docs.52im.net/extend/docs/api/rainbowchatserver4_pro/com/
     *              x52im/rainbowchat/http/logic/dto/RosterElementEntity.html）
     */
    Cache2.prototype.getRosterData = function() {
        return this.rosterData;
    };

    /**
     * 根据好友在业务系统中定义的UID找到它在好友列表中暂存的详细信息.
     *
     * @param uid
     * @return 如果存在则返回指定好友的信息封装RosterElementEntity对象，否则返回null（
     *          如果存在则返回指定好友的信息封装RosterElementEntity对象详见：
     *          http://docs.52im.net/extend/docs/api/rainbowchatserver4_pro/com/
     *              x52im/rainbowchat/http/logic/dto/RosterElementEntity.html)
     */
    Cache2.prototype.getFriendInfoByUid = function(uid) {
        if(this.rosterData) {
            // console.log('发送欢迎提示语-好友列表', this.rosterData)
            for(var i=0;i<this.rosterData.length;i++) {
                // 数组元素便是RosterElementEntity对象
                var ree = this.rosterData[i];
                if(ree.user_uid == uid)
                    return ree;
            }
        }

        return null;
    };

    /**
     * 更新缓存中的好友备注等信息。
     *
     * @param uid {String} 好友的uid
     * @param newRemark
     * @param newMobileNum
     * @param newMoreDesc
     * @return {boolean} true表示更新成功，否则失败
     * @since 4.0
     */
    Cache2.prototype.updateFriendRemark = function(uid, newRemark, newMobileNum, newMoreDesc){

        var sucess = false;

        // 好友信息对象引用
        var friendInfoObj = this.getFriendInfoByUid(uid);
        if(friendInfoObj){
            friendInfoObj.friendRemark = newRemark;
            friendInfoObj.friendMobileNum = newMobileNum;
            friendInfoObj.friendMoreDesc = newMoreDesc;
        }

        return sucess;
    };

    /**
     * 指定uid用户是否在好友列表中.
     *
     * @param uid
     * @returns {boolean}
     */
    Cache2.prototype.isUserInRoster = function(uid) {
        if(this.rosterData) {
            for(var i=0;i<this.rosterData.length;i++) {
                // 数组元素便是RosterElementEntity对象
                var ree = this.rosterData[i];
                if(ree.user_uid == uid)
                    return true;
            }
        }
        return false;
    };

    /**
     * 返回指定用户所在好友列表中的索引位置.
     *
     * @param uid
     * @return {int} 索引值
     */
    Cache2.prototype.getIndex = function(uid){
        var index = -1;
        if(this.rosterData) {
            for(var i=0;i<this.rosterData.length;i++) {
                // 数组元素便是RosterElementEntity对象
                var ree = this.rosterData[i];
                if(ree.user_uid == uid) {
                    index = i;
                    break;
                }
            }
        }
        return index;
    };

    /**
     * 返回指定用户所在好友列中的索引位置.
     *
     * @param ree RosterElementEntity对象（详见：http://docs.52im.net/extend/docs/api/rainbowchatserver4_pro
     *                          /com/x52im/rainbowchat/http/logic/dto/RosterElementEntity.html）
     * @return
     */
    Cache2.prototype.getIndexByRee = function(ree) {
        return this.getIndex(ree.user_uid);
    };

    /**
     * 当前在线的好友数。
     *
     * @return {Number} 返回int整数
     */
    Cache2.prototype.onlineCount = function() {
        var count = 0;
        if(this.rosterData) {
            for(var i=0;i<this.rosterData.length;i++) {
                // RosterElementEntity对象
                var ree = this.rosterData[i];
                if(ree.liveStatus == 1)
                    count += 1;
            }
        }
        return count;
    };

    /**
     * 返回当前好友列表的好友总数。
     *
     * @returns {Number}
     */
    Cache2.prototype.size = function() {
        return this.rosterData.length;
    };

    /**
     * 设置所有好友离线.
     * <p>
     * 此方法的应用场景目前是在网络掉线（准确地说是与服务端断开连接）时，
     * 目的是模仿QQ在掉线时的体验，在本APP中好久是设置离线后，本地用户就不可以发出消息了，
     * 否则在目前UDP的聊天框架下，这样也可以作为告之本地用户掉线的一种间接方式，否则怎么好
     * 提示他本地掉线了呢？之前的Toast方式太难看了。
     */
    Cache2.prototype.offlineAll = function() {
        if(this.rosterData) {
            for(var i=0;i<this.rosterData.length;i++) {
                // RosterElementEntity对象
                var ree = this.rosterData[i];
                ree.liveStatus = 0;
            }
        }
    };


    //window.RosterProvider = cache;
    return new Cache2();// 此种方式用于构造器的方式
})();


/**
 * "我"的群组列表数据提供者（即我的群组列表全局数据模型）.
 *
 * @since 1.3
 */
var GroupsProvider = (function () {

    /**
     * BBS聊天（即世界频道）所对应的群组聊天id（因为世界频道是个特殊
     * 的群聊，属系统默认无需创建，所以给它一个默认的固定id，以便跟普
     * 通群聊区分开来）.
     *
     * 注：世界频道功能目前仅在APP版产品中存在，且未来可能将删除，web版产品中暂不打算实现之。
     */
    var DEFAULT_GROUP_ID_FOR_BBS = "-1";

    // 构造器（相当于java里的构造方法）
    var Cache2_2 = function(argument){

        // 群组列表数据模型，数据为一维RosterElementEntity对象数组
        this.groupsListData = new Array();
    };

    /**
     * 刷新群组列表(异步方式从服务端加载最新好友列表数据并缓存起来).
     *
     * @param fn_callback_for_success 回调函数，当本参数不为空时，数据加载成后后会通知此回函数，此回调函数里可以实现UI的刷新逻辑等
     */
    Cache2_2.prototype.refreshGroupsListAsync = function (fn_callback_for_success) {

        var localUserUid = LocalUserInfo.getObj().user_uid;

        var that = this;

        // 通过rest接口获取群组列表数据
        RBChatRestHelper.submitGetGroupsListFromServer(localUserUid
            , function (returnValue){

                // 根据接口定义，返回不为空即表示认证成功
                if(!RBChatUtils.isStringEmpty(returnValue))
                {
                    // 服务端返回的是一维GroupEntity对象数组
                    var groupsList = JSON.parse(returnValue)

                    if(groupsList){
                        RBChatUtils.logToConsole('【refreshGroupsListAsync】服务端返回的群组数据行数：'+groupsList.length);

                        // 用最新的好友表数据刷新好友列表
                        that.putGroups(groupsList);
                    }
                    else{
                        RBChatUtils.logToConsole('【refreshGroupsListAsync】服务端返回的群组数据为空，本次拉取已结束。');
                    }

                    // 回调通知
                    if(fn_callback_for_success)
                        fn_callback_for_success();
                }
            }
            , function (errorThrownStr){
                RBChatDialogHelper.showAlertDialog_WARN('加载失败', '群组列表数据加载出错，可能是网络故障，请稍后再试！');
            }
        );
    };

    /**
     * 更新指定群组的信息（如果老的群信息不存在则本方法什么也不做）。
     *
     * @param newGe GroupEntity对象（
     * 详见：http://docs.52im.net/extend/docs/api/rainbowchatserver4_pro/com/x52im/rainbowchat/http/logic/dto/GroupEntity.html）
     */
    Cache2_2.prototype.updateGroup = function(newGe) {
        if(newGe) {
            var oldGe = this.getGroupInfoByGid(newGe.g_id);
            if(oldGe != null){
                oldGe.g_id = newGe.g_id;
                oldGe.g_status = newGe.g_status;
                oldGe.g_name = newGe.g_name;
                oldGe.g_owner_user_uid = newGe.g_owner_user_uid;
                oldGe.g_notice = newGe.g_notice;
                oldGe.max_member_count = newGe.max_member_count;
                oldGe.g_member_count = newGe.g_member_count;
                oldGe.g_owner_name = newGe.g_owner_name;
                oldGe.nickname_ingroup = newGe.nickname_ingroup;

                oldGe.g_notice_updateuid = newGe.g_notice_updateuid;
                oldGe.g_notice_updatenick = newGe.g_notice_updatenick;
                oldGe.g_notice_updatetime  = newGe.g_notice_updatetime;

                // 把oldGe对象重新put进去（完成对象内容更新）
                var index = this.getIndex(oldGe.g_id);
                if(this.checkIndexValid(index)){
                    this.putGroup(index, oldGe);
                }
            }
        }
    };

    /**
     * 更新缓存中的群组成员数量。
     * 注意：因成员数不是普通的文本字段，本函数单独出来，就是为了能更好地处理这个数据的边界等合法性问题。
     *
     * @param deltaCount 变动的群成员总数，负数表示减成员、正数表示加了群员数（本参数为空表示不更新此字段）
     */
    Cache2_2.prototype.updateGroupMemberCount = function(gid, deltaCount){
        var oldGe = this.getGroupInfoByGid(gid);
        if (oldGe != null) {

            //if (newGroupName)
            //    oldGe.g_name = newGroupName;

            if (deltaCount) {
                // 该群删除成员前的总成员数
                var currentMemberCount = 1;
                var currentMemberCountStr = oldGe.g_member_count;
                if (currentMemberCountStr) {
                    currentMemberCount = parseInt(currentMemberCountStr);
                }
                if (currentMemberCount < 1)
                    currentMemberCount = 1;

                // 新的总数
                var newCount = currentMemberCount + parseInt(deltaCount);

                oldGe.g_member_count = newCount;
            }

            // 把oldGe对象重新put进去（完成对象内容更新）
            var index = this.getIndex(oldGe.g_id);
            if (this.checkIndexValid(index)) {
                this.putGroup(index, oldGe);
            }
        }
    };

    /**
     * 加入一个新的群组信息对象.
     *
     * @param index
     * @param geObj GroupEntity对象（
     * 详见：http://docs.52im.net/extend/docs/api/rainbowchatserver4_pro/com/x52im/rainbowchat/http/logic/dto/GroupEntity.html）
     */
    Cache2_2.prototype.putGroup = function(index, geObj) {
        // 如果该群基本信息已经存在于列表中那就用最新的覆盖
        if(this.isInGroupList(geObj.g_id)) {
            // 用splice实现替换
            this.groupsListData.splice(this.getIndex(geObj.g_id), 1, geObj);
            return;
        }

        // 否则就是直接add到指定引位置（注意：splice函数的用法哦）
        this.groupsListData.splice(index, 0, geObj);
    };

    /**
     * 用新的群组列表数据集合覆盖原有的数据。
     *
     * @param newDatas  一维GroupEntity对象数组
     */
    Cache2_2.prototype.putGroups = function(newDatas) {
        // 先清空原先的数组（注意splice的用法和参数的含义哦）
        this.groupsListData.splice(0, this.groupsListData.length);

        // 再逐个放入数组元素
        for(var i=0;i<newDatas.length;i++){
            var ree = newDatas[i];
            // 注意splice函数的用法（向i索引处放入元素）
            this.groupsListData.splice(i, 0, ree);
        }
    };

    /**
     * 移除列表中指定单元的元素.
     *
     * @param index 要删除的数组引位置
     * @return true表示删除成功，否则表示失败或者不存在
     */
    Cache2_2.prototype.remove = function(index) {
        //return rosterData.remove(index, notifyObserver) != null;
        if(index >=0 && index < this.groupsListData.length) {
            this.groupsListData.splice(index, 1); // 删除index位置的1个元素
        }
        else{
            alert('不合法的index：'+index+', 清除群组缓存失败。');
        }
    };

    /**
     * 移除列表中指定群id的元素.
     *
     * @param gid 群id
     */
    Cache2_2.prototype.removeByGid = function(gid) {
        var index = this.getIndex(gid);
        if(this.checkIndexValid(index))
            this.remove(index);
        else
            console.info('【WARN】removeByGid时，index无效！(index='+index+')');
    };

    /**
     * 指定gid群组是否在群组列表中.
     *
     * @param gid
     */
    Cache2_2.prototype.isInGroupList = function(gid) {
        if(this.groupsListData) {
            for(var i=0;i<this.groupsListData.length;i++) {
                // 数组元素便是GroupEntity对象
                var ree = this.groupsListData[i];
                if(ree.g_id == gid)
                    return true;
            }
        }
        return false;
    };

    /**
     * 根据gid找到群组列表数据模型中的群组基本信息数据。
     *
     * @param gid
     * @return 如果存在则返回指定群组的信息封装对象GroupEntity（
     * 详见：http://docs.52im.net/extend/docs/api/rainbowchatserver4_pro/com/x52im/rainbowchat/http/logic/dto/GroupEntity.html
     * ），否则返回null
     */
    Cache2_2.prototype.getGroupInfoByGid = function(gid) {
        if(this.groupsListData) {
            for(var i=0;i<this.groupsListData.length;i++) {
                // 数组元素便是GroupEntity对象
                var ree = this.groupsListData[i];
                if(ree.g_id == gid)
                    return ree;
            }
        }

        return null;
    };

    /**
     * 返回指定群组所在群组列表中的索引位置.
     *
     * @param gid
     * @return {int} 索引值
     */
    Cache2_2.prototype.getIndex = function(gid){
        var index = -1;
        if(this.groupsListData) {
            for(var i=0;i<this.groupsListData.length;i++) {
                // 数组元素便是RosterElementEntity对象
                var ree = this.groupsListData[i];
                if(ree.g_id == gid) {
                    index = i;
                    break;
                }
            }
        }
        return index;
    };

    /**
     * 检查索引值是否合法（有无超过数据合法索引）。
     *
     * @param index 数据所在数组的索引位置
     * @return {boolean} true表示此索引值没有越界，否则已越界或不合法
     */
    Cache2_2.prototype.checkIndexValid = function(index) {
        return (index >=0 && index <= (this.groupsListData.length - 1));
    };

    /**
     * 返回"我"群组列表数据集合.
     * <p>
     * <b>注意：</b>如果群组列表为null则本方法将尝试先去服务端读取，然后再返回.
     *
     * @return {Array} 一维GroupEntity对象数组（GroupEntity对象详见：
     *          http://docs.52im.net/extend/docs/api/rainbowchatserver4_pro/com/x52im/rainbowchat/http/logic/dto/GroupEntity.html）
     */
    Cache2_2.prototype.getGroupsListData = function() {
        return this.groupsListData;
    };

    /**
     * 返回当前群组列表的群总数。
     *
     * @returns {Number}
     */
    Cache2_2.prototype.size = function() {
        return this.groupsListData.length;
    };

    /**
     * 本地用户是否是指定群的群主。
     *
     * @param gid {String} 群id
     * @return {boolean} true表示是，否则不是
     */
    Cache2_2.prototype.isThisGroupOwner = function(gid) {
        var ge = this.getGroupInfoByGid(gid);
        if(ge){
            return this.isGroupOwner(ge.g_owner_user_uid);
        }
        return false;
    };

    /**
     * 本地用户是否群主。
     *
     * @param ownerUid 群主的uid
     * @return {true表示本地用户是群主，否则不是|boolean}
     */
    Cache2_2.prototype.isGroupOwner = function(ownerUid) {
        var localUserUid = LocalUserInfo.getUid();
        return localUserUid && (localUserUid == ownerUid);
    };

    /**
     * 返回"我"在群内的昵称(如果参数不为空，就直接返回，否则返回"我"的默认昵称作为群内昵称)。
     *
     * @param context
     * @param nickname_ingroup
     * @return
     */
    Cache2_2.prototype.getMyNickNameInGroup = function(nickname_ingroup) {
        if(!RBChatUtils.isStringEmpty(nickname_ingroup))
            return nickname_ingroup;
        else {
            // RosterElementEntity 对象
            var localUser = LocalUserInfo.getObj();;
            if(localUser)
                return localUser.nickname;

            return "";
        }
    };

    /**
     * 返回群内昵称（如果群内昵称为空，则返回默认昵称，否则返回群内昵称）。
     *
     * @param nickName
     * @param nickname_ingroup
     * @return
     */
    Cache2_2.prototype.getMickNameInGroup = function(nickName, nickname_ingroup)
    {
        if(!RBChatUtils.isStringEmpty(nickname_ingroup))
            return nickname_ingroup;
        else
            return nickName;
    };

    /**
     * 指定id是否是“世界频道”（或者说是bbs聊天）。
     *
     * 注：世界频道功能目前仅在APP版产品中存在，且未来可能将删除，web版产品中暂不打算实现之。
     *
     * @param gid 群id
     * @return {boolean} true表示是世界频道，否则不是
     */
    Cache2_2.prototype.isWorldChat=function(gid)
    {
        return DEFAULT_GROUP_ID_FOR_BBS == gid;
    };



    //window.RosterProvider = cache;
    return new Cache2_2();// 此种方式用于构造器的方式
})();


/**
 * 首页“消息”（为防止混淆，本类中称之为“通知”）的数据模型提供者实现类.
 * <p>
 * 提供各种首页“消息”（为防止混淆，本类中称之为“通知”）类型的数据组织和管理功能.
 */
var AlarmsProvider = (function () {

    // 构造器（相当于java里的构造方法）
    var Cache3 = function(argument){
        //
        this.chatListCache = []
    };

    Cache3.prototype.clearChatCache = function () {
        this.chatListCache = []
    }

    Cache3.prototype.deleteChatCache = function (dataId) {
        const _index = this.chatListCache.findIndex(item => item.dataId == dataId);
        if (_index != -1) {
            this.chatListCache.splice(_index, 1)
        }
    }

    Cache3.prototype.updateChatTime = function (data, isExist) {
        let index, index2
        if (isExist) {
            index = this.chatListCache.findIndex(item => item.dataId == data.dataId);
            if (index != -1) {
                this.chatListCache.splice(index, 1)
            }
        }
        if (data.is2Top) {
            index2 = this.chatListCache.findIndex(item => item.is2Top && item.time < data.time);
            if (index2 == -1) {
                index2 = this.chatListCache.findLastIndex(item => item.is2Top);
                if (this.chatListCache.filter(item => item.is2Top).length - 1 == index2) {
                    if (this.chatListCache.length - 1 == index2) {
                        index2 = 99999
                    } else {
                        index2 ++
                    }
                } else if (index2 < 0) {
                    index2 = 99999
                }
            } 
        } else {
            if (data.isUnreadChatForFriend) {
                index2 = this.chatListCache.findLastIndex(item => item.is2Top);
                if (this.chatListCache.filter(item => item.is2Top).length - 1 == index2) {
                    if (this.chatListCache.length - 1 == index2) {
                        index2 = 99999
                    } else {
                        index2 ++
                    }
                } else if (index2 < 0) {
                    index2 = 99999
                }

                const index3 = this.chatListCache.findLastIndex(item => item.isUnreadChatForFriend);
                if (index3 != -1) {
                   if (index3 == this.chatListCache.length - 1) {
                    index2 = 99999
                   } else {
                    index2 = index3 + 1
                   }
                }
            } else {
                index2 = this.chatListCache.findIndex(item => !item.is2Top && item.time < data.time);
            }
            if (index2 == -1) {
                index2 = 99999
            }
        }
        console.log('ttt 未读 更新位置', index2, data, JSON.parse(JSON.stringify(this.chatListCache)))
        this.chatListCache.splice(index2, 0, data)
        return { index: Math.max(0, index2) }
    }

    /**
     * 刷新首页历史"消息"列表中的聊天消息历史item数据(异步方式从服务端加载历史数据).
     *
     * @param fn_callback_for_success(alarmsHistoryList) 回调函数，当本参数不为空时，数据加载成后后会通知此回函数，此回调函数里可以实现UI的刷新逻辑等
     */
    //Cache3.prototype.refreshAlarmsHistoryAsync = function (fn_callback_for_success) {
    Cache3.prototype.refreshHistoryChattingAlarmsAsync = function (fn_callback_for_success) {
        var localUserUid = LocalUserInfo.getUid();//LocalUserInfo.getObj().user_uid;

        // 要加载的聊天记录的开始时间
        var startTime = null;
        var QUERY_DATE_PATTERN = 'yyyy-MM-dd hh:mm:ss';

        // 【计算聊天记录的开始时间查询条件】：当前默认定义为加载15天内的聊天
        // 记录（见RBChatConfig.CHATTING_HISTORY_LOAD_TIME_INTERVAL常量定义）
        var dtForStart = new Date();
        dtForStart.setDate(dtForStart.getDate() - RBChatConfig.CHATTING_HISTORY_LOAD_TIME_INTERVAL);
        startTime = RBChatUtils.formatDate(dtForStart, QUERY_DATE_PATTERN);

        const getChatList = (page) => {
            // 通过rest接口获取首页历史"消息"列表数据
        RBChatRestHelper.queryAlarmsHistoryFromServer(localUserUid, startTime, page
            , function (returnValue){


                // 服务端返回的是java 2维Vector<Vector>对象数组（相当于JS里的2维嵌套数组）
                var alarmsHistoryList = JSON.parse(returnValue);
                console.log(JSON.parse(JSON.stringify(alarmsHistoryList)), 51231231)
                RBChatUtils.sortChatList(alarmsHistoryList)
                console.log(JSON.parse(JSON.stringify(alarmsHistoryList)), 51231231, 2)
                if(alarmsHistoryList && alarmsHistoryList.length > 0){
                    RBChatUtils.un_line_timer(alarmsHistoryList[0][13])
                    if (alarmsHistoryList.length >= 400 && Number(alarmsHistoryList[alarmsHistoryList.length - 1][5]) + 3 * 24 * 60 * 60 * 1000 > Date.now()) {
                        if (page > 1 || window._needLoadMoreChatList) {
                            getChatList(page + 1)
                        } else if (page == 1) {
                            window._getChatList = getChatList
                        }
                    }
                }
                // 分页拉取的数据只有私聊，并且满足3天内会话逻辑才去渲染
                if (page > 1) {
                    const _cache = JSON.parse(localStorage.getItem(`${localUserUid}_chatCache`) || '{}')
                    const list = alarmsHistoryList.filter(item => {
                        if (item[8] != 2 && RBChatMainWindowUI.checkAtThreeDaysChat(_cache, item[0])) return true
                        return false
                    })
                    if (!list.length) return
                     // 回调通知
                     if(fn_callback_for_success)
                        fn_callback_for_success(list, false);
                    return
                }
                // 加载首页小程序
                RBChatUtils.showFirstPageMinApp();
                //查询免打扰信息
                RBChatRestHelper.queryMyNoTip(function(returnValue){
                    localStorage.removeItem('noTipStr')
                    if(returnValue != 'null'){
                        localStorage.setItem('noTipStr',returnValue)
                    }
                     // 回调通知
                    if(fn_callback_for_success)
                    fn_callback_for_success(alarmsHistoryList, page == 1);

                },function(){
                     // 回调通知
                    if(fn_callback_for_success)
                    fn_callback_for_success(alarmsHistoryList, page == 1);
                })
                // 回调通知
                // if(fn_callback_for_success)
                //     fn_callback_for_success(alarmsHistoryList);
            }
            , function (errorThrownStr){
                //alert('首页历史"消息"列表数据读取出错，原因是：'+errorThrownStr);
                RBChatDialogHelper.showAlertDialog_WARN('加载失败', '首页历史"消息"列表数据加载出错，可能是网络故障，请稍后再试！');
            }
        );
        }
        getChatList(1)
    };

    /**
     * 刷新首页“消息”列表里的“未处理离线加好友请求”的item数据(异步方式从服务端加载).
     * 注意：此item因跟 refreshAlarmsHistoryAsync()方法处理的普通聊天消息业务类型不同，是单独加载的。
     *
     * @param fn_callback_for_success(req_count, latest_req_obj) 回调函数，当本参数不为空时，数据加载成后后会通知此回函数，此回调函数里可以实现UI的刷新逻辑等
     */
    Cache3.prototype.refreshOfflineAddFriendReqAlarmAsync = function(fn_callback_for_success){

        var localUserUid = LocalUserInfo.getUid();

        RBChatRestHelper.submitGetOfflineAddFriendsReqCountToServer(localUserUid
            , function (returnValue){

                // 服务端返回的是一个map对象（具体字段意义详见http rest【接口1008-4-9】的文档说明，或者服务端源码）
                var mapObj = JSON.parse(returnValue);

                // 解析出“未处理的请求数量”
                var req_count = mapObj.req_count;

                // 尝试请求出最近一次加好友请求的数据封装对象（如果有好友请求的话）
                var latest_req_obj_json = mapObj.latest_req_obj;
                var latest_req_obj = null;
                if(latest_req_obj_json){
                    latest_req_obj = JSON.parse(latest_req_obj_json)
                }

                // 回调通知
                if(fn_callback_for_success){
                    fn_callback_for_success(req_count, latest_req_obj);
                }
            }
            , function (errorThrownStr){
                RBChatDialogHelper.showAlertDialog_WARN('加载失败', '未处理的离线"加好友"通知数据加载出错，可能是网络故障，请稍后再试！');
            }
        );
    };

    /**
     * 新建一个临时/陌生人聊天的首页“消息”对象（本地用户发出的消息）。
     * 用于将本地用户主动发出的临时聊天消息也入到首页"消息"栏里.
     *
     * @param messageContentType 见rbchat_config.js中的MsgType类中常量定义
     * @param messageContent 聊天消息内容
     * @param beyondNickName 对方的昵称
     * @returns {新的AlarmMessageDto对象（详见 RBChatAlarmsUI JS类的说明）}
     */
    Cache3.prototype.createATempChatMsgAlarmForLocal = function(messageContentType, messageContent, beyondNickName, beyondUid){
        return this.createATempChatMsgAlarm(messageContentType, messageContent, beyondNickName, beyondUid, 0);
    };

    /**
     * 新建一个临时/陌生人聊天的首页“消息”对象。
     *
     * @param messageContentType 见rbchat_config.js中的MsgType类中常量定义
     * @param messageContent 聊天消息内容
     * @param beyondNickName 对方的昵称
     * @param beyondUid 对象的uid
     * @param time java时间戳长整数（形如：1280977330748），本参数小于或等于0于，将自动取当前系统时间戳
     * @returns {新的AlarmMessageDto对象（详见 RBChatAlarmsUI JS类的说明）}
     */
    Cache3.prototype.createATempChatMsgAlarm = function(messageContentType, messageContent, beyondNickName, beyondUid, time) {

        // 新的AlarmMessageDto对象
        var amd = {};
        amd.alarmMessageType = AlarmMessageType.tempChatMessage;
        //amd.title = '陌生人'+(RBChatUtils.isStringEmpty(beyondNickName)?'':' - '+beyondNickName);
        amd.title = beyondNickName;
        amd.msgContent = MessageHelper.parseMessageForShow(messageContent, messageContentType);
        amd.date = (time <= 0? RBChatUtils.getCurrentUTCTimestamp():time);

        amd.dataId = beyondUid;

        //    application.getString(R.string.sns_friend_strange_message_form_title)
        //    + (CommonUtils.isStringEmpty(tcmd.getNickName(), true)?"":" - "+tcmd.getNickName()));
        //amd.setMsgContent(ChatDataHelper.parseMessageForShow(application, tcmd.getM(), tcmd.getTy()));
        //amd.setDate(time <= 0? ToolKits.getTimeStamp(): time);//tcmd.getMsgTimeForDefaultTimeZone());
        //amd.setFlagNum(""+flagNumToAdd);
        //amd.setExtraObj(tcmd);

        return amd;
    };

    /**
     * 新建一个一对一好友聊天的首页“消息”对象（用于加好友成功后）。
     * 被好加友同意加好友请求后，将入一条空消息到首页消息栏里.
     * <p>
     * 目的是像微信等IM一样，加好友成功后，可以方便的点击此消息进入聊天界面。
     *
     * @param friendNickName 对方的昵称
     */
    Cache3.prototype.createChatMsgAlarmForAddSuccess = function (friendNickName, friendUid) {
        return this.createChatMessageAlarm(MsgType.TYPE_TEXT, friendNickName+'已是您的好友了，点击开始聊天吧...'
            , friendNickName, friendUid, 0);
    };

    /**
     * 新建一个一对一好友聊天的首页“消息”对象（本地用户发出的消息）。
     * 用于将本地用户主动发出的聊天消息也入到首页"消息"栏里.
     *
     * @param messageContentType 见rbchat_config.js中的MsgType类中常量定义
     * @param messageContent 聊天消息内容
     * @param friendNickName 对方的昵称
     * @returns {新的AlarmMessageDto对象（详见 RBChatAlarmsUI JS类的说明）}
     */
    Cache3.prototype.createChatMsgAlarmForLocal = function(messageContentType, messageContent, friendNickName, friendUid){
        return this.createChatMessageAlarm(messageContentType, messageContent, friendNickName, friendUid, 0);
    };

    /**
     * 新建一个一对一好友聊天的首页“消息”对象（收到的消息）。
     *
     * @param messageContentType 见rbchat_config.js中的MsgType类中常量定义
     * @param messageContent 聊天消息内容
     * @param friendNickName 对方的昵称
     * @param time java时间戳长整数（形如：1280977330748），本参数小于或等于0于，将自动取当前系统时间戳
     * @returns {新的AlarmMessageDto对象（详见 RBChatAlarmsUI JS类的说明）}
     */
    Cache3.prototype.createChatMessageAlarm = function(messageContentType, messageContent, friendNickName, friendUid, time) {

        // 新的AlarmMessageDto对象
        var amd = {};
        amd.alarmMessageType = AlarmMessageType.reviceMessage;
        amd.title = friendNickName;
        amd.msgContent = MessageHelper.parseMessageForShow(messageContent, messageContentType);
        amd.date = (time <= 0? RBChatUtils.getCurrentUTCTimestamp():time);

        amd.dataId = friendUid;

        return amd;
    };

    /**
     * 新建一个添好"加好友被拒绝"的alarm对象.
     *
     * @param beyondNickName
     * @returns {{}}
     */
    Cache3.prototype.createAddFriendBeRejectAlarm = function(beyondNickName, beyondUid){

        // 新的AlarmMessageDto对象
        var amd = {};
        amd.alarmMessageType = AlarmMessageType.addFriendBeReject;
        amd.title = '加好友请求被拒';
        amd.msgContent = '对不起， '+beyondNickName+' 拒绝了您的添加好友请求.';
        amd.date = RBChatUtils.getCurrentUTCTimestamp();

        amd.dataId = beyondUid;

        return amd;
    };

    /**
     * 新建一个“未处理的加好友确认提醒”的alarm对象.
     *
     * @param beyondNickName 最近一次请求者的昵称（仅用于UI显示时）
     * @param reqTimestamp 好友请求时间戳，本参数为空将使用当前默认时间
     * @returns {{}}
     */
    Cache3.prototype.createAddFriendReqMergeAlarm = function(beyondNickName, reqTimestamp){//, beyondUid){

        // 新的AlarmMessageDto对象
        var amd = {};
        amd.alarmMessageType = AlarmMessageType.addFriendRequest;
        amd.title = '确认提醒';
        amd.msgContent = beyondNickName+' 邀请您成为好友.';
        amd.date = reqTimestamp?reqTimestamp:RBChatUtils.getCurrentUTCTimestamp();

        // 数据id就用本地用户的Uid吧（因为首页“消息”里显示的未处理好友
        // 请求Item只会有一条，用请求者的uid作为这里的数据id就不合适了）
        amd.dataId = LocalUserInfo.getUid();//beyondUid;

        return amd;
    };

    /**
     * 新建一个"群组聊天消息"的首页“消息”对象（本地用户发出的消息）。
     * 用于将本地用户主动发出的消息也入到首页"消息"栏里.
     *
     * @param messageContentType
     * @param messageContent
     * @param toGname
     * @returns {{}}
     */
    Cache3.prototype.createAGroupChatMsgAlarmForLocal = function(messageContentType, messageContent, toGname, toGid){
        return this.createAGroupChatMsgAlarm(messageContentType, messageContent, toGname, toGid, null, 0);
    };

    /**
     * 新建一个“群组聊天消息”的alarm对象.
     *
     * @param messageContentType
     * @param messageContent
     * @param toGname
     * @param fromUserNickName
     * @param time
     * @returns {{}}
     */
    Cache3.prototype.createAGroupChatMsgAlarm = function(messageContentType, messageContent, toGname, toGid, fromUserNickName, time, isFriend = false) {
        // 新的AlarmMessageDto对象
        var amd = {};
        amd.alarmMessageType = isFriend ? AlarmMessageType.reviceMessage : AlarmMessageType.groupChatMessage;
        amd.title = toGname;

        var previewContent = MessageHelper.parseMessageForShow(messageContent, messageContentType);
        if(messageContentType != MsgType.TYPE_REVOKE)
            previewContent = (RBChatUtils.isStringEmpty(fromUserNickName)?'': fromUserNickName+': ') + previewContent;

        amd.msgContent = previewContent;
        amd.date = (time<=0?RBChatUtils.getCurrentUTCTimestamp():time);

        amd.dataId = toGid;

        return amd;
    };

    Cache3.prototype.getOtherChats = function () {
        if (window._loadMoreChat) return
        window._loadMoreChat = true // 只会第一次会加载更多会话
        window._needLoadMoreChatList = true // 防止第一次会话拉取没成功，用户已经切到了3天内会话tab
        window._getChatList && window._getChatList(2)
    }

    Cache3.prototype.optimizeCache = function () {
        const keys = Object.keys(localStorage)
            .filter(k => k.endsWith("_chatCache"));

        keys.forEach(key => {
            try {
                const _data = JSON.parse(localStorage.getItem(key))
                const _keys = Object.keys(_data)
                _keys.forEach(_key => {
                    if (!Object.keys(_data[_key]).length) {
                        delete _data[_key]
                    }
                })
                localStorage.setItem(key, JSON.stringify(_data))
            }  catch (err) {}
        })
    }

    //window.AlarmsProvider = cache;
    return new Cache3();// 此种方式用于构造器的方式
})();



/**
 * 一对一聊天数据缓存（即一对一好友聊天、一对一陌生人聊天的全局数据缓存）.
 */
var SingleChattingCache = (function () {

    // 构造器（相当于java里的构造方法）
    var Cache4 = function (argument){

        // 一对一聊天数据缓存Map(key=用户的uid, value=当前聊天记录数组（数组单元是ChatMsgEntity对象）)，
        // ChatMsgEntity对象的字段定义请见：rbchat_cache.js中的ChatMsgEntity对象定义部分
        this._usersMsgCache = {};
    };

    /**
     * 加载离线聊天消息完整数据(异步方式从服务端加载历史数据).
     *
     * 注意：因单聊和群聊的离线消息格式完全一致，因而群聊没有单独的离线加载代码，重用本方法即可。
     *
     * @param from_user_uid 本参数为null表示不区分好友地取所有未读的离线消息，否则只取指定uid发过来的离线聊天消息
     * @param fn_callback_for_success(offlineMessagesList) 回调函数，当本参数不为空时，数据加载成后后会通知此
     * 回调函数，此回调函数里可以实现UI的刷新逻辑等
     */
    Cache4.prototype.loadOfflineMessagesAsync = function(from_user_uid, fn_callback_for_success){

        var localUserUid = LocalUserInfo.getUid();
        var startTime = localStorage.getItem('offmsg_time');
        if(!startTime){
            startTime = ''
        }
        // 通过rest接口获取离线聊天数据（详见：“【接口1008-4-88】获取离线聊天消息的接口”的文档或服务端源码）
        RBChatRestHelper.queryAlarmsHistoryFromServer_2(localUserUid, startTime
            , function (returnValue){

                // 服务端返回的是java 1维Vector<OfflineMsgDTO>对象数组
                // 对象OfflineMsgDTO的文档，详见：http://docs.52im.net/extend/docs/api/rainbowchatserver4_pro/com/x52im/rainbowchat/http/logic/dto/OfflineMsgDTO.html
                var offlineMessagesList = JSON.parse(returnValue);

                // 回调通知
                if(fn_callback_for_success)
                    fn_callback_for_success(offlineMessagesList);
            }
            , function (errorThrownStr){
                RBChatDialogHelper.showAlertDialog_WARN('加载失败'
                    , (from_user_uid?'与'+from_user_uid+'的':'')+'离线聊天消息数据加载出错，可能是网络故障，请稍后再试！');
            }
        );
    };

    /**
     * 在缓存列表中加入一组新的用户聊天数据（如果
     * 之前不存在该访客则新建一个，否则在原先的聊天记录上附加上）。
     *
     * @param uid
     * @param chatMsgEntitys对象，为null表示仅在缓存列表中加入新用户（无聊天消息）
     * @param isAddToHead true表示添加到对应人员缓存数据（数组）的开头，否则默认添加到末尾
     */
    Cache4.prototype.putChatCaches = function(uid, chatMsgEntitys, isAddToHead){
        if(chatMsgEntitys && chatMsgEntitys.length > 0){
            for(var i = 0; i < chatMsgEntitys.length; i++){
                this.putChatCache(uid, chatMsgEntitys[i], isAddToHead);
            }
        }
        else{
            RBChatUtils.logToConsole('[SingleChattingCache.putChatCaches中]要放入的缓存数据是空的，本次无数据要放入！(chatMsgEntitys='
                +chatMsgEntitys+')');
        }
    };

    /**
     * 在缓存列表中加入一条新的聊天数据（如果
     * 之前不存在该用户的缓存记录则新建一个，否则在原先的聊天记录上附加上）。
     *
     * @param uid {String}
     * @param chatMsgEntity {ChatMsgEntity} 为null表示仅在缓存列表中加入新用户（无聊天消息）
     * @param isAddToHead {boolean} true表示添加到对应人员缓存数据（数组）的开头，否则默认添加到末尾
     * @returns {*}
     */
    Cache4.prototype.putChatCache = function(uid, chatMsgEntity, isAddToHead){
        try{
            //if(this.length >= this.maxLength)
            //    throw new Error("[Error HashMap] : Map Datas' count overflow !");
            if(uid != ""){
                for(var vid in this._usersMsgCache){
                    if(vid == uid){
                        // 只有当要插入的对象不为空时才加入到数组中（为空的情况，可能是仅
                        // 仅想在缓存里增加该访客的记录，虽然暂无聊天数据）
                        if (chatMsgEntity) {
                            // 以经存在聊天列表则在原先的记录（ChatMsgEntity数组）数据上Push进去新的一条消息
                            var lastData = this._usersMsgCache[uid];
                            // 该消息已经存在，则不需要添加到库
                            var msgs = lastData.filter(item=> item.fingerPrintOfProtocal == chatMsgEntity.fingerPrintOfProtocal);
                            if(msgs && msgs.length > 0){
                                  return 1;
                            }
                            // 是否需要放入到开头
                            if(isAddToHead){
                                lastData.unshift(chatMsgEntity);
                            }
                            // 否则放入到末尾
                            else{
                                lastData.push(chatMsgEntity);
                            }

                            this._usersMsgCache[uid] = lastData;
                        }
                        return 0;
                    }
                }

                // 聊天记录是一个ChatMsgEntity对象为元素的数据
                var data = new Array();
                if(chatMsgEntity){
                    data.push(chatMsgEntity);// 注意：此ChatMsgEntity对象可能是空的，为空时表示只想在缓存列表上把用户加
                                             // 入（而无聊天信息），以便后绪的逻辑中可以知道该用户是否已存在于列表中
                }
                // 参数oneChatProtocalObj如果是空的，就相当于给在线列表加一个聊天消息是空的的用户
                this._usersMsgCache[uid] = data;
            }
        }catch(e){
            return -1;
        }
    };

    /**
     * 覆盖指定uid的聊天数据。
     *
     * @param uid
     * @param chatMsgEntityArrays Array[ChatMsgEntity对象]数组
     * @returns {*}
     */
    Cache4.prototype.coverChatCache = function(uid, chatMsgEntityArrays){
        try{
            if(uid != ""){
                // 如果存在则直接覆盖（替换）成最新的
                this._usersMsgCache[uid] = chatMsgEntityArrays;
            }
        }catch(e){
            return e;
        }
    };

    /**
     * 返回指定用户的聊天缓存数据。
     *
     * @param uid
     * @returns Array[ChatMsgEntity对象]
     */
    Cache4.prototype.getChatCache = function(uid){// 就是获取聊天记录数组Array对象
        try{
            if(this._usersMsgCache[uid])
                return this._usersMsgCache[uid];
        }catch(e){
            return e;
        }
    };

    /**
     * 返回指定用户的聊天缓存数据行数。
     *
     * @param uid
     * @returns Number[大于等于0的整数]
     */
    Cache4.prototype.getChatCacheLength = function(uid){
        try{
            if(this._usersMsgCache[uid])
                return this._usersMsgCache[uid].length;
            else
            return 0;
        }catch(e){
            return e;
        }
    };

    /**
     * 返回指定用户的聊天缓存数据中的“第一条”。
     *
     * @param uid
     * @returns ChatMsgEntity对象（如果存在的话）
     */
    Cache4.prototype.getChatCacheFirst = function(uid){// 就是获取聊天记录数组Array对象中的第0单元
        try{
            var datas = this._usersMsgCache[uid];
            if(datas && datas.length > 0)
                return datas[0];
        }catch(e){
            return e;
        }
    };

    /**
     * 指定用户是否已经存在聊天数据的缓存。
     *
     * @param uid
     * @returns {boolean} true表示是，否则表示否
     */
    Cache4.prototype.containsChatCache = function(uid){
        try{
            for(var vid in this._usersMsgCache){
                if(vid === uid)
                    return true;
            }
            return false;
        }catch(e){
            return e;
        }
    };

    /**
     * 判断给定的指纹id（消息唯一id）是否已经存在于与该用户的聊天数据缓存中。
     *
     * @param uid
     * @param fp
     * @returns {boolean} true表示是，否则表示否
     * @author add by JackJiang 20170918
     */
    Cache4.prototype.containsFingerPrintInChatCache = function(uid, fp){

        if(fp){

            if(this.containsChatCache(uid)){

                // 取出聊天列表的缓存的记录（ChatMsgEntity数组）
                var lastData = this._usersMsgCache[uid];

                // 遍历缓存数组中的消息，看看该指纹码对应的消息是否存在，如存在则返回true
                if(lastData){

                    //标准的for循环：遍历 Array[ChatMsgEntity对象] 数组
                    for(var i=0; i < lastData.length; i++){
                        var cachedP = lastData[i];

                        if(cachedP){
                            if(cachedP.fingerPrintOfProtocal === fp){
                                RBChatUtils.logToConsole('【DEBUG】[消息重复判断]已经成功匹配用户 '+uid+'(目标：'+fp+'的聊天缓存！【OK】');
                                return true;
                            }
                        }
                    }
                }
            }
            else{
                RBChatUtils.logToConsole('【DEBUG】[消息重复判断]用户 '+uid+'(目标：'+fp+')的聊天缓存不存在，本次匹配结束！【NO】');
            }
        }

        return false;
    };

    /**
     * 按指纹码查找对应用户的消息对象。
     *
     * @param uid {String} 聊天好友uid
     * @param fingerPrint {String} 消息的指纹码
     * @return {ChatMsgEntity} 如果找到则返回消息对象本身，否则返回null
     */
    Cache4.prototype.findMessageByFingerPrint = function(uid, fingerPrint) {
        var result = this.findMessageByFingerPrintX(uid, fingerPrint);
        if(result)
            return result.message;
        return null;
    };

    /**
     * 按指纹码查找对应用户的消息对象。
     *
     * @param uid {String} 聊天好友uid
     * @param fingerPrint {String} 消息的指纹码
     * @return {int} 如果找到则返回消息对象所处索引，否则返回-1
     */
    Cache4.prototype.findIndexByFingerPrint = function(uid, fingerPrint) {
        var result = this.findMessageByFingerPrintX(uid, fingerPrint);
        if(result)
            return result.index;
        return -1;
    };

    /**
     * 按指纹码查找对应用户的消息对象。
     *
     * @param uid {String} 聊天好友uid
     * @param fingerPrint {String} 消息的指纹码
     * @return {Object} 如果找到则返回消息对象本身+所处索引，否则返回null
     */
    Cache4.prototype.findMessageByFingerPrintX = function(uid, fingerPrint) {

        if (fingerPrint && uid) {
            // 取出聊天列表的缓存的记录（ChatMsgEntity数组）
            var someoneMessages = this._usersMsgCache[uid];
            if (someoneMessages && someoneMessages.length > 0) {
                for (var i = 0; i < someoneMessages.length; i++){
                     var d = someoneMessages[i];
                    if (d) {
                        // 如果找到就跳出循环
                        if (fingerPrint == d.fingerPrintOfProtocal) {
                            // 返回值是一个对象
                            return {
                                'message' : d,
                                'index' : i
                            };
                        }
                    }
                }
            }
        }

        return null;
    };

    /**
     * 删除指定用户的消息指纹码对应的消息。
     *
     * @param uid {String} 聊天好友的uid
     * @param fingerPrint {String} 被删除消息的指纹码
     * @return {Object}
     */
    Cache4.prototype.removeChatCacheByFp = function(uid, fingerPrint){
        let index = this.findIndexByFingerPrint(uid, fingerPrint);
        let removeResult = this.removeChatCacheByIndex(uid, index);
        RBChatUtils.logToConsole_INFO("SingleChattingCache.removeChatCacheByFp后，removeResult.deletedSucess? "+removeResult.deletedSucess+" .");
        return removeResult;
    };

    /**
     * 从内存模型中删除指定用户的指定索引处聊天消息对象（注：本方法仅删除内存中的消息对象哦）。
     *
     * @param uid {String} 聊天好友的uid
     * @param index {int} 被删除消息的索引号
     * @return {Object}
     */
    Cache4.prototype.removeChatCacheByIndex = function(uid, index){

        let result = {
            /* 删除操作是否成功 */
            'deletedSucess' : false,
            /* 被删除消息对象的实例引用 */
            'deletedMessage' : null,
            /* 被删除消息的前一条消息对象的实例引用（当被删除消息就是第一条消息时，则此对象应是null） */
            'previousDeletedMessage' : null,
            /* 被删除的消息对象，删除前它是否是消息列表数组的最后一个？*/
            'last' : false
        };

        if (index >= 0) {
            let someoneMessages = this._usersMsgCache[uid];
            let dataListCount = someoneMessages.length;
            // 索引合法性检查
            if (someoneMessages && dataListCount > 0 && index <= ((dataListCount - 1))) {

                // 当前被删除的消息是否是消息数组中的最后一个
                let isLast = (index === (dataListCount - 1));

                // 被删除消息的前一条消息对象引用（用于当删除的是最后一条消息时，应用层可以及时更新首
                // 页"消息"列表中的显示，不然显示的还是已被删除的消息内容，ui上看起来就很bug了！）
                let previousRemovedMessage = null;

                if (isLast) {
                    let previousRemovedIndex = index - 1;//dataListCount - 2;// 减1是最后一条消息，减2就是被删除前的倒数第2条
                    // 索引合法性检查
                    if (previousRemovedIndex >= 0) {
                        previousRemovedMessage = someoneMessages[previousRemovedIndex];
                    }
                }

                // 注意：splice函数返回值是一个数组，表示被删除的元素，
                // see :https://www.runoob.com/jsref/jsref-splice.html
                let beRemoved = (someoneMessages.splice(index,1))[0];

                // 删除成功
                if (beRemoved) {
                    // 删除结果信息
                    result.deletedSucess = true;
                    result.deletedMessage = beRemoved;
                    // 被删除掉的索引是不是数据的最后一个
                    result.last = isLast;
                    result.previousDeletedMessage = previousRemovedMessage;
                }
            }
        } else {
            RBChatUtils.logToConsole_WARN("SingleChattingCache.removeMessage时，无效的index=" + index + "，无法完成删除操作！")
        }

        return result;
    };

    /**
     * 从JS缓存中移除与指定用户的所有聊天数据。
     *
     * @param uid
     * @returns {*}
     */
    Cache4.prototype.removeChatCache = function(uid){
        try{
            if(this._usersMsgCache[uid]){
                delete this._usersMsgCache[uid];
                return true;
            }
            return false;
        }
        catch(e){
            return e;
        }
    };

    /**
     * 清空与该用户的聊天消息缓存数据。
     *
     * @returns {*}
     */
    Cache4.prototype.removeAllChatCache = function(){
        try{
            delete this._usersMsgCache;
            this._usersMsgCache = {};
        }catch(e){
            return e;
        }
    };

    Cache4.prototype.showAllCacheForDebug = function() {
        RBChatUtils.logToConsole("【单聊】[hashmap.js_showAll()] 正在输出HashMap内容(列表长度 "
            + this._usersMsgCache.length + ") ------------------->");
        //遍历
        for (var uid in this._usersMsgCache) {
            RBChatUtils.logToConsole("【单聊】[hashmap.js_showAll()]       > key="+uid+", value="
                +JSON.stringify(this._usersMsgCache[uid]));
        }
    };


    //window.SingleChattingCache = cache;
    return new Cache4();// 此种方式用于构造器的方式
})();



/**
 * 群聊数据缓存（即群组聊天的全局数据缓存）.
 *
 *   【补充说明】：
 *   > 考虑到未来的扩展性，以及JS语言面向对象设计的局限性，本缓存类
 *   没有直接重用单聊缓存类SingleChattingCache，目的是保证本类的未来扩展性，
 *   以及代码的可读性。但因此带来的部分代码冗余，在可接授范围内。
 *   > 另一方面，重用代码带来的代码复杂性增加，以及接下来版本的拆分等，都是不方便，
 *   所以两边单独维护是目前的最佳方法。
 *
 * @since 1.3
 */
var GroupChattingCache = (function () {

    // 构造器（相当于java里的构造方法）
    var Cache5 = function (argument){

        // 群组聊天数据缓存Map(key=群组的gid, value=当前聊天记录数组（数组单元是ChatMsgEntity对象）)，
        // ChatMsgEntity对象的字段定义请见：rbchat_cache.js中的ChatMsgEntity对象定义部分
        this._groupsMsgCache = {};
    };

    /**
     * 在缓存列表中加入一组新的群组聊天数据（如果
     * 之前不存在该访客则新建一个，否则在原先的聊天记录上附加上）。
     *
     * @param gid
     * @param chatMsgEntitys对象，为null表示仅在缓存列表中加入新群组（无聊天消息）
     * @param isAddToHead true表示添加到对应群组缓存数据（数组）的开头，否则默认添加到末尾
     */
    Cache5.prototype.putChatCaches = function(gid, chatMsgEntitys, isAddToHead){
        if(chatMsgEntitys && chatMsgEntitys.length > 0){
            for(var i = 0; i < chatMsgEntitys.length; i++){
                this.putChatCache(gid, chatMsgEntitys[i], isAddToHead);
            }
        }
        else{
            RBChatUtils.logToConsole('[GroupChattingCache.putChatCaches中]要放入的缓存数据是空的，本次无数据要放入！(chatMsgEntitys='
                +chatMsgEntitys+')');
        }
    };

    /**
     * 在缓存列表中加入一条新的聊天数据（如果
     * 之前不存在该群组的缓存记录则新建一个，否则在原先的聊天记录上附加上）。
     *
     * @param gid
     * @param chatMsgEntity ChatMsgEntity对象，为null表示仅在缓存列表中加入新群组（无聊天消息）
     * @param isAddToHead true表示添加到对应群组缓存数据（数组）的开头，否则默认添加到末尾
     * @returns {*}
     */
    Cache5.prototype.putChatCache = function(gid, chatMsgEntity, isAddToHead){
        try{
            if(gid != ""){
                for(var vid in this._groupsMsgCache){
                    if(vid == gid){
                        // 只有当要插入的对象不为空时才加入到数组中（为空的情况，可能是仅
                        // 仅想在缓存里增加该群聊的记录，虽然暂无聊天数据）
                        if (chatMsgEntity) {
                            // 以经存在聊天列表则在原先的记录（ChatMsgEntity数组）数据上Push进去新的一条消息
                            var lastData = this._groupsMsgCache[gid];
                            // 该消息已经存在，则不需要添加到库
                            var msgs = lastData.filter(item=> item.fingerPrintOfProtocal == chatMsgEntity.fingerPrintOfProtocal);
                            if(msgs && msgs.length > 0){
                                return 1;
                            }
                            // 是否需要放入到开头
                            if(isAddToHead){
                                lastData.unshift(chatMsgEntity);
                            }
                            // 否则放入到末尾
                            else{
                                lastData.push(chatMsgEntity);
                            }

                            this._groupsMsgCache[gid] = lastData;
                        }
                        return 0;
                    }
                }

                // 聊天记录是一个ChatMsgEntity对象为元素的数据
                var data = new Array();
                if(chatMsgEntity){
                    data.push(chatMsgEntity);// 注意：此ChatMsgEntity对象可能是空的，为空时表示只想在缓存列表上把群组加
                                             // 入（而无聊天信息），以便后绪的逻辑中可以知道该群组是否已存在于列表中
                }
                // 参数oneChatProtocalObj如果是空的，就相当于给在线列表加一个聊天消息是空的的群组
                this._groupsMsgCache[gid] = data;
            }
        }catch(e){
            return -1;
        }
    };

    /**
     * 返回指定群组的聊天缓存数据。
     *
     * @param gid
     * @returns Array[ChatMsgEntity对象]
     */
    Cache5.prototype.getChatCache = function(gid){// 就是获取聊天记录数组Array对象
        try{
            if(this._groupsMsgCache[gid])
                return this._groupsMsgCache[gid];
        }catch(e){
            return e;
        }
    };

    /**
     * 返回指定群组的聊天缓存数据行数。
     *
     * @param gid
     * @returns Number[大于等于0的整数]
     */
    Cache5.prototype.getChatCacheLength = function(gid){
        try{
            if(this._groupsMsgCache[gid])
                return this._groupsMsgCache[gid].length;
            else
                return 0;
        }catch(e){
            return e;
        }
    };

    /**
     * 返回指定群组的聊天缓存数据中的“第一条”。
     *
     * @param gid
     * @returns ChatMsgEntity对象（如果存在的话）
     */
    Cache5.prototype.getChatCacheFirst = function(gid){// 就是获取聊天记录数组Array对象中的第0单元
        try{
            var datas = this._groupsMsgCache[gid];
            if(datas && datas.length > 0)
                return datas[0];
        }catch(e){
            return e;
        }
    };

    /**
     * 指定群组是否已经存在聊天数据的缓存。
     *
     * @param gid
     * @returns {boolean} true表示是，否则表示否
     */
    Cache5.prototype.containsChatCache = function(gid){
        try{
            for(var vid in this._groupsMsgCache){
                if(vid === gid)
                    return true;
            }
            return false;
        }catch(e){
            return e;
        }
    };

    /**
     * 判断给定的指纹id（消息唯一id）是否已经存在于与该群的聊天数据缓存中。
     *
     * @param gid
     * @param fp
     * @returns {boolean} true表示是，否则表示否
     * @author add by JackJiang 20170918
     */
    Cache5.prototype.containsFingerPrintInChatCache = function(gid, fp){

        if(fp){

            if(this.containsChatCache(gid)){

                // 取出聊天列表的缓存的记录（ChatMsgEntity数组）
                var lastData = this._groupsMsgCache[gid];

                // 遍历缓存数组中的消息，看看该指纹码对应的消息是否存在，如存在则返回true
                if(lastData){

                    //标准的for循环：遍历 Array[ChatMsgEntity对象] 数组
                    for(var i=0; i < lastData.length; i++){
                        var cachedP = lastData[i];

                        if(cachedP){
                            if(cachedP.fingerPrintOfProtocal === fp){
                                RBChatUtils.logToConsole('【DEBUG】[消息重复判断]已经成功匹配群组 '+gid+'(目标：'+fp+'的聊天缓存！【OK】');
                                return true;
                            }
                        }
                    }
                }
            }
            else{
                RBChatUtils.logToConsole('【DEBUG】[消息重复判断]群组 '+gid+'(目标：'+fp+')的聊天缓存不存在，本次匹配结束！【NO】');
            }
        }

        return false;
    };

    /**
     * 按指纹码查找对应的消息对象。
     *
     * @param gid {String} 群id
     * @param fingerPrintOfParent {String} 父消息的指纹码（每条群聊消息都是由消息发起者的这条消息扩散出来的，这条原始消息被称为"父"消息）
     * @return {ChatMsgEntity} 如果找到则返回消息对象本身，否则返回null
     */
    Cache5.prototype.findMessageByParentFingerPrint = function(gid, fingerPrintOfParent) {
        var result = this.findMessageByParentFingerPrintX(gid, fingerPrintOfParent);
        if(result)
            return result.message;
        return null;
    };

    /**
     * 按指纹码查找对应的消息对象索引。
     *
     * @param gid {String} 群id
     * @param fingerPrintOfParent {String} 父消息的指纹码（每条群聊消息都是由消息发起者的这条消息扩散出来的，这条原始消息被称为"父"消息）
     * @return {int} 如果找到则返回消息对象所处索引，否则返回-1
     */
    Cache5.prototype.findIndexByParentFingerPrint = function(gid, fingerPrintOfParent) {
        var result = this.findMessageByParentFingerPrintX(gid, fingerPrintOfParent);
        if(result)
            return result.index;
        return -1;
    };

    /**
     * 按父指纹码查找对应的消息对象+索引。
     *
     * @param gid {String} 群id
     * @param fingerPrintOfParent {String} 父消息的指纹码（每条群聊消息都是由消息发起者的这条消息扩散出来的，这条原始消息被称为"父"消息）
     * @return {Object} 如果找到则返回消息对象本身+所处索引，否则返回null
     */
    Cache5.prototype.findMessageByParentFingerPrintX = function(gid, fingerPrintOfParent)
    {
        // var getIt = null;
        if(fingerPrintOfParent && gid) {
            // 取出聊天列表的缓存的记录（ChatMsgEntity数组）
            var someoneMessages = this._groupsMsgCache[gid];
            if (someoneMessages && someoneMessages.length > 0) {
                for (var i = 0; i < someoneMessages.length; i++){
                    var d = someoneMessages[i];
                    // 如果找到就跳出循环
                    if (fingerPrintOfParent == d.fingerPrintOfParent){
                        // getIt = d;
                        // return getIt;
                        // 返回值是一个对象
                        return {
                            'message' : d,
                            'index' : i
                        };
                    }
                }
            }
        }

        return null;
    };

    /**
     * 删除指定的父指纹码对应的消息。
     *
     * @param uid {String} 聊天好友的uid
     * @param fingerPrintOfParent {String} 父消息的指纹码（每条群聊消息都是由消息发起者的这条消息扩散出来的，这条原始消息被称为"父"消息）
     * @return {Object}
     */
    Cache5.prototype.removeChatCacheByParentFp = function(gid, fingerPrintOfParent){
        let index = this.findIndexByParentFingerPrint(gid, fingerPrintOfParent);
        let removeResult = this.removeChatCacheByIndex(gid, index);
        RBChatUtils.logToConsole_INFO("roupChattingCache.removeChatCacheByParentFp后，removeResult.deletedSucess? "+removeResult.deletedSucess+" .");
        return removeResult;
    };

    /**
     * 从内存模型中删除指定索引处聊天消息对象（注：本方法仅删除内存中的消息对象哦）。
     *
     * @param gid {String} 群id
     * @param index {int} 被删除消息的索引号
     * @return {Object}
     */
    Cache5.prototype.removeChatCacheByIndex = function(gid, index){

        let result = {
            /* 删除操作是否成功 */
            'deletedSucess' : false,
            /* 被删除消息对象的实例引用 */
            'deletedMessage' : null,
            /* 被删除消息的前一条消息对象的实例引用（当被删除消息就是第一条消息时，则此对象应是null） */
            'previousDeletedMessage' : null,
            /* 被删除的消息对象，删除前它是否是消息列表数组的最后一个？*/
            'last' : false
        };

        if (index >= 0) {
            let someoneMessages = this._groupsMsgCache[gid];
            let dataListCount = someoneMessages.length;
            // 索引合法性检查
            if (someoneMessages && dataListCount > 0 && index <= ((dataListCount - 1))) {

                // 当前被删除的消息是否是消息数组中的最后一个
                let isLast = (index === (dataListCount - 1));

                // 被删除消息的前一条消息对象引用（用于当删除的是最后一条消息时，应用层可以及时更新首
                // 页"消息"列表中的显示，不然显示的还是已被删除的消息内容，ui上看起来就很bug了！）
                let previousRemovedMessage = null;

                if (isLast) {
                    let previousRemovedIndex = index - 1;//dataListCount - 2;// 减1是最后一条消息，减2就是被删除前的倒数第2条
                    // 索引合法性检查
                    if (previousRemovedIndex >= 0) {
                        previousRemovedMessage = someoneMessages[previousRemovedIndex];
                    }
                }

                // 注意：splice函数返回值是一个数组，表示被删除的元素，
                // see :https://www.runoob.com/jsref/jsref-splice.html
                let beRemoved = (someoneMessages.splice(index,1))[0];

                // 删除成功
                if (beRemoved) {
                    // 删除结果信息
                    result.deletedSucess = true;
                    result.deletedMessage = beRemoved;
                    // 被删除掉的索引是不是数据的最后一个
                    result.last = isLast;
                    result.previousDeletedMessage = previousRemovedMessage;
                }
            }
        } else {
            RBChatUtils.logToConsole_WARN("SingleChattingCache.removeMessage时，无效的index=" + index + "，无法完成删除操作！")
        }

        return result;
    };

    /**
     * 从JS缓存中移除与指定群组的所有聊天数据。
     *
     * @param gid
     * @returns {*}
     */
    Cache5.prototype.removeChatCache = function(gid){
        try{
            if(this._groupsMsgCache[gid]){
                delete this._groupsMsgCache[gid];
                return true;
            }
            return false;
        }
        catch(e){
            return e;
        }
    };

    /**
     * 清空群组的聊天消息缓存数据。
     *
     * @returns {*}
     */
    Cache5.prototype.removeAllChatCache = function(){
        try{
            delete this._groupsMsgCache;
            this._groupsMsgCache = {};
        }catch(e){
            return e;
        }
    };

    Cache5.prototype.showAllCacheForDebug = function() {
        RBChatUtils.logToConsole("【群聊】[hashmap.js_showAll()] 正在输出HashMap内容(列表长度 "
            + this._groupsMsgCache.length + ") ------------------->");
        //遍历
        for (var gid in this._groupsMsgCache) {
            RBChatUtils.logToConsole("【群聊】[hashmap.js_showAll()]       > key="+gid+", value="
                +JSON.stringify(this._groupsMsgCache[gid]));
        }
    };


    //window.GroupChattingCache = cache;
    return new Cache5();// 此种方式用于构造器的方式
})();


/**
 * 用户聊天消息的草稿缓存（用于保存没有发送的消息，以便用户下次再进来时能还原，提升用户体验）.
 *
 * @since 2.0
 */
var MessagesDraftCache = (function () {

    // 构造器（相当于java里的构造方法）
    var CacheForDrafts = function(argument){
        // 聊天消息草稿缓存Map(key='alarmType_alarmDataId', value='消息草稿文本')，
        this._msgsDraftCache = {};
    };

    /**
     * 保存草稿。
     *
     * @param alarmType
     * @param alarmDataId
     * @param msgDraft 草稿内容
     * @returns {*}
     */
    CacheForDrafts.prototype.putDraft = function(alarmType, alarmDataId, msgDraft){
        try{
            if(msgDraft){
                var key = alarmType+'_'+alarmDataId;
                // 如果存在则直接覆盖（替换）成最新的
                this._msgsDraftCache[key] = msgDraft;
            }
        }catch(e){
            return e;
        }
    };

    /**
     * 返回指定用户的聊天缓存数据。
     *
     * @param alarmType
     * @param alarmDataId
     * @returns 如果存在则返回草稿内容，否则返回空
     */
    CacheForDrafts.prototype.getDraft = function(alarmType, alarmDataId){
        try{
            var key = alarmType+'_'+alarmDataId;
            if(this._msgsDraftCache[key])
                return this._msgsDraftCache[key];
            return null;
        }catch(e){
            return e;
        }
    };

    /**
     * 从JS缓存中移除草稿数据。
     *
     * @param alarmType
     * @param alarmDataId
     * @returns {*}
     */
    CacheForDrafts.prototype.removeDraft = function(alarmType, alarmDataId){
        try{
            var key = alarmType+'_'+alarmDataId;
            if(this._msgsDraftCache[key]){
                delete this._msgsDraftCache[key];
                return true;
            }
            return false;
        }
        catch(e){
            return e;
        }
    };

    /**
     * 是否已存在草稿。
     *
     * @param alarmType
     * @param alarmDataId
     * @returns {boolean} true表示是，否则表示否
     */
    CacheForDrafts.prototype.containsDraft = function(alarmType, alarmDataId){
        try{
            return this.getChatCache(alarmType, alarmDataId)?true:false;
        }catch(e){
            return e;
        }
    };


    //window.MessagesDraftCache = cache;
    return new CacheForDrafts();// 此种方式用于构造器的方式
})();


/**
 * 聊天消息内容列表中的每个单元数据封装对象（本对像仅用于聊天消息显示界面中的UI显示时，不会用作别的地方）。
 */
var ChatMsgEntity = (function(){

    // 构造器（相当于java里的构造方法）
    var ChatMsgEntityObj = function (argument){

        //======================================================== 核心数据字段 START
        /** 消息发送者的uid（用于各种功能链接中能方便读取到uid） */
        this.uid = null;

        /** 消息发送者的昵称（用于显示） */
        this.name = null;
        /** 消息时间戳长整数（形如：1525330876101） */
        this.date = 0;
        /**
         * 消息内容（注意：此消息内容可能并非文本，以不同消息定义的封装对象为准）。
         * 当前除了文件消息外（文件消息放的是{@link FileMeta}对象），其它消息类型存放的都是文本内容。
         * */
        this.text = null;
        /** 消息类型 */
        this.msgType = MsgType.TYPE_TEXT;
        /** 消息所对应的原始协议包指纹，目前只在发出的消息对象中有意义 */
        this.fingerPrintOfProtocal = null;
        /** 消息所对应的群聊发送者发出的原始包协议包指纹，目前只在收到的消息对象中有意义，且仅用于群聊消息时作为消息"撤回"功能的匹配依据 */
        this.fingerPrintOfParent = null;

        /** true表示是发出的消息，否则表示收到的消息 */
        this.isOutgoing = false;
        //======================================================== 核心数据字段 END

        //======================================================== 专用于BBS/群聊消息的核心数据字段 START
        ///**
        // * 目前本字段仅用于记录BBS消息发送者的uid.且此uid主要用于获取该用户头像、查看该人员人息等之用.
        // * @since 2.4
        // * */
        //private String uidForBBSCome = null;
        /**
         * 目前本字段仅用于记录BBS消息发送者的头像存放于服务端的文件名.此文件名将用于本地缓存时使用.
         * @since 2.4
         * */
        this.userAvatarFileNameForBBSCome = null;
        //======================================================== 专用于BBS/群聊消息的核心数据字段 START
    };


    var Factory = function(argument){
        //
    };

    /**
     * 为“收到的”消息，构造聊天界面消息内客列表UI的元数据（构建而成的ChatMsgEntity对象仅用于UI显示时，别无它用）。
     *
     * @param fromUid {String} 发送方uid
     * @param nickName {String} 昵称
     * @param msg {String} 消息内容
     * @param time {long} 时间戳
     * @param msgType {int} 聊天消息类型
     * @param fingerPring {String} 收到消息/指令的指纹码
     *
     */
    Factory.prototype.prepareRecievedMessage = function(fromUid, nickName, msg, time, msgType, fingerPring)
    {
        // 强转聊天消息类型：js中的switch语句，在匹配时不会进行类型转换，会使用“===”的方式进行比
        // 较，请确保msgType参数传过来时必须是显示转换为int后的结果（因为服务端的http接口拉过
        // 来的数据时，msgType使用的是String类型）！
        msgType = parseInt(msgType);
        msg = msg.replace(new RegExp('\n', 'g'), '<br/>');
        msg = msg.replace(/[\r|\t]/g,"")
        // 注意：js中的switch语句，在匹配时不会进行类型转换，会使用“===”的方式进行比较，请确保msgType参数传过来时必须是显示转换为int后的结果！
        switch(msgType)
        {
            case  9:
                return this.createChatMsgEntity_COME_TEXT(fromUid, nickName, msg, time, fingerPring,"9");
            case  10:
                return this.createChatMsgEntity_COME_TEXT(fromUid, nickName, msg, time, fingerPring,"10");
            case  11:
                return this.createChatMsgEntity_COME_TEXT(fromUid, nickName, msg, time, fingerPring,"11");
            case  12:
                return this.createChatMsgEntity_COME_TEXT(fromUid, nickName, msg, time, fingerPring,"12");
            case  13:
                return this.createChatMsgEntity_COME_TEXT(fromUid, nickName, msg, time, fingerPring,"13");
            case MsgType.TYPE_IMAGE:
                return this.createChatMsgEntity_COME_IMAGE(fromUid, nickName, msg, time, fingerPring);
            case MsgType.TYPE_VOICE:
                return this.createChatMsgEntity_COME_VOICE(fromUid, nickName, msg, time, fingerPring);
            case MsgType.TYPE_FILE: {
                // 文件消息的内容体是FileMeta对象的JSON形式
                var fm = JSON.parse(msg);
                return this.createChatMsgEntity_COME_FILE(fromUid, nickName
                    , fm != null ? fm.fileName : ""
                    , fm != null ? fm.fileMd5 : ""
                    , fm != null ? fm.fileLength : 0
                    , time
                    , fingerPring);
            }
            case MsgType.TYPE_GIFT$SEND:
                return this.createChatMsgEntity_COME_GIFT$FOR$SEND(fromUid, nickName, msg, time, fingerPring);
            case MsgType.TYPE_GIFT$GET:
                return this.createChatMsgEntity_COME_GIFT$FOR$GET(fromUid, nickName, msg, time, fingerPring);
            case MsgType.TYPE_SYSTEAM$INFO:
                return this.createSystemMsgEntity_TEXT(msg, time, fingerPring);
            case MsgType.TYPE_SHORTVIDEO: {
                // 短视频消息的内容体是FileMeta对象的JSON形式
                var fm = JSON.parse(msg);
                return this.createChatMsgEntity_COME_SHORTVIDEO(fromUid, nickName
                    , fm != null ? fm.isMovie : ""
                    , fm != null ? fm.movieCoverUrl : ""
                    , fm != null ? fm.movieUrl : ""
                    , fm != null ? fm.durationString : ""
                    , fm != null ? fm.fileName : ""
                    , fm != null ? fm.fileMd5 : ""
                    , fm != null ? fm.fileLength : 0
                    , time
                    , fingerPring);
            }
            case MsgType.TYPE_CONTACT: {
                // 名片消息的内容体是ContactMeta对象的JSON形式
                var cm = JSON.parse(msg);
                return this.createChatMsgEntity_COME_CONTACT(fromUid, nickName
                    , cm.uid
                    , cm.nickName
                    , time
                    , fingerPring);
            }
            case MsgType.TYPE_LOCATION: {
                // 位置消息的内容体是LocationMeta对象的JSON形式
                var lm = JSON.parse(msg);
                return this.createChatMsgEntity_COME_LOCATON(fromUid, nickName
                    , lm != null ? lm.locationTitle : "位置"
                    , lm.locationContent
                    , lm != null ? lm.longitude : 0
                    , lm != null ? lm.latitude : 0
                    , null
                    , time
                    , fingerPring);
            }
            case MsgType.TYPE_REVOKE:
                return this.createChatMsgEntity_COME_REVOKE(fromUid, nickName, msg, time, fingerPring);
            default:
                return this.createChatMsgEntity_COME_TEXT(fromUid, nickName, msg, time, fingerPring);
        }
    };

    /**
     * 为“发出的”消息，构造聊天界面消息内客列表UI的元数据（构建而成的ChatMsgEntity对象仅用于UI显示时，别无它用）。
     *
     * @param msg
     * @param time
     * @param fingerPrint
     * @param msgType
     */
    Factory.prototype.prepareSendedMessage = function(msg, time, fingerPrint, msgType)
    {
        // 强转聊天消息类型：js中的switch语句，在匹配时不会进行类型转换，会使用“===”的方式进行比
        // 较，请确保msgType参数传过来时必须是显示转换为int后的结果（因为服务端的http接口拉过
        // 来的数据时，msgType使用的是String类型）！
        msgType = parseInt(msgType);
        msg = msg.replace(new RegExp('\n', 'g'), '<br/>');
        msg = msg.replace(/[\r|\t]/g,"")
        switch(msgType)
        {
            case 9:
                return this.createChatMsgEntity_TO_TEXT_minApp(msg, time, fingerPrint,'9');
            case 10:
                return this.createChatMsgEntity_TO_TEXT_minApp(msg, time, fingerPrint,'10');
            case 11:
                return this.createChatMsgEntity_TO_TEXT_minApp(msg, time, fingerPrint,'11');
            case 12:
                return this.createChatMsgEntity_TO_TEXT_minApp(msg, time, fingerPrint,'12');
            case 13:
                return this.createChatMsgEntity_TO_TEXT_minApp(msg, time, fingerPrint,'13');
            case MsgType.TYPE_IMAGE:
                return this.createChatMsgEntity_TO_IMAGE(msg, time, fingerPrint);
            case MsgType.TYPE_VOICE:
                return this.createChatMsgEntity_TO_VOICE(msg, time, fingerPrint);
            case MsgType.TYPE_FILE: {
                // 文件消息的内容体是FileMeta对象的JSON形式
                var fm = JSON.parse(msg);
                return this.createChatMsgEntity_TO_FILE(
                      fm != null ? fm.fileName : ""
                    , fm != null ? fm.fileMd5 : ""
                    , fm != null ? fm.fileLength : 0
                    , time
                    , fingerPrint);
            }
            case MsgType.TYPE_GIFT$SEND:
                return this.createChatMsgEntity_TO_GIFT$FOR$SEND(msg, time, fingerPrint);
            case MsgType.TYPE_GIFT$GET:
                return this.createChatMsgEntity_TO_GIFT$FOR$GET(msg, time, fingerPrint);
            case MsgType.TYPE_SYSTEAM$INFO:
                return this.createSystemMsgEntity_TEXT(msg, time, fingerPrint);
            case MsgType.TYPE_SHORTVIDEO: {
                // 短视频消息的内容体是FileMeta对象的JSON形式
                var fm = JSON.parse(msg);
                return this.createChatMsgEntity_TO_SHORTVIDEO(
                    fm != null ? fm.isMovie : ""
                    , fm != null ? fm.movieCoverUrl : ""
                    , fm != null ? fm.movieUrl : ""
                    , fm != null ? fm.durationString : ""
                    ,fm != null ? fm.fileName : ""
                    , fm != null ? fm.fileMd5 : ""
                    , fm != null ? fm.fileLength : 0
                    , time
                    , fingerPrint);
            }
            case MsgType.TYPE_CONTACT: {
                // 名片消息的内容体是ContactMeta对象的JSON形式
                var cm = JSON.parse(msg);
                return this.createChatMsgEntity_TO_CONTACT(
                      cm.uid
                    , cm.nickName
                    , time
                    , fingerPrint);
            }
            case MsgType.TYPE_LOCATION: {
                // 位置消息的内容体是LocationMeta对象的JSON形式
                var lm = JSON.parse(msg);
                return this.createChatMsgEntity_TO_LOCATION(
                    lm != null ? lm.locationTitle : "位置"
                    , lm.locationContent
                    , lm != null ? lm.longitude : 0
                    , lm != null ? lm.latitude : 0
                    , time
                    , fingerPrint);
            }
            case MsgType.TYPE_REVOKE:
                return this.createChatMsgEntity_TO_REVOKE(msg, time, fingerPrint);
            default:
                return this.createChatMsgEntity_TO_TEXT(msg, time, fingerPrint);
        }
    };

    Factory.prototype.createChatMsgEntity_TO_TEXT_minApp = function(message, time, fingerPrint,msgType=''){
        var chatMsgEntityObj = this.createChatMsgEntity_COME_TEXT(IMSDK.getLoginInfo().loginUserId, "我", message, time, fingerPrint,msgType);
        chatMsgEntityObj.isOutgoing = true;
        return chatMsgEntityObj;
    };

    Factory.prototype.createChatMsgEntity_TO_TEXT = function(message, time, fingerPrint, msgType=''){
        var chatMsgEntityObj = this.createChatMsgEntity_COME_TEXT(IMSDK.getLoginInfo().loginUserId, "我", message, time, fingerPrint,msgType);
        chatMsgEntityObj.isOutgoing = true;
        return chatMsgEntityObj;
    };

    Factory.prototype.createChatMsgEntity_TO_IMAGE = function(fileName, time, fingerPrint){
        var chatMsgEntityObj = this.createChatMsgEntity_COME_IMAGE(IMSDK.getLoginInfo().loginUserId, "我", fileName, time, fingerPrint);
        chatMsgEntityObj.isOutgoing = true;
        return chatMsgEntityObj;
    };

    Factory.prototype.createChatMsgEntity_TO_VOICE = function(fileName, time, fingerPrint){
        var chatMsgEntityObj = this.createChatMsgEntity_COME_VOICE(IMSDK.getLoginInfo().loginUserId, "我", fileName, time, fingerPrint);
        chatMsgEntityObj.isOutgoing = true;
        return chatMsgEntityObj;
    };

    Factory.prototype.createChatMsgEntity_TO_GIFT$FOR$SEND = function(giftIdent, time, fingerPrint){
        var chatMsgEntityObj = this.createChatMsgEntity_COME_GIFT$FOR$SEND(IMSDK.getLoginInfo().loginUserId, "我", giftIdent, time, fingerPrint);
        chatMsgEntityObj.isOutgoing = true;
        return chatMsgEntityObj;
    };

    Factory.prototype.createChatMsgEntity_TO_GIFT$FOR$GET = function(giftIdent, time, fingerPrint){
        var chatMsgEntityObj = this.createChatMsgEntity_COME_GIFT$FOR$GET(IMSDK.getLoginInfo().loginUserId, "我", giftIdent, time, fingerPrint);
        chatMsgEntityObj.isOutgoing = true;
        return chatMsgEntityObj;
    };

    Factory.prototype.createChatMsgEntity_TO_FILE = function(fileName, fileMd5, fileLength, time, fingerPrint){
        var chatMsgEntityObj = this.createChatMsgEntity_COME_FILE(IMSDK.getLoginInfo().loginUserId, "我", fileName, fileMd5, fileLength, time, fingerPrint);
        chatMsgEntityObj.isOutgoing = true;
        return chatMsgEntityObj;
    };

    Factory.prototype.createChatMsgEntity_TO_SHORTVIDEO = function(isMovie,movieCoverUrl,movieUrl,durationString,fileName, fileMd5, fileLength, time, fingerPrint){
        var chatMsgEntityObj = this.createChatMsgEntity_COME_SHORTVIDEO(IMSDK.getLoginInfo().loginUserId, "我", isMovie,movieCoverUrl,movieUrl,durationString,fileName, fileMd5, fileLength, time, fingerPrint);
        chatMsgEntityObj.isOutgoing = true;
        return chatMsgEntityObj;
    };

    Factory.prototype.createChatMsgEntity_TO_CONTACT = function(theUid, theNickName, time, fingerPrint){
        var chatMsgEntityObj = this.createChatMsgEntity_COME_CONTACT(IMSDK.getLoginInfo().loginUserId, "我", theUid, theNickName, time, fingerPrint);
        chatMsgEntityObj.isOutgoing = true;
        return chatMsgEntityObj;
    };

    Factory.prototype.createChatMsgEntity_TO_LOCATION = function(thLocationTitle, thLocationContent, thLongitude, thLatitude, time, fingerPrint){

        var chatMsgEntityObj = this.createChatMsgEntity_COME_LOCATON(IMSDK.getLoginInfo().loginUserId, "我"
            , thLocationTitle, thLocationContent, thLongitude, thLatitude, null
            , time, fingerPrint);
        chatMsgEntityObj.isOutgoing = true;
        return chatMsgEntityObj;
    };

    Factory.prototype.createChatMsgEntity_TO_TEXT = function(message, time, fingerPrint,msgType=''){
        var chatMsgEntityObj = this.createChatMsgEntity_COME_TEXT(IMSDK.getLoginInfo().loginUserId, "我", message, time, fingerPrint,msgType);
        chatMsgEntityObj.isOutgoing = true;
        return chatMsgEntityObj;
    };

    Factory.prototype.createChatMsgEntity_TO_REVOKE = function(message, time, fingerPrint){
        var chatMsgEntityObj = this.createChatMsgEntity_COME_REVOKE(IMSDK.getLoginInfo().loginUserId, "我", message, time, fingerPrint);
        chatMsgEntityObj.isOutgoing = true;
        return chatMsgEntityObj;
    };

    Factory.prototype.createChatMsgEntity_COME_TEXT = function(fromUid, nickName, message, time, fingerPrint, msgType=''){

        var chatMsgEntityObj = new ChatMsgEntityObj();
        chatMsgEntityObj.uid = fromUid;
        chatMsgEntityObj.name = nickName;
        chatMsgEntityObj.date = time <= 0?RBChatUtils.getCurrentUTCTimestamp():time;
        chatMsgEntityObj.text = message;
        chatMsgEntityObj.fingerPrintOfProtocal = fingerPrint;
        chatMsgEntityObj.msgType = msgType.length > 0 ? (msgType -0): MsgType.TYPE_TEXT;
        chatMsgEntityObj.isOutgoing = false;
        return chatMsgEntityObj;
    };

    Factory.prototype.createChatMsgEntity_COME_IMAGE = function(fromUid, nickName, fileName, time, fingerPrint){

        var chatMsgEntityObj  = new ChatMsgEntityObj();
        chatMsgEntityObj.uid = fromUid;
        chatMsgEntityObj.name = nickName;
        chatMsgEntityObj.date = time <= 0?RBChatUtils.getCurrentUTCTimestamp():time;
        // 当是图片消息时，message里存放的就是图片所存放于服务端的文件名（原图而非缩略图的文件名哦）
        chatMsgEntityObj.text = fileName;
        chatMsgEntityObj.fingerPrintOfProtocal = fingerPrint;
        chatMsgEntityObj.msgType = MsgType.TYPE_IMAGE;
        chatMsgEntityObj.isOutgoing = false;

        return chatMsgEntityObj;
    };

    Factory.prototype.createChatMsgEntity_COME_VOICE = function(fromUid, nickName, fileName, time, fingerPrint){

        var chatMsgEntityObj  = new ChatMsgEntityObj();
        chatMsgEntityObj.uid = fromUid;
        chatMsgEntityObj.name = nickName;
        chatMsgEntityObj.date = time <= 0?RBChatUtils.getCurrentUTCTimestamp():time;
        // 当是图片消息时，message里存放的就是语音留言所存放于服务端的文件名
        chatMsgEntityObj.text = fileName;
        chatMsgEntityObj.fingerPrintOfProtocal = fingerPrint;
        chatMsgEntityObj.msgType = MsgType.TYPE_VOICE;
        chatMsgEntityObj.isOutgoing = false;

        return chatMsgEntityObj;
    };

    Factory.prototype.createChatMsgEntity_COME_GIFT$FOR$SEND = function(fromUid, nickName, giftIdent, time, fingerPrint){

        var chatMsgEntityObj  = new ChatMsgEntityObj();
        chatMsgEntityObj.uid = fromUid;
        chatMsgEntityObj.name = nickName;
        chatMsgEntityObj.date = time <= 0?RBChatUtils.getCurrentUTCTimestamp():time;
        chatMsgEntityObj.text = giftIdent;
        chatMsgEntityObj.fingerPrintOfProtocal = fingerPrint;
        chatMsgEntityObj.msgType = MsgType.TYPE_GIFT$SEND;
        chatMsgEntityObj.isOutgoing = false;

        return chatMsgEntityObj;
    };

    Factory.prototype.createChatMsgEntity_COME_GIFT$FOR$GET = function(fromUid, nickName, giftIdent, time, fingerPrint){

        var chatMsgEntityObj  = new ChatMsgEntityObj();
        chatMsgEntityObj.uid = fromUid;
        chatMsgEntityObj.name = nickName;
        chatMsgEntityObj.date = time <= 0?RBChatUtils.getCurrentUTCTimestamp():time;
        chatMsgEntityObj.text = giftIdent;
        chatMsgEntityObj.fingerPrintOfProtocal = fingerPrint;
        chatMsgEntityObj.msgType = MsgType.TYPE_GIFT$GET;
        chatMsgEntityObj.isOutgoing = false;

        return chatMsgEntityObj;
    };

    Factory.prototype.createChatMsgEntity_COME_FILE = function(fromUid, nickName, fileName, fileMd5, fileLength, time, fingerPrint){

        var fileMeta = {
            /* 文件名 */
            "fileName"   : fileName,
            /* 文件md5码 */
            "fileMd5"    : fileMd5,
            /* 文件长度（单位：字节） */
            "fileLength" : fileLength
        };

        var chatMsgEntityObj  = new ChatMsgEntityObj();
        chatMsgEntityObj.uid = fromUid;
        chatMsgEntityObj.name = nickName;
        chatMsgEntityObj.date = time <= 0?RBChatUtils.getCurrentUTCTimestamp():time;
        chatMsgEntityObj.text = JSON.stringify(fileMeta);
        chatMsgEntityObj.fingerPrintOfProtocal = fingerPrint;
        chatMsgEntityObj.msgType = MsgType.TYPE_FILE;
        chatMsgEntityObj.isOutgoing = false;

        return chatMsgEntityObj;
    };

    Factory.prototype.createChatMsgEntity_COME_SHORTVIDEO = function(fromUid, nickName,isMovie,movieCoverUrl,movieUrl,durationString, fileName, fileMd5, fileLength, time, fingerPrint){

        var fileMeta = {
            /* 文件名 */
            "fileName"   : fileName,
            /* 文件md5码 */
            "fileMd5"    : fileMd5,
            /* 文件长度（单位：字节） */
            "fileLength" : fileLength,
            isMovie,
            movieCoverUrl,
            movieUrl,
            durationString
        };

        var chatMsgEntityObj  = new ChatMsgEntityObj();
        chatMsgEntityObj.uid = fromUid;
        chatMsgEntityObj.name = nickName;
        chatMsgEntityObj.date = time <= 0?RBChatUtils.getCurrentUTCTimestamp():time;
        chatMsgEntityObj.text = JSON.stringify(fileMeta);
        chatMsgEntityObj.fingerPrintOfProtocal = fingerPrint;
        chatMsgEntityObj.msgType = MsgType.TYPE_SHORTVIDEO;
        chatMsgEntityObj.isOutgoing = false;

        return chatMsgEntityObj;
    };

    Factory.prototype.createChatMsgEntity_COME_CONTACT = function(fromUid, nickName, theUid, theNickName, time, fingerPrint){

        var contactMeta = {
            /* 名片人员的uid */
            "uid"      : theUid,
            /* 名片人员的昵称 */
            "nickName" : theNickName
        };

        var chatMsgEntityObj  = new ChatMsgEntityObj();
        chatMsgEntityObj.uid = fromUid;
        chatMsgEntityObj.name = nickName;
        chatMsgEntityObj.date = time <= 0?RBChatUtils.getCurrentUTCTimestamp():time;
        chatMsgEntityObj.text = JSON.stringify(contactMeta);
        chatMsgEntityObj.fingerPrintOfProtocal = fingerPrint;
        chatMsgEntityObj.msgType = MsgType.TYPE_CONTACT;
        chatMsgEntityObj.isOutgoing = false;

        return chatMsgEntityObj;
    };

    Factory.prototype.createChatMsgEntity_COME_LOCATON = function(fromUid, nickName
        , thLocationTitle, thLocationContent, thLongitude, thLatitude, thPrewviewImgFileName
        , time, fingerPrint){

        var locationMeta = {
            /* 位置主描述 */
            "locationTitle"       : thLocationTitle,
            /* 位置详细描述 */
            "locationContent"     : thLocationContent,
            /* 经度 */
            "longitude"           : thLongitude,
            /* 纬度 */
            "latitude"            : thLatitude,
            /* 地图预览图缓存文件名（此字段目前仅用于app产品中，对于web产品而言暂作保留字段，未实际使用之） */
            "prewviewImgFileName" : thPrewviewImgFileName
        };

        var chatMsgEntityObj  = new ChatMsgEntityObj();
        chatMsgEntityObj.uid = fromUid;
        chatMsgEntityObj.name = nickName;
        chatMsgEntityObj.date = time <= 0?RBChatUtils.getCurrentUTCTimestamp():time;
        chatMsgEntityObj.text = JSON.stringify(locationMeta);
        chatMsgEntityObj.fingerPrintOfProtocal = fingerPrint;
        chatMsgEntityObj.msgType = MsgType.TYPE_LOCATION;
        chatMsgEntityObj.isOutgoing = false;

        return chatMsgEntityObj;
    };

    Factory.prototype.createSystemMsgEntity_TEXT = function(message, time, fingerPrint){

        var chatMsgEntityObj  = new ChatMsgEntityObj();
        chatMsgEntityObj.uid = "0";
        chatMsgEntityObj.name = "";
        chatMsgEntityObj.date = time <= 0?RBChatUtils.getCurrentUTCTimestamp():time;
        chatMsgEntityObj.text = message;
        chatMsgEntityObj.fingerPrintOfProtocal = fingerPrint;
        chatMsgEntityObj.msgType = MsgType.TYPE_SYSTEAM$INFO;
        chatMsgEntityObj.isOutgoing = false;

        return chatMsgEntityObj;
    };

    Factory.prototype.createChatMsgEntity_COME_REVOKE = function(fromUid, nickName, message, time, fingerPrint){

        var chatMsgEntityObj  = new ChatMsgEntityObj();
        chatMsgEntityObj.uid = fromUid;
        chatMsgEntityObj.name = nickName;
        chatMsgEntityObj.date = time <= 0?RBChatUtils.getCurrentUTCTimestamp():time;
        chatMsgEntityObj.text = message;
        chatMsgEntityObj.fingerPrintOfProtocal = fingerPrint;
        chatMsgEntityObj.msgType = MsgType.TYPE_REVOKE;
        chatMsgEntityObj.isOutgoing = false;

        return chatMsgEntityObj;
    };


    return new Factory();
})();
