import React from 'react';
import {values, keys} from 'lodash';


//this weird sequence avoids crashing npm when plotly is loaded.
import Plotly from 'plotly.js';
import createPlotlyComponent from 'react-plotly.js/factory';
const Plot = createPlotlyComponent(Plotly);


function LongTermAverageGraph({longTermData}) {

    /* data is a temporary variable that represents the data, which are
     key value pairs. The keys are the date of the measurement, the values
     are the temperature at that date. The keys will be sorted, and then the
     temperatures will be matched to the correct years. */
    let data = longTermData.rXi1p1.data;   
    const years = keys(data).sort();

    /* function that returns an array of values, which are in the same order as
     the sorted keys */
    function matchValues(keys, values) {
        let orderedValues = [];
        years.forEach((year) => {
            for(let i in keys) {
                if (year === keys[i]) {
                    orderedValues.push(values[i]);
                }
            }
        })
        return orderedValues;
    }

    function longTermTimeSeries() {
        if(longTermData === null){
            return []
        }
        else {
            //TODO: fix this, order is not guarenteed
            return matchValues(keys(data), values(data));
        }
    }

    return (
        <Plot
            data={[
                {
                    x: years,
                    y: longTermTimeSeries(),
                    type: 'scatter',
                    mode: 'lines+markers',
                    marker: {color: 'red'},
                },
            ]}
            layout={
                { 
                    width: 500, 
                    height: 500, 
                    title: 'Mean Long Term Maximum Temperature', 
                    xaxis: {
                        title: 'Year',
                        type: 'date',
                        tickvals: ['1970-01-01', '1990-01-01', '2010-01-01', '2030-01-01', '2050-01-01', '2070-01-01', '2090-01-01'],
                        ticktext: ['1970', '1990', '2010', '2030', '2050', '2070', '2090'],
                    },
                    yaxis: {
                        title: 'Mean Maximum Temperature',
                    },
                } 
            }
        />
      );
}

export default LongTermAverageGraph;