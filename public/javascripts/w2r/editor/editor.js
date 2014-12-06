var position=0;
$(function(){
	$("#editor").focus();
	
	var height=$("#height").val();
	if(height!==null&&height!==''){
		$("#editor").height(height);
		refresh();
	}
	
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
			previewShow();
		}else{
			$(".glyphicon-eye-close").attr("class","glyphicon glyphicon-eye-open");
			$("#preview").fadeOut();
		}
	});

    $("#save").click(function(){
        saveArticle();
    });


	$(".glyphicon-floppy-disk").click(function(){
        saveArticle();
	});
	
	
	
	
	
	
	
	//拖拽上传功能实现
    $(document).on({
        dragleave:function(e){
            e.preventDefault();
        },
        drop:function(e){
            e.preventDefault();
        },
        dragenter:function(e){
            e.preventDefault();
        },
        dragover:function(e){
            e.preventDefault();
        }
    });
  
    var area = document.getElementById("editor");

    area.addEventListener("drop",function(e){
    	e.preventDefault();
        handleFiles(e.dataTransfer.files); 
    })

    area.addEventListener("dragleave",function(e){
    })

    area.addEventListener("dragenter",function(e){
    	e.stopPropagation();
        e.preventDefault();
    })

    area.addEventListener("dragover",function(e){
    	e.stopPropagation();
        e.preventDefault();
    })
  
    
    
    handleFiles = function(files) {  
    	 if(files.length != 1){
             return;
         } 
    	 var file=files[0];
	     var formData = new FormData();// 创建一个表单对象FormData
         formData.append('submit','submit');
         formData.append( 'file[0]' , file);
         var fileName=file.name;
         var filetype=fileName.substring((fileName.lastIndexOf(".")+1));
		 if(filetype!=='md'&&filetype!=='txt'){
			alert('拖拽导入目前只支持编码为utf-8且格式为md或者txt的文件');
			return;
		 }
         fileName=fileName.substring(0,fileName.lastIndexOf("."));
         var xhr = new XMLHttpRequest();
         xhr.addEventListener("load", function(e){
              var result = e.target.responseText;
              $("#editor").val(result);
			  $("#editor").height(document.getElementById("editor").scrollHeight);			  
			  refresh();
         }, false);
         xhr.open( 'post', '/articles/import' , true);
         xhr.send(formData);  
    }
})

function saveArticle(){
    var title=$(".title").val();
    if(title===null||title===''){
        $(".title").focus();
        return;
    }
    var article_id=$("#article_id").val();
    var content=$("#editor").val();
    var height=$("#editor").height();
    $.ajax({
        type: "GET",
        url: "/articles/addArticle",
        data: {article_id:article_id,content:content,title:title,height:height},
        dataType: "json",
        success: function(json){
            var data=eval(json)
            $("#article_id").val(data.id);
            alert(data.message);
        }
    })
}

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
		}
	})
	var p_height=$("#preview").height();
	var e_scrollHeight=document.getElementById("editor").scrollHeight;

	if(p_height>e_scrollHeight){
		$("#preview").height(p_height);
	}else{
		$("#preview").height(e_scrollHeight);
	}
	$("#preview").fadeIn();
}

function refresh(){
	position=getCursor(document.getElementById("editor"));
	var data=$("#editor").val();
	var wordnum=wordCount(data);
	$(".words").html(wordnum);
	
	var line=data.split("\n");
	var linenum=line.length;
	$(".lines").html(linenum);
}

//计算字数
function wordCount(data) {
  var pattern = /[a-zA-Z0-9_\u0392-\u03c9]+|[\u4E00-\u9FFF\u3400-\u4dbf\uf900-\ufaff\u3040-\u309f\uac00-\ud7af]+/g;
  var m = data.match(pattern);
  var count = 0;
  if( m === null ) return count;
  for (var i = 0; i < m.length; i++) {
    if (m[i].charCodeAt(0) >= 0x4E00) {
      count += m[i].length;
    } else {
      count += 1;
    }
  }
  return count;
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
