// Fetches data and handles user selection for daily-resolution indicators.
// Receives an area, a model, an emissions scenario, and a list of available 
// datasets from its parent (DataDisplay) prefiltered to daily-only, 
// displays an indicator-selection  dropdown (VariableSelector), 
// a climatology dropdown (ClimatologySelector), 
// and a graph (AnnualCycleGraph).

import {annualCycleDataRequest} from '../../data-services/pcex-backend.js'
import DailyGraph from '../DailyGraph/DailyGraph.js'
import VariableSelector from '../selectors/VariableSelector.js';
import ClimatologySelector from '../selectors/ClimatologySelector.js';
import React, {useState, useEffect} from 'react';
import _ from 'lodash';

function DailyDataDisplay({region, rasterMetadata, model, emission}){

  const [dailyTimeSeries, setDailyTimeSeries] = useState(null);
  const [variable, setVariable] = useState(null);
  const [climatology, setClimatology] = useState(null);

  function selectVariable(event) {
      setVariable(event.value);
  }
  
  function selectClimatology(event) {
      setClimatology(event.value);
  }
  
  function dontSelectVariable(event){
    //TODO: put something here. Ask Rod what.
  }
  
  function dontSelectClimatology(event) {
      // TODO: put something here. Ask Rod what.
  }
  
    useEffect(() => {
      if(region && variable && climatology && rasterMetadata) {
        const datafiles = _.filter(rasterMetadata, {
            'variable_id': variable.representative.variable_id,
            'experiment': emission,
            'model_id': model,
            'start_date': climatology.representative.start_date,
            'end_date': climatology.representative.end_date
            });
        
        var api_calls = [];
        _.forEach(datafiles, function(datafile) {
            api_calls.push( annualCycleDataRequest(region.geometry, 
                                                   datafile.file_id, 
                                                   variable.representative.variable_id))});
        Promise.all(api_calls).then((api_responses)=> setDailyTimeSeries(api_responses));
      }
  }, [region, variable, model, emission, rasterMetadata, climatology]);
  
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
    <div className="DailyDataDisplay">
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
        {rasterMetadata ? 
          <ClimatologySelector 
            metadata={rasterMetadata}
            value={climatology ? climatology.representative : null}
            canReplace={false}
            onChange={selectClimatology}
            onNoChange={dontSelectClimatology}
          /> : 
          "Loading Available Datasets"}
        <br/>
        {dailyTimeSeries ? 
          <DailyGraph 
            annualData={dailyTimeSeries}
            variableInfo={variable}
          /> : 
          noGraphMessage()}
    </div>
  );  
}

export default DailyDataDisplay;