var express = require('express');
var router = express.Router();
var Url = require('url');
var fs = require('fs');
var marked = require('marked');
var multipart = require('connect-multiparty');
var multipartMiddleware = multipart();
var config = require('../config');
var mysqlUtil = require('../utils/mysqlUtil');
var util = require('../utils/util');
var log = require('../log').logger('w2r');
var qiniu = require('qiniu');
var moment = require('moment');
moment.locale('zh-cn'); // 使用中文
var article = 'article';
var comment = 'comment';

/* 自动保存  1秒一次 */
router.post('/autoSaveArticle', function(req, res) {
	var content = req.body.content;
	content = util.xss(content);
	content = util.escape(content);
	var article_sessionid = 'article_'+req.sessionID;
	util.redisSet(article_sessionid,content);
	res.send({message:'自动保存成功'});	
});

/* 写文章 */
router.get('/writing', function(req, res) {
	var article_sessionid = 'article_'+req.sessionID;
	util.redisGet(article_sessionid,function(err,content){
		if(err){
			log.error(err);
			res.render('article/editor');
		}else{
			res.render('article/editor', {lastcontent:content});
		}	
	});
});

/* 转文章 */
router.post('/article2html', function(req, res) {
	var content=req.body.content; 
    var html= marked(content);
	res.send({html:html});
});

/* 我的文章列表 */
router.get('/myArticle', function(req, res) {
	var params = Url.parse(req.url,true).query; 
	var author_id = req.session.user.id; 
	var pageIndex = params.pageIndex;
	var pageSize = params.pageSize;
	var po = {};
	po.pageIndex = pageIndex;
	po.pageSize = pageSize;
	po = util.page(po);
	var csql = 'select count(*) count from article a , user u where a.author_id=u.id and a.author_id="'+author_id+'"'; 
	var sql='select a.*,u.username,u.avatar from article a , user u where a.author_id=u.id and a.author_id="'+author_id+'" order by update_date desc'; 
	mysqlUtil.countBySql(csql,function (err,count) {
		if(err){
			util.renderError(err,res,'访问失败');
		}else{
			mysqlUtil.queryWithPage(po.pageIndex,po.pageSize,sql,function (err,docs) {
				if(err){
					util.renderError(err,res,'访问失败');
				}else{
					var has_more=false;
					if(count.count<=po.pageIndex*po.pageSize){
						has_more=false;
					}else{
						has_more=true;
					}
					res.render('article/articlelist', {type:'my',has_more:has_more,pageIndex:(po.pageIndex+1),pageSize:po.pageSize,count:count.count,list:docs});
				}
			});
		}
		
	});
});


/* 我的文章列表 */
router.get('/myArticle2/:pageIndex', function(req, res) {
	var params = Url.parse(req.url,true).query; 
	var author_id = req.session.user.id; 
	var pageIndex=req.params.pageIndex;
	var pageSize = params.pageSize;
	var po = {};
	po.pageIndex = pageIndex;
	po.pageSize = pageSize;
	po = util.page(po);
	var csql = 'select count(*) count from article a , user u where a.author_id=u.id and a.author_id="'+author_id+'"'; 
	var sql='select a.*,u.username,u.avatar from article a , user u where a.author_id=u.id and a.author_id="'+author_id+'" order by update_date desc'; 
	mysqlUtil.countBySql(csql,function (err,count) {
		if(err){
			util.renderError(err,res,'访问失败');
		}else{
			mysqlUtil.queryWithPage(po.pageIndex,po.pageSize,sql,function (err,docs) {
				if(err){
					util.renderError(err,res,'访问失败');
				}else{
					for(var i in docs){
						docs[i].create_date = moment(docs[i].create_date).format('YYYY-MM-DD HH:mm');
						docs[i].update_date = moment(docs[i].update_date).format('YYYY-MM-DD HH:mm');
					}
					res.render('article/myarticlelist2', {count:count.count,list:docs});
				}
			});
		}
		
	});
});

