
var RBChatMsgCache = (function () {

    // 构造器（相当于java里的构造方法）
    var UIModule1 = function (argument) {

        // 预加载消息缓存
        this.msgCacheObj = {}
    };

    UIModule1.prototype.init = function () {
    };

    
    UIModule1.prototype.updateCache = function (options) {
        const { chatId, data, key, val, isGroupChatting, type = 'update' } = options
        if (type == 'update') {
            this.msgCacheObj[chatId] = {
                data: JSON.parse(JSON.stringify(data || [])),
                server: true
            } 
        } else if (type == 'add') {
            // 群聊数据不存入缓存
            if (isGroupChatting) return
            if (!this.msgCacheObj[chatId]) {
                this.msgCacheObj[chatId] = {
                    data: [],
                    server: false
                }
            }
            this.msgCacheObj[chatId].data.push(data)    
            if (this.msgCacheObj[chatId].data.length > 30) {
                this.msgCacheObj[chatId].data.shift()
                console.log(this.msgCacheObj[chatId].data.length - 30, this.msgCacheObj[chatId].data.length, 1241251266)
            }
        } else if (type == 'delete') {
            const _index = this.msgCacheObj[chatId].data.findIndex(item => item.fingerPrintOfProtocal == data)
            if (_index != -1) {
                this.msgCacheObj[chatId].data.splice(_index, 1)
            }
        } else if (type == 'deleteChat') {
            delete this.msgCacheObj[chatId]
        } else if (type == 'clear') {
            this.msgCacheObj = {}
        } else if (type == 'updateKey') {
            const _obj = this.msgCacheObj[chatId].data.find(item => item.fingerPrintOfProtocal == data)
            if (_obj) {
                _obj[key] = val
            }
        }
        // console.log('ttt asdasda end', JSON.parse(JSON.stringify(this.msgCacheObj[chatId])), type)
    };

    UIModule1.prototype.checkHasCache = function (chatId) {
        return this.msgCacheObj[chatId]?.server || this.msgCacheObj[chatId]?.data?.length >= 30 ? JSON.parse(JSON.stringify(this.msgCacheObj[chatId]?.data || [])) : null
    };


    // 新建本模块对象
    var thisModule = new UIModule1();
    // 调用初始化方法
    thisModule.init();

    return thisModule;// 此种方式用于构造器的方式
})();