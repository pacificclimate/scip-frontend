// This function shows the user a list of conservation units, basins, and
// watersheds that contain a point the user has selected on the map.
// The user may then select one of these regions to view.
// This component queries the backend and keeps a list of the possible (selectable)
// regions, but its parent keeps track of which is actually selected.
import React, {useState, useEffect} from 'react';
import {parseRegions, regionListUnion} from '../../helpers/GeographyHelpers.js';
import {getWatersheds, getBasins, getConservationUnits} from '../../data-services/scip-backend.js';
import _ from 'lodash';

function CustomAreaDisplay({selectedPoint, onBasinSelect, onWatershedSelect, onCUSelect, onCustomSelect}) {

  const [basins, setBasins] = useState([]);
  const [watersheds, setWatersheds] = useState([]);
  const [conservationUnits, setConservationUnits] = useState([]);


    
  // When the user selects a point on the map, create a list of all predefined
  // areas that include that point, plus the option of just selecting all upstream
  // grid cells.
  useEffect(() => {
      if(selectedPoint) {
          const WKT = `POINT (${selectedPoint[0]} ${selectedPoint[1]})`;
//          console.log(`WKT is ${WKT}`);
          getWatersheds(WKT).then(
            data => {
                setWatersheds(parseRegions(data));
            }
          ); 
          getConservationUnits(WKT).then(
            data => {
                setConservationUnits(parseRegions(data));
            }
          );
          getBasins(WKT).then(
            data => {
                setBasins(parseRegions(data));
            }
          );
      }
      else {
        // no point, nothing selectable. Clear the list.
        setBasins([]);
        setWatersheds([]);
        setConservationUnits([]);
      }
  }, [selectedPoint]);
  
    function listRegions() {
        let text = "";

        if (basins.length > 0) {
            _.forEach(basins, r => {text = text.concat(`${r.name} (${r.kind} )`)});
        }
        
        if (watersheds.length > 0) {
            _.forEach(watersheds, r => {text = text.concat(`${r.name} (${r.kind} )`)});
        }
        
        if (conservationUnits.length > 0) {
            _.forEach(conservationUnits, r => {text = text.concat(`${r.name} (${r.kind} )`)});
        }
        
        return text;
    }  
    
    return "This is the custom area display, point "+ listRegions();
}

export default CustomAreaDisplay;