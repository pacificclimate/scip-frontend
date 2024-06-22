//Displays a colour bar and minimum and maximum values. Display-only component, not interactive.
import {getColourBarURL} from '../../data-services/ncwms.js';
import useStore from '../../store/useStore.js'


function ColourLegend({mapDataset, units}) {

    const indicatorOptions = useStore((state) => state.indicatorOptions);

    const config = indicatorOptions?.[mapDataset.variable];
    const min = config ? config.minimum : "min";
    const max = config ? config.maximum : "max";

    
    function palette() {
        return mapDataset.styles.split('/')[1];
    }
    

    return(
        <div>
          <strong>{mapDataset.variable} ({units}):</strong> {min}
          <img 
            src={getColourBarURL(palette(), mapDataset.logscale)}
            alt={"colour legend for the map"} 
          />
          {max}
        </div>
    );

}

export default ColourLegend;