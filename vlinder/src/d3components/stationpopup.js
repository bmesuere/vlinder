import * as d3 from "d3"
import "d3-selection-multi";

function make_popup(root){
    console.log("wello");
    console.log(root)
    const g = root.append("g").attr("id","popup");



    const h = 50;
    const x = 2.5;
    const offset = 10;
    const y = offset + 4;

    g.append("rect").attrs({
        x: x - 3, y: y - 14,
        width: 140, height: h,
        fill: "white", "stroke-width": 0.5, stroke: "black",
    });

    g.append("text").attrs({
        x: x + 20, y,
        "font-size": "12px", "font-family": "sans-serif",
    }).text(d => d.name);

    g.append("circle").attrs({
        cx: x + 5, cy: y - 4, r: 5,
        class: "circles",
        status: d => d.status
    });

    g.append("text").attrs({
        x, y: y + 15,
        "font-size": "12px", "font-family": "sans-serif",
    }).text(d => (d.time ? new Date(d.time) : new Date()).toLocaleString());


    g.append("text").attrs({
        x, y: y + 30,
        "font-size": "12px", "font-family": "sans-serif",
    }).text("no data"); //fix

}

function remove_popup(root) {
    root.selectAll("#popup").remove();
}


export default function popup(selection) {
    console.log("hello");
    console.log({selection});
    console.log(selection.parentNode);
    selection.on("mouseover.debug",() => console.log("qello"));
    selection.on("mouseover.popup",function () {make_popup(d3.select(this.parentNode));});
    selection.on("mouseout.popup" ,function () { remove_popup(d3.select(this.parentNode));});
}
