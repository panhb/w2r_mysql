var path = require("path");
var log4js = require("log4js");

/**
 * 暴露到应用的日志接口
 * @param name 指定log4js配置文件中的category。依此找到对应的appender。
 *              如果appender没有写上category，则为默认的category。可以有多个
 * @returns {Logger}
 */
exports.logger = function(name) {
	log4js.configure(path.join(__dirname,'log4js.json'));  
    var dateFileLog = log4js.getLogger(name);
    dateFileLog.setLevel(log4js.levels.INFO);
    return dateFileLog;
};

/**
 * 用于express中间件
 * @returns {Function|*}
 */
exports.useLog = function() {
	log4js.configure(path.join(__dirname,'log4js.json'));  
    return log4js.connectLogger(log4js.getLogger('w2r'),{level:'auto', format:':method :url'});
}; 