router.get('/getArticlelist', function(req, res) {
	var params = Url.parse(req.url,true).query; 
	var condition = params.condition;
	var pageIndex = params.pageIndex;
	var pageSize = params.pageSize;
	var loadType = params.loadType;
	var po = {};
	po.pageIndex = pageIndex;
	po.pageSize = pageSize;
	po = util.page(po);
	var obj='';
	if(typeof(loadType)!=='undefined'&&loadType!==null&&loadType!==''){
		if(loadType==='share'){
			obj = 'where status = 1';
		}else if(loadType==='my'){
			obj = 'where author_id = "'+req.session.user.id+'"';
		}
	}
	if(typeof(condition)!=='undefined'&&condition!==null&&condition!==''){
        var arr = condition.split(':');
		if(obj===''){
			obj = 'where title like "%'+arr[0]+'%"';
		}else {
			obj += ' and  title like "%'+arr[0]+'%"';
		}
	}
	var csql = 'select count(*) count from (select * from article '+obj+') a , user u where a.author_id=u.id '; 
	var sql = 'select a.*,u.username,u.avatar count from (select * from article '+obj+') a , user u where a.author_id=u.id order by a.update_date desc'; 
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
                    if(loadType==='share'){
						for(var i in docs){
		                    docs[i].update_date = util.fromNow(docs[i].update_date);
		                }
					}
                    res.send({has_more:has_more,pageIndex:(po.pageIndex+1),pageSize:po.pageSize,list:docs,status:'success'});
                }
            });
        }
	});
});

/* 搜索文章列表 */
router.get('/search/articlelist', function(req, res) {
	 var params = Url.parse(req.url,true).query; 
	 var condition = params.condition;
	 var pageIndex = params.pageIndex;
	 var pageSize = params.pageSize;
	 var po = {};
	 po.pageIndex = pageIndex;
	 po.pageSize = pageSize;
	 po = util.page(po);
	 //这里会有漏洞   即使是lastindexof,如果标题中就是含有:my或者:all也会出错  所以暂时这样处理
	 //看是否需要在标题中限制特殊符号
	 var arr=condition.split(':');
	 var type='';
	 var obj='';
	 if(arr.length<2||arr[1]==null||arr[1]==''||arr[1]=='all'||arr[1].replace(' ','')==''||!req.session.user){
		log.info('所有公开文章搜索');
		type='share';
		obj = ' status = 1';
	 }else{
		log.info('我的文章搜索');
		obj = ' author_id = "'+req.session.user.id+'"';
		type='my';
	 }  
	 obj += ' and  title like "%'+arr[0]+'%"';
	 
	 var csql = 'select count(*) count from (select * from article where '+obj+') a , user u where a.author_id=u.id ';
	 var sql = 'select a.*,u.username,u.avatar count from (select * from article where '+obj+') a , user u where a.author_id=u.id order by a.update_date desc';
	
	 mysqlUtil.countBySql(csql,function (err, count) {
		if(err){
			util.renderError(err,res,'访问失败');
		}else{
            mysqlUtil.queryWithPage(po.pageIndex,po.pageSize,sql,function (err, docs) {
                if(err){
                    util.renderError(err,res,'访问失败');
                }
                var has_more=false;
                if(count.count<=po.pageIndex*po.pageSize){
                    has_more=false;
                }else{
                    has_more=true;
                }
                res.render('article/articlelist', {condition:condition,type:type,has_more:has_more,pageIndex:(po.pageIndex+1),pageSize:po.pageSize,count:count.count,list:docs});
            });
        }
	});
});

/* 用户分享的文章列表 */
router.get('/user/articlelist', function(req, res) {
    var params = Url.parse(req.url,true).query;
    var userid = params.userid;
    var csql = 'select count(*) count from (select * from article where author_id = "'+userid+'" and status = 1) a , user u where a.author_id=u.id ';
    var sql = 'select a.*,u.username,u.avatar from (select * from article where author_id = "'+userid+'" and status = 1) a , user u where a.author_id=u.id order by a.update_date desc';
    mysqlUtil.countBySql(csql,function (err, count) {
        if(err || count.count == 0){
			util.renderError(err,res,'访问失败');
        }else{
            mysqlUtil.query(sql,function (err, docs) {
                if(err){
					util.renderError(err,res,'访问失败');
                }
                for(var i in docs){
                    docs[i].update_date = util.fromNow(docs[i].update_date);
                }
                var username = docs[0].username;
                res.render('article/user_sharearticlelist', {username:username,count:count.count,list:docs});
            });
        }
    });
});

