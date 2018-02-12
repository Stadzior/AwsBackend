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

function transform(guid, type) {

    var params = {Bucket: utils.BucketName, Key: guid};
    storage.getSignedUrl('getObject', params, function (err, url) {

        jimp.read(url, function (err, image) {
            if (err)
                logger.log("Error read object guid=\""+guid+"\" msg=\""+err+"\"");

            switch (type) {
                case utils.INVERT:
                    image.invert();
                    break;
                case utils.GREYSCALE:
                    image.greyscale();
                    break;
                case utils.SEPIA:
                    image.sepia();
                    break;
            }

            image.getBuffer(image.getMIME(), (err, buffer) => {

                if (err)
                    logger.log("Error while transforming image guid=\""+guid+"\" msg=\""+err+"\"");
                else {

                    var transformedImage = {
                        Bucket: utils.BucketName,
                        Key: utils.generateNewGuid(),
                        Body: buffer
                    };

                    storage.putObject(transformedImage, function (err, data) {
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
                        const transformationType = value.MessageAttributes["Type"].StringValue;
                        var guid = JSON.parse(value.Body);
                        logger.log("message received with type=\""+transformationType+"\"");
                        transform(guid, transformationType);
                        var deleteParams = {
                            QueueUrl: utils.QueueUrl,
                            ReceiptHandle: value.ReceiptHandle
                        };
                        queue.deleteMessage(deleteParams, function (err, data) {
                            if (err){
                                logger.log("Delete error: " + err.message);
                            }
                        });
                    }
                    else
                    {
                        console.log("attempting cleanup");
                        queue.deleteMessage(deleteParams, function (err, data) {
                            if (err){
                                console.log("error occured");
                                console.log(err.type);
                                console.log(err.message);
                                logger.log("Delete error: " + err.message);
                            }
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