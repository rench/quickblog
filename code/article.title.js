/**
 * 文章相关操作
 */
 
exports.path = '/article/:title';

var web = global.QuickWeb;


/** 读取文章 */
exports.get = function (request, response, next) {
	var title = request.path.title;
	global.article.findOne({title: title}, function (err, data) {
		if (err || !data)
			next();
		else {
			// 生成Etag
			var etag = '' + data.lastupdate;
			request.etag(etag, function () {
				response.setEtag(etag);
				response.sendJSONIfAccepted({
					status: 	1,
					title:		title,
					content:	data.content,
					lastupdate:	data.lastupdate
				}, function () {
					response.renderFile('article.html', data);
				});
			});
		}
	});
}

/** 更新文章 */
exports.put = function (request, response, next) {
	// 登录验证
	if (typeof request.session.login != 'string') {
		response.sendJSONIfAccepted({status: -1, errmsg: 'access denied'}, function () {
			response.sendError(500, 'access denied');
		});
		return;
	}
	
	var title = request.path.title;
	var content = request.post.content;
	var tags = request.post.tags;
	var _id = web.util.md5(title);
	var set = {
		title:		title,
		content:	content,
		lastupdate:	new Date().getTime()
	}
	if (typeof tags != 'undefined')
		set.tags = tags;
	global.article.update({_id: _id}, {$set: set}, function (err) {
		if (err)
			response.sendJSONIfAccepted({status: 0, errmsg: err.toString()}, function () {
				response.sendError(500, err);
			});
		else
			response.sendJSONIfAccepted({status: 1}, function () {
				response.end('OK');
			});
	});
}

/* 发布文章 */
exports.post = function (request, response, next) {
	// 登录验证
	if (typeof request.session.login != 'string') {
		response.sendJSONIfAccepted({status: -1, errmsg: 'access denied'}, function () {
			response.sendError(500, 'access denied');
		});
		return;
	}
	
	var title = request.path.title;
	var content = request.post.content;
	var tags = request.post.tags || '';
	var timestamp = new Date().getTime();
	var _id = web.util.md5(title);
	global.article.save({
		_id:		_id,
		title:		title,
		content:	content,
		tags:		tags,
		timestamp:	timestamp,
		lastupdate:	timestamp
	}, function (err) {
		if (err)
			response.sendJSONIfAccepted({status: 0, errmsg: err.toString()}, function () {
				response.sendError(500, err);
			});
		else
			response.sendJSONIfAccepted({status: 1}, function () {
				response.end('OK');
			});
	});
}

/** 删除文章 */
exports.delete = function (request, response, next) {
	// 登录验证
	if (typeof request.session.login != 'string') {
		response.sendJSONIfAccepted({status: -1, errmsg: 'access denied'}, function () {
			response.sendError(500, 'access denied');
		});
		return;
	}
	
	var title = request.path.title;
	var _id = web.util.md5(title);
	global.article.remove({_id: _id}, function (err) {
		if (err)
			response.sendJSONIfAccepted({status: 0, errmsg: err.toString()}, function () {
				response.sendError(500, err);
			});
		else
			response.sendJSONIfAccepted({status: 1}, function () {
				response.end('OK');
			});
	});
}