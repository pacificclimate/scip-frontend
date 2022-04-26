import './MapDisplay.css';
import DataMap from '../DataMap/DataMap.js'

function MapDisplay({currentRegionBoundary, currentWatershedMouth}) {
  return (
    <div className="MapDisplay">
        {currentWatershedMouth ? `${currentWatershedMouth.coordinates[0]} , ${currentWatershedMouth.coordinates[1]}` : "no coordinates"}
        <DataMap
          currentRegionBoundary={currentRegionBoundary}
          currentWatershedMouth={currentWatershedMouth}
        />
    </div>
  );
}

export default MapDisplay;