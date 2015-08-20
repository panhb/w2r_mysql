var express = require('express');
var router = express.Router();
var Url = require('url');
var config = require('../config');
var mysqlUtil = require('../utils/mysqlUtil');
var util = require('../utils/util');
var log = require('../log').logger('w2r');
var convert = require('data2xml')();
var mcache = require('memory-cache');
var marked = require('marked');

/* GET home page. */
router.get('/main/:pageIndex', function(req, res) {
	var params = Url.parse(req.url,true).query; 
	var pageIndex= req.params.pageIndex;
	var pageSize = params.pageSize;
	var po = {};
	po.pageIndex = pageIndex;
	po.pageSize = pageSize;
	po = util.page(po);
	var csql = 'select count(*) count from (select * from article where status=1) a , user u where a.author_id=u.id '; 
	var sql = 'select a.*,u.username,u.avatar from (select * from article where status=1) a , user u where a.author_id=u.id order by a.update_date desc'; 
	mysqlUtil.countBySql(csql,function (err,count) {
		if(err){
			util.renderError(err,res,'访问失败');
		}else{
			mysqlUtil.queryWithPage(po.pageIndex,po.pageSize,sql,function (err, docs) {
				if(err){
					util.renderError(err,res,'访问失败');
				}else{
					for(var i in docs){
	                    docs[i].update_date = util.fromNow(docs[i].update_date);
	                }
					res.render('main', {title: config.name,count:count.count,list:docs});
				}
			});
		}
	});
});

router.get('/', function(req, res) {
	if (req.session.user) {
        res.redirect('/main/1');
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

router.get('/rss', function(req, res) {
  res.contentType('application/xml');
  if (mcache.get('rss')) {
    res.send(mcache.get('rss'));
  } else {
  	var sql = 'select a.*,u.username,u.avatar count from (select * from article where status=1) a , user u where a.author_id=u.id order by a.update_date desc'; 
  	mysqlUtil.queryWithPage(1,20,sql,function(err,docs){
  		if (err) {
        	log.error(err);
      	} else {
      		var rss_obj = {
		        _attr: { version: '2.0' },
		        channel: {
		          title: config.rss.title,
		          link: config.rss.link,
		          language: config.rss.language,
		          description: config.rss.description,
		          item: []
		        }
		    };

		    docs.forEach(function (topic) {
		        rss_obj.channel.item.push({
		          title: topic.title,
		          link: config.rss.link + '/articles/reading/' + topic.id,
		          guid: config.rss.link + '/articles/reading/' + topic.id,
		          description: marked(topic.content),
		          author: topic.username,
		          pubDate: topic.update_date.toUTCString()
		        });
		    });

		    var rssContent = convert('rss', rss_obj);

		    mcache.put('rss', rssContent, 1000 * 60 * 5); // 五分钟
		    res.send(rssContent);
		}
  	});
  }
});

module.exports = router;
