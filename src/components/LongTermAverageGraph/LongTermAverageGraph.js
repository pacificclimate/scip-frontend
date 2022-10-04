// AnnualCycleGraph - provides a plotly visualization of how the value an indicator changes
// until 2100. Visualizes the output of the "data" PCEX API.

import React from 'react';
import {entries, keys} from 'lodash';
import {matchValues} from '../../helpers/GraphHelpers.js'

//this piecewise loading of plotly avoids an issue where loading 
//the whole thing at once crashes npm due to memory issues.
//see https://prachij012017.medium.com/react-plotly-crashes-on-npm-start-41e2568ce6e3p
import Plotly from 'plotly.js';
import createPlotlyComponent from 'react-plotly.js/factory';
const Plot = createPlotlyComponent(Plotly);


function LongTermAverageGraph({longTermData, variableInfo}) {

    /* data is a temporary variable that represents the data, which are
     key value pairs. The keys are the date of the measurement, the values
     are the temperature at that date. The keys will be sorted, and then the
     temperatures will be matched to the correct years. */
    
    var dataArray = entries(longTermData);
    var data = [];
    var graphTitle =  `Mean Long Term ${variableInfo.representative.variable_description}: ${ 
        dataArray.length >= 1 ? (dataArray[0].length === 2 ? dataArray[0][0].toUpperCase() : "") : ""
    }`;
    var yAxisTitle = `Mean ${variableInfo.representative.variable_id} (${
        dataArray.length >= 1 ? (dataArray[0].length === 2 ? dataArray[0][1].units : "") : ""
    })`;
    
    // Assert that longTermData is formatted as expected
    if (dataArray.length >= 1) {
        if (dataArray[0].length === 2){
            data = dataArray[0][1].data;
        }
    }
    const years = keys(data).sort();
    const units = Array(years.length).fill(dataArray[0][1].units);

    function longTermTimeSeries() {
        if(data === []){
            return [];
        }
        else {
            return matchValues(entries(data), years);
        }
    }

    return (
        <Plot
            data={[
                {
                    x: years,
                    y: longTermTimeSeries(),
                    text: units,
                    type: 'scatter',
                    mode: 'lines+markers',
                    marker: {color: 'red'},
                    hovertemplate: '%{y:.2f}%{text}<extra></extra>',
                    error_x: {
                        type: 'data',
                        array: [25, 15, 15, 15],
                        visible: true
                    },
                },
            ]}
            layout={
                { 
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
                } 
            }
        />
      );
}

export default LongTermAverageGraph;