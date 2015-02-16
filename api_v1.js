var express = require('express');

var middleware = require('./api/v1/middleware');
var articleController = require('./api/v1/article');
var messageController = require('./api/v1/message');
var userController = require('./api/v1/user');
var collectionController = require('./api/v1/collection');
var relationController = require('./api/v1/relation');

var router = express.Router();

// 文章
router.get('/shareArticles', articleController.shareArticles);
router.get('/myArticles', middleware.auth,articleController.myArticles);
router.get('/article/:id', articleController.article);

// 站内信
router.get('/messages', middleware.auth,messageController.messages);
router.get('/message/count', middleware.auth,messageController.count);

//用户信息
router.get('/user/:id',userController.user);
router.get('/user/username/:username',userController.username);

//收藏
router.get('/collections',middleware.auth,collectionController.collections);

//关注
router.get('/relations',middleware.auth,relationController.relations);


module.exports = router;