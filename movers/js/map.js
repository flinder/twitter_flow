var map = {};

map.fakeRealData = function () {

    // Load GeoJSON
            
    var processData = function(fakeData) { 

        data = {};
        data.geoJsonTrips = fakeData;

        filter = {};
        filter.currentData = {};
        filter.currentData.includedUsers = ["487094289"];

        // Dake init call
        map.init();           
                        
    }
    
    jQuery.getJSON('../../data/main_data_trips.json', processData);


}

map.init = function () {

    
    // Stuff that is done once at startup

    // This is called when full geoJson data is loaded!

    // Build map and load baselayer tiles
    map.leafletMap = L.map('map-container').setView([44.933, 24.003], 4);

    L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpandmbXliNDBjZWd2M2x6bDk3c2ZtOTkifQ._QA7i5Mpkd_m30IGElHziw', {
        maxZoom: 18,
        attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +
            '<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
            'Imagery © <a href="http://mapbox.com">Mapbox</a>',
        id: 'mapbox.streets'
    }).addTo(map.leafletMap);

    

    // Load current data
    map.update();
    




}

map.filter = function (fullData, userlist) {

    var filteredData = {
        type: "FeatureCollection", 
        features: new Array(userlist.length)
    };

    // { "type": "Feature",
    //     "geometry": {
    //         "type": "LineString",
    //         "coordinates": []
    //     },
    //     "properties": {}
    // }


    // Implement filtering logic
    
    var lastAddedUserIndex = 0;
 
    for (var i = 0; i < fullData.features.length; i++){
        
        var currentFeature = fullData.features[i];

        if (userlist.indexOf(currentFeature.properties.u_id) !== -1) {

            // add user to filtered list
            filteredData.features[lastAddedUserIndex] = currentFeature;

            lastAddedUserIndex++;
        }

        if (lastAddedUserIndex === fullData.features.length - 1) {
            break;
        }

    }


    // Dummy filter!
    return fullData;

    //return filteredData;
    

}

map.update = function () {

    // Stuff that is done when filters are updated
    
    // Filter data
    map.filteredData = map.filter(data.geoJsonTrips, filter.currentData.includedUsers);

    // Generate tiles
    var tileOptions = {
        maxZoom: 20,  // max zoom to preserve detail on
        tolerance: 5, // simplification tolerance (higher means simpler)
        extent: 4096, // tile extent (both width and height)
        buffer: 64,   // tile buffer on each side
        debug: 0,      // logging level (0 to disable, 1 or 2)

        indexMaxZoom: 0,        // max zoom in the initial tile index
        indexMaxPoints: 100000, // max number of points per tile in the index
    };

    map.tileIndex = geojsonvt(map.filteredData, tileOptions); //eslint-disable-line


    // Update tiles
    map.updateLayer();
    

}

map.updateLayer = function () {
    


    


    // Get current x, y, z
    // ...

    // Delete old data layer
    // ...

    // Add new data
    var tileLayer = L.canvasTiles()
              .params({ debug: false, padding: 5 })
              .drawing(map.drawingOnCanvas);
           

    tileLayer.addTo(map.leafletMap);


    tileLayer.redraw();

}



map.drawingOnCanvas = function (canvasOverlay, params) {

    var pad = 0;

    var bounds = params.bounds;
    params.tilePoint.z = params.zoom;

    var ctx = params.canvas.getContext('2d');
    ctx.globalCompositeOperation = 'source-over';


    //console.log('getting tile z' + params.tilePoint.z + '-' + params.tilePoint.x + '-' + params.tilePoint.y);

    var tile = map.tileIndex.getTile(params.tilePoint.z, params.tilePoint.x, params.tilePoint.y);
    if (!tile) {
        //console.log('tile empty');
        return;
    }

    ctx.clearRect(0, 0, params.canvas.width, params.canvas.height);

    var features = tile.features;

    ctx.strokeStyle = 'grey';


    for (var i = 0; i < features.length; i++) {
        var feature = features[i],
            type = feature.type;

        ctx.fillStyle = feature.tags.color ? feature.tags.color : 'rgba(255,0,0,0.05)';
        ctx.beginPath();

        for (var j = 0; j < feature.geometry.length; j++) {
            var geom = feature.geometry[j];

            if (type === 1) {
                ctx.arc(geom[0] * ratio + pad, geom[1] * ratio + pad, 2, 0, 2 * Math.PI, false);
                continue;
            }

            for (var k = 0; k < geom.length; k++) {
                var p = geom[k];
                var extent = 4096;
               
                var x = p[0] / extent * 256;
                var y = p[1] / extent * 256;
                if (k) ctx.lineTo(x  + pad, y   + pad);
                else ctx.moveTo(x  + pad, y  + pad);
            }
        }

        if (type === 3 || type === 1) ctx.fill('evenodd');
        ctx.stroke();
    }

};
