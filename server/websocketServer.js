"use strict";


//MongoDB Query here; put as comment
    /*
    db.alldata.find({
        "_id":{$nin:filter.state.excludedUsers}, "spd":{$lt:excludedMaxSpeed, $gt:excludedMinSpeed},
        "lang":{$nin:filter.state.excludedLanguages}, "cntryCount":{$gt:excludedCountryMinNum, $lt:excludedCountryMaxNum}, 
        "cntries":{$nin:excludedCountries, $in:includeCountries}}).limit(chunker * 500)
    */

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
    
    // Send initialization data to client
    //
  
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
        httpServer: server  // the http server instance to attach WebSocket server to
    });
    
    
    // Register event listeners for the WebSocket server
    wsServer.on('request', function(wsRequest) {

        // protocol MUST be the same as requested by the client
        var acceptedProtocol = 'http';             

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

            // Get filter status
            
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


    // Get some initial numbers for the app:
    // - number of users in db
    // - all languages in the dataset
    // - all countries in the dataset 
    
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

    // do stuff with collection
    if (websocketServer.mdbCollection) {

	var textQuery = JSON.parse(event).textQuery;
	console.log(textQuery);
	
        // db.alldata.createIndex({"tweets.text": 'text'}); in shell first
        // var queryObj = {"tweets.text": textQuery}, 
        var queryObj = { $text: { $search: textQuery } },
            findOptions = {};
        // websocketServer.mdbCollection.find(queryObj, findOptions).limit(2).toArray(function(err, docs) {
        websocketServer.mdbCollection.find(queryObj, findOptions).toArray(function(err, docs) {

            if (!err) {

                var response = []
                // process query results
                for (var i = 0; i < docs.length; i++) {
                    var user = docs[i]
                    var tweets = docs[i].tweets
                    for (var j = 0; j < tweets.length; j++) {
                        var tweet = tweets[j];
                        
                        var isAllFound = true;
                        var q = textQuery.split(" ");
                        for (var k = 0; k < q.length; k++) {
                            if (!tweet.text.includes(q[k])) {
                                // console.log(q[k]);
                                isAllFound = false;
                                break;
                            }
                        }
                        // console.log("isAllFound", isAllFound);
                        if (isAllFound) {
                            tweet["u_id"] = user["_id"];
                            tweet["lang"] = user.lang;
                            response.push(tweet);
                            // console.log(tweet);                         
                        }
                    }
                }

                var stringDocs = JSON.stringify(response);
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
