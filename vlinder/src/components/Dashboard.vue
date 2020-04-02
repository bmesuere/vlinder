<template>
    <div>
        <b-container style="height: 100%">

            <b-row align-v="center" style="height: 100%">
                <b-col>
                    <example-visualization style="padding: 5em"/>
                </b-col>
                <b-col>
                    <line-chart-visualization
                            y-axis-label="Neerslagsom"
                            :colors="['#5DBE55', '#926DA5', '#2B92BE']"
                            :selected-stations="['jvy7zdAPZ5ymI2hydh6tvnmm', '0xwg6AsDvbnxXzB4S3c2BRyJ']"
                            :enable-area=true
                            :width="1000"
                            :height="500"
                            style="padding: 5em"
                    />
                </b-col>
            </b-row>
        </b-container>
    </div>
</template>

<script>
    import ExampleVisualization from "./ExampleVisualization";
    import LineChartVisualization from "./LineChartVisualization";

    export default {
        name: "Dashboard",
        components: {
            ExampleVisualization,
            LineChartVisualization
        }
    }
</script>

<style scoped>

</style>