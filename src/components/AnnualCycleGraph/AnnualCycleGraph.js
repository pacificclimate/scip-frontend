// AnnualCycleGraph - provides a plotly visualization of how the value an indicator changes
// over the course of a year. Visualizes the output of the "timeseries" PCEX API.

import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';

// this piecewise loading of plotly avoids an issue where loading
// the whole thing at once crashe npm due to memory issues.
// see https://prachij012017.medium.com/react-plotly-crashes-on-npm-start-41e2568ce6e3p
import Plotly from 'plotly.js';
import createPlotlyComponent from 'react-plotly.js/factory';
import GraphDownloadButton from '../GraphDownloadButton/GraphDownloadButton.js';
import { makeGraphTimeseries } from '../../helpers/GraphHelpers.js';

const Plot = createPlotlyComponent(Plotly);

function AnnualCycleGraph({ annualData, variableInfo }) {
  const yAxisTitle = `Mean ${variableInfo.representative.variable_id} (${annualData[0].units})`;

  function makeDataSeries() {
    if (annualData == null) {
      return [];
    }
    return _.map(annualData, makeGraphTimeseries);
  }

  const layout = {
    width: 500,
    height: 500,
    title: variableInfo.representative.variable_description,
    xaxis: {
      title: 'Month',
      tickvals: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
      ticktext: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    },
    yaxis: {
      title: yAxisTitle,
    },
  };

  return (
    <div>
      <Plot
        data={makeDataSeries()}
        layout={layout}
      />
      <GraphDownloadButton
        data={makeDataSeries()}
        layout={layout}
      />
    </div>

  );
}

AnnualCycleGraph.propTypes = {
  annualData: PropTypes.array.isRequired,
  variableInfo: PropTypes.any.isRequired,
};

export default AnnualCycleGraph;
