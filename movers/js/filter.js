// "Import" profiling funcions
var st = utils.startTimer;
var pt = utils.printTime;
 
filter = {};

filter.init = function() {
    st();
    // Set data
    filter.data = data;
    filter.chunkSize = 20;

    filter.currentData = {};
    filter.currentData.users = filter.data.users;
    filter.currentData.tweets = filter.data.tweets; 
    filter.currentData.includedUsers = [];
    filter.nTotalUsers = filter.data.users.length;
    
    filter.nCurrentChunk;

    // Generate a hashmap user -> tweets
    filter.tweetsByUser = _makeUserTweetHashMap(); 
    // Generate hashmap language -> userIds
    filter.languageHashMap = _makeLanguageHashMap();
    // Generate a hashmap country -> user_id
    filter.countryHashMap = _makeCountryHashMap();
    // Generate a hashmap speed->user_id
    filter.maxSpeedHashMap = _makeMaxSpeedHashMap();
    filter.minSpeedHashMap = _makeMinSpeedHashMap();

    // Main object holding the status of all filter controls
    filter.state = {};
    filter.state.excludedUsers = [];
    filter.state.excludedLanguages = [];
    filter.state.excludedCountries = [];
    filter.state.chunker = 1;

    filter.state.excludedMaxSpeed = 1000;
    filter.state.excludedMinSpeed = 0;
 
    
    
    // First filtering because of the chunker
    filter.filter(init=true);
    // Initialize visualizations
    filter.u_index_min = 0;
    filter.u_index_max = 9
    pt('filter.inti() [Filter part]');     
 
    // Push initial data status to display 
    _updateStatusTable();
    pt('_updateStatusTable()');
   
    // Initialize visualizations
    timeTravel.init();    
    pt('timeTravel.init()');
    map.init();
    pt('map.init();');

}

/*
 * =============================================================================
 * Helper Funcitons
 * =============================================================================
 */


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

// Funciton to update filter.max/minSpeed from imput in main.js
filter.updateStateSpeed = function(maxSpeed, minSpeed){
    filter.state.excludedMaxSpeed = maxSpeed;
    filter.state.excludedMinSpeed = minSpeed;
}

var _makeUserArray = function() {
    var out = []; 
    for(i = 0; i < filter.data.users.length; i++){
        out.push(filter.data.users[i]);
    }
    return(out);
}


// Main filter function. This function always operates on the original data and
// sequentially reduces it, depending on filter.state
// It then updates filter.currentData with the newly filtered data and triggers
// updating of all visualizations

filter.filter = function(init=false) {
    
    console.log('Filtering...');
    st();
    // Apply all filters to original data
    // TODO: This is a hack! Find a better way to keep original users and make
    // active users a reference to the respective users:
    var activeUsers = _makeUserArray(); 
    pt('_makeUserArray()'); 
    // NO FILTERS ABOVE THIS POINT!
    // Filter by Chunker
    activeUsers = filter.byChunker(activeUsers);
    pt('filter.byChunker()');

    // Filter excluded users 
    activeUsers = filter.byId(activeUsers);
    pt('filter.byId()');

    // Filter by language
    activeUsers = filter.byLanguage(activeUsers);
    pt('filter.byLanguage()');
     
    // Filter by country visited
    //activeUsers = filter.byCountryVisited(activeUsers);

    // Filter by number of countris visited

    // Filter by time
   
    // Filter by speed
    activeUsers = filter.bySpeed(activeUsers);
    pt('filter.bySpeed()')

    // Synchronized data (this updates filter.currentData)
    _synchData(activeUsers);
    pt('_synchData()');
    
    // Update data status display
    _updateStatusTable();

    // Update everything
    if(!init) {
        timeTravel.update();
        pt('timeTravel.update()');
        map.update();
        pt('map.update()');
        // timeLine.update();
        _updateStatusTable();
    }

}

