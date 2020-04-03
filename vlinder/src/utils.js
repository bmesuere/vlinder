export function uuidv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}
export function generate_fake_data(amount, start_time, pressure = undefined, rainVolume = 0) {
    let inc = 0;
    pressure = pressure === undefined ? 1020 + Math.random() * 10 : pressure;
    return Array.from({length: amount}, () => {
        inc += 5;
        var date =  new Date(start_time.getTime() + inc*60000);
        if (date.getHours() === 0){
            rainVolume = 0;
        }
        pressure += Math.random() * 0.1 - 0.05;
        if (Math.random() > 0.95) rainVolume += Math.random() * 0.2;

        return {"time": date, "pressure": pressure, "rainVolume": rainVolume}
    })
}
