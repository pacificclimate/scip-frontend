// AreaDisplay - interfaces with the SCIP API to get information about predefined areas
// (watersheds, conservation units, drainage basins, etc); lets the user select the
// area they care about; displays categorical data about the selected area 

import {getWatersheds, getBasins, getConservationUnits, getTaxons} from '../../data-services/scip-backend.js';
import {getUpstream} from '../../data-services/pcex-backend.js';
import {getWhitelist} from '../../data-services/public.js';
import AreaSelector from '../AreaSelector/AreaSelector.js';
import TaxonSelector from '../TaxonSelector/TaxonSelector.js';
import {Container, Row, Col} from 'react-bootstrap';
import React, {useState, useEffect} from 'react';
import {map, find} from 'lodash';
import {parseRegions, regionListUnion, parseUpstream} from '../../helpers/GeographyHelpers.js';
import _ from 'lodash';

function AreaDisplay({onChangeRegion, region, selectedOutlet}) {
  const [basins, setBasins] = useState([]);
  const [selectedBasin, setSelectedBasin] = useState(null);
  
  const [watersheds, setWatersheds] = useState([]);
  const [selectedWatershed, setSelectedWatershed] = useState([]);

  const [conservationUnits, setConservationUnits] = useState([]);
  const [selectedConservationUnit, setSelectedConservationUnit] = useState([]);
  
  const [taxons, setTaxons] = useState([]);
  const [selectedTaxons, setSelectedTaxons] = useState([]);
 
  // Hooks for this component are a little complex
  // This component allows a user to select a "region" and the rest of the app
  // (maps, graphs) will provide information based on what was selected. The 
  // rest of the app is passed region information by the onChangeRegion callback
  // function.
  // This particular component understands three kinds of "region" - "basins", 
  // "conservation units", and "watersheds". Basins represent large river systems
  // like the Nass or Columbia; watersheds represent a stream network as defined by the 
  // BC Freshwater Atlas, and Conservation Units represent the location where a
  // particular salmon species lives. A user may examine data for any of these region kinds.
  // While other components don't know or care what kind of "region" a user has selected,
  // this component has some extra hooks relating to the hierarchical nature of
  // region selection. A "basin" contains many "watersheds" and "conservation units"
  // and when a user selects a basin, in addition to that basin being made the selected 
  // region and broadcast to the rest of the app, the conservation unit and watershed
  // selector are updated to include only regions in that basin. This is to help a user 
  // find the conservation unit or watershed they care about - they may not know its
  // official name, but they probably know what river system it's part of.
  //
  // Users may also indicate which salmon species or taxons they ae interested in.
  // This doesn't change the selected basin, conservation unit, or watershed, but it
  // does change which ones are selectable in the dropdown menus - only regions that 
  // contain the currently selected species are available.

  // fetch basin list from the API.
  // this only needs to be done once, when the component is loaded
  useEffect(() => {
      if(basins.length === 0) {
          Promise.all([getBasins(), getWhitelist("basins")]).then(
            ([basins, whitelist]) => {
                setBasins(collateRegions([basins], whitelist));
            }  
          );
      }
  });
  
  // fetch species list from the API.
  // this only needs to be done once, when the component is loaded
  useEffect(() => {
      if(taxons.length === 0) {
          getTaxons().then(
            data => {
                setTaxons(data);
                setSelectedTaxons(data); //start with all species selected
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
  
  function handleTaxonChange(taxon, checked) {
      let newSelectedTaxons = [];
      if(checked) {
          newSelectedTaxons = _.concat(selectedTaxons, taxon);
      }
      else {
        newSelectedTaxons = [];
        for(let i = 0; i < selectedTaxons.length; i++) {
            if(selectedTaxons[i].common_name !== taxon.common_name || selectedTaxons[i].subgroup !== taxon.subgroup) {
                newSelectedTaxons.push(selectedTaxons[i]);
            }
        }
      }
      setSelectedTaxons(newSelectedTaxons);
  }
  


  useEffect(() => {
      //if the user has selected an outlet, fetch its upstream area
      if(selectedOutlet){
          getUpstream(selectedOutlet).then(
            data => {
              setUpstream(parseUpstream(data));
            }
          );
      }
  }, [selectedOutlet]);

  // update selectable watersheds and conservation units in dropdowns.
  // called when either the selected taxon or the selected basin is changed - 
  // available watersheds and conservation units are filtered by both taxon and 
  // basin.
  // doesn't update the selected region or change what's on the map. 
  useEffect(() => {
      const basin = selectedBasin ? findRegion("basin", selectedBasin.value) : null;
      const boundary = basin ? basin.boundary : null;
      
      if(selectedTaxons.length === taxons.length) {
          // all taxons are selected, no filtering on species.
          // filtering occurs on basin only, if that.
          // we *could* handle this by making seperate calls for
          // each species, as done below for the "else", but it's
          // much faster to make single unfiltered all-watersheds
          // and all-basins calls than to make seven calls filtered
          // by species and merge the results.
          
        Promise.all([getWatersheds(boundary), getWhitelist("watersheds")]).then(
            ([watersheds, whitelist]) => {
                setWatersheds(collateRegions([watersheds], whitelist));
            }  
          );
        Promise.all([getConservationUnits(boundary), getWhitelist("conservation_units")]).then(
            ([conservation_units, whitelist]) => {
                setConservationUnits(collateRegions([conservation_units], whitelist));
            }  
          );
      }
      else {
          // some, but not all, taxons are selected. 
          // need to do multiple queries and merge the results.

          const watershed_calls = _.map(selectedTaxons, taxon => {
              return getWatersheds(boundary, taxon.common_name, taxon.subgroup)
          });
          const watershedWhitelist_call = getWhitelist("watersheds");
          
          Promise.all(watershed_calls.concat([watershedWhitelist_call]))
            .then((api_responses) => {
                const watersheds = api_responses.slice(0, -1);
                const whitelist = api_responses.slice(-1);
                setWatersheds(collateRegions(watersheds, whitelist[0]));
            });


          const cu_calls = _.map(selectedTaxons, taxon => {
              return getConservationUnits(boundary, taxon.common_name, taxon.subgroup)
          });
          const cuWhitelist_call = getWhitelist("conservation_units");
          Promise.all(cu_calls.concat([cuWhitelist_call])).then((api_responses)=> {
              const conservation_units = api_responses.slice(0, -1);
              const whitelist = api_responses.slice(-1);
              setConservationUnits(collateRegions(conservation_units, whitelist[0]));
            }
          );
      }
  }, [selectedBasin, selectedTaxons]);
  
  // receives a collection of responses from the /region API
  // and a whitelist. Returns a list with the set of unique
  // region objects present in the whitelist and at least one
  // region list
function collateRegions(regions, whitelist) {
    function pr(rl) {
        return parseRegions(rl, whitelist);
    }
    return regionListUnion(_.map(regions, pr));
}

  function setBasin(event){
    const basin = findRegion("basin", event.value);
    
    setSelectedBasin(event);
    onChangeRegion(basin, false);
    setSelectedWatershed(null);
    setSelectedConservationUnit(null); 
  }


  function setWatershed(event) {
    const watershed = findRegion("watershed", event.value);
    setSelectedWatershed(event);
    setSelectedConservationUnit(null);
    onChangeRegion(watershed, false);
  }
  
  function setConservationUnit(event) {
    const cu = findRegion("conservationUnit", event.value);
    setSelectedConservationUnit(event);
    setSelectedWatershed(null);
    onChangeRegion(cu, false);
  }
  
  function setUpstream(upstream) {
    //search for region.
      setSelectedConservationUnit(null);
      setSelectedWatershed(null);
      setSelectedBasin(null);
      onChangeRegion(upstream, true);
  }

  return (
    <div className="AreaDisplay">
      Select a region eiher using the circle marker tool on the map to place a
      marker and select everything upstream of it, or from the dropdown watershed and
      conservation unit menus below. You can narrow down regions shown on the menus
      by river basin or species.
        <Container fluid>
            <Row>
                <Col>
                    <AreaSelector
                        regionNames = {map(basins, 'name')}
                        onChange={setBasin}
                        currentRegion={selectedBasin}
                        kind={'basin'}
                    />
                </Col>
                <Col>
                    <TaxonSelector
                        taxons = {taxons}
                        selectedTaxons = {selectedTaxons}
                        onChange = {handleTaxonChange}
                    />
                </Col>
            </Row>
            <Row>
                <Col>
                    <AreaSelector
                        regionNames={map(watersheds, 'name')}
                        onChange={setWatershed}
                        currentRegion={selectedWatershed}
                        kind={'watershed'}
                    />
                </Col>
                <Col>
                    <AreaSelector
                        regionNames={map(conservationUnits, 'name')}
                        onChange={setConservationUnit}
                        currentRegion={selectedConservationUnit}
                        kind={'conservation unit'}
                    />
                </Col>
            </Row>
        </Container>
    </div>
  );
}

export default AreaDisplay;
