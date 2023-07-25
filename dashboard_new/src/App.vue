<template>
  <v-app>
    <v-app-bar color="primary" density="compact">
      <v-toolbar-title>VLINDER</v-toolbar-title>

      <v-spacer />

      <v-btn href="http://vlinder.ugent.be" target="_blank" variant="text" >
        <span class="mr-2">VLINDER website</span>
        <v-icon>mdi-open-in-new</v-icon>
      </v-btn>
    </v-app-bar>

    <v-main>
      <HelloWorld />
    </v-main>

    <v-footer class="d-flex flex-row bg-blue-grey-darken-4">
      <v-card-title class="white--text text-body-2 px-8">
        &copy; {{ new Date().getFullYear() }} Universiteit Gent &middot; v{{ version }}
      </v-card-title>
      <v-spacer></v-spacer>
      <v-btn class="mx-4" icon="mdi-api" variant="plain" href="https://app.swaggerhub.com/apis-docs/bmesuere/VLINDER/" target="_blank"></v-btn>
      <v-btn class="mx-4" icon="mdi-github" variant="plain" href="https://github.com/bmesuere/vlinder" target="_blank"></v-btn>
      <v-btn class="mx-4" icon="mdi-twitter" variant="plain" href="https://twitter.com/VLINDER_project" target="_blank"></v-btn>
    </v-footer>
  </v-app>
</template>

<script setup lang="ts">
  import HelloWorld from '@/components/HelloWorld.vue'
</script>
