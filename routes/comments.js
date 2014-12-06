var express = require('express');
var router = express.Router();
var Url = require('url');
var config = require('../config');
var mysqlUtil = require('../utils/mysqlUtil');
var util = require('../utils/util');
var log = require('../log').logger('w2r');
var comment = 'comment';
var user = 'user';
var article = 'article';
var message = 'message';

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
    var usql = ' update article set reply_count = reply_count+1  where id = "'+articleid+'"';
    mysqlUtil.query(usql,function (err){
        if(err){
            log.error(err);
            res.send({status:'fail',message:'评论失败'});
        }else{
            mysqlUtil.insert(comment,obj,function(err){
                if(err){
                    log.error(err);
                    res.send({status:'fail',message:'评论失败'});
                }else{
                    mysqlUtil.getById(article,articleid,function(err,article){
                        if(err){
                            log.error(err);
                        }
                        mysqlUtil.getById(user,article.author_id,function(err,author){
                            if(err){
                                log.error(err);
                            }
                            //随机抽取一位管理员发送激活提示
                            mysqlUtil.getOne(user,'role_type = 1',function(err,user){
                                var obj=new Object();
                                obj.id=util.getId();
                                obj.content=req.session.user.username+' 在您的《<a target="_blank" href="/articles/reading/'+article.id+'">'+article.title+'</a>》发表了一条评论。';
                                obj.send_userid=user.id;
                                obj.to_userid=author.id;
                                obj.send_date=util.getDate();
                                mysqlUtil.insert(message,obj,function(err){
                                    if(err){
                                        log.error(err);
                                    }
                                    res.send({status:'success',message:'评论成功'});
                                });
                            })
                        })
                    })
                }
            });
        }
    });
});

/* 删除评论 */
router.get('/deleteComment', function(req, res) {
	var params = Url.parse(req.url,true).query; 
	var commentid=params.commentid;
	log.info(commentid);
	mysqlUtil.deleteById(comment,commentid,function(err){
		if(err){
			log.error(err);
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
					log.error(err);
					res.render('error', {
						message: '搜索/查询评论列表出错',
						error: {}
					});
				}else{
					res.render('comment/commentControl', {cusername:cusername,pageSize:pageSize,totalCount:count.count,list:docs});
				}
			});
		}else{
			log.error(err);
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
	var obj='';
	if(typeof(condition)!=='undefined'&&condition!==null&&condition!==''){
		obj = '  and u.username like "%'+condition+'%" ';
	}
	if(typeof(articleid)!=='undefined'&&articleid!==null&&articleid!==''){
		if(obj===''){
			obj = ' and c.articleid = "'+articleid+'"' ;
		}else {
			obj += ' and c.articleid = "'+articleid+'"' ;
		}
	}
	var csql='select count(*) count from comment c , user u where u.id=c.userid '+obj;
	var sql='select c.*,u.username,u.avatar,a.author_id from comment c , user u, article a where a.id=c.articleid and c.userid = u.id '+obj + ' order by create_date desc ';
	mysqlUtil.countBySql(csql,function (err, count) {
		if(err){
			log.error(err);
			res.send({status:'fail'});
			return;
		}
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
                var articleid = docs[0].articleid;
				res.send({has_more:has_more,articleid:articleid,pageIndex:(pageIndex+1),pageSize:pageSize,list:docs,status:'success'});
			}
		});
	});
})

module.exports = router;
