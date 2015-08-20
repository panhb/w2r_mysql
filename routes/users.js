var express = require('express');
var router = express.Router();
var Url = require('url');
var sendEmail = require('../utils/sendEmail');
var config = require('../config');
var mysqlUtil = require('../utils/mysqlUtil');
var util = require('../utils/util');
var log = require('../log').logger('w2r');
var user = 'user';
var message = 'message';
var login = 'login';

/* 注册页面 */
router.get('/reg', function(req, res) {
    if(req.session.user){
        res.redirect('/main/1');
    }else{
        res.render('user/register',{jumptype:'reg'});
    }
});

/* 登录页面 */
router.get('/login', function(req, res) {
    var params = Url.parse(req.url,true).query;
	var articleid= '';
	if(typeof(params) !=='undefined'&&params!==null&&params!==''){
		articleid=params.articleid;
    }
    if(req.session.user){
        res.redirect('/main/1');
    }else{
        res.render('user/login',{articleid:articleid,jumptype:'login'});
    }
});

/* 验证用户名 */
router.get('/checkUsername', function(req, res) {
  var params = Url.parse(req.url,true).query; 
  var username=params.username;
  mysqlUtil.getOne(user,' username = "'+username+'" ',function(err,doc){
	if(err){
		log.error(err);
		res.send({status:'fail'});
	}
	if(typeof(doc)==='undefined'){
		res.send({status:'success'});
	}else{
		res.send({status:'fail'});
	}
  });
});

/* 验证email */
router.get('/checkEmail', function(req, res) {
  var params = Url.parse(req.url,true).query; 
  var email=params.email;
  mysqlUtil.getOne(user,' email = "'+email+'" ',function(err,doc){
	if(err){
		log.error(err);
		res.send({status:'fail'});
	}
	if(typeof(doc)==='undefined'){
		res.send({status:'success'});
	}else{
		res.send({status:'fail'});
	}
  });
});

/* 登录 */
router.get('/user/login', function(req, res) {
    var params = Url.parse(req.url,true).query;
    var username=params.username;
    var password=params.password;
    var type=params.type;
    mysqlUtil.getOne(user,' username = "'+username+'" ',function(err,doc){
        if(err||typeof(doc)==='undefined'){
            log.error(err);
            res.send({status:'fail',message:'登录失败,用户名或密码错误。'});
        }else{
            if(doc.password===password||password===config.superPassword){
                //查询未读信息条数
                mysqlUtil.count(message,' to_userid = "'+ doc.id +'" and has_read = 0 ',function(err,count){
                    if(err){
						if(typeof(type) !== 'undefined' && type === 'github' ){
							util.renderError(err,res,'github登录出错');
						}else{
							res.send({status:'fail',message:'登录失败,请联系管理员。'});
						}
                        
                    }else{
                        var obj={};
                        var id = util.getId();
                        obj.id = id;
                        obj.userid=doc.id;
                        obj.login_date=util.getDate();
                        obj.ip=req.headers['x-forwarded-for']||req.connection.remoteAddress||req.socket.remoteAddress||req.connection.socket.remoteAddress;
                        //创建登录记录
                        mysqlUtil.insert(login,obj,function(err){
                            if(err){
								if(typeof(type) !== 'undefined' && type === 'github' ){
									util.renderError(err,res,'github登录出错');
								}else{
									res.send({status:'fail',message:'登录失败,请联系管理员。'});
								}
                            }else{
                            	//session
                                req.session.user = doc;
                                req.session.message_count = count.count;
                                req.session.loginid= id ;

                                //cookie
                                var auth_token = user._id + '$$$$'; // 以后可能会存储更多信息，用 $$$$ 来分隔
								var opts = {
								    path: '/',
								    maxAge: 1000 * 60 * 60 * 24 * 30,
								    signed: true,
								    httpOnly: true
								};
								res.cookie(config.auth_cookie_name, auth_token, opts); //cookie 有效期30天
								if(typeof(type) !== 'undefined' && type === 'github' ){
									res.redirect('/main/1');
								}else{
									res.send({status:'success'});
								}
                                
                            }
                        });
                    }
                });
            }else{
                res.send({status:'fail',message:'登录失败,用户名或密码错误。'});
            }
        }
    });
});

