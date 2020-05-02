import * as d3 from "d3"
import "d3-selection-multi";
import {coordinates, X, Y} from "../utils/coordinates"

class Popup {

    constructor(map, original_scale, data) {
        this.map = map;
        this.original_scale = original_scale;
        this.scale = original_scale;
        this.visible = false;

        if (data) {
            this.set_data(data);
        }

        this.height = 50;
        this.width = 140;
        this.offset = -46;

        return this;

    }

    set_data(data) {
        this.name = data.name;
        this.status = data.status;
        this.time = data.time;
        this.coordinates = data.coordinates;

        this.update_coordinates();
    }

    show() {
        if (!this.visible || !this.name) return;
        const g = this.map.append("g").attr("id", "popup");

        g.attr("transform", `scale(${this.scale}, ${this.scale})`)
        
        g.append("rect").attrs({
            x: this.x - 3, y: this.y - 14,
            width: this.width, height: this.height,
            fill: "white", "stroke-width": 0.5, stroke: "black"
        });

        g.append("text").attrs({
            x: this.x + 20, y: this.y,
            "font-size": "12px", "font-family": "sans-serif",
        }).text(this.name);

        g.append("circle").attrs({
            cx: this.x + 5, cy: this.y - 4, r: 5,
            class: "circles",
            status: this.status,
        });

        g.append("text").attrs({
            x: this.x, y: this.y + 15,
            "font-size": "12px", "font-family": "sans-serif",
        }).text((this.time ? new Date(this.time) : new Date()).toLocaleString());


        g.append("text").attrs({
            x: this.x, y: this.y + 30,
            "font-size": "12px", "font-family": "sans-serif",
        }).text("no data"); //fix

    }

    clear() {
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
        this.clear();
        this.show();
    }

    update_coordinates() {
        this.x = X(this.map.projection(coordinates(this.coordinates)))/this.scale;
        this.y = Y(this.map.projection(coordinates(this.coordinates)))/this.scale + this.offset;
    }
}

export default function popup(root, map) {
    let popup = new Popup(map, 2);
    
    root.on("mouseover.popup", function (d) {
        popup.set_data(d);
        popup.display(true)
    });

    root.on("mouseout.popup", _ => {
        popup.display(false);
    });

    map.zoom.on("zoom.popup", _ => {
        popup.update(d3.event.transform.k);
    })
}
