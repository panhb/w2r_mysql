var moment = require('moment');
var crypto = require('crypto');
var xss = require('xss');
var log = require('../log').logger('w2r');
var config = require('../config');

/**
 * 获取时间
 * @param {String} format 格式    默认YYYY-MM-DD HH:mm:ss
 */
exports.getDate = function (format) {
	var f;
	if(typeof(format) === 'undefined' || format === null || format === '' ){
		f = 'YYYY-MM-DD HH:mm:ss' ;
	} else {
		f = format ; 
	}
	return moment().format(f);
};

/**
 * 生成id
 */
exports.getId = function () {
	return moment().format('YYYYMMDDHHmmssSSS')+Math.floor(Math.random()*100000+1);
};

/**
 * 生成activitykey
 */
exports.getActKey = function () {
	var md5 = crypto.createHash('md5');
	md5.update(moment().format('YYYYMMDDHHmmssSSS'));
	return md5.digest('hex');
};

exports.escape = function (html) {
	return html.replace(/&(?!\w+;)/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
};
/**
 * XSS模块配置
 */
var xssOptions = {
  whiteList: {
    h1: [],
    h2: [],
    h3: [],
    h4: [],
    h5: [],
    h6: [],
    hr: [],
    span: [],
    strong: [],
    b: [],
    i: [],
    br: [],
    p: [],
    pre: ['class'],
    code: [],
    a: ['target', 'href', 'title'],
    img: ['src', 'alt', 'title'],
    div: [],
    table: ['width', 'border'],
    tr: [],
    td: ['width', 'colspan'],
    th: ['width', 'colspan'],
    tbody: [],
    thead: [],
    ul: [],
    li: [],
    ol: [],
    dl: [],
    dt: [],
    em: [],
    cite: [],
    section: [],
    header: [],
    footer: [],
    blockquote: [],
    audio: ['autoplay', 'controls', 'loop', 'preload', 'src'],
    video: ['autoplay', 'controls', 'loop', 'preload', 'src', 'height', 'width']
  }
};

/**
 * 过滤XSS攻击代码
 *
 * @param {string} html
 * @return {string}
 */
exports.xss = function (html) {
  return xss(html, xssOptions);
};

/**
 * 统一处理error
 * @param {String} message
 */
exports.renderError = function (err,res,message) {
	log.error('renderError');
	log.error(err);
	if( typeof(message) === 'undefined' || message === null || message === ''){
		message = '访问失败';
	}
	res.render('error', {
		message: message,
		error: {}
	});
};

/**
 * 统一处理send
 * @param {String} message
 */
exports.send = function (err,res,smessage,fmessage) {
	if( typeof(smessage) === 'undefined' || smessage === null || smessage === ''){
		smessage = '操作成功';
	}
	if( typeof(fmessage) === 'undefined' || fmessage === null || fmessage === ''){
		fmessage = '操作失败';
	}
	if(err){
		log.error(err);
		res.send({status:'fail',message:fmessage});
	}else{
		res.send({status:'success',message:smessage});
	}
};

/**
 * 统一处理分页对象
 * @param {Object} po
 */
exports.page = function (po) {
	if(typeof(po.pageIndex) === 'undefined' || po.pageIndex === null || po.pageIndex === ''){
        po.pageIndex=1;
    }else{
        po.pageIndex=po.pageIndex*1;
    }
    if(typeof(po.pageSize) === 'undefined' || po.pageSize === null || po.pageSize === ''){
        po.pageSize=config.user_pageSize;
    }else{
        po.pageSize=po.pageSize*1;
    }
	return po;
};