var moment = require('moment');
var crypto = require('crypto');
var xss = require('xss');

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
	return moment().format('YYYYMMDDHHmmssSSS');
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