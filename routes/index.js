var express = require('express');
var router = express.Router();
var Url = require('url');
var config = require('../config');
var mysqlUtil = require('../utils/mysqlUtil');
var util = require('../utils/util');
var log = require('../log').logger('w2r');

/* GET home page. */
router.get('/', function(req, res) {
	var params = Url.parse(req.url,true).query; 
	var pageIndex=params.pageIndex;
	var pageSize=params.pageSize;
	if(typeof(pageIndex)==='undefined'||pageIndex===null||pageIndex===''){
		pageIndex=1;
	}else{
		pageIndex=pageIndex*1;
	}
	if(typeof(pageSize)==='undefined'||pageSize===null||pageSize===''){
		pageSize=10;
	}else{
		pageSize=pageSize*1;
	}
	var csql = 'select count(*) count from (select * from article where status=1) a , user u where a.author_id=u.id '; 
	var sql = 'select a.*,u.username,u.avatar count from (select * from article where status=1) a , user u where a.author_id=u.id order by a.update_date desc'; 
	mysqlUtil.countBySql(csql,function (err,count) {
		if(err){
			log.error(err);
			res.render('error', {
				message: '访问失败',
				error: {}
			});
		}else{
			mysqlUtil.queryWithPage(pageIndex,pageSize,sql,function (err, docs) {
				if(err){
					log.error(err);
					res.render('error', {
						message: '访问失败',
						error: {}
					});
				}else{
					var has_more=false;
					if(count.count<=pageIndex*pageSize){
						has_more=false;
					}else{
						has_more=true;
					}
					res.render('index', {has_more:has_more,pageIndex:(pageIndex+1),pageSize:pageSize,title: config.name,count:count.count,list:docs});
				}
			});
		}
	});
});

router.get('/help', function(req, res) {
  res.render('help');
});

router.get('/contact', function(req, res) {
  res.render('contact');
});

module.exports = router;
