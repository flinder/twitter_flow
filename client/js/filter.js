// "Import" profiling funcions
var st = utils.startTimer;
var pt = utils.printTime;
 
filter = {};

filter.init = function() {
    
    st()
    filter.currentData = {};

    // Main object holding the status of all filter controls
    filter.state = {};
    filter.state.excludedUsers = [];
    filter.state.excludedLanguages = [];
    filter.state.excludedCountries = [];
    filter.state.includeCountries = [];
    filter.state.chunker = 1;

    filter.state.excludedMaxSpeed = 1000;
    filter.state.excludedMinSpeed = 0;

    filter.state.excludedCountryMaxNum = 50;
    filter.state.excludedCountryMinNum = 0;
   
    // First filtering because of the chunker
    filter.filter(init=true);
    // Initialize visualizations
    filter.u_index_min = 0;
    filter.u_index_max = 9
    pt('filter.inti() [Filter part]');     
 
    // Push initial data status to display 
    //_updateStatusTable();
    pt('_updateStatusTable()');
   
    // Initialize visualizations
    timeTravel.init();    
    pt('timeTravel.init()');
    //map.init();
    pt('map.init();');

}


// Main filter function. This function always operates on the original data and
// sequentially reduces it, depending on filter.state
// It then updates filter.currentData with the newly filtered data and triggers
// updating of all visualizations
filter.filter = function(init=false) {

    console.log('Filtering...');
    st();
    
    // TODO: 
    // Send filter.state via websocket to server 
    // response = send_request(filter.state, init)
    //
    // Process the response and push data in corresponding elemetns
    // if(init) {
    //     get initial data (total number of users, languages, etc.
    //     get first chunck of data
    // }

    // Update everything
    if(!init) {
        timeTravel.update();
        pt('timeTravel.update()');
        map.update();
        pt('map.update()');
        // timeLine.update();
        //_updateStatusTable();
    }

}


/*
 * =============================================================================
 * Helper Funcitons
 * =============================================================================
 */

filter.exportState = function() {
    var data = JSON.stringify(filter.state);
    var url = 'data:text/json;charset=utf8,' + encodeURIComponent(data);
    window.open(url, '_blank');
    window.focus();
}

filter.importState = function() {

}

// update status table
 var _updateStatusTable = function() {
     //visibile users
     var nActiveUsers = filter.currentData.users.length;
 
     document.getElementById("nActiveUsers").innerHTML = nActiveUsers;
 
     //users in loaded chunks
     filter.nCurrentChunk = filter.chunkSize*filter.state.chunker;
 
     document.getElementById("nCurrentChunk").innerHTML = filter.nCurrentChunk;
     //all users in project
     document.getElementById("nTotalUsers").innerHTML = filter.nTotalUsers;
 }


// Function to update filter.excludedLanguage in buttons in main.js
filter.updateStateLanguage = function(language, add) {
    if(add) {
        filter.state.excludedLanguages.push(language);
    } else {
        index = filter.state.excludedLanguages.indexOf(language);
        filter.state.excludedLanguages.splice(index, 1);
    }
}

// Function to update filter.excludedCountries from input in main.js
filter.updateStateCountry = function(country, visit) {
    if(visit){
        filter.state.excludedCountries.push(country);
    } else {
	index = filter.state.excludedCountries.indexOf(country);
	filter.state.excludedCountries.splice(index,1);
    }
}

// Function to update filter.includeCountries from input in main.js
filter.updateStateCountryIncl = function(country, visit) {
    if(visit){
        filter.state.includeCountries.push(country);
    } else {
	index = filter.state.includeCountries.indexOf(country);
	filter.state.includeCountries.splice(index,1);
    }
}

// Function to update filter.max/minSpeed from imput in main.js
filter.updateStateSpeed = function(maxSpeed, minSpeed){
    filter.state.excludedMaxSpeed = maxSpeed;
    filter.state.excludedMinSpeed = minSpeed;
}


// Function to update filter.max/min numb from imput in main.js
filter.updateStateNumctry = function(maxNumctry, minNumctry){
    filter.state.excludedCountryMaxNum = maxNumctry;
    filter.state.excludedCountryMinNum = minNumctry;
}


