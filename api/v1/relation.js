var mysqlUtil = require('../../utils/mysqlUtil');

var relations = function (req, res, next) {
	var userid=req.user.id;

	var sql = ' select r.*,u.username,u.avatar from relation r ,user u where r.followid = u.id and r.userid = "'+userid+'" order by create_date desc ';
    mysqlUtil.query(sql ,function (err,docs) {
        if(err){
            res.status(403);
			return res.send(err);
        }else{
            res.send({relations : docs})
        }
    })
	
};

exports.relations = relations;