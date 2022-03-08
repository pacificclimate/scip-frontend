import {testDataRequest} from '../../data-services/pcex-backend.js'
import React, {useState} from 'react';
import moment from 'moment/moment';


function DataController({currentRegionBoundary}) {
  
  const [monthlyTimeSeries, setMonthlyTimeSeries] = useState(null);
  const [prevRegion, setPrevRegion] = useState(null);
  
  // fetch data and format it  - currently just displaying as text.
  if(prevRegion !== currentRegionBoundary){ 
    testDataRequest(currentRegionBoundary).then(data => {
        setMonthlyTimeSeries(data);
        }
    );
    setPrevRegion(currentRegionBoundary);
  }
  
  function monthlyTimeseriesText() {
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
  }  
  return (
    <div className="DataController">
        <br/>
        {monthlyTimeseriesText()}
    </div>
  );
}

export default DataController;