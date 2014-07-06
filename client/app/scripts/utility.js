'use strict';

// generates the html to shown as the popup of each marker
// see: http://leafletjs.com/reference.html#geojson (options: pointToLayer)
// TODO: better styling, add css classes and so on...
function generatePopup(kita){
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
function generateMarker(feature, latlng){
    return new L.marker(latlng, {
        title: feature.properties.name,
        alt: feature.properties.name,
        opacity: 0.8,
        riseOnHover: true,
        riseOffset: 250
    });
}

function FilterFactory(options){
    return function (feature, layer){
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
    };
}