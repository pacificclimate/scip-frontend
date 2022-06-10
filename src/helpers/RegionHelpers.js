// helper functions for parsing and formatting region metadata
// this metadata is received as part of the geoserver list of regions (watersheds)

export const canonicalRegionAttributeNames = {
    "WTRSHDGRPD": "id",
    "WTRSHDGRPC": "code",
    "WTRSHDGRPN": "name",
    "AREA_HA": "area_hectares",
    "FTRCD": "ftr_code",
    "OBJECTID": "object_id",
    "AREA_SQM": "area_meters",
    "FEAT_LEN": "boundary_length",
    "OUTLET": "outlet"
};

//attribute names to show on screen
export const displayRegionAttributeNames = {};


//flatten from geoserver output to a region object
export function parseRegion(geoserverData) {
    let region = {};
    region.geometry = geoserverData.geometry;
    region.bounding_box = geoserverData.bbox;
    for (const att in geoserverData.properties) {
        region[att in canonicalRegionAttributeNames ? canonicalRegionAttributeNames[att] : att] = 
            geoserverData.properties[att];
    }
    return region;
}