// Generate hashmap for language -> users for quick filtering
var _makeLanguageHashMap = function() {
    var users = filter.data.users;
    var lanHM = {};

    for(i = 0; i < users.length; i++) {
        var lan = users[i]['prof_lang'];
        if(lan in lanHM) {
            lanHM[lan].push(users[i]['u_id'])
        } else {
            lanHM[lan] = [users[i]['u_id']]
        }
    }
    return(lanHM);
}

// Make the user json
var _makeUserHash = function() {
    var nUsers = filter.data.users.length;
    out = {};
    for(i = 0; i < nUsers; i ++) {
        var currentId = filter.data.users[i]['u_id'];
        out[currentId] = filter.data.users[i];
    }
    return(out);
}


// Hashmap for countries {'country1': [user1, user2], 'country2':[user1], ...}
var _makeCountryHashMap = function () {
    var countryHash = {};
    
    for(i = 0; i < filter.data.tweets.length; i++) {
	var currentCntry = filter.data.tweets[i]['cntry'];
	if (currentCntry in countryHash){
	    countryHash[currentCntry].add(filter.data.tweets[i]['u_id']);
	} else {
	    countryHash[currentCntry] = new Set();
	    countryHash[currentCntry].add(filter.data.tweets[i]['u_id']);
	}				  
    }   
    return(countryHash);
}

//Hashmap for max speed {'speed1': [user1, user2], 'speed2': [user3], ...}
var _makeMaxSpeedHashMap = function (){
    var users = filter.data.users;
    var hSpeedHS = {};

    for(i = 0; i < users.length; i++) {
        var spList = _speedList(users[i]['u_id']);
        //console.log(spList.length)
        var maxSp = Math.round(Math.max(...spList));
        //var minSp = Math.min(...splist);
        
        if(maxSp in hSpeedHS) {
            hSpeedHS[maxSp.toString()].push(users[i]['u_id']);
        } else {
            hSpeedHS[maxSp.toString()] = [users[i]['u_id']];
        }
    }
    return(hSpeedHS);
}

//Hashmap for min speed {'speed1': [user1, user2], 'speed2': [user3], ...}
var _makeMinSpeedHashMap = function (){
    var users = filter.data.users;
    var lSpeedHS = {};

    for(i = 0; i < users.length; i++) {
        var spList = _speedList(users[i]['u_id']);
        var minSp = Math.round(Math.min(...spList));
        //var minSp = Math.min(...splist);
        
        if(minSp in lSpeedHS) {
            lSpeedHS[minSp.toString()].push(users[i]['u_id']);
        } else {
            lSpeedHS[minSp.toString()] = [users[i]['u_id']];
        }
    }
    return(lSpeedHS);
}



// Hashmap for country number {'num1: [user1, user2], 'num2':[user3],..}
var _makeCountryNumHashMap = function () {

    var countryNumHash = {};

    for (i = 0; i < filter.data.users.length; i++) {
	var currentNum = filter.data.users[i]['cntryCount'];
	if (currentNum in countryNumHash) {
	    countryNumHash[currentNum].push(filter.data.users[i]['u_id']);
	} else {
	    countryNumHash[currentNum] = [];
	    countryNumHash[currentNum].push(filter.data.users[i]['u_id']);
	}
    }
    return(countryNumHash);
}

// Synchronize the user and tweet array given the activeUsers object
var _synchData = function(activeUsers) {

    filter.currentData.users = activeUsers;
    var n = 0, t, i, j, k = 0, u_id;
    for(i = 0; i < activeUsers.length; i++) { 
        t = filter.tweetsByUser[activeUsers[i]['u_id']];
        n += t.length;
    }

    filter.currentData.tweets = new Array(n);
    filter.currentData.includedUsers = new Array(filter.currentData.users.length);

    // If no selected Users stop here and keep current data empty
    if(activeUsers.length === 0) {
        return(null)
    } else {  // otherwise push the relevant data into the arrays
        for(i = 0; i < activeUsers.length; i++) { 
            u_id = activeUsers[i]['u_id'];
            t = filter.tweetsByUser[u_id];
            filter.currentData.includedUsers[i] = u_id;
            for(j = 0; j < t.length; j++) { 
                filter.currentData.tweets[k + j] = t[j];

            }
            k += j
        }
    }
}

