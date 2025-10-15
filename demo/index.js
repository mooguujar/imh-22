/*
 * Copyright (C) 2021  即时通讯网(52im.net) & Jack Jiang.
 * The MobileIMSDK_H5（MobileIMSDK的标准HTML5版客户端） Project. All rights reserved.
 *
 * 【本产品为著作权产品，请在授权范围内放心使用，禁止外传！】
 *
 * 【本系列产品在国家版权局的著作权登记信息如下】：
 * 1）国家版权局登记名（简称）和证书号：RainbowChat（软著登字第1220494号）
 * 2）国家版权局登记名（简称）和证书号：RainbowChat-Web（软著登字第3743440号）
 * 3）国家版权局登记名（简称）和证书号：RainbowAV（软著登字第2262004号）
 * 4）国家版权局登记名（简称）和证书号：MobileIMSDK-Web（软著登字第2262073号）
 * 5）国家版权局登记名（简称）和证书号：MobileIMSDK（软著登字第1220581号）
 * 著作权所有人：江顺/苏州网际时代信息科技有限公司
 *
 * 【违法或违规使用投诉和举报方式】：
 * 联系邮件：jack.jiang@52im.net
 * 联系微信：hellojackjiang
 * 联系QQ：413980957
 * 官方社区：http://www.52im.net
 */

/**
 * 【基本说明】：
 * 本文件为MobileIMSDK-H5版浏览器端demo的主js文件。
 *
 * 【重要提示】：
 * 本文件不属于MobileIMSDK-H5版核心，仅用于方便随时随地测试验证MobileIMSDK-H5而已，开发者引用sdk时无需带入本文件。
 */

