// This file offers functions that access config files in the 
// "public" directory.
import yaml from 'js-yaml';
import axios from 'axios';

// accesses whitelists of regions, which are yaml files containing
// lists of regions to display.
export function getWhitelist(whitelist) {
    const url = `${process.env.PUBLIC_URL}/${whitelist}.yaml`;
    
    return axios.get(url)
        .then(response => response.data)
        .then(yaml.safeLoad);
}

// accesses configuration file of indicator map display options
export function getIndicatorMapOptions() {
    const url = `${process.env.PUBLIC_URL}/map_indicators.yaml`;
    return axios.get(url)
        .then(response => response.data)
        .then(yaml.safeLoad);
}