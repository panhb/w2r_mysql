var nodemailer= require('nodemailer');
var config = require('../config');
var log = require('../log').logger('w2r');


var transporter = nodemailer.createTransport('SMTP',config.mail_options);


exports.sendActiveMail  = function (to,token,username) {
	// setup e-mail data with unicode symbols
	var mailOptions = {
		from: config.mail_options.auth.user, // sender address
		to: to, // list of receivers
		subject: config.name+'帐号激活', // Subject line
		html: '<div style="margin:0 auto; width:552px;"><table width="100%" style="background-color:#efefef;">'+
			  '<tr><td align="center" ><h1 style="font-family:Microsoft YaHei;">w2r</h1></td></tr>'+		
			  '<tr><td align="left" style="font-size: 17px; color:#7b7b7b; padding:8px 0 0 0;line-height:25px;"><b>'+username+'，欢迎加入w2r!</b></tr>'+		
			  '<tr><td align="left" valign="top" style="font-size:15px; color:#7b7b7b; font-size:14px; line-height: 25px; font-family:Microsoft YaHei; padding: 10px 0px 10px 0px">为了保证你正常使用w2r的功能，请激活你的账号。</td></tr>'+		
			  '<tr><td style="border-top:1px #f1f4f6 solid; padding: 6px 0 12px 0;" align="center" class="padding"></td></tr>'+		
			  '<tr><td align="center"><a href="http://'+config.hosturl+'/users/user/activeUser?key='+token+'&username='+username+'" style="width:100px;text-align:center;font-size:12px;">立即激活账号</a></td></tr>'+		
			  '</table></div>'
	};
	transporter.sendMail(mailOptions, function(error, info){
		log.info('sender address :' + config.mail_options.auth.user);
		log.info('to address :' + to);
		log.info('username :' + config.name);
		if(error){
			log.error(error);
		}else{
			log.info('Message sent: ' + info);
		}
	});
};

exports.sendResetPassMail   = function (to, token,username) {
	// setup e-mail data with unicode symbols
	var mailOptions = {
		from: config.mail_options.auth.user, // sender address
		to: to, // list of receivers
		subject: config.name+'密码重置', // Subject line
		html: '<div style="margin:0 auto; width:552px;"><table width="100%" style="background-color:#efefef;">'+
			  '<tr><td align="center" ><h1 style="font-family:Microsoft YaHei;">w2r</h1></td></tr>'+		
			  '<tr><td align="left" style="font-size: 17px; color:#7b7b7b; padding:8px 0 0 0;line-height:25px;"><b>'+username+'，您好!</b></tr>'+		
			  '<tr><td align="left" valign="top" style="font-size:15px; color:#7b7b7b; font-size:14px; line-height: 25px; font-family:Microsoft YaHei; padding: 10px 0px 10px 0px">请单击下面的链接来重置密码</td></tr>'+		
			  '<tr><td style="border-top:1px #f1f4f6 solid; padding: 6px 0 12px 0;" align="center" class="padding"></td></tr>'+		
			  '<tr><td align="center"><a href="http://'+config.hosturl+'/users/user/resetPass?key='+token+'&username='+username+'" style="width:100px;text-align:center;font-size:12px;">密码重置</a></td></tr>'+		
			  '</table></div>'
	};
	
	transporter.sendMail(mailOptions, function(error, info){
		log.info('sender address :' + config.mail_options.auth.user);
		log.info('to address :' + to);
		if(error){
			log.error(error);
		}else{
			log.info('Message sent: ' + info);
		}
	});
};



