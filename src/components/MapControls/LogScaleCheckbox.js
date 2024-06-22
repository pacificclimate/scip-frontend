// thia checkbox allows the user to control whether the raster data 
// is colour-coded on the map with a linear or logairthmic scale.
// if the data includes values of 0 or below, the colour coding must be linear.

import React from 'react';
import Form from 'react-bootstrap/Form';
import useStore from '../../store/useStore.js'

function LogScaleCheckbox({mapDataset, handleChange}) {

    // logscaled colour is allowed (can be turned on by user) for only those
    // variables that say so in the configuration file. Additionally, the minimum
    // value of the data range must be > 0
    
    // at present, due to a data bug, the files that are supposed to always have
    // data greater than zero (stream flow magnitude files) have some zero values, 
    // perhaps due to a rounding error. This causes ncWMS to throw an error when
    // asked to display them with a logarithmic colour scale, so this function is
    // disabled for now.
    
    //TODO: uncomment this function when data issue is fixed.
    //function allowLogscale() {
    //    return const options = indicatorOptions?.[mapDataset.variable]?.logscale;
    //}
    function allowLogscale() {return false};

    const indicatorOptions = useStore((state) => state.indicatorOptions);
    const min = indicatorOptions?.[mapDataset.variable] ?
        indicatorOptions[mapDataset.variable].minimum : 0;


    return (
        <Form.Check
            type="checkbox"
            className="me-2"
            checked={mapDataset.logscale}
            onChange={handleChange}
            inline
            label={"Log scale"}
            title={min <= 1 ? "Logscale not possible for datasets containing values less than 1" : "Logarithmic Scale"}
            disabled={!allowLogscale()}
        />
    );

}

export default LogScaleCheckbox;