var networkInterface = {};
// establish persistent connection with the remote websocket server
var launchSocketRequest = function (wsUrl) {
    var protocol = 'http';

    var socket = new WebSocket(wsUrl, protocol);
    console.log("Requested a socket connection with " + wsUrl + " using " + protocol + " as protocol.");
    socket.onopen = function(event) {
        console.log("Socket connection established.");
    }
    
    socket.onmessage = function (event) {
        console.log("Received data from server: " + event.data);
        // var queryMatches = JSON.parse(event.data);
        // queryMatches.forEach(function(match) {
        //     console.log(match.text);
        // });
    }
    
    socket.onclose = function (event) {
        console.log("Socket connection closed.");
    }
    socket.onerror = function (event) {
        console.log("Socket error.")
    }
    
    return socket;
}

var initSocket = function (ip, port) {
    // Form the request
    var wsUrl = "ws://" + ip + ":" + port;  // 128.118.54.231
    
    // Launch the request
    return launchSocketRequest(wsUrl);
}

// send a message over the websocket connection
var sendMessage = function (jsonObject, socket) {
    if (socket.readyState == WebSocket.OPEN) {
        socket.send(JSON.stringify(jsonObject));
    } else {
        console.log("Socket isn't ready for data to be sent.")
    }
}

// event handler for link click
var onSendEventClick = function () {
    console.log("Link clicked");
    var sampleMessage = {
        message: "Ying!",
        textQuery:"France Mideast"
    };
    // send a message to the server
    sendMessage(sampleMessage);
}

// connect to websocket server
initSocket("127.0.0.1", 8080);
// register event handler for link click
$("#sendEventLink").click(onSendEventClick);
});
