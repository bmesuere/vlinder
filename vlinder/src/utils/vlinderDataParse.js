export default function fillMissingData(vlinderData) {
    if (vlinderData.length <= 0) return [];
    
    var ddata = [].concat.apply([], vlinderData);
    var data = [];
    data.push(ddata[0]);
    for (var i = 0; i < ddata.length - 1; i++) {
        let diff = new Date(ddata[i + 1].time).getTime() - new Date(ddata[i].time).getTime();
        if (diff > 300000) {
            let inserts = (diff / 300000);
            var date = new Date(ddata[i].time);
            for (var j = 0; j < inserts - 1; j++) {
                date.setTime(date.getTime() + 300000);
                data.push({time: new Date(date), status: "missing", id: ddata[i].id})
            }
        }
        data.push(ddata[i + 1])
    }
    return data;
}