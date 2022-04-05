import React from 'react';
import {entries, keys} from 'lodash';
import {matchValues} from '../Helpers/GraphHelpers.js'

//this weird sequence avoids crashing npm when plotly is loaded.
import Plotly from 'plotly.js';
import createPlotlyComponent from 'react-plotly.js/factory';
const Plot = createPlotlyComponent(Plotly);


function AnnualCycleGraph({annualData}) {
    
    var yAxisTitle = `Mean Maximum Temperature (${ annualData.units })`;

    const months = keys(annualData.data).sort();
        
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
                    type: 'scatter',
                    mode: 'lines+markers',
                    marker: {color: 'red'},
                    hovertemplate: '%{y:.2f}\u00B0C<extra></extra>',
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