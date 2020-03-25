<template>
    <div>
        <b-container style="height: 100%">
            <b-row align-v="center" style="height: 100%">
                <example-visualization style="padding: 5em"/>
            </b-row>
        </b-container>
    </div>
</template>

<script>
    import ExampleVisualization from "./ExampleVisualization";

    export default {
        name: "Dashboard",
        components: {
            ExampleVisualization
        }
    }
</script>

<style scoped>

</style>