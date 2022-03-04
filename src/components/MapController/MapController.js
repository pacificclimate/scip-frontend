import './MapController.css';
import DataMap from '../DataMap/DataMap.js'

function MapController({currentRegionBoundary}) {
  return (
    <div className="MapController">
        This will let you look at your area on a map.
        <DataMap
          currentRegionBoundary={currentRegionBoundary}
        />
    </div>
  );
}

export default MapController;