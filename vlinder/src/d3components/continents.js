//import belgium from "../local/belgium.geo.json.js"
import * as topojson from "topojson-client";

export default (map) => {
    // draw map
    map.append("g").selectAll("path")
        .data((d) => {
            const regions = topojson.feature(d.regions, d.regions.objects["main"]);
            map.projection.fitSize([map.w, map.h], regions);
            return regions.features
        }).enter().append("path")
        .attrs({class: "continent", d: map.path});
}
