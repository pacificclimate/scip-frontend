import './MapDisplay.css';
import DataMap from '../DataMap/DataMap.js'

function MapDisplay({currentRegionBoundary, currentWatershedMouth}) {
  return (
    <div className="MapDisplay">
        {currentWatershedMouth ? currentWatershedMouth.coordinates : "no coordinates"}
        <DataMap
          currentRegionBoundary={currentRegionBoundary}
          currentWatershedMouth={currentWatershedMouth}
        />
    </div>
  );
}

export default MapDisplay;