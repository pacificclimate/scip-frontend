// receives the user-selected area of interest, queries the PCEX API to retrieve a list
// of available, and then filters the variables by timescale (yearly, monthly, daily)
// and sends them to display components for each group.
// also handles user selection of model and scenario.

import {getMultimeta, flattenMultimeta} from '../../data-services/pcex-backend.js'
import React, {useState, useEffect} from 'react';
import YearlyDataDisplay from '../YearlyDataDisplay/YearlyDataDisplay.js'
import MonthlyDataDisplay from '../MonthlyDataDisplay/MonthlyDataDisplay.js'
import ModelSelector from '../selectors/ModelSelector.js'
import EmissionSelector from '../selectors/EmissionSelector.js'
import Tab from 'react-bootstrap/Tab'
import Tabs from 'react-bootstrap/Tabs'
import _ from 'lodash';

function DataDisplay({region}) {

  const [rasterMetadata, setRasterMetadata] = useState(null);
  const [model, setModel] = useState(null);
  const [emission, setEmission] = useState(null);
  
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
  
  function selectModel(event) {
      setModel(event.value);
  }
  
  function dontSelectModel(event){
    //TODO: put something here. Ask Rod what.
  }
  
  function selectEmission(event) {
      setEmission(event.value);
  }
  
  function dontSelectEmission(event){
    //TODO: put something here. Ask Rod what.
  }
  
  return (
    <div className="DataDisplay">
        <Tabs
          id="data-display-tabs"
          >
          <Tab eventKey="year" title="Yearly Indicators">
            {<YearlyDataDisplay
              region={region}
              model={model ? model.representative.model_id : "PCIC-HYDRO"}
              emission={emission? emission.representative.experiment : "historical, rcp85"}
              rasterMetadata={_.filter(rasterMetadata, {"timescale": "yearly"})}
            />}
          </Tab>
          <Tab eventKey="month" title="Monthly Indicators">
            {<MonthlyDataDisplay
              region={region}
              model={model ? model.representative.model_id : "PCIC-HYDRO"}
              emission={emission ? emission.representative.experiment : "historical, rcp85"}
              rasterMetadata={_.filter(rasterMetadata, {"timescale": "monthly"})}
            />}
          </Tab>
          <Tab eventKey="day" title="Daily Indicators">
            Daily data is not implemented yet.
          </Tab>
        </Tabs>
        {rasterMetadata ? 
          <div>
            <span>Climate Model</span>
            <ModelSelector 
              metadata={rasterMetadata}
              value={model ? model.representative : null}
              canReplace={false}
              onChange={selectModel}
              onNoChange={dontSelectModel}
            /> 
          </div> : 
          "Loading Available Datasets"}
        {rasterMetadata ?
          <div>
            <span> Emmissions Scenario</span> 
            <EmissionSelector 
              metadata={rasterMetadata}
              value={emission ? emission.representative : null}
              canReplace={false}
              onChange={selectEmission}
              onNoChange={dontSelectEmission}
            />
          </div> : 
          "Loading Available Datasets"}
    </div>
  );
}

export default DataDisplay;