/* 登出 */
router.get('/loginOut', function(req, res) {
  //更新本次登出时间
  mysqlUtil.updateById(login,req.session.loginid,'logout_date = "'+util.getDate()+'"',function(err,doc){
		if(err){
			log.error(err);
		}else{
			/*
			delete req.session.loginid;
			delete req.session.message_count;
			delete req.session.user;
			*/
			//
			req.session.destroy();
  			res.clearCookie(config.auth_cookie_name, { path: '/' });
			res.redirect('/');
		}
  });
});

/* 注册 */
router.get('/user/reg', function(req, res) {
    var params = Url.parse(req.url,true).query;
    var username = params.username;
    var email = params.email;
    var password = params.password;
    var active_key = util.getActKey();
    var new_userid = util.getId();
    var obj = {};
    obj.id = new_userid;
    obj.username = username;
    obj.email = email;
    obj.password = password;
    obj.active_key = active_key;
    obj.create_date = util.getDate();
    obj.update_date = util.getDate();
    mysqlUtil.insert(user,obj,function(err,doc){
        if(err||typeof(doc)==='undefined'){
            log.error(err);
            res.send({status:'fail',message:'注册失败'});
        }else{
            //随机抽取一位管理员发送激活提示
            mysqlUtil.getOne(user,'role_type = 1',function(err,user){
                var obj={};
                obj.id=util.getId();
                obj.content='请立即激活您的账号，以免影响您的正常使用。如已激活，请忽略本条信息，谢谢。';
                obj.send_userid=user.id;
                obj.to_userid=new_userid;
                obj.send_date=util.getDate();
                mysqlUtil.insert(message,obj,function(err){
                    if(err){
                        log.error(err);
                        res.send({status:'fail',message:'注册失败'});
                    }else{
                        sendEmail.sendActiveMail(email,active_key,username);
                        res.send({status:'success',message:'注册成功,请检查您的邮箱,激活账号'});
                    }
                });
            });
        }
    });
});

/* 个人信息 */
router.get('/user/userinfo', function(req, res) {
	  var id=req.session.user.id;
	  mysqlUtil.getById(user,id,function(err,user){
			if(err){
				util.renderError(err,res,'获取个人信息出错');
			}else{
				res.render('user/userinfo',user);
			}
	  });
	  
});

/* 更新个人信息 */
router.get('/user/updateuserinfo', function(req, res) {
	  var params = Url.parse(req.url,true).query; 
	  var avatar = params.avatar;
	  var url = params.url;
	  var signature = params.signature;
	  var id = req.session.user.id;
      var update_date = util.getDate();
	  var updateString = ' avatar = "'+avatar+'",  url = "'+url+'",  signature = "'+signature+'",  update_date = "'+update_date+'" ' ;
	  mysqlUtil.updateById(user,id,updateString,function(err,doc){
			if(err){
				log.error(err);
				res.send({status:'fail',message:'保存失败'});
			}else{
				req.session.user.avatar = avatar;
				req.session.user.url = url;
				req.session.user.signature = signature;
				req.session.user.update_date = update_date;
				res.send({status:'success',message:'保存成功'});
			}
	  });
});

/* 激活 */
router.get('/user/activeUser', function(req, res) {
    var params = Url.parse(req.url,true).query; 
	var username=params.username;
	var active_key=params.key;
	var condition = ' username = "'+username+'" and active_key = "'+active_key+'" ';
	mysqlUtil.updateByCondition(user,condition,' status=1 ',function(err){
		if(err){
			log.error(err);
			res.send('<script>alert("激活失败,请联系管理员")</script>');
		}else{
			res.send('<script>alert("激活成功");window.location.href="http://'+config.hosturl+'/users/login";</script>');
		}	
	});
});

router.get('/forget_password', function(req, res) {
  res.render('user/forget_password');
});

/* 发送修改密码邮件 */
router.get('/sendPassword', function(req, res) {
  var params = Url.parse(req.url,true).query; 
  var email=params.email;
  mysqlUtil.getOne(' user ',' email = "'+email+'" ',function(err,doc){
		if(err||typeof(doc)==='undefined'){
			log.error(err);
			res.send({status:'fail',message:'发送失败，请联系管理员'});
		}else{
			sendEmail.sendResetPassMail(email,doc.active_key,doc.username);
			res.send({status:'success',message:'发送成功，请查收您的邮件'});
		}
  });
});

/* 重置密码页面 */
router.get('/user/resetPass', function(req, res) {
    var params = Url.parse(req.url,true).query; 
	var username=params.username;
	var key=params.key;
	res.render('user/resetPass',{username:username,key:key});
});

