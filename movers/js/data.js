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