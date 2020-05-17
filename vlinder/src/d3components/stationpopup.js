import * as d3 from "d3"
import "d3-selection-multi";
import {coordinates} from "../utils/coordinates"
import Popup from '../d3components/popup'

function extendData(d, latestVlinderData) {
    for (var i = 0; i < latestVlinderData.length; i++) {
        if (latestVlinderData[i].id === d.id) {
            var obj = latestVlinderData[i];
            for (var prop in obj) {
                d[prop] = obj[prop];
            }
        }
    }
    return d;
}

export default function popup(root, map, dataExtension) {
    let popup = Popup(map, 2);

    root.on("mouseover.popup", function (d) {
        extendData(d, dataExtension);
        let coords = map.projection(coordinates(d.coordinates));
        popup.set_offset(15, -30)
        popup.set_coordinates(coords); // can't use this for timeline so either duplicate code or find solution
        popup.set_status(d.status);
        popup.set_title(d.given_name);

        popup.add_lines(d3.timeFormat("%d/%m/%Y, %H:%M")(d.time ? new Date(d.time) : new Date()), d.temp, d.humidity, d.windSpeed, d.windDirection, d.city)
        
        popup.display(true);
    });

    root.on("mouseout.popup", function() {
        popup.display(false);
    });

    map.zoom.on("zoom.popup", function() {
        popup.update(d3.event.transform.k);
    })

    return popup;
}
