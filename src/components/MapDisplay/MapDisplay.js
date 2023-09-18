// Handles map state and data fetching.

import './MapDisplay.css';
import DataMap from '../DataMap/DataMap.js'
import {getDownstream} from '../../data-services/pcex-backend.js'
import React, {useState, useEffect} from 'react';
import {validPoint} from '../../helpers/GeographyHelpers.js';

function MapDisplay({region, onSelectOutlet, selectedOutlet}) {
  
  const [downstream, setDownstream] = useState(null);
  
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
          downstream={downstream}
          onSelectOutlet={handleSelectOutlet}
          selectedOutlet={selectedOutlet}
        />
    </div>
  );
}

export default MapDisplay;