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
 * ======================================================================
 * 【基本说明】：
 * JavaScript实现的类似于Java等语言里的hashmap，用于方便存取key、value形式的数据。
 *
 * 注：之所有没有使用ECMAScript6中新增的Map类，原因是本SDK有可能运行时IE10这种未严格支
 *    持ECMAScript6标准的较垃圾浏览器，本类并没有特别之处，可随时使用ES6中的Map替换之。
 * ======================================================================
 */

function MBHashMap(){
    this.length = 0;
    this.maxLength = Number.MAX_VALUE;
    this.container = {};
}

MBHashMap.prototype.put = function(objName,objValue){
    try{
        if(this.length >= this.maxLength)
            throw new Error("[Error HashMap] : Map Datas' count overflow !");
        if(objName != ""){
            for(var p in this.container){
                if(p == objName){
                    this.container[objName] = objValue;
                    return ;
                }
            }
            this.container[objName] = objValue;
            this.length ++ ;
        }
    }catch(e){
        return e;
    }
};

MBHashMap.prototype.get = function(objName){
    try{
        if(this.container[objName])
            return this.container[objName];
        return null;
    }catch(e){
        return e;
    }
};

MBHashMap.prototype.contains = function(objName){
    try{
        for(var p in this.container){
            if(p == objName)
                return true;
        }
        return false;
    }catch(e){
        return e;
    }
};

MBHashMap.prototype.containsValue = function(objValue){
    try{
        for(var p in this.container){
            if(this.container[p] === objValue)
                return true;
        }
        return false;
    }catch(e){
        return e;
    }
};

MBHashMap.prototype.remove = function(objName){
    try{
        if(this.container[objName]){
            delete this.container[objName];
            this.length -- ;
            return true;
        }
        return false;
    }
    catch(e){
        return e;
    }
};

//HashMap.prototype.pop = function(objName){
//    try{
//        var ov = this.container[objName];
//        if(ov){
//            delete this.container[objName];
//            this.length -- ;
//            return ov;
//        }
//        return null;
//    }catch(e){
//        return e;
//    }
//};

MBHashMap.prototype.removeAll = function(){
    try{
        this.clear();
    }catch(e){
        return e;
    }
};

MBHashMap.prototype.clear = function(){
    try{
        delete this.container;
        this.container = {};
        this.length = 0;
    }catch(e){
        return e;
    }
};

MBHashMap.prototype.isEmpty = function(){
    if(this.length === 0)
        return true;
    else
        return false;
};

MBHashMap.prototype.keySet = function(){
    var _keys = [];
    for (var key in this.container) {
        _keys.push(key);
    }
    return _keys;
};

MBHashMap.prototype.size = function(){
    return this.length;
};

//HashMap.prototype.runIn = function(fun){
//    try{
//        if(!fun)
//            throw new Error("[Error HashMap] : The paramer is null !");
//        for(var p in this.container){
//            var ov = this.container[p];
//            fun(ov);
//        }
//    }catch(e){
//        return e;
//    }
//};

// 本方法仅用于debug时
MBHashMap.prototype.showAll = function(funValueToString){
    if(this.length > 0) {
        console.log("[hashmap.js_showAll()] 正在输出HashMap内容(列表长度 %d) ------------------->"
            , this.length);
        // 遍历
        for (var key in this.container) {
            if(funValueToString){
                console.log("[hashmap.js_showAll()]       > key=%s, value=%s", key, funValueToString(this.container[key]));
            }
            else{
                console.log("[hashmap.js_showAll()]       > key=%s, value=%s", key, this.container[key]
                );
            }
        }
    }
    else {
        console.log("[hashmap.js_showAll()] 列表中长度为：%d !", this.length);
    }
};
