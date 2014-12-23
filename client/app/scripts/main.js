/* global L */
'use strict';

var app = {
    map: null,
    kitaMarkers: undefined,
    query: {
        services: {},
        stadtteile: {},
    },
};

app.HelpPopUp = L.popup({
    keepInView: true,
    closeButton: true,
}).setLatLng([53.56, 10.02])
  .setContent('<div>'+
'<h2>Willkommen beim Hamburger Kitafinder!</h2>'+
'<p>Hier kannst du ganz einfach die passende Kita für dich und deine Lütten finden.</p>'+
'<ol>'+
  '<li>Klicke dazu einfach <u>auf der Karte</u> <b>einen oder mehrere Stadtteile</b></li>'+
  '<li>und wähle <u>rechts</u> <b>eines oder mehrere Betreuungsangebote</b></li>'+
'</ol>'+
'</div>');

app.StadtTeilStyle = {
    color: '#FFFFFF',
    opacity: 0.5,
    weight: 2,
    fillOpacity: 0.4,
    fillColor: '#EE0000',
    
    clickable: true,
};

app.StadtTeilStyleActive = {
    color: '#FFFFFF',
    opacity: 0.8,
    weight: 4,
    fill: true,
    fillColor: '#EE0000',
    fillOpacity: 0.7,
    clickable: true,
};


// generates the html to shown as the popup of each marker
// see: http://leafletjs.com/reference.html#geojson (options: pointToLayer)
// TODO: better styling, add css classes and so on...
app.generatePopup = function (kita){
    var tmpl = '<div class="container">';
    
    tmpl +=  '<h5>' + kita.name + '</h5>';
    
    if (kita.website !== undefined){
        tmpl += '<a href="' + kita.website + '" target="blank">' + kita.website + '</a></br>';
    }
    
    tmpl += '<b>Träger</b>: ' + kita.operator + '</br>';

    if (kita.contact !== undefined && kita.contact !== ''){
        tmpl += '<b>Ansprechpartner</b>: ' + kita.contact + '</br>';
    }
    if (kita.email !== undefined && kita.email !== ''){
        tmpl += '<b>Kontakt</b>:';
        tmpl += '<a href="mailto:'+kita.email+'" >'+kita.email+'</a></br>';
    }
    
    if (kita.phone !== undefined && kita.phone !== '') {
        tmpl += '<b>Tel</b>:' + kita.phone;
    }
    if (kita.fax !== undefined && kita.fax !== ''){
        tmpl += ' <b>Fax</b>: ' + kita.fax;
    }
    tmpl += '</br>';
    
    tmpl += '<b>Adresse</b>: ' + kita.street;
    if (kita.housenumber !== undefined && kita.housenumber !== ''){
        tmpl += ' ' + kita.housenumber;
    }
    if (kita.postcode !== undefined && kita.postcode !== ''){
        tmpl += ', ' + kita.postcode + ' Hamburg';
    }
    tmpl += '</br>';
    
    
    
    tmpl += '</div>';
    return tmpl;
};

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
};

app.getSliderStates = function (){
    $('input.slider').each(function(){
        var key = $(this).attr('id');
        if ( ! $('div.filter#' + key).hasClass('active')){
            return;
        }
        
        var currentValues = $(this).slider('getAttribute', 'value');
        
        app.query.services[key] = {
            Min: Math.min(currentValues[0], currentValues[1]),
            Max: Math.max(currentValues[0], currentValues[1]),
        };
    });
    return app;
};

app.getUnTimedServices = function(){
    var serviceNames = ['vorschulklasse', 'anschlBertrGTSonder', 'paedMittagsTisch'];
    serviceNames.forEach(function(serviceName){
        if ( ! $('div.filter#' + serviceName).hasClass('active') ){
            return;
        }
        app.query[serviceName] = {
            Min: -1,
            Max: -2,
        };
    });
    return app;
};

app.StadtteilClick = function(e){
    var layer = e.target;
    
    if (!layer.kitaHHActive){
        layer.setStyle(app.StadtTeilStyleActive);
        layer.kitaHHActive = true;
        app.query.stadtteile[layer.feature.properties.name] = true;
    } else {
        layer.setStyle(app.StadtTeilStyle);
        layer.kitaHHActive = false;
        delete app.query.stadtteile[layer.feature.properties.name];
    }
    app.searchKitas();
};

app.AngebotFilter = function(name){
    $('div.filter#' + name).toggleClass('active');
    
    var btn = $('button.serviceSelector#' + name);
    btn.toggleClass('btn-default btn-primary');
    if (btn.html() === 'auswählen' ) {
        btn.html('abwählen');
    } else {
        btn.html('auswählen');
    }
};

app.updateMap = function (data){
    var kitas = data || [];
    if (app.kitaMarkers !== undefined){
        app.map.removeLayer(app.kitaMarkers);
    }
    
    console.log('Found:', kitas.length, kitas[0]);
    
    var GeoJSON = {type: 'FeatureCollection', features: kitas};
    
    app.kitaMarkers = L.geoJson(GeoJSON, {
        onEachFeature: function (feature, layer) {
            layer.bindPopup(app.generatePopup(feature.properties));
        }
    }).addTo(app.map);
};

app.searchKitas = function(){
    app.getSliderStates();
    app.getUnTimedServices();
    
    console.debug('query:', app.query);
    $.ajax({
        type: 'POST',
        url: '/api/kitas/',
        data: JSON.stringify(app.query),
        contentType: 'application/json',
        dataType: 'json',
        success: app.updateMap,
        error: function (err){ console.log('error', err);},
    });
};


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
        app.Stadtteile = L.geoJson(data, {
            style: function() {
                return app.StadtTeilStyle;
            },
            onEachFeature: function(feature, layer) {
                layer.bindLabel(feature.properties.name);
                layer.on('click', app.StadtteilClick);
            }
        }).addTo(app.map);
    });
    
    $('input.slider')
      .slider({tooltip_split: true}) //jshint ignore:line
      .each(function(){
        $(this).on('slideStop', function(){
            if (! $('div.filter#' + $(this).attr('id')).hasClass('active')){
                app.AngebotFilter($(this).attr('id'));
            }
            app.searchKitas();
        });
    });
    
    
    $('button.serviceSelector').each(function(){
        $(this).on('click', function(){
            var serviceID = $(this).attr('id');
            if ($('div.filter#' + serviceID).hasClass('active')){
                delete app.query.services[serviceID];
            }
            app.AngebotFilter($(this).attr('id'));
            app.searchKitas();
        });
    });
    
    app.HelpPopUp.openOn(app.map);
});

