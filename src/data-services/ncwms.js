// This file contains functions used to make metadata requests of the ncWMS server.
// Actual map image requests are made by leaflet using leaflet's own code; the 
// functions in this file are used by the user-facing components of MapControls.
import axios from 'axios';


export function getColourBarURL(palette="default", logscale= false) {
    const params = {
        service: "WMS",
        request: "GetLegendGraphic",
        colorbaronly: "true",
        vertical: "false",
        palette: palette,
        logscale: logscale,
        width: 400,
        height: 25
    };
    
    const urlParams = new URLSearchParams(params);
    
    return process.env.REACT_APP_NCWMS_URL + "?" + urlParams;
}

//returns a promise for a JSON object containing the minimum and maximum values of the dataset
export function getNcwmsMinMax(file, variable) {
    
    const params = {
        service: "WMS",
        request: "GetMetadata",
        item: "minmax",
        layers: "x/" + file + "/" + variable,
        version: "1.1.1",
        srs: "EPSG:4326",
        bbox: "-141,41,-52,84",
        width: 100,
        height: 100
    };
    
    return axios.get(
        process.env.REACT_APP_NCWMS_URL,
        {
            params: params
        }
    )
    .then(response => response.data);
}

// returns the list of available colour palettes.
// this requires a dataset, for some reason.
export function getNcwmsPalettes(file, variable) {
    const params = {
        service: "WMS", 
        request: "GetMetadata",
        item: "layerDetails",
        layerName: "x/" + file + "/" + variable
    };
    
    return axios.get(
        process.env.REACT_APP_NCWMS_URL,
        {
            params: params
        }
    ).then(response => response.data.palettes);
}