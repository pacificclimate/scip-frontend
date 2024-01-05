import {getColourBarURL} from '../../data-services/ncwms.js';

function ColourLegend({mapDataset, minmax}) {

    function colourbarURL() {
        const url = process.env.REACT_APP_NCWMS_URL + "?service=WMS&request=GetLegendGraphic&colorbaronly=true&vertical=false";
        return url;
    }
    
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