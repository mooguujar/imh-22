
var RBChatLocalUserUI = (function () {

    // 构造器（相当于java里的构造方法）
    var UIModule2 = function (argument){

        if(RBChatUtils.isMobile()){
             // 本地用户头像的Img对象
            this.$avatarImg = $('#im-panel-header-user-avatar-phone');
            // 昵称ui组件
            this.$nickname = $('#im-panel-header-user-showname-phone');
            // 个人签名ui组件
            this.$whatsUp = $('#im-panel-header-user-whatsup-phone');
        }else{
             // 本地用户头像的Img对象
            this.$avatarImg = $('#im-panel-header-user-avatar');
            // 昵称ui组件
            this.$nickname = $('#im-panel-header-user-showname');
            // 个人签名ui组件
            this.$whatsUp = $('#im-panel-header-user-whatsup');
            this.$userUid = $('#im-panel-header-user-uid');
        }
       
    };

    /**
     * 本封装对象的所有初始化动作，放在本函数中执行。
     */
    UIModule2.prototype.init = function () {
        this.initClickShowLocalInfoEvent();
        this.initClickEditWhatsupEvent();
    };

    /**
     * 点击显示本地用户信息的事件处理。
     */
    UIModule2.prototype.initClickShowLocalInfoEvent = function(){
        var fun = function(event){
            // // 读取本地用户信息
            // var localUserInfo = LocalUserInfo.getObj();
            // // 显示之
            // if(localUserInfo){
            //     RBChatDialogHelper.showUserInfo(localUserInfo);
            // }

            // 显用本地用户信息
            RBChatDialogHelper.showLocalUserInfo();
            $('#phone_center').hide();
            $('#personalcenter').show();

        };

        // 点击本地用户的头像
        if(RBChatUtils.isMobile()){
            $('#im-panel-header-user-avatar-parent-phone').click(fun);
            // 点击用本地用户的昵称
            $('#im-panel-header-user-showname-phone').click(fun);
        }else{
            $('#im-panel-header-user-avatar-parent').click(fun);
            // 点击用本地用户的昵称
            $('#im-panel-header-user-info').click(fun);
        }
      
    };

    // 反馈按钮点击事件
    $('#im-panel-header-setup-feedback').click(()=>{
        $('#phone_center').hide();
        $('#kchat-im-panel').hide();
        $('#footer_i').hide();
        $('#feedback').show();    
    });

    /**
     * 点击本地用户的个性签名的事件处理。
     */
    UIModule2.prototype.initClickEditWhatsupEvent = function(){
        var fun = function(event){
            RBChatDialogHelper.showLocalUserWhatsupEdit();
        };

        // 点击个性签名
        this.$whatsUp.click(fun);
    };

    /**
     * 刷新UI的数据内容显示。
     */
    UIModule2.prototype.refresh = function () {

        // 读取本地用户信息
        var localUserInfo = LocalUserInfo.getObj();

        if(localUserInfo){

            // 显示本地用户头像图片
            //this.$avatarImg.attr('src',RBChatUtils.getUserAvatarDownloadURL(localUserInfo.user_uid, true));
            this.refreshAvatarImage();

            // 显示昵称
            this.$nickname.text(localUserInfo.nickname);
            this.$nickname.attr('title', localUserInfo.nickname);

            var whatsUpShow = (localUserInfo.whatsUp?localUserInfo.whatsUp:'编辑个性签名');
            this.$whatsUp.text(whatsUpShow);
            this.$whatsUp.attr('title', '[个性签名] '+whatsUpShow);
            this.$userUid.text('ID: ' + localUserInfo.user_uid);
        }
    };

    /**
     * 单独刷新用户头像图片的显示（比如：用户上传了新头像完成后）。
     */
    UIModule2.prototype.refreshAvatarImage = async function(){
        // 读取本地用户信息
        var localUserInfo = LocalUserInfo.getObj();
        if(localUserInfo){
            const getFileCDN = () => {
                return new Promise((r, j) => {
                    RBChatRestHelper.getFileCDN(function(data){
                        // console.log("======initFileCDN=======", {data});
                        RBChatConfig.FILE_HTTPS_URL = data
                        r()
                    }, function(err){
                        j()
                        console.log("=======initFileCDN===",{err});
                    })
                })
            }
            // 兼容文件cdn还没拿到，再获取一次
            if (!RBChatConfig.FILE_HTTPS_URL && localUserInfo.userAvatarFileName && localUserInfo.userAvatarFileName.length > 0) {
                await getFileCDN()
            }
            // var heade_photo = localUserInfo.userAvatarFileName && localUserInfo.userAvatarFileName.length > 0 ? 'https://oss.nongzhiw.cn/head/'+localUserInfo.userAvatarFileName:'';
            var heade_photo = localUserInfo.userAvatarFileName && localUserInfo.userAvatarFileName.length > 0 ? RBChatConfig.FILE_HTTPS_URL + '/head/'+localUserInfo.userAvatarFileName:'';
            if (this.$avatarImg.attr('src') && this.$avatarImg.attr('src') == heade_photo) return
            // 显示本地用户头像图片
            this.$avatarImg.css('display','')
            this.$avatarImg.attr('src',heade_photo);
            const defaultColor = RBChatUtils.getBgColor(localUserInfo.user_uid)
            const show_t = localUserInfo.nickname && localUserInfo.nickname.length > 0 ? localUserInfo.nickname.substr(0, 1).toUpperCase():'';
            $('#im-panel-header-user-avatar-default').css('background',defaultColor)
            $('#im-panel-header-user-avatar-default').text(show_t)
        }
    };

    /**
     * 刷新本地用户的在线状态UI显示。
     */
    UIModule2.prototype.refreshOnlineStatus = function(){
        var currentStatusOBJ = RBChatUtils.isMobile() ? $('#im-panel-header-user-status-phone'): $('#im-panel-header-user-status');

        if(IMSDK.isOnline()){
            currentStatusOBJ.removeClass('offline');
            currentStatusOBJ.addClass('online');
            currentStatusOBJ.attr('title', '在线状态：[在线]');
        }
        else{
            currentStatusOBJ.removeClass('online');
            currentStatusOBJ.addClass('offline');
            currentStatusOBJ.attr('title', '在线状态：[已离线]');
        }
    };

    /**
     * 刷新主界面左下角网络连接状态UI显示。
     */
    UIModule2.prototype.refreshConnectionStatus = function(){
        var currentStatusOBJ = $('#im-panel-userlist-bottom');
        var destOBJ = $('#im-panel-userlist-bottom-imnetworkstatusdesc');

        if(IMSDK.isOnline()){
            currentStatusOBJ.removeClass('im-panel-userlist-bottom_warn');
            currentStatusOBJ.addClass('im-panel-userlist-bottom_ok');
            currentStatusOBJ.attr('title', '网络连接：[连接正常]');
            destOBJ.text('通信正常');
        }
        else{
            currentStatusOBJ.removeClass('im-panel-userlist-bottom_ok');
            currentStatusOBJ.addClass('im-panel-userlist-bottom_warn');
            currentStatusOBJ.attr('title', '网络连接：[已断开]');
            destOBJ.text('连接已断开');
        }
    };

    UIModule2.prototype.setConnectionStatusIconLight = function(isLight){
        var obj = $('#im-panel-userlist-bottom-imnetworkstatusicon');

        if(isLight)
            obj.addClass('light');
        else
            obj.removeClass('light');
    };

    UIModule2.prototype.showUserLocalPic = function (e) {
        const _el = $(e).parent().find('.im-panel-header-user-avatar-default')
        const _id = $(e).attr('data-uid')
        const _name = $(e).attr('data-name')
        console.log(_el, _id, _name,123124124124)
        const defaultColor = RBChatUtils.getBgColor(_id)
        const show_t = _name && _name.length > 0 ? _name.substr(0, 1).toUpperCase():'';
        _el.css('background',defaultColor)
        _el.text(show_t)
        $(e).css('display', 'none')
        _el.css('display', 'block')
    }

    // 新建本模块对象
    var thisModule = new UIModule2();
    // 调用初始化方法
    thisModule.init();

    return thisModule;// 此种方式用于构造器的方式
})();
