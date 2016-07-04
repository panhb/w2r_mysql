var position=0;
$(function(){
	//$("#editor").focus();
	
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
			$("#preview").css("top",$(this).offset().top+40);
			previewShow();
		}else{
			$(".glyphicon-eye-close").attr("class","glyphicon glyphicon-eye-open");
			$("#preview").fadeOut();
		}
	});

    $(".glyphicon-resize-full").click(function(){
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
});


function addlink(){
    $("#linkModal").modal("hide");
    var title = $("#linkform").find('[name=title]').val();
    var link =  $("#linkform").find('[name=link]').val();
    setCursor(document.getElementById("editor"),position,'['+title+']('+link+')','');
}

function previewShow(){
	var data=$("#editor").val();
	$.ajax({
		async:false,
		type: "POST",
		url: "/articles/article2html",
		data: {content:data},
		dataType: "json",
		success: function(json){
			var data=eval(json);
			$("#preview").html(data.html);
			$("#preview").fadeIn();
		}
	});
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
		CaretPos = -1; 
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
