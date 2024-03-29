// Fetches data and handles user selection for daily-resolution indicators.
// Receives an area, a model, an emissions scenario, and a list of available
// datasets from its parent (DataDisplay) prefiltered to daily-only,
// displays an indicator-selection  dropdown (VariableSelector),
// a climatology dropdown (ClimatologySelector),
// and a graph (AnnualCycleGraph).

import React, { useState, useEffect } from 'react';
import _ from 'lodash';
import useStore from '../../store/useStore.js';
import { annualCycleDataRequest } from '../../data-services/pcex-backend.js';
import { noGraphMessage, noCommasExperiment } from '../../helpers/GraphHelpers.js';
import DailyGraph from '../DailyGraph/DailyGraph.js';
import VariableSelector from '../selectors/VariableSelector.js';
import ClimatologySelector from '../selectors/ClimatologySelector.js';

function DailyDataDisplay({
  region, rasterMetadata, model, emission,
}) {
  const [dailyTimeSeries, setDailyTimeSeries] = useState(null);
  const [climatology, setClimatology] = useState(null);
  
  const storeVariable = useStore((state) => state.setDailyIndicator);
  const variable = useStore((state) => state.dailyIndicator);
  const viewOutletIndicators = useStore((state) => state.viewOutletIndicators);

  const selectClimatology = setClimatology;

  function dontSelectVariable(event) {
    // no-op, as cascading selection is not in use
  }

  function dontSelectClimatology(event) {
    // no-op, as cascading selection is not in use
  }

  useEffect(() => {
    if (region && variable && climatology && rasterMetadata) {
      const area = viewOutletIndicators ? JSON.parse(region.outlet) : region.boundary;
      const datafiles = _.filter(rasterMetadata, {
        variable_id: variable.value.representative.variable_id,
        experiment: emission,
        model_id: model,
        start_date: climatology.value.representative.start_date,
        end_date: climatology.value.representative.end_date,
      });

      const api_calls = _.map(datafiles, (datafile) => annualCycleDataRequest(
        area,
        datafile.file_id,
        variable.value.representative.variable_id,
      ));
      Promise.all(api_calls).then((api_responses) => setDailyTimeSeries(api_responses));
    }
  }, [region, variable, model, emission, rasterMetadata, climatology, viewOutletIndicators]);

  const graphMetadata = {
    area: region ? region.name : 'no region selected',
    'climate model': model,
    emission: noCommasExperiment(emission),
    climatology: climatology ? climatology.label : 'no climatology selected',
  };

  return (
    <div className="DailyDataDisplay">
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
      {rasterMetadata
        ? (
          <ClimatologySelector
            metadata={rasterMetadata}
            value={climatology}
            canReplace={false}
            onChange={selectClimatology}
            onNoChange={dontSelectClimatology}
          />
        )
        : 'Loading Available Datasets'}
      <br />
      {dailyTimeSeries
        ? (
          <DailyGraph
            annualData={dailyTimeSeries}
            variableInfo={variable.value}
            graphMetadata={graphMetadata}
          />
        )
        : noGraphMessage({
          climatology,
          indicator: variable,
          region: region,
        })}
    </div>
  );
}

export default DailyDataDisplay;
