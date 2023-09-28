// Button that allows users to download a CSV of the contents of a
// Plotly graph when clicked. Accepts objects with the same format
// as Plotly - a data object and a layout object.

import Button from 'react-bootstrap/Button';
import React from 'react';
import _ from 'lodash';
import PropTypes from 'prop-types';

function GraphDownloadButton({ data, layout, metadata }) {
  function csvRow(list, label, precision = null) {
    return (_.reduce(
      list,
      (row, col) => `${row}, ${precision ? col.toPrecision(precision) : col}`,
      `${label}`,
    ).concat('\n'));
  }
  
  // when a list of strings is converted to a single output string, by default
  // commas are added. This function converts a list of strings into an
  // output string with concatenation only so we don't get extra commas in the CSV. 
  function noCommas(txtList) {
      return(_.reduce(txtList, function(strOut, str) {return strOut.concat(str)}, ""));
  }

  function makeCSV() {
    //make first table, which contains metadata
    const meta = _.map(_.toPairs(metadata), (m) => {return `${m[0]}, ${m[1]}\n`;}); 
    
    //make blank line
    const blank = "\n";
    
    //make second table, which contains data
    const header = csvRow(data[0].x, `${layout.title} (${data[0].text[0]})`);
    const series = _.map(data, (s) => csvRow(s.y, s.name, 3));
    return [noCommas(meta), blank, header, noCommas(series)];
  }

  function fileName() {
    // convert everything that isn't a letter, number, plus, minus, or
    // underscore into underscores
    const nonFilenameCharacters = /[^a-zA-z0-9\+\-_]/g;
    const filename = layout.title.replaceAll(nonFilenameCharacters, '_');
    return filename.concat('.csv');
  }

  const file = new Blob(makeCSV(), { type: 'text/html' });

  return (
    <Button
      download={fileName()}
      href={URL.createObjectURL(file)}
    >
      Download Data
    </Button>
  );
}

GraphDownloadButton.propTypes = {
  layout: PropTypes.any.isRequired,
  data: PropTypes.any.isRequired,
};

export default GraphDownloadButton;
