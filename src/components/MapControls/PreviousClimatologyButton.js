// button to go to the next climatology

import React from 'react';
import Button from 'react-bootstrap/Button';
import {BoxArrowInLeft} from 'react-bootstrap-icons';

function PreviousClimatologyButton({disabled, onClick}) {

    return (
        <Button 
            variant="primary" 
            size="sm"
            title="Previous Climatology"
            disabled={disabled}
            onClick={onClick}> 
                <BoxArrowInLeft/> 
    </Button>
    );
}

export default PreviousClimatologyButton;