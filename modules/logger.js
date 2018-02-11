module.exports = {
    log: function (message) {

        var queueHandler = require("./queueHandler");
        var logTableName = "LogTable";
        var aws = require('aws-sdk');
        aws.config.loadFromPath('./config.json');
        var database = new aws.DynamoDB();

        var params = {
            Item: {
                "GUID": {
                    S: queueHandler.generateNewGuid()
                }, 
                "timestamp": {
                    S: String(Date.now())
                }, 

                "Message": {
                    S: "Worker; " + message
                }
            },
            ReturnConsumedCapacity: "TOTAL",
            TableName: logTableName
        };
        database.putItem(params, function (err, data) {});

    },
}