/**
 * 使用 html5 提供的 localStorage来缓存数据
 **/
const SPLIT_STR = '@'
var HasMapClass = require('mobileimsdk_web_server/j_common/hashmap');
var logger = require('mobileimsdk_web_server/j_conf/log').logger;
const localStorage = new HasMapClass()

const DATA_PROCESS_MAPPING = {
  'number': {
    save : data => data,
    parse: data => Number.parseFloat(data)
  },
  'object': {
    save : data => JSON.stringify(data),
    parse: data => JSON.parse(data)
  },
  'undefined': {
    save: data => data,
    parse: () => undefined
  },
  'default': {
    save : data => data,
    parse: data => data
  }
}

function getProcess(type) {
  return DATA_PROCESS_MAPPING[type] || DATA_PROCESS_MAPPING['default']
}

function get(key) {
    let stringData = localStorage.get(key)
    if (stringData) {
      let dataArray = stringData.split('@')
      let data
      let now = Date.now()
      if (dataArray.length > 2 && dataArray[2] < now) { // 缓存过期
        logger.warn("离线消息--"+key + "缓存过期");
        localStorage.remove(key)
        return null
      } else {
        let value = decodeURIComponent(dataArray[1])
        data = getProcess(dataArray[0]).parse(value)
        return data
      }
    }
    return null
  }

function  put(key, value, expired=1) { // expired 过期时间 单位秒 默认是100 上线测试没问题替换旧的设值
    const type = typeof value
    const process = getProcess(type)
    if (!expired) { // 默认不传 不过期
      value = type + SPLIT_STR + encodeURIComponent(process.save(value))
    } else {
      let time = expired * 1000 + new Date().getTime()
      value = type + SPLIT_STR + process.save(value) + SPLIT_STR + time
    }
    localStorage.put(key, value)
}

function clear() {
    localStorage.clear()
}

function  remove(key) {
    localStorage.remove(key)
}


exports.get = get;
exports.put = put;
exports.clear = clear;
exports.remove = remove;