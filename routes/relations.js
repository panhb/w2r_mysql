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
        return res.render('user/login');
    }else{
        var current_user = req.session.user.id;
        //统计分享的文章数
        mysqlUtil.count(article,' author_id = "'+userid+'" and status = 1 ',function (err,count) {
            if(err){
                log.error(err);
                res.render('error', {
                    message: '访问失败',
                    error: {}
                });
            }else{
                //获取用户信息
                mysqlUtil.getById(user, userid ,function (err,user) {
                    if(err){
                        log.error(err);
                        res.render('error', {
                            message: '访问失败',
                            error: {}
                        });
                    }else{
                        //查询是否已关注
                        mysqlUtil.getOne(relation, ' followid = "'+userid+'" and userid = "'+current_user+'" ' ,function (err,relation) {
                            if(err){
                                log.error(err);
                                res.render('error', {
                                    message: '访问失败',
                                    error: {}
                                });
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
            if(err){
                log.error(err);
                res.send({status:'fail',message:'关注失败'});
            }else{
                res.send({status:'success',message:'关注成功'});
            }
        })
    } else {
        mysqlUtil.query( 'delete from relation where userid = "'+userid+'" and followid = "'+followid+'" ' ,function (err) {
            if(err){
                log.error(err);
                res.send({status:'fail',message:'取消关注失败'});
            }else{
                res.send({status:'success',message:'取消关注成功'});
            }
        })
    }
});

router.get('/myfollowlist', function(req, res) {
    var userid = req.session.user.id;
    var sql = ' select r.*,u.username,u.avatar from relation r ,user u where r.followid = u.id and r.userid = "'+userid+'" order by create_date desc ';
    mysqlUtil.query(sql ,function (err,docs) {
        if(err){
            log.error(err);
            res.render('error', {
                message: '访问失败',
                error: {}
            });
        }else{
            res.render('relation/myfollowlist', {list : docs})
        }
    })
});

router.get('/getFollowlist', function(req, res) {
    var params = Url.parse(req.url,true).query;
    var username=params.username;
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
            mysqlUtil.queryWithPage(pageIndex,pageSize,sql,function (err, docs) {
                if(err){
                    log.error(err);
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
        }
    });
});

/* 根据id删除关注 */
router.get('/deleteFollow', function(req, res) {
    var params = Url.parse(req.url,true).query;
    var id = params.id;
    log.info('关注id:'+id);
    mysqlUtil.deleteById(relation,id,function (err) {
        if(err){
            log.error(err);
            res.send({status:'fail',message:'删除失败'});
        }else{
            res.send({status:'success',message:'删除成功'});
        }
    });
});

/* 关注管理 */
router.get('/followControl', function(req, res) {
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
    var csql=' select count(*) count from  (select r.* ,u.username ,(select username from user where id=r.followid) followname from relation r ,user u where r.userid = u.id ) tab where tab.username like "%'+username+'%"  or tab.followname like "%'+username+'%" ';
    var sql=' select * from  (select r.* ,u.username ,(select username from user where id=r.followid) followname from relation r ,user u where r.userid = u.id ) tab where tab.username like "%'+username+'%"  or tab.followname like "%'+username+'%" order by create_date desc ';
    mysqlUtil.countBySql(csql,function (err, count) {
        if(!err){
            mysqlUtil.queryWithPage(pageIndex,pageSize,sql,function (err, docs) {
                if(err){
                    log.error(err);
                    res.render('error', {
                        message: '搜索/查询关注列表出错',
                        error: {}
                    });
                }else{
                    res.render('relation/followControl', {username:username,pageSize:pageSize,totalCount:count.count,list:docs});
                }
            });
        }else{
            log.error(err);
            res.render('error', {
                message: '搜索/查询关注列表出错',
                error: {}
            });
        }
    });
});

module.exports = router;
