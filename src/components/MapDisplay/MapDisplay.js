// Handles map state and data fetching.

import './MapDisplay.css';
import DataMap from '../DataMap/DataMap.js'
import {getWatershedStreams, getDownstream} from '../../data-services/pcex-backend.js'
import React, {useState, useEffect} from 'react';

function MapDisplay({region}) {
  
  const [watershedStreams, setWatershedStreams] = useState(null);
  const [downstream, setDownstream] = useState(null);

  // fetch stream data from the PCEX APIs, watershedstreams and downstream.
  useEffect(() => {
      if(region && region.outlet) {
        getWatershedStreams(JSON.parse(region.outlet)).then(data => {
            setWatershedStreams(data);
            }
        );
      }
  }, [region]);
  
    useEffect(() => {
      if(region && region.outlet) {
        getDownstream(JSON.parse(region.outlet)).then(data => {
            setDownstream(data);
        });
      }
  }, [region]);
  

  return (
    <div className="MapDisplay">
        <DataMap
          regionBoundary={region ? region.boundary : null}
          watershedStreams={watershedStreams}
          downstream={downstream}
        />
    </div>
  );
}

export default MapDisplay;