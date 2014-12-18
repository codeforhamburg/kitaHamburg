/* global L, generatePopup, minMax */
'use strict';

var app = {
    map: null,
    currentGEOJSONLayer: undefined,
};

function searchKitas(){
    $.ajax({
        type: 'POST',
        url: '/cgi-bin/kitas/',
        data: JSON.stringify({'hort': {'Min': 4, 'Max': 5}}),
        success: updateMap,
        contentType: 'application/json',
        dataType: 'json'
    });
}

function getSliderStates(){
    var currentOptions = {};
    $('input.slider').each(function(){
        var key = $(this).attr('id');
        //console.debug('Key:', key);
        
        if ($('input.filterSelect#' + key).prop('checked') !== true){
            return;
        }
        
        var currentValue = $(this).slider('getAttribute', 'value');
        currentValue.sort(minMax);
        //console.debug('Value:', currentValue);
        
        currentOptions[key] = {
            Min: currentValue[0],
            Max: currentValue[1],
        };
    });
    return currentOptions;
}


function updateMap(data){
    var kitas = data || [];
    if (app.currentGEOJSONLayer !== undefined){
        app.map.removeLayer(app.currentGEOJSONLayer);
    }
    
    console.log('Found:', kitas.length, kitas[0]);
    
    var GeoJSON = {type: "FeatureCollection", features: kitas};
    
    app.currentGEOJSONLayer = L.geoJson(GeoJSON, {
        onEachFeature: function (feature, layer) {
            layer.bindPopup(generatePopup(feature.properties));
        }
    }).addTo(app.map);
}


$(document).ready(function() {
    // init Leaflet
    app.map = L.map('map').setView([53.56, 10.02], 11);
    
    // basic tileLayer
    L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
        'minzoom': 10,
        'maxzoom': 18,
        'attribution': '© OpenStreetMap contributors'
    }).addTo(app.map);
    
    // Overlay: Stadtteile Hamburg
    $.getJSON('stadtteile_hh.geojson', function(data) {
        L.geoJson(data, {
            style: function() {
                return {
                    color: '#000000',
                    fillOpacity: 0,
                    opacity: 0.5,
                    weight: 1
                };
            },
           /* onEachFeature: function(feature, layer) {
                layer.bindLabel(feature.properties.name);
            }*/
        }).addTo(app.map);
    });
    
    $('input.slider')
        .each(function(){
            $(this).slider().on('slideStop', function(){
                var checkboxSelector = 'input.filterSelect#' + $(this).attr('id');
                if (! $(checkboxSelector).prop('checked')){
                    $(checkboxSelector).prop('checked', true);
                }
                searchKitas();
            });
        });
    
    $('input.filterSelect').click(function(){
        searchKitas();
    });
    
    searchKitas();
});

