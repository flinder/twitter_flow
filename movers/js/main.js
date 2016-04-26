$(document).ready(function(){

	data = {}
        // "Import" profiling funcions
        var st = utils.startTimer;
        var pt = utils.printTime;
        st(); 
	$.getJSON("data/main_data.json", function(json) {
                $.getJSON("data/main_data_trips.json", function(geojson) {
                    data.geoJsonTrips = geojson;  
                    data.tweets = json.tweets;
                    data.users = json.users;
                    pt('Load data');
                    initRefTable();
                    pt('initRefTable()');
                    filter.init();
                    init_btns();                    
                    pt('init_btns()');
                    console.log('All initialized');
                });	
	});

	function init_btns(){

		$( "#filter-speed-slider-range" ).slider({
			range: true,
			//min: filter.state.excludedMinSpeed,
			//max: filter.state.excludedMaxSpeed,
			min: 0,
			max: 1000,
			//values: [ 0, 10000 ],
			values: [ filter.state.excludedMinSpeed, filter.state.excludedMaxSpeed ],
			slide: function( event, ui ) {
			$( "#filter-speed-amount" ).val( ui.values[ 0 ] + " - " + ui.values[ 1 ] + " (mph)" );
			console.log("Value changed");

			filter.updateStateSpeed(ui.values[1],ui.values[0]);
			filter.filter();
			}


		});

		$( "#filter-speed-amount" ).val( $( "#filter-speed-slider-range" ).slider( "values", 0 ) +
		" - " + $( "#filter-speed-slider-range" ).slider( "values", 1 ) + " (mph)" );

		$("body").on("click", "#view-selector .item", function() {
			$("#view-selector .item").removeClass("active");
			$(this).addClass("active");
			$(".view").hide();
			$("#" + $(this).attr("data-value")).show();
        });

		$("#filter-speed-amount").on("change", function(){
			console.log("Value changed");
		})


                // More and less Data Buttons
                // -------------------------
                $("body").on("click", "#more-data-bttn", function() {

                                if(filter.nCurrentChunk >= filter.nTotalUsers) {
                       alert("ERROR: There is no more data to add.");
                       return(null);
                   }
                   filter.state.chunker++;
                   filter.filter();
                });
                $("body").on("click", "#less-data-bttn", function() {
                   if(filter.state.chunker === 1) {
                       alert("ERROR: Can't remove more data.");
                       return(null);
                   }
                   filter.state.chunker--;
                   filter.filter();
                });
                
                // Export Import Buttons
                // --------------------
                $("body").on("click", "#import-bttn", function() { 
                   alert('Not implemented');
                });
                $("body").on("click", "#export-bttn", function() { 
                   filter.exportState();
                });


                // Country Filter Interface
                // ------------------------
		$('#country-selection-list .ui.dropdown').dropdown({
			allowAdditions: true
		});
        	$("body").on("click", "#filter-country-add", function() {
			$('#country-selection-list').find(".label").each(function(){

			});
			filter.filter();
			$('#country-selection-list .ui.dropdown').dropdown('clear');	
		});

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
       
                // Language Filter Interface
                // ------------------------
		$('#language-selection-list .ui.dropdown').dropdown({
				allowAdditions: true
		});

		$("body").on("click", "#filter-language-add", function() {
			$('#language-selection-list').find(".label").each(function(){
				var language = $(this).attr("data-value");
				var tmp = '<a class="ui label language-item" data-value=' + language + '>' + language + '<i class="delete icon"></i></a>'
				$("#filter-language-panel").prepend(tmp);
				$('#language-selection-list').find(".item[data-value='" + language + "']").hide();
				filter.updateStateLanguage(language_full2abbr[language], add=true);
			});
			$('#language-selection-list .ui.dropdown').dropdown('clear');

			filter.filter();
		});

		$("body").on("click", ".language-item .delete", function() {
			var language = $(this).parent().attr("data-value");
			$(this).parent().remove();
			$('#language-selection-list').find(".item[data-value='" + language + "']").show();
			filter.updateStateLanguage(language_full2abbr[language], add=false);
			filter.filter();
		});



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

	initRefTable = function () {
		language_full2abbr = {
			"russian": 	"ru",
			"german": 	"de",
			"turkish": 	"tr",
			"hebrew": 	"he",
			"arabic": 	"ar",
			"spainish": "es",
			"dutch": 	"nl",
			"english": 	"en"
		};
	}

});

