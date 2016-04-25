utils = {};

utils.printTime = function(component) {
    var end = new Date().getTime();
    var time = end - start;
    var msg = component + ': ' + time;
    console.log(msg);
    start = new Date().getTime();
}

utils.startTimer = function() {
    start = new Date().getTime();
}
