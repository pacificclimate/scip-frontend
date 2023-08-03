// AreaDisplay - interfaces with the SCIP API to get information about predefined areas
// (watersheds, conservation units, drainage basins, etc); lets the user select the
// area they care about; displays categorical data about the selected area 

import {getWatersheds, getBasins} from '../../data-services/scip-backend.js';
import AreaSelector from '../AreaSelector/AreaSelector.js';
import React, {useState, useEffect} from 'react';
import {map, find} from 'lodash';
import {parseRegions, filterRegions} from '../../helpers/GeographyHelpers.js';

function AreaDisplay({onChangeRegion, region}) {
  const [regions, setRegions] = useState([]);
  
  const [basins, setBasins] = useState([]);
  const [selectedBasin, setSelectedBasin] = useState(null);
  
  const [watersheds, setWatersheds] = useState([]);
  const [selectedWatershed, setSelectedWatershed] = useState([]);


  const [conservationUnits, setConservationUnits] = useState([]);
  const [selectedConservationUnit, setSelectedConservationUnit] = useState([]);


  
  const [selectedRegion, setSelectedRegion] = useState([]);
 
  // Hooks for this component are a little complex
  // This component allows a user to select a "region" and the rest of the app
  // (maps, graphs) will provide information based on what was selected. The 
  // rest of the app is passed region informal by the onChangeRegion callback
  // function.
  // This particular component understands three kinds of "region" - "basins", 
  // "conservation units", and "watersheds". Basins represent large river systems
  // like the Nass or Columbia; watersheds represent a stream network as defined by the 
  // BC Freshwater Atlas, and Conservation Units represent the location where a
  // particular salmon species lives.
  // While other components don't know or care what kind of "region" a user has selected,
  // this component has some extra hooks relating to the hierarchical nature of
  // region selection. A "basin" contains many "watersheds" and "conservation units"
  // and when a user selects a basin, in addition to that basin being made the selected 
  // region and broadcast to the rest of the app, the conservation unit and watershed
  // selector are updated to include only regions in that basin. This is to help a user 
  // find the conservation unit or watershed they care about - they may not know its
  // official name, but they probably know what river system it's part of.

  // fetch basin list from the API.
  // this only needs to be done once, when the component is loaded
  useEffect(() => {
      if(basins.length === 0) {
          getBasins().then(
            data => {
                setBasins(parseRegions(data));
            }  
          );
      }
  });
  
  // returns a region given its kind and name
  function findRegion(kind, name) {
      const regionList = {
        "conservationUnit": conservationUnits,
        "basin": basins,
        "watershed": watersheds
        }[kind];
        
        return find(regionList, function(r) {return r.name === name});
  }


  function setBasin(event){
    const basin = findRegion("basin", event.value);
    
    setSelectedBasin(event);
    onChangeRegion(basin);       
  }
  
  //update selectable watersheds when a basin is selected
  useEffect(() => {
    if(selectedBasin) { //select watersheds in this basin only
        const b = findRegion("basin", selectedBasin.value);
        getWatersheds(b.boundary).then(
            data => {
                setWatersheds(parseRegions(data));
            }
        );
    }
    else { //all watersheds are selectable
        getWatersheds().then(
            data => {
                setWatersheds(parseRegions(data));
            }
        )
    }
    setSelectedWatershed(null);
  }, [selectedBasin]);

  function setWatershed(event) {
    const watershed = findRegion("watershed", event.value);
    setSelectedWatershed(event);
    onChangeRegion(watershed);
  }

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
        Select a watershed or conservation unit to view indicator and population data, or narrow down the list by selecting a basin or salmon species.
        <AreaSelector
            regionNames = {map(basins, 'name')}
            onChange={setBasin}
            currentRegion={selectedBasin}
            kind={'basin'}
        />
        <AreaSelector
            regionNames={map(watersheds, 'name')}
            onChange={setWatershed}
            currentRegion={selectedWatershed}
            kind={'watershed'}
        />
    </div>
  );
}

export default AreaDisplay;