/* 保存文章 */
router.post('/addArticle', function(req, res) {
  var content = req.body.content;
  content = util.xss(content);
  content = util.escape(content);
  var title = req.body.title;
  title = util.xss(title);
  title = util.escape(title);
  var article_id=req.body.article_id;
  var height=req.body.height;
  var date = util.getDate();
  var obj={};
  var updateString =' height = "'+height+'" ,content = "'+content+'" ,title = "'+title+'" ,update_date = "'+date+'" ';
  obj.content=content;
  obj.height=height;
  obj.title=title;
  obj.author_id=req.session.user.id;  
  obj.id = util.getId();
  obj.create_date = date;
  obj.update_date = date;
  if(article_id!==null&&article_id!==''){
	mysqlUtil.updateById(article,article_id, updateString,function(err){
		if(err){
			log.error(err);
			res.send({id:article_id,message:'保存失败'});
		}else{
			var article_sessionid = 'article_'+req.sessionID;
			util.redisDel(article_sessionid);
			res.send({id:article_id,message:'保存成功'});
		}
	});
  }else{
	mysqlUtil.insert(article,obj,function(err,doc){
		if(err){
			log.error(err);
			res.send({id:obj.id,message:'保存失败'});
		}else{
			log.info(doc);
			var article_sessionid = 'article_'+req.sessionID;
			util.redisDel(article_sessionid);
			res.send({id:obj.id,message:'保存成功'});
		}
	});
  }
});




/* 根据id获取文章内容 */
router.get('/reading/:id', function(req, res) {
    var id=req.params.id;
    log.info('文章id:'+id);
	var sql='select a.*,u.username,u.avatar from article a , user u where a.author_id=u.id and a.id="'+id+'"'; 
	var csql = 'select c.*,u.username,u.avatar from comment c , user u where c.userid=u.id and c.articleid="'+id+'"';
    var usql = ' update article set visit_count = visit_count+1  where id = "'+id+'"';
    mysqlUtil.query(usql,function (err){
        if(err){
            util.renderError(err,res,'页面不存在');
        }else{
            mysqlUtil.query(sql,function (err, article) {
                log.info(article);
                if(err||typeof(article)==='undefined'||article.length===0){
                    util.renderError(err,res,'页面不存在');
                }else{
                    if(article[0].status==1){
                        mysqlUtil.count(comment,'articleid="'+id+'"',function (err,count) {
                            if(err){
                                util.renderError(err,res,'页面不存在');
                            }else{
                                mysqlUtil.queryWithPage(1,config.user_pageSize*1,csql,function (err, docs) {
                                    if(err){
                                        util.renderError(err,res,'页面不存在');
                                    }else{
                                        article[0].content=marked(article[0].content);
                                        var has_more=false;
                                        if(count.count<=config.user_pageSize*1){
                                            has_more=false;
                                        }else{
                                            has_more=true;
                                        }
                                        var has_collect = false;
                                        if (req.session.user) {
                                        	//是否已收藏文章
				                            var count_sql="select count(*) count from collection where articleid='"+id+"' and userid ='"+req.session.user.id+"'";
				                        	mysqlUtil.countBySql(count_sql,function(err,c){
				                        		if(c.count != 0){
				                        			has_collect = true;
				                        		}
				                        		res.render('article/article', {article:article[0],has_collect:has_collect,has_more:has_more,pageIndex:2,pageSize:config.user_pageSize*1,count:count.count,list:docs});
				                        	})
				                        }else{
				                        	res.render('article/article', {article:article[0],has_more:has_more,pageIndex:2,pageSize:config.user_pageSize*1,count:count.count,list:docs});
				                        }  
                                    }
                                });
                            }
                        });
                    }else{
                        if (!req.session.user) {
                            res.redirect('/users/login');
                        }else{
                            if(req.session.user.id===article[0].author_id||req.session.user.role_type=='1'){
                                mysqlUtil.count(comment,'articleid="'+id+'"',function (err,count) {
                                    if(err){
                                        util.errorRender(err,res,'页面不存在');
                                    }else{
                                        mysqlUtil.queryWithPage(1,config.user_pageSize*1,csql,function (err, docs) {
                                            if(err){
                                                util.renderError(err,res,'页面不存在');
                                            }else{
                                                article[0].content=marked(article[0].content);
                                                var has_more=false;
                                                if(count.count<=config.user_pageSize*1){
                                                    has_more=false;
                                                }else{
                                                    has_more=true;
                                                }
                                                var has_collect = false;
                                                //是否已收藏文章
					                            var count_sql="select count(*) count from collection where articleid='"+id+"' and userid ='"+req.session.user.id+"'";
					                        	mysqlUtil.countBySql(count_sql,function(err,c){
					                        		if(c.count != 0){
					                        			has_collect = true;
					                        		}
					                        		res.render('article/article', {article:article[0],has_collect:has_collect,has_more:has_more,pageIndex:2,pageSize:config.user_pageSize*1,count:count.count,list:docs});
					                        	})
                                            }
                                        });
                                    }
                                });
                            }else{
								util.renderError(err,res,'您没有权限访问该页面');
                            }
                        }
                    }
                }
            });
        }
    })

});




