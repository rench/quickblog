/**
 * mini-blog命令行工具
 */
 
var fs = require('fs');
var path = require('path');
var qs = require('querystring');
var request = require('request');

// 载入配置
var config = JSON.parse(fs.readFileSync(
		path.resolve(__dirname, 'config.json')).toString());

var cmd = process.argv[2];
if (typeof cmd == 'undefined')
	cmd = '--help';
else
	cmd = cmd.toLowerCase().trim();
	
// 登录信息
var session;
	
// 主程序
var main = function () {
	switch (cmd) {
		// 显示文章列表
		case 'list':
			login(cmdList);
			break;
		// 读文件内容
		case 'read':
			login(cmdRead);
			break;
		// 发布文章
		case 'post':
			login(cmdPost);
			break;
		// 更新文章
		case 'update':
			login(cmdUpdate);
			break;
		// 删除文章
		case 'delete':
			login(cmdDelete);
			break;
		// 帮助
		default:
			console.log('mini-blog命令行工具\n\
blog \033[0;33mlist\033[0m <页号>	显示文章列表\n\
blog \033[0;33mread\033[0m [标题]	浏览文章\n\
blog \033[0;33mpost\033[0m [标题]	发布新文章\n\
blog \033[0;33mupdate\033[0m [标题]	更新文章\n\
blog \033[0;33mremove\033[0m [标题]	删除文章\n\
			');
	}
}

// 登录
var login = function (callback) {
	request({
		uri:		config.url + 'login',
		method:		'POST',
		headers:	{
			'Accept': 		'application/json',
			'Content-Type':	'application/x-www-form-urlencoded'
		},
		body:		qs.stringify({u: config.username, p: config.password})
	}, function (err, response, body) {
		if (err)
			console.log('Error: ' + err);
		session = JSON.parse(body);
		if (session.status < 1)
			console.log('\033[41;37m登录失败\033[0m');
		else
			callback();
	});
}

// 转换整数时间为文本格式
var timestamp2str = function (t) {
	var d = new Date(t);
	var ret = d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate() + ' ' + d.getHours() + ':' + d.getMinutes();
	return ret;
}

// 取文章列表
var cmdList = function () {
	var p = parseInt(process.argv[3]);
	if (isNaN(p) || p < 1)
		p = 0;
	request({
		uri:		config.url + '?p=' + p,
		method:		'GET',
		headers:	{
			'Accept': 		'application/json'
		}
	}, function (err, response, body) {
		if (err)
			console.log('Error: ' + err);
		var data = JSON.parse(body);
		console.log('------------------------------------------');
		for (var i in data.items) {
			var a = data.items[i];
			console.log(timestamp2str(a.lastupdate) + '\t\033[0;33m' + a.title + '\033[0m');
			console.log('------------------------------------------');
		}
	});
}

// 浏览指定文章
var cmdRead = function () {
	var title = process.argv[3];
	if (typeof title == 'undefined') {
		console.log('未指定文章标题');
		return;
	}
	request({
		uri:		config.url + 'article/' + title,
		method:		'GET',
		headers:	{
			'Accept': 		'application/json'
		}
	}, function (err, response, body) {
		if (err)
			console.log('Error: ' + err);
		var data = JSON.parse(body);
		console.log('------------------------------------------');
		console.log('\033[0;33m' + data.title + '\033[0m');
		console.log('最后修改时间：\033[44;37m' + timestamp2str(data.lastupdate) + '\033[0m\n');
		console.log(data.content);
		console.log('------------------------------------------');
	});
}

// 发布文章
var cmdPost = function () {
	var title = process.argv[3];
	if (typeof title == 'undefined') {
		var dir = fs.readdirSync('.');
		for (var i in dir) {
			if (path.extname(dir[i]) == '.md')
				post(dir[i].substr(0, dir[i].length - 3));
		}
	}
	else {
		post(title);
	}
}

// 更新文章
var cmdUpdate = function () {
	var title = process.argv[3];
	if (typeof title == 'undefined') {
		var dir = fs.readdirSync('.');
		for (var i in dir) {
			if (path.extname(dir[i]) == '.md')
				put(dir[i].substr(0, dir[i].length - 3));
		}
	}
	else {
		put(title);
	}
}

// 删除文章
var cmdDelete = function () {
	var title = process.argv[3];
	if (typeof title == 'undefined') {
		console.log('未指定文章标题');
		return;
	}
	request({
		uri:		config.url + 'article/' + title,
		method:		'DELETE',
		headers:	{
			'Accept': 		'application/json',
			'Cookie':		session.tag + '=' + qs.escape(session.id)
		}
	}, function (err, response, body) {
		if (err)
			console.log('Error: ' + err);
		var data = JSON.parse(body);
		if (data.status < 1)
			console.log('删除文章\033[43;37m' + title + '\033[0m失败');
		else
			console.log('删除文章\033[0;33m' + title + '\033[0m成功');
	});
}

var post = function (t) {
	var c = fs.readFileSync(t + '.md').toString();
	request({
		uri:		config.url + 'article/' + qs.escape(t),
		method:		'POST',
		headers:	{
			'Accept': 		'application/json',
			'Content-Type':	'application/x-www-form-urlencoded',
			'Cookie':		session.tag + '=' + qs.escape(session.id)
		},
		body:		qs.stringify({content: c})
	}, function (err, response, body) {
		if (err)
			console.log('Error: ' + err);
		var data = JSON.parse(body);
		if (data.status < 1)
			console.log('发布\033[43;37m' + t + '\033[0m失败');
		else
			console.log('发布\033[0;33m' + t + '\033[0m成功');
	});
}

var put = function (t) {
	var c = fs.readFileSync(t + '.md').toString();
	request({
		uri:		config.url + 'article/' + qs.escape(t),
		method:		'PUT',
		headers:	{
			'Accept': 		'application/json',
			'Content-Type':	'application/x-www-form-urlencoded',
			'Cookie':		session.tag + '=' + qs.escape(session.id)
		},
		body:		qs.stringify({content: c})
	}, function (err, response, body) {
		if (err)
			console.log('Error: ' + err);
		var data = JSON.parse(body);
		if (data.status < 1)
			console.log('更新\033[43;37m' + t + '\033[0m失败');
		else
			console.log('更新\033[0;33m' + t + '\033[0m成功');
	});
}

// 开始
main();
