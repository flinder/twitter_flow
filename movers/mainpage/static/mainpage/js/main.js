$(document).ready(function(){

//
// Commons
//

var startDate,
	endDate,
	initialPosition,
	spatialPoints = [],
	entities = {};

module = {};
module.time_lower_bound = 0;
module.time_upper_bound = 0;

function entity() {

	// Setters
	this.id = function(_) {
      if (!arguments.length) return id;
      id = _;
      return this;
    };

    this.points = function(_) {
      if (!arguments.length) return points;
      points = _;
      return this;
    };

}

//
// Helpers
//

var weekday = new Array(7);
weekday[0]=  "Sun.";
weekday[1] = "Mon.";
weekday[2] = "Tue.";
weekday[3] = "Wed.";
weekday[4] = "Thu.";
weekday[5] = "Fri.";
weekday[6] = "Sat.";

function formatDate(date) {
	return d3.time.format("%Y-%m-%d %H:%M:%S").parse(date);
}

function print_filter(filter){
	var f=eval(filter);
	if (typeof(f.length) != "undefined") {}else{}
	if (typeof(f.top) != "undefined") {f=f.top(Infinity);}else{}
	if (typeof(f.dimension) != "undefined") {f=f.dimension(function(d) { return "";}).top(Infinity);}else{}
	console.log(filter+"("+f.length+") = "+JSON.stringify(f).replace("[","[\n\t").replace(/}\,/g,"},\n\t").replace("]","\n]"));
}

function getRandomColor() {
    var letters = '0123456789ABCDEF'.split('');
    var color = '#';
    for (var i = 0; i < 6; i++ ) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

//
// Setup
//

// minDate = formatDate("2015-3-31 00:00:00");
// maxDate = formatDate("2015-4-30 23:59:59");
// startDate = formatDate("2015-3-31 21:15:00");
// endDate = formatDate("2015-4-30 21:15:00");
initialPosition = [42, 25];

//
// Slider
//

var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sept", "Oct", "Nov", "Dec"];

// $("#slider").dateRangeSlider({
// 	bounds: {min: minDate, max: maxDate},
// 	defaultValues: {min: startDate, max: endDate},
// 	wheelMode: "scroll",
// 	wheelSpeed: 10,
// 	step: {
// 	    minutes: 5
// 	},
// 	formatter: function(val) {
// 		var format = d3.time.format("%d %a. %H:%M");
// 		return format(val);
// 	},
// 	scales: [{
// 	  first: function(value) { return value; },
// 	  end: function(value) {return value; },
// 	  next: function(value) {
// 	    var next = new Date(value);
// 	    return new Date(next.setDate(value.getDate() + 1));
// 	  },
// 	  label: function(value){
// 	  	var next = new Date(value);
// 	    return next.getDate();
// 	  },
// 	  format: function(tickContainer, tickStart, tickEnd){
// 	    tickContainer.addClass("myCustomClass");
// 	  }
// 	}, {
// 	  first: function(value) { return value; },
// 	  end: function(value) {return value; },
// 	  next: function(value) {
// 	    var next = new Date(value);
// 	    return new Date(next.setHours(value.getHours() + 6));
// 	  },
// 	  label: function(value){
// 	    return null;
// 	  },
// 	  format: function(tickContainer, tickStart, tickEnd){
// 	    tickContainer.addClass("myCustomClass");
// 	  }
// 	}]
// });


	function convertTimestampToUTCDate(timestampInSeconds) {
		var targetTime = new Date(timestampInSeconds*1000);
		targetTime.setHours(targetTime.getHours() - targetTime.getTimezoneOffset()/60);
		return new Date(targetTime.getUTCFullYear(), targetTime.getUTCMonth(), targetTime.getUTCDate(),  targetTime.getUTCHours(), targetTime.getUTCMinutes(), targetTime.getUTCSeconds());
	}

	function timePretty(time) {
		return time.getUTCFullYear() + "/" + time.getUTCMonth() + "/" + time.getUTCDate() + " " + time.getUTCHours() + ":" + time.getUTCMinutes() + ":" + time.getUTCSeconds();
	}



	d3.csv(raw_data, function(collection) {

        collection.forEach(function(d) {
            d.date = convertTimestampToUTCDate(d.timestamp);
            d.count = 1;
        });

        // sizing information, including margins so there is space for labels, etc
        var margin =  { top: 20, right: 20, bottom: 130, left: 20 },
            width = $("#map").width() - margin.left - margin.right,
            height = 200 - margin.top - margin.bottom,
            marginOverview = { top: 100, right: margin.right, bottom: 70,  left: margin.left },
            heightOverview = 200 - marginOverview.top - marginOverview.bottom;

        // some colours to use for the bars
        var colour = d3.scale.ordinal()
                            .range(["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#d0743c", "#ff8c00"]);

        // mathematical scales for the x and y axes
        var x = d3.time.scale()
                        .range([0, width]);
        var y = d3.scale.linear()
                        .range([height, 0]);
        var xOverview = d3.time.scale()
                        .range([0, width]);
        var yOverview = d3.scale.linear()
                        .range([heightOverview, 0]);

        // rendering for the x and y axes
        var xAxis = d3.svg.axis()
                        .scale(x)
                        .orient("bottom");
        var yAxis = d3.svg.axis()
                        .scale(y)
                        .orient("left")
                        .tickFormat(d3.format("d"));
        var xAxisOverview = d3.svg.axis()
                        .scale(xOverview)
                        .orient("bottom");

        var svg = d3.select("#barchart")
                        .append("svg") // the overall space
                            .attr("width", width + margin.left + margin.right)
                            .attr("height", height + margin.top + margin.bottom);
        var main = svg.append("g")
                        .attr("class", "main")
                        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
        var overview = svg.append("g")
                            .attr("class", "overview")
                            .attr("transform", "translate(" + marginOverview.left + "," + marginOverview.top + ")");

        // brush tool to let us zoom and pan using the overview chart
        var brush = d3.svg.brush()
                            .x(xOverview)
                            .on("brush", brushed);

        // setup complete, let's get some data!
        // by habit, cleaning/parsing the data and return a new object to ensure/clarify data object structure
        collection.forEach(function(d) {
            d.date = d.date;
            var y0 = 0;
            d.counts = ["count"].map(function(name) {
                return { name: name,
                         y0: y0,
                         // add this count on to the previous "end" to create a range, and update the "previous end" for the next iteration
                         y1: y0 += +d[name]
                       };
            });
            d.total = d.counts[d.counts.length - 1].y1;
        });

        // data ranges for the x and y axes
		x.domain(d3.extent(collection, function(d) { return d.date; }));
        y.domain([0, d3.max(collection, function(d) { return d.total; })]);
        xOverview.domain(x.domain());
        yOverview.domain(y.domain());

        module.time_lower_bound = xOverview.domain()[0];
        module.time_upper_bound = xOverview.domain()[1];
        $("#timerange-lower-value").text(timePretty(module.time_lower_bound));
        $("#timerange-upper-value").text(timePretty(module.time_upper_bound));

        // data range for the bar colours
        // (essentially maps attribute names to colour values)
        colour.domain(d3.keys(collection[0]));

        // draw the axes now that they are fully set up
        main.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis);
        // main.append("g")
        //     .attr("class", "y axis")
        //     .call(yAxis);
        overview.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + heightOverview + ")")
            .call(xAxisOverview);

        // draw the bars
        main.append("g")
                .attr("class", "bars")
            // a group for each stack of bars, positioned in the correct x position
            .selectAll(".bar.stack")
            .data(collection)
            .enter().append("g")
                .attr("class", "bar stack")
                .attr("transform", function(d) { return "translate(" + x(d.date) + ",0)"; })
            // a bar for each value in the stack, positioned in the correct y positions
            .selectAll("rect")
            .data(function(d) { 
              return d.counts; 
            })
            .enter().append("rect")
                .attr("class", "bar")
                .attr("width", 6)
                .attr("y", function(d) { return y(d.y1); })
                .attr("height", function(d) { return y(d.y0) - y(d.y1); })
                .style("fill", function(d) { return colour(d.name); });

        overview.append("g")
                    .attr("class", "bars")
            .selectAll(".bar")
            .data(collection)
            .enter().append("rect")
                .attr("class", "bar")
                .attr("x", function(d) { return xOverview(d.date) - 3; })
                .attr("width", 6)
                .attr("y", function(d) { return yOverview(d.total); })
                .attr("height", function(d) { return heightOverview - yOverview(d.total); });

        // add the brush target area on the overview chart
        overview.append("g")
                    .attr("class", "x brush")
                    .call(brush)
                    .selectAll("rect")
                        // -6 is magic number to offset positions for styling/interaction to feel right
                        .attr("y", -6)
                        // need to manually set the height because the brush has
                        // no y scale, i.e. we should see the extent being marked
                        // over the full height of the overview chart
                        .attr("height", heightOverview + 7);  // +7 is magic number for styling

    	// zooming/panning behaviour for overview chart
        function brushed() {
          // update the main chart's x axis data range
          x.domain(brush.empty() ? xOverview.domain() : brush.extent());
          // redraw the bars on the main chart
          main.selectAll(".bar.stack")
                  .attr("transform", function(d) { return "translate(" + x(d.date) + ",0)"; })
          // redraw the x axis of the main chart
          main.select(".x.axis").call(xAxis);

          // change filter
          if (!d3.event.sourceEvent) return; // only transition after input
          if (brush.empty()) {
            module.time_lower_bound = xOverview.domain()[0];
            module.time_upper_bound = xOverview.domain()[1];
          } else {
            var extent0 = brush.extent(),
                extent1 = extent0.map(d3.time.minute.round);
                module.time_lower_bound = extent0[0];
                module.time_upper_bound = extent0[1];
            // if empty when rounded, use floor & ceil instead
            if (extent1[0] >= extent1[1]) {
              extent1[0] = d3.time.minute.floor(extent0[0]);
              extent1[1] = d3.time.minute.ceil(extent0[1]);
              module.time_lower_bound = extent1[0];
              module.time_upper_bound = extent1[1];
            }           
          }
          var format_Ymd = d3.time.format("%Y-%m-%d");
          $("#timerange-lower-value").text(timePretty(module.time_lower_bound));
          $("#timerange-upper-value").text(timePretty(module.time_upper_bound));
          updatePointsWithRange([module.time_lower_bound, module.time_upper_bound]);
        }

        brush.on("brushend", function() {

        });




		spatialPoints = [];

		// Add a LatLng object to each item in the dataset
		collection.forEach(function(d) {
			spatialPoints.push({
				coordinates: new L.LatLng(d.lat, d.lng),
				date: convertTimestampToUTCDate(d.timestamp),
				user: parseInt(d.user)
			});
		});

		// $("#slider").bind("valuesChanging", function(e, data){
		// 	updatePointsWithRange([data.values.min, data.values.max]);
		// });

		//
		// CROSSFILTER
		//

		var spatial = crossfilter(spatialPoints),
			all = spatial.groupAll(),
			dateDimension = spatial.dimension(function (d) { return d.date; }),
			usersDimension = spatial.dimension(function(d) { return d.user; }),
			usersGroup = usersDimension.group(),
			users = [];

		getDistinctUsers();

		function filterSpatialPointsWithRange(range) {
			entities = {};
			dateDimension.filterRange(range);
			dateDimension.top(Infinity).forEach(function (d) {
				// First time
				if (!entities[d.user]) {
					entities[d.user] = [];
				}
				// Add point to entity
				entities[d.user].push(d.coordinates);
			});
			$("#countUsers").html(Object.keys(entities).length);
			var timeDiff = range[1]-range[0];
			$("#countTime").html(Math.floor(timeDiff / 1000 / 60 / 60));
			$('.inner').stop().fadeTo('slow', 1);
			/*setTimeout(function() {
				$('.inner').fadeTo('slow', 0.4);
			}, 1000);*/
		}

		function getDistinctUsers() {
			usersGroup.top(Infinity).forEach(function (d) {
				users.push({user: d.key, color: getRandomColor()});
			});
		}

		// Count total number of points
		var n = all.reduceCount().value();
		console.log("There are " + n + " points in total.");
		$("#countUsers").html(n);
		//
		// MAP
		//

		var map = L.map('map').setView(initialPosition, 4),
			maplink = L.tileLayer('http://{s}.{base}.maps.cit.api.here.com/maptile/2.1/maptile/{mapID}/normal.day.grey/{z}/{x}/{y}/256/png8?app_id={app_id}&app_code={app_code}', {
						attribution: 'Map &copy; 1987-2014 <a href="http://developer.here.com">HERE</a>',
						subdomains: '1234',
						mapID: 'newest',
						app_id: 'DemoAppId01082013GAL',
						app_code: 'AJKnXv84fjrb0KIHawS0Tg',
						base: 'base',
						minZoom: 0,
						maxZoom: 18
					}).addTo(map);

		// Initialize the SVG layer */
		map._initPathRoot();

		// Pick up the SVG from the map object */
		var svg = d3.select("#map").select("svg"),
			mapTrails = svg.append("g"),
			mapPoints = svg.append("g");

		// Use Leaflet to implement a D3 geometric transformation.
		function projectPoint(x, y) {
			var point = map.latLngToLayerPoint(new L.LatLng(x, y));
			this.stream.point(point.x, point.y);
		}

		var transform = d3.geo.transform({point: projectPoint}),
			path = d3.geo.path().projection(transform);

		//
		// Points
		//


		filterSpatialPointsWithRange([module.time_lower_bound, module.time_upper_bound]);

		var pointers = mapPoints
			.selectAll("circle")
			.data(users)
			.enter()
			.append("circle")
			.attr("r", 5)
			.attr("fill", function (d) { return d.color; })
			.attr("fill-opacity", 1)
			.attr("stroke", "black")
			.attr("stroke-width", 2)
			.attr("stroke-opacity", 1)
			.attr("opacity", 1)
			;

		var trails = mapTrails
			.selectAll("path")
			.data(users)
			.enter()
			.append("path")
			.attr("fill", "none")
	        .attr("stroke", function (d) { return d.color; })
	        .attr("stroke-width", 3)
	        ;

		function render() {
			pointers.attr("transform", function (d) {
				var coordinates = entities[d.user];
				if (coordinates && coordinates.length>0) {
					var header = coordinates[0];
					return "translate("+
						map.latLngToLayerPoint(header).x +","+
						map.latLngToLayerPoint(header).y +")";
				} else {
					return "translate(-5,-5)";
				}
			});
			trails.attr("d", function (d) {
				var coordinates = entities[d.user];
				if (coordinates && coordinates.length>0) {
					return path({type: "LineString", coordinates: convertToArrayXY(coordinates)});
				} else {
					return "M0,0";
				}
			});
		}

		function updateOnResize() {
			render();
		}

		function updatePointsWithRange(range) {
			filterSpatialPointsWithRange(range);
			render();
		}

		function convertToArrayXY(coordinates) {
			var array = [];
			coordinates.forEach(function(d) {
				array.push([d.lat, d.lng]);
			});
			return array;
		}

		map.on("viewreset", updateOnResize);
		updateOnResize();

		$(".loading").hide();
		$(".description").show();

	});
});
