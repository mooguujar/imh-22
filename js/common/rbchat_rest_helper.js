
'use strict';

/**
 * RainbowChat的所有Http Rest接口调用及服务端返回结果解析实用方法。
 *
 * @author Jack Jiang(http://www.52im.net/space-uid-1.html)
 * @version 1.0
 * @since 1.0
 */


(function () {

    // 当前正在排队的请求
    var pendingRequestQueue = []
    // 缓存上次的请求
    var cacheAjaxInfo = {}

    /**
     * 一个通用的RainbowChat-Web http rest接口请求和处理实用方法（本方法使用JSONP方式，可完美支持任何跨域调用问题）。
     * <p>
     *     本方法调用的是基于jQuery-jsonp库，实现了jQuery无法解决跨域调用时的异
     * 常处理问题（jQuery中无法捕获跨域调用时出现的异常）。
     * </p>
     * <p>
     *     本方接口的返回值字段定义以http rest服务端框架中的相关定义为准，请务必与其保持一致。
     * </p>
     *
     * @param processorId、jobDispatchId、actionId、newDataObj、oldDataObj 详见http rest接口报务端的接口处理逻辑（即http MVC框架原理）
     * @param logTag log标签（仅用于log的输出），非必须参数
     * @param fnForSucess 接口成功调用完成后的回调函数
     * @param fnForFail 接口调用失败后的回调函数
     * @param isShowLoadingToast true表示在进行网络请求时会自动显示一个“载入中”的Toast，并在请求完成或出错时取消显示
     */
    var _jsonpFromHttpRestServer = function (processorId, jobDispatchId, actionId
        , newDataObj, oldDataObj, logTag, fnForSucess, fnForFail, isShowLoadingToast,METHOD='GET', needAbort, cacheTime = 10 * 1000) {

        // 打印rest接口的编号，方便与服务端的接口调试
        var printRestNum = function(processorId, jobDispatchId, actionId) {
            var ret = "";
            if(processorId > 0)
                ret += processorId;
            if(jobDispatchId > 0)
                ret += "-"+jobDispatchId;
            if(actionId > 0)
                ret += "-"+actionId;

            return ret;
        };

        var REST_NUM_STR = '接口'+printRestNum(processorId, jobDispatchId, actionId)+'→';

        // 【newData字段内容准备】
        // （如果此字段内容是对象则要转JSON字串并进行url encode，否帖如存在特殊符号http get会出问题的——这是常识）
        var newDataJSON = newDataObj;
        var newDataJSONAfterEncode = null;
        if (newDataObj && !RBChatUtils.isString(newDataObj)) {
            newDataJSON = JSON.stringify(newDataObj);
        }

        // console.log(REST_NUM_STR+'-参数',newDataJSON)
        
        if (newDataJSON) {
            newDataJSONAfterEncode = encodeURIComponent(newDataJSON);// encodeURIComponent也会自动对包括html的格式字符在内的相关字符进行转义处理
        }

        // 【oldData字段内容准备】
        // （如果此字段内容是对象则要转JSON字串并进行url encode ，否帖如存在特殊符号http get会出问题的——这是常识）
        var oldDataJSON = oldDataObj;
        var oldDataJSONAfterEncode = null;
        if (oldDataObj && !RBChatUtils.isString(oldDataObj)) {
            oldDataJSON = JSON.stringify(oldDataObj);
        }
        if (oldDataJSON) {
            oldDataJSONAfterEncode = encodeURIComponent(oldDataJSON);
        }

        RBChatUtils.logToConsole('[AJAX/JSONP-『'+REST_NUM_STR+ logTag + '』准备➊] 马上调用接口，调用时传递的参数为：'
            + 'processorId=' + processorId + ', jobDispatchId=' + jobDispatchId + ', actionId=' + actionId
            + ', newDataJSON=' + newDataJSON + ', oldDataJSON=' + oldDataJSON
            + ', newDataJSONAfterEncode=' + newDataJSONAfterEncode + ', oldDataJSONAfterEncode=' + oldDataJSONAfterEncode
            + ', fnForSucess is null?' + (!fnForSucess) + ', fnForFail is null?' + (!fnForFail)
        );

        // 显示“加载中”提示
        var loadingToastId = -1;
        if(isShowLoadingToast){
            loadingToastId = RBChatToastHelper.showToast_Loading(null);
        }

        var localUserUid = '';
        if(window.IMSDK) {
            localUserUid = IMSDK.getLoginInfo().loginUserId;
            localUserUid = (localUserUid?localUserUid:'');
        }
        // 添加用户token
        let loginInfo = localStorage.getItem('_userInfo');
        let token = '';
        if(loginInfo){
            loginInfo = JSON.parse(loginInfo)
            token = loginInfo.token;
        }

        let request
        if(METHOD == 'POST'){
            request = $.ajax({
                url: window.RBChatConfig.HTTP_REST_URL,
                type: 'POST', // 指定请求类型为 POST
                data:{
                    'processorId':processorId,
                    'jobDispatchId':jobDispatchId,
                    'actionId': actionId,
                    'uid':localUserUid,
                    'format':'jsonp',
                    'jsoncallback':'jsoncallback',
                    'token': token,
                    'newData':newDataJSON
                },
                success: function(response) {
                    if(isShowLoadingToast){
                        RBChatToastHelper.closeToast(loadingToastId);
                    }
                    response = response.replace('jsoncallback(','');
                    response  = response.substring(0,response.length-2);
                    var json = JSON.parse(response);
                     // 解析服务端返回的内容
                     var success = json.success;
                     var returnValueJSONString = json.returnValue;

                     // GET接口正常处理完成并返回
                     if (success === true) {
                         if (fnForSucess) {
                             fnForSucess(returnValueJSONString);
                         }
                     }
                     else {
                         if (fnForFail) {
                             fnForFail(returnValueJSONString);
                         }
                     }
                },
                error: function(xhr, status, error) {
                    console.error('请求失败');
                    console.error(status + ', ' + error);
                }
            });
        }else{
              // 【开始调用HTTP REST接口】
        // 注意：按照jQuery的JSONP实现，此url中的回调函数参数名必须为jsoncallback（
        // jQuery将自动替换成它自已将匿名函数生成的真正回调函数名）
            const _url = window.RBChatConfig.HTTP_REST_URL + '?'
                + 'processorId=' + processorId
                + '&jobDispatchId=' + jobDispatchId
                + '&actionId=' + actionId
                + '&newData=' + newDataJSONAfterEncode
                + '&uid='+ localUserUid + '&format=jsonp&jsoncallback=?&token='+token
            // 上次请求时间低于延迟，走缓存
            if (cacheTime && (cacheAjaxInfo[_url]?.time + cacheTime > Date.now())) {
                // if (cacheTime == -1) return // 不走数据处理逻辑
                // 关闭“加载中”提示
                if (isShowLoadingToast) {
                    RBChatToastHelper.closeToast(loadingToastId);
                }
                if (fnForSucess) {
                    fnForSucess(cacheAjaxInfo[_url].data);
                }
                return
            }
            request = $.ajax({// 注意：使用jQuery自带的$.getJSON、$.ajax等无法捕获跨域情况下的异常，JackJiang使用jquery-json库解决了这个问题
                url: _url
                // uid和token参数当前非必须！
                , type: METHOD
                , cache: false
                , dataType: needAbort ? '' : 'jsonp'
                , timeout: 20000 // 设置超时20秒
                //, data: { yourdata: "data" }
                //, callback: ''
                , success: function (json) {
                    let _json = json
                    if (needAbort) {
                        _json = json.slice(2)
                        _json = _json.slice(0, _json.length - 2)
                        _json = _json = JSON.parse(_json)
                    }
                    // 关闭“加载中”提示
                    if(isShowLoadingToast){
                        RBChatToastHelper.closeToast(loadingToastId);
                    }

                    //try
                    {
                        RBChatUtils.logToConsole('[AJAX/JSONP-『'+REST_NUM_STR+ logTag + '』返回➋] 服务端返回的原始json内容：' + JSON.stringify(json));

                        // 解析服务端返回的内容
                        var success = _json.success;
                        var returnValueJSONString = _json.returnValue;

                        // GET接口正常处理完成并返回
                        if (success === true) {
                            RBChatUtils.logToConsole('[AJAX/JSONP-『'+REST_NUM_STR+ logTag + '』解析后➌] 服务端返回的数据解析后：code='
                                + success + ',returnValue=' + returnValueJSONString);
                            if (cacheTime) {
                                if (cacheAjaxInfo[_url]?.timer) {
                                    clearTimeout(cacheAjaxInfo[_url]?.timer)
                                }
                                const timer = setTimeout(() => {
                                    delete cacheAjaxInfo[_url]
                                }, cacheTime)
                                cacheAjaxInfo[_url] = {
                                    timer,
                                    time: Date.now(),
                                    data: returnValueJSONString
                                }
                            }
                            
                            if (fnForSucess) {
                                fnForSucess(returnValueJSONString);
                            }
                        }
                        else {
                            // 不要用console.error，因为它会中断代码继续向下执行
                            console.warn('[AJAX/JSONP-『'+REST_NUM_STR+ logTag + '』解析后➌] 服务端接口处理完成，但服务端查询出错了：' + returnValueJSONString);
                            if (fnForFail) {
                                fnForFail(returnValueJSONString);
                            }
                        }
                    }
                    //catch (eex) {
                    //    console.warn('[前端-JSONP-' + logTag + '返回➋] 处理服务端的返回结果时出错了，原因：' + JSON.stringify(eex));
                    //    if (fnForFail) {
                    //        fnForFail(JSON.stringify(eex));
                    //    }
                    //}
                }
                , error: function (xhr, textStatus, errorThrown) {
                    // console.log('log-faile', xhr,textStatus,errorThrown)
                    // 关闭“加载中”提示
                    if(isShowLoadingToast){
                        RBChatToastHelper.closeToast(loadingToastId);
                    }

                    // 不要用console.error，因为它会中断代码继续向下执行
                    console.warn('[AJAX/JSONP-『'+REST_NUM_STR+ logTag + '』返回➋] $.jsonp()调用时出错了，原因：' + textStatus
                        + ', 详细：' + JSON.stringify(errorThrown));

                    if (fnForFail) {
                        fnForFail(JSON.stringify(errorThrown));
                    }
                    　　}
            });
        }
        
        if (needAbort) {
            pendingRequestQueue.push(request)
        }
    };


    // rest helper对象！
    var restHelper = {
        // 终止当前队列的请求
        abortPendingRequestQueue: function () {
            if (!pendingRequestQueue.length) return
            pendingRequestQueue.forEach(request => {
                request.abort()
            })
            pendingRequestQueue = []
        },

        /**
         * 【接口1009】HTTP登陆认证请求接口调用.
         *
         * 说明：一个典型的IM系统的登陆，通常会分为2步：即1）通过http的sso单点接口认证身份并返回合
         *      法身份数据（就像本接口所实现的一样）、2）将认证后的身份信息（主要是loginUserId和token）
         *      提交给IM服务器，再由IM服务器进行IM长连接的合法性检查，进而决定是否允许此次socket长连接的建立.
         *
         * @param loginNameStr
         * @param loginPswStr
         * @param fnForSucess
         * @param fnForFail
         */
        submitLoginToServer : function(loginNameStr, loginPswStr, fnForSucess, fnForFail){

            // 要提交给服务端的参数
            var loginInfoObj = {
                loginName  : loginNameStr,
                loginPsw   : loginPswStr,
                deviceInfo : RBChatUtils.getBrowserInfo(),
                osType     : 2,
                // deviceID: 'groupManage'
                deviceID: loginNameStr
            };

            _jsonpFromHttpRestServer(MyProcessorConst.PROCESSOR_LOGIN_4ALL, -1, -1
                , loginInfoObj, null
                , '登陆接口', fnForSucess, fnForFail);
        },
        /**
         * 【【接口1008-2-77】查询指定好友是否在群中userIds:  11,22,33,44 格式，最后不能带个,符号gid:xxxxxx
         *
         *
         * @param fnForSucess
         * @param fnForFail
         */
        submit1008_2_77_Server : function(gid,uids, fnForSucess, fnForFail){

            var params = {
                'userIds': uids.join(','),
                'gid':gid
            }
            _jsonpFromHttpRestServer(1008, 2, 77
                , params, null
                , '查询指定好友是否在群中userIds', fnForSucess, fnForFail,false,'POST');
        },

        /**
         * 【接口1008-2-7】获取本地用户的好友列表接口调用.
         *
         * 返回值为：ArrayList<RosterElementEntity>数组转JSON后的字符串.
         *
         * @param fnForSucess
         * @param fnForFail
         */
        submitGetRosterToServer : function(uid, fnForSucess, fnForFail){

            var loginInfoObj = uid;
            _jsonpFromHttpRestServer(MyProcessorConst.PROCESSOR_LOGIC, JobDispatchConst.LOGIC_ROSTER, 777
                , loginInfoObj, null
                , '好友列表接口', fnForSucess, fnForFail);
        },
          /**
         * 群管id查询
         *
         * @param fnForSucess
         * @param fnForFail
         */
          submitGetGoupMannagersToServer : function(fnForSucess, fnForFail){
            _jsonpFromHttpRestServer(1018, 28,39
                , '', null
                , '群管id查询接口', fnForSucess, fnForFail);
        },

         /**
         * 【接口1008-4-67】短信内容.
         *
         * @param fnForSucess
         * @param fnForFail
         */
         submitSendCmsMsg : function(uid,msg, fnForSucess, fnForFail){
            var localUserInfo = LocalUserInfo.getObj();
            var myUid = ''
            if(localUserInfo){
                // 本地用户的uid
                myUid = localUserInfo.user_uid;
            }
            const j ={
                'adminUserId':myUid,
                'toUserId': uid,
                'content': msg,
            }
            _jsonpFromHttpRestServer(1008, 2, 67
                , JSON.stringify(j), null
                , '发送短信接口', fnForSucess, fnForFail);
        },

         /**
         * 【接口1008-4-67】短信内容.
         *
         * @param fnForSucess
         * @param fnForFail
         */
         submitSendBatchCmsMsg : function(uid,msg, fnForSucess, fnForFail){
            var localUserInfo = LocalUserInfo.getObj();
            var myUid = ''
            if(localUserInfo){
                // 本地用户的uid
                myUid = localUserInfo.user_uid;
            }
            const j ={
                'adminUserId':myUid,
                'toUserIds': uid,
                'content': msg,
            }
            _jsonpFromHttpRestServer(1008, 2, 69
                , JSON.stringify(j), null
                , '发送短信接口', fnForSucess, fnForFail);
        },

         /**
         * 【接口1008-10-70】set离线状态
         *
         * @param fnForSucess
         * @param fnForFail
         */
         setLixianStatus : function(offlineState,fnForSucess, fnForFail){
            var localUserInfo = LocalUserInfo.getObj();
            var myUid = ''
            if(localUserInfo){
                myUid = localUserInfo.user_uid;
            }
            const j ={
                'userId':myUid,
                'offlineState':offlineState,
            }
            _jsonpFromHttpRestServer(1008, 10, 70
                , JSON.stringify(j), null
                , '设置离线状态', fnForSucess, fnForFail);
        },

         /**
         * 【接口1008-4-64】短信内容.
         *
         * @param fnForSucess
         * @param fnForFail
         */
         submitGetMsgRedTime : function(friendUserId,fnForSucess, fnForFail, needAbort){
            var localUserInfo = LocalUserInfo.getObj();
            var myUid = ''
            if(localUserInfo){
                // 本地用户的uid
                myUid = localUserInfo.user_uid;
            }
            const j ={
                'userId': myUid,
                'friendUserId': friendUserId,
            }
            _jsonpFromHttpRestServer(1008, 4, 64
                , JSON.stringify(j), null
                , '获取消息最后一次阅读接口', fnForSucess, fnForFail, false, 'GET', needAbort);
        },

        /**
         * 【接口1008-2-8】更新好友信息中的备注、描述等的接口调用.
         *
         * @param remark {String} 好友备注
         * @param mobile_num {String} 手机号
         * @param more_desc {String} 更多描述
         * @param localUid {String} 本地用户的uid
         * @param friend_user_uid {String} 好友的uid
         * @param fnForSucess {function}
         * @param fnForFail {function}
         */
        submitRosterRemarkModifiyToServer : function(remark, mobile_num, more_desc, localUid, friend_user_uid, fnForSucess, fnForFail) {

            // 要提交给服务端的参数
            var m = {
                'remark'         : remark,
                'mobile_num'     : mobile_num,
                'more_desc'      : more_desc,
                'user_uid'       : localUid,
                'friend_user_uid': friend_user_uid
            };

            _jsonpFromHttpRestServer(MyProcessorConst.PROCESSOR_LOGIC, JobDispatchConst.LOGIC_ROSTER, SysActionConst.ACTION_APPEND2
                , JSON.stringify(m), null
                , '设置好友备注接口', fnForSucess, fnForFail);
        },

        submitMerberRemarkModifiyToServer : function(remark,userId,fnForSucess, fnForFail) {

            // 要提交给服务端的参数
            var m = {
                'memberRemark'         : remark,
                'userId'     : userId
            };

            _jsonpFromHttpRestServer(1008, 3, 116
                , JSON.stringify(m), null
                , '设置会员备注接口', fnForSucess, fnForFail);
        },

        ModifiyTUEDAccountoServer : function(userId, uedUsername,fnForSucess, fnForFail) {

            // 要提交给服务端的参数
            var m = {
                'userId'         : userId,
                'uedUsername'     : uedUsername,
            };

            _jsonpFromHttpRestServer(1008, 10, 40
                , JSON.stringify(m), null
                , '设置好友备注接口', fnForSucess, fnForFail);
        },

        /**
         * 【接口1008-5-7】删除指定的好友接口调用.
         *
         * @param localUserUid 本地用户uid
         * @param selectedFriendUid 要删除的好友uid
         * @param fnForSucess
         * @param fnForFail
         */
        submitDeleteFriendToServer : function(localUserUid, selectedFriendUid, fnForSucess, fnForFail){

            // 要提交给服务端的参数
            var m = {
                'local_uid'  : localUserUid,
                'friend_uid' : selectedFriendUid
            };

            _jsonpFromHttpRestServer(MyProcessorConst.PROCESSOR_LOGIC, JobDispatchConst.LOGIC_DELETE$FRIEND, SysActionConst.ACTION_APPEND1
                , JSON.stringify(m), null
                , '删除好友接口', fnForSucess, fnForFail);
        },

        /**
         * 【接口1008-4-22】删除个人全部聊天消息记录接口调用.
         * 支持：删除一对一好友或陌生人聊天记录（即删除“我”与指定uid用户的记录）、群聊记录
         *
         * @param isDeleteGroupChatting true表示本次删除的是群聊记录，否则删除的是单聊记录
         * @param gid 要删除的群聊id（本参数只在isDeleteGroupChatting=true时有意义）
         * @param localUserUid 本地用户的uid（本参数在isDeleteGroupChatting=true时表示群成员uid，isDeleteGroupChatting=false时表示单聊中的“我”）
         * @param selectedUserUid 要删除的单聊“对方”uid（本参数只在isGroupChatting=false时有意义）
         * @param fnForSucess
         * @param fnForFail
         * @since 4.5
         */
        submitDeleteChattingMsgToServer : function(isDeleteGroupChatting, gid, localUserUid, selectedUserUid, fnForSucess, fnForFail){

            // 要提交给服务端的参数
            var m = null;

            if(isDeleteGroupChatting){
                // 要提交给服务端的参数
                m = {
                    'gid'       : gid,          // 群id
                    'luid'   : localUserUid,    // 提起删除请求的群成员用户uid
                };
            }
            else{
                // 要提交给服务端的参数
                m = {
                    'luid'      : localUserUid,   // local uid（即“我”的uid）
                    'ruid'      : selectedUserUid,// 选中的 uid（即“对方”的uid）
                };
            }

            _jsonpFromHttpRestServer(MyProcessorConst.PROCESSOR_LOGIC, JobDispatchConst.LOGIC_MESSAGES, SysActionConst.ACTION_APPEND4
                , JSON.stringify(m), null
                , '删除个人全部聊天记录接口', fnForSucess, fnForFail);
        },
        // 查询 分类表情列表
        query_face_type_list:function(fnForSucess){
            _jsonpFromHttpRestServer(1018, 29, 107
                , JSON.stringify({}), null
                , '查询小表情分类列表', fnForSucess, null);
        },
         // 查询 分类表情-id 详情列表
         query_face_type_detail_list:function(face_id,fnForSucess){
            _jsonpFromHttpRestServer(1018, 29, 108
                , JSON.stringify({
                    id:face_id
                }), null
                , '查询小表情分类详情列表', fnForSucess, null);
        },
        //查询一个月内未登录的ued会员
        query_month_no_login_width_vip:function(fnForSucess){
            var userId = LocalUserInfo.getUid();
            _jsonpFromHttpRestServer(1008, 3, 114
                , JSON.stringify({
                    userId,
            }), null
                , '查询一个月内未登录的ued会员', fnForSucess, null, true);
        },
        // 批量添加好友
        batch_add_freind:function(friends,fnForSucess){
            var userId = LocalUserInfo.getUid();
            _jsonpFromHttpRestServer(1008, 3, 115
                , JSON.stringify({
                    userId,
                    friendUserIds:friends
            }), null
                , '批量添加好友', fnForSucess, null, true);
        },

        /**
         * 【接口1008-4-23】删除单条聊天消息记录接口调用.
         *
         * @param fpForMessage {String} 被删除消息的指纹码
         * @param fnForSucess
         * @param fnForFail
         * @since 7.3
         */
        submitDeleteChattingSingleMsgToServer : function(fpForMessage, fnForSucess, fnForFail) {

            // 要提交给服务端的参数
            var m = {
                'fp_for_message': fpForMessage
            };

            _jsonpFromHttpRestServer(MyProcessorConst.PROCESSOR_LOGIC, JobDispatchConst.LOGIC_MESSAGES, SysActionConst.ACTION_APPEND5
                , JSON.stringify(m), null
                , '删除单条聊天记录接口', fnForSucess, fnForFail, false);
        },

         /**
         * 【接口1008-26-7】查询首页历史“消息”数据的接口调用。
         *
         * @param localUserUid 被查询者的uid
         * @param startTime 数据查询范围的起始时间（此参数为空表示服务端查询时不区分时间范围），形如：“2019-01-01 10:02:02”
         * @param fnForSucess
         * @param fnForFail
         */
         queryAlarmsHistoryFromServer_2 : function(localUserUid, startTime, fnForSucess, fnForFail) {

            // 要提交给服务端的参数
            var m = {
                'user_uid'       : localUserUid,
                'time' : startTime
            };

            _jsonpFromHttpRestServer(MyProcessorConst.PROCESSOR_LOGIC, 4, 88
                , JSON.stringify(m), null
                , '首页历史\"离线消息\"列表接口', fnForSucess, fnForFail, false);
        },

        /**
         * 【接口1008-26-7】查询首页历史“消息”数据的接口调用。
         *
         * @param localUserUid 被查询者的uid
         * @param startTime 数据查询范围的起始时间（此参数为空表示服务端查询时不区分时间范围），形如：“2019-01-01 10:02:02”
         * @param fnForSucess
         * @param fnForFail
         */
        queryAlarmsHistoryFromServer : function(localUserUid, startTime, page, fnForSucess, fnForFail) {

            // 要提交给服务端的参数
            var m = {
                'uid'       : localUserUid,
                'starttime' : startTime,
                'page': page || 1,
                'size': 400
            };
            _jsonpFromHttpRestServer(MyProcessorConst.PROCESSOR_LOGIC, JobDispatchConst.LOGIC_COMMON_QUERY_MGR, 6
                , JSON.stringify(m), null
                , '首页历史\"消息\"列表接口', fnForSucess, fnForFail, false);
        },
        oos_temp_key : function(fnForSucess, fnForFail) {
            _jsonpFromHttpRestServer(1018, 29, 100
                , JSON.stringify({}), null
                , '查询免打扰', fnForSucess, fnForFail, false);
        },
        /**
         * 查询群免打扰
         * @param {*} fnForSucess 
         * @param {*} fnForFail 
         */
        queryMyNoTip : function(fnForSucess, fnForFail) {
            var userId = LocalUserInfo.getUid();
            // 要提交给服务端的参数
            var m = {
                'userId': userId
            };

            _jsonpFromHttpRestServer(1008, 10, 53
                , JSON.stringify(m), null
                , '查询免打扰', fnForSucess, fnForFail, false);
        },
        cmd_1008_2_70 : function(groupId,friendIds,fnForSucess, fnForFail) {
            var userId = LocalUserInfo.getUid();
            // 要提交给服务端的参数
            var m = {
                'userId': userId,
                'groupId': groupId,
                'friendUserIds': friendIds,
            };

            _jsonpFromHttpRestServer(1008, 2, 70
                , JSON.stringify(m), null
                , '批量设置好友分组', fnForSucess, fnForFail, false);
        },
          /**
         * 设置/取消群免打扰
         * @param {*} fnForSucess 
         * @param {*} fnForFail 
         */
           setMyNoTip : function(type,ope,targetId,fnForSucess, fnForFail) {
            var userId = LocalUserInfo.getUid();
            // 要提交给服务端的参数
            var m = {
                'userId': userId,
                'type': type,
                'ope': ope,
                'targetId': targetId
            };

            _jsonpFromHttpRestServer(1008, 10, 52
                , JSON.stringify(m), null
                , '设置/取消免打扰', fnForSucess, fnForFail, false);
        },
        /**
         * 查询红包
         * @param {*} walletId 
         * @param {*} fnForSucess 
         * @param {*} fnForFail 
         */
        queryWalletIdFromServer : function(walletId, fnForSucess, fnForFail) {

            // 要提交给服务端的参数
            var m = {
                'walletId'       : walletId,
            };

            _jsonpFromHttpRestServer(1018, 29, 42
                , JSON.stringify(m), null
                , '查询红包接口', fnForSucess, fnForFail, false);
        },
         /**
         * 领取红包
         * @param {*} walletId 
         * @param {*} fnForSucess 
         * @param {*} fnForFail 
         */
        recWalletIdFromServer : function(fingerprint,gid,walletId,userId,name, fnForSucess, fnForFail) {

            // 要提交给服务端的参数
            var m = {
                'fingerprint': fingerprint,
                'gid': gid,
                'walletId'       : walletId,
                'userId' : userId,
                'name' : name
            };
            _jsonpFromHttpRestServer(1018, 29, 43
                , JSON.stringify(m), null
                , '查询红包接口', fnForSucess, fnForFail, false);
        },

        /**
         * 【接口1008-26-8】:查询聊天消息记录.
         * 支持：一对一聊天记录的返回（即“我”与指定uid用户的记录）、群聊记录的返回。
         *
         * @param isGroupChatting true表示本次查询的是群聊记录，否则查询的是单聊记录
         * @param gid 要查询的群聊id（本参数只在isGroupChatting=true时有意义）
         * @param localUserUid 本地用户的uid（本参数在isGroupChatting=true时表示群成员uid，isGroupChatting=false时表示单聊中的“我”）
         * @param friendUid 聊天对象的uid（即对方的uid）（本参数只在isGroupChatting=false时有意义）
         * @param orderby 排序方式： 1 表示按消息时间DESC逆序，0 表示按消息时间ASC顺序排序
         * @param starttime 聊天记录查询范围的起始时间（为空表示不区分时间范围），形如：“2019-01-01 10:02:02”
         * @param endtime 聊天记录查询范围的结束时间（为空表示查询截止当前时间），形如：“2019-01-01 10:02:02”
         * @param fnForSucess
         * @param fnForFail
         * @param type 查询历史, 使用starttime2和endtime2
         */
        queryChattingHistoryFromServer : function(isGroupChatting
            , gid, localUserUid, friendUid, orderby, starttime, endtime, fnForSucess, fnForFail, type){

            var m = null;

            if(isGroupChatting){
                // 要提交给服务端的参数
                m = {
                    'gid'       : gid,          // 被查群id
                    'luid'      : localUserUid, // local uid（即“我”的uid）
                    'orderby'   : orderby,      // 排序方式： 1 表示按消息时间DESC逆序，0 表示按消息时间ASC顺序排序
                    'starttime' : starttime,    // 聊天记录查询范围的起始时间（为空表示不区分时间范围），形如：“2019-01-01 10:02:02”
                    'endtime'   : endtime       // 聊天记录查询范围的结束时间（为空表示查询截止当前时间），形如：“2019-01-01 10:02:02”
                };
            }
            else{
                // 要提交给服务端的参数
                m = {
                    'luid'      : localUserUid, // local uid（即“我”的uid）
                    'ruid'      : friendUid,    // remote uid（即“对方”的uid）
                    'orderby'   : orderby,      // 排序方式： 1 表示按消息时间DESC逆序，0 表示按消息时间ASC顺序排序
                    'starttime' : starttime,    // 聊天记录查询范围的起始时间（为空表示不区分时间范围），形如：“2019-01-01 10:02:02”
                    'endtime'   : endtime       // 聊天记录查询范围的结束时间（为空表示查询截止当前时间），形如：“2019-01-01 10:02:02”
                };
            }
            m['limit'] = '30'
            // 使用新参数查询历史
            if (type == 'history') {
                m.starttime = ''
                m.endtime = ''
                m.endtime2 = endtime
            }
            // 手机端，默认加载100条数据
            if(RBChatUtils.isMobile()){
                m['limit'] = '100'
            }
            _jsonpFromHttpRestServer(MyProcessorConst.PROCESSOR_LOGIC, JobDispatchConst.LOGIC_COMMON_QUERY_MGR, SysActionConst.ACTION_APPEND2
                , JSON.stringify(m), null
                , '历史聊天记录接口', fnForSucess, fnForFail, type != 'switch_chat', 'GET', type == 'switch_chat');
        },

        /**
         * 【接口1008-3-8】获取用户/好友的个人信息接口调用.
         *
         * @param use_mail true表示用好友的mail地址查找，否则表示用好友的uid查找
         * @param user_mail 用户或好友的mail地址（use_mail为true时本参数必须不为空哦）
         * @param user_uid 用户或好友的uid（use_mail为false时本参数必须不为空哦）
         * @param fnForSucess
         * @param fnForFail
         * @param isShowLoadingToast true表示在进行网络请求时会自动显示一个“载入中”的Toast，并在请求完成或出错时取消显示
         */
        submitGetUserInfoToServer : function(use_mail, user_mail, user_uid, fnForSucess, fnForFail, isShowLoadingToast, logTAG, needAbort) {

            var myUid = null;

            // 读取本地用户信息
            var localUserInfo = LocalUserInfo.getObj();
            if(localUserInfo){
                // 本地用户的uid
                myUid = localUserInfo.user_uid;
            }

            // 要提交给服务端的参数
            var m = {
                'use_mail'   : use_mail ? "1" : "0", // "1"表示用好友的mail地址查找，否则表示用好友的uid查找
                'friend_mail': user_mail,            // 用户或好友的mail地址（use_mail为true时本参数必须不为空哦）
                'friend_uid' : user_uid,             // 用户或好友的uid（use_mail为false时本参数必须不为空哦）
                'my_uid'     : myUid                 // 查询发起人的uid，这个uid指的是客户端提起这个查询时的当前登陆者uid，指明此uid后本sql将同时提供被查询作为好友的额外信息。本参数可为null（表示不需要查询好友的额外信息）
            };
            _jsonpFromHttpRestServer(MyProcessorConst.PROCESSOR_LOGIC, JobDispatchConst.LOGIC_SNS, SysActionConst.ACTION_APPEND2
                , JSON.stringify(m), null
                , logTAG?logTAG:'查询用户信息接口', fnForSucess, fnForFail, isShowLoadingToast, 'GET', needAbort);
        },
         /**
         * 【接口1016-24-104】查询指定用户所在的所有群列表
         *
         */
         submitGetUserGroupsToServer : function(uid, fnForSucess, fnForFail, isShowLoadingToast, needAbort) {
            var myUid = null;
            // 读取本地用户信息
            var localUserInfo = LocalUserInfo.getObj();
            if(localUserInfo){
                // 本地用户的uid
                myUid = localUserInfo.user_uid;
            }
            // 要提交给服务端的参数
            var m = {
                'adminId'     : uid || myUid                 // 查询发起人的uid，这个uid指的是客户端提起这个查询时的当前登陆者uid，指明此uid后本sql将同时提供被查询作为好友的额外信息。本参数可为null（表示不需要查询好友的额外信息）
            };

            _jsonpFromHttpRestServer(1016, 24, 104
                , JSON.stringify(m), null
                , '查询指定用户所在的所有群列表', fnForSucess, fnForFail, isShowLoadingToast, 'GET', needAbort);
        },
        /**
         * 创建分组
         * @param {*} groupName 
         * @param {*} fnForSucess 
         * @param {*} fnForFail 
         */
        submitCreateFenzu : function(groupName,groupType,fnForSucess, fnForFail) {
            var myUid = null;
            // 读取本地用户信息
            var localUserInfo = LocalUserInfo.getObj();
            if(localUserInfo){
                // 本地用户的uid
                myUid = localUserInfo.user_uid;
            }

            // 要提交给服务端的参数
            var m = {
                'groupName'   : groupName, 
                groupType,
                'userId': myUid,
            };

            _jsonpFromHttpRestServer(1008, 2, 58
                , JSON.stringify(m), null
                , '创建分组', fnForSucess, fnForFail, true);
        },
        /**
         * 移动分组
         * @param {*} groupId 
         * @param {*} friendUserId 
         * @param {*} fnForSucess 
         * @param {*} fnForFail 
         */
        submitMoveFenzu : function(groupId,friendUserId,fnForSucess, fnForFail) {
            var myUid = null;
            // 读取本地用户信息
            var localUserInfo = LocalUserInfo.getObj();
            if(localUserInfo){
                // 本地用户的uid
                myUid = localUserInfo.user_uid;
            }

            // 要提交给服务端的参数
            var m = {
                'groupId'   : groupId, 
                'userId': myUid,
                'friendUserId': friendUserId
            };

            _jsonpFromHttpRestServer(1008, 2, 60
                , JSON.stringify(m), null
                , '移动分组接口', fnForSucess, fnForFail, true);
        },
        /**
         * 修改分组名称
         * @param {*} groupName 
         * @param {*} fnForSucess 
         * @param {*} fnForFail 
         */
        submitModifyFenzu : function(groupId,groupName,groupType,fnForSucess, fnForFail) {
            // 要提交给服务端的参数
            var m = {
                'groupName'   : groupName, 
                'groupId': groupId,
                groupType,
            };

            _jsonpFromHttpRestServer(1008, 2, 59
                , JSON.stringify(m), null
                , '修改分组接口', fnForSucess, fnForFail, true);
        },
         /**
         * 查询分组
         * @param {*} groupName 
         * @param {*} fnForSucess 
         * @param {*} fnForFail 
         */
         queryFenzu : function(fnForSucess, fnForFail) {
            var myUid = null;
            // 读取本地用户信息
            var localUserInfo = LocalUserInfo.getObj();
            if(localUserInfo){
                // 本地用户的uid
                myUid = localUserInfo.user_uid;
            }

            // 要提交给服务端的参数
            var m = {
                'userId': myUid,
            };

            _jsonpFromHttpRestServer(1008, 2, 61
                , JSON.stringify(m), null
                , '查询分组列表', fnForSucess, fnForFail, false);
        },
          /**
         * 删除分组
         * @param {*} groupName 
         * @param {*} fnForSucess 
         * @param {*} fnForFail 
         */
          deleteFenzu : function(groupId,fnForSucess, fnForFail) {
            // 要提交给服务端的参数
            var m = {
                'groupId': groupId,
            };

            _jsonpFromHttpRestServer(1008, 2, 62
                , JSON.stringify(m), null
                , '查询分组列表', fnForSucess, fnForFail, true);
        },
        /**
         *  获取欢迎语
         * @param {*} userId 
         * @param {*} fnForSucess 
         * @param {*} fnForFail 
         */
        submitQueryWelecomToServer : function(userId, fnForSucess, fnForFail) {

             // 要提交给服务端的参数
             var m = {
                'userId': userId,
            };

            _jsonpFromHttpRestServer(1008, 10, 51
                , JSON.stringify(m), null
                , '欢迎提示语', fnForSucess, fnForFail, false);
        },


        /**
         * 【接口1008-10-9】查询个人相册、个人介绍语音留言的完整数据列表（
         * 目前用于客户端个人信息查看界面中显示照片和语音完整列表时使用）的接口调用.
         *
         * @param resourceType 要查询的资源类型：0表示查询个人相册数据、1表示查询个人语音介绍数据
         * @return 返回结果是 2 维数组，子数组单元含义分别是:“resourceId、资源文件名、资源大小(人类可读)
         *          、资源大 小(单位:字节)、被查看数、上传时间”
         */
        queryPhotosOrVoicesListFromServer : function(resourceOfUid, resourceType, fnForSucess, fnForFail) {

            // 要提交给服务端的参数
            var m = {
                'user_uid': resourceOfUid,
                'res_type': resourceType
            };

            _jsonpFromHttpRestServer(MyProcessorConst.PROCESSOR_LOGIC, JobDispatchConst.LOGIC_MGR$PROFILE, SysActionConst.ACTION_APPEND3
                , JSON.stringify(m), null
                , '查询用户'+(('0' == resourceType)?'相册':'语音介绍')+'接口', fnForSucess, fnForFail, true);
        },
        /**
         * 设置欢迎提示语
         * @param {*} welcome 
         * @param {*} fnForSucess 
         * @param {*} fnForFail 
         */
        setWleockFromServer : function(welcome, fnForSucess, fnForFail) {

            var localUserInfo = LocalUserInfo.getObj();
            var myUid = ''
            if(localUserInfo){
                // 本地用户的uid
                myUid = localUserInfo.user_uid;
            }
            // 要提交给服务端的参数
            var m = {
                'userId': myUid,
                ...welcome,
            };

            _jsonpFromHttpRestServer(1008,10,50
                , JSON.stringify(m), null
                , '设置欢迎语接口', fnForSucess, fnForFail, true);
        },
        /**
         *  设置好友开关
         * @param {*} disturb 
         * @param {*} fnForSucess 
         * @param {*} fnForFail 
         */
        setFrendAddFromServer : function(disturb, fnForSucess, fnForFail) {

            var localUserInfo = LocalUserInfo.getObj();
            var myUid = ''
            if(localUserInfo){
                // 本地用户的uid
                myUid = localUserInfo.user_uid;
            }
            // 要提交给服务端的参数
            var m = {
                'userId': myUid,
                'disturb': disturb
            };

            _jsonpFromHttpRestServer(1008,10,49
                , JSON.stringify(m), null
                , '设置添加好友开关接口', fnForSucess, fnForFail, true);
        },
        // 新好友弹框回执
        new_friend_huizhi : function(id) {
            // 要提交给服务端的参数
            var m = {
                'id':id
            };
            _jsonpFromHttpRestServer(1018, 29, 86
                , JSON.stringify(m), null
                , '查询小程序列表', null, null, false);
        },
        // 查询全量小程序列表
        queryMinAppListFromServer : function(fnForSucess, fnForFail) {
            // 要提交给服务端的参数
            var m = {
            
            };
            _jsonpFromHttpRestServer(1018, 28, 34
                , JSON.stringify(m), null
                , '查询小程序列表', fnForSucess, fnForFail, false);
        },
        // 收藏小程序
        collectionMinAppListFromServer : function(userId,appletId,fnForSucess, fnForFail) {
            // 要提交给服务端的参数
            var m = {
                'userId': userId,
                'appletId': appletId,
            };
            _jsonpFromHttpRestServer(1018, 28, 35
                , JSON.stringify(m), null
                , '收藏小程序', fnForSucess, fnForFail, true);
        },
        // 我的小程序
        MyMinAppListFromServer : function(userId,fnForSucess, fnForFail) {
            // 要提交给服务端的参数
            var m = {
                'userId': userId,
            };
            _jsonpFromHttpRestServer(1018, 28, 36
                , JSON.stringify(m), null
                , '收藏小程序', fnForSucess, fnForFail, true);
        },

        /**
         * 【接口1008-3-9】“密记密码”邮件请求接口调用.
         * <p>
         * 注意：因为发送邮件是个比较慢的过程，为了提升客户端体验，此次的接口调用时服务端
         * 返回了只是表示邮件请求已发到服务器，但至于服务器有没有成功发出，那就不知道了，
         * 否则需要等到服务端发送邮件完成的话，会等更多时间，这样就影响用户体验了。
         *
         * @param receiveProcessedMail 接收“忘记密码”处理邮件的邮箱地址
         */
        submitForgotPasswordToServer : function(receiveProcessedMail, fnForSucess, fnForFail) {

            _jsonpFromHttpRestServer(MyProcessorConst.PROCESSOR_LOGIC, JobDispatchConst.LOGIC_SNS, SysActionConst.ACTION_APPEND3
                , receiveProcessedMail, null
                , '密记密码接口', fnForSucess, fnForFail, false);
        },
        // 注册-发送短信验证码
        semdCMSCodeToServer:function(countryCode, phone,businessType){
            var m = {
                'countryCode': countryCode, //国家编码
                'phone' : phone,  // 昵称
                'businessType' : businessType,  //业务编码
            };

            _jsonpFromHttpRestServer(MyProcessorConst.PROCESSOR_CMD_SEND, JobDispatchConst.LOGIC_REGISTER, SysActionConst.ACTION_APPEND1
                , JSON.stringify(m), null
                , '短信接口', null, null, false);
        },
         // 客户维护
         kehuToServer:function(params,fnForSucess, fnForFail){
            var localUserInfo = LocalUserInfo.getObj();
            var myUid = ''
            if(localUserInfo){
                // 本地用户的uid
                myUid = localUserInfo.user_uid;
            }
            var m = {
                'userId': myUid, //国家编码
               ...params
            };

            _jsonpFromHttpRestServer(1008, 2, 66
                , JSON.stringify(m), null
                , '客户维护接口', fnForSucess, fnForFail, false);
        },
         // 密码召回-短信验证码校验
         findPwdCMSCodeToServer:function(countryCode, phone,code,fnForSucess, fnForFail){
            var m = {
                'countryCode': countryCode, //国家编码
                'phone' : phone,  //手机号
                'code' : code,  //验证码
            };
            _jsonpFromHttpRestServer(1102, JobDispatchConst.LOGIC_REGISTER, SysActionConst.ACTION_APPEND1
                , JSON.stringify(m), null
                , '短信接口', fnForSucess, fnForFail, false);
        },
        // 重置密码
        resetPwdToServer:function(phone,pwd,aginpwd,fnForSucess, fnForFail){
            var m = {
                'password': pwd, //国家编码
                'phone' : phone,  //手机号
                'repassword' : aginpwd,  //验证码
            };
            _jsonpFromHttpRestServer(1103, JobDispatchConst.LOGIC_REGISTER, SysActionConst.ACTION_APPEND1
                , JSON.stringify(m), null
                , '短信接口', fnForSucess, fnForFail, false);
        },

        /**
         * 【接口1008-1-7】用户注册接口调用.
         */
        submitRegisterToServer : function(phone,countryCode, emsCode, nickname, user_psw, user_sex, fnForSucess, fnForFail) {

            // 要提交给服务端的参数
            var m = {
                'phone': phone, // 注册邮箱
                'countryCode': countryCode,
                'code': emsCode,
                'nickname' : nickname,  // 昵称
                'user_psw' : user_psw,  // 登陆密码
                'user_sex' : user_sex   // 性别：0 女、1 男
            };

            _jsonpFromHttpRestServer(MyProcessorConst.PROCESSOR_LOGIC, JobDispatchConst.LOGIC_REGISTER, SysActionConst.ACTION_APPEND1
                , JSON.stringify(m), null
                , '注册接口', fnForSucess, fnForFail, false);
        },

        /**
         * 【接口1008-1-25】更新昵称、性别、个性签名、个人其它说明的综合接口.
         */
        submitUserInfoModifiyToServer : function(newNickname, newSex, newWhatsup, newOthercaption, uid, fnForSucess, fnForFail) {

            // 要提交给服务端的参数
            var m = {
                'nickName'  : newNickname,    // 修改后的昵称
                'sex'       : newSex,         // 修改后的性别
                'whats_up'  : newWhatsup,     // 修改后的个性签名
                'user_desc' : newOthercaption,// 修改后的其它说明
                'uid'       : uid             // 被修改者的uid
            };

            _jsonpFromHttpRestServer(MyProcessorConst.PROCESSOR_LOGIC, JobDispatchConst.LOGIC_REGISTER, SysActionConst.ACTION_APPEND7
                , JSON.stringify(m), null
                , '个人信息修改接口', fnForSucess, fnForFail, true);
        },

        /**
         * 【接口1008-1-22】用户What'sUp（个性签名）修改接口调用.
         *
         * @param localUid 本地用户的uid
         * @param whats_up 要修改的个性签名内容
         * @fnForSucess DataFromServer中sucess参数：true表示本次接口成功完成、否则表失败，
         * 			returnValue：1 表示更新成功，否则失败。具体返回值详见接口文档！
         */
        submitUserWhatsUpModifiyToServer : function(localUid, whats_up, fnForSucess, fnForFail) {

            // 要提交给服务端的参数
            var m = {
                'uid'      : localUid, // 本地用户uid
                'whats_up' : whats_up, // 修改后的个性签名
            };

            _jsonpFromHttpRestServer(MyProcessorConst.PROCESSOR_LOGIC, JobDispatchConst.LOGIC_REGISTER, SysActionConst.ACTION_APPEND4
                , JSON.stringify(m), null
                , '个性签名修改接口', fnForSucess, fnForFail, true);
        },

        /**
         * 【接口1008-4-7】获取离线加好友请求接口.
         */
        submitGetOfflineAddFriendsReqToServer : function(localUid, fnForSucess, fnForFail) {

            _jsonpFromHttpRestServer(MyProcessorConst.PROCESSOR_LOGIC, JobDispatchConst.LOGIC_MESSAGES, SysActionConst.ACTION_APPEND1
                , localUid, null
                , '离线加好友请求接口', fnForSucess, fnForFail, true);
        },
          /**
         * 【接口1008-4-57】获取离线加好友请求接口.
         */
           submitGetOfflineAddFriendsReqToServer2 : function(localUid, fnForSucess, fnForFail) {

            _jsonpFromHttpRestServer(MyProcessorConst.PROCESSOR_LOGIC, JobDispatchConst.LOGIC_MESSAGES,57
                , localUid, null
                , '离线加好友请求接口', fnForSucess, fnForFail, true);
        },

        /**
         * 【接口1008-4-9】获取未处理的加好友请求总数.
         */
        submitGetOfflineAddFriendsReqCountToServer : function(localUid, fnForSucess, fnForFail) {

            _jsonpFromHttpRestServer(MyProcessorConst.PROCESSOR_LOGIC, JobDispatchConst.LOGIC_MESSAGES, SysActionConst.ACTION_APPEND3
                , localUid, null
                , '未处理离线好友请求数接口', fnForSucess, fnForFail, false);
        },

        /**
         * 【接口1008-3-25】被添加者【同意】加好友请求的处理接口.
         */
        submitPROCESS_ADD$FRIEND$REQ_B$TO$SERVER_AGREE : function(srcUserUid, localUserUid, localUserNickName, fnForSucess, fnForFail) {

            // 要提交给服务端的参数（本参数即CMDBody4ProcessFriendRequest对象，
            // 详见：http://docs.52im.net/extend/docs/api/rainbowchatserver4_pro/com/x52im/rainbowchat/im/dto/CMDBody4ProcessFriendRequest.html）
            var m = {
                'srcUserUid'        : srcUserUid,        // 发起好友请求的源用户（A）UID
                'localUserUid'      : localUserUid,      // 接收好友请求的目标用户（B）UID，也是本次处理好友请求的发起方
                'localUserNickName' : localUserNickName  // 处理者的昵称：此字段在"拒绝"操作时有用哦.
            };

            _jsonpFromHttpRestServer(MyProcessorConst.PROCESSOR_LOGIC, JobDispatchConst.LOGIC_SNS, SysActionConst.ACTION_APPEND7
                , JSON.stringify(m), null
                , '【同意】加好友处理接口', fnForSucess, fnForFail, true);
        },

        /**
         * 【接口1008-3-25】被添加者【拒绝】加好友请求的处理接口.
         */
        submitPROCESS_ADD$FRIEND$REQ_B$TO$SERVER_REJECT : function(srcUserUid, localUserUid, localUserNickName, fnForSucess, fnForFail) {

            // 要提交给服务端的参数（本参数即CMDBody4ProcessFriendRequest对象，
            // 详见：http://docs.52im.net/extend/docs/api/rainbowchatserver4_pro/com/x52im/rainbowchat/im/dto/CMDBody4ProcessFriendRequest.html）
            var m = {
                'srcUserUid'        : srcUserUid,        // 发起好友请求的源用户（A）UID
                'localUserUid'      : localUserUid,      // 接收好友请求的目标用户（B）UID，也是本次处理好友请求的发起方
                'localUserNickName' : localUserNickName  // 处理者的昵称：此字段在"拒绝"操作时有用哦.
            };

            _jsonpFromHttpRestServer(MyProcessorConst.PROCESSOR_LOGIC, JobDispatchConst.LOGIC_SNS, SysActionConst.ACTION_APPEND8
                , JSON.stringify(m), null
                , '【拒绝】加好友处理接口', fnForSucess, fnForFail, true);
        },

        /**
         * 【接口1008-3-24】用户A发起的添加好友请求的处理接口.
         *
         * @param friendUid 将要被添加的好友uid
         * @param saySomethingToHim 加好友时的验证说明（由请求发出方填写，像QQ一样），为非必填项
         */
        submitAddFriendRequestToServer : function(friendUid, saySomethingToHim, fnForSucess, fnForFail) {

            // 读取本地用户信息
            var localUserInfo = LocalUserInfo.getObj();
            if(!localUserInfo){
                if(fnForFail){
                    fnForFail();
                }
            }

            // 本地用户的uid
            var localUserUid = localUserInfo.user_uid;

            // 要提交给服务端的参数（本参数即CMDBody4AddFriendRequest对象，
            // 详见：http://docs.52im.net/extend/docs/api/rainbowchatserver4_pro/com/x52im/rainbowchat/im/dto/CMDBody4AddFriendRequest.html）
            var m = {
                'friendUserUid': friendUid,        // 将要被添加的好友uid
                'localUserUid' : localUserUid,     // 发起请求的好友uid（即本地用户）
                'desc'         : saySomethingToHim // 加好友时的验证说明（由请求发出方填写，像QQ一样）
            };

            _jsonpFromHttpRestServer(MyProcessorConst.PROCESSOR_LOGIC, JobDispatchConst.LOGIC_SNS, SysActionConst.ACTION_APPEND6
                , JSON.stringify(m), null
                , '发出加好友请求处理接口', fnForSucess, fnForFail, true);
        },
        

        /**
         * 【接口1008-4-8】获取离线聊天消息的接口调用.
         *
         * @param user_uid 离线消息所有者的uid
         * @param from_user_uid 离线消息由谁发送的uid。本参数为null表示取本地用户收到所有离线消息(不区分好友)，否则表示取指定好友发过来的离线消息！
         */
        submitGetOfflineChatMessagesToServer : function(user_uid, from_user_uid, fnForSucess, fnForFail) {

            // 要提交给服务端的参数（详见服务端接口代码或http rest接口文档中的说明）
            var m = {
                'user_uid'      : user_uid,
                'from_user_uid' : from_user_uid,
                "include_fp"    : "1"
            };

            _jsonpFromHttpRestServer(MyProcessorConst.PROCESSOR_LOGIC, JobDispatchConst.LOGIC_MESSAGES, 8
                , JSON.stringify(m), null
                , '离线消息获取接口', fnForSucess, fnForFail, true);
        },

        /**
         * 【接口1008-1-9】修改登陆密码接口调用.
         *
         * @param oldPassword 原密码（用于服务端验证原密码的正确性）
         * @param newPassword 新密码
         * @param localUid 本地用户的uid
         * @return DataFromServer中sucess参数：true表示本次接口成功完成、否则表失败，
         * returnValue：1 表示更新成功，0 表示失败，2 表示原密码不正确。具体返回值详见接口文档！
         */
        submitUserPasswordModifiyToServer : function(oldPassword, newPassword, localUid, fnForSucess, fnForFail) {

            // 要提交给服务端的参数（详见服务端接口代码或http rest接口文档中的说明）
            var m = {
                'uid'     : localUid,
                'old_psw' : oldPassword,
                'psw'     : newPassword
            };

            _jsonpFromHttpRestServer(MyProcessorConst.PROCESSOR_LOGIC, JobDispatchConst.LOGIC_REGISTER, SysActionConst.ACTION_APPEND3
                , JSON.stringify(m), null
                , '修改登陆密码接口', fnForSucess, fnForFail, true);
        },

        /**
         * 【接口1016-25-7】获取用户的群组列表的接口调用.
         *
         * 返回值为：ArrayList<GroupEntity>数组转JSON后的字符串（
         * GroupEntity对象详见：http://docs.52im.net/extend/docs/api/rainbowchatserver4_pro/com/x52im/rainbowchat/http/logic/dto/GroupEntity.html）
         *
         * @param user_uid 要获取群组列表的用户uid
         * @param fnForSucess
         * @param fnForFail
         */
        submitGetGroupsListFromServer : function(user_uid, fnForSucess, fnForFail){

            _jsonpFromHttpRestServer(MyProcessorConst.PROCESSOR_GROUP_CHAT, JobDispatchConst.LOGIC_GROUP_QUERY_MGR, SysActionConst.ACTION_APPEND1
                , user_uid, null
                , '群组列表接口', fnForSucess, fnForFail);
        },

        /**
         * 【接口1016-25-9】查询群成员列表的接口调用.
         *
         * 返回值为：ArrayList<GroupMemberEntity>数组转JSON后的字符串（
         * GroupEntity对象详见：http://docs.52im.net/extend/docs/api/rainbowchatserver4_pro/com/x52im/rainbowchat/http/logic/dto/GroupEntity.html）
         *
         * @param gid 要获取的目标群组id
         * @param fnForSucess
         * @param fnForFail
         */
        submitGetGroupMembersListFromServer : function(gid, fnForSucess, fnForFail){

            _jsonpFromHttpRestServer(MyProcessorConst.PROCESSOR_GROUP_CHAT, JobDispatchConst.LOGIC_GROUP_QUERY_MGR, SysActionConst.ACTION_APPEND3
                , gid, null
                , '群成员列表接口', fnForSucess, fnForFail);
        },

        /**
         * 【接口1016-24-7】创建群组的接口调用.
         *
         * @param localUserUid 创建者（群主）的uid
         * @param localUserNickname 群主昵称
         * @param members 群成员(一维 GroupMemberEntity 对象数组)
         * @return DataFromServer中sucess参数：true表示本次接口成功完成、否则表失败，
         * returnValue：1 表示更新成功，0 表示失败，2 表示原密码不正确。具体返回值详见接口文档！
         */
        submitCreateGroupToServer : function(localUserUid, localUserNickname, members, fnForSucess, fnForFail) {

            // 要提交给服务端的参数（详见服务端接口代码或http rest接口文档中的说明）
            var m = {
                // 创建者（群主）的uid
                'owner_uid'      : localUserUid,
                // 群主昵称
                'owner_nickname' : localUserNickname,
                // 群成员
                'members'        : JSON.stringify(members)
            };

            _jsonpFromHttpRestServer(MyProcessorConst.PROCESSOR_GROUP_CHAT, JobDispatchConst.LOGIC_GROUP_BASE_MGR, SysActionConst.ACTION_APPEND1
                , JSON.stringify(m), null
                , '建群接口', fnForSucess, fnForFail, true);
        },

        /**
         * 【接口1016-24-23】删除群成员或退群接口调用.
         *
         * @param del_opr_uid 本次删除或退群的操作人uid（群主踢人时本参数为群主，如果是用户自已退出退路时本参数为退出者自已）
         * @param del_opr_nickname 本次删除或退群的操作人昵称
         * @param membersBeDelete 要删除或退群的群员（如果只是个人退群时，本参数就是只有一行的2维数组，数组数据内容详见接口文档或服务端代码）
         * @param gid 本次删除发生的群id
         * @return DataFromServer中sucess参数：true表示本次接口成功完成、否则表失败，
         * returnValue：1 表示更新成功，否则失败。具体返回值详见接口文档！
         */
        submitDeleteOrQuitGroupToServer : function(del_opr_uid
            , del_opr_nickname, gid, membersBeDelete, fnForSucess, fnForFail,gname='') {

            // 要提交给服务端的参数（详见服务端接口代码或http rest接口文档中的说明）
            var m = {
                'del_opr_uid'      : del_opr_uid,
                'del_opr_nickname' : del_opr_nickname,
                'gid'              : gid,
                'members'          : JSON.stringify(membersBeDelete)
            };
            if(gname&& gname.length > 0){
                m.ganme=gname
            }
            _jsonpFromHttpRestServer(MyProcessorConst.PROCESSOR_GROUP_CHAT, JobDispatchConst.LOGIC_GROUP_BASE_MGR, SysActionConst.ACTION_APPEND5
                , JSON.stringify(m), null
                , '删除群成员或退群接口', fnForSucess, fnForFail, true);
        },
        // 封禁用户
        fengjinToServer : function(user_id, forbidType, fnForSucess, fnForFail) {

            // 要提交给服务端的参数（详见服务端接口代码或http rest接口文档中的说明）
            var m = {
                'userId'    : user_id,
                'forbidType': forbidType,
                'operatorID': LocalUserInfo.getUid()
            };
            // console.log(m);

            _jsonpFromHttpRestServer(1018, 29, 57
                , JSON.stringify(m), null
                , '封禁接口', fnForSucess, fnForFail, true);
        },
        submitSetManageToServer : function(gid
            , user_id, manage_mark, fnForSucess, fnForFail) {

            // 要提交给服务端的参数（详见服务端接口代码或http rest接口文档中的说明）
            var m = {
                'gid'      : gid,
                'user_id' : user_id,
                'manage_mark' : manage_mark,
            };

            _jsonpFromHttpRestServer(1016, 24, 29
                , JSON.stringify(m), null
                , '设置或者取消管理接口', fnForSucess, fnForFail, true);
        },

        /**
         * 【接口1016-24-24】邀请入群的接口调用.
         *
         * @param invite_uid 邀请发起人的uid
         * @param invite_nickname 邀请发起人的昵称
         * @param invite_to_gid 邀请至群
         * @param members 被邀请的成员（2维数组，数组数据内容详见接口文档或服务端代码）
         * @return DataFromServer中sucess参数：true表示本次接口成功完成、否则表失败，
         * returnValue：1 表示更新成功，否则失败。具体返回值详见接口文档！
         */
        submitInviteToGroupToServer : function(invite_uid, invite_nickname
            , invite_to_gid, members, fnForSucess, fnForFail) {

            // 要提交给服务端的参数（详见服务端接口代码或http rest接口文档中的说明）
            var m = {
                'invite_uid'      : invite_uid,
                'invite_nickname' : invite_nickname,
                'invite_to_gid'   : invite_to_gid,
                'members'         : JSON.stringify(members)
            };

            _jsonpFromHttpRestServer(MyProcessorConst.PROCESSOR_GROUP_CHAT, JobDispatchConst.LOGIC_GROUP_BASE_MGR, SysActionConst.ACTION_APPEND6
                , JSON.stringify(m), null
                , '邀请入群接口', fnForSucess, fnForFail, true, 'GET', true);
        },

        /**
         * 【接口1016-24-25】转让本群（仅开放给群主）接口调用.
         *
         * @param old_owner_uid 原群主uid
         * @param new_owner_uid 新群主uid（即将被转让为群主）
         * @param new_owner_nickname 新群主的昵称
         * @param gid 转让发生的群
         * @return DataFromServer中sucess参数：true表示本次接口成功完成、否则表失败，
         * returnValue：1 表示更新成功，否则失败。具体返回值详见接口文档！
         */
        submitTransferGroupToServer : function(old_owner_uid, new_owner_uid
            , new_owner_nickname, gid, fnForSucess, fnForFail) {

            // 要提交给服务端的参数（详见服务端接口代码或http rest接口文档中的说明）
            var m = {
                'old_owner_uid'      : old_owner_uid,
                'new_owner_uid'      : new_owner_uid,
                'new_owner_nickname' : new_owner_nickname,
                'g_id'               : gid
            };

            _jsonpFromHttpRestServer(MyProcessorConst.PROCESSOR_GROUP_CHAT, JobDispatchConst.LOGIC_GROUP_BASE_MGR, SysActionConst.ACTION_APPEND7
                , JSON.stringify(m), null
                , '转让群主接口', fnForSucess, fnForFail, true);
        },

        /**
         * 【接口1016-25-8】查询群基本信息的接口调用.
         *
         * @param gid 查询的群id
         * @param myUserId 非必须参数，如果本参数不为空，则表示要同时把”我“在该群中的昵称给查出来，否则不需要查
         */
        submitGetGroupInfoToServer : function(gid, myUserId, fnForSucess, fnForFail) {

            // 要提交给服务端的参数（详见服务端接口代码或http rest接口文档中的说明）
            var m = {
                'gid'        : gid,
                'my_user_id' : myUserId
            };

            _jsonpFromHttpRestServer(MyProcessorConst.PROCESSOR_GROUP_CHAT, JobDispatchConst.LOGIC_GROUP_QUERY_MGR, SysActionConst.ACTION_APPEND2
                , JSON.stringify(m), null
                , '查询群信息接口', fnForSucess, fnForFail, false);
        },
        submitForbidToServer : function(gid,gname, forbidStatus, fnForSucess, fnForFail) {

            // 要提交给服务端的参数（详见服务端接口代码或http rest接口文档中的说明）
            var m = {
                'gid'        : gid,
                'gname': gname,
                'forbid_status' : forbidStatus
            };

            _jsonpFromHttpRestServer(1016, 24, 28
                , JSON.stringify(m), null
                , '查询群信息接口', fnForSucess, fnForFail, true);
        },

        /**
         * 【接口1016-24-26】解散群（仅开放给群主）接口调用.
         *
         * @param owner_uid 群主uid
         * @param gid 将要被解散的群
         * @return DataFromServer中sucess参数：true表示本次接口成功完成、否则表失败，
         * returnValue：1 表示更新成功，否则失败（其中2表示解散发起人已不是群主，本次解散失败）。具体返回值详见接口文档！
         */
        submitDismissGroupToServer : function(owner_uid, owner_nickname, gid, fnForSucess, fnForFail) {

            // 要提交给服务端的参数（详见服务端接口代码或http rest接口文档中的说明）
            var m = {
                'owner_uid'      : owner_uid,
                'owner_nickname' : owner_nickname,
                'g_id'           : gid
            };

            _jsonpFromHttpRestServer(MyProcessorConst.PROCESSOR_GROUP_CHAT, JobDispatchConst.LOGIC_GROUP_BASE_MGR, SysActionConst.ACTION_APPEND8
                , JSON.stringify(m), null
                , '解散群接口', fnForSucess, fnForFail, true);
        },

        /**
         * 【接口1016-24-8】修改群名称接口调用.
         *
         * @param group_name 本次要修改成的新群名
         * @param gid 被修改的群id
         * @param modify_by_uid 修改者的uid
         * @param modify_by_nickname 修改者的昵称
         * @return DataFromServer中sucess参数：true表示本次接口成功完成、否则表失败，
         * returnValue：1 表示更新成功，否则失败。具体返回值详见接口文档！
         */
        submitGroupNameModifiyToServer : function(group_name
            , gid, modify_by_uid, modify_by_nickname, fnForSucess, fnForFail) {

            // 要提交给服务端的参数（详见服务端接口代码或http rest接口文档中的说明）
            var m = {
                'group_name'        : group_name,
                'gid'               : gid,
                'modify_by_uid'     : modify_by_uid,
                'modify_by_nickname': modify_by_nickname
            };

            _jsonpFromHttpRestServer(MyProcessorConst.PROCESSOR_GROUP_CHAT, JobDispatchConst.LOGIC_GROUP_BASE_MGR, SysActionConst.ACTION_APPEND2
                , JSON.stringify(m), null
                , '修改群名称接口', fnForSucess, fnForFail, true);
        },

        /**
         * 【接口1016-24-9】修改"我"的群昵称接口调用.
         *
         * @param nickname_ingroup 新的群内昵称
         * @param gid 我所在的群id
         * @param user_uid 被修改的用户uid
         * @return DataFromServer中sucess参数：true表示本次接口成功完成、否则表失败，
         * returnValue：1 表示更新成功，否则失败。具体返回值详见接口文档！
         */
        submitGroupNickNameModifiyToServer : function(nickname_ingroup
            , gid, user_uid, fnForSucess, fnForFail) {

            // 要提交给服务端的参数（详见服务端接口代码或http rest接口文档中的说明）
            var m = {
                'nickname_ingroup' : nickname_ingroup,
                'gid'              : gid,
                'user_uid'         : user_uid
            };

            _jsonpFromHttpRestServer(MyProcessorConst.PROCESSOR_GROUP_CHAT, JobDispatchConst.LOGIC_GROUP_BASE_MGR, SysActionConst.ACTION_APPEND3
                , JSON.stringify(m), null
                , '修改群昵称接口', fnForSucess, fnForFail, true);
        },

        /**
         * 【接口1016-24-22】修改群公告接口调用.
         *
         * @param g_notice 新的公告
         * @param g_notice_updateuid 本次公告修改人
         * @param gid 被修改的群id
         * @return DataFromServer中sucess参数：true表示本次接口成功完成、否则表失败，
         * returnValue：1 表示更新成功，否则失败。具体返回值详见接口文档！
         */
        submitGroupNoticeModifiyToServer : function(g_notice
            , g_notice_updateuid, gid, fnForSucess, fnForFail) {

            // 要提交给服务端的参数（详见服务端接口代码或http rest接口文档中的说明）
            var m = {
                'g_notice'           : g_notice,
                'g_notice_updateuid' : g_notice_updateuid,
                'g_id'               : gid
            };

            _jsonpFromHttpRestServer(MyProcessorConst.PROCESSOR_GROUP_CHAT, JobDispatchConst.LOGIC_GROUP_BASE_MGR, SysActionConst.ACTION_APPEND4
                , JSON.stringify(m), null
                , '修改群公告接口', fnForSucess, fnForFail, true);
        },
        /**
         * 搜索电影库
         * @param {*} params 
         * @param {*} fnForSucess 
         * @param {*} fnForFail 
         */
        query_moives : function(params, fnForSucess, fnForFail) {
            var m = {
               ...params
            };
            _jsonpFromHttpRestServer(1018, 29, 109
                    , JSON.stringify(m), null
                    , '电影库查询', fnForSucess, fnForFail, false);
        },
         // 群管配置自动加人群
         set_auto_group : function(params, fnForSucess, fnForFail) {
            var m = {
               ...params
            };
            _jsonpFromHttpRestServer(1016, 24, 102
                    , JSON.stringify(m), null
                    , '群管配置自动加人群', fnForSucess, fnForFail, false);
        },
         // 群管查询自动加人群
         query_auto_group : function(params, fnForSucess, fnForFail) {
            var m = {
               ...params
            };
            _jsonpFromHttpRestServer(1016, 24, 103
                    , JSON.stringify(m), null
                    , '群管配置自动加人群', fnForSucess, fnForFail, false);
        },
          // 查询我所在的所有群列表
          query_all_my_group : function(params, fnForSucess, fnForFail) {
            var m = {
               ...params
            };
            _jsonpFromHttpRestServer(1016, 24, 104
                    , JSON.stringify(m), null
                    , '查询我所在的所有群列表', fnForSucess, fnForFail, false);
        },
        // 设置消息置顶
        set_msg_top : function(params, fnForSucess, fnForFail) {
            var m = {
               ...params
            };
            _jsonpFromHttpRestServer(1008, 4, 96
                    , JSON.stringify(m), null
                    , '查询禁言状态接口', fnForSucess, fnForFail, false);
        },
        // 取消置顶
        cancle_msg_top : function(params, fnForSucess, fnForFail) {
            var m = {
               ...params
            };
            _jsonpFromHttpRestServer(1008, 4, 98
                    , JSON.stringify(m), null
                    , '取消单个置顶接口', fnForSucess, fnForFail, false);
        },
         // 取消所有置顶
         cancle_all_msg_top : function(params, fnForSucess, fnForFail) {
            var m = {
               ...params
            };
            _jsonpFromHttpRestServer(1008, 4, 98
                    , JSON.stringify(m), null
                    , '取消所有置顶接口', fnForSucess, fnForFail, false);
        },
        // 设置消息置顶
        query_msg_top : function(groupId, fnForSucess, fnForFail) {
            var m = {
                groupId: groupId,
            };
            _jsonpFromHttpRestServer(1008, 4, 97
                    , JSON.stringify(m), null
                    , '查询禁言状态接口', fnForSucess, fnForFail, false);
        },
        // 设置禁言状态
        set_forbid_status : function(userId,forbidStatus,groupId, fnForSucess, fnForFail) {
            var m = {
                userIds:userId,
                groupId,
                forbidStatus
            };
            _jsonpFromHttpRestServer(1016, 24, 94
                    , JSON.stringify(m), null
                    , '查询禁言状态接口', fnForSucess, fnForFail, false);
        },
        // 查询禁言状态
        query_forbid_status : function(userId,groupId, fnForSucess, fnForFail) {
            var m = {
                userId,
                groupId
            };
            _jsonpFromHttpRestServer(1016, 25, 95
                    , JSON.stringify(m), null
                    , '查询禁言状态接口', fnForSucess, fnForFail, false);
        },    
        // 添加收藏
        add_love_face : function(key, fnForSucess, fnForFail) {
            var m = {
                'userId':  LocalUserInfo.getUid(),
                'key': key,
            };
            _jsonpFromHttpRestServer(1018, 29, 90
                    , JSON.stringify(m), null
                    , '添加收藏接口', fnForSucess, fnForFail, false);
        },
         // 删除收藏
         delete_love_face : function(bid, fnForSucess, fnForFail) {
            var m = {
                'emoteId':  bid,
            };
            _jsonpFromHttpRestServer(1018, 29, 91
                    , JSON.stringify(m), null
                    , '删除收藏接口', fnForSucess, fnForFail, false);
        },
         // 查询收藏
         query_love_face : function(fnForSucess, fnForFail) {
            var m = {
                'userId':  LocalUserInfo.getUid(),
            };
            _jsonpFromHttpRestServer(1018, 29, 92
                    , JSON.stringify(m), null
                    , '查询收藏接口', fnForSucess, fnForFail, false);
        },
        // 查询共同群组列表接口
        showGroups_html : function(user_uid, fnForSucess, fnForFail) {
            var m = {
                'userId': user_uid,
            };
            _jsonpFromHttpRestServer(1016, 25, 54
                    , JSON.stringify(m), null
                    , '共同群组列表接口', fnForSucess, fnForFail, false);
        },
        send_notice_count_num : function(adminId, userId, type, fnForSucess, fnForFail) {
            var m = {
                'adminId': adminId,
                userId,
                type
            };
            _jsonpFromHttpRestServer(1008, 2, 89
                    , JSON.stringify(m), null
                    , '触发告警倒计时接口', fnForSucess, fnForFail, false);
        },
        showDesignatedFriend : function(user_uid, srcuid, fnForSucess, fnForFail) {
            var m = {
                'userId': user_uid,
                'friendUserId': srcuid
            };
            _jsonpFromHttpRestServer(1016, 25, 55
                , JSON.stringify(m), null
                , '共同群组列表接口', fnForSucess, fnForFail, false);
        },
        getCommonFriend : function(user_uid, srcuid, fnForSucess, fnForFail) {
            var m = {
                'userId': user_uid,
                'friendUserId': srcuid
            };
            _jsonpFromHttpRestServer(1008, 2, 68
                , JSON.stringify(m), null
                , '共同群组列表接口', fnForSucess, fnForFail, false);
        },
        // 查询CDN地址
        getFileCDN : function(fnForSucess, fnForFail) {
            var m = {
                // 'userId': user_uid,
                // 'friendUserId': srcuid
            };
            _jsonpFromHttpRestServer(1018, 28, 40
                , JSON.stringify(m), null
                , '查询CDN地址', fnForSucess, fnForFail, false);
        },
        // 专属链接详情
        getFeedBackDetail : function(src_uid, dest_uid, fnForSucess, fnForFail) {
            var m = {
                'src_uid': src_uid,
                'dest_uid': dest_uid
            };
            _jsonpFromHttpRestServer(1008, 3, 118
                , JSON.stringify(m), null
                , '查询CDN地址', fnForSucess, fnForFail, false);
        },
        // 专属链接保存
        saveFeedBackContent : function(src_uid, dest_uid, imgUrls,textContent, fnForSucess, fnForFail) {
            var m = {
                'src_uid': src_uid,
                'dest_uid': dest_uid,
                'imgUrls': imgUrls,
                'textContent': textContent
            };
            _jsonpFromHttpRestServer(1008, 3, 117
                , JSON.stringify(m), null
                , '查询CDN地址', fnForSucess, fnForFail, false);
        },


        // 群管通知 确认在线
        updateNotice : function(noticeId, fnForSucess, fnForFail) {
            // 读取本地用户信息
            var localUserInfo = LocalUserInfo.getObj();
            // 本地用户的uid
            var localUserUid = localUserInfo.user_uid;
            var m = {
                'userUid': localUserUid,
                noticeId
            };
            _jsonpFromHttpRestServer(1008, 31, 6
                , JSON.stringify(m), null
                , '群管通知', fnForSucess, fnForFail, false);
        },
        // 群管通知 获取最新通知信息
        getLastNotice : function(fnForSucess, fnForFail) {
            // 读取本地用户信息
            var localUserInfo = LocalUserInfo.getObj();
            // 本地用户的uid
            var { user_uid, nickname } = localUserInfo;
            var m = {
                'userUid': user_uid,
                nickname
            };
            _jsonpFromHttpRestServer(1008, 31, 5
                , JSON.stringify(m), null
                , '群管通知', fnForSucess, fnForFail, false);
        },

        // 获取配置管理
        getAdminConfig : function(key, fnForSucess, fnForFail) {
            var m = {
                key
            };
            _jsonpFromHttpRestServer(1018, 28, 46
                , JSON.stringify(m), null
                , '后管配置', fnForSucess, fnForFail, false);
        },

        // 查看消息撤回记录
        queryGroupCehuiMsg : function(gid, fnForSucess, fnForFail) {
            var m = {
                gid
            };
            _jsonpFromHttpRestServer(1008, 26, 31
                , JSON.stringify(m), null
                , '消息撤回记录', fnForSucess, fnForFail, false);
        },

        /* function initFileCDN(){
            RBChatRestHelper.getFileCDN(function(data){
                console.log("======6666666=======", {data});
                
            }, function(err){
                console.log("=======7777===",{err});
                
            })
        } */

    };

    window.RBChatRestHelper = restHelper;
})();








