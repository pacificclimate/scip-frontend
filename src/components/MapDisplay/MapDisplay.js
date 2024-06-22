// Handles map state and layout.
// This component mostly passes props around. It should shrink as
// more state is moved into zustand.
//
// MapDisplay "owns" mapDataset and which is set by its child
// MapControls and consumed by its other child DataMap
//
// Its child DataMap also sets selectedOutlet, which MapDisplay
// passes upwards to App for eventual consumption by AreaDisplay.
//
// It receives region (set by AreaDisplay) from its parent
// App and passes it to its child DataMap.

import './MapDisplay.css';
import DataMap from '../DataMap/DataMap.js'
import {getDownstream} from '../../data-services/pcex-backend.js'
import MapControls from '../MapControls/MapControls.js';
import React, {useState, useEffect} from 'react';
import {validPoint} from '../../helpers/GeographyHelpers.js';

function MapDisplay({region, onSelectOutlet, selectedOutlet}) {
  
  const [downstream, setDownstream] = useState(null);
  const [mapDataset, setMapDataset] = useState(null);

  // fetch downstream data from the PCEX API
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


  function handleDatasetChange(dataset) {
      setMapDataset(dataset);
  }


  return (
    <div className="MapDisplay">
        <DataMap
          regionBoundary={region ? region.boundary : null}
          downstream={downstream}
          onSelectOutlet={handleSelectOutlet}
          selectedOutlet={selectedOutlet}
          dataset={mapDataset}
        />
        <MapControls
          onChange={handleDatasetChange}
          mapDataset={mapDataset}
        />
    </div>
  );
}

export default MapDisplay;