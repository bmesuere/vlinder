import {X, Y} from "../utils/coordinates"

class Popup {
    constructor(map, original_scale) {
        this.map = map;
        this.original_scale = original_scale;
        this.scale = original_scale;
        this.visible = false;
        this.status = status;

        this.lines = []
        this.height = 20;
        this.basewidth = 40;
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
            width: this.getWidth(), height: this.height + this.lines.length * 15,
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
            x: this.x + 15, y: this.y,
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

    getWidth() {
        let m = this.title.length;
        for (var i = 0; i < this.lines.length; i++) {
            if (this.lines[i].length > m) {
                m = this.lines[i].length;
            }
        }
        console.log(m)
        return this.basewidth + m * 6;
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
        if (this.coordinates) {
            this.x = X(this.coordinates)/this.scale;
            this.y = Y(this.coordinates)/this.scale + this.offset;
        }
    }
}

export default function popup(map, original_scale) {
    return new Popup(map, original_scale);
}