// Generate a hashmap to find tweets quickly by user id. {'user_id': [tweet,
// tweet, ...], ...}
var _makeUserTweetHashMap = function() {
    var tweetsByUser = {};

    var nTweets = filter.data.tweets.length;
    var tweets = filter.data.tweets

    for(i = 0; i < nTweets; i++) {
        var tweet = tweets[i]
        var id_ = tweets[i]['u_id'];

        if(id_ in tweetsByUser){
            tweetsByUser[id_].push(tweet);
        } else {
            tweetsByUser[id_] = [];
            tweetsByUser[id_].push(tweet);
        }
    } 
    return(tweetsByUser);
}

// Take the excludedUsers generate a new currentData object and update all
// visualizations
filter.update = function() { 
    //map.update();
    //timeTravel.update();
    //timeLine.update();
    timeTravel.init();
}

// Check if current user should be included or excluded depending on language
// checkbox profile
var _checkLanguage = function(userObj) {
    // Retruns true if user should be included and false if not. 
    // Need to get the language abbreviations to implement this
}

// A different version of _checkLanguage function.
// Please consider which one to keep
// Check if current user speaks the language
// Return true for yes and false for no
var _checkLanguage2 = function(userObj, lang){
	var profileLang = userObj.prof_lang;
	if(profileLang == lang){
	    return true;
	} else {
	    return false;
	}
}

