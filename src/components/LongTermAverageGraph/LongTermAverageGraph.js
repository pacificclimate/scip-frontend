// AnnualCycleGraph - provides a plotly visualization of how the value an indicator changes
// until 2100. Visualizes the output of the "data" PCEX API.

import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import Plotly from 'plotly.js';
import createPlotlyComponent from 'react-plotly.js/factory';
import { makeGraphData } from '../../helpers/GraphHelpers.js';
import { unravelObject } from '../../helpers/APIDataHelpers.js';
import GraphDownloadButton from '../GraphDownloadButton/GraphDownloadButton.js';

// this piecewise loading of plotly avoids an issue where loading
// the whole thing at once crashes npm due to memory issues.
// see https://prachij012017.medium.com/react-plotly-crashes-on-npm-start-41e2568ce6e3p

const Plot = createPlotlyComponent(Plotly);

function LongTermAverageGraph({ longTermData, variableInfo, graphMetadata }) {
  const dataArray = _.entries(longTermData);
  const graphTitle = `Mean Long Term ${variableInfo.representative.variable_description}: ${
    dataArray.length >= 1 ? (dataArray[0].length === 2 ? dataArray[0][0].toUpperCase() : '') : ''
  }`;
  const yAxisTitle = `Mean ${variableInfo.representative.variable_id} (${
    dataArray.length >= 1 ? (dataArray[0].length === 2 ? dataArray[0][1].units : '') : ''
  })`;

  function makeLongTermTimeSeries() {
    if (longTermData == null) {
      return [];
    }
    return _.map(unravelObject(longTermData, 'run'), makeGraphData);
  }

  const layout = {
    width: 700,
    height: 500,
    title: graphTitle,
    xaxis: {
      title: 'Year',
      type: 'date',
      tickvals: ['1970-01-01', '1990-01-01', '2010-01-01', '2030-01-01', '2050-01-01', '2070-01-01', '2090-01-01'],
      ticktext: ['1970', '1990', '2010', '2030', '2050', '2070', '2090'],
    },
    yaxis: {
      title: yAxisTitle,
    },
  };

  return (
    <div>
      <Plot
        data={makeLongTermTimeSeries()}
        layout={layout}
      />
      <GraphDownloadButton
        data={makeLongTermTimeSeries()}
        layout={layout}
        metadata={graphMetadata}
      />
    </div>
  );
}

LongTermAverageGraph.propTypes = {
  longTermData: PropTypes.array.isRequired,
  variableInfo: PropTypes.any.isRequired,
};

export default LongTermAverageGraph;