/* 根据id获取文章内容 */
router.get('/allComment/reading/:id', function(req, res) {
    var id=req.params.id;
    log.info('获取文章内容  文章id:'+id);
	var sql='select a.*,u.username,u.avatar from article a , user u where a.author_id=u.id and a.id="'+id+'"'; 
	var csql = 'select c.*,u.username,u.avatar from comment c , user u where c.userid=u.id and c.articleid="'+id+'"'; 
	mysqlUtil.query(sql,function (err, article) {
		if(err||typeof(article)==='undefined'||article.length===0){
			util.renderError(err,res,'页面不存在');
		}else{
			if(article[0].status==1){
				mysqlUtil.query(csql,function (err, docs) {
					if(err){
						util.renderError(err,res,'页面不存在');
					}else{
						article[0].content=marked(article[0].content);
						res.render('article/article', {article:article[0],list:docs});
					}
				});
			}else{
				if (!req.session.user) {
					res.redirect('/users/login');
				}else{
					if(req.session.user.id===article[0].author_id||req.session.user.role_type=='1'){
						mysqlUtil.query(csql,function (err, docs) {	
							if(err){
								util.renderError(err,res,'页面不存在');
							}else{
								article[0].content=marked(article[0].content);
								res.render('article/article', {article:article[0],list:docs});
							}
						});
					}else{
						util.renderError(err,res,'您没有权限访问该页面');
					}
				}
			}
		}	
	});
});

/* 根据id获取文章内容 */
router.get('/editArticle/:id', function(req, res) {
	if (!req.session.user) {
		res.redirect('/users/login');
	}else{
		var id=req.params.id;
		log.info('获取文章内容  文章id:'+id);
		mysqlUtil.getById(article,id, function (err, article) {
			if(err||typeof(article)==='undefined'){
				util.renderError(err,res,'页面不存在');
			}else{
				res.render('article/editor', article);
			}
		});
	}
});

/* 根据id分享文章 */
router.get('/shareArticle', function(req, res) {
    var params = Url.parse(req.url,true).query;
	var id = params.id;
	var status = params.status;
	var updateString = 'status='+status+',update_date="'+util.getDate()+'"'
    log.info('文章id:'+id+',状态:'+status);
	mysqlUtil.updateById(article,id,updateString,function(err){
		util.send(err,res,'操作成功','操作失败');
	});
});

/* 根据id删除文章 */
router.get('/deleteArticle', function(req, res) {
    var params = Url.parse(req.url,true).query;
	var id = params.id;
    log.info('文章id:'+id);
    /*
	mysqlUtil.deleteById(article,id,function (err) {
		util.send(err,res,'删除成功','删除失败');
	});
	*/

	/*  事务的方式处理  先删除评论 删除收藏 最后删除文章 */
	var pool = mysqlUtil.connection;

	pool.getConnection(function (err, connection) {
		if (err) {
			log.error(err);
			res.send({status:'success',message:'删除失败'});
		}
		var sql = [ 'delete from comment where articleid = ?',
				    'delete from collection where articleid = ?',
					'delete from article where id = ?'];
		connection.beginTransaction(function(err) {
			if (err) {
				log.error(err);
				res.send({status:'success',message:'删除失败'});
			}
			connection.query(sql[0], id, function(err, result) {
			    if (err) {
				    return connection.rollback(function() {
				        log.error(err);
						res.send({status:'fail',message:'删除失败'});
				    });	
			    }
			    connection.query(sql[1], id, function(err, result) {
				    if (err) {
					    return connection.rollback(function() {
					        log.error(err);
							res.send({status:'fail',message:'删除失败'});
					    });	
				    }
				    connection.query(sql[2], id, function(err, result) {
					    if (err) {
						    return connection.rollback(function() {
						        log.error(err);
								res.send({status:'fail',message:'删除失败'});
						    });	
					    }
					    connection.commit(function(err) {
					        if (err) {
						        return connection.rollback(function() {
						            res.send({status:'fail',message:'删除失败'});
						        });
					        }
					        res.send({status:'success',message:'删除成功'});
					     });
				    });
			    });
		    });
		});
	});
});

