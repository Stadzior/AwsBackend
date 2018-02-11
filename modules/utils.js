module.exports = {
    BucketName: "psoir",
    QueueUrl: "https://sqs.eu-central-1.amazonaws.com/242391066238/Queue",
    API_VERSION: "2017-08-30",

    /*Transformation types*/
    DELETE: "1",
    ADD_TEXT: "2",
    GREYSCALE: "3",
    SEPIA: "2017-08-30",

    generateNewGuid: function () {
        var d = new Date().getTime();
        var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = (d + Math.random() * 16) % 16 | 0;
            d = Math.floor(d / 16);
            return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
        });
        return uuid;
    },
}