var mysqlUtil = require('../../utils/mysqlUtil');

var user = function (req, res, next) {
	var userid=req.params.id;

	mysqlUtil.getById('user',userid,function(err,user){
		if(err){
			res.status(403);
			return res.send(err);
		}else{
			res.send(user);
		}
	});
	
};

exports.user = user;


var username = function (req, res, next) {
	var username=req.params.username;

	mysqlUtil.getOne('user','username = "'+username+'"',function(err,user){
		if(err){
			res.status(403);
			return res.send(err);
		}else{
			res.send(user);
		}
	});
	
};

exports.username = username;