import './MapDisplay.css';
import DataMap from '../DataMap/DataMap.js'
import {getWatershedStreams} from '../../data-services/pcex-backend.js'
import React, {useState} from 'react';

function MapDisplay({currentRegionBoundary, currentWatershedStreams}) {
  
  const [watershedStreams, setWatershedStreams] = useState(null);
  const [prevStreams, setPrevStreams] = useState(null);
  
  if(prevStreams !== currentWatershedStreams){ 
    if (currentWatershedStreams === null) {
      setWatershedStreams("");
    }
    else{
      getWatershedStreams(currentWatershedStreams).then(data => {
          setWatershedStreams(data);
          }
      );
    }
    setPrevStreams(currentWatershedStreams);
  }

  return (
    <div className="MapDisplay">
        <DataMap
          currentRegionBoundary={currentRegionBoundary}
          currentWatershedStreams={watershedStreams}
        />
    </div>
  );
}

export default MapDisplay;