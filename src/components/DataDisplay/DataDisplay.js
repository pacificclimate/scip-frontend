// receives the user-selected area of interest, queries the PCEX API to retrieve data
// about indicators in that area, displays graphs of the results. Currently only displays
// maximum temperature graphs.
// currently the graphs are AnnualCycleGraph (timeseries API) and LongTermAverageGraph (data API).


import {testDataRequest, testLongTermAverageDataRequest, getMultimeta, flattenMultimeta} from '../../data-services/pcex-backend.js'
import AnnualCycleGraph from '../AnnualCycleGraph/AnnualCycleGraph.js'
import LongTermAverageGraph from '../LongTermAverageGraph/LongTermAverageGraph.js'
import React, {useState, useEffect} from 'react';

function DataDisplay({region}) {
  
  const [monthlyTimeSeries, setMonthlyTimeSeries] = useState(null);
  const [longTermTimeSeries, setLongTermTimeSeries] = useState(null);
  const [rasterMetadata, setRasterMetadata] = useState(null);
  
  // fetch list of available datasets
  useEffect(() => {
    //only needs to be done once
    if(!rasterMetadata) {
        getMultimeta().then(data => {
            setRasterMetadata(flattenMultimeta(data));
            console.log("updating rasterMetadata");
            console.log(rasterMetadata);      
        })
        }
    }
  );
  
  
  // fetch data and format it as graphs.
  // currently one call to each of the 'data' and 'timeseries' APIs. 
  useEffect(() => {
      if(region) {
        testDataRequest(region.geometry).then(data => {
            setMonthlyTimeSeries(data);
        });
      }
  }, [region]);
  
    useEffect(() => {
      if(region) {
        testLongTermAverageDataRequest(region.geometry).then(data => {
            setLongTermTimeSeries(data);
        });
      }
  }, [region]);
  
  return (
    <div className="DataDisplay">
        <br/>
        {monthlyTimeSeries ? <AnnualCycleGraph annualData={monthlyTimeSeries}/> : "No Annual Data Available"}
        <br/>
        {longTermTimeSeries ? <LongTermAverageGraph longTermData={longTermTimeSeries}/> : "No Long Term Data Available"}
    </div>
  );
}

export default DataDisplay;