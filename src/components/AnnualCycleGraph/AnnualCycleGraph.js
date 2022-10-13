// AnnualCycleGraph - provides a plotly visualization of how the value an indicator changes
// over the course of a year. Visualizes the output of the "timeseries" PCEX API.

import React from 'react';
import {makeMonthlyTimeseries} from '../../helpers/GraphHelpers.js';
import _ from 'lodash';

//this piecewise loading of plotly avoids an issue where loading 
//the whole thing at once crashe npm due to memory issues.
// see https://prachij012017.medium.com/react-plotly-crashes-on-npm-start-41e2568ce6e3p
import Plotly from 'plotly.js';
import createPlotlyComponent from 'react-plotly.js/factory';
const Plot = createPlotlyComponent(Plotly);


function AnnualCycleGraph({annualData, variableInfo}) {
    
    var yAxisTitle = `Mean ${variableInfo.representative.variable_id} (${ annualData[0].units })`;
    
    function makeDataSeries() {
        if(annualData == null) {
            return []
        }
        else {
            return _.map(annualData, makeMonthlyTimeseries);
        }
    }

    return (
        <Plot
            data={makeDataSeries()}
            layout={
                { 
                    width: 500, 
                    height: 500, 
                    title: variableInfo.representative.variable_desrciption, 
                    xaxis: {
                        title: 'Month',
                        tickvals: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
                        ticktext: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
                    },
                    yaxis: {
                        title: yAxisTitle,
                    },
                } 
            }
        />
      );
}

export default AnnualCycleGraph;