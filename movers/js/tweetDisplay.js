tweetDisplay = {};

tweetDisplay.show = function(user_id) {
    var baseUrl = "http://52.37.87.140:28017/movers/tweets/"
    var filter = "?filter_u_id=" + user_id;
    var url = baseUrl + filter;
    window.open(url, '_blank');
    window.focus();
}
