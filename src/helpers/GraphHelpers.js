import _ from 'lodash';
import {yearFromExtendedDate} from './APIDataHelpers.js'
/* function that returns an array of values, which are in the same order as
 the sorted keys.
 Param entries: array of arrays, inner array being key value pairs
 Param dates: sorted keys of entries
  */
export function matchValues(entries, dates){
    let orderedValues = [];
        dates.forEach((date) => {
            for(const [key, value] of entries) {
                if (date === key) orderedValues.push(value);
            }
        })
    return orderedValues;
}


//used to assign unique colours. 
// TODO - more colours, better order, etc.
const colourNames = ["red", "blue", "green", "purple", "orange", "yellow"]

function first(tuple) {
    return tuple[0];
}

function last(tuple) {
    return tuple[tuple.length - 1];
}

// Function that accepts an output from the 'timeseries' PCEX API
// and outputs a Plotly object descrtibing how to graph the timeseries
// and label it with its climatology.
// Intended for use inside a lodash map call - uses the "index" argument to 
// assign different colour each time it is called. Accepts lodash map's 
// "collection" argument also but doesn't do anything with it.
// TODO: accept a function that generates the label
export function makeGraphTimeseries(data, index, collection) {

    const timestampCount = _.range(1, _.keys(data.data).length +1);
    
    const pairs = _.sortBy(_.toPairs(data.data), first);

    const climatologies = [[1971, 2000], [2010, 2039], [2040, 2069], [2070, 2099]];
    
    //we don't have direct access to climatology metadata, but can guess pretty easily, as
    // there are only four associated with this project, and they don't overlap.
    const timestampYear = yearFromExtendedDate(_.keys(data.data)[0]);
    
    const climo = _.find(climatologies, c => {return timestampYear > c[0] && timestampYear < c[1]});

    return {
        x: timestampCount,
        y: _.map(pairs, last),
        text: Array(timestampCount.length).fill(data.units),
        type: 'scatter',
        mode: 'lines+markers',
        marker: {color: colourNames[index]},
        hovertemplate: '%{y:.2f}%{text}<extra></extra>',
        name: `${climo[0]}-${climo[1]}`
    };
}

// returns text describing what user selections are missing in order to generate
// the graph.
export function noGraphMessage(needed_data) {
    let missing_metadata = [];
    for(let metadata in needed_data) {
        if(!needed_data[metadata]) {
            missing_metadata.push(metadata);
        }
    }
    if(missing_metadata.length === 0) {
        return("Loading data...");
    }
    if(missing_metadata.length === 1) {
        return(`Select a ${missing_metadata[0]} to view data.`);
    }
    else if (missing_metadata.length === 2) {
        return(`Select a ${missing_metadata[0]} and a ${missing_metadata[1]} to view data.`);
    }
    else {
        let text = "Select ";
        for (var i = 0; i < missing_metadata.length-1 ; i++) {
            text = text.concat(`a ${missing_metadata[i]}, `)
        }
        return(text.concat(`and a ${missing_metadata[missing_metadata.length - 1]} to view data.`));
    }
}
