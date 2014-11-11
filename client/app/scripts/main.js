/* global L, generatePopup, minMax */
'use strict';


function searchKitas(){
  $.ajax({
    url: 'localhost:8888/cgi-bin/kitas',
    dataType: "json",
    data: {"krippe": {"Min": 4, "Max": 5}}
    })
    .done(function(data){
      console.log("done:", data);
    })
    .fail(function(data){
      console.log("fail:", data);
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

var currentGEOJSONLayer;
function updateMap(data){
    if (currentGEOJSONLayer !== undefined){
        map.removeLayer(currentGEOJSONLayer);
    }
    
    console.log('Found:', data.length, data[0]);
    
    currentGEOJSONLayer = L.geoJson(filteredGeoJson, {
        onEachFeature: function (feature, layer) {
            layer.bindPopup(generatePopup(feature.properties));
        }
    }).addTo(map);
}

$(document).ready(function() {
    // init Leaflet
    var map = L.map('map').setView([53.56, 10.02], 11);
    
    // basic tileLayer
    L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
        'minzoom': 10,
        'maxzoom': 18,
        'attribution': '© OpenStreetMap contributors'
    }).addTo(map);
    
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
        }).addTo(map);
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

