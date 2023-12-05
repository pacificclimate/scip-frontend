// button to go to the next timestamp in the current climatology

import React from 'react';
import Button from 'react-bootstrap/Button';
import {ArrowLeft} from 'react-bootstrap-icons';

function PreviousTimestampButton({disabled, onClick}) {

    return (
        <Button 
            variant="primary" 
            size="sm"
            title="Previous Timestamp"
            disabled={disabled}
            onClick={onClick}> 
                <ArrowLeft/> 
    </Button>
    );
}

export default PreviousTimestampButton;