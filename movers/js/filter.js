filter = {};

filter.init = function() {
    
    // Set data
    filter.data = data;
    filter.nTotalUsers = filter.data.users.length;
    filter.nTotalTweets = filter.data.tweets.length;
    filter.nActiveUsers = filter.data.nTotalUsers;
    filter.chunkSize = 50;
    filter.nCurrentChunk = filter.chunkSize;
    filter.currentData = {};
    filter.currentData.users = filter.data.users;
    filter.currentData.tweets = filter.data.tweets;

    // Generate a hashmap user -> tweets
    filter.tweetsByUser = _makeUserTweetHashMap(); 

    // Generate hashmap language -> userIds
    filter.languageHashMap = _makeLanguageHashMap();

    // Generate a hashmap country -> user_id
    filter.countryHashMap = _makeCountryHashMap();

    // Generate a hashmap country number -> user_id
    filter.countryNumHashMap = _makeCountryNumHashMap();

    // Generate a hashmap maxspeed -> user_id

    //filter.maxSpeedHashMap = _makeMaxSpeedHashMap();


    // Generate a hashmap minspeed -> user_id
    //filter.minSpeedHashMap = _makeMinSpeedHashMap();

    // Main object holding the status of all filter controls
    filter.state = {};
    filter.state.excludedUsers = [];
    filter.state.excludedLanguages = [];
    filter.state.excludedCountries = [];
    filter.state.excludedMaxSpeed = 10000;
    filter.state.excludedMinSpeed = 0;
    filter.state.excludedCountryNum = [];

    // Initialize visualizations
    filter.u_index_min = 0;
    filter.u_index_max = 9;
    timeTravel.init();    
    map.init();
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

// Function to update filter.excludedCountries from input in main.js
filter.updateStateCountry = function(country, visit) {
    if(visit){
	filter.state.excludedCountries.push(country);
    } else {
	index = filter.state.excludedCountries.indexOf(country);
	filter.state.excludedCountries.splice(index,1);
    }

}

// Function to update filter.excludedCountries from input in main.js
filter.updateStateSpeed = function(maxSpeed, minSpeed) {
    filter.state.excludedMaxSpeed = maxSpeed;
    filter.state.excludedMinSpeed = minSpeed;

}

// Function to update filter.excludedCountryNum from input in main.js
filter.updateStateCountryNum = function(countryMinNum, countryMaxNum) {
    filter.state.excludedCountryNum[0] = countryMinNum;
    filter.state.excludedCountryNum[1] = countryMaxNum;
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

filter.filter = function() {

    // Apply all filters to original data
    // TODO: This is a hack! Find a better way to keep original users and make
    // active users a reference to the respective users:
    var activeUsers = _makeUserArray(); 
    
    // NO FILTERS ABOVE THIS POINT!
    // Filter by Chunker
    activeUsers = filter.byChunker(activeUsers);

    // Filter excluded users 
    activeUsers = filter.byId(activeUsers);

    // Filter by language
    activeUsers = filter.byLanguage(activeUsers);
    
    // Filter by country visited
    //activeUsers = filter.byCountryVisited(activeUsers);

    // Filter by number of countris visited
    activeUsers = filter.byCountryNum(activeUsers);
    
    // Filter by time

    // Synchronized data (this updates filter.currentData)
    _synchData(activeUsers);
    console.log(filter.currentData);
    // Update everything
    timeTravel.update();
    map.update();
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
    // var users = filter.data.users;
    // var hSpeedHS = {};

    // for(i = 0; i < users.length; i++) {
    //     var spList = _speedList(users[i]['u_id']);
    //     var maxSp = Math.max(...splist);
    //     //var minSp = Math.min(...splist);
        
    //     if(maxSp in hSpeedHS) {
    //         hSpeedHS[maxSp.toString()].push(users[i]['u_id']);
    //     } else {
    //         hSpeedHS[maxSp.toString()] = [users[i]['u_id']];
    //     }
    // }
    // return(hSpeedHS);
}

//Hashmap for min speed {'speed1': [user1, user2], 'speed2': [user3], ...}
var _makeMinSpeedHashMap = function (){
    // var users = filter.data.users;
    // var lSpeedHS = {};

    // for(i = 0; i < users.length; i++) {
    //     var spList = _speedList(users[i]['u_id']);
    //     var minSp = Math.min(...splist);
    //     //var minSp = Math.min(...splist);
        
    //     if(minSp in lSpeedHS) {
    //         lSpeedHS[minSp.toString()].push(users[i]['u_id']);
    //     } else {
    //         lSpeedHS[minSp.toString()] = [users[i]['u_id']];
    //     }
    // }
    // return(lSpeedHS);
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
    filter.currentData.tweets = [];
    // If no selected Users stop here and keep current data empty
    if(activeUsers.length === 0) {
        return(null)
    } else {  // otherwise push the relevant data into the arrays
        for(i = 0; i < activeUsers.length; i++) {
            var t = filter.tweetsByUser[activeUsers[i]['u_id']];
            filter.currentData.tweets = filter.currentData.tweets.concat(t);
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
    var chunkSize = 50;
    var start = chunkSize * filter.state.chunker;
    var howMany = activeUsers.length - start;
    activeUsers.splice(start, howMany); 
    filter.nCurrentChunk = activeUsers.length;
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

    for(i= 0; i<excludedUsers.length; i++) {
	   delete activeUsers[excludedUsers[i]];
    }

    return(activeUsers);
}


filter.bySpeed = function(activeUsers) {
    
    // var exclMaxSpeed = filter.state.excludedMaxSpeed;
    // var exclMinSpeed = filter.state.excludedMinSpeed;

    // // Handle empty selection
    // if(_isEmpty(activeUsers)) {
    //     return(activeUsers);
    // }
    // // Handle the case where this filter makes no deletions (e.g. noting is
    // // checked)
    // if(exclMaxSpeed >= 10000 && exclMinSpeed <= 0){
    //     return(activeUsers);
    // }
    // // Filtering operation happens here: Put all users you want to exclude into
    // // the usersToExclude array:

    // var toFilter = [];
    // for(var speed in filter.maxSpeedHashMap){
    //     if(speed > exclMaxSpeed){
    //         toFilter = excludedUsers.concat(filter.SpeedHashMap[speed.toString()]);
    //     }
    // }
    // for(var speed in filter.minSpeedHashMap){
    //     if(speed < exclMinSpeed){
    //         toFilter = excludedUsers.concat(filter.SpeedHashMap[speed.toString()]);
    //     }

    // uniqueArray = a.filter(function(toFilter, pos) {
    //     return a.indexOf(toFilter) == pos;
    // });

    // activeUsers = activeUsers.filter(byExclList(uniqueArray));
    // return(activeUsers);

    // }
    // Handle the case where this filter makes no deletions (e.g. noting is
    // checked)
    if(exclMaxSpeed >= 10000 && exclMinSpeed <= 0){
        return(activeUsers);
    }
    // Filtering operation happens here: Put all users you want to exclude into
    // the usersToExclude array:

    var toFilter = [];
    for(var speed in filter.maxSpeedHashMap){
        if(speed > exclMaxSpeed){
            toFilter = excludedUsers.concat(filter.SpeedHashMap[speed.toString()]);
        }
    }
    for(var speed in filter.minSpeedHashMap){
        if(speed < exclMinSpeed){
            toFilter = excludedUsers.concat(filter.SpeedHashMap[speed.toString()]);
        }

    uniqueArray = a.filter(function(toFilter, pos) {
        return a.indexOf(toFilter) == pos;
    });

    activeUsers = activeUsers.filter(byExclList(uniqueArray));
    return(activeUsers);

    }
}

filter.byCountryNum = function (activeUsers) {

    var exclMaxNumCountry = filter.state.excludedCountryNum[1];
    var exclMinNumCountry = filter.state.excludedCountryNum[0];

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
    for (i = 0; i < excludedUsers.length; i++) {
	   delete activeUsers[excludedUsers[i]];
    }

    return(activeUsers);
}

