var express = require('express');
var router = express.Router();
var Url = require('url');
var config = require('../config');
var mysqlUtil = require('../utils/mysqlUtil');
var log = require('../log').logger('w2r');
var login = 'login';

/* 用户登录管理 */
router.get('/loginlist', function(req, res) {
	var params = Url.parse(req.url,true).query; 
	var username=params.username;
	if(typeof(username)==='undefined'||username===null){
		username='';
	}
	var csql = 'select count(*) count from login l , user u where l.userid=u.id and u.username like "%'+username+'%"';
	var sql = 'select l.*,u.username,u.avatar from login l , user u where l.userid=u.id and u.username like "%'+username+'%" order by login_date desc ';
	
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
			mysqlUtil.queryWithPage(pageIndex,pageSize,sql,function (err, docs) {
				if(err){
					util.renderError(err,res,'搜索/查询用户登录列表出错');
				}else{
					res.render('login/loginlistControl', {username:username,pageSize:pageSize,totalCount:count.count,list:docs});
				}
			});
		}else{
			util.renderError(err,res,'搜索/查询用户登录列表出错');
		}
	});
});


router.get('/getLoginlist', function(req, res) {
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
	var obj='';
	if(typeof(condition)!=='undefined'&&condition!==null&&condition!==''){
		obj=' and u.username like "%'+condition+'%" ';
	}
	var sql='select l.*,u.username,u.avatar from login l , user u where l.userid=u.id '+obj + 'order by login_date desc ';	
	mysqlUtil.queryWithPage(pageIndex,pageSize,sql,function (err, docs) {
		if(err){
			log.error(err);
			res.send({status:'fail'});
		}else{
			res.send({list:docs,status:'success'});
		}
	});
})

/* 删除用户登录信息 */
router.get('/login/delete', function(req, res) {
	var params = Url.parse(req.url,true).query; 
	var loginid=params.loginid;
	mysqlUtil.deleteById(login,loginid,function(err){
		util.send(err,res,'删除成功','删除失败');
	});
});

module.exports = router;
