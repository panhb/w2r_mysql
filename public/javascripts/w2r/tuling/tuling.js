$(function(){
    $("#ask_massage").focus();
    var init_html='<div><div  class="tuling-mn"><img class="pull-left" src="../images/tuling_left.jpg">';
    init_html += '<span class="pull-left tuling">你好！</span></div></div>';
    $("#mainMeaasge").append(init_html);
    $('#ask_massage').keydown(function(){
        if(event.keyCode=="13"){
            getAnswer();
        }
    });
});


function getAnswer(){
    String.prototype.trim = function () { // 重写
        return this .replace(/^\s\s*/, '' ).replace(/\s\s*$/, '' );
    };
    var info=$("#ask_massage").val();
    info=info.trim();
    if(info===''||info===null){
        alert('不能发送空信息');
        return;
    }
    $('#ask_massage').val('');
    var user_html='<div  class="tuling-mn"><img class="pull-right" src="../images/tuling_right.jpg">';
    user_html += '<span class="pull-right tuling tuling2">'+info+'</span></div>';
    $("#mainMeaasge").append(user_html);
    info = info.replace('+', "%2B");
    info = info.replace('&', "%26");
    info = info.replace('%', "%25");
    $.ajax({
        type: "GET",
        //    async:false,
        url: "/tuling/getAnswer",
        data: {info:info},
        dataType: "json",
        success: function(json){
            $("#ask_massage").val('');
            var data=JSON.parse(json);
            if(data.status==='fail'){
                error_html();
            }else{
                var jsond = data.json;
                getHtmlByCode(jsond);
            }
        },error: function(){
            $("#ask_massage").val('');
            error_html();
        }
    });

}

function getHtmlByCode(json){
    var code=json.code;
    if(code===100000){
        //文本类数据
        text_html(json);
    }else if(code===200000){
        //网址类数据
        link_html(json);
    }else if(code===301000){
        //小说
        novel_html(json);
    }else if(code===302000){
        //新闻
        news_html(json);
    }else if(code===304000){
        //应用、软件、下载
        app_html(json);
    }else if(code===305000){
        //列车
        train_html(json);
    }else if(code===306000){
        //航班
        flight_html(json);
    }else if(code===307000){
        //团购
        group_html(json);
    }else if(code===308000){
        //优惠
        favorable_html(json);
    }else if(code===309000){
        //酒店
        hotel_html(json);
    }else if(code===310000){
        //彩票
        lottery_html(json);
    }else if(code===311000){
        //价格
        price_html(json);
    }else if(code===312000){
        //餐厅
        restaurant_html(json);
    }else{
        //错误
        error_html();
    }
}

//错误
function error_html(){
    var html='<div  class="tuling-mn"><img class="pull-left" src="../images/tuling_left.jpg">';
    html+='<span class="pull-left tuling">我也不知道啊，傻逼</span></div>';
    $("#mainMeaasge").append(html);
    $("#mainMeaasge").scrollTop( $('#mainMeaasge')[0].scrollHeight );
}

//文本类数据
function text_html(json){
    var html='<div  class="tuling-mn"><img class="pull-left" src="../images/tuling_left.jpg">';
    html+='<span class="pull-left tuling">'+json.text+'</span></div>';
    $("#mainMeaasge").append(html);
    $("#mainMeaasge").scrollTop( $('#mainMeaasge')[0].scrollHeight );
}

//网址类数据
function link_html(json){
    var html='<div  class="tuling-mn"><img class="pull-left" src="../images/tuling_left.jpg">';
    html+='<span class="pull-left tuling">'+json.text+'<a target="_blank" href="'+json.url+'">打开页面</a></span></div>';
    $("#mainMeaasge").append(html);
    $("#mainMeaasge").scrollTop( $('#mainMeaasge')[0].scrollHeight );
}

//小说
function novel_html(json){
    var html='<div class="robot_news"><div class="first_content">'+json.text+'</div><br>';
    $(json.list).each(function(i){
        if(i<3){
            html+='<div  class="news_others">';
            html+='<a href="'+this.detailurl+'" style="text-decoration:none;" target="_blank">';
            if(typeof(this.icon)!=='undefined'&&this.icon!==null&&this.icon!==''){
                html+='<div class="news_other_pic"><img src="'+this.icon+'" class="other_pic_img" style="float:right;width:38px;height:38px;"></div>';
            }
            html+='<div class="news_desc" style="font-size: 14px; max-height: 45px; margin: 0px 50px 5px 0px; color: grey;">'+this.name+'<br>'+this.author+'</div></a></div>';
        }
    });
    html+='</div>';
    $("#mainMeaasge").append(html);
    $("#mainMeaasge").scrollTop( $('#mainMeaasge')[0].scrollHeight );
}