/* 文章管理 */
router.get('/articleControl', function(req, res) {
	var params = Url.parse(req.url,true).query; 
	var title=params.title;
	if(typeof(title)==='undefined'||title===null){
		title='';
	}
	var obj=' where title like "%'+title+'%"';
	var pageIndex = params.pageIndex;
	var pageSize = params.pageSize;
	var po = new Object();
	po.pageIndex = pageIndex;
	po.pageSize = pageSize;
	po = util.page(po);
	var csql = 'select count(*) count from (select * from article '+obj+') a , user u where a.author_id=u.id '; 
	var sql = 'select a.*,u.username,u.avatar count from (select * from article '+obj+') a , user u where a.author_id=u.id order by a.update_date desc'; 
	mysqlUtil.countBySql(csql,function (err, count) {
		if(!err){
			mysqlUtil.queryWithPage(po.pageIndex,po.pageSize,sql,function (err, docs) {
				if(err){
					util.renderError(err,res,'搜索/查询文章列表出错');
				}else{
					res.render('article/articlelistControl', {title:title,pageSize:po.pageSize,totalCount:count.count,list:docs});
				}
			});
		}else{
			util.renderError(err,res,'搜索/查询文章列表出错');
		}
	});
});

/* 导入 */
router.post('/import', multipartMiddleware,function(req, res) {
  log.info(req.body);
  log.info(req.files);
  var temp = req.files.file;
  log.info(temp);
  var path = req.files.file[0].path; 
  log.info(path);
	if (path) {  
		fs.readFile(path,'utf-8', function(err, content) {
			//文件的内容
			content = util.xss(content);
			content = util.escape(content);
			log.info(content);
			res.send(content);
			// 删除临时文件
			fs.unlink(path);
		});
	}
});



/* 上传图片 */
router.post('/uploadImage', multipartMiddleware,function(req, res) {
    /*
    qiniu.conf.ACCESS_KEY = config.qiniu_options.access_key;
    qiniu.conf.SECRET_KEY = config.qiniu_options.secret_key;
    var putPolicy = new qiniu.rs.PutPolicy(config.qiniu_options.bucketname);
    var uptoken = putPolicy.token();
    var extra = new qiniu.io.PutExtra();
    extra.mimeType = 'image/jpeg';
    var originalFilename = req.files.file.originalFilename;
    var fileName = originalFilename.substring(0,originalFilename.lastIndexOf('.'))
    fileName = util.toMd5(fileName + util.getDate());
    var fileSuffix = originalFilename.substring(originalFilename.lastIndexOf('.'))
    var key = fileName + fileSuffix;
    */

    qn_init(req.files.file,function(uptoken,key,extra){
        qiniu.io.putFile(uptoken, key, req.files.file.path, extra, function(err, ret) {
            //不论上传成功还是失败都删除临时文件
            console.log('图片临时文件地址：'+req.files.file.path);
            fs.unlink(req.files.file.path);
            if (!err) {
                // 上传成功， 处理返回值
                console.log(ret.key, ret.hash);
                // ret.key & ret.hash
                res.json({
                    success: true,
                    url: config.qiniu_options.domain+"/"+key
                });
            } else {
                // 上传失败， 处理返回代码
                console.log(err)
                // http://developer.qiniu.com/docs/v6/api/reference/codes.html
            }
        })
    })

});

router.post('/uploadImage2',function(req, res) {
    req.busboy.on('file', function (fieldname, file, filename, encoding, mimetype) {
        qn_init(filename,function(uptoken,key,extra) {
            qiniu.io.put(uptoken, key, file, extra, function(err, ret) {
                if (!err) {
                    // 上传成功， 处理返回值
                    console.log(ret.key, ret.hash);
                    // ret.key & ret.hash
                    res.json({
                        success: true,
                        url: config.qiniu_options.domain+"/"+key
                    });
                } else {
                    // 上传失败， 处理返回代码
                    console.log(err)
                    // http://developer.qiniu.com/docs/v6/api/reference/codes.html
                }
            })
        })
    });
    req.pipe(req.busboy);
})


function qn_init(file,callback){

    qiniu.conf.ACCESS_KEY = config.qiniu_options.access_key;
    qiniu.conf.SECRET_KEY = config.qiniu_options.secret_key;
    var putPolicy = new qiniu.rs.PutPolicy(config.qiniu_options.bucketname);
    var uptoken = putPolicy.token();
    var extra = new qiniu.io.PutExtra();
    extra.mimeType = 'image/jpeg';

    var originalFilename = typeof(file) === 'string' ? file :file.originalFilename;
    var fileName = originalFilename.substring(0,originalFilename.lastIndexOf('.'))
    fileName = util.toMd5(fileName + util.getDate());
    var fileSuffix = originalFilename.substring(originalFilename.lastIndexOf('.'))
    var key = fileName + fileSuffix;

    callback(uptoken,key,extra);
}
module.exports = router;
