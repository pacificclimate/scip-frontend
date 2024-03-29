import _ from 'lodash';
// helper functions for parsing or formatting geographic data

//attribute names to show on screen
export const displayRegionAttributeNames = {};

// WKT strings long than this will be sent to backends as POST
// requests, not GET requests. The unofficial maximum total URL
// length, including all parameters and domain information,
// is 4096.
export const MAXAREALENGTH = 2000;


// Is point a valid WKT point?
export function validPoint(point) {
    const p = JSON.parse(point)
    return p 
        && p?.type=== "Point"
        && _.isNumber(p?.coordinates?.[0]) 
        && _.isNumber(p?.coordinates?.[1]);
}

// prepares a list of regions for use in a dropdown selector
// alphabetical order, formats boundary
// if a "whitelist" containing names of desired regions is
// supplied, filter regions by whether or not they appear
// on the list.
export function parseRegions(regions, whitelist = null) {

    function parseBoundary(region) {
        const b = JSON.parse(region.boundary);
        region.boundary = b;
        return region;
    }
    
    function whitelistFilter (e) {
        return(whitelist.includes(e.name));
    }
    
    function identityFilter(e) {
        return true;
    }
    
    const filter = whitelist ? whitelistFilter : identityFilter;
    
    return(_.filter(_.sortBy(_.map(regions, parseBoundary), 'name'), filter));
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

export function parseUpstream(upstream) {
    // format upstream data into an object with the same attributes 
    // as a region object.
    const outlet = upstream.boundary.properties.mouth.geometry;
    const name = `Upstream of ${outlet.coordinates[1]} ${outlet.coordinates[0]}`;
    return({
        name: name,
        code: "UPST",
        kind: "upstream",
        boundary: upstream.boundary.geometry,
        outlet: JSON.stringify(outlet)
    });
}
