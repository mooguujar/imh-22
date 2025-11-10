// 使用全局对象管理
window.App = window.App || {};


// 事件总线
window.App.EventBus = (function() {
  class EventBus {
    constructor() {
      this.events = {};
    }
    
    on(event, callback) {
      if (!this.events[event]) {
        this.events[event] = [];
      }
      this.events[event].push(callback);
    }
    
    emit(event, data) {
      if (this.events[event]) {
        this.events[event].forEach(callback => callback(data));
      }
    }
    
    off(event, callback) {
      if (this.events[event]) {
        this.events[event] = this.events[event].filter(cb => cb !== callback);
      }
    }
  }
  
  // 返回单例
  return new EventBus();
})();