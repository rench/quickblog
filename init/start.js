/**
 * 初始化
 */
 
var path = require('path'); 
var web = global.QuickWeb;
var mongo = require("mongoskin");

// 用户名、密码
global.auth = {
	username:	'leizongmin',
	password:	'123456'
}

// 配置MongoDB连接
var db_url = exports.db_url = "127.0.0.1:27017/quickweb-docs";
var db = global.db = mongo.db(db_url);
// 文章集合
global.article = db.collection('article');

// RSS输出
global.rss = {
	path:			'http://quick.cnodejs.net/',	// 网站地址
	title:			'QuickWeb文档',					// RSS标题
	description:	'QuickWeb应用实例、更新'		// 简介
}

// Etag版本号，当修改了系统模板时，通过修改Etag版本号可以使以前的缓存失效
global.etag = '20111103-3';