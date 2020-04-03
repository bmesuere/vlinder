<template>
    <div>
        <b-container fluid="xl">

            <b-row>
                <b-col>
                    <line-chart-visualization
                            y-axis-label="Neerslagsom"
                            :y-axis-getter="(d) => d.rainVolume"
                            :colors="['#5DBE55', '#926DA5', '#2B92BE']"
                            :selected-stations="['jvy7zdAPZ5ymI2hydh6tvnmm', '0xwg6AsDvbnxXzB4S3c2BRyJ']"
                            :enable-area=true
                            :width="400"
                            :height="250"
                            style="padding: 5em"
                    />
                </b-col>
                <b-col>
                    <line-chart-visualization
                            y-axis-label="Luchtdruk"
                            :y-axis-getter="(d) => d.pressure"
                            :colors="['#5DBE55', '#926DA5', '#2B92BE']"
                            :selected-stations="['jvy7zdAPZ5ymI2hydh6tvnmm', '0xwg6AsDvbnxXzB4S3c2BRyJ']"
                            :width="400"
                            :height="250"
                            style="padding: 5em"
                    />
                </b-col>
            </b-row>
            <b-row align-v="center">
                <b-col>
                    <example-visualization style="padding: 5em"/>
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