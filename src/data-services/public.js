import config from '../config.js';
// This file offers functions that access config files in the 
// "public" directory.
import yaml from 'js-yaml';
import axios from 'axios';

// accesses whitelists of regions, which are yaml files containing
// lists of regions to display.
export function getWhitelist(whitelist) {
    const url = `${config.PUBLIC_URL}/${whitelist}.yaml`;
    
    return axios.get(url)
        .then(response => response.data)
        .then(yaml.safeLoad);
}

// accesses configuration file of indicator map display options
export function getIndicatorMapOptions() {
    const url = `${config.PUBLIC_URL}/map_indicators.yaml`;
    return axios.get(url)
        .then(response => response.data)
        .then(yaml.safeLoad);
}

// access and load the config file full of texts for the help popups
export function getHelpTexts() {
    const url = `${config.PUBLIC_URL}/help.yaml`;
    return axios.get(url)
        .then(response => response.data)
        .then(yaml.safeLoad);
}