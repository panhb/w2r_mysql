var mysql = require('mysql');
var config = require('../config');
var log = require('../log').logger('w2r');
var conn = mysql.createPool(config.mysql_options);






/**
 * 初始化数据库
 * Callback:
 * - err, 数据库异常
 * @param {Function} callback 回调函数
 */
exports.initDb = function(callback){

	var exist_sqls = [];
	var table_names = ["article","comment","login","message","relation","user","collection"];
	var create_sqls = [];

	create_sqls.push("CREATE TABLE `article` ("+
	  "`id` varchar(255) character set utf8 NOT NULL,"+
	  "`title` varchar(255) character set utf8 default NULL COMMENT '标题',"+
	  "`content` varchar(20000) character set utf8 default NULL COMMENT '内容',"+
	  "`author_id` varchar(255) character set utf8 default NULL COMMENT '作者',"+
	  "`top` int(1) default '0' COMMENT '置顶',"+
	  "`star` int(1) default '0' COMMENT '精华',"+
	  "`reply_count` int(11) default '0' COMMENT '回复数',"+
	  "`visit_count` int(11) default '0' COMMENT '点击数',"+
	  "`create_date` datetime default NULL COMMENT '创建时间',"+
	  "`update_date` datetime default NULL COMMENT '更新时间',"+
	  "`status` int(1) default '0' COMMENT '状态   0非公开  1公开',"+
	  "`tab` varchar(255) character set utf8 default NULL COMMENT '标签',"+
	  "`height` varchar(255) character set utf8 default NULL COMMENT '文章高度',"+
	  "PRIMARY KEY  (`id`))"
	);

	create_sqls.push("CREATE TABLE `comment` ("+
	  "`id` varchar(255) NOT NULL,"+
	  "`userid` varchar(255) NOT NULL COMMENT '评论人id',"+
	  "`articleid` varchar(255) NOT NULL COMMENT '文章id ',"+
	  "`content` varchar(1000) default NULL COMMENT '评论内容',"+
	  "`create_date` datetime default NULL COMMENT '创建时间',"+
	  "PRIMARY KEY  (`id`))"
	);

	create_sqls.push("CREATE TABLE `login` ("+
	  "`id` varchar(255) NOT NULL,"+
	  "`userid` varchar(255) NOT NULL COMMENT '用户id',"+
	  "`ip` varchar(255) default NULL COMMENT 'ip地址',"+
	  "`login_date` datetime default NULL COMMENT '登录时间',"+
	  "`logout_date` datetime default NULL COMMENT '登出时间',"+
	  "PRIMARY KEY  (`id`))"
	);

	create_sqls.push("CREATE TABLE `message` ("+
	  "`id` varchar(255) NOT NULL,"+
	  "`send_userid` varchar(255) NOT NULL COMMENT '寄信人',"+
	  "`to_userid` varchar(255) NOT NULL COMMENT '收信人',"+
	  "`send_date` datetime default NULL COMMENT '寄信时间',"+
	  "`content` varchar(1000) default NULL COMMENT '内容',"+
	  "`has_read` int(1) default '0' COMMENT '是否已读   0未读  1已读',"+
	  "`type` varchar(255) default NULL COMMENT '类型',"+
	  "PRIMARY KEY  (`id`))"
	);

	create_sqls.push("CREATE TABLE `relation` ("+
	  "`id` varchar(255) NOT NULL,"+
	  "`userid` varchar(255) default NULL,"+
	  "`followid` varchar(255) default NULL,"+
	  "`create_date` datetime default NULL,"+
	  "PRIMARY KEY  (`id`))"
	);

	create_sqls.push("CREATE TABLE `user` ("+
	  "`id` varchar(255) character set utf8 NOT NULL,"+
	  "`username` varchar(255) character set utf8 NOT NULL COMMENT '用户名',"+
	  "`password` varchar(255) character set utf8 NOT NULL COMMENT '密码',"+
	  "`email` varchar(255) character set utf8 NOT NULL COMMENT '邮箱',"+
	  "`url` varchar(255) character set utf8 default NULL COMMENT '个人主页',"+
	  "`signature` varchar(255) character set utf8 default NULL COMMENT '签名',"+
	  "`avatar` varchar(255) character set utf8 default NULL COMMENT '头像',"+
	  "`score` int(6) default '0' COMMENT '积分',"+
	  "`fans` int(6) default '0' COMMENT '粉丝数',"+
	  "`following` int(6) default '0' COMMENT '关注数',"+
	  "`create_date` datetime default NULL COMMENT '创建时间',"+
	  "`update_date` datetime default NULL COMMENT '更新时间',"+
	  "`status` int(1) default '0' COMMENT '用户状态   0未激活  1已激活   2冻结',"+
	  "`active_key` varchar(255) character set utf8 default NULL COMMENT '激活钥匙',"+
	  "`role_type` int(1) default '0' COMMENT '0用户角色   1管理员   ',"+
	  "`githubId` varchar(255) default NULL,"+
	  "PRIMARY KEY  (`id`),"+
	  "UNIQUE KEY `username_unique` USING BTREE (`username`),"+
	  "UNIQUE KEY `email_unique` USING BTREE (`email`))"
	);

	create_sqls.push("CREATE TABLE `collection` ("+
	  "`id` varchar(255) NOT NULL,"+
	  "`articleid` varchar(255) NOT NULL,"+
	  "`userid` varchar(255) NOT NULL,"+
	  "`create_date` datetime NOT NULL,"+
	  "PRIMARY KEY  (`id`))"
	);

	for(var i  in table_names){
		exist_sqls.push("show tables like '"+table_names[i]+"'");
	}

	init_db(0);
	function init_db(j){
		log.info('判断表是否存在: '+exist_sqls[j]);
		conn.query(exist_sqls[j],function(err,rows){
			if(err){
				callback(err);
			}
			if (rows.length === 0) {
				log.info('创建表: '+create_sqls[j]);
				conn.query(create_sqls[j]);
				j++;
				if(j !== exist_sqls.length){
					init_db(j);
				}else{
					callback(null);
				}
			} else {
				if(j === (exist_sqls.length-1)){
					callback(null);
				}else{
					j++;
					init_db(j);
				}
			}
		})
	}
}

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




