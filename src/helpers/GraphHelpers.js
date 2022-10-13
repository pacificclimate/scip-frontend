import _ from 'lodash';
import moment from 'moment/moment';
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

function yearFromTimestamp(timestamp) {
     return parseInt(moment(timestamp, moment.ISO_8601).utc().format('YYYY'));
}


/* function that returns a Plotly object corresponding to a
   data series, given a monthly-resolution output from the 
   'timeseries' PCEX API.
   Intended for use with lodash's map - uses the index argument
   to assign a different colour each time it is called. */
   
// TODO: this is pretty crude and fragile, update and sturdify
export function makeMonthlyTimeseries(data, index, collection) {
      
    const monthNumbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]; 
      
    let pairs = _.sortBy(_.toPairs(data.data), first);

    const climatologies = [[1971, 2000], [2010, 2039], [2040, 2069], [2070, 2099]];
    
    //we don't hve access to climatology metadata, but can guess pretty easily, as
    // there are only four associated with this project, and they don't overlap.
    const timestampYear = yearFromTimestamp(_.keys(data.data)[0]);
    
    const climo = _.find(climatologies, c => {return timestampYear > c[0] && timestampYear < c[1]});

    return {
        x: monthNumbers,
        y: _.map(pairs, last),
        text: Array(monthNumbers.length).fill(data.units),
        type: 'scatter',
        mode: 'lines+markers',
        marker: {color: colourNames[index]},
        hovertemplate: '%{y:.2f}%{text}<extra></extra>',
        name: `${climo[0]}-${climo[1]}`
    };
}