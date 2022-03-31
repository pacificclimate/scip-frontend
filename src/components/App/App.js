import './App.css';

import {Container, Row, Col} from 'react-bootstrap';
import DataDisplay from '../DataDisplay/DataDisplay.js'
import MapDisplay from '../MapDisplay/MapDisplay.js'
import AreaDisplay from '../AreaDisplay/AreaDisplay.js'
import React, {useState} from 'react'

function App() {
  const [currentRegionName, setCurrentRegionName] = useState(null);
  const [currentRegionBoundary, setCurrentRegionBoundary] = useState(null);
  
  function setRegionName(event) {
      setCurrentRegionName(event);
  }
  
  function setRegionBoundary(event) {
      setCurrentRegionBoundary(event);
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
              />
              <AreaDisplay
                onChangeRegionName={setRegionName}
                onChangeRegionBoundary={setRegionBoundary}
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
