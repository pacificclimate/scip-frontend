import {getColourBarURL} from '../../data-services/ncwms.js';

function ColourLegend({mapDataset, minmax}) {
    
    function palette() {
        return mapDataset.styles.split('/')[1];
    }
    

    return(
        <div>
          {minmax.min}
          <img src={getColourBarURL(palette(), mapDataset.logscale)} />
          {minmax.max}
        </div>
    );

}

export default ColourLegend;