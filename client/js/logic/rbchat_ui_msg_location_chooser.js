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
 * 显示“位置”消息中要用到的地图选择或醒看对话框的工厂函数（调用本函数将新建并返回一个地图选择或显示对话框的新对象）.
 *
 * 【RBChatMsgLocationDialogFactory的代码设计模式和思路说明】：
 *  - 1）RBChatMsgLocationDialogFactory相当于一个函数，此函数的目的是返回一个新的 RBChatMsgLocationDialog
 *      对象，而RBChatMsgLocationDialog 对象才是对话框逻辑的封装实现者。
 *  - 2）调用RBChatMsgLocationDialogFactory时，只需要像普通的JS函数一样调用即可，而且它的返回值每次都是一个新
 *      的RBChatMsgLocationDialog对象。
 *  - 3）RBChatMsgLocationDialogFactory作为函数来独立模块实现，只是为了更好地进行代码封
 *      装，而不至于让消息发送模块的代码显的分散和杂乱而已。
 *
 * 高德地图官方资料：
 * 入门教程：https://lbs.amap.com/api/javascript-api/guide/abc/prepare
 * 开发手册：https://lbs.amap.com/api/javascript-api/reference/core
 * 范例代码：https://lbs.amap.com/api/javascript-api/example/map-lifecycle/map-show
 *
 * @param usedForSelect 用途，true表示用于“位置”消息的选择（发送消息时），否则用于“位置”消息的位置查看（收到的消息）
 * @param locationMeta 本参数仅当 usedForSelect==false时有意义，表示要查看的位置点信
 *                      息（见：rhcgat_cache.js文件中的Factory.prototype.createChatMsgEntity_COME_LOCATON()方法）
 * @returns {RBChatMsgLocationDialog} RBChatMsgLocationDialog对象
 * @constructor
 * @seince 2.0
 */
