<template>
  <v-app>
    <v-app-bar app color="primary" dark dense>
      <v-toolbar-title>VLINDER</v-toolbar-title>

      <v-spacer />

      <v-btn href="http://vlinder.ugent.be" target="_blank" text >
        <span class="mr-2">VLINDER website</span>
        <v-icon>mdi-open-in-new</v-icon>
      </v-btn>
    </v-app-bar>

    <v-main>
      <router-view></router-view>
    </v-main>
    <v-footer padless>
      <v-card class="flex blue-grey darken-4" flat tile >
        <v-card-title class="white--text text-body-2 px-8">
          &copy; {{ new Date().getFullYear() }} Universiteit Gent &middot; v{{ version }}
          <v-spacer></v-spacer>
          <v-btn class="mx-4" dark icon href="https://app.swaggerhub.com/apis-docs/bmesuere/VLINDER/" target="_blank">
            <v-icon size="24px">mdi-api</v-icon>
          </v-btn>
          <v-btn class="mx-4" dark icon href="https://github.com/bmesuere/vlinder" target="_blank">
            <v-icon size="24px">mdi-github</v-icon>
          </v-btn>
          <v-btn class="mx-4" dark icon href="https://twitter.com/VLINDER_project" target="_blank">
            <v-icon size="24px">mdi-twitter</v-icon>
          </v-btn>
        </v-card-title>
      </v-card>
    </v-footer>
  </v-app>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';

@Component({
  components: { }
})
export default class App extends Vue {
  version = '1.0.2'
}
</script>

<style>
  svg {
    display: block;
  }
</style>
