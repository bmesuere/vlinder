import * as d3 from "d3"
import "d3-selection-multi";
import {coordinates, X, Y} from "../utils/coordinates"

let latestVlinderData = [];

class Popup {
    constructor(map, original_scale) {
        this.map = map;
        this.original_scale = original_scale;
        this.scale = original_scale;
        this.visible = false;
        this.status = status;

        this.lines = []
        this.height = 20;
        this.width = 140;
        this.offset = -46;
        this.title = "";
        return this;
    }

    set_coordinates(coordinates) {
        this.coordinates = coordinates;
        this.update_coordinates();
    }

    set_status(status) {
        this.status = status;
    }

    set_title(title) {
        this.title = title;
    }

    add_line(line) {
        this.lines.push(line)
    }

    show() {
        if (!this.visible) return;
        const g = this.map.append("g").attr("id", "popup");

        g.attr("transform", `scale(${this.scale}, ${this.scale})`)
        
        // body
        g.append("rect").attrs({
            x: this.x - 3, y: this.y - 14,
            width: this.width, height: this.height + this.lines.length * 15,
            fill: "white", "stroke-width": 0.5, stroke: "black"
        });

        // status
        g.append("circle").attrs({
            cx: this.x + 5, cy: this.y - 4, r: 5,
            class: "circles",
            status: this.status,
        });

        // title
        g.append("text").attrs({
            x: this.x + 20, y: this.y,
            "font-size": "12px", "font-family": "sans-serif",
        }).text(this.title);

        // lines
        for (var i = 0; i < this.lines.length; i++) {
            g.append("text").attrs({
                x: this.x, y: this.y + (i + 1) * 15,
                "font-size": "12px", "font-family": "sans-serif",
            }).text(this.lines[i]);
        }
    }

    clear() {
        this.lines = [];
        this.map.selectAll("#popup").remove();
    }

    display(visible) {
        this.visible = visible;
        if (visible) this.show();
        else this.clear();
    }

    update(scale) {
        this.scale = this.original_scale/scale;
        this.update_coordinates(); // fix coordinates to scale
        this.map.selectAll("#popup").remove();
        this.show();
    }

    update_coordinates() {
        this.x = X(this.coordinates)/this.scale;
        this.y = Y(this.coordinates)/this.scale + this.offset;
    }
}

function extendData(d, latestVlinderData) {
    for (var i = 0; i < latestVlinderData.length; i++) {
        if (latestVlinderData[i].id == d.id) {
            var obj = latestVlinderData[i];
            for (var prop in obj) {
                d[prop] = obj[prop];
            }
        }
    }
    return d;
}

export default function popup(root, map, dataExtension) {
    let popup = new Popup(map, 2);

    root.on("mouseover.popup", function (d) {
        extendData(d, dataExtension);
        popup.set_coordinates(map.projection(coordinates(d.coordinates))); // can't use this for timeline so either duplicate code or find solution
        popup.set_status("offline"); // undefined for now
        popup.set_title(d.name);
        popup.add_line((d.time ? new Date(d.time) : new Date()).toLocaleString());
        popup.add_line("🌡 " + d.temp + "°C\t" + "🌧️ " + d.humidity + "%");
        
        popup.display(true);
    });

    root.on("mouseout.popup", _ => {
        popup.display(false);
    });

    map.zoom.on("zoom.popup", _ => {
        popup.update(d3.event.transform.k);
    })

    return popup;
}
