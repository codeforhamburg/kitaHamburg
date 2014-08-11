/* global L, generatePopup*/
'use strict';

// a crockford constructor for a GEOJSON FeatureCollection that can
// return selected items from a web-requested geojson file, while
// keeping all of them in a private variable
function GEOJSON_FEATURE_FILTER(url){
    // private member variables holding all headers and all features
    var headers = {};
    var features = [];
    var that = this;

    // private function that splits geoJSON headers and features-array up
    // and stores them in the private variables headers and features respecitvely.
    function loadData (data){
        if (data.hasOwnProperty('features') && data.features !== undefined){
            features = data.features;
            delete data.features;
        }
        for (var member in data){
            headers[member] = data[member];
        }
    }

    // private function that applies filterFunc to all features elements
    // filterfunc should take a geojson feature and return either true or false
    function filter(filterFunc, options){
        var selected = [];
        var length = features.length;
        for (var i = 0; i < length; i += 1){
            if (filterFunc(features[i], options) === true){
                selected.push(features[i]);
            }
        }
        return selected;
    }


    // private function that wraps an array of features into a copy of the original headers
    function wrapInHeaders(selectedItems){
        var geoJSONobj = {features: []},
            i = 0,
            length = selectedItems.length;

        for (var k in headers){
            geoJSONobj[k] = headers[k];
        }

        for (i=0; i<length; i += 1){
            geoJSONobj.features.push(selectedItems[i]);
        }
        return geoJSONobj;
    }

    $.getJSON(url, {}, loadData);

    // privileged public filter method.
    // Returns undefined when filterfunc is not a function.
    // Returns null if filterfunc matched no items.
    // Returns a geoJSON object with the filtered subset of features otherwise.
    this.Filter = function(filterfunc, options){
        var selected = filter(filterfunc, options);
        if (selected.length === 0){
            return null;
        }
        return wrapInHeaders(selected);
    };
}


// checks wether an geoJSON feature matches the selected options
// options should be an object with service names as keys and timing
// information as in kitas.geojson as value or if it is an non timebased
// service the value should be true
function Filter(feature, options){
    // go through all options, and comare them
    for (var option in options){
        // first we must discriminate timed and non-timed values
        if (typeof(options[option]) === typeof(true)){
            if (feature.properties.services[option] !== undefined){
                return true;
            }
        } else {
            if (feature.properties.services[option] !== undefined){
                if (feature.properties.services[option].Max >= options[option].Max &&  feature.properties.services[option].Min <= options[option].Min){
                    return true;
                }
            }
        }
    }
    return false;
}


$(function() {
	var map = L.map('map').setView([53.56, 10.02], 11);
	var mapbox = L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
		'minzoom': 10,
		'maxzoom': 18,
		'attribution': '© OpenStreetMap contributors'
	}).addTo(map);

	var markers = new L.MarkerClusterGroup({
	    spiderfyOnMaxZoom: true,
	    showCoverageOnHover: true,
	    zoomToBoundsOnClick: true
	});

	var jsonData;

	$.getJSON('kitas.geojson', function(data) {
	    jsonData = data;
		var geoJsonLayer = L.geoJson(data, {
			onEachFeature: function (feature, layer) {
				layer.bindPopup(generatePopup(feature.properties));
			}
		});

	    markers.addLayer(geoJsonLayer);
	    map.addLayer(markers);
	});

	var kitas = new GEOJSON_FEATURE_FILTER('kitas.geojson');

	$('.slider').slider({})
		.on('slideStop', function() {
			var values = $(this).slider('getAttribute', 'value');

            // Math.min and Max.max yielded NaN ?!
            var min = 0;
            var max = 0;
            if (values[0] <= values[1]){
                min = values[0];
                max = values[1];
            } else {
                min = values[1];
                max = values[2];
            }

			var filterData =  {
                // krippe is written a small k in kitas.geojson
                // I admit, it makes no sense, but we need to be consistent
                // in order for the comparsion to work.
                'krippe': {
                    'Max': max,
                    'Min': min
                }
            };

			var filteredGeoJson = kitas.Filter(Filter, filterData);

			console.log(filteredGeoJson);

			var geoJsonLayer = L.geoJson(filteredGeoJson, {
				onEachFeature: function (feature, layer) {
					layer.bindPopup(generatePopup(feature.properties));
				}
			});

			//map.clearLayers();
            markers.clearLayers();
            markers.addLayer(geoJsonLayer);
            map.addLayer(markers);

		});
});

