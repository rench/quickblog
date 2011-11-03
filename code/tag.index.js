/**
 * 浏览指定标签的文章
 */
 
exports.path = '/tag/:tags';

var web = global.QuickWeb;


/**  查看指定标签下的文章 */
exports.get = function (request, response, next) {
	var tags = request.path.tags;
	var p = parseInt(request.get.p);
	if (isNaN(p) || p < 1)
		p = 1;
	global.article.find({
		tags:	new RegExp('' + tags)
	}, {
		skip:	(p - 1) * 10,
		limit:	10,
		sort:	[['lastupdate', -1], ['timestamp', -1]],
	}).toArray(function (err, data) {
		if (err)
			response.sendJSONIfAccepted({status: 0, errmsg: err.toString()}, function () {
				response.sendError(500, err);
			});
		else {
			// 生成Etag
			if (typeof data[0] != 'undefined')
				var etag = web.util.md5(global.etag + data[0]._id + data[0].lastupdate +
					data[0].content);
			else
				var etag = 'empty';
			request.etag(etag, function () {
				response.setEtag(etag);
				response.sendJSONIfAccepted({status: 1, items: data}, function () {
					var view = {
						path:	request.filename,
						p:		p,
						next:	p + 1,
						prev:	p - 1,
						items:	data
					}
					response.renderFile('index.html', view);
				});
			});
		}
	});
}