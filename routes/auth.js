var express = require('express');
var router = express.Router();
var config = require('../config');
var mysqlUtil = require('../utils/mysqlUtil');
var util = require('../utils/util');
var log = require('../log').logger('w2r');
var passport = require('passport');
var GithubStrategy = require('passport-github').Strategy;
var user = 'user' ;

// github oauth
passport.serializeUser(function (user, done) {
  done(null, user);
});
passport.deserializeUser(function (user, done) {
  done(null, user);
});

passport.use(new GithubStrategy(config.github_oauth,function(accessToken,refreshToken,profile,done) {
    log.info(accessToken);
	profile.accessToken = accessToken;
	done(null, profile);
}));

router.get('/github', passport.authenticate('github'));

router.get('/github/callback', passport.authenticate('github',{failureRedirect: '/users/reg'}),function(req, res) {
  log.info(req.user);
  var profile = req.user ;
  var githubId = profile.id ;
  mysqlUtil.getOne(user,' githubId = "'+githubId+'" ',function(err,userdoc){
	if(err){
		util.renderError(err,res,'github登录出错');
	}
	if(typeof(userdoc)==='undefined'){ // 注册新账号
		var obj = {};
		obj.id = util.getId();
		obj.username = profile.username;
		obj.email = profile.emails[0].value;
		obj.avatar = profile._json.avatar_url,
		obj.password = profile.accessToken;
		obj.githubId = githubId;
		obj.active_key = util.getActKey();
		obj.create_date = util.getDate();
		obj.update_date = util.getDate();
		obj.status = 1;
		mysqlUtil.insert(user,obj,function(err){
			if(err){
				util.renderError(err,res,'github登录出错');
			} else {
				res.redirect('/users/user/login?type=github&username='+profile.username+'&password='+profile.accessToken);
			}
		});
	}else{
		mysqlUtil.updateById(user,userdoc.id,' username = "'+profile.username+'"',function(err){
			if(err){
				util.renderError(err,res,'github登录出错');
			} else {
				res.redirect('/users/user/login?type=github&username='+profile.username+'&password='+userdoc.password);
			}
		});
	}
  });
});

module.exports = router;
