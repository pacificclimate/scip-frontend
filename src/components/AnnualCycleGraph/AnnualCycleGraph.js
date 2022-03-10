import React from 'react';
import {values} from 'lodash';


//this weird sequence avoids crashing npm when plotly is loaded.
import Plotly from 'plotly.js';
import createPlotlyComponent from 'react-plotly.js/factory';
const Plot = createPlotlyComponent(Plotly);


function AnnualCycleGraph({annualData}) {
    const monthAbbrev = [
        "Jan", "Feb", "Mar", "Apr", 
        "May", "Jun", "Jul", "Aug", 
        "Sep", "Oct", "Nov", "Dec"];
    
    function monthlyTimeSeries() {
        if(annualData === null){
            return []
        }
        else {
            //TODO: fix this, order is not guarenteed
            return values(annualData.data);
        }
    }

    return (
        <Plot
            data={[
                {
                    x: monthAbbrev,
                    y: monthlyTimeSeries(),
                    type: 'scatter',
                    mode: 'lines+markers',
                    marker: {color: 'red'},
                },
            ]}
            layout={ {width: 500, height: 500, title: 'Monthly Maximum Temperature'} }
        />
      );
}

export default AnnualCycleGraph;