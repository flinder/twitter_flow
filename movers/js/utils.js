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


// language helpers 
Language = {}
Language.data = [{
        full: "russian",
        abbr: "ru"
    }, {
        full: "german",
        abbr: "de"
    }, {
        full: "turkish",
        abbr: "tr"
    }, {
        full: "hebrew",
        abbr: "he"
    }, {
        full: "arabic",
        abbr: "ar"
    }, {
        full: "spainish",
        abbr: "es"
    }, {
        full: "dutch",
        abbr: "nl"
    }, {
        full: "english",
        abbr: "en"
    }
];

Language.getAbbrFromFull = function(full){
	var res = ""
	for(var i = 0, len = Language.data.length; i < len; i++) {
	    if (Language.data[i].full === full) {
	        res = Language.data[i].abbr;
	        break;
	    }
	}
	return res;
}

Language.getFullFromAbbr = function(abbr){
	var res = ""
	for(var i = 0, len = Language.data.length; i < len; i++) {
	    if (Language.data[i].abbr === abbr) {
	        res = Language.data[i].full;
	        break;
	    }
	}
	return res;
}

Language.getColorByAbbr = function(abbr){
	var color = "#d9d9d9"; // grey for other languagues not in the list
	// #countrys should not exceed 9
	for(var i = 0, len = Language.data.length; i < len; i++) {
	    if (Language.data[i].abbr === abbr) {
	        color = colorbrewer["Set1"][9][i];
	        break;
	    }
	}
	return color;
}

// Country Helpers 
Country = {}
Country.data = [{
        full: "Germany",
        abbr: "DEU"
    }, {
        full: "Italy",
        abbr: "ITA"
    }, {
        full: "Switzerland",
        abbr: "CHE"
    }, {
        full: "Austria",
        abbr: "AUT"
    }, {
        full: "Czech Republic",
        abbr: "CZE"
    }, {
        full: "Slovakia",
        abbr: "SVK"
    }, {
        full: "Hungary",
        abbr: "HUN"
    }, {
        full: "Romania",
        abbr: "ROU"
    }, {
        full: "Croatia",
        abbr: "HRV"
    }, {
        full: "Slovenia",
        abbr: "SVN"
    }, {
        full: "Bosnia and Herzegovina",
        abbr: "BIH"
    }, {
        full: "Serbia",
        abbr: "SRB"
    }, {
        full: "Macedonia",
        abbr: "MKD"
    }, {
        full: "Bulgaria",
        abbr: "BGR"
    }, {
        full: "Albania",
        abbr: "ALB"
    }, {
        full: "Greece",
        abbr: "GRC"
    }, {
        full: "Turkey",
        abbr: "TUR"
    }, {
        full: "Syrian Arab Republic",
        abbr: "SYR"
    }, {
        full: "Lebanon",
        abbr: "LBN"
    }, {
        full: "Jordan",
        abbr: "JOR"
    }, {
        full: "Iraq",
        abbr: "IRQ"
    }, {
        full: "Iran",
        abbr: "IRN"
    }, {
        full: "Egypt",
        abbr: "EGY"
    }, {
        full: "Others",
        abbr: "Others"
    }
];

Country.getAbbrFromFull = function(full) {
	var res = ""
	for(var i = 0, len = Country.data.length; i < len; i++) {
	    if (Country.data[i].full === full) {
	        res = Country.data[i].abbr;
	        break;
	    }
	}
	return res;
}

Country.getFullFromAbbr = function(abbr) {
	var res = ""
	for(var i = 0, len = Country.data.length; i < len; i++) {
	    if (Country.data[i].abbr === abbr) {
	        res = Country.data[i].full;
	        break;
	    }
	}
	return res;
}

Country.getColorByNumOfCountry = function(numOfCountry) {
	var cut = [10, 20, 30, 40, 50, 60];  // 7 categories
	var color = colorbrewer["YlOrRd"][6];
	for (var i = 0, len = cut.length; i < len; i++) {
	    if(numOfCountry < cut[i]) {
	    	color = colorbrewer["YlOrRd"][7][i];
	        break;
	    }
	}
	return color;
}
