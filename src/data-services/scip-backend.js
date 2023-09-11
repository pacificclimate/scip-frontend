// This file contains functions that make data requests of the 
// SCIP API, which handles location data.

import axios from 'axios';

export function getSalmonPopulation(region) {
    return axios.get(
    process.env.REACT_APP_SCIP_API_URL + "/population",
        {
            params: { overlap: region}
        }
    )
    .then(response => response.data);
}

export function getWatersheds(overlap = null, common_name = null, subgroup = null) {
    let params = {kind: "watershed"};
    if(overlap) {
        params.overlap = overlap;
    }
    if(common_name) {
        params.common_name = common_name;
        if(subgroup) {
            params.subgroup = subgroup;
        }
    }

    return axios.get(
        process.env.REACT_APP_SCIP_API_URL + "/region",
        {
            params: params
        }
    )
    .then(response => response.data);
}

export function getBasins() {
    return axios.get(
        process.env.REACT_APP_SCIP_API_URL + "/region",
        {
            params: {kind: "basin"}
        }
    )
    .then(response => response.data);
}

export function getConservationUnits(overlap = null, common_name = null, subgroup = null) {
    let params = {kind: "conservation_unit"};
    if(overlap) {
        params.overlap = overlap;
    }
    if(common_name) {
        params.common_name = common_name;
        if(subgroup) {
            params.subgroup = subgroup;
        }
    }

    return axios.get(
        process.env.REACT_APP_SCIP_API_URL + "/region",
        {
            params: params
        }
    )
    .then(response => response.data);
}

export function getTaxons() {
    return axios.get(
        process.env.REACT_APP_SCIP_API_URL + "/taxon"
    )
    .then(response => response.data);
}
