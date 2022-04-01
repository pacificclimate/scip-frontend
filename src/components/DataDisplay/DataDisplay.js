import {testDataRequest, testLongTermAverageDataRequest} from '../../data-services/pcex-backend.js'
import AnnualCycleGraph from '../AnnualCycleGraph/AnnualCycleGraph.js'
import LongTermAverageGraph from '../LongTermAverageGraph/LongTermAverageGraph.js'
import React, {useState} from 'react';
//import moment from 'moment/moment';


function DataDisplay({currentRegionBoundary}) {
  
  const [monthlyTimeSeries, setMonthlyTimeSeries] = useState(null);
  const [longTermTimeSeries, setLongTermTimeSeries] = useState(null);
  const [prevRegion, setPrevRegion] = useState(null);
  
  // fetch data and format it  - currently just displaying as text.
  if(prevRegion !== currentRegionBoundary){ 
    testDataRequest(currentRegionBoundary).then(data => {
        setMonthlyTimeSeries(data);
        }
    );
    testLongTermAverageDataRequest(currentRegionBoundary).then(data => {
        setLongTermTimeSeries(data);
        }
    );
    setPrevRegion(currentRegionBoundary);
  }
  
  /* function monthlyTimeseriesText() {
      //test function that just dispays data as text.
      if(monthlyTimeSeries === null) {
          return "No data available";
      }
      else {
        var dataStrings = [];
        for (const timestamp in monthlyTimeSeries.data) {
            const month = moment(timestamp, moment.ISO_8601).format("MMMM");
            dataStrings.push(<p>{month}: {monthlyTimeSeries.data[timestamp]} {monthlyTimeSeries.units}</p>)
        }
        return dataStrings;
      }
  }  */

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