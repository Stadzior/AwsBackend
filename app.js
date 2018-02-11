require("./modules/receiver");
var service = require("./lib/service").http([]);
var port = 8080;
service(port);