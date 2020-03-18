<template>
    <div style="height: 100vh; display: flex; flex-flow: column">
        <b-navbar toggleable="lg" type="dark" variant="info">
            <b-navbar-brand href="/">Vlinder</b-navbar-brand>

            <b-navbar-toggle target="nav-collapse"></b-navbar-toggle>

            <b-collapse id="nav-collapse" is-nav>
                <!-- Right aligned nav items -->
                <b-navbar-nav class="ml-auto">
                </b-navbar-nav>
            </b-collapse>
        </b-navbar>
        <Dashboard style="flex: 1;"></Dashboard>
        <footer style="text-align: center; width: 100%; color: grey; font-size: small">
            Project Datavisualisatie UGent
        </footer>
    </div>
</template>

<script>
    import Dashboard from "@/components/Dashboard";

    export default {
        name: 'Home',
        components: {
            Dashboard
        }
    }
</script>
