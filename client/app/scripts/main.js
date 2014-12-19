/* global L, generatePopup */
'use strict';

var app = {
    map: null,
    currentGEOJSONLayer: undefined,
};


// generates the html to shown as the popup of each marker
// see: http://leafletjs.com/reference.html#geojson (options: pointToLayer)
// TODO: better styling, add css classes and so on...
app.generatePopup = function (kita){
    var tmpl = '<div class="container">';

    if (kita.website !== undefined){
        tmpl += '<a href="' + kita.website + '" target="blank">' + kita.name + '</a></br>';
    } else{
        tmpl +=  '<b>' + kita.name + '</b></br>';
    }

    tmpl += '<b>Träger</b>: ' + kita.operator + '</br>';

    if (kita.email !== undefined && kita.contact !== undefined){
        tmpl += '<b>Ansprechpartner</b>: <a href="mailto:' + kita.email + '">' + kita.contact + '</a>';
    }
    if (kita.phone !== undefined) {
        tmpl += ' (' + kita.phone + ')';
    }

    tmpl += '</div>';
    return tmpl;
}

// generates and styles a marker to be used to represent a feature
// see: http://leafletjs.com/reference.html#marker
// and: http://leafletjs.com/reference.html#icon
// TODO: add custom icons? 
app.generateMarker = function (feature, latlng){
    return new L.marker(latlng, {
        title: feature.properties.name,
        alt: feature.properties.name,
        opacity: 0.8,
        riseOnHover: true,
        riseOffset: 250
    });
}

app.getSliderStates = function (){
    var currentOptions = {};
    $('input.slider').each(function(){
        var key = $(this).attr('id');
        //console.debug('Key:', key);
        
        if ($('input.filterSelect#' + key).prop('checked') !== true){
            return;
        }
        
        var currentValues = $(this).slider('getAttribute', 'value');
        
        currentOptions[key] = {
            Min: Math.min(currentValues[0], currentValues[1]),
            Max: Math.max(currentValues[0], currentValues[1]),
        };
    });
    return currentOptions;
}


app.updateMap = function (data){
    var kitas = data || [];
    if (app.currentGEOJSONLayer !== undefined){
        app.map.removeLayer(app.currentGEOJSONLayer);
    }
    
    console.log('Found:', kitas.length, kitas[0]);
    
    var GeoJSON = {type: 'FeatureCollection', features: kitas};
    
    app.currentGEOJSONLayer = L.geoJson(GeoJSON, {
        onEachFeature: function (feature, layer) {
            layer.bindPopup(app.generatePopup(feature.properties));
        }
    }).addTo(app.map);
}

app.searchKitas = function(){
    var query = app.getSliderStates();
    $.ajax({
        type: 'POST',
        url: '/cgi-bin/kitas/',
        data: JSON.stringify(query),
        contentType: 'application/json',
        dataType: 'json',
        success: app.updateMap,
        error: function (err){ console.log('error', err);},
    });
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
                app.searchKitas();
            });
        });
    
    $('input.filterSelect').click(function(){
        app.searchKitas();
    });
});

