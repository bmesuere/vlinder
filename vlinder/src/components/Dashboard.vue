<template>
    <div>
        <b-container style="height: 100%">
            <b-row align-v="center" style="height: 50%">
                <example-visualization style="padding: 5em"/>
            </b-row>
            <b-row align-v="center" style="height: 50%">
                <timeline/>
            </b-row>
        </b-container>
    </div>
</template>

<script>
    import ExampleVisualization from "./ExampleVisualization";
    import Timeline from "./Timeline";
    
    export default {
        name: "Dashboard",
        components: {
            ExampleVisualization,
            Timeline
        }
    }
</script>

<style scoped>

</style>