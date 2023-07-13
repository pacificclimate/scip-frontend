// Fetches data and handles user selection for monthly-resolution indicators.
// Receives an area, a model, an emissions scenario, and a list of available 
// datasets from its parent (DataDisplay) prefiltered to monthly-only, 
// displays an indicator-selection  dropdown (VariableSelector) 
// and a graph (AnnualCycleGraph).

import {annualCycleDataRequest} from '../../data-services/pcex-backend.js'
import {noGraphMessage} from '../../helpers/GraphHelpers.js'
import AnnualCycleGraph from '../AnnualCycleGraph/AnnualCycleGraph.js'
import VariableSelector from '../selectors/VariableSelector.js';
import React, {useState, useEffect} from 'react';
import _ from 'lodash';

function MonthlyDataDisplay({region, rasterMetadata, model, emission}){

  const [annualCycleTimeSeries, setAnnualCycleTimeSeries] = useState(null);
  const [variable, setVariable] = useState(null);

  function selectVariable(event) {
      setVariable(event);
  }
  
  function dontSelectVariable(event){
    //nothing happens here, as we are not using cascading selection
  }
  
    useEffect(() => {
      if(region && variable && rasterMetadata) {
        const datafiles = _.filter(rasterMetadata, {
            'variable_id': variable.value.representative.variable_id,
            'experiment': emission,
            'model_id': model
            });
        
        
        const api_calls = _.map(datafiles, datafile => {
            return annualCycleDataRequest(region.boundary, datafile.file_id, 
                                   variable.value.representative.variable_id)
        });        
        Promise.all(api_calls).then((api_responses)=> setAnnualCycleTimeSeries(api_responses));
      }
  }, [region, variable, model, emission, rasterMetadata]);
  

  return (
    <div className="MonthlyDataDisplay">
        <br/>
        {rasterMetadata ? 
          <VariableSelector 
            metadata={rasterMetadata}
            value={variable ? variable : null}
            canReplace={false}
            onChange={selectVariable}
            onNoChange={dontSelectVariable}
          /> : 
          "Loading Available Datasets"}
        <br/>
        {annualCycleTimeSeries ? 
          <AnnualCycleGraph 
            annualData={annualCycleTimeSeries}
            variableInfo={variable.value}
          /> : 
          noGraphMessage({
              watershed: region,
              indicator: variable
          })}
    </div>
  );  
}

export default MonthlyDataDisplay;