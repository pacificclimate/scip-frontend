// Fetches data and handles user selection for monthly-resolution indicators.
// Receives an area, a model, an emissions scenario, and a list of available 
// datasets from its parent (DataDisplay) prefiltered to monthly-only, 
// displays an indicator-selection  dropdown (VariableSelector) 
// and a graph (AnnualCycleGraph).

import {annualCycleDataRequest} from '../../data-services/pcex-backend.js'
import AnnualCycleGraph from '../AnnualCycleGraph/AnnualCycleGraph.js'
import VariableSelector from '../selectors/VariableSelector.js';
import React, {useState, useEffect} from 'react';
import _ from 'lodash';

function MonthlyDataDisplay({region, rasterMetadata, model, emission}){

  const [annualCycleTimeSeries, setAnnualCycleTimeSeries] = useState(null);
  const [variable, setVariable] = useState(null);

  function selectVariable(event) {
      setVariable(event.value);
  }
  
  function dontSelectVariable(event){
    //TODO: put something here. Ask Rod what.
  }
  
    useEffect(() => {
      if(region && variable && rasterMetadata) {
        const datafiles = _.filter(rasterMetadata, {
            'variable_id': variable.representative.variable_id,
            'experiment': emission,
            'model_id': model
            });
        
        var api_calls = [];
        _.forEach(datafiles, function(datafile) {
            api_calls.push( annualCycleDataRequest(region.geometry, 
                                                   datafile.file_id, 
                                                   variable.representative.variable_id))});
        Promise.all(api_calls).then((api_responses)=> setAnnualCycleTimeSeries(api_responses));
      }
  }, [region, variable, model, emission, rasterMetadata]);
  
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
    <div className="MonthlyDataDisplay">
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
        {annualCycleTimeSeries ? 
          <AnnualCycleGraph 
            annualData={annualCycleTimeSeries}
            variableInfo={variable}
          /> : 
          noGraphMessage()}
    </div>
  );  
}

export default MonthlyDataDisplay;