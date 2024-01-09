// Lets user set the opacity level of the map.

import Form from 'react-bootstrap/Form';

function OpacitySlider({mapDataset, handleChange}) {
    return (
        <Form.Range
          value={mapDataset.opacity * 100} 
          onChange={handleChange}
        />
    );
    
    
}

export default OpacitySlider;