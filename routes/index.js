var express = require('express');
var router = express.Router();
var Url = require('url');
var config = require('../config');
var mysqlUtil = require('../utils/mysqlUtil');
var util = require('../utils/util');
var log = require('../log').logger('w2r');

/* GET home page. */
router.get('/main', function(req, res) {
	var params = Url.parse(req.url,true).query; 
	var pageIndex = params.pageIndex;
	var pageSize = params.pageSize;
	var po = new Object();
	po.pageIndex = pageIndex;
	po.pageSize = pageSize;
	po = util.page(po);
	var csql = 'select count(*) count from (select * from article where status=1) a , user u where a.author_id=u.id '; 
	var sql = 'select a.*,u.username,u.avatar count from (select * from article where status=1) a , user u where a.author_id=u.id order by a.update_date desc'; 
	mysqlUtil.countBySql(csql,function (err,count) {
		if(err){
			util.renderError(err,res,'访问失败');
		}else{
			mysqlUtil.queryWithPage(po.pageIndex,po.pageSize,sql,function (err, docs) {
				if(err){
					util.renderError(err,res,'访问失败');
				}else{
					var has_more=false;
					if(count.count<=po.pageIndex*po.pageSize){
						has_more=false;
					}else{
						has_more=true;
					}
					res.render('main', {has_more:has_more,pageIndex:(po.pageIndex+1),pageSize:po.pageSize,title: config.name,count:count.count,list:docs});
				}
			});
		}
	});
});

router.get('/', function(req, res) {
	if (req.session.user) {
        res.redirect('/main');
    } else {
    	res.render('index');
    }
});

router.get('/help', function(req, res) {
  res.render('help');
});

router.get('/contact', function(req, res) {
  res.render('contact');
});

module.exports = router;