//新闻
function news_html(json){
    var html='<div class="robot_news"><div class="first_content">'+json.text+'</div><br>';
    $(json.list).each(function(i){
        if(i<3){
            html+='<div  class="news_others">';
            html+='<a href="'+this.detailurl+'" style="text-decoration:none;" target="_blank">';
            if(typeof(this.icon)!=='undefined'&&this.icon!==null&&this.icon!==''){
                html+='<div class="news_other_pic"><img src="'+this.icon+'" class="other_pic_img" style="float:right;width:38px;height:38px;"></div>';
            }
            html+='<div class="news_desc" style="font-size: 14px; max-height: 45px; margin: 0px 50px 5px 0px; color: grey;">'+this.article+'<br>'+this.source+'</div></a></div>';
        }
    });
    html+='</div>';
    $("#mainMeaasge").append(html);
    $("#mainMeaasge").scrollTop( $('#mainMeaasge')[0].scrollHeight );
}

//应用、软件、下载
function app_html(json){
    var html='<div class="robot_news"><div class="first_content">'+json.text+'</div><br>';
    $(json.list).each(function(i){
        if(i<3){
            html+='<div  class="news_others">';
            html+='<a href="'+this.detailurl+'" style="text-decoration:none;" target="_blank">';
            if(typeof(this.icon)!=='undefined'&&this.icon!==null&&this.icon!==''){
                html+='<div class="news_other_pic"><img src="'+this.icon+'" class="other_pic_img" style="float:right;width:38px;height:38px;"></div>';
            }
            html+='<div class="news_desc" style="font-size: 14px; max-height: 45px; margin: 0px 50px 5px 0px; color: grey;">'+this.name+'<br>'+this.count+'</div></a></div>';
        }
    });
    html+='</div>';
    $("#mainMeaasge").append(html);
    $("#mainMeaasge").scrollTop( $('#mainMeaasge')[0].scrollHeight );
}

//列车
function train_html(json){
    var html='<div class="robot_news"><div class="first_content">'+json.text+'</div><br>';
    $(json.list).each(function(i){
        if(i<3){
            html+='<div  class="news_others">';
            html+='<a href="'+this.detailurl+'" style="text-decoration:none;" target="_blank">';
            if(typeof(this.icon)!=='undefined'&&this.icon!==null&&this.icon!==''){
                html+='<div class="news_other_pic"><img src="'+this.icon+'" class="other_pic_img" style="float:right;width:38px;height:38px;"></div>';
            }
            html+='<div class="news_desc" style="font-size: 14px; max-height: 45px; margin: 0px 50px 5px 0px; color: grey;">'+this.start+'-'+this.terminal+'&nbsp;&nbsp;'+this.trainnum+'<br>'+this.starttime+'，'+this.endtime+'</div></a></div>';
        }
    });
    html+='</div>';
    $("#mainMeaasge").append(html);
    $("#mainMeaasge").scrollTop( $('#mainMeaasge')[0].scrollHeight );
}

//航班
function flight_html(json){
    var html='<div class="robot_news"><div class="first_content">'+json.text+'</div><br>';
    $(json.list).each(function(i){
        if(i<3){
            html+='<div  class="news_others">';
            html+='<a href="'+this.detailurl+'" style="text-decoration:none;" target="_blank">';
            if(typeof(this.icon)!=='undefined'&&this.icon!==null&&this.icon!==''){
                html+='<div class="news_other_pic"><img src="'+this.icon+'" class="other_pic_img" style="float:right;width:38px;height:38px;"></div>';
            }
            var state='';
            if(typeof(this.state)!=='undefined'&&this.state!==null){
                state=this.state;
            }
            var route='';
            if(typeof(this.route)!=='undefined'&&this.route!==null&&this.route!==''){
                route='-'+this.route;
            }
            html+='<div class="news_desc" style="font-size: 14px; max-height: 45px; margin: 0px 50px 5px 0px; color: grey;">'+this.flight+route+'&nbsp;&nbsp;'+state+'<br>'+this.starttime+'-'+this.endtime+'</div></a></div>';
        }
    });
    html+='</div>';
    $("#mainMeaasge").append(html);
    $("#mainMeaasge").scrollTop( $('#mainMeaasge')[0].scrollHeight );
}

//团购
function group_html(json){
    var html='<div class="robot_news"><div class="first_content">'+json.text+'</div><br>';
    $(json.list).each(function(i){
        if(i<3){
            html+='<div  class="news_others">';
            html+='<a href="'+this.detailurl+'" style="text-decoration:none;" target="_blank">';
            if(typeof(this.icon)!=='undefined'&&this.icon!==null&&this.icon!==''){
                html+='<div class="news_other_pic"><img src="'+this.icon+'" class="other_pic_img" style="float:right;width:38px;height:38px;"></div>';
            }
            html+='<div class="news_desc" style="font-size: 14px; max-height: 45px; margin: 0px 50px 5px 0px; color: grey;">'+this.name+'&nbsp;&nbsp;'+this.price+'&nbsp;&nbsp;'+this.count+'<br>'+this.info+'</div></a></div>';
        }
    });
    html+='</div>';
    $("#mainMeaasge").append(html);
    $("#mainMeaasge").scrollTop( $('#mainMeaasge')[0].scrollHeight );
}

