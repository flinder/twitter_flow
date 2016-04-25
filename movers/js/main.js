$(document).ready(function(){

	console.log("main.js loaded");
	data = {}

	$.getJSON("data/main_data_sample.json", function(json) {
                $.getJSON("data/trips.json", function(geojson) {
                    data.geoJsonTrips;  
                });
		data.tweets = json.tweets;
		data.users = json.users;
		filter.init();
		init_btns();
        console.log('All initialized');
	});

	function init_btns(){

		$( "#filter-speed-slider-range" ).slider({
		range: true,
		min: 0,
		max: 500,
		values: [ 75, 300 ],
		slide: function( event, ui ) {
		$( "#filter-speed-amount" ).val( ui.values[ 0 ] + " - " + ui.values[ 1 ] );
		}
		});
		$( "#filter-speed-amount" ).val( $( "#filter-speed-slider-range" ).slider( "values", 0 ) +
		" - " + $( "#filter-speed-slider-range" ).slider( "values", 1 ) );

        $("body").on("click", "#more-data-bttn", function() {
           filter.state.chunker++;
           filter.filter();
        });
        $("body").on("click", "#less-data-bttn", function() {
           if(filter.state.chunker === 1) {
               alert("Can't remove more data.");
               return(null);
           }
           filter.state.chunker--;
           filter.filter();
        });

		$('#country-selection-list .ui.dropdown')
			.dropdown({
				allowAdditions: true
			})
		;

		$('#language-selection-list .ui.dropdown')
			.dropdown({
				allowAdditions: true
			})
		;
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

		// var slider = document.getElementById('test5');
		// 	noUiSlider.create(slider, {
		// 	start: [filter.u_index_min, filter.u_index_max],
		// 	connect: true,
		// 	step: 1,
		// 	range: {
		// 	 	'min': 0,
		// 	 	'max': 100
		// 	},
		// 	format: wNumb({
		// 	 	decimals: 0
		// 	})
		// });
		// slider.noUiSlider.on('change', function( values, handle ) {
		// 	var value = values[handle];
		// 	if ( handle ) {
		// 		filter.u_index_max = Number(value);
		// 	} else {
		// 		filter.u_index_min = Number(value);
		// 	}
		// 	timeTravel.update();
		// });

		var countryDropNumber = 1;

		$("#filter-country-button").on("click", function() {

			
			var currentRowID = "#filter-country-row" + countryDropNumber;
			countryDropNumber += 1;
			var nextRowID = "filter-country-row" + countryDropNumber;

			var countryList = ["Other World", "Other Europe", "Germany", "Italy", 
			"Switzerland", "Austria", "Czech Rep", "SlovakiaHungary", "Romania", 
			"Croatia", "Slovenia", "Bosnia & Herzegovina", "Serbia & Montenegro", 
			"Macedonia", "Bulgaria", "Albania", "Greece", "Turkey", "Syria", 
			"Lebanon", "Jordan", "Iraq", "Iran", "Egypt", "Other Asia", "Other Africa"];
			
			$("#filter-country").append(
			//$(this).append(

            	'<div class = "row" id="'+nextRowID+'">' +
                    '<div class = "col s2">' +
                        '<select>' +
                            '<option value="" disabled selected>Select a country</option>' +
                            '<option value="Greek">Greek</option>' +
                            '<option value="Turkey">Turkey</option>' +
                        '</select>' +
                    '</div>' +
                    '<div class = "col s1">' +
                    '<form action = "#">' +
                        '<input name="group'+countryDropNumber+'" type="radio" id="ctryKeep'+countryDropNumber+'" />' +
                        '<label for="ctryKeep'+countryDropNumber+'">Keep</label>' +
                        '<input name="group'+countryDropNumber+'" type="radio" id="ctryRmv'+countryDropNumber+'" />' +
                        '<label for="ctryRmv'+countryDropNumber+'">Remove</label>' +
                    '</div>' +
                    '</form>' +
                    '<div class = "col s1">' +
                        '<button class = "ctryCancelButton" id="ctryCancelBtn'+countryDropNumber+'">Cancel</button>' +
                    '</div>' +
                '</div>'

				);

			$('select').material_select();
			//$("p").append("text")
			//$(this).hide();
			//console.log("pp");
			/*
			var countryAdd = '';
			for (var i = 0; i < countryList.length; i++) {
				countryAdd += countryList[i];
			
			};
			*/
			var buttonID = "#ctryCancelBtn" +countryDropNumber

			$(buttonID).on("click",function(){
				//onsole.log($(this).attr('id'));
				//ar theStr = $(this).attr('id')
				var delNum = ($(this).attr('id')).replace(/^\D+/g, "");
				var delRowID = "filter-country-row" + delNum;
				console.log(delRowID);
				var elem = document.getElementById(delRowID);
	    		elem.parentNode.removeChild(elem);
	    		//return false;
	    		//console.log('cancel button clicked');
			});
		});
		
		$("#ctryCancelBtn1").on("click",function(){
			//console.log($(this).attr('id'));
			//ar theStr = $(this).attr('id')
			var delNum = ($(this).attr('id')).replace(/^\D+/g, "");
			var delRowID = "filter-country-row" + delNum;
			console.log(delRowID);
			var elem = document.getElementById(delRowID);
    		elem.parentNode.removeChild(elem);
    		//return false;
    		//console.log('cancel button clicked');
		});

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

