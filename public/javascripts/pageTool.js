var PageTool = {
		//一页显示多少条记录
		pageSize:0,
		//页码最大值
		pagetotal:0,
		//当前页码
		current:0,
		//页码最多显示多少
		pageMax:0,
		//点击页码响应函数名
		funcName:"select",
		//点击前一页响应函数名
		funcPreviousName:"previous",
		//点击下一页响应函数名
		funcNextName:"next",
		//当前页码是否可点击
		clickFlag:false,
		init:function(option,callback){
			PageTool.pageSize=parseInt(option.pageSize);
			PageTool.funcName=option.funcName==null?this.funcName:option.funcName;
			PageTool.funcPreviousName=option.funcPreviousName==null?this.funcPreviousName:option.funcPreviousName;
			PageTool.funcNextName=option.funcNextName==null?this.funcNextName:option.funcNextName;
			PageTool.clickFlag=option.clickFlag==null?this.clickFlag:option.clickFlag;
			PageTool.pageMax=parseInt(option.pageMax);
			PageTool.pagetotal=Math.ceil(parseInt(option.totalCount) / parseInt(option.pageSize));
			this.setPage(1)
			if(callback!=null&&typeof(callback) === 'function'){
				callback();
			}
		},
		setPage:function(index,callback){
			if(PageTool.pagetotal===0)
				return;
			PageTool.current=parseInt(index);
			$("#page").html("");
			var start=1;
			var end=PageTool.pageMax;
			if(PageTool.current==PageTool.pagetotal){
				start=PageTool.current-PageTool.pageMax+1;
				if(start<1)
					start=1;
				end=PageTool.current;
			}else if(PageTool.current>=PageTool.pageMax){
				start=PageTool.current-PageTool.pageMax+2;
				end=PageTool.current+1;
			}else if(PageTool.pagetotal<PageTool.pageMax){
				end=PageTool.pagetotal;
			}
			$("#page").append("<li id='page_first'><a href=javascript:"+PageTool.funcName+"('1')>&laquo;</a></li>");
			$("#page").append("<li id='page_previous'><a href=javascript:"+PageTool.funcPreviousName+"()>&lsaquo;</a></li>");
			for(var i=start;i<=end;i++){
				$("#page").append("<li id='page_"+i+"'><a href=javascript:"+PageTool.funcName+"('"+i+"')>"+i+"</a></li>");
			}
			$("#page").append("<li id='page_next'><a href=javascript:"+PageTool.funcNextName+"()>&rsaquo;</a></li>");
			$("#page").append("<li id='page_last'><a href=javascript:"+PageTool.funcName+"('"+PageTool.pagetotal+"')>&raquo;</a></li>");
			$("#page").find("li").attr("class","");
			if(PageTool.pagetotal==1){	
				this.disableFirstPage();
				this.disableLastPage();
				this.disableNextPage();
				this.disablePreviousPage();
				this.setActive(1,this.clickFlag);
			}else if(PageTool.current==1){
				this.disableFirstPage();
				this.disablePreviousPage();
				this.setActive(1,this.clickFlag);
			}else if(PageTool.current==PageTool.pagetotal){
				this.setActive(PageTool.pagetotal,this.clickFlag);
				this.disableLastPage();
				this.disableNextPage();
			}else{
				this.setActive(PageTool.current,this.clickFlag);
			}
			if(callback!=null&&typeof(callback) === 'function'){
				callback();
			}
		},
		//获取当前页码
		getCurrentPage:function(){
			return parseInt(PageTool.current);
		},
		//禁用首页按钮
		disableFirstPage:function(){
			$("#page_first").addClass("disabled");
			$("#page_first").find("a").remove();
			$("#page_first").append("<span>&laquo;</span>");
		},
		//禁用尾页按钮
		disableLastPage:function(){
			$("#page_last").addClass("disabled");
			$("#page_last").find("a").remove();
			$("#page_last").append("<span>&raquo;</span>");
		},
		//禁用上一页按钮
		disableNextPage:function(){
			$("#page_next").addClass("disabled");
			$("#page_next").find("a").remove();
			$("#page_next").append("<span>&rsaquo;</span>");
		},
		//禁用下一页按钮
		disablePreviousPage:function(){
			$("#page_previous").addClass("disabled");
			$("#page_previous").find("a").remove();
			$("#page_previous").append("<span>&lsaquo;</span>");
		},
		//设置按钮激活样式
		setActive:function(i,b){
			$("#page_"+i).addClass("active");
			if(!b){
				$("#page_"+i).html("<a>"+i+"</a>");
			}
		}
}
