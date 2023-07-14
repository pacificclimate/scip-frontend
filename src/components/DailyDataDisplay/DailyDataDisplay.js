// Fetches data and handles user selection for daily-resolution indicators.
// Receives an area, a model, an emissions scenario, and a list of available 
// datasets from its parent (DataDisplay) prefiltered to daily-only, 
// displays an indicator-selection  dropdown (VariableSelector), 
// a climatology dropdown (ClimatologySelector), 
// and a graph (AnnualCycleGraph).

import {annualCycleDataRequest} from '../../data-services/pcex-backend.js'
import {noGraphMessage} from '../../helpers/GraphHelpers.js'
import DailyGraph from '../DailyGraph/DailyGraph.js'
import VariableSelector from '../selectors/VariableSelector.js';
import ClimatologySelector from '../selectors/ClimatologySelector.js';
import React, {useState, useEffect} from 'react';
import _ from 'lodash';

function DailyDataDisplay({region, rasterMetadata, model, emission}){

  const [dailyTimeSeries, setDailyTimeSeries] = useState(null);
  const [variable, setVariable] = useState(null);
  const [climatology, setClimatology] = useState(null);

  const selectVariable = setVariable;
  
  const selectClimatology = setClimatology;
  
  function dontSelectVariable(event){
    //no-op, as cascading selection is not in use
  }
  
  function dontSelectClimatology(event) {
    // no-op, as cascading selection is not in use
  }
  
    useEffect(() => {
      if(region && variable && climatology && rasterMetadata) {
        const datafiles = _.filter(rasterMetadata, {
            'variable_id': variable.value.representative.variable_id,
            'experiment': emission,
            'model_id': model,
            'start_date': climatology.value.representative.start_date,
            'end_date': climatology.value.representative.end_date
            });
        
        const api_calls = _.map(datafiles, datafile => {
            return annualCycleDataRequest(region.boundary, datafile.file_id, 
                                   variable.value.representative.variable_id)
        });
        Promise.all(api_calls).then((api_responses)=> setDailyTimeSeries(api_responses));
      }
  }, [region, variable, model, emission, rasterMetadata, climatology]);


  return (
    <div className="DailyDataDisplay">
        <br/>
        {rasterMetadata ? 
          <VariableSelector 
            metadata={rasterMetadata}
            value={variable}
            canReplace={false}
            onChange={selectVariable}
            onNoChange={dontSelectVariable}
          /> : 
          "Loading Available Datasets"}
        <br/>
        {rasterMetadata ? 
          <ClimatologySelector 
            metadata={rasterMetadata}
            value={climatology}
            canReplace={false}
            onChange={selectClimatology}
            onNoChange={dontSelectClimatology}
          /> : 
          "Loading Available Datasets"}
        <br/>
        {dailyTimeSeries ? 
          <DailyGraph 
            annualData={dailyTimeSeries}
            variableInfo={variable.value}
          /> : 
          noGraphMessage({
                climatology: climatology,
                indicator: variable,
                watershed: region,
                })}
    </div>
  );  
}

export default DailyDataDisplay;