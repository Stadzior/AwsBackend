var service = function(urlMap){
	return function (port) {
		var express = require('express');
		app = express();
		app.listen(port);
	}
}

exports.http = service;