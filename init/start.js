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
var db_url = exports.db_url = "127.0.0.1:27017/mini-blog";
var db = global.db = mongo.db(db_url);
// 文章集合
global.article = db.collection('article');
