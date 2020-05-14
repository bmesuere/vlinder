<template>
    <div id="app" style="height: 100%">
        <router-view/>
    </div>
</template>

<script>
    import { Settings } from 'luxon';
    Settings.defaultLocale = 'nl';

    export default {
        name: "App",
        created() {
            this.$store.dispatch('loadStations')
        }
    }
</script>

<style>
</style>
