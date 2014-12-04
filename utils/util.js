var moment = require('moment');
var crypto = require('crypto');

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