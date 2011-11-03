/**
 * RSS订阅
 */
 
exports.path = '/rss';

var web = global.QuickWeb;
var toHTML = require( "markdown" ).markdown.toHTML;


/**  查看指定标签下的文章 */
exports.get = function (request, response, next) {
	var tags = request.get.tags;
	var cond = {}
	if (typeof tags == 'string')
		cond.tags = new RegExp('' + tags);
	global.article.find(cond, {
		limit:	20,
		sort:	[['lastupdate', -1], ['timestamp', -1]],
	}).toArray(function (err, data) {
		if (err)
			response.sendError(500, err);
		else {
			// 生成Etag
			if (typeof data[0] != 'undefined')
				var etag = web.util.md5(global.etag + data[0]._id + data[0].lastupdate +
					data[0].content);
			else
				var etag = 'empty';
			request.etag(etag, function () {
				response.setEtag(etag);
			
				// 整理结果
				for (var i = 0, item; item = data[i]; i++) {
					item.link = global.rss.path + 'article/' + encodeURI(item.title);
					item.lastupdate = new Date(parseInt(item.lastupdate)).toUTCString();
					item.content = toHTML(item.content);
				}
				
				var view = {
					items:			data,
					timestamp:		new Date().toUTCString(),
					path:			global.rss.path,
					title:			global.rss.title,
					description:	global.rss.description
				}
				response.renderFile('rss.xml', view);
			});
		}
	});
}