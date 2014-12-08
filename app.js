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
var log = require('./log');
var session = require('express-session');
var passport = require('passport');

//需要登录
var nofree_url = new Array();
nofree_url.push('/users/userlist');
nofree_url.push('/articles/articleControl');
nofree_url.push('/comments/commentlist');
nofree_url.push('/messages/messagelist');
nofree_url.push('/logins/loginlist');
nofree_url.push('/messages/message');
nofree_url.push('/articles/myArticle');
nofree_url.push('/relations/myfollowlist');
nofree_url.push('/users/user/userinfo');
nofree_url.push('/relations/followControl');

//需要管理员权限
var admin_url = new Array();
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
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(session({
    secret: config.session_secret,
    resave: true,
    saveUninitialized: true
}));
app.use(passport.initialize());
app.use(express.static(path.join(__dirname, 'public')));

app.use(log.useLog());

app.use(function(req, res, next) {
    log.logger('w2r').info('++++++++++++++++++所有的跳转都要经过这个+++++++++++++++++++++++++');
    log.logger('w2r').info(req.url);
	if(!req.session.user){
		if(_.indexOf(nofree_url,req.url)!==-1){
			res.redirect('/users/login');
		}
	}else if(_.indexOf(admin_url,req.url) !== -1 && req.session.user.role_type !== 1){
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
});

module.exports = app;
