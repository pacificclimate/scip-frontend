// button to go to the next timestamp in the current climatology

import React from 'react';
import Button from 'react-bootstrap/Button';
import {ArrowRight} from 'react-bootstrap-icons';

function NextTimestampButton({disabled, onClick}) {

    return (
        <Button 
            variant="primary" 
            size="sm"
            title="Next Timestamp"
            disabled={disabled}
            onClick={onClick}> 
                <ArrowRight/> 
    </Button>
    );
}

export default NextTimestampButton;