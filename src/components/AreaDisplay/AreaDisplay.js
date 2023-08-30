// AreaDisplay - interfaces with the SCIP API to get information about predefined areas
// (watersheds, conservation units, drainage basins, etc); lets the user select the
// area they care about; displays categorical data about the selected area 

import {getWatersheds, getBasins, getConservationUnits, getTaxons} from '../../data-services/scip-backend.js';
import AreaSelector from '../AreaSelector/AreaSelector.js';
import TaxonSelector from '../TaxonSelector/TaxonSelector.js';
import {Container, Row, Col} from 'react-bootstrap';
import React, {useState, useEffect} from 'react';
import {map, find} from 'lodash';
import {parseRegions} from '../../helpers/GeographyHelpers.js';
import _ from 'lodash';

function AreaDisplay({onChangeRegion, region}) {
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
      if(checked) {
          setSelectedTaxons(_.concat(selectedTaxons, taxon));
      }
      else {
        let newSelectedTaxons = [];
        for(let i = 0; i < selectedTaxons.length; i++) {
            if(selectedTaxons[i].common_name !== taxon.common_name || selectedTaxons[i].subgroup !== taxon.subgroup) {
                newSelectedTaxons.push(selectedTaxons[i]);
            }
        }
        setSelectedTaxons(newSelectedTaxons);
      }
  }


  function setBasin(event){
    const basin = findRegion("basin", event.value);
    
    setSelectedBasin(event);
    onChangeRegion(basin);       
  }
  
  //update selectable watersheds and conservation units when a basin is selected
  useEffect(() => {
    if(selectedBasin) { //select subsidiary regions in this basin only
        const b = findRegion("basin", selectedBasin.value);
        getWatersheds(b.boundary).then(
            data => {
                setWatersheds(parseRegions(data));
            }
        );
        getConservationUnits(b.boundary).then(
            data => {
                setConservationUnits(parseRegions(data));
            }
        );
    }
    else { //all regions are selectable
        getWatersheds().then(
            data => {
                setWatersheds(parseRegions(data));
            }
        )
        getConservationUnits().then(
            data => {
                setConservationUnits(parseRegions(data));
            }
        )
    }
    setSelectedWatershed(null);
    setSelectedConservationUnit(null);
  }, [selectedBasin]);

  function setWatershed(event) {
    const watershed = findRegion("watershed", event.value);
    setSelectedWatershed(event);
    setSelectedConservationUnit(null);
    onChangeRegion(watershed);
  }
  
  function setConservationUnit(event) {
    const cu = findRegion("conservationUnit", event.value);
    setSelectedConservationUnit(event);
    setSelectedWatershed(null);
    onChangeRegion(cu);
  }
  
  return (
    <div className="AreaDisplay">
        Select a watershed or conservation unit to view indicator and population data, or narrow down the list by selecting a basin or species.
        <Container fluid>
            <Row>
                <TaxonSelector
                    taxons = {taxons}
                    selectedTaxons = {selectedTaxons}
                    onChange = {handleTaxonChange}
                />
            </Row>
            <Row>
                <AreaSelector
                    regionNames = {map(basins, 'name')}
                    onChange={setBasin}
                    currentRegion={selectedBasin}
                    kind={'basin'}
                />
            </Row>
            <Row>
                <Col lg={6} md={6}>
                    <AreaSelector
                        regionNames={map(watersheds, 'name')}
                        onChange={setWatershed}
                        currentRegion={selectedWatershed}
                        kind={'watershed'}
                    />
                </Col>
                <Col lg={6} md={6}>
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