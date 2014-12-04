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
var article = 'article';
var comment = 'comment';

/* 写文章 */
router.get('/writing', function(req, res) {
  res.render('article/editor');
});

/* 转文章 */
router.get('/article2html', function(req, res) {
	var params = Url.parse(req.url,true).query; 
	var content=params.content;
    var html=marked(content);
	res.send({html:html});
});

/* 我的文章列表 */
router.get('/myArticle', function(req, res) {
	var params = Url.parse(req.url,true).query; 
	var author_id=req.session.user.id; 
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
	var csql = 'select count(*) count from article a , user u where a.author_id=u.id and a.author_id="'+author_id+'"'; 
	var sql='select a.*,u.username,u.avatar from article a , user u where a.author_id=u.id and a.author_id="'+author_id+'" order by update_date desc'; 
	mysqlUtil.countBySql(csql,function (err,count) {
		mysqlUtil.queryWithPage(pageIndex,pageSize,sql,function (err,docs) {
			var has_more=false;
			if(count.count<=pageIndex*pageSize){
				has_more=false;
			}else{
				has_more=true;
			}
			res.render('article/articlelist', {type:'my',has_more:has_more,pageIndex:(pageIndex+1),pageSize:pageSize,count:count.count,list:docs});
		});
	});
});

router.get('/getArticlelist', function(req, res) {
	var params = Url.parse(req.url,true).query; 
	var condition=params.condition;
	var pageIndex=params.pageIndex;
	var pageSize=params.pageSize;
	var loadType=params.loadType;
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
	if(typeof(loadType)!=='undefined'&&loadType!==null&&loadType!==''){
		if(loadType==='share'){
			obj = 'where status = 1';
		}else if(loadType==='my'){
			obj = 'where author_id = "'+req.session.user.id+'"';
		}
	}
	if(typeof(condition)!=='undefined'&&condition!==null&&condition!==''){
        var arr = condition.split(':');
		if(obj===null){
			obj = 'where title like "%'+arr[0]+'%"';
		}else {
			obj += ' and  title like "%'+arr[0]+'%"';
		}
	}
	var csql = 'select count(*) count from (select * from article '+obj+') a , user u where a.author_id=u.id '; 
	var sql = 'select a.*,u.username,u.avatar count from (select * from article '+obj+') a , user u where a.author_id=u.id order by a.update_date desc'; 
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

/* 搜索文章列表 */
router.get('/search/articlelist', function(req, res) {
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
	 //这里会有漏洞   即使是lastindexof,如果标题中就是含有:my或者:all也会出错  所以暂时这样处理
	 //看是否需要在标题中限制特殊符号
	 var arr=condition.split(':');
	 var type='';
	 var obj=null;
	 if(arr.length<2||arr[1]==null||arr[1]==''||arr[1]=='all'||arr[1].replace(' ','')==''||!req.session.user){
		console.log('所有公开文章搜索');
		type='share';
		obj = ' status = 1';
	 }else{
		console.log('我的文章搜索');
		obj = ' author_id = "'+req.session.user.id+'"';
		type='my';
	 }  
	 obj += ' and  title like "%'+arr[0]+'%"';
	 
	 var csql = 'select count(*) count from (select * from article where '+obj+') a , user u where a.author_id=u.id ';
	 var sql = 'select a.*,u.username,u.avatar count from (select * from article where '+obj+') a , user u where a.author_id=u.id order by a.update_date desc';
	
	 mysqlUtil.countBySql(csql,function (err, count) {
		mysqlUtil.queryWithPage(pageIndex,pageSize,sql,function (err, docs) {
			var has_more=false;
			if(count.count<=pageIndex*pageSize){
				has_more=false;
			}else{
				has_more=true;
			}
			res.render('article/articlelist', {condition:condition,type:type,has_more:has_more,pageIndex:(pageIndex+1),pageSize:pageSize,count:count.count,list:docs});
		});
	});
});

/* 保存文章 */
router.get('/addArticle', function(req, res) {
  var params = Url.parse(req.url,true).query; 
  var content=params.content;
  var title=params.title;
  var article_id=params.article_id;
  var height=params.height;
  var date = util.getDate();
  var obj=new Object();
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
		res.send({id:article_id,message:'保存成功'});
	});
  }else{
	mysqlUtil.insert(article,obj,function(err,doc){
		console.log(doc)
		res.send({id:doc._id,message:'保存成功'});
	});
  }
});

