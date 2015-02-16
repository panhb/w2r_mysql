var mysqlUtil = require('../../utils/mysqlUtil');
var util = require('../../utils/util');
var marked = require('marked');

var shareArticles = function (req, res, next) {
  var page = parseInt(req.query.page, 10) || 1;
  page = page > 0 ? page : 1;

  var csql = 'select count(*) count from (select * from article where status=1) a , user u where a.author_id=u.id '; 
  var sql = 'select a.*,u.username,u.avatar count from (select * from article where status=1) a , user u where a.author_id=u.id order by a.update_date desc'; 
  
  var obj = new Object();
  obj.page = page;
  obj.csql = csql;
  obj.sql = sql;

  sendArticle('share',obj,res);
};

exports.shareArticles = shareArticles;



var myArticles = function (req, res, next) {
  var page = parseInt(req.query.page, 10) || 1;
  page = page > 0 ? page : 1;

  var author_id = req.user.id;

  var csql = 'select count(*) count from article a , user u where a.author_id=u.id and a.author_id="'+author_id+'"'; 
  var sql='select a.*,u.username,u.avatar from article a , user u where a.author_id=u.id and a.author_id="'+author_id+'" order by update_date desc'; 
  
  var obj = new Object();
  obj.page = page;
  obj.csql = csql;
  obj.sql = sql;

  sendArticle('my',obj,res);

};

exports.myArticles = myArticles;


var article = function (req, res, next) {
  var accesstoken = req.query.accesstoken;
  var id=req.params.id;
  var sql='select a.*,u.username,u.avatar from article a , user u where a.author_id=u.id and a.id="'+id+'"'; 
  var csql = 'select c.*,u.username,u.avatar from comment c , user u where c.userid=u.id and c.articleid="'+id+'"';
  var usql = ' update article set visit_count = visit_count+1  where id = "'+id+'"';

  mysqlUtil.query(usql,function (err){
        if(err){
            res.status(403);
      		return res.send(err);
        }else{
            mysqlUtil.query(sql,function (err, article) {
                if(err||typeof(article)==='undefined'||article.length===0){
                    res.status(403);
      				return res.send(err);
                }else{
                    mysqlUtil.query(csql,function (err, docs) {
                        if(err){
                            res.status(403);
      						return res.send(err);
                        }else{
                            article[0].content=marked(article[0].content);
                            var has_collect = false;
                            if (accesstoken) {
                            	//是否已收藏文章
	                            var count_sql="select count(*) count from collection,user u where articleid='"+id+"' and userid = u.id and u.active_key = '"+accesstoken+"'";
	                        	mysqlUtil.countBySql(count_sql,function(err,c){
	                        		if(c.count != 0){
	                        			has_collect = true;
	                        		}
	                        		res.send({article:article[0],has_collect:has_collect,comments:docs});
	                        	})
	                        }else{
	                        	res.send({article:article[0],comments:docs});
	                        }  
                        }
                    });
				}
			});
		}
	});  
};

exports.article = article;

function sendArticle(type,obj,res){
	mysqlUtil.countBySql(obj.csql,function (err,count) {
		if(err){
			res.status(403);
      		return res.send(err);
		}else{
			mysqlUtil.queryWithPage(obj.page,10,obj.sql,function (err, docs) {
				if(err){
					res.status(403);
      				return res.send(err);
				}else{
					var has_more=false;
					if(count.count<=obj.page*10){
						has_more=false;
					}else{
						has_more=true;
					}
					if(type === 'share'){
						for(var i in docs){
		                    docs[i].update_date = util.fromNow(docs[i].update_date);
		                }
					}
					res.send({has_more:has_more,count:count.count,articles:docs});
				}
			});
		}
	});
}