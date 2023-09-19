import _ from 'lodash';
// helper functions for parsing or formatting geographic data

//attribute names to show on screen
export const displayRegionAttributeNames = {};


// Is point a valid WKT point?
export function validPoint(point) {
    const p = JSON.parse(point)
    return p 
        && p?.type=== "Point"
        && _.isNumber(p?.coordinates?.[0]) 
        && _.isNumber(p?.coordinates?.[1]);
}

export function parseRegions(regions) {    
    function parseBoundary(region) {
        const b = JSON.parse(region.boundary);
        region.boundary = b;
        return region;
    }
    return(_.sortBy(_.map(regions, parseBoundary), 'name'));
}

// returns the set of regions in the lists - intended to merge
// the results of multiple region queries with different parameters
// into a single list of all the unique regions
export function regionListUnion(lists) {
    return(_.unionBy(...lists, "name"));
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
    else if (area.type === "Polygon") {
        wkt = "MULTIPOLYGON (((";
        area.coordinates[0].forEach(function(point, index) {
            wkt = wkt.concat(`${point[0]} ${point[1]},`);
        });
        wkt = wkt.slice(0, -1); //remove final comma
        wkt = wkt.concat(")))");
    }
    else if (area.type === "Point"){
        wkt = `POINT (${area.coordinates[0]} ${area.coordinates[1]})`
    }
    else{
        console.log(`Conversion for geoJSON ${area.type} is not implemented yet`);
        wkt = ""
    }
    return wkt;
}

