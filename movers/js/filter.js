filter = {};

filter.init = function() {
    
    // Set data
    filter.data = data;
    filter.data.userHash = _makeUserHash();
    filter.currentData = filter.data;

    // Generate a hashmap user -> tweets
    filter.tweetsByUser = _makeUserTweetHashMap(); 

    // Generate hashmap language -> userIds
    filter.languageHashMap = _makeLanguageHashMap();

    // Main object holding the status of all filter controls
    filter.state = {};
    filter.state.excludedUsers = [];
    filter.state.excludedLanguages = [];

    // Initialize visualizations
    filter.num_users = 10;
    timeTravel.init();    
    console.log('filter.js initialized');
}

/*
 * =============================================================================
 * Helper Funcitons
 * =============================================================================
 */


// Function to update filter.excludedLanguage in buttons in main.js
filter.updateStateLanguage = function(language, add) {
    if(add) {
        filter.state.excludedLanguages.push(language);
    } else {
        index = filter.state.excludedLanguages.indexOf(language);
        filter.state.excludedLanguages.splice(index, 1);
    }
}

// Main filter function. This function always operates on the original data and
// sequentially reduces it, depending on filter.state
// It then updates filter.currentData with the newly filtered data and triggers
// updating of all visualizations

filter.filter = function() {

    // Apply all filters to original data
    var activeUsers = filter.data.userHash;
    console.log(activeUsers);
    
    // Filter excluded users 
    activeUsers = filter.byId(activeUsers);

    // Filter by language
    activeUsers = filter.byLanguage(activeUsers);
    
    // Filter by country visited
    // activeUsers = filter.byCountryVisited(activeUsers);

    // Filter by 

    // Synchronized data (this updates filter.currentData)
    _synchData(activeUsers);
    console.log(filter.currentData);

    // Update everything
    timeTravel.update();
    // map.update();
    // timeLine.update();

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

// Synchronize the user and tweet array given the activeUsers object
var _synchData = function(activeUsers) {

    filter.currentData.users = [];
    filter.currentData.tweets = [];
    filter.currentData.userHash = activeUsers;
    // If no selected Users stop here and keep current data empty
    if(_isEmpty(activeUsers)) {
        return(null)
    } else {  // otherwise push the relevant data into the arrays
        for(var key in activeUsers) {
            filter.currentData.users.push(activeUsers[key]);
            filter.currentData.tweets.concat(filter.tweetsByUser[key]);
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
	var speedList = [];
	var lat1 = -1.0, lon1 = -1.0, lat2 = -1.0, lon2 = -1.0;
	var timestamp1, timestamp2;
	for (tweet in filter.tweetsByUser[userId]){
		if (lat1 == -1.0){
			lat1 = tweet.coord[1];
			lon1 = tweet.coord[0];
			timestamp1 = tweet.time;
		} else {
			lat2 = tweet.coord[1];
			lon2 = tweet.coord[0];
			timestamp2 = tweet.time;
			var distanceKm = _getDisLatLon(lat1,lon1,lat2,lon2);
			var timeHour = (timestamp2.getTime() - timestamp1.getTime())/1000/3600;
			var speedKmPerHour = distanceKm/timeHour;
			speedlist.push(speed);

			lat1 = lat2;
			lon1 = lon2;
			timestamp1 = timestamp2;
		}
	}
	return speedList;
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
      
    // Filtering operation happens here. Remove all users from activeUsers
    // according to filter criterion in respective filter.state

    return(activeUsers);
}

// Function to filter out one or more users
// Arguments:
// userIds: arr or str, user ids to be filtered
filter.byId = function(activeUsers) {
   

    // Handle empty selection
    if(_isEmpty(activeUsers)) {
        return(activeUsers)
    }
    
    // Handle the case where this filter makes no deletions (e.g. noting is
    // checked)
    if(filter.state.excludedUsers.length == 0) {
        return(activeUsers)
    }


    // Filtering operation happens here. Remove all users from userHash,
    // according to filter criterion in respective filter.state  
    var userIds = filter.state.excludedUsers;
    for(i = 0; i < userIds.length; i++) {
        delete activeUsers[userIds[i]];
    }

    return(userHash);
}


// Filter by language
//
filter.byLanguage = function(activeUsers) {
    
    // Handle empty selection
    if(_isEmpty(activeUsers)) {
        return(activeUsers);
    }
    
    // Handle the case where this filter makes no deletions (e.g. noting is
    // checked)
    if(filter.state.excludedLanguages.length == 0) {
        return(activeUsers);
    }
      
    // Filtering operation happens here. Remove all users from activeUsers
    // according to filter criterion in respective filter.state
    var usersToExclude = [];
    for(var language in filter.languageHashMap) {
        usersToExclude.concat(filter.languageHashMap[language]);
    }
    for(i = 0; i < usersToExclude.length; i++) {
        delete activeUsers[usersToExclude[i]];
    }

    return(activeUsers);
}
