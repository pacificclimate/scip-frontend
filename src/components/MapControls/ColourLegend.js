//Displays a colour bar and minimum and maximum values. Display-only component, not interactive.
import {getColourBarURL} from '../../data-services/ncwms.js';

function ColourLegend({mapDataset, minmax, units}) {
    
    function palette() {
        return mapDataset.styles.split('/')[1];
    }
    

    return(
        <div>
          <strong>{mapDataset.variable} ({units}):</strong> {minmax.min}
          <img src={getColourBarURL(palette(), mapDataset.logscale)} />
          {minmax.max}
        </div>
    );

}

export default ColourLegend;