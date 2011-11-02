/**
 * 登录
 */
 
exports.path = '/login';

var web = global.QuickWeb;

exports.post = function (request, response, next) {
	var username = request.post.u;
	var password = request.post.p;
	var auth = global.auth;
	if (username == auth.username && password == auth.password) {
		request.session.login = username;
		request.sessionUpdate();
		var sessionTag = web.get('session tag');
		var sessionId = request.sessionId;
		response.sendJSONIfAccepted({
			status:	1,
			tag:	sessionTag,
			id:		sessionId
		}, function () {
			response.redirect('/');
		});
	}
	else
		response.sendJSONIfAccepted({status: -1}, function () {
			response.sendError(500, 'verify fail');
		});
}