/* 根据id获取文章内容 */
router.get('/reading/:id', function(req, res) {
    var id=req.params.id;
    console.log('文章id:'+id);
	var sql='select a.*,u.username,u.avatar from article a , user u where a.author_id=u.id and a.id="'+id+'"'; 
	var csql = 'select c.*,u.username,u.avatar from comment c , user u where c.userid=u.id and c.articleid="'+id+'"'; 
	mysqlUtil.query(sql,function (err, article) {
		if(err||article===null){
			res.render('error', {
				message: '页面不存在',
				error: {}
			});
		}else{
			if(article[0].status==1){
				mysqlUtil.count(comment,'articleid="'+id+'"',function (err,count) {
					mysqlUtil.queryWithPage(1,config.user_pageSize*1,csql,function (err, docs) {
						article[0].content=marked(article[0].content);
						var has_more=false;
						if(count.count<=config.user_pageSize*1){
							has_more=false;
						}else{
							has_more=true;
						}
						res.render('article/article', {article:article[0],has_more:has_more,pageIndex:2,pageSize:config.user_pageSize*1,count:count.count,list:docs});
					});
				});
			}else{
				if (!req.session.user) {
					return res.render('user/login');
				}else{
					if(req.session.user.id===article[0].author_id||req.session.user.role_type=='1'){
						mysqlUtil.count(comment,'articleid="'+id+'"',function (err,count) {
							mysqlUtil.queryWithPage(1,config.user_pageSize*1,csql,function (err, docs) {
								article[0].content=marked(article[0].content);
								var has_more=false;
								if(count.count<=config.user_pageSize*1){
									has_more=false;
								}else{
									has_more=true;
								}
								res.render('article/article', {article:article[0],has_more:has_more,pageIndex:2,pageSize:config.user_pageSize*1,count:count.count,list:docs});
							});
						});
					}else{
						res.render('error', {
							message: '您没有权限访问该页面',
							error: {}
						});
					}
				}
			}
		}	
	});
});




/* 根据id获取文章内容 */
router.get('/allComment/reading/:id', function(req, res) {
    var id=req.params.id;
    console.log('文章id:'+id);
	var sql='select a.*,u.username,u.avatar from article a , user u where a.author_id=u.id and a.id="'+id+'"'; 
	var csql = 'select c.*,u.username,u.avatar from comment c , user u where c.userid=u.id and c.articleid="'+id+'"'; 
	mysqlUtil.query(sql,function (err, article) {
		if(err||article===null){
			res.render('error', {
				message: '页面不存在',
				error: {}
			});
		}else{
			if(article[0].status==1){
				mysqlUtil.query(csql,function (err, docs) {	
					article[0].content=marked(article[0].content);
					res.render('article/article', {article:article[0],list:docs});
				});
			}else{
				if (!req.session.user) {
					return res.render('user/login');
				}else{
					if(req.session.user.id===article[0].author_id||req.session.user.role_type=='1'){
						mysqlUtil.query(csql,function (err, docs) {	
							article[0].content=marked(article[0].content);
							res.render('article/article', {article:article[0],list:docs});
						});
					}else{
						res.render('error', {
							message: '您没有权限访问该页面',
							error: {}
						});
					}
				}
			}
		}	
	});
});

/* 根据id获取文章内容 */
router.get('/editArticle/:id', function(req, res) {
    var id=req.params.id;
    console.log('文章id:'+id);
	mysqlUtil.getById(article,id, function (err, article) {
		if(article===null){
			res.render('error', {
				message: '页面不存在',
				error: {}
			});
		}else{
			res.render('article/editor', article);
		}
	});
});

/* 根据id分享文章 */
router.get('/shareArticle', function(req, res) {
    var params = Url.parse(req.url,true).query;
	var id = params.id;
	var status = params.status;
	var updateString = 'status='+status+',update_date="'+util.getDate()+'"'
    console.log('文章id:'+id+',状态:'+status);
	mysqlUtil.updateById(article,id,updateString,function(err){
		if(err){			
			res.send({status:'fail',message:'操作失败'});
		}else{
			res.send({status:'success',message:'操作成功'});
		}
	});
});

/* 根据id删除文章 */
router.get('/deleteArticle', function(req, res) {
    var params = Url.parse(req.url,true).query;
	var id = params.id;
    console.log('文章id:'+id);
	mysqlUtil.deleteById(article,id,function (err) {
		if(err){	
			res.send({status:'fail',message:'删除失败'});
		}else{
			res.send({status:'success',message:'删除成功'});
		}
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
	var csql = 'select count(*) count from (select * from article '+obj+') a , user u where a.author_id=u.id '; 
	var sql = 'select a.*,u.username,u.avatar count from (select * from article '+obj+') a , user u where a.author_id=u.id order by a.update_date desc'; 
	mysqlUtil.countBySql(csql,function (err, count) {
		if(!err){
			mysqlUtil.queryWithPage(pageIndex,pageSize,sql,function (err, docs) {
				if(err){
					console.log(err);
					res.render('error', {
						message: '搜索/查询文章列表出错',
						error: {}
					});
				}else{
					res.render('article/articlelistControl', {title:title,pageSize:pageSize,totalCount:count.count,list:docs});
				}
			});
		}else{
			console.log(err);
			res.render('error', {
				message: '搜索/查询文章列表出错',
				error: {}
			});
		}
	});
});

/* 导入 */
router.post('/import', multipartMiddleware,function(req, res) {
  console.log(req.body);
  console.log(req.files);
  var temp = req.files.file;
  console.log(temp);
  var path = req.files.file[0].path; 
  console.log(path);
	if (path) {  
		fs.readFile(path,'utf-8', function(err, content) {
			//文件的内容
			console.log(content);
			res.send(content);
			// 删除临时文件
			fs.unlink(path);
		});
	}
});

module.exports = router;
