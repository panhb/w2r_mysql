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
	});
	
	$("#editor").click(function(){
		refresh();
	});
	
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
//		setCursor(document.getElementById("editor"),position,'[', '](http://)');
        if($("#linkModal")!=null){
            $("#linkModal").remove();
        }

        var linkModal = '<div class="modal"  id="linkModal" tabindex="-1" role="dialog" aria-hidden="true">'
            + '<div class="modal-dialog">'
            + '<div class="modal-content">'
            + '<div class="modal-header">'
            + '<button type="button" class="close" data-dismiss="modal"><span aria-hidden="true">&times;</span><span class="sr-only">Close</span></button>'
            + '<h4 class="modal-title"><b>链接</b></h4>'
            + '</div>'
            + '<div class="modal-body">'
            + '<form class="form-horizontal" id="linkform">'
            + '<div class="form-group">'
            + '<label for="title" class="col-md-2 control-label">标题</label>'
            + '<div class="col-md-10">'
            + '<input type="text" name="title" id="title" placeholder="Title">'
            + '</div>'
            + '</div>'
            + '<div class="form-group">'
            + '<label for="link" class="col-md-2 control-label">连接</label>'
            + '<div class="col-md-10">'
            + '<input type="text" name="link" id="link" value="http://" placeholder="Link">'
            + '</div>'
            + '</div>'
            + '</form>'
            + '</div>'
            + '<div class="modal-footer">'
            + '<button class="btn btn-primary" role="save" onclick="javascript:addlink();">确定</button>'
            + '</div>'
            + '</div></div></div>';
        $(document.body).append(linkModal);
        $("#linkModal").modal('show');



	});



	$(".glyphicon-picture").click(function(){
//		setCursor(document.getElementById("editor"),position,'![', '](http://)');

        if($("#picModal")!=null){
            $("#picModal").remove();
        }

        var picModal = '<div class="modal"  id="picModal" tabindex="-1" role="dialog" aria-hidden="true">'
            + '<div class="modal-dialog">'
            + '<div class="modal-content">'
            + '<div class="modal-header">'
            + '<button type="button" class="close" data-dismiss="modal"><span aria-hidden="true">&times;</span><span class="sr-only">Close</span></button>'
            + '<h4 class="modal-title"><b>图片上传</b></h4>'
            + '</div>'
            + '<div class="modal-body">'
            + '<div id="uploader-demo" style="height: 200px; padding: 60px 0px; text-align: center; border: 4px dashed rgb(221, 221, 221);">'
            + '<div id="filePicker" style="margin:20px auto;">选择图片</div>'
            + '</div></div></div></div>';
        $(document.body).append(picModal);
        $("#picModal").modal('show');

        // 初始化Web Uploader
        var uploader = WebUploader.create({
            // 选完文件后，是否自动上传。
            auto: true,
            // swf文件路径
            swf: '/javascripts/w2r/webuploader/Uploader.swf',
            // 文件接收服务端。
            server: '/articles/uploadImage',
            // 选择文件的按钮。可选。
            // 内部根据当前运行是创建，可能是input元素，也可能是flash.
            pick: '#filePicker',
            //单个文件最大不超过2M
            fileSingleSizeLimit: 2 * 1024 * 1024,
            // 只允许选择图片文件。
            accept: {
                title: 'Images',
                extensions: 'gif,jpg,jpeg,bmp,png',
                mimeTypes: 'image/*'
            }
        });

        uploader.on( 'uploadProgress', function( file, percentage ) {
            //$("#filePicker").html("正在上传: " + file.name + " " + percentage + "%");
            $("#filePicker").html("正在上传,请稍后...");
        });

        uploader.on( 'uploadSuccess', function( file,json) {
            $("#picModal").modal("hide");
            setCursor(document.getElementById("editor"),position,'![]('+json.url+')','');
        });

        uploader.on('error', function(type){
            switch(type){
                case 'Q_EXCEED_SIZE_LIMIT':
                case 'F_EXCEED_SIZE':
                    $("#filePicker").html("文件太大了,请上传不超过2M的文件");
                    break;
                case 'Q_TYPE_DENIED':
                    $("#filePicker").html("只能上传图片");
                    break;
                default:
                    $("#filePicker").html("发生未知错误");
            }
        });
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

    $(".glyphicon-resize-full").click(function(){
        $("#editor").removeAttr ("style");
        var elem = document.getElementById("editor");
        if (elem.requestFullscreen) {
            elem.requestFullscreen();
        } else if (elem.msRequestFullscreen) {
            elem.msRequestFullscreen();
        } else if (elem.mozRequestFullScreen) {
            elem.mozRequestFullScreen();
        } else if (elem.webkitRequestFullscreen) {
            elem.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
        }

    });

    var fullFlag = false;
    $(document).on("webkitfullscreenchange mozfullscreenchange fullscreenchange",function(){
            if(!fullFlag){
                fullFlag = true;
            }else{
                $("#editor").trigger("oninput");
                fullFlag = false;
            }
    });

    /*
    document.addEventListener("fullscreenChange", function () {
        if (document.fullscreenElement != null) {
            alert(1)
        } else {
            alert(0)
        }
    });
    */

    /* 这里编写当ESC按下时的处理逻辑！
    $("#editor").keydown(function (e) {
        if (e && e.keyCode == 27) {
            $("#editor").trigger("oninput");
        }
    });
	*/
	
	
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

function addlink(){
    $("#linkModal").modal("hide");
    var title = $("#linkform").find('[name=title]').val();
    var link =  $("#linkform").find('[name=link]').val();
    setCursor(document.getElementById("editor"),position,'['+title+']('+link+')','');
}

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
