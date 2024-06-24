// App.js - highest level component of the SCIP system. 
// Has three children:  
// AreaDisplay helps the user specify the area of interest (watershed, conservation unit, etc)
//     and displays categorical data about the selected area
// DataDisplay displays graphs showing qualitative data about the indictoars of the
//     selected area
// MapDisplay displays visual information about the area - colour coded indicators, 
//    boundaries, etc.
// 
// App.js lays out the three main components and keeps track of the selected region, updating
// them when it changes.

import './App.css';
import pcic_logo from '../../assets/pcic_logo.png';

import {Container, Row, Col} from 'react-bootstrap';
import DataDisplay from '../DataDisplay/DataDisplay.js';
import MapDisplay from '../MapDisplay/MapDisplay.js';
import AreaDisplay from '../AreaDisplay/AreaDisplay.js';
import React, {useState, useEffect} from 'react';
import useStore from '../../store/useStore.js';
import {getIndicatorMapOptions} from '../../data-services/public.js';
import {getHelpTexts} from '../../data-services/public.js';

function App() {
  const [region, setRegion] = useState(null);
  const [selectedOutlet, setSelectedOutlet] = useState(null);


  //load-once-per-app config files
  const storeIndicatorOptions = useStore((state) => state.setIndicatorOptions);
  const storeHelp = useStore((state) => state.setHelpText);


  //load config files into zustand for components
    useEffect(() => {
        getIndicatorMapOptions().then((options) => storeIndicatorOptions(options));
        getHelpTexts().then((texts) => storeHelp(texts));
    }, []);

  function handleRegionChange(region, fromOutlet) {
      setRegion(region);
      if(!fromOutlet) {
          setSelectedOutlet(null);
      }
  }

  return (
    <div className="App">
      <div className="Header">
        <a href='https://pacificclimate.org/'>
          <img 
            src={pcic_logo}
            width='328'
            height='38'
            alt='Pacific Climate Impacts Consortium'
          />
        </a>
        <div className="Title">
          <h1>Salmon Climate Impacts Portal</h1>
        </div>
        <div className="Help">
            <a href={`${process.env.PUBLIC_URL}/general_help.pdf`}>General Help</a>
        </div>
      </div>
      <Container fluid>
        <Row>
          <Col lg={6} md={6}>
            <MapDisplay
              region={region}
              onSelectOutlet={setSelectedOutlet}
              selectedOutlet={selectedOutlet}
            />
            <hr />
            <AreaDisplay
              onChangeRegion={handleRegionChange}
              region={region}
              selectedOutlet={selectedOutlet}
            />
          </Col>
          <Col lg={6} md={6}>
            <DataDisplay
              region={region}
            />
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default App;
