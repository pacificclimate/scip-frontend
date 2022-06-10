/* function that returns an array of values, which are in the same order as
 the sorted keys.
 Param entries: array of arrays, inner array being key value pairs
 Param dates: sorted keys of entries
  */
export function matchValues(entries, dates){
    let orderedValues = [];
        dates.forEach((date) => {
            for(const [key, value] of entries) {
                if (date === key) orderedValues.push(value);
            }
        })
    return orderedValues;
}