export default (map) => {
    // draw map
    map.append("g").selectAll("circles")
    .data(d=>{
        return d.stations
    })
}
