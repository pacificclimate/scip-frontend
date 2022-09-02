// This file contains functions that make data requests of the
// PCEX API, as well as helper functions that format parameters for or
// responses from the API.
import axios from 'axios';
import {map, keys, pick} from 'lodash';

// Functions for accessing the multimeta API, which returns a list of
// available datafiles, and some metadata about each one

export function getMultimeta(ensemble="scip_files") {
    // returns the results of the multimeta API call - a list of available
    // netCDF raster data files and what data each contains
    // other API calls can be made to access this data.
    return axios.get(
    process.env.REACT_APP_PCEX_API_URL + "/multimeta",
        {
            params: { ensemble_name: ensemble}
        }
    )
    .then(response => response.data);
}

export function flattenMultimeta(response) {
    // The multimeta API returns an object with an attribute for each 
    // available file. We'd prefer the data as a list of objects, each
    // representing a single file. 
    // The multimeta API also makes allowances for files containing multiple
    // time resolutions or multiple variables by putting those attributes in a 
    // list. This project uses only single variable and resolution per file, so
    // we'll flatten what should be one-item lists into string attributes.
    // also renames some attributes
    const unmodified_attributes = ["institution", "model_id", "model_name", 
                                    "experiment", "ensemble_member", "timescale",
                                    "multi_year_mean", "start_date", "end_date", 
                                    "modtime"];
    
    return map(keys(response), file_id => {
        let file = pick(response[file_id], unmodified_attributes);
        file["run"] = response[file_id].ensemble_member;
        file["file_id"] = file_id;
        if (response[file_id].variables.length > 1){
            console.log(`Warning: File ${file_id} contains multiple variables and will not be used`);
        }
        else {
            const variable_id = keys(response[file_id].variables)[0];
            file["variable_id"] = variable_id;
            file["variable_description"] = response[file_id].variables[variable_id];
            file["units"] = response[file_id].units[variable_id];
            return file;
        }
    })
}

// Functions for accessing the raster data retrieval APIs, "timeseries" and "data".

function geoJSONtoWKT(area) {
    // formats geoJSON (used inside SCIP and in leaflet) to WKT (used by
    // the PCEX data-retreival APIs)
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


export function testDataRequest(area) {
    // accepts only a specified area - 
    // always gets data from the same file.
    // used for testing/development only
    
    return axios.get(
    process.env.REACT_APP_PCEX_API_URL + "/timeseries",
    {
      params: {
        id_: process.env.REACT_APP_TEST_API_FILE,
        variable: "apf_flow",
        area: geoJSONtoWKT(area),
      }
    }
  )
  .then(response => response.data);
}

export function longTermAverageDataRequest(area, variable="apf_flow", model="CanESM2",
                                           emission="historical, rcp85", timescale="yearly", 
                                           time="0", ensemble_name="scip_files") {
    return axios.get(
    process.env.REACT_APP_PCEX_API_URL + "/data",
        {
            params: {
                ensemble_name: ensemble_name,
                model: model,
                variable: variable,
                emission: emission,
                timescale: timescale,
                time: time,
                area: geoJSONtoWKT(area),
            }
        }
    )
    .then(response => response.data);
                                               
}


// Functions that access the hydrological APIs, "watershedStreams"
// and "downstream". These accept a WKT point and return a geoJSON
// description of streamflow upstream or downstream of the point.
 
export function getWatershedStreams(point) {
    // accepts only a specified point, gets data from the same
    // set of files
    return axios.get(
    process.env.REACT_APP_PCEX_API_URL + "/streamflow/watershed_streams",
        {
            params: {
                station: geoJSONtoWKT(point),
                ensemble_name: "upper_fraser_watershed"
            }
        }
    )
    .then(response => response.data);
}

export function getDownstream(point) {
    // accepts only a specified point, gets data from the same
    // set of files
    return axios.get(
    process.env.REACT_APP_PCEX_API_URL + "/streamflow/downstream",
        {
            params: {
                station: geoJSONtoWKT(point),
                ensemble_name: "upper_fraser_watershed"
            }
        }
    )
    .then(response => response.data);
}