//Get all the languages in data, so the checkbox can be generated accordingly
//the languages are the ones in users.prof_lang
filter.initLanguages = function(){
    //get all the languages
    langList = {};

    for(i = 0;i < data.users.length; i++){
        
        var userLang = data.users[i].prof_lang;

        if (!langList[userLang]) {
            langList[userLang] = true;
        }

    }

    //filter.langList = 

    return langList;

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

        var tweet = tweetsByCurrentUser[i];
        
        //console.log(tweet);
		if (lat1 == -1.0){
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
            var speedKmPerHour = Math.round(distanceKm/timeHour);
            var speedMph = speedKmPerHour * 0.621371;
			//speedList.push(speedKmPerHour);

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


/*
 * =============================================================================
 * Filter functions
 * =============================================================================
 */

// This function contains the condition to include or exclude a user written for
// use in array.Prototype.filter(callback). An array toFilter must exist in the
// function namespace
var byExclList = function(toFilter) {    
    return function(element) {
        if(toFilter.indexOf(element['u_id']) > -1){
            return(false);
        } else {
            return(true);
        }
    }
}

// Template for all filters
//
// Arguments:
// ---------
// userHash: json
filter.template = function(activeUsers) {
    
    // Handle empty selection
    if(_isEmpty(activeUsers)) {
        return(activeUsers);
    }
    
    // Handle the case where this filter makes no deletions (e.g. noting is
    // checked)
      
    // Filtering operation happens here: Put all users you want to exclude into
    // the usersToExclude array:

    var toFilter = [];

    activeUsers = activeUsers.filter(byExclList(toFilter));

    return(activeUsers);
}

filter.byChunker = function(activeUsers) {
    
    // Handle empty selection
    if(_isEmpty(activeUsers)) {
        return(activeUsers);
    }
    
    // Handle the case where this filter makes no deletions (e.g. noting is
    // checked)
    
      
    // Filtering operation happens here: Put all users you want to exclude into
    // the usersToExclude array:
    
    var chunkSize = filter.chunkSize;
    var start = chunkSize * filter.state.chunker;
    var howMany = activeUsers.length - start;
    activeUsers.splice(start, howMany); 

    var toFilter = [];

    activeUsers = activeUsers.filter(byExclList(toFilter));

    return(activeUsers);
}




// Function to filter out one or more users
// Arguments:
// userIds: arr or str, user ids to be filtered
filter.byId = function(activeUsers) {
   

    // Handle empty selection
    if(activeUsers.length === 0) {
        return(activeUsers)
    }
    
    // Handle the case where this filter makes no deletions (e.g. noting is
    // checked)
    if(filter.state.excludedUsers.length == 0) {
        return(activeUsers)
    }

    // Filtering operation happens here. 
    var toFilter = filter.state.excludedUsers;

    activeUsers = activeUsers.filter(byExclList(toFilter));

    return(activeUsers);
}


// Filter by language
//
filter.byLanguage = function(activeUsers) {
    
    var exclLang = filter.state.excludedLanguages;
    // Handle empty selection
    if(_isEmpty(activeUsers)) {
        return(activeUsers);
    }
    
    // Handle the case where this filter makes no deletions (e.g. noting is
    // checked)
    if(exclLang.length == 0) {
        return(activeUsers);
    }
      
    // Filtering operation happens here. Remove all users from activeUsers
    // according to filter criterion in respective filter.state
    var toFilter = [];
    for(var language in filter.languageHashMap) {
        if(exclLang.indexOf(language) > -1) {
            toFilter = toFilter.concat(filter.languageHashMap[language]);
        } else { 
            continue;
        }
    }
    activeUsers = activeUsers.filter(byExclList(toFilter));
    return(activeUsers);
}

filter.byCountryVisited = function (activeUsers) {

    var exclCountry = filter.state.excludedCountries;

    // Handle empty selection
    if(_isEmpty(activeUsers)){
	return(activeUsers);
    }

    // Handle the case where this filter makes no deletions
    if(exclCountry.length == 0) {
        return(activeUsers);
    } 
    
    // Filtering happens
    // Exclude users from activeUsers by input from filter box checking
    
    var excludedUsers = [];
    for(var country in filter.countryHashMap) {
	if(exclCountry.indexOf(country) > -1) {
	    excludedUsers = excludedUsers.concat(filter.countryHashMap[country]);
	} else {
	    continue;
	}
    }

    for(i= 0; i<excludedUser.length; i++) {
	delete activeUsers[excludedUsers[i]];
    }

    return(activeUsers);
}


filter.bySpeed = function(activeUsers) {
    
    var exclMaxSpeed = filter.state.excludedMaxSpeed;
    var exclMinSpeed = filter.state.excludedMinSpeed;

    // Handle empty selection
    if(_isEmpty(activeUsers)) {
        return(activeUsers);
    }
    
    // Handle the case where this filter makes no deletions (e.g. noting is
    // checked)
    if(exclMaxSpeed >= 1000 && exclMinSpeed <= 0){
        return(activeUsers);
    }
    // Filtering operation happens here: Put all users you want to exclude into
    // the usersToExclude array:

    var toFilter = [];
    for(var speed in filter.maxSpeedHashMap){
        //console.log(speed);
        if(Number(speed) > exclMaxSpeed){
            toFilter = toFilter.concat(filter.maxSpeedHashMap[speed]);
        }
    }
    for(var speed in filter.minSpeedHashMap){
        if(Number(speed) < exclMinSpeed){
            toFilter = toFilter.concat(filter.minSpeedHashMap[speed]);
        }

    //uniqueArray = a.filter(function(toFilter, pos) {
        //return a.indexOf(toFilter) == pos;
    //});

    activeUsers = activeUsers.filter(byExclList(toFilter));
    return(activeUsers);

    }
}

filter.byCountryNum = function (activeUsers) {

    var exclMaxNumCountry = filter.state.excludedCountryMaxNum;
    var exclMinNumCountry = filter.state.excludedCountryMinNum;

    if(_isEmpty(activeUsers)){
	return(activeUsers);
    }

    // Exclude users from active Users by input from country number slider

    var excludedUsers = [];
    for ( var num in filter.countryNumHashMap) {
	if(num > exclMaxNumCountry || num < exclMinNumCountry) {
	    excludedUsers = exludedUsers.concat(filter.countryNumHashMap[num]);
	} else {
	    continue;
	}
    }
    for (i = 0; i < excludedUser.length; i++) {
	delete activeUsers[excludedUsers[i]];
    }

    return(activeUsers);
}
