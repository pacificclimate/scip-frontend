// Fetches data and handles user selection for monthly-resolution indicators.
// Receives an area, a model, an emissions scenario, and a list of available
// datasets from its parent (DataDisplay) prefiltered to monthly-only,
// displays an indicator-selection  dropdown (VariableSelector)
// and a graph (AnnualCycleGraph).

import React, { useState, useEffect } from 'react';
import _ from 'lodash';
import { annualCycleDataRequest } from '../../data-services/pcex-backend.js';
import { noGraphMessage, noCommasExperiment } from '../../helpers/GraphHelpers.js';
import useStore from '../../store/useStore.js';
import AnnualCycleGraph from '../AnnualCycleGraph/AnnualCycleGraph.js';
import VariableSelector from '../selectors/VariableSelector.js';

function MonthlyDataDisplay({
  region, rasterMetadata, model, emission,
}) {
  const [annualCycleTimeSeries, setAnnualCycleTimeSeries] = useState(null);
    
  const storeVariable = useStore((state) => state.setMonthlyIndicator);
  const variable = useStore((state) => state.monthlyIndicator);
  const viewOutletIndicators = useStore((state) => state.viewOutletIndicators);

  
  function dontSelectVariable(event) {
    // no-op, as we are not using cascading selection
  }

  useEffect(() => {
    if (region && variable && rasterMetadata) {
      const area = viewOutletIndicators ? JSON.parse(region.outlet) : region.boundary;
      const datafiles = _.filter(rasterMetadata, {
        variable_id: variable.value.representative.variable_id,
        experiment: emission,
        model_id: model,
      });

      const api_calls = _.map(datafiles, (datafile) => annualCycleDataRequest(
        area,
        datafile.file_id,
        variable.value.representative.variable_id,
      ));
      Promise.all(api_calls).then((api_responses) => setAnnualCycleTimeSeries(api_responses));
    }
  }, [region, variable, model, emission, rasterMetadata, viewOutletIndicators]);

  const graphMetadata = {
    area: region ? region.name : 'no region selected',
    'climate model': model,
    emission: noCommasExperiment(emission),
  };

  return (
    <div className="MonthlyDataDisplay">
      <br />
      {rasterMetadata
        ? (
          <VariableSelector
            metadata={rasterMetadata}
            value={variable}
            canReplace={false}
            onChange={storeVariable}
            onNoChange={dontSelectVariable}
          />
        )
        : 'Loading Available Datasets'}
      <br />
      {annualCycleTimeSeries
        ? (
          <AnnualCycleGraph
            annualData={annualCycleTimeSeries}
            variableInfo={variable.value}
            graphMetadata={graphMetadata}
          />
        )
        : noGraphMessage({
          region: region,
          indicator: variable,
        })}
    </div>
  );
}

export default MonthlyDataDisplay;
