<template>
  <v-app>
    <v-app-bar color="primary" density="compact">
      <v-toolbar-title>VLINDER</v-toolbar-title>

      <v-btn href="http://vlinder.ugent.be" target="_blank" variant="text" >
        <span class="mr-2">VLINDER website</span>
        <v-icon>mdi-open-in-new</v-icon>
      </v-btn>
    </v-app-bar>

    <v-main>
      <router-view></router-view>
    </v-main>

    <v-footer class="justify-space-between bg-blue-grey-darken-4">
      <v-card-title class="white--text text-body-2 px-8">
        &copy; {{ new Date().getFullYear() }} Universiteit Gent &middot; v{{ version }}
      </v-card-title>
      <div>
        <v-btn class="mx-4" icon="mdi-api" variant="plain" href="https://app.swaggerhub.com/apis-docs/bmesuere/VLINDER/" target="_blank"></v-btn>
        <v-btn class="mx-4" icon="mdi-github" variant="plain" href="https://github.com/bmesuere/vlinder" target="_blank"></v-btn>
        <v-btn class="mx-4" icon="mdi-twitter" variant="plain" href="https://twitter.com/VLINDER_project" target="_blank"></v-btn>
      </div>
    </v-footer>
  </v-app>
</template>

<style>
.v-application {
  overflow: visible !important;
}
</style>

<script setup lang="ts">
const version = '1.3.0';
</script>