// Should this be here? 
// documentation?
var _generateSpeedHistogram = function(hSpeedHS) {

    var margin = {top: 0, right: 0, bottom: 0, left: 0},
        width = 210 - margin.left - margin.right,
        height = 200 - margin.top - margin.bottom;

    var x = d3.scale.ordinal()
        .rangeRoundBands([0, width], 0);

    var y = d3.scale.linear()
        .range([height, 0]);

    var xAxis = d3.svg.axis()
        .scale(x)
        .orient("bottom");

    var yAxis = d3.svg.axis()
        .scale(y)
        .orient("left")
        .ticks(5);

    var svg = d3.select("#filter-speed-hist").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
      .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var interval = 10;
    var n = 999;
    var data = [];
    for (var i = 0; i <= Math.floor(n / interval); i++) {
        data.push({
            "speed": (i).toString(),
            "count": 0
        });   
    }

    for (var i = 0; i <= n; i++) {
        if (i in hSpeedHS) {
            data[Math.floor(i / interval)].count += hSpeedHS[i].length;
        }
    }

    x.domain(data.map(function(d) { return d.speed; }));
    y.domain([0, d3.max(data, function(d) { return d.count; })]);

    var area = d3.svg.area()
        .x(function(d) { return x(d.speed); })
        .y0(height)
        .y1(function(d) { return y(d.count); });

    svg.append("path")
          .datum(data)
          .attr("class", "area")
          .attr("d", area);
}

//calculates great-circle distances between the two points (lat, lon)
//modified from "http://stackoverflow.com/questions/27928/
//calculate-distance-between-two-latitude-longitude-points-haversine-formula"
var _getDisLatLon = function(lat1,lon1,lat2,lon2){
    
    function deg2rad(deg) {
        return deg * (Math.PI/180)
    }

    var R = 6371; // Radius of the earth in km
    var dLat = deg2rad(lat2-lat1);  // deg2rad below
    var dLon = deg2rad(lon2-lon1); 
    var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2); 
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    var d = R * c; // Distance in km
    return d;
}

//Caculate a speed list for the user
//In the list, each value is a speed calculated for one segment of the trip
//The speed are calculated according to location and time of concecutive tweets
//So the results are the lower bounds
//Speed are km/hour
//The tweets are asssumed to be stored in time order
// Arguments:
// ---------
// userId: u_id of users and tweets
var _speedList = function(userId){
    //console.log(userId);

    var speedList = [];
    var lat1 = -1.0, lon1 = -1.0, lat2 = -1.0, lon2 = -1.0;
    var timestamp1, timestamp2;
    var maxUserSp = -1, minUserSp = -1;
    var tweetsByCurrentUser = filter.tweetsByUser[userId];

    for (var i = 0; i < tweetsByCurrentUser.length; i++){

        /*
        var orderedTweets = tweetsByCurrentUser.sort(function(a,b){
            return new Date(a.time).getTime() - new Date(b.time).getTime();
        })
        */
        var tweet = tweetsByCurrentUser[i];
        
        //console.log(tweet);

        if(lat1 == -1.0){
            lat1 = tweet.coord[1];
            lon1 = tweet.coord[0];
            timestamp1 = tweet.time;
        } else {
            lat2 = tweet.coord[1];
            lon2 = tweet.coord[0];
            timestamp2 = tweet.time;
            var distanceKm = _getDisLatLon(lat1,lon1,lat2,lon2);

            //var timeHour = (timestamp2.getTime() - timestamp1.getTime())/1000/3600;
            var timeHour = (Date.parse(timestamp2) - Date.parse(timestamp1))/1000/3600;
            //if(timeHour == 0){
              //  continue;
            //}
            if(timeHour == 0 && distanceKm > 10){
                timeHour = 1;
            }else if(timeHour == 0){
                continue;
            }
            var speedKmPerHour = Math.round(distanceKm/timeHour);
            var speedMph = speedKmPerHour * 0.621371;

            if(maxUserSp == -1){
                maxUserSp = speedMph;
                minUserSp = speedMph;
            }else{
                if(speedMph > maxUserSp){
                    maxUserSp = speedMph;
                }else if(speedMph < minUserSp){
                    minUserSp = speedMph;
                }
            }
            

            lat1 = lat2;
            lon1 = lon2;
            timestamp1 = timestamp2;
        }
        
    }

    //if(maxUserSp == "NaN")
    speedList.push(maxUserSp);
    speedList.push(minUserSp);
    if(speedList.length > 0){
        return speedList;
    }else{
        return [0];
    }
}


// Check if js object is empty
var _isEmpty = function(obj) {
    for(var prop in obj) {
        if(obj.hasOwnProperty(prop))
            return false;
    }
    return true;
}

