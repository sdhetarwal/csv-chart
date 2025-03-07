import Papa from 'papaparse';

export function parseCSV(file, callback) {
    Papa.parse(file, {
        header: true,
        complete: (results) => {
            const data = results.data;
            //console.log(mapInvertedData(invertData(data)))
            callback(mapInvertedData(invertData(data)));
        }
    });
}

export function invertData(data) {
    const keys = Object.keys(data[0]); // Extract headers (e.g., time, lp, last_traded_quantity)
console.log(keys)
    // Map each key (header) to collect its corresponding values as columns
    const invertedData = keys.map((key) => data.map((row) => row[key]));

    // Reverse the order of the inverted data if needed
    return invertedData.map((column) => column.reverse());
}


export function mapInvertedData(invertedData) {
    const [timeArray, lpArray, quantityArray] = invertedData; // Assume headers are ordered: time, lp, last_traded_quantity

    // Map arrays into an array of objects
    return timeArray.map((time, index) => ({
        time, // Time field directly from the array
        lp: parseFloat(lpArray[index]), // Convert lp (price) to a float
        last_traded_quantity: parseInt(quantityArray[index], 10) // Convert quantity to an integer
    }));
}
