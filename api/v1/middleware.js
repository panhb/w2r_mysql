var mysqlUtil = require('../../utils/mysqlUtil');

var auth = function (req, res, next) {
  var accesstoken = req.body.accesstoken || req.query.accesstoken;
  mysqlUtil.getOne('user','active_key="'+accesstoken+'"',function (err,user) {
    if (!user) {
      res.status(403);
      return res.send({error_msg: 'wrong accessToken'});
    }
    req.user = user;
    next();
  });
};

exports.auth = auth;