var aws = require('aws-sdk');
aws.config.loadFromPath('./config.json');
var utils = require("./utils");
var jimp = require("jimp");
var queue = new aws.SQS({apiVersion: utils.API_VERSION});
var storage = new aws.S3();
var logger = require("./logger");

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

function deleteObject(guid) {
    var params = {Bucket: utils.bucketName, Key: guid}; 
    storage.deleteObject(params, function (err, data) {
        if (err)
            logger.log("Error while deleting object guid=\""+guid+"\" msg=\""+err+"\"");
    });
}

function invertColor(guid) {

    var params = {Bucket: utils.BucketName, Key: guid};
    storage.getSignedUrl('getObject', params, function (err, url) {

        jimp.read(url, function (err, image) {
            if (err)
                logger.log("Error read object guid=\""+guid+"\" msg=\""+err+"\"");

            image.invert()
            image.getBuffer(image.getMIME(), (err, buffer) => {

                if (err)
                    logger.log("Error while inverting colors in image guid=\""+guid+"\" msg=\""+err+"\"");
                else {

                    var invertedImage = {
                        Bucket: utils.BucketName,
                        Key: utils.generateNewGuid(),
                        Body: buffer
                    };

                    storage.putObject(invertedImage, function (err, data) {
                        if (err)
                            logger.log("Error uploading object guid=\""+guid+"\" msg=\""+err+"\"");
                    });
                }
            });
        });
    });
}

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
                        var guid = JSON.parse(value.Body);
                        switch (numberType) {
                            case utils.DELETE:
                                this.deleteObject(guid);
                                break;
                            case utils.INVERT:
                                this.invertColor(guid);
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