
import Callable from "../utils/callable"
import * as d3 from "d3"
import "d3-selection-multi";
import LList from "../utils/LList.js"

const coordinates = ({longitude,latitude}) => [longitude,latitude];
const X = ([x,]) => x
const Y = ([,y]) => y

export default class Stations extends Callable {
    guests = new LList();

    __call__(map) {
        const self = this
        this.group = map.append("g")
        const circles = this.group.selectAll("g").data(d => d.stations)
        .join(
            enter=>{
                const g = enter.append("g")
                const c = g.append("circle").attrs({
                    class: "circles", selected: false, r: "3px",
                    cx: (d) => X(map.projection(coordinates(d.coordinates))),
                    cy: (d) => Y(map.projection(coordinates(d.coordinates))),
                })
                for (let guest of self.guests) guest.enter(g);
                return c;
            },
            update => {
                for (let guest of self.guests) guest.update(update.select("g"));
                return update;
            },
            exit => {
                for (let guest of self.guests) guest.exit(exit.select("g"));
                return exit.remove();
            }
        );
        map.zoom.on("zoom.circles",()=>{
            const t = d3.event.transform;
            circles.attrs({r:3/Math.pow(t.k,0.5),});
        })
    }

    join(enter, update = d=>d, exit = d=>d.remove()) {
        enter(this.group.selectAll("g"))
        return this.guests.push({enter,update,exit})
    }
}
