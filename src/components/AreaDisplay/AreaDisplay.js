// AreaDisplay - interfaces with geoserver to get information about predefined areas
// (watersheds, conservation units, drainage basins, etc); lets the user select the
// area they care about; displays categorical data about the selected area (accessed from
//  geoserver).

import {fetchWatersheds} from '../../data-services/regions.js';
import AreaSelector from '../AreaSelector/AreaSelector.js';
import React, {useState, useEffect} from 'react';
import {map, find} from 'lodash';
import {parseRegion, filterRegions} from '../../helpers/RegionHelpers.js';

function AreaDisplay({onChangeRegion, region}) {
  const [regions, setRegions] = useState([]);

  //fetch region list from geoserver.
  // this only needs to be done once, when the component is loaded
  useEffect(() => {
    if(regions.length === 0) {
        fetchWatersheds().then(
            data => {
                setRegions(filterRegions(map( data.features, parseRegion)));
            }
        );
    }
  });
  
  function setRegion(event) {
      const region = find(regions, function(r) {return r.name === event.value});
      
      onChangeRegion(region);
  };
    
  return (
    <div className="AreaDisplay">
        <p>Currently Selected Region: {region ? region.name : "none"}</p>
        {region ? <p>Drainage Area: {(region.area_meters / 1000000).toExponential(2)} km&sup2;</p> : ""}
        <AreaSelector
            regionNames={map(regions, 'name')}
            onChange={setRegion}
            currentRegion={region ? region.name : null}
        />
    </div>
  );
}

export default AreaDisplay;