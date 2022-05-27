// App.js - highest level component of the SCIP system. 
// Has three children:  
// AreaDisplay helps the user specify the area of interest (watershed, conservation unit, etc)
//     and displays categorical data about the selected area
// DataDisplay displays graphs showing qualitative data about the indictoars of the
//     selected area
// MapDisplay displays visual information about the area - colour coded indicators, 
//    boundaries, etc.
// 
// App.js lays out the three main components and passes updates about the selected area
// between them.

import './App.css';

import {Container, Row, Col} from 'react-bootstrap';
import DataDisplay from '../DataDisplay/DataDisplay.js'
import MapDisplay from '../MapDisplay/MapDisplay.js'
import AreaDisplay from '../AreaDisplay/AreaDisplay.js'
import React, {useState} from 'react'

function App() {
  const [currentRegionName, setCurrentRegionName] = useState(null);
  const [currentRegionBoundary, setCurrentRegionBoundary] = useState(null);
  const [currentWatershedStreams, setCurrentWatershedStreams] = useState(null);
  
  function setRegionName(event) {
      setCurrentRegionName(event);
  }
  
  function setRegionBoundary(event) {
      setCurrentRegionBoundary(event);
  }

  function setWatershedMouth(event) {
      setCurrentWatershedStreams(event);
  }

  return (
    <div className="App">
      <header className="App-header">
        <h1>Salmon Climate Impacts Portal</h1>
        <Container fluid>
          <Row>
            <Col lg={6} md={6}>
              <MapDisplay
                currentRegionBoundary={currentRegionBoundary}
                currentWatershedStreams={currentWatershedStreams}
              />
              <AreaDisplay
                onChangeRegionName={setRegionName}
                onChangeRegionBoundary={setRegionBoundary}
                onChangeWatershedMouth={setWatershedMouth}
              />
            </Col>
            <Col lg={6} md={6}>
              <DataDisplay
                currentRegionBoundary={currentRegionBoundary}
              />
            </Col> 
          </Row>
        </Container>        
      </header>
    </div>
  );
}

export default App;
