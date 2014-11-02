db.kitas.ensureIndex({"properties.operator": "text", "properties.name": "text", "properties.contact": "text", "properties.street": "text"}, {"name": "fulltext"});
db.kitas.ensureIndex({"properties.bezirk": 1, "properties.stadtteil": 1, "properties.postcode": 1}, {"name": "adr"});
db.kitas.ensureIndex({ "geometry": "2dsphere" }, {"name": "coordinates"} );


