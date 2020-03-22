<template>
    <div id="d3-viz">
        <b-button onclick="this.makeSelectionClicked">Make selection</b-button>
        <b-button onclick="showFocusedClicked">Show Focused</b-button>
        <b-button onclick="showAllClicked">Show All</b-button>

        <p v-for="d in this.focusedVlinderData" :key="d.id">{{d.VLINDER}}</p>
    </div>
</template>

<script>
    import VisualizationMixin from "../mixins/VisualizationMixin";

    export default {
        name: "ExampleVisualization",
        mixins: [
            // You can look at the file mixins/visualizationMixin.js
            // All that stuff is automatically added to this component => the computed variables and the methods
            VisualizationMixin
        ],
        created () {
            // This is code is ran on creation of the component
        },
        data () {
            return {
                // Component local data
                displayFocused: false
            }
        },
        watch: {
            // These variables can be interpreted as global variables
            stations () {
                // When 'stations' variable changes this code will be rerun
            },
            vlinderData () {
                // When 'vlinderData' variable changes this code will be rerun
            },
            focusedVlinderData () {
                // When 'focusedVlinderData' variable changes this code will be rerun
            }
        },
        methods: {
            makeSelectionClicked () {
                let focused = [this.vlinderData[3], this.vlinderData[7]];
                this.setFocusedVlinderData(focused)
            },
            showFocusedClicked () {
                this.displayFocused = true

            }
        }
    }
</script>

<style scoped>

</style>