<template>
    <div>
        <b-container style="height: 100%">
            <b-row align-v="center" style="height: 100%">
                <temperature style="padding: 5em"/>
            </b-row>
        </b-container>
    </div>
</template>

<script>
    import temperature from "./Temperature";

    export default {
        name: "Dashboard",
        components: {
            temperature
        }
    }
</script>

<style scoped>

</style>