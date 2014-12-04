var express = require('express');
var router = express.Router();
var Url = require('url');
var config = require('../config');
var mysqlUtil = require('../utils/mysqlUtil');
var util = require('../utils/util');
var message = 'message';

/* 根据角色发站内信 */
router.get('/addMessage', function(req, res) {
	var params = Url.parse(req.url,true).query; 
	var content=params.content;
	var roletype=params.roletype;
	var send_date=util.getDate();
	var roles = '"'+roletype.replace(',','","')+'"';
	var sql = 'select * from user where role_type in ('+roles+')';
    mysqlUtil.query(sql,function(err,docs){
        for(var i=0;i<docs.length;i++){
            var obj=new Object();
			obj.id=util.getId();
            obj.content=content;
            obj.send_userid=req.session.user.id;
            obj.to_userid=docs[i].id;
            obj.send_date=send_date;
            mysqlUtil.insert(message,obj,function(err,doc){
                if(err){
                    console.log(err);
                    res.send({status:'fail',message:'发送失败'});
                }
            });
        }
        setTimeout(mysqlUtil.count(message,'to_userid="'+req.session.user.id+'" and has_read=0',function(err,count){
            if(err){
                res.send({status:'fail',message:'发送失败'});
            }else{
                req.session.message_count = count.count;
                res.send({status:'success',message:'发送成功'});
            }
        }),10);
    });
});

/* 根据用户名发站内信 */
router.get('/addMessageByUsername', function(req, res) {
	var params = Url.parse(req.url,true).query; 
	var content=params.content;
	var tousername=params.tousername.split(',');
	var send_date=util.getDate();
	for(var i in tousername){
		mysqlUtil.getOne('user',' username = "'+tousername[i]+'"',function(err,doc){
			var obj=new Object();
            obj.id=util.getId();
			obj.content=content;
			obj.send_userid=req.session.user.id;
			obj.to_userid=doc.id;
			obj.send_date=send_date;
			mysqlUtil.insert(message,obj,function(err,doc){
                if(err){
                    console.log(err);
                    res.send({status:'fail',message:'发送失败'});
                }
            });
		})
	}
	setTimeout(mysqlUtil.count(message,'to_userid="'+req.session.user.id+'" and has_read=0',function(err,count){
		if(err){
			res.send({status:'fail',message:'发送失败'});
		}else{
			req.session.message_count = count.count;
			res.send({status:'success',message:'发送成功'});
		}
	}),10);
});

/* 删除站内信 */
router.get('/deleteMessage', function(req, res) {
	var params = Url.parse(req.url,true).query; 
	var messageid=params.messageid;
	var userid=req.session.user.id;
	console.log(messageid);
	mysqlUtil.deleteById(message,messageid,function(err){
		if(err){
			res.send({status:'fail',message:'删除失败'});
		}else{
			//刷新当前登录人的未读信息条数
			mysqlUtil.count(message,'to_userid="'+userid+'" and has_read=0',function(err,count){
				if(err){
					res.send({status:'fail',message:'删除失败'});
				}else{
					req.session.message_count = count.count;
					res.send({status:'success',message:'删除成功'});
				}	
			})
		}	
	});
});

/* 站内信管理 */
router.get('/messagelist', function(req, res) {
	var params = Url.parse(req.url,true).query; 
	var username=params.username;
	if(typeof(username)==='undefined'||username===null){
		username='';
	}
	if(typeof(pageIndex)==='undefined'||pageIndex===null||pageIndex===''){
		pageIndex=1;
	}else{
		pageIndex=pageIndex*1;
	}
	if(typeof(pageSize)==='undefined'||pageSize===null||pageSize===''){
		pageSize=config.user_pageSize;
	}else{
		pageSize=pageSize*1;
	}
	var csql=' select count(*) count from  (select m.* ,u.username send_username,(select username from user where id=m.to_userid) to_username from message m ,user u where m.send_userid = u.id ) tab where tab.send_username like "%'+username+'%"  or tab.to_username like "%'+username+'%" ';
	var sql=' select * from  (select m.* ,u.username send_username,(select username from user where id=m.to_userid) to_username from message m ,user u where m.send_userid = u.id ) tab where tab.send_username like "%'+username+'%"  or tab.to_username like "%'+username+'%" order by send_date desc ';
	mysqlUtil.countBySql(csql,function (err, count) {
		if(!err){
			mysqlUtil.queryWithPage(pageIndex,pageSize,sql,function (err, docs) {
				if(err){
					console.log(err);
					res.render('error', {
						message: '搜索/查询站内信列表出错',
						error: {}
					});
				}else{
					res.render('message/messageControl', {username:username,pageSize:pageSize,totalCount:count.count,list:docs});
				}
			});
		}else{
			console.log(err);
			res.render('error', {
				message: '搜索/查询站内信列表出错',
				error: {}
			});
		}
	});
});

router.get('/getMessagelist', function(req, res) {
	var params = Url.parse(req.url,true).query; 
	var condition=params.condition;
	var pageIndex=params.pageIndex;
	var pageSize=params.pageSize;
	if(typeof(pageIndex)==='undefined'||pageIndex===null||pageIndex===''){
		pageIndex=1;
	}else{
		pageIndex=pageIndex*1;
	}
	if(typeof(pageSize)==='undefined'||pageSize===null||pageSize===''){
		pageSize=config.user_pageSize;
	}else{
		pageSize=pageSize*1;
	}
	if(typeof(condition)==='undefined'||condition===null){
		condition='';
	}
	var sql=' select * from  (select m.* ,u.username send_username,(select username from user where userid=m.to_userid) to_username from message m ,user u ) tab where tab.send_username like "%'+condition+'%"  or tab.to_username like "%'+condition+'%" order by send_date desc ';
	mysqlUtil.queryWithPage(pageIndex,pageSize,sql,function (err, docs) {
		if(err){
			res.send({status:'fail'});
		}else{
			res.send({list:docs,status:'success'});
		}
	});
})

/* 站内信 */
router.get('/message', function(req, res) {
	var userid=req.session.user.id;
	var sql=' select m.* ,u.username send_username ,u.avatar from message m ,user u where m.send_userid = u.id and  m.to_userid = "'+userid+'" order by send_date desc ';
	mysqlUtil.query(sql,function(err,docs){
		if(err){
			console.log(err);
			res.render('error', {
				message: '站内信列表出错',
				error: {}
			});
		}else{
			console.log(docs);
			res.render('message/message',{list:docs});
		}	
	});
});

/* 站内信改变已读 */
router.get('/changeRead', function(req, res) {
	var params = Url.parse(req.url,true).query; 
	var messageid=params.messageid;
	var userid=req.session.user.id;
	mysqlUtil.updateById(message,messageid, 'has_read=1', function(err){
		if(err){
			res.send({status:'fail',message:'操作失败'});
		}else{
			mysqlUtil.count(message,' to_userid = "'+ userid +'" and has_read = 0 ',function(err,count){
				if(err){
					res.send({status:'fail',message:'操作失败'});
				}else{
					req.session.message_count = count.count;
					res.send({status:'success',message:'操作成功'});
				}	
			})
		}
	});
});

/* 站内信修改 */
router.get('/saveMessage', function(req, res) {
	var params = Url.parse(req.url,true).query; 
	var messageid=params.messageid;
	var content=params.content;
	mysqlUtil.updateById(message,messageid,'content="'+content+'"',function(err){
		if(err){
			res.send({status:'fail',message:'保存失败'});
		}else{
			res.send({status:'success',message:'保存成功'});
		}
	});
});

module.exports = router;
