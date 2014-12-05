var mysql = require('mysql');
var config = require('../config');
var log = require('../log').logger('w2r');
var conn = mysql.createConnection(config.mysql_options);

/**
 * 根据主键获取记录
 * Callback:
 * - err, 数据库异常
 * - results, 记录集合
 * @param {String} table 表名
 * @param {String} idvalue 主键id
 * @param {Function} callback 回调函数
 */
exports.getById = function (table,idvalue,callback) {
	
	var sql='select * from  '+table+' where id="'+idvalue+'"';
	log.info('主键查询: '+sql);
	conn.query(sql,function(err,results){
		if(err){
			log.error(err);
		}else{
			callback(err,results[0]);
		}
	});
	
};

/**
 * 根据条件查询列表
 * Callback:
 * - err, 数据库异常
 * - results, 记录集合
 * @param {String} table 表名
 * @param {String} condition 条件
 * @param {String} order 排序
 * @param {Function} callback 回调函数
 */
exports.getList = function (table,condition,order,callback) {
	
	var sql = 'select * from  '+table ;
	if(condition !== null && condition !== '' && typeof(condition) !== 'undefined' && typeof(condition) !== 'function'){
		sql += ' where ' + condition ;
	}
	if(order !== null && order !== '' && typeof(order) !== 'undefined' && typeof(order) !== 'function'){
		sql += ' order by ' + order ;
	}
	var r_callback;
	if(typeof(condition) === 'function'){
		r_callback = condition;
	}else if(typeof(order) === 'function'){
		r_callback = order;
	}else{
		r_callback = callback;
	}
	log.info('条件查询: '+sql);
	conn.query(sql,r_callback);
	
};

/**
 * 根据条件查询单个
 * Callback:
 * - err, 数据库异常
 * - result, 记录
 * @param {String} table 表名
 * @param {String} condition 条件
 * @param {Function} callback 回调函数
 */
exports.getOne = function (table,condition,callback) {
	
	var sql = 'select * from  '+ table +' where ' + condition;
	log.info('条件查询: '+sql);
	conn.query(sql,function(err,results){
		if(err){
			log.error(err);
		}else{
			callback(err,results[0]);
		}
	});
	
};

/**
 * 根据条件查询列表
 * Callback:
 * - err, 数据库异常
 * - results, 记录集合
 * @param {Number} pageIndex 页号
 * @param {Number} pageSize 页长
 * @param {String} table 表名
 * @param {String} condition 条件
 * @param {String} order 排序
 * @param {Function} callback 回调函数
 */
exports.getListWithPage = function (pageIndex,pageSize,table,condition,order,callback) {
	
	var sql = 'select * from  '+table ;
	if(condition !== null && condition !== '' && typeof(condition) !== 'undefined' && typeof(condition) !== 'function'){
		sql += ' where ' + condition ;
	}
	if(order !== null && order !== '' && typeof(order) !== 'undefined' && typeof(order) !== 'function'){
		sql += ' order by ' + order ;
	}
	sql += ' limit '+(pageIndex-1)*pageSize+','+pageSize;
	var r_callback;
	if(typeof(condition) === 'function'){
		r_callback = condition;
	}else if(typeof(order) === 'function'){
		r_callback = order;
	}else{
		r_callback = callback;
	}
	log.info('分页条件查询: '+sql);
	conn.query(sql,r_callback);
	
};

/**
 * 新增记录
 * Callback:
 * - err, 数据库异常
 * - result, 记录
 * @param {String} table 表名
 * @param {Object} value 插入对象
 * @param {Function} callback 回调函数
 */
exports.insert = function (table,value,callback) {
	
	var sql='insert  into '+table+' set ?';
	var query=conn.query(sql,value,callback);
	log.info('新增: '+query.sql);
	
};

/**
 * 主键更新记录
 * Callback:
 * - err, 数据库异常
 * - result, 记录
 * @param {String} table 表名
 * @param {String} idvalue 主键id
 * @param {String} updateString 更新语句
 * @param {Function} callback 回调函数
 */
exports.updateById = function (table,idvalue,updateString,callback) {
	
	var sql='update  '+table+' set '+updateString+' where id="'+idvalue+'"';
	log.info('主键更新: '+sql);
	conn.query(sql,callback);
	
};

/**
 * 条件更新记录
 * Callback:
 * - err, 数据库异常
 * - result, 记录
 * @param {String} table 表名
 * @param {String} condition 条件
 * @param {String} updateString 更新语句
 * @param {Function} callback 回调函数
 */
exports.updateByCondition = function (table,condition,updateString,callback) {
	
	var sql='update  '+table+' set '+updateString+' where '+condition+'';
	log.info('条件更新: '+sql);
	conn.query(sql,callback);
	
};

/**
 * 主键删除记录
 * Callback:
 * - err, 数据库异常
 * - result, 记录
 * @param {String} table 表名
 * @param {String} idvalue 主键id
 * @param {Function} callback 回调函数
 */
exports.deleteById = function (table,idvalue,callback) {
	
	var sql='delete  from '+table+' where id="'+idvalue+'"';
	log.info('主键删除: '+sql);
	conn.query(sql,callback);
	
};

/**
 * 条件查询记录数
 * Callback:
 * - err, 数据库异常
 * - {count:?}
 * @param {String} table 表名
 * @param {String} condition 条件
 * @param {Function} callback 回调函数
 */
exports.count = function (table,condition,callback) {
	
	var sql='select count(*) count from  '+table;
	if(condition !== null && condition !== '' && typeof(condition) !== 'undefined' && typeof(condition) !== 'function'){
		sql += ' where ' + condition ;
	}
	var r_callback;
	if(typeof(condition) === 'function'){
		r_callback = condition;
	}else{
		r_callback = callback;
	}
	log.info('统计执行: '+sql);
	conn.query(sql,function(err,results){
		if(err){
			log.error(err);
		}else{
			r_callback(err,results[0]);
		}
	});
	
};

/**
 * sql查询记录数
 * Callback:
 * - err, 数据库异常
 * - {count:?}
 * @param {String} sql sql
 * @param {Function} callback 回调函数
 */
exports.countBySql = function (sql,callback) {
	
	log.info('统计执行: '+sql);
	conn.query(sql,function(err,results){
		if(err){
			log.error(err);
		}else{
			callback(err,results[0]);
		}
	});
	
};

/**
 * sql查询记录
 * Callback:
 * - err, 数据库异常
 * - results, 记录集合
 * @param {String} sql sql
 * @param {Function} callback 回调函数
 */
exports.query = function (sql,callback) {
	
	log.info('sql执行: '+sql);
	conn.query(sql,callback);
	
};

/**
 * 分页sql查询记录  
 * Callback:
 * - err, 数据库异常
 * - results, 记录集合
 * @param {Number} pageIndex 页号
 * @param {Number} pageSize 页长
 * @param {String} sql sql
 * @param {Function} callback 回调函数
 */
exports.queryWithPage = function (pageIndex,pageSize,sql,callback) {
	
	sql += ' limit '+(pageIndex-1)*pageSize+','+pageSize;
	log.info('sql执行: '+sql);
	conn.query(sql,callback);
	
};




