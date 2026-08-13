/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  const component: DefineComponent<{}, {}, unknown>
  export default component
}

declare module 'vuetify'
declare module 'vuetify/lib/components'
declare module 'vuetify/lib/directives'
// Resolves to a .css file, which TS 6 refuses to side-effect import without a declaration
declare module 'vuetify/styles'