//优惠
function favorable_html(json){
    var html='<div class="robot_news"><div class="first_content">'+json.text+'</div><br>';
    $(json.list).each(function(i){
        if(i<3){
            html+='<div  class="news_others">';
            html+='<a href="'+this.detailurl+'" style="text-decoration:none;" target="_blank">';
            if(typeof(this.icon)!=='undefined'&&this.icon!==null&&this.icon!==''){
                html+='<div class="news_other_pic"><img src="'+this.icon+'" class="other_pic_img" style="float:right;width:38px;height:38px;"></div>';
            }
            html+='<div class="news_desc" style="font-size: 14px; max-height: 45px; margin: 0px 50px 5px 0px; color: grey;">'+this.name+'<br>'+this.info+'</div></a></div>';
        }
    });
    html+='</div>';
    $("#mainMeaasge").append(html);
    $("#mainMeaasge").scrollTop( $('#mainMeaasge')[0].scrollHeight );
}

//酒店
function hotel_html(json){
    var html='<div class="robot_news"><div class="first_content">'+json.text+'</div><br>';
    $(json.list).each(function(i){
        if(i<3){
            html+='<div  class="news_others">';
            html+='<a href="'+this.detailurl+'" style="text-decoration:none;" target="_blank">';
            if(typeof(this.icon)!=='undefined'&&this.icon!==null&&this.icon!==''){
                html+='<div class="news_other_pic"><img src="'+this.icon+'" class="other_pic_img" style="float:right;width:38px;height:38px;"></div>';
            }
            var count='';
            if(typeof(this.count)!=='undefined'&&this.count!==null){
                count=this.count;
            }
            html+='<div class="news_desc" style="font-size: 14px; max-height: 45px; margin: 0px 50px 5px 0px; color: grey;">'+this.name+'&nbsp;&nbsp;'+this.price+'&nbsp;&nbsp;'+count+'<br>'+this.satisfaction+'</div></a></div>';
        }
    });
    html+='</div>';
    $("#mainMeaasge").append(html);
    $("#mainMeaasge").scrollTop( $('#mainMeaasge')[0].scrollHeight );
}

//彩票
function lottery_html(json){
    var html='<div class="robot_news"><div class="first_content">'+json.text+'</div><br>';
    $(json.list).each(function(i){
        if(i<3){
            html+='<div  class="news_others">';
            html+='<a href="'+this.detailurl+'" style="text-decoration:none;" target="_blank">';
            if(typeof(this.icon)!=='undefined'&&this.icon!==null&&this.icon!==''){
                html+='<div class="news_other_pic"><img src="'+this.icon+'" class="other_pic_img" style="float:right;width:38px;height:38px;"></div>';
            }
            html+='<div class="news_desc" style="font-size: 14px; max-height: 45px; margin: 0px 50px 5px 0px; color: grey;">'+this.number+'<br>'+this.info+'</div></a></div>';
        }
    });
    html+='</div>';
    $("#mainMeaasge").append(html);
    $("#mainMeaasge").scrollTop( $('#mainMeaasge')[0].scrollHeight );
}

//价格
function price_html(json){
    var html='<div class="robot_news"><div class="first_content">'+json.text+'</div><br>';
    $(json.list).each(function(i){
        if(i<3){
            html+='<div  class="news_others">';
            html+='<a href="'+this.detailurl+'" style="text-decoration:none;" target="_blank">';
            if(typeof(this.icon)!=='undefined'&&this.icon!==null&&this.icon!==''){
                html+='<div class="news_other_pic"><img src="'+this.icon+'" class="other_pic_img" style="float:right;width:38px;height:38px;"></div>';
            }
            html+='<div class="news_desc" style="font-size: 14px; max-height: 45px; margin: 0px 50px 5px 0px; color: grey;">'+this.name+'<br>'+this.price+'</div></a></div>';
        }
    });
    html+='</div>';
    $("#mainMeaasge").append(html);
    $("#mainMeaasge").scrollTop( $('#mainMeaasge')[0].scrollHeight );
}

//餐厅
function restaurant_html(json){
    var html='<div class="robot_news"><div class="first_content">'+json.text+'</div><br>';
    $(json.list).each(function(i){
        if(i<3){
            html+='<div  class="news_others">';
            html+='<a href="'+this.detailurl+'" style="text-decoration:none;" target="_blank">';
            if(typeof(this.icon)!=='undefined'&&this.icon!==null&&this.icon!==''){
                html+='<div class="news_other_pic"><img src="'+this.icon+'" class="other_pic_img" style="float:right;width:38px;height:38px;"></div>';
            }
            html+='<div class="news_desc" style="font-size: 14px; max-height: 45px; margin: 0px 50px 5px 0px; color: grey;">'+this.name+'<br>'+this.price+'</div></a></div>';
        }
    });
    html+='</div>';
    $("#mainMeaasge").append(html);
    $("#mainMeaasge").scrollTop( $('#mainMeaasge')[0].scrollHeight );
}
