var express = require('express');
var router = express.Router();
var Url = require('url');
var config = require('../config');
var mysqlUtil = require('../utils/mysqlUtil');
var util = require('../utils/util');
var comment = 'comment';

/* 新增评论 */
router.get('/addComment', function(req, res) {
	var params = Url.parse(req.url,true).query; 
	var content=params.content;
	var articleid=params.articleid;
	var obj=new Object();
	obj.id = util.getId();
	obj.content=content;
	obj.userid=req.session.user.id;
	obj.create_date=util.getDate();
	obj.articleid=articleid;
	mysqlUtil.insert(comment,obj,function(err,doc){
		if(err){
			console.log(err);
			res.send({status:'fail',message:'评论失败'});
		}else{
			res.send({status:'success',message:'评论成功'});
		}
	});
});

/* 删除评论 */
router.get('/deleteComment', function(req, res) {
	var params = Url.parse(req.url,true).query; 
	var commentid=params.commentid;
	console.log(commentid);
	mysqlUtil.deleteById(comment,commentid,function(err){
		if(err){
			res.send({status:'fail',message:'删除失败'});
		}else{
			res.send({status:'success',message:'删除成功'});
		}	
	});
});

/* 评论管理 */
router.get('/commentlist', function(req, res) {
	var params = Url.parse(req.url,true).query; 
	var cusername=params.cusername;
	if(typeof(cusername)==='undefined'||cusername===null){
		cusername='';
	}
	var csql = 'select count(*) count from comment c , user u where c.userid=u.id and u.username like "%'+cusername+'%"'; 
	var sql = 'select c.*,u.username,u.avatar,a.title from comment c ,article a, user u where c.articleid=a.id and c.userid=u.id and u.username like "%'+cusername+'%" order by create_date desc ';
	
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
	mysqlUtil.countBySql(csql,function (err, count) {
		if(!err){
			mysqlUtil.queryWithPage(pageIndex,pageSize,sql,function (err,docs) {
				if(err){
					console.log(err);
					res.render('error', {
						message: '搜索/查询评论列表出错',
						error: {}
					});
				}else{
					res.render('comment/commentControl', {cusername:cusername,pageSize:pageSize,totalCount:count.count,list:docs});
				}
			});
		}else{
			console.log(err);
			res.render('error', {
				message: '搜索/查询评论列表出错',
				error: {}
			});
		}
	});
});



router.get('/getCommentlist', function(req, res) {
	var params = Url.parse(req.url,true).query; 
	var condition=params.condition;
	var pageIndex=params.pageIndex;
	var pageSize=params.pageSize;
	var articleid=params.articleid;
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
	var obj=null;
	if(typeof(condition)!=='undefined'&&condition!==null&&condition!==''){
		obj=' where u.username like "%'+condition+'%" ';
	}
	if(typeof(articleid)!=='undefined'&&articleid!==null&&articleid!==''){
		if(obj===null){
			obj = ' where c.articleid = "'+articleid+'"' ;
		}else {
			obj += ' and c.articleid = "'+articleid+'"' ;
		}
	}
	var csql='select count(*) count from comment c , user u '+obj;
	var sql='select c.*,u.username,u.avatar from comment c , user u '+obj + 'order by create_date desc ';
	mysqlUtil.countBySql(csql,function (err, count) {
		if(err){
			res.send({status:'fail'});
			return;
		}
		mysqlUtil.queryWithPage(pageIndex,pageSize,sql,function (err, docs) {
			if(err){
				res.send({status:'fail'});
			}else{
				var has_more=false;
				if(count.count<=pageIndex*pageSize){
					has_more=false;
				}else{
					has_more=true;
				}
				res.send({has_more:has_more,pageIndex:(pageIndex+1),pageSize:pageSize,list:docs,status:'success'});
			}
		});
	});
})

module.exports = router;
