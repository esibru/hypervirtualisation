import { defineConfig } from 'vitepress'
import footnote from 'markdown-it-footnote'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "Hypervirtualisation",
  titleTemplate: 'HYP - :title',
  description: "Notes de cours",
  lang: 'fr-be',
  base: '/hypervirtualisation',
  srcDir: './src',
  outDir: './public',
  lastUpdated: true,
  head: [
    ['link', { rel: 'stylesheet', href: 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css' }]
  ],
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: 'Cours', link: '/' }
    ],

    sidebar: [
      {
        text: 'Cours',
        items: [
          { text: 'Virtualisation', link: '/virtualisation' },
          { text: 'Réseau', link: '/reseaux' },
          { text: 'Stockage', link:  '/stockage'},
          { text: 'Conteneurisation', link: '/conteneurisation'},
          { text: 'Virtualisation 2', link: '/virtualisation-2'},
          { text: 'Automatisation (Ansible)', link: '/ansible'}
        ]
      },
      {
        text: 'Ressources',
        items: [
            { text: 'Outils', link : '/outils'},
            { text: 'Bridge', link: '/bridge'},
            { text: 'RAID', link: '/raid'},
            { text: 'LVM', link: '/lvm'},
            { text: 'NFS', link: '/nfs'},
            { text: 'iSCI', link: '/isci'},
            { text: 'Docker', link: '/docker'},
            { text: 'Cloud-init', link: '/cloud-init'}
        ]
      },
      {
        text: '…',
        items: [
            { text: 'Organisation', link: '/organisation'},
            { text: 'Sources', link: '/sources'}
        ]
      },
    ],

    socialLinks: [
        { icon: 'github', link: 'https://github.com/esibru/hypervirtualisation' }
    ],

    lastUpdated: {
      text: "Mise à jour le",
      formatOptions: {
        dateStyle: 'full',
        timeStyle: 'short'
      }
    },

    footer: {
        copyright: 'CC-BY 2025-2026 ♥'
    },

    search: {
        provider: 'local'
    },
    
    outline: {
        level: [2, 3]  // Affiche les titres de niveau 2 et 3
    }
  },
  markdown: {
      container: {
        tipLabel: 'ASTUCE',
        warningLabel: 'REMARQUE',
        dangerLabel: 'ATTENTION',
        infoLabel: 'INFO',
        detailsLabel: 'Détails ⬇'
      },
      config: (md) => {
        md.use(footnote)
      }
  }
})
