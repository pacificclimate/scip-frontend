// Button that allows users to download a CS of the contents of a 
// Plotly graph when clicked.

import Button from 'react-bootstrap/Button';
import _ from 'lodash';

function GraphDownloadButton({data, layout}) {

    function makeCSV() {
        const header = csvRow(data[0].x, `${layout.title} (${data[0].text[0]})`);
        const series = _.map(data, s => {return csvRow(s.y, s.name, 3);})
        return [header, series];
    }

    function fileName() {
        // convert everything that isn't a letter, number, plus, minus, or 
        // underscore into underscores
        const nonFilenameCharacters = /[^a-zA-z0-9\+\-_]/g
        const filename = layout.title.replaceAll(nonFilenameCharacters, '_');
        return filename.concat(".csv");
    }
    
    function csvRow (list, label, precision = null) {
        return (_.reduce(list, 
            function(row, col) {return `${row}, ${precision ? col.toPrecision(precision) : col}`} , 
            `${label}`
        ).concat("\n"));
    }

    const file = new Blob(makeCSV(), {type: 'text/html'});
    
    return (
        <Button 
            download={fileName()} 
            href={URL.createObjectURL(file)}>
                Download Data
        </Button>
    );
}

export default GraphDownloadButton;