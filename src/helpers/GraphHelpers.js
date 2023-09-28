import _ from 'lodash';
import { yearFromExtendedDate } from './APIDataHelpers.js';
/* function that returns an array of values, which are in the same order as
 the sorted keys.
 Param entries: array of arrays, inner array being key value pairs
 Param dates: sorted keys of entries
  */
export function matchValues(entries, dates) {
  const orderedValues = [];
  dates.forEach((date) => {
    for (const [key, value] of entries) {
      if (date === key) orderedValues.push(value);
    }
  });
  return orderedValues;
}

// used to assign unique colours.
// TODO - more colours, better order, etc.
const colourNames = ['red', 'blue', 'green', 'purple', 'orange', 'yellow'];

function first(tuple) {
  return tuple[0];
}

function last(tuple) {
  return tuple[tuple.length - 1];
}

// Function that accepts an output from the 'data' PCEX API
// and outputs a Plotly object describing how to graph the timeseries
// and label it with its run.
// Intended for use inside a lodash map call - uses the "index" argument
// to assign a differnt colour each time it is called. Accepts lodash map's
// "collection" argument, but doesn't do anything with it.
export function makeGraphData(data, index, collection) {
  const pairs = _.sortBy(_.toPairs(data.data), first);

  return {
    x: _.map(pairs, first),
    y: _.map(pairs, last),
    text: Array(pairs.length).fill(data.units),
    type: 'scatter',
    mode: 'lines+markers',
    marker: { color: colourNames[index] },
    hovertemplate: '%{y:.2f}%{text}<extra></extra>',
    name: data.run,
  };
}

// Function that accepts an output from the 'timeseries' PCEX API
// and outputs a Plotly object descrtibing how to graph the timeseries
// and label it with its climatology.
// Intended for use inside a lodash map call - uses the "index" argument to
// assign different colour each time it is called. Accepts lodash map's
// "collection" argument also but doesn't do anything with it.
// TODO: accept a function that generates the label
export function makeGraphTimeseries(data, index, collection) {
  const timestampCount = _.range(1, _.keys(data.data).length + 1);

  const pairs = _.sortBy(_.toPairs(data.data), first);

  const climatologies = [[1971, 2000], [2010, 2039], [2040, 2069], [2070, 2099]];

  // we don't have direct access to climatology metadata, but can guess pretty easily, as
  // there are only four associated with this project, and they don't overlap.
  const timestampYear = yearFromExtendedDate(_.keys(data.data)[0]);

  const climo = _.find(climatologies, (c) => timestampYear > c[0] && timestampYear < c[1]);

  return {
    x: timestampCount,
    y: _.map(pairs, last),
    text: Array(timestampCount.length).fill(data.units),
    type: 'scatter',
    mode: 'lines+markers',
    marker: { color: colourNames[index] },
    hovertemplate: '%{y:.2f}%{text}<extra></extra>',
    name: `${climo[0]}-${climo[1]}`,
  };
}

// returns text describing what user selections are missing in order to generate
// the graph.
export function noGraphMessage(needed_data) {
  const missing_metadata = [];

  function noun_with_article(noun) {
    // doesn't attempt to tackle words that start with h
    if (noun.match('^[aeiouAEIOU]')) {
      return (`an ${noun}`);
    } return (`a ${noun}`);
  }

  for (const metadata in needed_data) {
    if (!needed_data[metadata]) {
      missing_metadata.push(metadata);
    }
  }
  if (missing_metadata.length === 0) {
    return ('Loading data...');
  }
  if (missing_metadata.length === 1) {
    return (`Select ${noun_with_article(missing_metadata[0])} to view data.`);
  }
  if (missing_metadata.length === 2) {
    return (`Select ${noun_with_article(missing_metadata[0])} and ${noun_with_article(missing_metadata[1])} to view data.`);
  }

  let text = 'Select ';
  for (let i = 0; i < missing_metadata.length - 1; i++) {
    text = text.concat(`${noun_with_article(missing_metadata[i])}, `);
  }
  return (text.concat(`and ${noun_with_article(missing_metadata[missing_metadata.length - 1])} to view data.`));
}

// makes a string that describes an emissions scenario without
// commas. used in graph data CSV files. turns "historical, rcp85" into
// "historical followed by RCP 8.5"
export function noCommasExperiment(str) {
  const humanFriendly = {
    'historical, rcp45': 'historical followed by RCP 4.5',
    'historical, rcp85': 'historical followed by RCP 8.5',
  };
  return (str in humanFriendly ? humanFriendly[str] : str);
}
