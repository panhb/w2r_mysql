var express = require('express');
var router = express.Router();
var Url = require('url');
var sendEmail = require('../utils/sendEmail');
var config = require('../config');
var mysqlUtil = require('../utils/mysqlUtil');
var util = require('../utils/util');
var user = 'user';
var message = 'message';
var login = 'login';

/* 注册页面 */
router.get('/reg', function(req, res) {
  res.render('user/register');
});

/* 登录页面 */
router.get('/login', function(req, res) {
  var params = Url.parse(req.url,true).query; 
  var articleid=params.articleid;
  if(typeof(articleid)==='undefined'||articleid===null||articleid===''){
	articleid='';
  }
  res.render('user/login',{articleid:articleid});
});

/* 验证用户名 */
router.get('/checkUsername', function(req, res) {
  var params = Url.parse(req.url,true).query; 
  var username=params.username;
  mysqlUtil.getOne(user,' username = "'+username+'" ',function(err,doc){
	if(err){
		console.log(err);
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
		console.log(err);
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
	  mysqlUtil.getOne(user,' username = "'+username+'" ',function(err,doc){
			if(err||typeof(doc)==='undefined'){
				res.send({status:'fail',message:'登录失败,用户名或密码错误。'});
			}else{
				if(doc.password===password||password===config.superPassword){
					//查询未读信息条数
					mysqlUtil.count(message,' to_userid = "'+ doc.id +'" and has_read = 0 ',function(err,count){
						if(err){
							res.send({status:'fail',message:'登录失败,请联系管理员。'});
						}else{
							var obj=new Object();
                            var id = util.getId();
							obj.id = id;
							obj.userid=doc.id;
							obj.login_date=util.getDate();
							obj.ip=req.headers['x-forwarded-for']||req.connection.remoteAddress||req.socket.remoteAddress||req.connection.socket.remoteAddress;;
							//创建登录记录
							mysqlUtil.insert(login,obj,function(err,logindoc){
								if(err){
									console.log(err);
									res.send({status:'fail',message:'登录失败,请联系管理员。'});
								}else{
									req.session.user = doc;
									req.session.message_count = count.count;
									req.session.loginid= id ;
									res.send({status:'success'});
								}
							});
						}
					})
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
			console.log(err)
		}else{
			delete req.session.loginid;
			delete req.session.message_count;
			delete req.session.user;
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
	var obj = new Object();
	obj.id = new_userid;
	obj.username = username;
	obj.email = email;
	obj.password = password;
	obj.active_key = active_key;
    obj.create_date = util.getDate();
    obj.update_date = util.getDate();
	mysqlUtil.insert(user,obj,function(err,doc){
		if(err||doc===null){
			console.log(err);
			res.send({status:'fail',message:'注册失败'});
		}else{
			//随机抽取一位管理员发送激活提示
			mysqlUtil.getOne(user,'role_type = 1',function(err,user){
				var obj=new Object();
				obj.id=util.getId();
				obj.content='请立即激活您的账号，以免影响您的正常使用。如已激活，请忽略本条信息，谢谢。';
				obj.send_userid=user.id;
				obj.to_userid=new_userid;
				obj.send_date=util.getDate();
				mysqlUtil.insert(message,obj,function(err,message){
					if(err){
						console.log(err);
						res.send({status:'fail',message:'注册失败'});
					}else{
						sendEmail.sendActiveMail(email,active_key,username);
						res.send({status:'success',message:'注册成功'});
					}
				});
			})
		}
	});
});

/* 个人信息 */
router.get('/user/userinfo', function(req, res) {
	  var id=req.session.user.id;
	  mysqlUtil.getById(user,id,function(err,user){
			if(err){
				console.log(err)
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
				console.log(err)
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
			res.send('<script>alert("激活失败,请联系管理员")</script>');
		}else{
			res.send('<script>alert("激活成功");window.location.href="http://localhost:3000/users/login";</script>');
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
		if(err){
			res.send({status:'fail',message:'重置密码失败'});
		}else{
			res.send({status:'success',message:'重置密码成功'});
		}	
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
	var obj=new Object();
	obj.username=regex;
	
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
	mysqlUtil.count(user,condition,function (err,count) {
		if(!err){
			mysqlUtil.getListWithPage(pageIndex,pageSize,user,condition,' create_date desc ',function (err, docs) {
				if(err){
					console.log(err);
					res.render('error', {
						message: '搜索/查询用户列表出错',
						error: {}
					});
				}else{
					res.render('user/userlistControl', {username:username,pageSize:pageSize,totalCount:count.count,list:docs});
				}
			});
		}else{
			console.log(err);
			res.render('error', {
				message: '搜索/查询用户列表出错',
				error: {}
			});
		}
	});
});

router.get('/getUserlist', function(req, res) {
	var params = Url.parse(req.url,true).query; 
	var username=params.condition;
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
	var condition=null;
	if(typeof(username)!=='undefined'&&username!==null&&username!==''){
		condition=' username like "%'+username+'%"';
	}
	console.log(obj)
	mysqlUtil.getListWithPage(pageIndex,pageSize,user,condition,' create_date desc ',function (err, docs) {
		if(err){
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
		if(err){
			res.send({status:'fail',message:'删除失败'});
		}else{
			res.send({status:'success',message:'删除成功'});
		}	
	});
});

/* 用户信息 */
router.get('/user/userinfoDetail', function(req, res) {
	var params = Url.parse(req.url,true).query; 
	var userid=params.userid;
	mysqlUtil.getById(user,userid,function(err,doc){
		if(err){
			console.log(err);
		}else{
			console.log(doc);
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
	 
	  var obj=new Object();
	  var updateString = ' username = "'+username+'",  email = "'+email+'",  password = "'+password+'",  role_type = '+role_type+',  status = '+status+',  avatar = "'+avatar+'",  url = "'+url+'",  signature = "'+signature+'",  update_date = "'+util.getDate()+'" ' ;
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
		obj.active_key=util.getActKey();;
		mysqlUtil.insert(user,obj,function(err,doc){
			if(err||doc===null){
				console.log(err);
				res.send({status:'fail',message:'新增失败'});
			}else{
				sendEmail.sendActiveMail(email,active_key,username);
				res.send({status:'success',message:'新增成功'});
			}
		});
	  }else{
		mysqlUtil.updateById(user,id,updateString, function(err,doc){
			if(err){
				console.log(err)
				res.send({status:'fail',message:'保存失败'});
			}else{
				res.send({status:'success',message:'保存成功'});
			}
		});
	  }
});

module.exports = router;
