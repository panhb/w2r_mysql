var position=0;
$(function(){
	//$("#editor").focus();
	
	$("#editor").keyup(function(){
		refresh();
	});
	
	$("#editor").focus(function(){
		refresh();
	})
	
	$("#editor").click(function(){
		refresh();
	})
	
	$(".glyphicon-bold").click(function(){
		setCursor(document.getElementById("editor"),position,'**','**');
	});
	
	$(".glyphicon-italic").click(function(){
		setCursor(document.getElementById("editor"),position,'*','*');
	});
	
	$(".glyphicon-list").click(function(){
		setCursor(document.getElementById("editor"),position,'* ','');
	});
	
	$(".glyphicon-link").click(function(){
		setCursor(document.getElementById("editor"),position,'[', '](http://)');
	});
	
	$(".glyphicon-picture").click(function(){
		setCursor(document.getElementById("editor"),position,'![', '](http://)');
	});
	
	$("#glyphicon-eye").click(function(){
		if($("#glyphicon-eye").attr("class")==='glyphicon glyphicon-eye-open'){
			$(".glyphicon-eye-open").attr("class","glyphicon glyphicon-eye-close");
			$("#preview").css("top",$(this).offset().top+40)
			previewShow();
		}else{
			$(".glyphicon-eye-close").attr("class","glyphicon glyphicon-eye-open");
			$("#preview").fadeOut();
		}
	});
})

function previewShow(){
	var data=$("#editor").val();
	$.ajax({
		async:false,
		type: "GET",
		url: "/articles/article2html",
		data: {content:data},
		dataType: "json",
		success: function(json){
			var data=eval(json);
			$("#preview").html(data.html);
			$("#preview").fadeIn();
		}
	})
}

function refresh(){
	position=getCursor(document.getElementById("editor"));
}

//获取光标位置 
//多行文本框 
function getCursor(ctrl) { 
	var CaretPos = 0; 
	if(document.selection) {
		ctrl.focus(); 
		var Sel = document.selection.createRange(); 
		var Sel2 = Sel.duplicate(); 
		Sel2.moveToElementText(ctrl); 
		var CaretPos = -1; 
		while(Sel2.inRange(Sel)){ 
			Sel2.moveStart('character'); 
			CaretPos++; 
		} 
	}else if(ctrl.selectionStart || ctrl.selectionStart == '0'){
		CaretPos = ctrl.selectionStart; 
	} 
	return CaretPos; 
} 

//设置光标位置函数 
function setCursor(ctrl,pos,start,end){ 
	var value=$(ctrl).val();
	var svalue=value.substring(0,pos);
	var evalue=value.substring(pos);
	var nvalue=svalue+start+end+evalue;
	$(ctrl).val(nvalue);
	pos=pos+start.length;
	if(ctrl.setSelectionRange){ 
		ctrl.setSelectionRange(pos,pos); 
		ctrl.focus(); 
	}else if (ctrl.createTextRange) { 
		var range = ctrl.createTextRange(); 
		range.collapse(true); 
		range.moveEnd('character', pos); 
		range.moveStart('character', pos); 
		range.select(); 
	} 
} 
