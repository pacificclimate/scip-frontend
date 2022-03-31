import './MapDisplay.css';
import DataMap from '../DataMap/DataMap.js'

function MapDisplay({currentRegionBoundary}) {
  return (
    <div className="MapDisplay">
        <DataMap
          currentRegionBoundary={currentRegionBoundary}
        />
    </div>
  );
}

export default MapDisplay;