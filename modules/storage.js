module.exports = {
    delete(guid) {
        var params = {Bucket: utils.bucketName, Key: guid}; 
        storage.deleteObject(params, function (err, data) {
            if (err)
                logger.log("Error while deleting object guid=\""+guid+"\" msg=\""+err+"\"");
        });
    }
}