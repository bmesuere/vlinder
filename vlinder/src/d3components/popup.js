import {X, Y} from "../utils/coordinates"

class Popup {
    constructor(map, original_scale) {
        this.map = map;
        this.original_scale = original_scale;
        this.scale = original_scale;
        this.visible = false;
        this.status = status;

        this.lines = []
        this.icons = []
        this.height = 22;
        this.basewidth = 50;
        this.xoffset = 20;
        this.yoffset = -46;
        this.title = "";
        return this;
    }

    set_offset(x, y) {
        this.xoffset = x;
        this.yoffset = y;
    }

    set_coordinates(coordinates) {
        this.coordinates = coordinates;
        this.update_coordinates();
    }

    set_status(status) {
        this.status = status;
    }

    set_title(title) {
        this.title = title.charAt(0).toUpperCase() + title.slice(1);
    }

    add_line(line) {
        this.lines.push(line)
    }

    add_icon(icon) {
        this.icons.push(icon)
    }

    show() {
        if (!this.visible) return;
        const g = this.map.append("g").attr("id", "popup");

        g.attr("transform", `scale(${this.scale}, ${this.scale})`)
        // body
        g.append("rect").attrs({
            x: this.x - 3, y: this.y - 16,
            width: this.getWidth(), height: this.height + this.lines.length * 15,
            fill: "#f3f3f3", "stroke-width": 0.5, stroke: "black",
            rx: 10, ry: 10
        });

        // status
        g.append("circle").attrs({
            cx: this.x + 10, cy: this.y - 5, r: 4,
            class: "circles",
            status: this.status,
        });

        // title
        g.append("text").attrs({
            x: this.x + 20, y: this.y - 1,
            "font-size": "12px", "font-weight": "bold", "fill": "#35495f"
        }).text(this.title);

        var i = 0;
        for (let j = 0; j < this.lines[i].length; j++) {
            g.append("text").attrs({
                x: this.x + 20 + j * 120, y: this.y + (i + 1) * 15,
                "font-size": "11px", "fill": "#35495f"
            }).text(this.lines[i][j]);
        }

        g.append('line')
            .style("stroke", "#35495f")
            .style("stroke-dasharray", ("3, 3"))
            .style("stroke-width", 1)
            .attr("x1", this.x + 10)
            .attr("y1", this.y + 18)
            .attr("x2", this.x + this.getWidth() - 25)
            .attr("y2", this.y + 18); 

        // other lines
        for (i = 1; i < this.lines.length; i++) {
            for (let j = 0; j < this.lines[i].length; j++) {
                g.append("text").attrs({
                    x: this.x + 20 + j * 80, y: this.y + (i + 1) * 15,
                    "font-size": "11px",
                }).text(this.lines[i][j]);
            }
        }

        // icons
        for (let i = 0; i < this.icons.length; i++) {
            g.append("text").attrs({
                x: this.x + 5, y: this.y + (i + 2) * 15,
                "font-size": "11px",
            }).text(this.icons[i]);
        }
    }

    getWidth() {
        let m = this.title.length;
        for (let i = 0; i < this.lines.length; i++) {
            let l = 0;
            for (let j = 0; j < this.lines[i].length; j++) {
                l += this.lines[i][j].length + j * 4
            }
            if (l > m) {
                m = l;
            }
        }
        return this.basewidth + m * 6;
    }

    clear() {
        this.lines = [];
        this.icons = [];
        this.map.selectAll("#popup").transition().duration(10).style("opacity", 0).remove();
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
            this.x = X(this.coordinates)/this.scale + this.xoffset;
            this.y = Y(this.coordinates)/this.scale + this.yoffset;
        }
    }

    add_lines(time, temp, humidity, windSpeed, windDirection, city) {
        let directions = ['N', 'NNO','NO', 'ONO', 'O', 'OZO', 'ZO', 'ZZO', 'Z', 'ZZW', 'ZW', 'WZW', 'W','WNW', 'NW', 'NNW'];
        if (city) this.add_line([time, city]);
        else this.add_line([time])
        
        let index = (Math.floor((parseFloat(windDirection) + 11.25) / 22.5) % 16);
        if (this.status == "Ok") {
            this.add_icon("🌡"); this.add_icon("💧");  this.add_icon("💨")
            this.add_line([temp + "°C"]); this.add_line([humidity + "%"]); this.add_line([windSpeed + "m/s (" + directions[index] +")"]);
        } else {
            this.add_line(["Offline"]);
        }
    }
}

export default function popup(map, original_scale) {
    return new Popup(map, original_scale);
}