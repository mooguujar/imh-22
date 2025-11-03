
var RBChatGroupSend = (function () {

    // 构造器（相当于java里的构造方法）
    var UIModule1 = function (argument) {

        // 群发弹窗id
        this.dialogId = null
        // 群发队列
        this.tasks = []
        // 弹窗状态 1: 缩小 2: 正常
        this.status = 0
    };

    UIModule1.prototype.init = function () {
    };

    UIModule1.prototype.updateUI = function (data) {
        console.log('群发助手状态栏 更新', data)
        const { from, dataContent } = data
        const _id = from.split('_')[1]
        const _length = JSON.parse(dataContent).length
        const _task = this.tasks.find(item => item.id == _id)
        if (!_task || _task.successNums >= _task.total) return
        
        if (!_task.successNums) _task.successNums = 0
        _task.successNums += _length
        let progress 
        if (_task.successNums >= _task.total) {
            progress = 100
        } else {
            progress = Math.ceil(_task.successNums / _task.total * 100)
        }

        const _el = $(`#task-item-${_id}`)
        _el.find('.progress').html(`${progress}%`)
        if (progress == 100) {
            _el.find('.weui-icon-success').css('display', 'block')
            _el.find('.clear-btn').css('display', 'block')
        }
    };

    UIModule1.prototype.getTasksStatus = function () {
        let isComplete = true
        this.tasks.forEach(item => {
            if (item.successNums < item.total) {
                isComplete = false
            }
        })
        return isComplete
    }
    UIModule1.prototype.addUI = function (data) {
        //                         "			<i id=\'im-group-member_li_checkbox_" + user_uid + "\' class=\'" + (selected ? "weui-icon-success" : "weui-icon-circle") + "\' style='top:0px !important'></i>" : "") +
        // weui-icon-circle success
        const { id, total, content } = data
        let _content = content
        if (_content.length > 30) {
            _content = content.slice(0, 30) + '...'
        }
        const html = `
           <li class="task-item" id="task-item-${id}" data-total="${total}">
                <h3>
                    <span class="content">${_content}</span>
                    <span class="progress">排队中</span>
                </h3>
                <div class="task-right">
                    <i class="weui-icon-success" style='top:0px !important;display: none;'></i>
                    <span class="clear-btn" style='display: none;'>清除</span>
                </div>
           </li>
        `

        $(`.task-list`).append(html)

        setTimeout(() => {
            document.querySelector(`#task-item-${id} .clear-btn`).addEventListener("click", () => {
                const index = this.tasks.findIndex(item => item.id == id);
                if (index !== -1) {
                  this.tasks.splice(index, 1);
                }

                if (!this.tasks.length) {
                    RBChatDialogHelper.closeDialog(this.dialogId)
                    this.dialogId = null
                }

                const taskEl = document.getElementById(`task-item-${id}`);
                if (taskEl) {
                    taskEl.remove();
                }
                
            });
        })
    };

    UIModule1.prototype.groupSendTaskOp = function (task, type) {
        if (type == 'add') {
            this.tasks.push(task)
            setTimeout(() => {
                this.addUI(task)
            })
        } else {
            this.updateUI(task)
        }

        if (!this.dialogId) {
            const closeFn = () => {
                if (this.getTasksStatus()) {
                    RBChatDialogHelper.closeDialog(this.dialogId)
                    this.dialogId = null
                } else {
                    RBChatToastHelper.showToast_WARN("群发任务进行中！", null, 'toast');
                }
            }
            this.dialogId = RBChatDialogHelper.nextDialogId()
            // 显示对话框
            RBChatDialogHelper.showGSDialog("群发助手任务栏"
                , closeFn
                , ""
                , `<ul class="task-list"><div class="task-op">一键清除</div></ul>`
                , this.dialogId
                , null
                , null
                , true
                , ""
                , null
                , false
                , false);
            setTimeout(() => {
                this.initDragEvent()
                this.initButtonEvent()
            })
        }
    }

    UIModule1.prototype.initButtonEvent = function () {
        const _clearAll = document.querySelector(`#dialog-${this.dialogId} .task-op`)
        
        _clearAll.addEventListener('click', () => {
            this.tasks = this.tasks.filter(item => {
                const isFinish = (item.successNums || 0) >= item.total
                if (isFinish) {
                    const taskEl = document.getElementById(`task-item-${item.id}`);
                    if (taskEl) {
                        taskEl.remove();
                    }
                }

                return !isFinish
            })
            if (!this.tasks.length) {
                RBChatDialogHelper.closeDialog(this.dialogId)
                this.dialogId = null
            }
        })
    }
    UIModule1.prototype.initDragEvent = function () {
        const draggable = document.querySelector(`#dialog-${this.dialogId} .lightbox`)
        let isDragging = false;
        let offsetX, offsetY;
        let that = this

        draggable.addEventListener('mousedown', function(e) {
            // 鼠标按下时，记录鼠标的偏移位置
            isDragging = true;
            offsetX = e.clientX - draggable.offsetLeft;
            offsetY = e.clientY - draggable.offsetTop;
        
            // 阻止默认行为，避免选择文本
            //   e.preventDefault();
        });
        
        document.addEventListener('mousemove', function(e) {
            if (isDragging) {
                // 计算新的位置，并更新元素的位置
                const x = e.clientX - offsetX;
                const y = e.clientY - offsetY;

                draggable.style.cursor = 'grabbing'
                draggable.style.bottom = 'auto';
                draggable.style.right = 'auto';
                draggable.style.left = x + 'px';
                draggable.style.top = y + 'px';
            }
        });
        
        document.addEventListener('mouseup', function() {
            // 鼠标释放时，停止拖拽
            isDragging = false;
            draggable.style.cursor = 'inherit'
        });
    }

    

    // 新建本模块对象
    var thisModule = new UIModule1();
    // 调用初始化方法
    thisModule.init();

    return thisModule;// 此种方式用于构造器的方式
})();