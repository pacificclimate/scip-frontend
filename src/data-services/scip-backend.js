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

export function getWatersheds() {
    return axios.get(
        process.env.REACT_APP_SCIP_API_URL + "/region",
        {
            params: {kind: "watershed"}
        }
    )
    .then(response => response.data);
}