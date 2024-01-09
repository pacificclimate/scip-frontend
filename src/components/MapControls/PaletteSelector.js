// Allow user to select a palette to view map with.
// Attempts to generate human-friendly names for the palettes.
import {getNcwmsPalettes} from '../../data-services/ncwms.js';

import React, {useState, useEffect} from 'react';
import Form from 'react-bootstrap/Form';
import _ from 'lodash';


function PaletteSelector({mapDataset, handleChange}) {
    const [palettes, setPalettes] = useState();


    //get the list of available palettes. Only needs to be done once.
    useEffect(() => {
            getNcwmsPalettes(mapDataset.file, mapDataset.variable).then((palettes) => setPalettes(palettes));
    }, []);
    
    // tries to create a human-friendly name to each palette
    // by expanding the ncWMS abbreviations for palette types, colours
    // and "inverted" and replacing dashes with spaces.
    function humanFriendly(palette) {
        const comp = palette.split("-");
        let hf = "";
        
        //general palette types, denoted by the first part of the palette name
        const types = {
            "x": "Cross Platform",
            "div": "Divergent",
            "seq": "Sequential",
            "psu": "Matplotlib PUS",
        };
        
        // attempts to understand colour sequences like BuRd for "Blue-Red"
        // returns False if there's no such sequence
        function expandedColorSequence(colseq) {
            if (colseq === "Oranges" || colseq === "Purples") {
                return false; //these palettes are misparsed by this function. 
            }
            let expanded = colseq;
            const colours = {
                "Bu": "Blue",
                "Rd": "Red",
                "Br": "Brown",
                "Pi": "Pink",
                "Or": "Orange",
                "Gy": "Grey",
                "Gn": "Green",
                "Pu": "Purple",
                "Yl": "Yellow",
                "BG": "Blue-Green",
                "YG": "Yellow-Green",
                "Bk": "Black",
                "PR": "Purple-Red"
            };
            for(let abbreviation in colours) {
                expanded = expanded.replace(abbreviation, `, ${colours[abbreviation]}`);
            }
            
            return expanded === colseq ? false : _.trim(expanded, ",");
        }

        if(comp[0] in types) {
            hf = `${types[comp[0]]}:`;
        }
        else {
            hf = comp[0];
        }
        
        if(comp.length === 1) {
            return hf;
        }
        else if(comp[1] === "inv") {
            return `${hf} (inverted)`;
        }
        else if (expandedColorSequence(comp[1])) {
            hf = `${hf} ${expandedColorSequence(comp[1])}`;
        }
        else {
            hf = `${hf} ${comp[1]}`;
        }
        
        if (comp.length === 2) {
            return hf;
        } 
        else if(comp[2] === "inv") {
            return `${hf} (inverted)`;
        }
        else {
            return `${hf} ${comp[2]}`;
        }
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