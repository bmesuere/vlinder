import pluginVue from 'eslint-plugin-vue'
import vueTs from '@vue/eslint-config-typescript'

export default [
  {
    name: 'app/files-to-lint',
    files: ['**/*.{ts,mts,tsx,vue}'],
  },

  {
    name: 'app/files-to-ignore',
    ignores: [
        '**/dist/**',
        '**/dist-ssr/**',
        '**/coverage/**',
        '.DS_Store',
        'node_modules/',
        '.env.local',
        '.env.*.local',
        'npm-debug.log*',
        'yarn-debug.log*',
        'yarn-error.log*',
        'pnpm-debug.log*',
        '.idea/',
        '.vscode/',
        '*.suo',
        '*.ntvs*',
        '*.njsproj',
        '*.sln',
        '*.sw?'
    ],
  },

  ...pluginVue.configs['flat/essential'],
  ...vueTs(),

  {
      rules: {
          'vue/multi-word-component-names': 'off',
          '@typescript-eslint/ban-ts-comment': 'off'
      }
  }
]
