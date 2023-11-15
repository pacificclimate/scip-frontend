// This file contains functions that make data requests of the
// PCEX API, as well as helper functions that format parameters for or
// responses from the API.
import axios from 'axios';
import {map, keys, pick} from 'lodash';
import {geoJSONtoWKT, MAXAREALENGTH} from '../helpers/GeographyHelpers.js';

// Functions for accessing the multimeta API, which returns a list of
// available datafiles, and some metadata about each one

export function getMultimeta(ensemble="scip_fraser_bccoast") {
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
// These APIs are accessed with a GET request if possible (to take advantage of
// caching), but will use POST if the area string is too long for GET.

export function annualCycleDataRequest(area, datafile, variable) {
    const wkt = geoJSONtoWKT(area);
    if (area && wkt.length > MAXAREALENGTH) {
        // send a POST reqiest to accomodate long area string
        const formData = new FormData();
        formData.append('id_', datafile);
        formData.append('area', wkt);
        formData.append('variable', variable);
        return axios.post(
            `${process.env.REACT_APP_PCEX_API_URL}/timeseries`,
            formData
        ).then(response => response.data);
    }
    else {
        //send a GET request
        return axios.get(
            `${process.env.REACT_APP_PCEX_API_URL}/timeseries`, {
                params: {
                    id_: datafile,
                    area: wkt,
                    variable: variable,
                }
            }
        ).then(response=> response.data);
    }

}

export function longTermAverageDataRequest(area, variable, model,
                                           emission, timescale, 
                                           time, ensemble_name="scip_fraser_bccoast") {
    const wkt = geoJSONtoWKT(area);
    if (area && wkt.length > MAXAREALENGTH) {
        // send a POST reqiest to accomodate long area string
        const formData = new FormData();
        formData.append('ensemble_name', ensemble_name);
        formData.append('model', model);
        formData.append('variable', variable);
        formData.append('emission', emission);
        formData.append('timescale', timescale);
        formData.append('time', time);
        formData.append('area', wkt);
        return axios.post(
            `${process.env.REACT_APP_PCEX_API_URL}/data`,
            formData
        ).then(response => response.data);
    }
    else {
        //send a GET request
        return axios.get(
            `${process.env.REACT_APP_PCEX_API_URL}/data`, {
                params: {
                    ensemble_name,
                    model,
                    variable,
                    emission,
                    timescale,
                    time,
                    area: wkt,
                }
            }
        ).then(response=> response.data);
    }
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
                ensemble_name: "fraser_bccoast_watershed"
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
                ensemble_name: "fraser_bccoast_watershed"
            }
        }
    )
    .then(response => response.data);
}


export function getUpstream(point) {
    //returns the area upstream of the selected point 
    // (plus some extra data this app doesn't use)
    // named "getUpstream" for this app even though the API is named
    // watershed, because "watershed" has a more specific meaning in this
    // app.
    return axios.get(
    process.env.REACT_APP_PCEX_API_URL + "/streamflow/watershed",
        {
            params: {
                station: point,
                ensemble_name: "fraser_bccoast_watershed"
            }
        }
    )
    .then(response => response.data);
}
