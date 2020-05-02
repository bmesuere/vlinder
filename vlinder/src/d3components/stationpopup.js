import * as d3 from "d3"
import "d3-selection-multi";
import {coordinates, X, Y} from "../utils/coordinates"

let latestVlinderData = [];

class Popup {
    constructor(map, original_scale, data) {
        this.map = map;
        this.original_scale = original_scale;
        this.scale = original_scale;
        this.visible = false;

        if (data) {
            this.set_data(data);
        }

        this.lines = []
        this.height = 20;
        this.width = 140;
        this.offset = -46;
        this.title = "";
        return this;
    }

    set_title(title) {
        this.title = title;
    }

    add_line(line) {
        this.lines.push(line)
    }

    set_data(data) {
        this.name = data.name;
        this.status = data.status;
        this.time = data.time;
        this.coordinates = data.coordinates;
        this.temp = data.temp;
        this.humidity = data.humidity;

        this.update_coordinates();
    }

    show() {
        if (!this.visible || !this.name) return;
        const g = this.map.append("g").attr("id", "popup");

        g.attr("transform", `scale(${this.scale}, ${this.scale})`)
        
        g.append("rect").attrs({
            x: this.x - 3, y: this.y - 14,
            width: this.width, height: this.height + this.lines.length * 15,
            fill: "white", "stroke-width": 0.5, stroke: "black"
        });

        g.append("text").attrs({
            x: this.x + 20, y: this.y,
            "font-size": "12px", "font-family": "sans-serif",
        }).text(this.title);

        g.append("circle").attrs({
            cx: this.x + 5, cy: this.y - 4, r: 5,
            class: "circles",
            status: this.status,
        });

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
        this.x = X(this.map.projection(coordinates(this.coordinates)))/this.scale;
        this.y = Y(this.map.projection(coordinates(this.coordinates)))/this.scale + this.offset;
    }
}

function extendData(d, latestVlinderData) {
    for (var i = 0; i < latestVlinderData.length; i++) {
        console.log("lol" + i)
        if (latestVlinderData[i].id == d.id) {
            var obj = latestVlinderData[i];
            for (var prop in obj) {
                d[prop] = obj[prop];
            }
        }
    }
    return d;
}

export default function popup(root, map, latestVlinderData) {
    let popup = new Popup(map, 2);

    root.on("mouseover.popup", function (d) {
        d = extendData(d, latestVlinderData);
        popup.set_data(d);
        popup.set_title(d.name);
        popup.add_line((d.time ? new Date(d.time) : new Date()).toLocaleString());
        popup.add_line("🌡 " + d.temp + "°C\t" + "🌧️ " + d.humidity + "%");
        
        popup.display(true)
    });

    root.on("mouseout.popup", _ => {
        popup.display(false);
    });

    map.zoom.on("zoom.popup", _ => {
        popup.update(d3.event.transform.k);
    })
}
