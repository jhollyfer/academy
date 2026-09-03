import { defineConfig } from 'vite'
import { devtools } from '@tanstack/devtools-vite'
import { paraglideVitePlugin } from '@inlang/paraglide-js'

import { tanstackStart } from '@tanstack/react-start/plugin/vite'

import viteReact, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
import tailwindcss from '@tailwindcss/vite'
import { nitro } from 'nitro/vite'

const config = defineConfig({
  resolve: { tsconfigPaths: true },
  plugins: [
    devtools(),
    paraglideVitePlugin({
      project: './project.inlang',
      outdir: './src/paraglide',
      strategy: ['url', 'baseLocale'],
    }),
    // As opções vão direto no plugin, que é a forma que o tipo declara:
    // `nitro(pluginConfig?: NitroPluginConfig)` com `NitroPluginConfig extends
    // NitroConfig` (nitro/dist/vite.d.mts).
    //
    // A forma antiga daqui, `nitro({ config: { preset } })`, aplicava o preset
    // igual - `dist/vite.mjs` monta a config com
    // `defu(pluginConfig, pluginConfig.config, userConfig.nitro)`, então a
    // chave `config` é lida em runtime. Ela só não consta no tipo, e era isso
    // que deixava o `tsc` vermelho com TS2353.
    //
    // Cravar o preset segue valendo: sem ele o Nitro detecta a plataforma pelas
    // variáveis de ambiente do CI - Vercel, Netlify, Cloudflare e mais cinco se
    // identificam sozinhas - e só cai em `node-server` quando nenhuma responde.
    // É o que o `Dockerfile-production` espera.
    nitro({ preset: 'node-server' }),
    tailwindcss(),
    tanstackStart({
      router: {
        routeToken: 'layout',
      },
      // Só as três que não dependem do banco. A home e a página de curso ficam
      // de fora de propósito: elas leem a API, e o build roda no CI, onde a API
      // não está no ar - o prerender ali geraria HTML de página vazia e o
      // congelaria até o próximo deploy.
      //
      // O `/sitemap.xml` também fica fora: é rota de servidor e precisa
      // responder com a lista de cursos do momento.
      //
      // `crawlLinks: false` em cada uma: por default o prerender segue os links
      // do HTML gerado, e o cabeçalho e o rodapé apontam para a home, para as
      // páginas de curso e para a matrícula - as três que leem a API. Sem
      // desligar, a lista de três vira o site inteiro e o build quebra.
      pages: [
        { path: '/about', prerender: { enabled: true, crawlLinks: false } },
        { path: '/terms', prerender: { enabled: true, crawlLinks: false } },
        {
          path: '/privacy',
          prerender: { enabled: true, crawlLinks: false },
        },
      ],
    }),
    viteReact(),
    babel({ presets: [reactCompilerPreset()] }),
  ],
})

export default config