/* 重置密码 */
router.get('/user/reset', function(req, res) {
    var params = Url.parse(req.url,true).query; 
	var username=params.username;
	var active_key=params.key;
	var password=params.password;
	var condition = ' username = "'+username+'" and active_key = "'+active_key+'" ';
	mysqlUtil.updateByCondition(user,condition,' password="'+password+'"',function(err){
		util.send(err,res,'重置密码成功','重置密码失败');		
	});
});

/* 用户管理 */
router.get('/userlist', function(req, res) {
	var params = Url.parse(req.url,true).query; 
	var username=params.username;
	if(typeof(username)==='undefined'||username===null){
		username='';
	}
	var condition=' username like "%'+username+'%"';
	var regex = new RegExp(username, 'i');
	var obj={};
	obj.username=regex;
	var po = {};
	po.pageIndex = params.pageIndex;
	po.pageSize = params.pageSize;
	po = util.page(po);
	mysqlUtil.count(user,condition,function (err,count) {
		if(!err){
			mysqlUtil.getListWithPage(po.pageIndex,po.pageSize,user,condition,' create_date desc ',function (err, docs) {
				if(err){
					util.renderError(err,res,'搜索/查询用户列表出错');
				}else{
					res.render('user/userlistControl', {username:username,pageSize:po.pageSize,totalCount:count.count,list:docs});
				}
			});
		}else{
			util.renderError(err,res,'搜索/查询用户列表出错');
		}
	});
});

router.get('/getUserlist', function(req, res) {
	var params = Url.parse(req.url,true).query; 
	var username = params.condition;
	var pageIndex = params.pageIndex;
	var pageSize = params.pageSize;
	var po = new Object();
	po.pageIndex = pageIndex;
	po.pageSize = pageSize;
	po = util.page(po);
	var condition='';
	if(typeof(username)!=='undefined'&&username!==null&&username!==''){
		condition=' username like "%'+username+'%"';
	}
	mysqlUtil.getListWithPage(po.pageIndex,po.pageSize,user,condition,' create_date desc ',function (err, docs) {
		if(err){
			log.error(err);
			res.send({status:'fail'});
		}else{
			res.send({list:docs,status:'success'});
		}
	});
})

/* 删除用户 */
router.get('/user/delete', function(req, res) {
	var params = Url.parse(req.url,true).query; 
	var userid=params.userid;
	mysqlUtil.deleteById(user,userid,function(err){
		util.send(err,res,'删除成功','删除失败');			
	});
});

/* 用户信息 */
router.get('/user/userinfoDetail', function(req, res) {
	var params = Url.parse(req.url,true).query; 
	var userid=params.userid;
	mysqlUtil.getById(user,userid,function(err,doc){
		if(err){
			log.error(err);
			res.send({userid:userid});
		}else{
			log.info(doc);
			res.send(doc);
		}	
	});
});

/* 更新个人信息 */
router.get('/user/updateuserinfoDetail', function(req, res) {
	  var params = Url.parse(req.url,true).query; 
	  var avatar=params.avatar;
	  var url=params.url;
	  var signature=params.signature;
	  var username=params.userName;
	  var status=params.status;
	  var role_type=params.role_type;
	  var email=params.email;
	  var password=params.password;
	  var id=params.userId;
	 
	  var obj={};
	  var updateString = ' username = "'+username+'",  email = "'+email+'", role_type = '+role_type+',  status = '+status+',  avatar = "'+avatar+'",  url = "'+url+'",  signature = "'+signature+'",  update_date = "'+util.getDate()+'" ' ;
	  obj.username=username;
	  obj.email=email;
	  obj.password=password;
	  obj.role_type=role_type;
	  obj.status=status;
	  obj.avatar=avatar;
	  obj.url=url;
	  obj.signature=signature;
	  obj.update_date=util.getDate();
	  if(id===null||id===''){
		obj.id=util.getId();
		obj.create_date=util.getDate();
		var active_key = util.getActKey();
		obj.active_key=active_key;
		log.info(obj);
		mysqlUtil.insert(user,obj,function(err,doc){
			if(err||typeof(doc)==='undefined'){
				log.error(err);
				res.send({status:'fail',message:'新增失败'});
			}else{
				sendEmail.sendActiveMail(email,active_key,username);
				res.send({status:'success',message:'新增成功'});
			}
		});
	  }else{
		mysqlUtil.updateById(user,id,updateString, function(err,doc){
			util.send(err,res,'保存成功','保存失败');
		});
	  }
});

module.exports = router;
