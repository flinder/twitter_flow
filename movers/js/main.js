$(document).ready(function(){

	console.log("main.js loaded");
	data = {}

	$.getJSON("data/main_data_sample.json", function(json) {
		data.tweets = json.tweets;
		data.users = json.users;
		filter.init();
		init_btns();
        console.log('All initialized');
	});

	function init_btns(){
		$("body").on("click", "#filter-language-english", function() {
			if ($(this).is(":checked")) {
	                    // Is now checked
                            filter.updateStateLanguage('en', add=false);
                            filter.filter();
			} else {
                            // Is now unchecked
                            filter.updateStateLanguage('en', add=true);
                            filter.filter();
			}
		});
		$("body").on("click", "#filter-language-turkish", function() {
			if ($(this).is(":checked")) { 
                            // Is now checked
                            filter.updateStateLanguage('tr', add=false);
                            filter.filter();
			} else {
                            // Is now unchecked
                            filter.updateStateLanguage('tr', add=true);
                            filter.filter();
			}
		});

		$("#slider-user-num").on("change", function(){
			filter.num_users = this.value;
			timeTravel.update();
		});

		$("#filter-country-button").on("click", function() {
			var countryList = []
		})
	};


	getRandomColor = function () {
	    var letters = '0123456789ABCDEF'.split('');
	    var color = '#';
	    for (var i = 0; i < 6; i++ ) {
	        color += letters[Math.floor(Math.random() * 16)];
	    }
	    return color;
	}
	toColor = function (num) {
	    num >>>= 0;
	    var b = num & 0xFF,
	        g = (num & 0xFF00) >>> 8,
	        r = (num & 0xFF0000) >>> 16,
	        a = 1 ;
	    return "rgba(" + [r, g, b, a].join(",") + ")";
	}

	$('select').material_select();

	$('.dropdown-button').dropdown({
	    	inDuration: 300,
	    	outDuration: 225,
	    	constrain_width: false, // Does not change width of dropdown to that of the activator
	    	hover: true, // Activate on hover
	    	gutter: 0, // Spacing from edge
	    	belowOrigin: false, // Displays dropdown below the button
	    	alignment: 'left' // Displays dropdown with edge aligned to the left of button
	  	}
	);

});

