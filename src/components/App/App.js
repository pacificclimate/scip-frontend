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

import {Container, Row, Col} from 'react-bootstrap';
import DataDisplay from '../DataDisplay/DataDisplay.js'
import MapDisplay from '../MapDisplay/MapDisplay.js'
import AreaDisplay from '../AreaDisplay/AreaDisplay.js'
import React, {useState} from 'react'

function App() {
  const [region, setRegion] = useState(null);


  return (
    <div className="App">
      <h1>Salmon Climate Impacts Portal</h1>
      <Container fluid>
        <Row>
          <Col lg={6} md={6}>
            <MapDisplay
              region={region}
            />
            <AreaDisplay
              onChangeRegion={setRegion}
              region={region}
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
