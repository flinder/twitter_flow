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
        full: "spanish",
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

Language.colorbrewer9 = colorbrewer["Set1"][9];
Language.getColorByAbbr = function(abbr){
	var color = "#858585"; // grey for other languagues not in the list
	// #countrys should not exceed 9
	for(var i = 0, len = Language.data.length; i < len; i++) {
	    if (Language.data[i].abbr === abbr) {
	        color = Language.colorbrewer9[i];
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
        full: "Syria",
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

Country.breaks = [10, 20, 30, 40, 50, 60]; // 7 cat
Country.colorbrewer7 = colorbrewer["YlOrRd"][7];
Country.getColorByNumOfCountry = function(numOfCountry) {
	var color = Country.colorbrewer7[6];
	for (var i = 0, len = Country.breaks.length; i < len; i++) {
	    if(numOfCountry < Country.breaks[i]) {
	    	color = Country.colorbrewer7[i];
	        break;
	    }
	}
	return color;
}

Speed = {}
Speed.breaks = [1, 5, 10, 20, 50, 100];	// 7 categories
Speed.colorbrewer7 = colorbrewer["YlOrRd"][7];
Speed.getColorBySpeed = function(speed) {
	var color = Speed.colorbrewer7[6];
	for (var i = 0, len = Speed.breaks.length; i < len; i++) {
	    if(speed < Speed.breaks[i]) {
	    	color = Speed.colorbrewer7[i];
	        break;
	    }
	}
	return color;
}
