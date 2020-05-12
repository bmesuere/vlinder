<template>
    <div style="height: 100vh; display: flex; flex-flow: column; background-color: #F5F6FA">
        <b-navbar toggleable="lg" type="light" style="background-color: #FFFFFF; box-shadow: 0px 0px 10px 0px rgba(0,0,0,0.10);">
            <b-navbar-brand style="font-weight: bold" href="/">Vlinder</b-navbar-brand>

            <b-navbar-toggle target="nav-collapse"/>

            <b-collapse id="nav-collapse" is-nav>
                <!-- Right aligned nav items -->
                <b-navbar-nav class="ml-auto">
                    <b-nav-item @click="shown = 'dashboard'" :active="shown === 'dashboard'" v-bind:style="shown === 'dashboard' ? 'border-bottom: 3px solid #6685F7;': ''">
                        Dashboard
                    </b-nav-item>
                    <b-nav-item @click="shown = 'status'" :active="shown === 'status'" v-bind:style="shown === 'status' ? 'border-bottom: 3px solid #6685F7;' : ''">
                        Status
                    </b-nav-item>
                </b-navbar-nav>
            </b-collapse>
        </b-navbar>
        <Dashboard :class="shown === 'dashboard' ? '' : 'disabled'" style="flex: 1;"/>
        <Status :class="shown === 'status' ? '' : 'disabled'" style="flex: 1;"/>

        <footer style="text-align: center; width: 100%; color: grey; font-size: small; margin-top: 5vh; background-color: #fff; box-shadow: 0px 0px 10px 0px rgba(0,0,0,0.10);">
            <div class="gallery" style="align-content: center">
                <div class="flex" style="max-width: 100%; padding-top: 40px; padding-bottom: 10px">
                    <img :src="`${publicPath}partners/ugent.png`" alt="" style="max-width:  7%; padding: 1%">
                    <img :src="`${publicPath}partners/vito.png`" alt="" style="max-width: 10%; padding: 1%">
                    <img :src="`${publicPath}partners/vla.jpg`" alt="" style="max-width:  5%; padding: 1%">
                    <img :src="`${publicPath}partners/vvw.png`" alt="" style="max-width: 10%; padding: 1%">
                    <img :src="`${publicPath}partners/vvs.jpg`" alt="" style="max-width:  8%; padding: 1%">
                    <img :src="`${publicPath}partners/kmi.jpeg`" alt="" style="max-width:  7%; padding: 1%">
                    <img :src="`${publicPath}partners/att.png`" alt="" style="max-width: 10%; padding: 1%">
                    <img :src="`${publicPath}partners/volkssterrenwacht.png`" alt="" style="max-width: 6%; padding: 1%">
                    <img :src="`${publicPath}partners/technopolis.png`" alt="" style="max-width: 7%; padding: 1%">
                </div>
            </div>
            ©
            Project Datavisualisatie UGent
            <p>Lucas Belpaire, Sam Coutteau, Flor Delombaerde, Joachim Geers, Tobiah Lissens, Floor Van de Steene</p>
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
                shown: 'dashboard',
                publicPath: process.env.BASE_URL
            }
        }
    }
</script>

<style scoped>
    .disabled {
        display: none;
    }
</style>
