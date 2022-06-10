// Handles map state and data fetching.

import './MapDisplay.css';
import DataMap from '../DataMap/DataMap.js'
import {getWatershedStreams, getDownstream} from '../../data-services/pcex-backend.js'
import React, {useState} from 'react';

function MapDisplay({region}) {
  
  const [watershedStreams, setWatershedStreams] = useState(null);
  const [downstream, setDownstream] = useState(null);
  const [prevRegion, setPrevRegion] = useState(null);

  if(prevRegion !== region){
    if (region === null) {
      setWatershedStreams("");
      setDownstream("");
    }
    else if(region) {
      getWatershedStreams(JSON.parse(region.outlet)).then(data => {
          setWatershedStreams(data);
          }
      );
      getDownstream(JSON.parse(region.outlet)).then(data => {
          setDownstream(data);
      });
    }
    setPrevRegion(region);
  }

  return (
    <div className="MapDisplay">
        <DataMap
          regionBoundary={region ? region.geometry : null}
          watershedStreams={watershedStreams}
          downstream={downstream}
        />
    </div>
  );
}

export default MapDisplay;