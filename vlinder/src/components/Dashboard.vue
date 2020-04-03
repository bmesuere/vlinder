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
        },
        created () {
            this.$store.dispatch('fetchLatestVlinderData');
            setInterval(() => {
                this.$store.dispatch('fetchLatestVlinderData')
            }, 300000)
        }
    }
</script>

<style scoped>

</style>