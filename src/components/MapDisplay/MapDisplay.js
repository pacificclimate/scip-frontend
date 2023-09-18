// Handles map state and data fetching.

import './MapDisplay.css';
import DataMap from '../DataMap/DataMap.js'
import {getWatershedStreams, getDownstream} from '../../data-services/pcex-backend.js'
import React, {useState, useEffect} from 'react';
import {validPoint} from '../../helpers/GeographyHelpers.js';

function MapDisplay({region, onSelectOutlet, selectedOutlet}) {
  
  const [watershedStreams, setWatershedStreams] = useState(null);
  const [downstream, setDownstream] = useState(null);

  // fetch stream data from the PCEX APIs, watershedstreams and downstream.
  useEffect(() => {
      if(region && validPoint(region.outlet)) {
        getWatershedStreams(JSON.parse(region.outlet)).then(data => {
            setWatershedStreams(data);
            }
        );
      }
      else { // region with no valid outlet - display no stream data
          setWatershedStreams(null);
      }
  }, [region]);
  
    useEffect(() => {
      if(region && validPoint(region.outlet)) {
        getDownstream(JSON.parse(region.outlet)).then(data => {
            setDownstream(data);
        });
      }
      else { //region with no valid outlet - display no stream data
          setDownstream(null);
      }
  }, [region]);
  
  function handleSelectOutlet(point) {
      //just pass it up to the parent.
      onSelectOutlet(point);
  }

  return (
    <div className="MapDisplay">
        <DataMap
          regionBoundary={region ? region.boundary : null}
          watershedStreams={watershedStreams}
          downstream={downstream}
          onSelectOutlet={handleSelectOutlet}
          selectedOutlet={selectedOutlet}
        />
    </div>
  );
}

export default MapDisplay;