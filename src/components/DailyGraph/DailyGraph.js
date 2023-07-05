// AnnualCycleGraph - provides a plotly visualization of how the value an indicator changes
// over the course of a year. Visualizes the output of the "timeseries" PCEX API.

import React from 'react';
import {makeGraphTimeseries} from '../../helpers/GraphHelpers.js';
import _ from 'lodash';

//this piecewise loading of plotly avoids an issue where loading 
//the whole thing at once crashes npm due to memory issues.
// see https://prachij012017.medium.com/react-plotly-crashes-on-npm-start-41e2568ce6e3p
import Plotly from 'plotly.js';
import createPlotlyComponent from 'react-plotly.js/factory';
const Plot = createPlotlyComponent(Plotly);


function DailyGraph({annualData, variableInfo}) {
    
    var yAxisTitle = `Mean ${variableInfo.representative.variable_id} (${ annualData[0].units })`;
    
    function makeDataSeries() {
        if(annualData == null) {
            return []
        }
        else {
            return _.map(annualData, makeGraphTimeseries);
        }
    }

    return (
        <Plot
            data={makeDataSeries()}
            layout={
                { 
                    width: 500, 
                    height: 500, 
                    title: variableInfo.representative.variable_description, 
                    xaxis: {
                        title: 'Month',
                        tickvals: [15, 45, 75, 105, 135, 167, 197, 228, 259, 288, 319, 350],
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

export default DailyGraph;