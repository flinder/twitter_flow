$(document).ready(function(){
	timeLine = {}

	timeLine.init = function() {

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




	}


});
