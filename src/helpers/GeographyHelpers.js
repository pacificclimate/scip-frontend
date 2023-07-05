import _ from 'lodash'
// helper functions for parsing or formatting geographic data

//attribute names to show on screen
export const displayRegionAttributeNames = {};

// for temporary use while only some data is available.
const upper_fraser_watersheds = [
    'Lower Chilako River', 'Lower Salmon River', 'Quesnel River',
    'Salmon River', 'Cottonwood River', 'Euchiniko River', 
    'Herrick Creek', 'Muskeg River', 'Nazko River', 'Morkill River', 
    'Cariboo River', 'Bowron', 'Blackwater River', 'Willow River', 
    'Tabor River', 'Narcosli Creek', 'Upper Fraser River', 
    'Chilako River', 'McGregor River', 'Stuart River'
    ];

export function filterRegions(regions) {
    return _.filter(regions, region => {
    return(_.includes(upper_fraser_watersheds, region.name)); 
    })
}

export function parseRegions(regions) {    
    function parseBoundary(region) {
        const b = JSON.parse(region.boundary);
        region.boundary = b;
        return region;
    }
    return(_.map(regions, parseBoundary));
}

// the frontend uses geoJSON format, but the backends expect WKT format;
// convert from geoJSON to WKT
export function geoJSONtoWKT(area) {
    // formats geoJSON (used inside SCIP and in leaflet) to WKT (used by
    // the PCEX and SCIP data-retreival APIs)
    // todo: more elegant parsing here.
    var wkt;
    if (area === null) {
        wkt = "";
    }
    else if (area.type === "MultiPolygon") {
        wkt = "MULTIPOLYGON ((";
        area.coordinates.forEach(function(polygon, index){
            wkt = wkt.concat("(");
                polygon[0].forEach(function(point, index) {
                    wkt = wkt.concat(`${point[0]} ${point[1]},`);
                });
            wkt = wkt.slice(0, -1); //remove final comma
            wkt = wkt.concat(")");
        });
        wkt = wkt.concat("))");
    }
    else if (area.type === "Point"){
        wkt = `POINT (${area.coordinates[0]} ${area.coordinates[1]})`
    }
    else{
        console.log("other conversions not implemented yet.");
        wkt = ""
    }
    return wkt;
}