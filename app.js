//require('newrelic');
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var _ = require('lodash');
var config = require('./config');
var routes = require('./routes/index');
var tuling = require('./routes/tuling');
var users = require('./routes/users');
var articles = require('./routes/articles');
var comments = require('./routes/comments');
var messages = require('./routes/messages');
var logins = require('./routes/logins');
var auth = require('./routes/auth');
var relations = require('./routes/relations');
var collections = require('./routes/collections');
var mysqlUtil = require('./utils/mysqlUtil');
var util = require('./utils/util');
var log = require('./log');
var session = require('express-session');
var passport = require('passport');
var redisStore = require('connect-redis')(session);
var busboy = require('connect-busboy');
var apiV1 = require('./api_v1');

//需要登录
var nofree_url = [];
nofree_url.push('/users/userlist');
nofree_url.push('/articles/articleControl');
nofree_url.push('/comments/commentlist');
nofree_url.push('/messages/messagelist');
nofree_url.push('/logins/loginlist');
nofree_url.push('/messages/message');
nofree_url.push('/articles/myArticle');
nofree_url.push('/relations/myfollowlist');
nofree_url.push('/collections/myCollectlist');
nofree_url.push('/users/user/userinfo');
nofree_url.push('/relations/followControl');
nofree_url.push('/articles/writing');

var active_url = [];
active_url.push('/articles/myArticle');
active_url.push('/articles/writing');


//需要管理员权限
var admin_url = [];
admin_url.push('/users/userlist');
admin_url.push('/articles/articleControl');
admin_url.push('/comments/commentlist');
admin_url.push('/messages/messagelist');
admin_url.push('/logins/loginlist');
admin_url.push('/relations/followControl');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'html');
app.engine('html', require('ejs-mate'));

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json({limit: '10mb'}));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser(config.session_secret));
app.use(session({
    secret: config.session_secret,
    resave: true,
    saveUninitialized: true,
	store: new redisStore(config.redis_options)
}));
app.use(passport.initialize());
app.use(express.static(path.join(__dirname, 'public')));

app.use(log.useLog());

app.use(busboy());

app.use(function(req, res, next) {
    log.logger('w2r').info('++++++++++++++++++所有的跳转都要经过这个+++++++++++++++++++++++++');
    log.logger('w2r').info(req.url);

    if( req.session.user ){
    	next();
    } else {
    	//cookie
	    var auth_token = req.signedCookies[config.auth_cookie_name];
	    if (auth_token) { //存在cookie
	      	mysqlUtil.getById('user',auth_token,function(err,doc){
	      		req.session.user = doc;
	      		next();
	      	})
	    } else {
	    	next();
	    }
    }

});

app.use(function(req, res, next){ 
	if ( !req.session.user ) {
		if ( _.indexOf( nofree_url,req.url ) !== -1 ) {
			res.redirect('/users/login');
		}
	} else if ( _.indexOf( active_url,req.url ) !== -1 && req.session.user.status !== 1 ) {
		res.render('error', {
			message: '请先激活',
			error: {}
		});
		return;
	}else if ( _.indexOf(admin_url,req.url) !== -1 && req.session.user.role_type !== 1 ) {
		res.render('error', {
			message: '您没有权限访问该页面',
			error: {}
		});
		return;
	}
    next();
});

app.use(function(req, res, next){ 
	res.locals.session = req.session; 
	next(); 
});

app.use('/', routes);
app.use('/articles', articles);
app.use('/users', users);
app.use('/comments', comments);
app.use('/messages', messages);
app.use('/logins', logins);
app.use('/tuling', tuling);
app.use('/relations', relations);
app.use('/auth', auth);
app.use('/collections', collections);
app.use('/api/v1', apiV1);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

app.listen(config.port, function () {
    log.logger('w2r').info("w2r listening on port %d", config.port);
    //require('child_process').exec("start http://localhost:"+config.port);
});

//初始化数据库
mysqlUtil.initDb(function(err){
    if(err){
        log.logger('w2r').error(err);
    }else{
		var obj = {};
		obj.id = '0';
		obj.username = 'admin';
		obj.email = 'admin@test.com';
		obj.avatar = 'https://avatars3.githubusercontent.com/u/8011065?v=3&s=460',
		obj.password = 'admin';
		obj.role_type = '1';
		obj.create_date = util.getDate();
		obj.status = 1;
		mysqlUtil.insert('user',obj,function(err){
			if(err){
				log.logger('w2r').error("初始化管理员数据失败");
			} else {
				log.logger('w2r').info("初始化数据库成功");
			}
		});
    }
});

module.exports = app;
