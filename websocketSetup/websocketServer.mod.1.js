"use strict";

// Imports
var socketServer    = require('websocket').server,
    http            = require('http'),
    mongo           = require('mongodb');

var websocketServer = {};

// websocketServer.activeConnections = {};
websocketServer.activeConnections = [];

websocketServer.init = function () {
    
    // Initialize web server
    this.initServer();

    // Turn on the beacon
    // setInterval(function() {

    //     var beaconMessage = (new Date).toLocaleTimeString() + " [SERVER] " + "Ping!";
        
    //     websocketServer.activeConnections.forEach(function (connection) {

    //         if (connection) {
    //             console.log("Pinging a client..")
    //             connection.sendUTF(beaconMessage);
    //         }
    //     });

    // }, 3000);
    
}

websocketServer.initServer = function() {
    
    // Variables
    var port = 8080;
    
    
    // Create an HTTP server to which WebSocket server will be attached
    
    var server = http.createServer(function(request, response) {

        console.log((new Date).toLocaleTimeString() + " [SERVER] " + "Received request for " + request.url);

        var responseMessage =   "<!DOCTYPE html>" + 
                                "<html>" + 
                                    "<head><meta charset='utf-8'></head>" + 
                                    "<body>" + 
                                        "<span>Sorry, no real website here.</span>" + 
                                    "<body>" + 
                                "</html>";

        response.writeHead(404);
        response.write(responseMessage);

        response.end();
    });
    
    server.listen(port, function() {
        console.log((new Date).toLocaleTimeString() + " [SERVER] " + "HTTP server is listening on port " + port + ".");
    });
    
    
    // Create a WebSocket server
    
    var wsServer = new socketServer({
        httpServer: server                                                      // the http server instance to attach WebSocket server to
    });
    
    
    // Register event listeners for the WebSocket server
    
    wsServer.on('request', function(wsRequest) {
        
        var acceptedProtocol = 'http';                                          // protocol MUST be the same as requested by the client
        
        // Accept the incoming connection
        var wsConnection = wsRequest.accept(acceptedProtocol, wsRequest.origin);
        console.log((new Date).toLocaleTimeString() + " [SERVER] " + 'Connection from origin ' + wsRequest.origin + ' at ' + wsConnection.remoteAddress + ' accepted.');

        // ////////////////////////////

        // // Store the incoming connection
        // websocketServer.activeConnections.push(wsConnection);
        // console.log(websocketServer.activeConnections.length + " active connections.");


        // ////////////////////////////
        
        
        // Register event listeners for the connection
        
        wsConnection.on('message', function(message) {
            
            // Send a file to the client

            console.log((new Date).toLocaleTimeString() + " [SERVER] " + 'Received Message: ' + message.utf8Data);

            // console.log((new Date).toLocaleTimeString() + " [SERVER] " + "Sending file..");
            // wsConnection.sendUTF((new Date).toLocaleTimeString() + " Hi there! This is your server speaking.");

             console.log((new Date).toLocaleTimeString() + " [SERVER] " + "Re-broadcasting message..");
             websocketServer.broadcastEvent(message.utf8Data, wsConnection);
        });
        
        wsConnection.on('close', function(reasonCode, description) {

            console.log((new Date).toLocaleTimeString() + " [SERVER] " + 'Peer ' + wsConnection.remoteAddress + ' disconnected.');

            // // Drop this connection from the active list
            // websocketServer.activeConnections = websocketServer.activeConnections.filter(function (suspectConnection) {
            //     return (suspectConnection !== wsConnection);
            // });

            // console.log(websocketServer.activeConnections.length + " active connections.");
        });
        
    });


    // Connect to MongoDB
     websocketServer.connectToMongoDb();
    
}

// websocketServer.originIsAllowed = function (origin) {
    
//     var allowed = false;
//     var okOrigin = "http://www.personal.psu.edu"

//     console.log((new Date).toLocaleTimeString() + " [SERVER] " + "Request origin is " + origin);

//     if (origin == okOrigin) {
//         allowed = true;
//     }

//     return allowed;
// }



websocketServer.broadcastEvent = function (event, sourceConnection) {
    console.log(event);
    // do stuff with collection
    if (websocketServer.mdbCollection) {

        var queryObj = event.textQuery, 
            findOptions = {tweets[0].text:true,lang: true};

        websocketServer.mdbCollection.find(queryObj, findOptions).limit(2).toArray(function(err, docs) {

            if (!err) {

                // process query results

                 console.log(docs);

                var stringDocs = JSON.stringify(docs);
		sourceConnection.sendUTF(stringDocs);

               // websocketServer.activeConnections.forEach(function (connection) {
                 //   connection.sendUTF(stringDocs);
                //});

            } else {

                console.log("Error: " + err);
            }
        });

    }
    

    // Re-broadcast incoming events
    // websocketServer.activeConnections.forEach(function (connection) {

    //     if (connection !== sourceConnection) {
    //         connection.sendUTF(event);
    //     }
        
    // });
}

websocketServer.connectToMongoDb = function () {

    // TODO: rename this method;

    var hostName = "localhost",
        dbName = "movers",
        collectionName = "alldata";

    var mClient = mongo.MongoClient;

    mClient.connect("mongodb://localhost:27017/" + dbName, {auto_reconnect: true}, function(err, mDb) {

        if(!err) {

            console.log((new Date).toLocaleTimeString() + " [SERVER] " + "We are connected to MongoDB.");

            mDb.collection(collectionName, function(err, collection) {

                if(!err) {

                    console.log((new Date).toLocaleTimeString() + " [SERVER] " + "Collection \"" + collectionName + "\" retrieved.");

                    websocketServer.mdbCollection = collection;

                    

                } else {

                    console.log((new Date).toLocaleTimeString() + " [SERVER] " + "[FATAL] " + "Error fetching collection \"" + collectionName + "\":");
                    console.log(err);
                }

            });

        } else {

            console.log((new Date).toLocaleTimeString() + " [SERVER] " + "[FATAL] " + "Error connecting to MongoDB:");
            console.log(err);
        }

    });

}

websocketServer.init();
