// Fetches data and handles user selection for yearly-resolution indicators.
// Receives an area, a model, an emissions scenario, and a list of available
// datasets from its parent (DataDisplay), displays an indicator-selection
// dropdown (VariableSelector) and a graph (LongTermAverageGraph).

import React, { useState, useEffect } from 'react';
import { longTermAverageDataRequest } from '../../data-services/pcex-backend.js';
import useStore from '../../store/useStore.js';
import { noGraphMessage, noCommasExperiment } from '../../helpers/GraphHelpers.js';
import LongTermAverageGraph from '../LongTermAverageGraph/LongTermAverageGraph.js';
import VariableSelector from '../selectors/VariableSelector.js';

function YearlyDataDisplay({
  region, rasterMetadata, model, emission,
}) {
  const [longTermTimeSeries, setLongTermTimeSeries] = useState(null);

  const storeVariable = useStore((state) => state.setYearlyIndicator);
  const variable = useStore((state) => state.yearlyIndicator);
  const viewOutletIndicators = useStore((state) => state.viewOutletIndicators);

  
  function dontSelectVariable(event) {
    // nothing happens here, as we are not using cascading selection
  }

  useEffect(() => {
    if (region && variable) {
      const area = viewOutletIndicators ? JSON.parse(region.outlet) : region.boundary;
      longTermAverageDataRequest(
        area,
        variable.value.representative.variable_id,
        model,
        emission,
        'yearly',
        0,
      ).then((data) => {
        setLongTermTimeSeries(data);
      });
    }
  }, [region, variable, model, emission, viewOutletIndicators]);

  const graphMetadata = {
    area: region ? region.name : 'no region selected',
    'climate model': model,
    emission: noCommasExperiment(emission),
  };

  return (
    <div className="YearlyDataDisplay">
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
      {longTermTimeSeries
        ? (
          <LongTermAverageGraph
            longTermData={longTermTimeSeries}
            variableInfo={variable.value}
            region={region}
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

export default YearlyDataDisplay;
