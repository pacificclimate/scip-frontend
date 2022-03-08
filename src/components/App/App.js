import './App.css';

import {Container, Row, Col} from 'react-bootstrap';
import DataController from '../DataController/DataController.js'
import MapController from '../MapController/MapController.js'
import AreaController from '../AreaController/AreaController.js'
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
        <Container fluid>
          <Row>
            <Col lg={6} md={6}>
              <MapController
                currentRegionBoundary={currentRegionBoundary}
              />
              <AreaController
                onChangeRegionName={setRegionName}
                onChangeRegionBoundary={setRegionBoundary}
              />
            </Col>
            <Col lg={6} md={6}>
              <DataController
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
