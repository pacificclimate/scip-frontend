// button to go to the next climatology

import React from 'react';
import Button from 'react-bootstrap/Button';
import {BoxArrowInRight} from 'react-bootstrap-icons';

function NextClimatologyButton({disabled, onClick}) {

    return (
        <Button 
            variant="primary" 
            size="sm"
            title="Next Climatology"
            disabled={disabled}
            onClick={onClick}> 
                Climatology<BoxArrowInRight/> 
    </Button>
    );
}

export default NextClimatologyButton;