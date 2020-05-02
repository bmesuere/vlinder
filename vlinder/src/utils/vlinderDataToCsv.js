export default function vlinderDataToCsv(vlinderData) {
    let dataArray = [];
    vlinderData.forEach(l => dataArray.push(...l));
    return array2csv(dataArray)
}

function array2csv(items) {
    const replacer = (key, value) => value === null ? '' : value; // specify how you want to handle null values here
    const header = Object.keys(items[0]);
    let csv = items.map(row => header.map(fieldName => JSON.stringify(row[fieldName], replacer)).join(','));
    csv.unshift(header.join(','));
    return csv.join('\r\n');
}
