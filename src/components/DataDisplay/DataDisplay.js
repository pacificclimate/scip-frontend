// receives the user-selected area of interest, queries the PCEX API to retrieve data
// about indicators in that area, displays graphs of the results. Currently only displays
// maximum temperature graphs.
// currently the graphs are AnnualCycleGraph (timeseries API) and LongTermAverageGraph (data API).


import {testDataRequest, longTermAverageDataRequest, getMultimeta, flattenMultimeta} from '../../data-services/pcex-backend.js'
import AnnualCycleGraph from '../AnnualCycleGraph/AnnualCycleGraph.js'
import LongTermAverageGraph from '../LongTermAverageGraph/LongTermAverageGraph.js'
import VariableSelector from '../selectors/VariableSelector.js';
import React, {useState, useEffect} from 'react';

function DataDisplay({region}) {
  
  const [monthlyTimeSeries, setMonthlyTimeSeries] = useState(null);
  const [longTermTimeSeries, setLongTermTimeSeries] = useState(null);
  const [rasterMetadata, setRasterMetadata] = useState(null);
  const [variable, setVariable] = useState(null);
  
  // fetch list of available datasets
  useEffect(() => {
    //only needs to be done once
    if(!rasterMetadata) {
        getMultimeta().then(data => {
            setRasterMetadata(flattenMultimeta(data));
        })
        }
    }
  );
  
  function selectVariable(event) {
      setVariable(event.value);
  }
  
  function dontSelectVariable(event){
    //TODO: put something here. Ask Rod what.
  }
  
  // fetch data and format it as graphs.
  // currently one call to each of the 'data' and 'timeseries' APIs. 
  useEffect(() => {
      if(region) {
        testDataRequest(region.geometry).then(data => {
            setMonthlyTimeSeries(data);
        });
      }
  }, [region]);
  
    useEffect(() => {
      if(region && variable) {
        longTermAverageDataRequest(region.geometry, variable.representative.variable_id).then(data => {
            setLongTermTimeSeries(data);
        });
      }
  }, [region, variable]);
  
  return (
    <div className="DataDisplay">
        <br/>
        {rasterMetadata ? 
          <VariableSelector 
            metadata={rasterMetadata}
            constraint={{}}
            value={variable ? variable.representative : null}
            canReplace={false}
            onChange={selectVariable}
            onNoChange={dontSelectVariable}
          /> : 
          "Loading Available Datasets"}
        <br/>
        {longTermTimeSeries ? 
          <LongTermAverageGraph 
            longTermData={longTermTimeSeries}
            variableInfo={variable}
            region={region}
          /> : 
          "Select a watershed and a variable"}
    </div>
  );
}

export default DataDisplay;