var express = require('express');
var router = express.Router();
var Url = require('url');
var mysqlUtil = require('../utils/mysqlUtil');
var util = require('../utils/util');
var config = require('../config');
var log = require('../log').logger('w2r');
var user = 'user';
var article = 'article';
var relation = 'relation';

router.get('/follow/:userid', function(req, res) {
    var userid=req.params.userid;
    if (!req.session.user) {
        res.redirect('/users/login');
    }else{
        var current_user = req.session.user.id;
        //统计分享的文章数
        mysqlUtil.count(article,' author_id = "'+userid+'" and status = 1 ',function (err,count) {
            if(err){
                util.renderError(err,res,'访问失败');
            }else{
                //获取用户信息
                mysqlUtil.getById(user, userid ,function (err,user) {
                    if(err){
                        util.renderError(err,res,'访问失败');
                    }else{
                        //查询是否已关注
                        mysqlUtil.getOne(relation, ' followid = "'+userid+'" and userid = "'+current_user+'" ' ,function (err,relation) {
                            if(err){
                                util.renderError(err,res,'访问失败');
                            }else{
                                var has_relation = true ;
                                if( typeof (relation) === 'undefined' ){
                                    has_relation = false ;
                                }
                                res.render('relation/follow', {shareNum : count.count , has_relation : has_relation , user : user})
                            }
                        })
                    }
                })
            }
        })
    }
});

router.get('/focus', function(req, res) {
    var params = Url.parse(req.url,true).query;
    var type = params.type;
    var followid = params.followid;
    var userid = req.session.user.id;

    var obj = new Object();
    obj.id = util.getId();
    obj.userid = userid;
    obj.followid = followid;
    obj.create_date = util.getDate();

    if(type === '1'){
        mysqlUtil.insert(relation , obj , function (err) {
            util.send(err,res,'关注成功','关注失败');
        })
    } else {
        mysqlUtil.query( 'delete from relation where userid = "'+userid+'" and followid = "'+followid+'" ' ,function (err) {
            util.send(err,res,'取消关注成功','取消关注失败');
        })
    }
});

router.get('/myfollowlist', function(req, res) {
    var userid = req.session.user.id;
    var sql = ' select r.*,u.username,u.avatar from relation r ,user u where r.followid = u.id and r.userid = "'+userid+'" order by create_date desc ';
    mysqlUtil.query(sql ,function (err,docs) {
        if(err){
            util.renderError(err,res,'访问失败');
        }else{
            res.render('relation/myfollowlist', {list : docs})
        }
    })
});

router.get('/getFollowlist', function(req, res) {
    var params = Url.parse(req.url,true).query;
    var username = params.username;
    var pageIndex = params.pageIndex;
    var pageSize = params.pageSize;
    var po = new Object();
	po.pageIndex = pageIndex;
	po.pageSize = pageSize;
	po = util.page(po);
    if(typeof(username) === 'undefined' || username === null){
        username = '';
    }
    var csql=' select count(*) count from  (select r.* ,u.username ,(select username from user where id=r.followid) followname from relation r ,user u where r.userid = u.id ) tab where tab.username like "%'+username+'%"  or tab.followname like "%'+username+'%" ';
    var sql=' select * from  (select r.* ,u.username ,(select username from user where id=r.followid) followname from relation r ,user u where r.userid = u.id ) tab where tab.username like "%'+username+'%"  or tab.followname like "%'+username+'%" order by create_date desc ';
    mysqlUtil.countBySql(csql,function (err, count) {
        if(err){
            log.error(err);
            res.send({status:'fail'});
        }else{
            mysqlUtil.queryWithPage(po.pageIndex,po.pageSize,sql,function (err, docs) {
                if(err){
                    log.error(err);
                    res.send({status:'fail'});
                }else{
                    var has_more=false;
                    if(count.count<=po.pageIndex*po.pageSize){
                        has_more=false;
                    }else{
                        has_more=true;
                    }
                    res.send({has_more:has_more,pageIndex:(po.pageIndex+1),pageSize:po.pageSize,list:docs,status:'success'});
                }
            });
        }
    });
});

/* 根据id删除关注 */
router.get('/deleteFollow', function(req, res) {
    var params = Url.parse(req.url,true).query;
    var id = params.id;
    log.info('关注id:'+id);
    mysqlUtil.deleteById(relation,id,function (err) {
        util.send(err,res,'删除成功','删除失败');
    });
});

/* 关注管理 */
router.get('/followControl', function(req, res) {
    var params = Url.parse(req.url,true).query;
    var username = params.username;
    if(typeof(username)==='undefined'||username===null){
        username='';
    }
	var pageIndex = params.pageIndex;
	var pageSize = params.pageSize;
    var po = new Object();
	po.pageIndex = pageIndex;
	po.pageSize = pageSize;
	po = util.page(po);
    var csql=' select count(*) count from  (select r.* ,u.username ,(select username from user where id=r.followid) followname from relation r ,user u where r.userid = u.id ) tab where tab.username like "%'+username+'%"  or tab.followname like "%'+username+'%" ';
    var sql=' select * from  (select r.* ,u.username ,(select username from user where id=r.followid) followname from relation r ,user u where r.userid = u.id ) tab where tab.username like "%'+username+'%"  or tab.followname like "%'+username+'%" order by create_date desc ';
    mysqlUtil.countBySql(csql,function (err, count) {
        if(!err){
            mysqlUtil.queryWithPage(po.pageIndex,po.pageSize,sql,function (err, docs) {
                if(err){
                    util.renderError(err,res,'搜索/查询关注列表出错');
                }else{
                    res.render('relation/followControl', {username:username,pageSize:po.pageSize,totalCount:count.count,list:docs});
                }
            });
        }else{
            util.renderError(err,res,'搜索/查询关注列表出错');
        }
    });
});

module.exports = router;
