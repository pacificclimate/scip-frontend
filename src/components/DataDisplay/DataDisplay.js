// receives the user-selected area of interest, queries the PCEX API to retrieve a list
// of available, and then filters the variables by timescale (yearly, monthly, daily)
// and sends them to display components for each group.
// also handles user selection of model and sceanrio.

import {getMultimeta, flattenMultimeta} from '../../data-services/pcex-backend.js'
import React, {useState, useEffect} from 'react';
import YearlyDataDisplay from '../YearlyDataDisplay/YearlyDataDisplay.js'
import MonthlyDataDisplay from '../MonthlyDataDisplay/MonthlyDataDisplay.js'
import _ from 'lodash';

function DataDisplay({region}) {
  
  const [monthlyTimeSeries, setMonthlyTimeSeries] = useState(null);
  const [rasterMetadata, setRasterMetadata] = useState(null);
  
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
  
  return (
    <div className="DataDisplay">
        {<YearlyDataDisplay
          region={region}
          model={"CanESM2"}
          emission={"historical, rcp85"}
          rasterMetadata={_.filter(rasterMetadata, {"timescale": "yearly"})}
        />}
        {<MonthlyDataDisplay
          region={region}
          model={"CanESM2"}
          emission={"historical, rcp85"}
          rasterMetadata={_.filter(rasterMetadata, {"timescale": "monthly"})}
        />}

    </div>
  );
}

export default DataDisplay;