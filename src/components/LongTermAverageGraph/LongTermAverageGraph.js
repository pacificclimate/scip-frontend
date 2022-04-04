import React from 'react';
import {entries, keys} from 'lodash';


//this weird sequence avoids crashing npm when plotly is loaded.
import Plotly from 'plotly.js';
import createPlotlyComponent from 'react-plotly.js/factory';
const Plot = createPlotlyComponent(Plotly);


function LongTermAverageGraph({longTermData}) {

    /* data is a temporary variable that represents the data, which are
     key value pairs. The keys are the date of the measurement, the values
     are the temperature at that date. The keys will be sorted, and then the
     temperatures will be matched to the correct years. */
    
    var dataArray = entries(longTermData);
    var data = [];
    var graphTitle =  `Mean Long Term Maximum Temperature: ${ 
        dataArray.length >= 1 ? (dataArray[0].length == 2 ? dataArray[0][0].toUpperCase() : "") : ""
    }`;
    var yAxisTitle = `Mean Maximum Temperature (${
        dataArray.length >= 1 ? (dataArray[0].length == 2 ? dataArray[0][1].units : "") : ""
    })`;
    

    // Assert that longTermData is formatted as expected
    if (dataArray.length >= 1) {
        if (dataArray[0].length == 2){
            data = dataArray[0][1].data;
        }
    }
    const years = keys(data).sort();
    /* function that returns an array of values, which are in the same order as
     the sorted keys */
    function matchValues(entries) {
        let orderedValues = [];
        years.forEach((year) => {
            for(const [key, value] of entries) {
                if (year === key) orderedValues.push(value);
            }
        })
        return orderedValues;
    }

    function longTermTimeSeries() {
        if(data === []){
            return [];
        }
        else {
            return matchValues(entries(data));
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