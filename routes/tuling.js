/**
 * Created by Administrator on 2014/11/29.
 */
var express = require('express');
var router = express.Router();
var Url = require('url');
var config = require('../config');
var superagent = require('superagent');
var qs = require('querystring');
var _ = require('lodash');
var log = require('../log').logger('w2r');

var tuling_error = [
    { 'code': 40001,  'text': 'key的长度错误（32位' },
    { 'code': 40002,  'text': '请求内容为空' },
    { 'code': 40003,  'text': 'key错误或帐号未激活' },
    { 'code': 40004,  'text': '当天请求次数已用完' },
    { 'code': 40005,  'text': '暂不支持该功能' },
    { 'code': 40006,  'text': '服务器升级中' },
    { 'code': 40007,  'text': '服务器数据格式异常' }
];


/* 图灵机器人页面 */
router.get('/', function(req, res) {
    res.render('tuling');
});

router.get('/getAnswer', function(req, res) {
    var params = Url.parse(req.url,true).query;
    var info=params.info;
    var key = config.tl_apikey;

    var data = {
        info: info,
        key: key};//这是需要提交的数据

    var content = qs.stringify(data);
    var apiURL = 'http://www.tuling123.com/openapi/api?'+content;

    superagent.get(apiURL).end(function (err, sres) {
        // 常规的错误处理
        if (err) {
			log.error(err);
            return next(err);
        }
        var text = sres.text;
        var json = JSON.parse(text);
        var code =json.code;
        var index=_.findIndex(tuling_error, { 'code': code });
        if(index<0){
            res.send({status:'success',json:json});
        }else{
            log.info(tuling_error[index]);
            res.send({status:'fail'});
        }
    });
});

module.exports = router;