// AnnualCycleGraph - provides a plotly visualization of how the value an indicator changes
// over the course of a year. Visualizes the output of the "timeseries" PCEX API.

import React from 'react';
import {entries, keys} from 'lodash';
import {matchValues} from '../../helpers/GraphHelpers.js'

//this piecewise loading of plotly avoids an issue where loading 
//the whole thing at once crashe npm due to memory issues.
// see https://prachij012017.medium.com/react-plotly-crashes-on-npm-start-41e2568ce6e3p
import Plotly from 'plotly.js';
import createPlotlyComponent from 'react-plotly.js/factory';
const Plot = createPlotlyComponent(Plotly);


function AnnualCycleGraph({annualData}) {
    
    var yAxisTitle = `Mean Maximum Temperature (${ annualData.units })`;

    const months = keys(annualData.data).sort();
    const units = Array(months.length).fill(annualData.units);
        
    function monthlyTimeSeries() {
        if(annualData === null){
            return []
        }
        else {
            //TODO: fix this, order is not guarenteed
            return matchValues(entries(annualData.data), months);
        }
    }

    return (
        <Plot
            data={[
                {
                    x: months,
                    y: monthlyTimeSeries(),
                    text: units,
                    type: 'scatter',
                    mode: 'lines+markers',
                    marker: {color: 'red'},
                    hovertemplate: '%{y:.2f}%{text}<extra></extra>',
                },
            ]}
            layout={
                { 
                    width: 500, 
                    height: 500, 
                    title: "Mean Daily Maximum Temperature", 
                    xaxis: {
                        title: 'Month',
                        type: 'date',
                        tickvals: months,
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