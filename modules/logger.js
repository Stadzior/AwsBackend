module.exports = {
    log: function (message) {

        var utils = require("./utils");
        var logTableName = "LogTable";
        var aws = require('aws-sdk');
        aws.config.loadFromPath('./config.json');
        var database = new aws.DynamoDB();

        var params = {
            Item: {
                "GUID": {
                    S: utils.generateNewGuid()
                }, 
                "timestamp": {
                    S: String(Date.now())
                }, 
                "Message": {
                    S: "Backend; " + message
                }
            },
            ReturnConsumedCapacity: "TOTAL",
            TableName: logTableName
        };
        database.putItem(params, function (err, data) {});

    },
}