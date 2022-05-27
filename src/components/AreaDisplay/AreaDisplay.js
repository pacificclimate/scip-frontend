import {fetchWatersheds} from '../../data-services/regions.js'
import AreaSelector from '../AreaSelector/AreaSelector.js'
import React, {useState} from 'react';
import {findIndex} from 'lodash';

function AreaDisplay({onChangeRegionName, onChangeRegionBoundary, onChangeWatershedMouth}) {

  const [regionNames, setRegionNames] = useState([]);
  const [regionBoundaries, setRegionBoundaries] = useState([]);
  const [currentRegionName, setCurrentRegionName] = useState("No Region Selected");
  const [currentRegionBoundary, setCurrentRegionBoundary] = useState(null);
  const [regionAreas, setRegionAreas] = useState();
  const [currentRegionArea, setCurrentRegionArea] = useState();
  const [watershedStreams, setWatershedStreams] = useState([]);
  const [currentWatershedStreams, setCurrentWatershedStreams] = useState(null);

  //fetch region list from geoserver if we don't already have it.
  if (regionNames.length === 0){
    fetchWatersheds().then(
        data => {
            var names = [];
            var boundaries = [];
            var areas = [];
            var streams = [];
            for (const feature of data.features){
                names.push(feature.properties.WTRSHDGRPN);
                boundaries.push(feature.geometry);

                if(feature.properties.OUTLET === ""){
                  streams.push(null);
                }
                else streams.push(JSON.parse(feature.properties.OUTLET));
                
                let area = feature.properties.AREA_SQM;
                if (typeof(area) === 'number'){
                  let areaKM = area / 1000000;
                  areas.push(areaKM);
                }
                else {
                  areas.push(0)
                }
            } 
            setRegionNames(names);
            setRegionBoundaries(boundaries);
            setRegionAreas(areas);
            setWatershedStreams(streams);
        }
    );
  }
  
  function setRegion(event) {
      setCurrentRegionName(event.value);
      onChangeRegionName(event.value);
      const boundary = regionBoundaries[findIndex(regionNames, (n) => {return n === event.value;})];
      setCurrentRegionBoundary(boundary);
      onChangeRegionBoundary(boundary);

      const mouth = watershedStreams[findIndex(regionNames, (n) => {return n === event.value;})];
      setCurrentWatershedStreams(mouth);
      onChangeWatershedMouth(mouth);

      setCurrentRegionArea(regionAreas[findIndex(regionNames, (n) => {return n === event.value;})]);
  };
    
  return (
    <div className="AreaDisplay">
        <p>Currently selected Region: {currentRegionName}</p>
        {currentRegionArea ? <p>Drainage Area: {currentRegionArea.toExponential(2)} km&sup2;</p> : ""}
        <AreaSelector
            regionNames={regionNames}
            onChange={setRegion}
            currentRegion={currentRegionName}
        />
    </div>
  );
}

export default AreaDisplay;