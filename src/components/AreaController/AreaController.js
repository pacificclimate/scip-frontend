import {fetchWatersheds} from '../../data-services/regions.js'
import AreaSelector from '../AreaSelector/AreaSelector.js'
import React, {useState} from 'react';
import {findIndex} from 'lodash';

function AreaController({onChangeRegionName, onChangeRegionBoundary}) {

  const [regionNames, setRegionNames] = useState([]);
  const [regionBoundaries, setRegionBoundaries] = useState([]);
  const [currentRegionName, setCurrentRegionName] = useState("No Region Selected");
  const [currentRegionBoundary, setCurrentRegionBoundary] = useState(null)

  //fetch region list from geoserver if we don't already have it.
  if (regionNames.length === 0){
    fetchWatersheds().then(
        data => {
            var names = [];
            var boundaries = [];
            for (const feature of data.features){
                names.push(feature.properties.WTRSHDGRPN);
                boundaries.push(feature.geometry)
            } 
            setRegionNames(names);
            setRegionBoundaries(boundaries);        
        }
    );
  }
  
  function setRegion(event) {
      setCurrentRegionName(event);
      onChangeRegionName(event);
      const index = findIndex(regionNames, (n) => {return n == event;});
      const boundary = regionBoundaries[findIndex(regionNames, (n) => {return n == event;})];
      setCurrentRegionBoundary(boundary);
      onChangeRegionBoundary(boundary);
  };
    
  return (
    <div className="AreaController">
        Currently selected Region: {currentRegionName}
        <AreaSelector
            regionNames={regionNames}
            onChange={setRegion}
            currentRegion={currentRegionName}
        />
    </div>
  );
}

export default AreaController;