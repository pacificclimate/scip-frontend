// thia checkbox allows the user to control whether the raster data 
// is colour-coded on the map with a linear or logairthmic scale.
// if the data includes values of 0 or below, the colour coding must be linear.

import React from 'react';
import Form from 'react-bootstrap/Form';

function LogScaleCheckbox({mapDataset, minmax, handleChange}) {

    return (
        <Form.Check
            type="checkbox"
            className="me-2"
            checked={mapDataset.logscale}
            onChange={handleChange}
            inline
            label={"Logarithmic Scale"}
            title={minmax.min <= 0 ? "Logscale not possible for datasets containing 0" : "Logarithmic Scale"}
            disabled={minmax.min <= 0}
        />
    );

}

export default LogScaleCheckbox;