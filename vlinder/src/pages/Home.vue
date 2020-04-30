<template>
    <div style="height: 100vh; display: flex; flex-flow: column">
        <b-navbar toggleable="lg" type="dark" variant="info">
            <b-navbar-brand href="/">Vlinder</b-navbar-brand>

            <b-navbar-toggle target="nav-collapse"/>

            <b-collapse id="nav-collapse" is-nav>
                <!-- Right aligned nav items -->
                <b-navbar-nav class="ml-auto">
                    <b-nav-item @click="shown = 'dashboard'" :active="shown === 'dashboard'">
                        Dashboard
                    </b-nav-item>
                    <b-nav-item @click="shown = 'status'" :active="shown === 'status'">
                        Status
                    </b-nav-item>
                </b-navbar-nav>
            </b-collapse>
        </b-navbar>
        <Dashboard :class="shown === 'dashboard' ? '' : 'disabled'" style="flex: 1;"/>
        <Status :class="shown === 'status' ? '' : 'disabled'" style="flex: 1;"/>
        <footer style="text-align: center; width: 100%; color: grey; font-size: small; padding-top: 2vh">
            Project Datavisualisatie UGent
        </footer>
    </div>
</template>

<script>
    import Dashboard from "@/components/Dashboard";
    import Status from "../components/Status";

    export default {
        name: 'Home',
        components: {
            Dashboard,
            Status
        },
        created() {
            this.$store.dispatch('fetchLatestVlinderData');
            setInterval(() => {
                this.$store.dispatch('fetchLatestVlinderData')
            }, 300000);
        },
        data () {
            return {
                shown: 'dashboard'
            }
        }
    }
</script>

<style scoped>
    .disabled {
        display: none;
    }
</style>
