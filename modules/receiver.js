var aws = require('aws-sdk');
aws.config.loadFromPath('./config.json');
var utils = require("./utils");
var jimp = require("jimp");
var queue = new aws.SQS({apiVersion: utils.API_VERSION});
var storage = new aws.S3();

var params = {
    MaxNumberOfMessages: 10,
    QueueUrl: utils.QueueUrl,
    VisibilityTimeout: 10,
    WaitTimeSeconds: 0,
    AttributeNames: [
        "All"
    ],
    MessageAttributeNames: [
        'All'
    ]
};

var consumeMessages = function () {
    queue.receiveMessage(params, function (err, data) {      
        var timeout = 3000;
        if (err)
            logger.log("Receive Error: " + err);
        else {
            if (data.Messages) {
                data.Messages.forEach(function (value) {

                    if (Number(value["Attributes"].ApproximateReceiveCount) <= 1) {

                        const numberType = value.MessageAttributes["Type"].StringValue;

                        switch (numberType) {
                            case utils.DELETE:
                                //Do delete
                                break;
                            case utils.ADD_TEXT:
                                //Do add text
                                break;
                            case utils.GREYSCALE:
                                //Do greyscale
                                break;
                            case utils.SEPIA:
                                //DO sepia
                                break;
                        }

                        var deleteParams = {
                            QueueUrl: utils.QueueUrl,
                            ReceiptHandle: value.ReceiptHandle
                        };

                        queue.deleteMessage(deleteParams, function (err, data) {
                            if (err)
                                logger.log("Delete error: " + err);
                        });
                    }

                });
                consumeMessages();

            } else {
                setTimeout(function () {
                    consumeMessages()
                }, timeout);
            }
        }
    });
};
consumeMessages();