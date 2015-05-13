var mysqlUtil = require('../../utils/mysqlUtil');
var marked = require('marked');

var messages = function (req, res, next) {
	var userid=req.user.id;
	var sql=' select m.* ,u.username send_username ,u.avatar from message m ,user u where m.send_userid = u.id and  m.to_userid = "'+userid+'" order by send_date desc ';
	mysqlUtil.query(sql,function(err,docs){
		if(err){
			res.status(403);
			return res.send(err);
		}else{
			for(var i in docs){
				docs[i].content = marked(docs[i].content);
			}
			res.send({messages:docs});
		}	
	});
};

exports.messages = messages;

var count = function (req, res, next) {
	var userid=req.user.id;

	mysqlUtil.count('message',' to_userid = "'+ userid +'" and has_read = 0 ',function(err,hcount){
		if(err){
			res.status(403);
			return res.send(err);
		}else{
			mysqlUtil.count('message',' to_userid = "'+ userid +'" and has_read = 1 ',function(err,count){
				if(err){
					res.status(403);
					return res.send(err);
				}else{
					res.send({has_read:count.count,no_read:hcount.count});
				}	
			});
		}	
	});
	
};
exports.count = count;
