
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
            if(p === objName)
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
        // console.log("[hashmap.js_showAll()] 正在输出HashMap内容(列表长度 %d) ------------------->"
        //     , this.length);
        // 遍历
        for (var key in this.container) {
            if(funValueToString){
                // console.log("[hashmap.js_showAll()]       > key=%s, value=%s", key, funValueToString(this.container[key]));
            }
            else{
                // console.log("[hashmap.js_showAll()]       > key=%s, value=%s", key, this.container[key]
                // );
            }
        }
    }
    else {
        // console.log("[hashmap.js_showAll()] 列表中长度为：%d !", this.length);
    }
};
