import React from 'react';
import {values, keys} from 'lodash';


//this weird sequence avoids crashing npm when plotly is loaded.
import Plotly from 'plotly.js';
import createPlotlyComponent from 'react-plotly.js/factory';
const Plot = createPlotlyComponent(Plotly);


function LongTermAverageGraph({longTermData}) {
    const years = keys(longTermData.data)
    /*const years = [
        "1977", "1986", "1997",
        "2025", "2055", "2085"];
    */
    function longTermTimeSeries() {
        if(longTermData === null){
            return []
        }
        else {
            //TODO: fix this, order is not guarenteed
            return values(longTermData.data);
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
            layout={ {width: 500, height: 500, title: 'Mean Long Term Maximum Temperature'} }
        />
      );
}

export default LongTermAverageGraph;
