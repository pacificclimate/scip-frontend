// This file contains functions that make data requests of the 
// SCIP API, which handles named locations and salmon populations.

import axios from 'axios';
import {geoJSONtoWKT, MAXAREALENGTH} from '../helpers/GeographyHelpers.js';

// All API calls in this file use GET requests if there is no overlap
// parameter or the overlap parameter is short. If the overlap parameter is
// longer than MAXAREALENGTH; a POST request is used instead. This is
// due to the informal 4096 character limit on URL length; a long
// overlap parameter can make the whole URL too long.
// The exception is getTaxons, which does not take an overlap parameter.

export function getSalmonPopulation(region) {
    const wkt = geoJSONtoWKT(region);

    if (region && wkt.length > MAXAREALENGTH) {
        // send a POST reqiest to accomodate long overlap string
        const formData = new FormData();
        formData.append('overlap', wkt);

        return axios.post(
            `${process.env.REACT_APP_SCIP_API_URL}/population`,
            formData
        ).then(response => response.data);
    }
    else {
        //send a GET request
        let params = {overlap: wkt};
        return axios.get(
            `${process.env.REACT_APP_SCIP_API_URL}/population`, { params: params}
        ).then(response=> response.data);
    }
}

// function that does the work of putting together queries for
// the "region" API.
function getRegions(kind, overlap=null, common_name = null, subgroup = null) {
    const wkt = geoJSONtoWKT(overlap);

    if (overlap && wkt.length > MAXAREALENGTH) {
        // send a POST reqiest to accomodate long overlap string
        const formData = new FormData();
        formData.append('kind', kind);
        formData.append('overlap', wkt);

        if (common_name) {
            formData.append('common_name', common_name);
            if(subgroup) {
                formData.append('subgroup', subgroup);
            }
        }

        return axios.post(
            `${process.env.REACT_APP_SCIP_API_URL}/region`,
            formData
        ).then(response => response.data);
    }
    else {
        //send a GET request
        let params = {kind: kind};
        if (overlap) {
            params.overlap = wkt;
        }
        if (common_name) {
            params.common_name = common_name;
            if(subgroup) {
                params.subgroup = subgroup;
            }
        }
        return axios.get(
            `${process.env.REACT_APP_SCIP_API_URL}/region`, { params: params}
        ).then(response=> response.data);
    }
}

export function getWatersheds(overlap = null, common_name = null, subgroup = null) {
    return getRegions('watershed', overlap, common_name, subgroup);
}

export function getBasins(overlap = null) {
    return getRegions('basin', overlap);
}

export function getConservationUnits(overlap = null, common_name = null, subgroup = null) {
    return getRegions('conservation_unit', overlap, common_name, subgroup);
}

export function getTaxons() {
    return axios.get(
        process.env.REACT_APP_SCIP_API_URL + "/taxon"
    )
    .then(response => response.data);
}
