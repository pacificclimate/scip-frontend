// AreaDisplay - interfaces with the SCIP API to get information about predefined areas
// (watersheds, conservation units, drainage basins, etc); lets the user select the
// area they care about; displays categorical data about the selected area 

import {getWatersheds} from '../../data-services/scip-backend.js';
import AreaSelector from '../AreaSelector/AreaSelector.js';
import React, {useState, useEffect} from 'react';
import {map, find} from 'lodash';
import {parseRegions, filterRegions} from '../../helpers/GeographyHelpers.js';

function AreaDisplay({onChangeRegion, region}) {
  const [regions, setRegions] = useState([]);
  const [selectedRegion, setSelectedRegion] = useState([]);

  //fetch region list from the API.
  // this only needs to be done once, when the component is loaded
  useEffect(() => {
    if(regions.length === 0) {
        getWatersheds().then(
            data => {
                setRegions(filterRegions(parseRegions(data)));
            }
        );
    }
  });
  
  function setRegion(event) {
      const region = find(regions, function(r) {return r.name === event.value});
      setSelectedRegion(event);
      
      onChangeRegion(region);
  };
    
  return (
    <div className="AreaDisplay">
        <AreaSelector
            regionNames={map(regions, 'name')}
            onChange={setRegion}
            currentRegion={selectedRegion}
        />
    </div>
  );
}

export default AreaDisplay;