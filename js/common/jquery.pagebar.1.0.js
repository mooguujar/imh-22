/**
 * @Author: zql
 * @Version:1.0
 * Licensed under the MIT license
 */
"use strict";//严格模式
;(function($){
	var _css = ".zql-pagebar{text-align: center;margin: 10px auto;box-sizing: border-box;}"
    	+".zql-pagebar *{line-height: 26px;}"
    	+".zql-pagebar button{margin:0 3px;min-width:30px;background: #ffffff;border: 1px solid #e5e5e5;color: #5e5e5e;cursor: pointer;outline: none;text-align: center;}"
    	+".zql-pagebar button:hover{background: #0eb0d2;color: #ffffff;}"
    	+".zql-pagebar .zql-btn-dis{cursor: default;opacity: .7;background: #eeeeee;color: #5e5e5e;}"
    	+".zql-pagebar .zql-btn-dis:hover{background: #eeeeee;color: #5e5e5e;}"
    	+".zql-pagebar .zql-current-page{background: #0eb0d2;color: #ffffff;}"
    	+".zql-pagebar .zql-page-input{width:30px;height: 26px;margin:0 3px;padding: 0;text-align: center;background: #ffffff;border: 1px solid #e5e5e5;color: #5e5e5e;outline: none;}"
    	+".zql-pagebar .zql-page-text{color: #2b2b2b;font-size: 13px;}"
    	;
    $('head').append('<style type="text/css">'+_css+'</style>');
	//私有方法，检测参数是否合法
	function _isValid(options) {
		return !options || (options && typeof options === "object") ? true : false;
	}
	//是否是整数
	function _isInteger(num){
//		因为number类型没有indexOf方法，所有要转为字符串类型，否则会报Uncaught TypeError: num.indexOf is not a function
		var point = (""+num).indexOf(".");
//		var point = num.toString().indexOf(".");
		if(!isNaN(num) && point==-1){
			return true;
		}else{
			return false;
		}
	}
	$.fn.extend({
		"pagebar":function(options,callback){
			//检测用户传进来的参数是否合法
		    if (!_isValid(options)){
		    	return;
		    }
		    //默认设置
		    var defaults = {
				dataTotal:500,	//数据总数
				pageSize:10,	//每页显示数
				btnNum:8,		//分页按钮显示数
				current:40		//当前页
			};
		    //使用jQuery.extend 覆盖插件默认参数
			var _opt = $.extend({}, defaults, options);
			//计算总页数
			var _totalPage = Math.ceil(_opt.dataTotal/_opt.pageSize);
			//不足2页不加载插件
			// if(_totalPage<2){
			// 	return;
			// }
			//当前页
			var _curPage = _opt.current;
			//分页显示数
			var _btnNum = _opt.btnNum;
			var obj = this;
			obj.append('<div class="zql-pagebar"></div>');
			//分页加载事件
			function pageEvent(){
				//跳转页框的值为当前页加1
				var inpVal = (_curPage==_totalPage)?1:Number(_curPage)+1;
				var append_html = '<button class="zql-prev-page">上一页</button>';
				_btnNum = _opt.btnNum>_totalPage?_totalPage:_opt.btnNum;
				for(var i=0;i<_btnNum;i++){
					//当前被选中的居中按钮数下标
					var halfIndex = Math.ceil(_btnNum/2)-1;
					if(((_totalPage-_curPage)<(halfIndex+1))){
						if(_curPage==(_totalPage-_btnNum+i+1)){
							append_html += '<button class="zql-page-num zql-current-page">'+(_totalPage-_btnNum+i+1)+'</button>';
						}else{
							append_html += '<button class="zql-page-num">'+(_totalPage-_btnNum+i+1)+'</button>';
						}
					}else if(_curPage>halfIndex){
						if(halfIndex==i){
							append_html += '<button class="zql-page-num zql-current-page">'+_curPage+'</button>';
						}else{
							append_html += '<button class="zql-page-num">'+(_curPage-halfIndex+i)+'</button>';
						}
					}else{
						if(_curPage==(i+1)){
							append_html += '<button class="zql-page-num zql-current-page">'+(i+1)+'</button>';
						}else{
							append_html += '<button class="zql-page-num">'+(i+1)+'</button>';
						}
					}
				}
				append_html += '<button class="zql-next-page">下一页</button>';
				append_html += '<span class="zql-page-text">共 '+_totalPage+' 页，'+_opt.dataTotal+'条</span>';
				// append_html += '<input name="size" class="zql-page-input" type="text" value="'+_opt.pageSize+'">';
				// append_html += '<span class="zql-page-text">，跳转到</span>';
				// append_html += '<input name="page" class="zql-page-input" type="text" value="'+inpVal+'">';
				// append_html += '<span class="zql-page-text">页</span>';
				// append_html += '<button class="zql-to-page-num">确定</button>';
				obj.children('.zql-pagebar').append(append_html);
				
				if(_curPage==1){
					obj.find('.zql-prev-page').attr('disabled','disabled').addClass('zql-btn-dis');
				}else{
					obj.find('.zql-prev-page').removeAttr('disabled').removeClass('zql-btn-dis');
				}
				if(_curPage==_totalPage){
					obj.find('.zql-next-page').attr('disabled','disabled').addClass('zql-btn-dis');
				}else{
					obj.find('.zql-next-page').removeAttr('disabled').removeClass('zql-btn-dis');
				}
			}
			//刷新分页插件
			function refrechPage(){
				obj.children('.zql-pagebar').empty();
				pageEvent();
			}
			//获取当前参数
			function getParams(){
				var params = {
					totalPage:Number(_totalPage),
					curPage:Number(_curPage),
					pageSize:Number(_opt.pageSize)
				};
				return params;
			}
			pageEvent();
			//上一页点击事件
			obj.on('click','.zql-prev-page',function(){
				_curPage--;
				refrechPage();
				callback(getParams());
			});
			//下一页点击事件
			obj.on('click','.zql-next-page',function(){
				_curPage++;
				obj.children('.zql-pagebar').empty();
				refrechPage();
				callback(getParams());
			});
			//每页点击事件
			obj.on('click','.zql-page-num',function(){
				var $this = $(this);
				var current = $this.hasClass('zql-current-page');
				if(!current){
					_curPage = $this.text();
					refrechPage();
					callback(getParams());
				}
			});
			//确定按钮的点击事件
			obj.on('click','.zql-to-page-num',function(){
				var pageSize = obj.find('input[name=size]').val();
				if(pageSize!=_opt.pageSize && _isInteger(pageSize)){//每页显示数是否变化
					_opt.pageSize = pageSize;
					_totalPage = Math.ceil(_opt.dataTotal/_opt.pageSize);
				}
				_curPage = obj.find('input[name=page]').val();
				if(!_isInteger(_curPage)||_curPage>_totalPage||_curPage<1){//如果输入的不是整数，或者当前页大于总页数，或者小于1，将跳转到第一页
					_curPage = 1;
				}
				refrechPage();
				callback(getParams());
			});
		}
	});
})(jQuery);

