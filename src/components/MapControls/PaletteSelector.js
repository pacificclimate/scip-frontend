// Allow user to select a palette to view map with.
// Attempts to generate human-friendly names for the palettes.
import {getNcwmsPalettes} from '../../data-services/ncwms.js';

import React, {useState, useEffect} from 'react';
import Form from 'react-bootstrap/Form';
import _ from 'lodash';


function PaletteSelector({mapDataset, handleChange}) {
    const [palettes, setPalettes] = useState();


    //get the list of available palettes
    useEffect(() => {
        if(!palettes) {
            getNcwmsPalettes(mapDataset.file, mapDataset.variable).then((palettes) => setPalettes(palettes));
        }
    });
    
    // tries to create a human-friendly name to each palette
    // if it cannot create a human-friendly name, just returns the original name.
    function humanFriendly(palette) {
        return palette;
    }

    function makeOption(palette) {
        return (
            <option key={palette} value={palette}>{humanFriendly(palette)}</option>
        );
    }

    return (
            <Form.Select 
              onChange={handleChange}
              enabled={true}
              value={mapDataset.styles.split('/')[1]}>
              
                {_.map(palettes, makeOption)}
            </Form.Select>
    );
}

export default PaletteSelector;