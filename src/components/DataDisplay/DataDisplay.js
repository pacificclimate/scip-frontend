// receives the user-selected area of interest, queries the PCEX API to retrieve a list
// of available, and then filters the variables by timescale (yearly, monthly, daily)
// and sends them to display components for each group.
// also handles user selection of model and scenario.

import {getMultimeta, flattenMultimeta} from '../../data-services/pcex-backend.js'
import React, {useState, useEffect} from 'react';
import useStore from '../../store/useStore.js'
import YearlyDataDisplay from '../YearlyDataDisplay/YearlyDataDisplay.js'
import MonthlyDataDisplay from '../MonthlyDataDisplay/MonthlyDataDisplay.js'
import DailyDataDisplay from '../DailyDataDisplay/DailyDataDisplay.js'
import PopulationDisplay from '../PopulationDisplay/PopulationDisplay.js'
import ModelSelector from '../selectors/ModelSelector.js'
import EmissionSelector from '../selectors/EmissionSelector.js'
import Tab from 'react-bootstrap/Tab'
import Tabs from 'react-bootstrap/Tabs'
import _ from 'lodash';

function DataDisplay({region}) {

  const [rasterMetadata, setRasterMetadata] = useState(null);

  const storeModel = useStore((state) => state.setModel);
  const model = useStore((state) => state.model);
  
  const storeEmission = useStore((state) => state.setEmission);
  const emission = useStore((state) => state.emission);
  
  // stores which tab or graph is active, for the benefit of the map, which changes
  // displayed map data to match currently visible graph.
  const setGraphTab = useStore((state) => state.setGraphTab);

  
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
  
  function dontSelectModel(event){
    //no-op, as we are not using cascading selection 
  }

  
  function dontSelectEmission(event){
    //no-op, as we are not using cascading selection
  }
  
  function handleTabSwitch(tab) {
    if(tab !== "population") {
        setGraphTab(tab);
        }
    }

  return (
    <div className="DataDisplay">
        <Tabs
          onSelect={handleTabSwitch}
          id="data-display-tabs"
          >
          <Tab eventKey="year" title="Yearly Indicators">
            {<YearlyDataDisplay
              region={region}
              model={model ? model.value.representative.model_id : "PCIC-HYDRO"}
              emission={emission? emission.value.representative.experiment : "historical, rcp85"}
              rasterMetadata={_.filter(rasterMetadata, {"timescale": "yearly"})}
            />}
          </Tab>
          <Tab eventKey="month" title="Monthly Indicators">
            {<MonthlyDataDisplay
              region={region}
              model={model ? model.value.representative.model_id : "PCIC-HYDRO"}
              emission={emission ? emission.value.representative.experiment : "historical, rcp85"}
              rasterMetadata={_.filter(rasterMetadata, {"timescale": "monthly"})}
            />}
          </Tab>
          <Tab eventKey="day" title="Daily Indicators">
            {<DailyDataDisplay
              region={region}
              model={model ? model.value.representative.model_id : "PCIC-HYDRO"}
              emission={emission ? emission.value.representative.experiment : "historical, rcp85"}
              rasterMetadata={_.filter(rasterMetadata, {"timescale": "daily"})}
            />}
          </Tab>
          <Tab eventKey="population" title="Salmon Populations">
            {<PopulationDisplay
              region={region}
            />}
          </Tab>
        </Tabs>
        {rasterMetadata ? 
          <div>
            <span>Climate Model</span>
            <ModelSelector 
              metadata={rasterMetadata}
              value={model}
              canReplace={false}
              onChange={storeModel}
              onNoChange={dontSelectModel}
            /> 
          </div> : 
          "Loading Available Datasets"}
        {rasterMetadata ?
          <div>
            <span> Emmissions Scenario</span> 
            <EmissionSelector 
              metadata={rasterMetadata}
              value={emission}
              canReplace={false}
              onChange={storeEmission}
              onNoChange={dontSelectEmission}
            />
          </div> : 
          "Loading Available Datasets"}
    </div>
  );
}

export default DataDisplay;