RBChatMsgLocationDialogFactory = function(usedForSelect, locationMeta){

    // 构造器（相当于java里的构造方法）
    var RBChatMsgLocationDialog = function (a1, a2){

        /** 调用者传进来的参数：本界面的用途(true表示用于位置选择，否则仅用于位置查看) */
        this.usedForSelect = a1;
        this.locationMetaForView = a2;

        RBChatUtils.logToConsole("【位置消息-地图】调用者传进来的参数：usedForSelect="
            +this.usedForSelect+", locationMetaForView="+JSON.stringify(this.locationMetaForView));

        if(this.usedForSelect){
            this.title = "选择要发送的位置";
        }
        else{
            this.title = "查看位置信息";
        }
    };

    /**
     * 在对话框中显示。
     */
    RBChatMsgLocationDialog.prototype.showWithDialog = function(){

        var that = this;
        // 对话框id，为了防止全局取id对象发生冲突，建议必须使用
        var dialogId = RBChatDialogHelper.nextDialogId();

        // 要显示于对话框中的html内容
        var bodyHTML =
            "<div id=\"im-panel-main-chat-locationmsg-map_wrapper\" class=\"locationmsg-map\">"+
            "    <div id=\"im-panel-main-chat-locationmsg-map_container\"></div>"+
            (that.usedForSelect?
                "    <img id=\"im-panel-main-chat-locationmsg-map_centerpinimg\" class=\"center_pin_img\" src=\"../images/chatting_location_current_pin_big_icon.png\"/>":"")+
            "    <div class=\"location_result\">"+
            "        <div class=\"location_result_content\">"+
            "            <h4 id=\"im-panel-main-chat-locationmsg-map_result_title\"></h4>"+
            "            <p><span id=\"im-panel-main-chat-locationmsg-map_result_address\"></span></p>"+
            "        </div>"+
            "        <a id=\"im-panel-main-chat-locationmsg-map_result_btn\" class=\"location_result_btn\" title=\""+(that.usedForSelect?"点击发送此位置！":"在第3方地图产品中查看此位置！")+"\" href=\"#\" onclick=\"return false;\">"+
            (that.usedForSelect?"<img id=\"im-panel-main-chat-locationmsg-map_result_btn_send\" class=\"send\" src=\"../images/chatting_location_viewlocation_navigation_send_ico_nornal.png\" />":
                "                    <img id=\"im-panel-main-chat-locationmsg-map_result_btn_goto\" class=\"goto\" src=\"../images/chatting_location_viewlocation_navigation_with_ico_normal.png\" />")+
            "        </a>"+
            "    </div>"+
            (that.usedForSelect?"":
                "   <a id=\"im-panel-main-chat-locationmsg-map_backToLocation\" class=\"location_backto_btn\" title=\"点击回到之前的位置！\" href=\"#\" onclick=\"return false;\">  "+
                "       <img src=\"../images/chatting_location_gps_black.png\" />"+
                "   </a>")+
            "</div>";

        // 显示对话框
        RBChatDialogHelper.showDialog(that.title
            , "取消"
            , "保存"
            , bodyHTML
            , dialogId
            , null
            , null
            , false
            , null
            , "position: relative;padding: 0;max-height: 1000px;"
            , false
            , false);

        // 初始化地图
        this.initMap();
        // 初始化事件处理
        this.initEventListeners(dialogId);
    };

    /**
     * 初始化地图相关。
     */
    RBChatMsgLocationDialog.prototype.initMap = function(){

        var that = this;

        // 初始化地图对象，加载地图
        var map = new AMap.Map("im-panel-main-chat-locationmsg-map_container", {
            resizeEnable: true
        });

        //** 说明：根据高德JSAPI v2.0的升级要求，以下控制都需要单独加载（地图不再默认自动设置了），
        //** 参见：https://lbs.amap.com/api/jsapi-v2/guide/overlays/toolbar、https://lbs.amap.com/api/jsapi-v2/update
        // 在图面添加工具条控件，工具条控件集成了缩放、平移、定位等功能按钮在内的组合控件
        map.addControl(new AMap.ToolBar({
            visible: true,
            position: {top: '110px', right: '40px'}
        }));
        // 在图面添加工具条方向盘
        map.addControl(new AMap.ControlBar({
            visible: true,
            position: {top: '10px', right: '10px'}
        }));
        // 在图面添加比例尺控件，展示地图在当前层级和纬度下的比例尺
        map.addControl(new AMap.Scale({
            visible: true,
            position: {bottom: '110px', left: '20px'}
        }));

        // 表示用于“位置”的选择（发送位置消息时）
        if(that.usedForSelect) {

            var $btnSendImg = $("#im-panel-main-chat-locationmsg-map_result_btn_send");
            //var $btnGotoImg = $("#im-panel-main-chat-locationmsg-map_result_btn_goto");
            var $centerPinImg = $("#im-panel-main-chat-locationmsg-map_centerpinimg");

            // 设置地图显示放大级别
            map.setZoom(14);

            // 以下代码的作用：获取并移动地图中心到当前位置（因为不像手机有GPS模块，电脑上只能用ip地址定位，常识来说显然会经常有较大误差）
            // 官方文档参考：https://lbs.amap.com/api/jsapi-v2/guide/services/geolocation
            // 官方代码示例：https://lbs.amap.com/demo/jsapi-v2/example/location/browser-location
            map.plugin('AMap.Geolocation', function () {
                var gotoLocalLocation = new AMap.Geolocation({
                    // 是否使用高精度定位，默认：true
                    // 注意：由于众多浏览器已不再支持非https的定位请求，精确定位功能或许只支持https，
                    // 参考：https://blog.csdn.net/Dxy1239310216/article/details/122665964
                    enableHighAccuracy: false,
                    // 设置定位超时时间，默认：无穷大
                    timeout: 10000,
                    // 定位成功后调整地图视野范围使定位位置及精度范围视野内可见，默认：false
//                  zoomToAccuracy: true,
                    // 定位按钮的排放位置,  RB表示右下
                    buttonPosition: 'RB',
                    // 定位按钮与设置的停靠位置的偏移量，默认：[10, 20]
                    offset: [28, 120],
                });

                // 显示右下角的“回到当前位置”高德控件
                map.addControl(gotoLocalLocation);

                // 获取并移动地图中心到当前位置
                // 请参考开发者手册：https://lbs.amap.com/api/javascript-api/reference/location#m_AMap.Geolocation
                gotoLocalLocation.getCurrentPosition(function (status, result) {
                    if (status == 'complete') {
                        // data是具体的定位信息
                        var addrComp = result.addressComponent;
                        // console.log("[地图] 获取并移动到当前位置成功【OK】（中心点：" + map.getCenter() + "，省市区：" + (addrComp.province + "-" + addrComp.city + "-" + addrComp.district) + "）！");
                    }
                    else {
                        that.setResultInfo("精确定位失败："+result.message, "原因是: " + result.originMessage);
                        // console.log("[地图] 获取并移动到当前位置失败了【NO】（失败原因排查信息：" + result.message+"，浏览器返回信息："+result.originMessage);
                    }
                });
            });

            var mapMovestart = function () {
                that.setLoadingInfo();
                $btnSendImg.attr('src', "../images/chatting_location_viewlocation_navigation_send_ico_disable.png");
                $centerPinImg.removeClass('locationmsg-map_center_pin_img_anim');
                that.currentLocationForSelect = null;
            };

            var mapMoveend = function () {
                // console.log("[地图] 地图移动结束！(中心位置现在是：" + map.getCenter() + ")");

                // 地理编码服务（请参考开发者手册：http://lbs.amap.com/api/javascript-api/guide/services/geocoder）
                var geocoder = new AMap.Geocoder({
                    city: "010", // 当前城市默认设为北京，不设地话高德默认是：“全国”
                    radius: 1000 // 范围，默认：500
                });

                function regeoCode() {

                    // 获得地图中心点经纬度
                    var lnglat = map.getCenter();

                    // 逆向地理编码，查询经纬度对应的位置信息
                    // 开发指南请参考：https://lbs.amap.com/api/jsapi-v2/guide/services/geocoder#getAddress
                    // 方法详细返回值：https://lbs.amap.com/api/javascript-api/reference/lnglat-to-address#m_AMap.Geocoder
                    geocoder.getAddress(lnglat, function (status, result) {
                        if (status === 'complete' && result.regeocode) {

                            var address = result.regeocode.formattedAddress;
                            var addressComponent = result.regeocode.addressComponent;

                            // console.log("[地图] 逆向地理编码查询到的地理位置(经度：" + lnglat.getLng() + ", 纬度：" + lnglat.getLat() + ")信息结果是：result.regeocode="
                            //     + JSON.stringify(result.regeocode));

                            var title = addressComponent.building;
                            if (RBChatUtils.isStringEmpty(title)) {
                                title = addressComponent.neighborhood;
                            }
                            if (RBChatUtils.isStringEmpty(title)) {
                                title = (RBChatUtils.isStringEmpty(addressComponent.street) ? "" : addressComponent.street)
                                    + (RBChatUtils.isStringEmpty(addressComponent.streetNumber) ? "" : addressComponent.streetNumber);
                            }
                            if (RBChatUtils.isStringEmpty(title)) {
                                title = addressComponent.township;
                            }
                            if (RBChatUtils.isStringEmpty(title)) {
                                title = "位置";
                            }

                            var content = address;
                            if (RBChatUtils.isStringEmpty(content)) {
                                content = "经度：" + lnglat.getLng() + ", 纬度：" + lnglat.getLat();
                            }

                            that.setResultInfo(title, content);
                            $btnSendImg.attr('src', "../images/chatting_location_viewlocation_navigation_send_ico_nornal.png");
                            $centerPinImg.addClass('locationmsg-map_center_pin_img_anim');
                            that.currentLocationForSelect = lnglat;
                        }
                        else if (status === 'no_data') {
                            that.setResultInfo("提示: 位置信息不存在", "当前经纬度的位置信息已查询完成，但查无数据！");
                        }
                        else {
                            that.setResultInfo("提示: 位置信息查询失败", "原因是: " + result);
                        }
                    });
                }

                regeoCode();
            };

            // 地图移动事件处理，请参考开发者手册：https://lbs.amap.com/api/javascript-api/example/event/event-state
            map.on('movestart', mapMovestart);
//          map.on('mapmove', mapMove);
            map.on('moveend', mapMoveend);// 添加动图移动事件
        }
        // 表示用于位置查看（收到的位置消息时）
        else{
            // 设置地图显示放大级别
            map.setZoom(16);

            if(that.locationMetaForView){
                // 要查看的坐标
                var lngLat = new AMap.LngLat(that.locationMetaForView.longitude ,that.locationMetaForView.latitude, false);

                // 设置地图的中心点为位置消息中的数据
                map.setCenter(lngLat);

                // 自定义Marker的图标（见手册：https://lbs.amap.com/api/javascript-api/guide/overlays/marker）：
                var icon = new AMap.Icon({
                    size: new AMap.Size(44, 82),       // 实际图片的像素尺寸
                    image: RBChatConfig.IM_SERVER_URL+'/images/chatting_location_current_pin_big_icon.png',  // Icon的图像
                    imageOffset: new AMap.Pixel(0, 0), // 图像相对展示区域的偏移量，适于雪碧图等
                    imageSize: new AMap.Size(22, 41)   // 地图上显示的真实尺寸（根据所设置的大小拉伸或压缩图片）
                });
                // 创建一个 Marker 实例：
                var marker = new AMap.Marker({
                    position: lngLat,   // 经纬度对象，也可以是经纬度构成的一维数组[116.39, 39.9]
                    title: that.locationMetaForView.locationTitle,
                    icon : icon,
                    offset: new AMap.Pixel(-11,-41)    // 设置点标记偏移量（为图标在地图上的显示尺寸，宽1/2、高全尺寸的偏移量）
                });
                // 将创建的点标记添加到已有的地图实例
                map.add(marker);

                // 显示位置信息
                that.setResultInfo(that.locationMetaForView.locationTitle, that.locationMetaForView.locationContent);

                // 为“回到原位置”添加事件处理
                var $backToBtn = $("#im-panel-main-chat-locationmsg-map_backToLocation");
                $backToBtn.click(function (event) {
                    if(that.locationMetaForView){
                        map.setCenter(lngLat);
                    }
                });
            }
        }
    };

    /**
     * 事件处理初始化。
     *
     * @param dialogId
     */
    RBChatMsgLocationDialog.prototype.initEventListeners = function(dialogId) {

        var that = this;
        var $btn = $("#im-panel-main-chat-locationmsg-map_result_btn");

        $btn.click(function (event) {

            if (that.usedForSelect) {
                if (that.currentLocationForSelect) {
                    var fn_sucess_send = function () {
                        // 关闭地图选择对话框
                        RBChatDialogHelper.closeDialog(dialogId);
                    };

                    // 发出消息指令
                    RBChatChattingContentPaneUI.doSendLocationMessage4IM(
                        that.getResultInfoTitle(), that.getResultInfoContent()
                        , that.currentLocationForSelect.getLng(), that.currentLocationForSelect.getLat()
                        , fn_sucess_send);
                }
                else {
                    RBChatToastHelper.showToast_WARN("当前位置信息未就绪，请检查网络后再试！", null);
                }
            }
            else {
                // console.log("[地图] 马上进入第3方地图，locationMetaForView=" + JSON.stringify(that.locationMetaForView));

                // 在高德官方地图中显示此位置（详见开发者手册：https://lbs.amap.com/api/uri-api/gettingstarted）
                window.open('https://uri.amap.com/marker?position='
                    + that.locationMetaForView.longitude + ',' + that.locationMetaForView.latitude + '&name=' + that.locationMetaForView.locationTitle);
            }
        });
    };

    RBChatMsgLocationDialog.prototype.setLoadingInfo = function(){
        this.setResultInfo("高德地图位置数据获取中", "可能会因网络原因产生延迟，请耐心等候 ...");
    };

    RBChatMsgLocationDialog.prototype.setResultInfo = function(title, content){
        $("#im-panel-main-chat-locationmsg-map_result_title").text(RBChatUtils.isStringEmpty(title)?"位置":title);
        $("#im-panel-main-chat-locationmsg-map_result_address").text(RBChatUtils.isStringEmpty(content)?"没有具体的位置信息":content);
    };

    RBChatMsgLocationDialog.prototype.getResultInfoTitle = function() {
        return $("#im-panel-main-chat-locationmsg-map_result_title").text();
    };

    RBChatMsgLocationDialog.prototype.getResultInfoContent = function() {
        return $("#im-panel-main-chat-locationmsg-map_result_address").text();
    };

    //RBChatMsgLocationDialog.prototype.getCurentLocation = function() {
    //    return this.currentLocationForSelect;
    //};

    // 注意：此处的参数是传递给 RBChatGroupMemberDialog 的构造函数的哦
    return new RBChatMsgLocationDialog(usedForSelect, locationMeta);
};
