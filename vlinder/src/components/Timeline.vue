<template>
  <div>
    <input type="date" id="date" />
    <select id="stations-selector" name="stations" multiple />
    <button type="button" id="submit-timeline">View Timeline</button>
    <div id="timeline-div" />
  </div>
</template>

<script>
import VisualizationMixin from "../mixins/VisualizationMixin";
import vlinderService from "../services/vlinderService";
import * as d3 from "d3";

export default {
  name: "Timeline",
  mixins: [VisualizationMixin],
  async mounted() {
    // This is code is ran on creation of the component

    d3.select("#submit-timeline").on("click", updateData);
    var today = new Date();
    d3.select("#date").attr(
      "value",
      `${today.getFullYear()}-${("0" + today.getMonth()).slice(-2)}-${(
        "0" + today.getDay()
      ).slice(-2)}`
    );

    var stations = await vlinderService.getStations(d => {
      var data = [];
      for (var i in d.data) {
        data.push(d.data[i]);
      }
      return data;
    });

    d3.select("#stations-selector")
      .selectAll("option")
      .data(stations)
      .enter()
      .append("option")
      .attr("value", d => d.ID)
      .append("text")
      .text(d => d.VLINDER);

    var selectedDate = new Date(d3.select("#date").property("value"));
    var [startDate, endDate] = getBoundaries(selectedDate);

    let selectedStations = ["jvy7zdAPZ5ymI2hydh6tvnmm", "2MDSH0xR5dG2plS7R9ZLNutq"];
    
    construct_graph(selectedStations, startDate, endDate);

    async function construct_graph(selectedStations, startDate, endDate) {
        let dist = 38;
        let stroke_width = 20;
        let bar_padding = 1;
        let height = (selectedStations.length + 1) * stroke_width;

        d3.select("#timeline-div")
            .selectAll("g")
            .enter()
            .remove()

        let graph = d3
            .select("#timeline-div").html("")
            .append("svg")
            .attr("height", height)
            .attr(
                "viewBox",
                "0 0 " + (288 * dist + stroke_width + 20) + " " + height
            )
            .attr("direction", "ltr");
        
        const xScale = d3
        .scaleTime()
        .domain([startDate, new Date(endDate.getTime() + 5 * 60000)])
        .range([20, 288 * dist + 20]);

        const yScale = d3
        .scaleLinear()
        .domain([0, selectedStations.length + 1])
        .range([0, height]);

        xScale.ticks(d3.timeMinute, 5);

        const xAxis = d3.axisBottom() // create a new bottom axis
            .scale(xScale); // that uses the domain of the xScale
        xAxis.ticks(288);

        graph
            .append("g")
            .attr("class", "axis")
            .attr("transform", `translate(0, ${height -  20})`)
            .call(xAxis);

        var promises = []
        var i = 0;

        for (i = 0; i < selectedStations.length; i++) {
            promises.push(vlinderService.getVlinderData(
                selectedStations[i],
                startDate,
                endDate,
                d => {
                    var dataset = fillMissingData(d.data);
                    let a = graph.append("g");

                    a
                    .selectAll("rect")
                    .data(dataset)
                    .enter()
                    .append("rect")
                    .style("opacity", 0.0)
                    .attr("x", d => xScale(new Date(d.time)))
                    .attr("y", d => yScale(selectedStations.indexOf(d.id)))
                    .attr("width", 0)
                    .attr("height", stroke_width - bar_padding)
                    .classed("bar", true)
                    .classed("ok", d => d.status === "ok")
                    .classed("missing", d => d.status === "missing")
                    .classed("niet-ok", d => d.status !== "ok" && d.status !== "missing")
                    .transition()
                    .style("opacity", 1.0)
                    .attr("width", dist - bar_padding)
                    .duration(1000)
                }
            ));
        }

        await Promise.all(promises);

        // TODO: names on y axis (might have to do that purely with adding text)
    }

    function fillMissingData(ddata) {
        let data = [];
        data.push(ddata[0])
        for (var i = 0; i < ddata.length - 1; i++){
            let diff = new Date(ddata[i+1].time).getTime() - new Date(ddata[i].time).getTime();
            if (diff > 300000) {
                let inserts = (diff/300000);
                var date = new Date(ddata[i].time);
                for (var j = 0; j < inserts - 1; j++) {
                    date.setTime(date.getTime() + 300000)
                    data.push({time: date, status:"missing", id: ddata[i].id})
                }
            }
            data.push(ddata[i+1])
        }
        return data;
    }

    function getBoundaries(date) {
        var start = new Date(date);
        start.setTime(start.getTime() - 3600000)
        var end = new Date(start);
        end.setDate(start.getDate() + 1);
        console.log(start, end)
        return [start, end]
    }

    function updateData() {
      var date = new Date(d3.select("#date").property("value"));
      var stations = d3.select("#stations-selector").node().selectedOptions;
      var selectedIds = [];
      for (var station of stations) {
        selectedIds.push(station.value);
      }
      console.log(selectedIds);
      var [start, end] = getBoundaries(date);
      construct_graph(selectedIds, start, end);
      
    }
  }
};
</script>

<style>
.ok {
  fill: green;
}

.missing {
    fill: grey;
}

.bar.ok:hover {
  fill: lightgreen;
}

.bar.missing:hover {
    fill:lightgray
}

.dot.ok {
  fill: white;
  stroke: green;
  stroke-width: 4px;
}

.dot.ok:hover {
  fill: lightgreen;
}

.niet-ok {
  fill: red;
}

.dot.niet-ok {
  fill: white;
  stroke: red;
  stroke-width: 4px;
}

.dot.niet-ok:hover {
  fill: salmon;
}

.bar.niet-ok:hover {
  fill: salmon;
}

.dot:hover {
  cursor: pointer;
}

.bar:hover {
  cursor: pointer;
}

div #timeline-div {
  overflow: auto;
  direction: rtl;
  width: 1000px;
  scrollbar-color: #ccdbee #eeeeff; /* thumb and track color */
  scrollbar-width: thin;
  padding-top: 20px;
}
div.status {
  display: inline-block;
  width: 20px;
  height: 20px;
  margin: 1px;
  background-color: green;
}
</style>