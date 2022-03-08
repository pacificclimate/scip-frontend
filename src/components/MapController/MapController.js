import './MapController.css';
import DataMap from '../DataMap/DataMap.js'

function MapController({currentRegionBoundary}) {
  return (
    <div className="MapController">
        <DataMap
          currentRegionBoundary={currentRegionBoundary}
        />
    </div>
  );
}

export default MapController;