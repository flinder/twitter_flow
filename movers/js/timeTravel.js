$(document).ready(function(){
	timeTravel = {}

	timeTravel.u_ids = [];
	timeTravel.cntrys = [];
	timeTravel.cntry_val_map = {};
	timeTravel.trips = [];
	timeTravel.timerange = [];
	timeTravel.opacity = 0.5;

	mCntrys = 
		["DEU",
		"ITA",
		"CHE",
		"AUT",
		"CZE",
		"SVK",
		"HUN",
		"ROU",
		"HRV",
		"SVN",
		"BIH",
		"SRB",
		"MKD",
		"BGR",
		"ALB",
		"GRC",
		"TUR",
		"SYR",
		"LBN",
		"JOR",
		"IRQ",
		"IRN",
		"EGY",
		"Others"];
	mCntrys.reverse();

	var x;
	var y;
	var xAxis;
	var yAxis;
	var line;
	var parseDate;
	var svg;

	timeTravel.init = function() {

		timeTravel.u_ids = [];
		timeTravel.trips = [];
		// timeTravel.cntrys = [];
		// timeTravel.cntry_val_map = {};
		timeTravel.timerange = [];
		$("#timeTravel-content").html("");

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

		// Set the dimensions of the canvas / graph
		var margin = {top: 30, right: 20, bottom: 30, left: 50},
		    width = $("#main-container").width() - margin.left - margin.right,
		    height = 500 - margin.top - margin.bottom;

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

	    	var c = toColor(d.key);

	        svg.append("path")
	            .attr("class", "line")
	            .attr("u_id", d.key)
	            .attr("d", line(d.values))
	            .attr("stroke", c)
	            .attr("opacity", timeTravel.opacity)
			.on("mouseover", function(d) {
			        d3.select(this).moveToFront();
			        d3.select(this).classed("top", true);
			}).on("mouseout", function(d) {
			        d3.select(this).classed("top", false);
			}).on("contextmenu", function(data, index) {
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

	    // Add the X Axis
	    svg.append("g")
	        .attr("class", "x axis")
	        .attr("transform", "translate(0," + height + ")")
	        .call(xAxis);

	    // Add the Y Axis
	    svg.append("g")
	        .attr("class", "y axis")
	        .call(yAxis);

	    d3.select(".y.axis").selectAll(".tick").selectAll("text")
	    	.text(function(d) { return Country.getFullFromAbbr(mCntrys[d]); })
			.filter(function(d) { return mCntrys[d] === "DEU" || mCntrys[d] === "SYR"})
			.style("font-weight", "bold");

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

		timeTravel.u_ids = [];
		timeTravel.trips = [];
		// timeTravel.cntrys = [];
		// timeTravel.cntry_val_map = {};
		timeTravel.timerange = [];

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

	    	var c = toColor(d.key);

	        svg.append("path")
	            .attr("class", "line")
	            .attr("u_id", d.key)
	            .attr("d", line(d.values))
	            .attr("stroke", c)
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
});
