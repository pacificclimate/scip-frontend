import './AreaController.css';
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
            console.log(data.features);
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
      console.log("setting region");
      console.log(event);
      setCurrentRegionName(event);
      onChangeRegionName(event);
      const index = findIndex(regionNames, (n) => {return n == event;});
      console.log("regionNames in setRegion");
      console.log(regionNames);
      console.log("index is");
      console.log(event);
      const boundary = regionBoundaries[findIndex(regionNames, (n) => {return n == event;})];
      console.log("boundary is");
      console.log(boundary);
      setCurrentRegionBoundary(boundary);
      onChangeRegionBoundary(boundary);
  };
  
  console.log("regionNames");
  console.log(regionNames);
  console.log("regionBoundaries");
  console.log(regionBoundaries);
  
  return (
    <div className="AreaController">
        This will let you select and see categorical metadata about an area.
        Currently slected Region: {currentRegionName}
        <AreaSelector
            regionNames={regionNames}
            onChange={setRegion}
            currentRegion={currentRegionName}
        />
    </div>
  );
}

export default AreaController;