$(function() {

  //************************************************************ 【1】Demo的全局变量定义 START
  // FIXME [配置项] 部署到正式服务器时，以下可能需要重新指定哦（默认地址是官方演示服务，建议连接您自已的服务端）
  //const IM_SERVER_URL = "ws://192.168.99.206:3000/websocket";// MobileIMSDK服务端的WebSocket服务地址（如服务端已开启SSL，此处请使用wss）
  const IM_SERVER_URL = "ws://rbcore.52im.net:3000/websocket"; // MobileIMSDK服务端的WebSocket服务地址（如服务端已开启SSL，此处请使用wss）

  //** Initialize ui variables
  var d = document, w = window;
  var $window = $(window);
  var $loginNameInput = $('#loginNameInput');  // Input for username
  var $loginPswInput = $('#loginPswInput');   // Input for password
  var $loginButton = $('#loginButton');
  var $messages = $('#message');         // Messages area
  var $inputMessage = $('#content');     // Input message input box
  var $sendMessageButton = $('#sendMessageButton');
  var $receiverInput = $('#receiver');   // 消息接收者输入框
  var $loginHint = $('.login_hint');     // 登陆框下方的信息提示区
  //************************************************************ 【1】Demo的全局变量定义 END


  //************************************************************ 【2】设置MobileIMSDK-H5的回调函数 START
  //** 【SDK调用第1步：设置回调函数】// TODO [1]

  // 开启或关闭SDK的核心算法层Log输出，建议仅在调试时设为true
  IMSDK.setDebugCoreEnable(true);
  // 开启或关闭SDK的框架内部Log输出，建议仅在调试时设为true
  IMSDK.setDebugSDKEnable(true);
  // 开启或关闭SDK的框架内部心跳包的Log输出，建议仅在调试时设为true
  IMSDK.setDebugPingPongEnable(true);
  // SDK核心IM框架的敏感度模式设置（默认是MBSenseMode.MODE_15S）
  MBKeepAliveDaemon.setSenseMode(MBSenseMode.MODE_5S);

  // 设置SDK的回调方法➊：用于debug的log输出
  IMSDK.callback_onIMLog = log;
  // 设置SDK的回调方法➋：用于收到聊天消息时在UI上展现出来（事件通知于收到IM消息时）
  IMSDK.callback_onIMData = onIMData;
  // 设置SDK的回调方法➌：服务端对客户端提交的登陆请求处理完成后的回调（事件通知于成功登陆/认证后）
  IMSDK.callback_onIMAfterLoginSucess = onIMAfterLoginSucess;
  // 设置SDK的回调方法➍：客户端的登陆请求被服务端认证失败后的回调（事件通知于 登陆/认证 失败后）
  IMSDK.callback_onIMAfterLoginFailed = onIMAfterLoginFailed;
  // 设置SDK的回调方法➎：网络连接已断开时的回调（事件通知于与服务器的网络断开后）
  IMSDK.callback_onIMDisconnected = onIMDisconnected;
  // 设置SDK的回调方法➏：掉线重连成功后的回调（事件通知于掉线重连成功后）
  IMSDK.callback_onIMReconnectSucess = onIMReconnectSucess;
  // 设置SDK的回调方法➐：本地发出心跳包后的回调通知（本回调并非SDK核心逻辑，开发者可以不需要实现！）
  IMSDK.callback_onIMPing = onIMPing;
  // 设置SDK的回调方法➑：收到服务端的心跳包反馈的回调通知（本回调并非SDK核心逻辑，开发者可以不需要实现！）
  IMSDK.callback_onIMPong = onIMPong;
  // 设置SDK的回调方法➒：消息未送达的回调事件通知
  IMSDK.callback_onMessagesLost = onMessagesLost;
  // 设置SDK的回调方法➓：消息已被对方收到的回调事件通知
  IMSDK.callback_onMessagesBeReceived = onMessagesBeReceived;
  //************************************************************ 【2】设置MobileIMSDK-H5的回调函数 END


  //************************************************************ 【3】Demo的界面点击事件处理 START
  //** 添加键盘事件
  $window.keydown(function (event) {
    // Auto-focus the current input when a key is typed
    if (!(event.ctrlKey || event.metaKey || event.altKey)) {
      if(!IMSDK.isLogined()){
        $inputMessage.focus();
      }
    }
    // When the client hits ENTER on their keyboard
    if (event.which === 13) {
      fireSubmit();
    }
  });

  //** 添加鼠标点击事件
  $loginButton.click(function () {
    fireSubmit();
  });
  $sendMessageButton.click(function () {
    fireSubmit();
  });
  //************************************************************ 【3】Demo的界面点击事件处理 END


  //************************************************************ 【4】Demo的具体功能实现代码 START
  /**
   * 点击登陆界面上“提交”按钮或登陆成功后聊天界面上“发送”按钮时要调用的方法。
   */
  function fireSubmit() {
    // 登陆/认证后的才能发消息
    if (IMSDK.isLogined()) {
      doSend();
    }
    // 没登陆的先登陆再说
    else {
      doLogin();
    }
  }

  /**
   * 执行登陆/连接MobileIMSDK服务端。
   */
  function doLogin () {
    // 登录用户名/id（请确保全局唯一）
    var _loginName = $loginNameInput.val().trim();
    // 登录密码/token
    var _loginPsw = $loginPswInput.val().trim();

    // 要提交给服务端的完整登陆认证信息JSON对象，请确保至少需要loginUserId字段（且字段名不能随意更改）
    // 具体字段见：http://docs.52im.net/extend/docs/api/mobileimsdk/server_tcp/net/x52im/mobileimsdk/server/protocal/c/PLoginInfo.html
    var loginInfo = {loginUserId:_loginName, loginToken:_loginPsw};

    // 先尝试清空前次登陆的提示信息
    log('');

    if (_loginName) {
      log("登陆中....");

      // 【SDK调用第2步：提交登陆/认证信息】// TODO [2]
      IMSDK.loginImpl(loginInfo, IM_SERVER_URL, false);
    }
    else{
      log('请输入登陆用户名！');
    }
  }

  /**
   * 点击“发送”按钮时执行的方法（即发出一条聊天消息）。
   */
  function doSend () {
    var receiver = $receiverInput.val().trim();
    var message = $inputMessage.val().trim();

    // if there is a non-empty message and a socket connection
    if (receiver && message && IMSDK.isOnline()) {
      // 清空输入框
      $inputMessage.val('');

      // tell server to execute 'new message' and send along one parameter
      var p = MBProtocalFactory.createCommonDataSimple(message, IMSDK.getLoginInfo().loginUserId, receiver, -1);
      // 将本地发出的消息显示在消息列表
      onIMData(p);

      // 将消息通过websocket发送出去
      IMSDK.sendData(p);
    } else{
      if(!receiver) {
        window.alert('消息接收者是空的！');
      } else if(!message) {
        window.alert('要发送的内容是空的！');
      } else if(!IMSDK.isOnline()){
        window.alert('online==false, 当前已离线，无法发送消息！');
      }
    }
  }

  /**
   * 添加一条聊天信息到消息列表.
   *
   * 【补充说明】：在当前的演示代码中，本函数将被MobileIMSDK-H5框架回调，请见IMSDK.callback_onIMData 回调函数的设置。
   * 【建议用途】：开发者可在此回调中处理收到的各种IM消息。
   *
   * @param p 完整MobileIMSDK的协议包Protocal对象，MobileIMSDK-H5框架回调时传入（关
   *          于Protocal的定义，详见/libs/mobileimsdk-client-common.js下的createCommonData4函数说明）
   * @param options 保留字段暂未用到，MobileIMSDK-H5框架回调时传入
   */
  function onIMData (p, options) {
    // 是否是“我”发出的消息
    var isme = (p.from == IMSDK.getLoginInfo().loginUserId) ? true : false;
    // 消息内容
    var contentDiv = '<div>'+ p.dataContent+'</div>';
    // 昵称
    var usernameDiv = '<span>'+ p.from+'</span>';

    var section = d.createElement('section');
    // 是本地用户发出的消息
    if(isme){
      // “我”发出的消息状态
      var sendStatusIcon = '<i class=\"weui-loading\" id=\"'+p.fp+'\"></i>';

      section.className = 'user';
      section.innerHTML = sendStatusIcon + contentDiv + usernameDiv;
    }
    // 是接收到的消息
    else {
      section.className = 'service';
      section.innerHTML = usernameDiv + contentDiv;
    }

    // 不应使用appendChild，因$mesage是jQuery对象，它的append方法就相当于DOM的appendChild
    $messages.append(section);
    scrollToBottom();
  }

  /**
   * 登陆/认证成功后要做的事（即首次登陆成功时）。
   *
   * 【补充说明】：在当前的演示代码中，本函数将被MobileIMSDK-H5框架回调，请见IMSDK.callback_onIMAfterLoginSucess 回调函数的设置。
   * 【建议用途】：开发者可在此回调中进行登陆IM服务器成功后的处理。
   */
  function onIMAfterLoginSucess(){
    // 将登出框隐藏并显示登陆成功后的聊天界面
    d.getElementById("showusername").innerHTML = w.IMSDK.getLoginInfo().loginUserId;
    d.getElementById("loginbox").style.display = 'none';
    d.getElementById("chatbox").style.display = 'block';

    // 刷新网络连接情况的ui显录
    refreshConnectionStatus();
  }

  /**
   * 客户端的登陆请求被服务端认证失败后的回调（事件通知于 登陆/认证 失败后）.
   *
   * 【补充说明】：在当前的演示代码中，本函数将被MobileIMSDK-H5框架回调，请见IMSDK.callback_onIMAfterLoginFailed 回调函数的设置。
   * 【建议用途】：开发者可在此回调中提示用户登陆IM服务器失败。
   *
   * @param isReconnect true表示是掉线重连后的认证失败（在登陆其间可能用户的密码信息等发生了变更），否则表示首次登陆时的认证失败；
   */
  function onIMAfterLoginFailed(isReconnect){
    log('对不起，你'+(isReconnect?'自动重连':'登陆')+'IM服务器失败了 ...', false);
  }

  /**
   * 与IM服务端的网络连接断开时要调用的函数。
   *
   * 【补充说明】：在当前的演示代码中，本函数将被MobileIMSDK-H5框架回调，请见IMSDK.callback_disconnected 回调函数的设置。
   * 【建议用途】：开发者可在此回调中处理掉线时的界面状态更新等，比如设置将界面上的“在线”文字更新成“离线”。
   */
  function onIMDisconnected(){
    log('Sorry，你掉线了 ...', false);

    // 刷新网络连接情况的ui显录
    refreshConnectionStatus();
  }

  /**
   * 掉线重连成功时要调用的函数。
   *
   * 【补充说明】：在当前的演示代码中，本函数将被MobileIMSDK-H5框架回调，请见IMSDK.callback_reconnectSucess 回调函数的设置。
   * 【建议用途】：开发者可在此回调中处理掉线重连成功后的界面状态更新等，比如设置将界面上的“离线”文字更新成“在线”。
   */
  function onIMReconnectSucess(){
    log('掉线自动重连成功了！', false);

    // 刷新网络连接情况的ui显录
    refreshConnectionStatus();
  }

  /**
   * 本地发出心跳包后的回调通知（本回调并非MobileIMSDK-H5核心逻辑，开发者可以不需要实现！）。
   *
   * 调用时传入的参数：无参数；
   *
   * 【补充说明】：在当前的代码中，本函数将被MobileIMSDK-H5框架回调，请见IMSDK.callback_onIMPing 回调函数的设置。
   * 【建议用途】：开发者可在此回调中处理底层网络的活动情况。
   */
  function onIMPing(){
    // log('[DEMO] 本地心跳包已发出。', true);
  }

  /**
   * 收到服务端的心跳包反馈的回调通知（本回调并非MobileIMSDK-H5核心逻辑，开发者可以不需要实现！）。
   *
   * 调用时传入的参数：无参数；
   *
   * 【补充说明】：在当前的代码中，本函数将被MobileIMSDK-H5框架回调，请见IMSDK.callback_onIMPong 回调函数的设置。
   * 【建议用途】：开发者可在此回调中处理底层网络的活动情况。
   */
  function onIMPong(){
    // log('[DEMO] 收到服务端的心跳包反馈！', true);

    // 绿色呼吸灯效果（表示心跳在后面正常工作中...）
    setConnectionStatusIconLight(true);
    setTimeout(function(){
      setConnectionStatusIconLight(false);
    }, 500);
  }

  /**
   * 消息未送达的回调事件通知。
   *
   * 【发生场景：比如用户刚发完消息但网络已经断掉了的情况下，表现形式如：就像手机qq或微信一样消息气泡边上会出现红色图标以示没有发送成功）.】
   * 【建议用途：应用层可通过回调中的指纹特征码找到原消息并可以UI上将其标记为“发送失败”以便即时告之用户。】
   *
   * 调用时传入的参数1 {Array<Protocal>}：由框架的QoS算法判定出来的未送达消息列表
   */
  function onMessagesLost(lostMessages) {
    log("[DEMO] 收到了系统的未实时送达事件通知，当前共有"+lostMessages.length+"个包QoS保证机制结束，判定为【无法实时送达】唉😡！(原因是网络状况不佳或对方id不存在)", true);

    // 为这些成功送达的消息设置消息发送状态图标为“发送失败”的图标样式
    if(lostMessages) {
      for (var i = 0; i < lostMessages.length; i++) {
        var p = lostMessages[i];
        if(p && p.fp) {
          var $sendStatusIcon = $('#'+p.fp);
          if($sendStatusIcon.length > 0) {
            $sendStatusIcon.removeClass();
            $sendStatusIcon.addClass('weui-icon-warn weui-icon_msg');
          }
        }
      }
    }
  }

  /**
   * 消息已被对方收到的回调事件通知。
   *
   * 【方法说明】：
   *   目前，判定消息被对方收到是有两种可能：
   *   1) 对方确实是在线并且实时收到了；<br>
   *   2) 对方不在线或者服务端转发过程中出错了，由服务端进行离线存储成功后的反馈（此种情况严格来讲不能算是“已被收到
   *      ”，但对于应用层来说，离线存储了的消息原则上就是已送达了的消息：因为用户下次登陆时肯定能通过HTTP协议取到）。
   *
   * 【建议用途：应用层可通过回调中的指纹特征码找到原消息并可以UI上将其标记为“发送成功”以便即时告之用户。】
   *
   * 调用时传入的参数1 {String}：已被收到的消息的指纹特征码（唯一ID），应用层可据此ID找到原先已发的消息并可在UI是将
   *                            其标记为”已送达“或”已读“以便提升用户体验。
   */
  function onMessagesBeReceived(theFingerPrint) {
    if(theFingerPrint != null) {
      log("[DEMO] 收到了对方已收到消息事件的通知喔😁，fp=" + theFingerPrint, true);

      // 设置消息发送状态图标为“发送成功”的图标样式
      var $sendStatusIcon = $('#'+theFingerPrint);
      if($sendStatusIcon.length > 0) {
        $sendStatusIcon.removeClass();
        $sendStatusIcon.addClass('weui-icon-success weui-icon_msg');
      }
    }
  }

  /**
   * 让浏览器滚动条保持在最低部。
   */
  function scrollToBottom(){
    w.scrollTo(0, $messages.height());
  }

  /**
   * 添加一条登陆debug信息用于提示用户，方便调试。
   *
   * @param content
   */
  function showLoginHint(content){
    if(content && content.length > 0){
      $loginHint.text('🔆 ['+MBUtils.formatDate(new Date(), 'hh:mm:ss.S') + '] ' +content);
    }
    // 空字符串表示清空之前的提示内容
    else{
      // 清空div下的内容
      $loginHint.empty();
    }
  }

  /**
   * 用于显示log信息，方便调试。
   *
   * 【补充说明】：在当前的演示代码中，本函数将被MobileIMSDK-H5框架回调，请见IMSDK.callback_log 回调函数的设置。
   * 【建议用途】: 开发者可在此回调中按照自已的意图打印MobileIMSDK-H5框架中的log，方便调试时使用。
   *
   * @param message 要显示的Log内容
   * @param toConsole true表示显示到浏览器的控制台，否则直接显示到网页前端
   */
  function log (message, toConsole) {

    // var logMsg = '☢ ['+formatDate(new Date(), 'MM/dd hh:mm:ss.S') + '] ' + message;
    var logMsg = toConsole?('☢ ['+MBUtils.formatDate(new Date(), 'MM/dd hh:mm:ss.S') + '] ' + message)
        : ('🔆 ' + message +'<span class="msg-system-time">'+MBUtils.formatDate(new Date(), 'hh:mm:ss.S')+'</span>');
    if(toConsole){
      console.debug(logMsg);
    }
    else {
      // 已登陆则将信息显示在聊天界面
      if(IMSDK.isLogined()) {
        //添加系统消息
        var html = '';
        html += '<div class="msg-system">';
        html += logMsg;
        html += '</div>';
        var section = d.createElement('section');
        section.className = 'system';
        section.innerHTML = html;

        $messages.append(section);
        scrollToBottom();
      }
      // 未登陆时则将信息显示在登陆框下方的提示区
      else {
        showLoginHint(message);
      }
    }
  }
  //************************************************************ 【4】Demo的具体功能实现代码 END


  //************************************************************ 【5】Demo的网络状态ui显示代码 START


  /**
   * 刷新网络连接状态UI显示。
   */
  function refreshConnectionStatus(){
    var currentStatusOBJ = $('#chatbox_header_userinfo');
    // var destOBJ = $('#netstatusicon');

    if(IMSDK.isOnline()){
      currentStatusOBJ.removeClass('net_warn');
      currentStatusOBJ.addClass('net_ok');
      currentStatusOBJ.attr('title', '网络连接：[连接正常]');
      // destOBJ.text('通信正常');
    }
    else{
      currentStatusOBJ.removeClass('net_ok');
      currentStatusOBJ.addClass('net_warn');
      currentStatusOBJ.attr('title', '网络连接：[已断开]');
      // destOBJ.text('连接已断开');
    }
  }

  /**
   * 网络心跳呼吸灯效果。
   *
   * @param isLight true表示显示的黄色“亮”效果
   */
  function setConnectionStatusIconLight(isLight){
    var obj = $('#netstatusicon');

    if(isLight)
      obj.addClass('light');
    else
      obj.removeClass('light');
  }

  //************************************************************ 【6】Demo的网络状态ui显示代码 END

});

