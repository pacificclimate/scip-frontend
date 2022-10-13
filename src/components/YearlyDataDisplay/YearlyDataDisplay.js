// Fetches data and handles user selection for yearly-resolution indicators.
// Receives an area, a model, an emissions scenario, and a list of available 
// datasets from its parent (DataDisplay), displays an indicator-selection 
// dropdown (VariableSelector) and a graph (LongTermAverageGraph).

import {longTermAverageDataRequest} from '../../data-services/pcex-backend.js'
import LongTermAverageGraph from '../LongTermAverageGraph/LongTermAverageGraph.js'
import VariableSelector from '../selectors/VariableSelector.js';
import React, {useState, useEffect} from 'react';

function YearlyDataDisplay({region, rasterMetadata, model, emission}){

  const [longTermTimeSeries, setLongTermTimeSeries] = useState(null);
  const [variable, setVariable] = useState(null);

  function selectVariable(event) {
      setVariable(event.value);
  }
  
  function dontSelectVariable(event){
    //TODO: put something here. Ask Rod what.
  }
  
    useEffect(() => {
      if(region && variable) {
        longTermAverageDataRequest(region.geometry, 
                                   variable.representative.variable_id,
                                   model,
                                   emission,
                                   "yearly",
                                   0).then(data => {
            setLongTermTimeSeries(data);
        });
      }
  }, [region, variable, model, emission]);
  
  function noGraphMessage() {
      if(!region && !variable) {
          return("Select a watershed and an indicator to view data");
      }
      else if(!region){
          return("Select a watershed to view data.");
      }
      else if(!variable){
          return("Select an indicator to view data");
      }
      else {
          return("Loading data...");
      }
  }

  return (
    <div className="YearlyDataDisplay">
        <br/>
        {rasterMetadata ? 
          <VariableSelector 
            metadata={rasterMetadata}
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
          noGraphMessage()}
    </div>
  );  
}

export default YearlyDataDisplay;