var mysqlUtil = require('../../utils/mysqlUtil');
var util = require('../../utils/util');

var collections = function (req, res, next) {
	var userid=req.user.id;

    var csql = ' select count(*) count from collection c ,article a,user u where u.id = a.author_id and c.articleid = a.id and c.userid = "'+userid+'"';
    var sql = ' select a.*,u.username,c.create_date collect_date from collection c ,article a,user u where u.id = a.author_id and c.articleid = a.id and c.userid = "'+userid+'" order by c.create_date desc ';
    mysqlUtil.countBySql(csql,function (err, count) {
        if(err){
			res.status(403);
			return res.send(err);
        }else{
            mysqlUtil.query(sql,function (err, docs) {
                if(err){
					res.status(403);
					return res.send(err);
                }
                for(var i in docs){
                    docs[i].update_date = util.fromNow(docs[i].collect_date);
                }
                res.send({count:count.count,collections:docs});
            });
        }
    });	
};

exports.collections = collections;