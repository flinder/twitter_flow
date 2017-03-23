$(document).ready(function(){
	timeTravel = {}

	timeTravel.u_ids = [];
	timeTravel.cntrys = [];
	timeTravel.cntry_val_map = {};
	timeTravel.trips = [];
	timeTravel.timerange = [];
	timeTravel.opacity = 0.5;
	timeTravel.colorAttribute = "user";

	// default order
	mCntrys = ["Others", "EGY", "IRN", "IRQ", "JOR", "LBN", "SYR", "TUR", "GRC", "ALB", "BGR", "MKD", "SRB", "BIH", "SVN", "HRV", "ROU", "HUN", "SVK", "CZE", "AUT", "CHE", "ITA", "DEU"];

	var x;
	var y;
	var xAxis;
	var yAxis;
	var line;
	var parseDate;
	var svg;

	// Set the dimensions of the canvas / graph
	var margin = {top: 30, right: 20, bottom: 30, left: 50},
	    width = $("#timeTravel-container").width() - margin.left - margin.right,
	    height = $("#timeTravel-container").height() - margin.top - margin.bottom;

	timeTravel.init = function() {

		timeTravel.u_ids = [];
		timeTravel.trips = [];
		// timeTravel.cntrys = [];
		// timeTravel.cntry_val_map = {};
		timeTravel.timerange = [];
		$("#timeTravel-content").html("");
		$("#timeTravel-legend").html("");
		timeTravel.createLengend();

		timeTravel.data = crossfilter(filter.currentData.tweets);
		var timedataByTime = timeTravel.data.dimension(function(d) { return d.time; });
		timeTravel.timerange = [timedataByTime.bottom(Infinity)[0].time, timedataByTime.top(Infinity)[0].time];
		var timedataByUserid = timeTravel.data.dimension(function(d) { return d.u_id; });
		var timedataByCountry = timeTravel.data.dimension(function(d) { return d.cntry; });
		var timedataGroupsByUserid = timedataByUserid.group(function(u_id) { return u_id; });
		var arr = timedataGroupsByUserid.all();
		for (var i = 0; i < arr.length; i++) {
		    timeTravel.u_ids.push(arr[i].key);
		}
		// var timedataGroupsByCountry = timedataByCountry.group(function(cntry) { return cntry; });
		// var arr = timedataGroupsByCountry.all();
		// for (var i = 0; i < arr.length; i++) {
		//     timeTravel.cntrys.push(arr[i].key);
		//     timeTravel.cntry_val_map[arr[i].key] = i;
		// }

		// timeTravel.u_ids = timeTravel.u_ids.slice(filter.u_index_min, filter.u_index_max + 1);

		timeTravel.u_ids.forEach(function(u_id) {
			timedataByUserid.filter(u_id);
			var arr = timedataByTime.bottom(Infinity);
			for (var i = 0; i < arr.length; i++) {
				var item = {}
				item.symbol = u_id;
				item.date = arr[i].time;
				if (mCntrys.includes(arr[i].cntry)) {
					item.cntry = arr[i].cntry;
				} else {
					item.cntry = "Others"
				}
				// item.cntry_val = timeTravel.cntry_val_map[item.cntry];
				item.cntry_val = mCntrys.indexOf(item.cntry);
			    timeTravel.trips.push(item);
			}
			timedataByUserid.filterAll();
		});

		// Parse the date / time
		parseDate = d3.time.format("%Y-%m-%d %H:%M:%S").parse;

		// Set the ranges
		x = d3.time.scale().range([0, width]);
		y = d3.scale.linear().range([height, 0]);

		// Define the axes
		xAxis = d3.svg.axis().scale(x)
		    .orient("bottom").ticks(d3.time.months, 1);

		yAxis = d3.svg.axis().scale(y)
		    .orient("left").ticks(24);

		// Define the line
		line = d3.svg.line()
		    .x(function(d) { return x(d.date); })
		    .y(function(d) { return y(d.cntry_val); });

		// Adds the svg canvas
		svg = d3.select("#timeTravel-content")
		    .append("svg")
		        .attr("width", width + margin.left + margin.right)
		        .attr("height", height + margin.top + margin.bottom)
		    .append("g")
		        .attr("transform",
		              "translate(" + margin.left + "," + margin.top + ")");

	    mData = timeTravel.trips;

	    // q?
	    mData.forEach(function(d) {
			d.date = parseDate(d.date);
			d.cntry_val = +d.cntry_val;
	    });

	    // Scale the range of the data
	    x.domain(d3.extent(mData, function(d) { return d.date; }));
	    y.domain([0, d3.max(mData, function(d) { return d.cntry_val; })]);

	    // Nest the entries by symbol
	    var dataNest = d3.nest()
	        .key(function(d) {return d.symbol;})
	        .entries(mData);

	    // Loop through each symbol / key
	    dataNest.forEach(function(d) {

	    	var color = toColor(d.key);
	    	var userObj = getUserById(d.key);

			switch(timeTravel.colorAttribute) {
			    case "numOfCountry":
			        color = Country.getColorByNumOfCountry(userObj.cntryCount);
			        break;
			    case "speed":
			        color = Speed.getColorBySpeed(userObj.voc);
			        break;
			    case "language":
			    	color = Language.getColorByAbbr(userObj.prof_lang);
			    	break;
			    default:
			}

	        svg.append("path")
	            .attr("class", "line")
	            .attr("u_id", d.key)
	            .attr("d", line(d.values))
	            .attr("stroke", color)
	            .attr("opacity", timeTravel.opacity)
			.on("mouseover", function(d) {
			        d3.select(this).moveToFront();
			        d3.select(this).classed("top", true);
			}).on("mouseout", function(d) {
			        d3.select(this).classed("top", false);
			}).on("contextmenu", function(data, index) {
			     var id_ = this.getAttribute("u_id");
			     filter.state.excludedUsers.push(id_);
			     d3.event.preventDefault();
			     //$(this).remove();
			    filter.filter();
			}).on("click", function(d) {
			    var id_ = this.getAttribute("u_id");
			    tweetDisplay.show(id_);
			});

			// svg.selectAll("dot")
			// 	.data(d.values)
			// 	.enter().append("circle")
			// 	.attr("class", "dot")
			// 	.attr("r", 3.5)
			// 	.attr("cx", function(d) { return x(d.date); })
			// 	.attr("cy", function(d) { return y(d.cntry_val); })
			// 	.attr("fill", c)
			// 	.attr("opacity", 0.5);

	    });

	    // Add the X Axis
	    svg.append("g")
	        .attr("class", "x axis")
	        .attr("transform", "translate(0," + height + ")")
					.style("fill", "white")
	        .call(xAxis);

	    // Add the Y Axis
	    svg.append("g")
	        .attr("class", "y axis country-names")
					.style("fill", "white")
	        .call(yAxis);

		var tooltip = d3.select("#timeTravel-content").append("div")	
		    .attr("class", "tooltip")				
		    .style("opacity", 0);

	    d3.select(".y.axis.country-names").selectAll(".tick")
	    		.attr("data-content", function(d) { return mCntrys[d]; })
	    		.on("mouseover", function(d) {
		            tooltip.transition()		
		                .duration(200)		
		                .style("opacity", .9);		
		            tooltip.html(Country.getFullFromAbbr(mCntrys[d]) + "</br>" + "left click to move UP" + "</br>" + "right click to move DOWN")	
		                .style("left", (d3.event.pageX - $("#timeTravel-content").offset().left) + "px")		
		                .style("top", (d3.event.pageY - 28 - $("#timeTravel-content").offset().top) + "px");	
		        })					
		        .on("mouseout", function(d) {		
		            tooltip.transition()		
		                .duration(500)		
		                .style("opacity", 0);	
		        })
	    	.selectAll("text")
	    		.text(function(d) { return Country.getFullFromAbbr(mCntrys[d]); })
				.filter(function(d) { return mCntrys[d] === "DEU" || mCntrys[d] === "SYR"})
				.style("font-weight", "bold")
				.style("fill", "white");

		$(".country-names .tick").off('click').on("click", function(ev){
			ev.preventDefault();
			var chosen_country_name_abbr = $(this).attr("data-content");
			var index = mCntrys.indexOf(chosen_country_name_abbr);
			if (index < mCntrys.length - 1) {
				var tmp = mCntrys[index];
				mCntrys[index] = mCntrys[index + 1];
				mCntrys[index + 1] = tmp;
			}
			timeTravel.init();
		}).off('contextmenu').on("contextmenu", function(ev){
			ev.preventDefault();
			var chosen_country_name_abbr = $(this).attr("data-content");
			var index = mCntrys.indexOf(chosen_country_name_abbr);
			if (index > 0) {
				var tmp = mCntrys[index];
				mCntrys[index] = mCntrys[index - 1];
				mCntrys[index - 1] = tmp;
			}
			timeTravel.init();
		});

		d3.selection.prototype.moveToFront = function() {
			return this.each(function(){
				this.parentNode.appendChild(this);
			});
		};

		var country1 = mCntrys.indexOf("DEU");
		var country2 = mCntrys.indexOf("SYR");
		svg.append('line')
			.attr({ x1: 0, y1: y(country1), x2: width, y2: y(country1)})
			.style("stroke-dasharray", ("3, 3"))
			.style("stroke", "grey");
		svg.append('line')
			.attr({ x1: 0, y1: y(country2), x2: width, y2: y(country2)})
			.style("stroke-dasharray", ("3, 3"))
			.style("stroke", "grey");
	}

	timeTravel.update = function() {

		$("#timeTravel-legend").html("");
		timeTravel.createLengend();

		timeTravel.u_ids = [];
		timeTravel.trips = [];
		// timeTravel.cntrys = [];
		// timeTravel.cntry_val_map = {};

		timeTravel.data = crossfilter(filter.currentData.tweets);
		var timedataByTime = timeTravel.data.dimension(function(d) { return d.time; });
		var timedataByUserid = timeTravel.data.dimension(function(d) { return d.u_id; });
		var timedataByCountry = timeTravel.data.dimension(function(d) { return d.cntry; });
		var timedataGroupsByUserid = timedataByUserid.group(function(u_id) { return u_id; });
		var arr = timedataGroupsByUserid.all();
		for (var i = 0; i < arr.length; i++) {
		    timeTravel.u_ids.push(arr[i].key);
		}
		// var timedataGroupsByCountry = timedataByCountry.group(function(cntry) { return cntry; });
		// var arr = timedataGroupsByCountry.all();
		// for (var i = 0; i < arr.length; i++) {
		//     timeTravel.cntrys.push(arr[i].key);
		//     timeTravel.cntry_val_map[arr[i].key] = i;
		// }

		// timeTravel.u_ids = timeTravel.u_ids.slice(filter.u_index_min, filter.u_index_max + 1);

		timeTravel.u_ids.forEach(function(u_id) {
			timedataByUserid.filter(u_id);
			var arr = timedataByTime.bottom(Infinity);
			for (var i = 0; i < arr.length; i++) {
				var item = {}
				item.symbol = u_id;
				item.date = arr[i].time;
				if (mCntrys.includes(arr[i].cntry)) {
					item.cntry = arr[i].cntry;
				} else {
					item.cntry = "Others"
				}
				// item.cntry_val = timeTravel.cntry_val_map[item.cntry];
				item.cntry_val = mCntrys.indexOf(item.cntry);
			    timeTravel.trips.push(item);
			}
			timedataByUserid.filterAll();
		});

		mData = timeTravel.trips;

	    // q?
	    mData.forEach(function(d) {
			d.date = parseDate(d.date);
			d.cntry_val = +d.cntry_val;
	    });

	    // Scale the range of the data
	    x.domain(d3.extent(mData, function(d) { return d.date; }));
	    y.domain([0, d3.max(mData, function(d) { return d.cntry_val; })]);

	    // Nest the entries by symbol
	    var dataNest = d3.nest()
	        .key(function(d) {return d.symbol;})
	        .entries(mData);

	    d3.selectAll(".line").remove();
	    d3.selectAll(".dot").remove();
	    // Loop through each symbol / key
	    dataNest.forEach(function(d) {

	    	var color = toColor(d.key);
	    	var userObj = getUserById(d.key);

			switch(timeTravel.colorAttribute) {
			    case "numOfCountry":
			        color = Country.getColorByNumOfCountry(userObj.cntryCount);
			        break;
			    case "speed":
			        color = Speed.getColorBySpeed(filter.userMaxSpeedHashMap[userObj.u_id]);
			        break;
			    case "language":
			    	color = Language.getColorByAbbr(userObj.prof_lang);
			    	break;
			    default:
			}

	        svg.append("path")
	            .attr("class", "line")
	            .attr("u_id", d.key)
	            .attr("d", line(d.values))
	            .attr("stroke", color)
	            .attr("opacity", timeTravel.opacity)
				.on("mouseover", function(d) {
					d3.select(this).moveToFront();
					d3.select(this).classed("top", true);
				})
			    .on("mouseout", function(d) {
			    	d3.select(this).classed("top", false);
			    })
			    .on("contextmenu", function(data, index) {
					var id_ = this.getAttribute("u_id");
					filter.state.excludedUsers.push(id_);
					console.log(filter.state);
					d3.event.preventDefault();
					//$(this).remove();
					filter.filter();
				}).on("click", function(d) {
					var id_ = this.getAttribute("u_id");
					tweetDisplay.show(id_);
				});

			// svg.selectAll("dot")
			// 	.data(d.values)
			// 	.enter().append("circle")
			// 	.attr("class", "dot")
			// 	.attr("r", 3.5)
			// 	.attr("cx", function(d) { return x(d.date); })
			// 	.attr("cy", function(d) { return y(d.cntry_val); })
			// 	.attr("fill", c)
			// 	.attr("opacity", 0.5);

	    });
	}

	timeTravel.createLengend = function() {

		var size = 40;
		var _svg = d3.select("#timeTravel-legend").append("svg")
				.attr("width", size * 9).attr("height", size)
			.append("g").attr("width", size).attr("height", size);

		if (timeTravel.colorAttribute == "numOfCountry") {
			_svg.selectAll("rect").data([0, 1, 2, 3, 4, 5, 6])
		    	.enter().append("rect")
		    	.attr("x", function (d, i) {
				    var x = Math.floor(i * size);
				    return x;
				}).attr("y", function (d, i) {
				    var y = 10;
				    return y;
				}).attr("width", function (d, i) {
				    return size - 2;
				}).attr("height", function (d, i) {
				    return size;
				}).attr("fill", function (d, i) {
				    return Country.colorbrewer7[i];
				});

			_svg.selectAll("text").data(Country.breaks)
		    	.enter().append("text")
		    	.attr("x", function (d, i) {
				    var x = Math.floor(i * size + size - 3);
				    return x;
				}).attr("y", function (d, i) {
				    var y = 10;
				    return y;
				}).attr("width", function (d, i) {
				    return size - 2;
				}).attr("height", function (d, i) {
				    return size;
				}).text(function (d, i) {
				    return d;
				})
		} else if (timeTravel.colorAttribute == "language") {
			_svg.selectAll("rect").data([0, 1, 2, 3, 4, 5, 6, 7, 8])
		    	.enter().append("rect")
		    	.attr("x", function (d, i) {
				    var x = Math.floor(i * size);
				    return x;
				}).attr("y", function (d, i) {
				    var y = 10;
				    return y;
				}).attr("width", function (d, i) {
				    return size - 2;
				}).attr("height", function (d, i) {
				    return size;
				}).attr("fill", function (d, i) {
				    return Language.colorbrewer9[i];
				});

			_svg.selectAll("text").data([0, 1, 2, 3, 4, 5, 6, 7])
		    	.enter().append("text")
		    	.attr("x", function (d, i) {
				    var x = Math.floor(i * size + 5);
				    return x;
				}).attr("y", function (d, i) {
				    var y = 10;
				    return y;
				}).attr("width", function (d, i) {
				    return size - 2;
				}).attr("height", function (d, i) {
				    return size;
				}).text(function (d, i) {
				    return Language.data[i].abbr;
				})
		} else if (timeTravel.colorAttribute == "speed") {
			_svg.selectAll("rect").data([0, 1, 2, 3, 4, 5, 6])
		    	.enter().append("rect")
		    	.attr("x", function (d, i) {
				    var x = Math.floor(i * size);
				    return x;
				}).attr("y", function (d, i) {
				    var y = 10;
				    return y;
				}).attr("width", function (d, i) {
				    return size - 2;
				}).attr("height", function (d, i) {
				    return size;
				}).attr("fill", function (d, i) {
				    return Speed.colorbrewer7[i];
				});

			_svg.selectAll("text").data(Speed.breaks)
		    	.enter().append("text")
		    	.attr("x", function (d, i) {
				    var x = Math.floor(i * size + size - 3);
				    return x;
				}).attr("y", function (d, i) {
				    var y = 10;
				    return y;
				}).attr("width", function (d, i) {
				    return size - 2;
				}).attr("height", function (d, i) {
				    return size;
				}).text(function (d, i) {
				    return d;
				})
		}
	}

});
