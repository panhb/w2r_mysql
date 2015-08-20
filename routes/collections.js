var express = require('express');
var router = express.Router();
var Url = require('url');
var mysqlUtil = require('../utils/mysqlUtil');
var util = require('../utils/util');
var log = require('../log').logger('w2r');
var collect = 'collection';


/* 新增收藏记录 */
router.get('/addCollect', function(req, res) {
	var params = Url.parse(req.url,true).query; 
	var obj = {};
	obj.id = util.getId();
	obj.articleid = params.articleid;
	obj.userid=req.session.user.id;
	obj.create_date=util.getDate();
	mysqlUtil.insert(collect,obj,function(err){
        util.send(err,res,'收藏成功','收藏失败');
    });
});

/* 删除收藏记录 */
router.get('/deleteCollect', function(req, res) {
	var params = Url.parse(req.url,true).query; 
	var articleid = params.articleid;
	var userid = req.session.user.id;
	mysqlUtil.query( 'delete from collection where userid = "'+userid+'" and articleid = "'+articleid+'" ' ,function (err) {
        util.send(err,res,'取消收藏成功','取消收藏失败');
    });
});

/* 我的收藏记录列表 */
router.get('/myCollectlist', function(req, res) {
    var userid = req.session.user.id;
    var csql = ' select count(*) count from collection c ,article a,user u where u.id = a.author_id and c.articleid = a.id and c.userid = "'+userid+'"';
    var sql = ' select a.*,u.username,u.avatar ,c.create_date collect_date from collection c ,article a,user u where u.id = a.author_id and c.articleid = a.id and c.userid = "'+userid+'" order by c.create_date desc ';
    mysqlUtil.countBySql(csql,function (err, count) {
        if(err){
			util.renderError(err,res,'访问失败');
        }else{
            mysqlUtil.query(sql,function (err, docs) {
                if(err){
					util.renderError(err,res,'访问失败');
                }
                for(var i in docs){
                    docs[i].update_date = util.fromNow(docs[i].collect_date);
                }
                res.render('article/collectarticlelist', {count:count.count,list:docs});
            });
        }
    });
});

module.exports = router;
