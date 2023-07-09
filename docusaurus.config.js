// @ts-check
// `@type` JSDoc annotations allow editor autocompletion and type checking
// (when paired with `@ts-check`).
// There are various equivalent ways to declare your Docusaurus config.
// See: https://docusaurus.io/docs/api/docusaurus-config

// load `.env` file under the current dirctory --------------------------------
if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
}
// ----------------------------------------------------------------------------

const { default: remarkEmbedder } = require('@remark-embedder/core')
const {
    default: oembedTransformer,
} = require('@remark-embedder/transformer-oembed')

const lightCodeTheme = require('prism-react-renderer/themes/github')
const darkCodeTheme = require('prism-react-renderer/themes/dracula')

const username = process.env.USERNAME || 'Ningensei848'
const domain = process.env.DOMAIN_NAME || 'ningensei848.github.io'
const repositoryName = process.env.REPOSITORY_NAME || 'a-gebahyo' // Usually your repo name.
const protocol = process.env.FORCE_HTTP ? 'http' : 'https'
const siteUrl = `${protocol}://${domain}`

const pattern_twitter =
    /^https:\/\/twitter\.com\/[a-zA-Z0-9_-]+\/status\/[a-zA-Z0-9?=&]+$/

const isTweetUrl = (url) => {
    return pattern_twitter.test(url)
}

const admonitionIcon = `<span class="admonition-icon"><svg xmlns="http://www.w3.org/2000/svg" width="12" height="16" viewBox="0 0 12 16"><path fill-rule="evenodd" d="M5.05.31c.81 2.17.41 3.38-.52 4.31C3.55 5.67 1.98 6.45.9 7.98c-1.45 2.05-1.7 6.53 3.53 7.7-2.2-1.16-2.67-4.52-.3-6.61-.61 2.03.53 3.33 1.94 2.86 1.39-.47 2.3.53 2.27 1.67-.02.78-.31 1.44-1.13 1.81 3.42-.59 4.78-3.42 4.78-5.56 0-2.84-2.53-3.22-1.25-5.61-1.52.13-2.03 1.13-1.89 2.75.09 1.08-1.02 1.8-1.86 1.33-.67-.41-.66-1.19-.06-1.78C8.18 5.31 8.68 2.45 5.05.32L5.03.3l.02.01z"></path></svg></span>`

const getFailureAdmonition = (url) => `
<div class="admonition admonition-danger alert alert--danger">
  <div class="admonition-heading"><h5>${admonitionIcon}ツイートの埋め込みに失敗しました</h5></div>
  <div class="admonition-content">
    <p>
      <ul><li><a href="${url}" target="_blank" rel="noopener noreferrer"><em>${url}</em></a></li></ul>
      指定されたリンクが間違っている、またはツイートが削除されています😢
      <hr />
      <ul>
        <li><a href="https://gyo.tc/${url}" target="_blank" rel="noopener noreferrer">Web 魚拓</a>で探す</li>
        <li><a href="https://web.archive.org/web/*/${url}" target="_blank" rel="noopener noreferrer">Internet Archive</a> で探す</li>
      </ul>
    </p>
  </div>
</div>`

const handleEmbedError = ({ error, url, transformer }) => {
    if (
        transformer.name !== '@remark-embedder/transformer-oembed' ||
        !isTweetUrl(url)
    ) {
        // we're only handling errors from this specific transformer and the twitter URL
        // so we'll rethrow errors from any other transformer/url
        throw error
    }
    return getFailureAdmonition(url)
}

const remarkOembedderPlugin = [
    remarkEmbedder,
    {
        transformers: [
            [
                oembedTransformer,
                // cf. https://developer.twitter.com/en/docs/twitter-api/v1/tweets/post-and-engage/api-reference/get-statuses-oembed
                {
                    params: {
                        maxwidth: 550,
                        omit_script: true,
                        align: 'center',
                        lang: 'ja',
                        dnt: true,
                    },
                },
            ],
        ],
        handleError: handleEmbedError,
    },
]

// Favicon Generator for perfect icons on all browsers
// cf. https://realfavicongenerator.net/
const pwaHead = [
    {
        tagName: 'link',
        rel: 'apple-touch-icon',
        sizes: '180x180',
        href: '/img/apple-touch-icon.png',
    },
    {
        tagName: 'link',
        rel: 'icon',
        sizes: '32x32',
        href: '/img/favicon-32x32.png',
    },
    {
        tagName: 'link',
        rel: 'icon',
        sizes: '16x16',
        href: '/img/favicon-16x16.png',
    },
    {
        tagName: 'link',
        rel: 'manifest',
        href: '/site.webmanifest',
    },
    {
        tagName: 'link',
        rel: 'mask-icon',
        href: '/img/safari-pinned-tab.svg',
        color: '#2e5e85',
    },
    {
        tagName: 'meta',
        rel: 'apple-mobile-web-app-title',
        content: '気合でなんとか',
    },
    {
        tagName: 'meta',
        rel: 'application-name',
        content: '気合でなんとか',
    },
    {
        tagName: 'meta',
        name: 'theme-color',
        content: '#fefefe',
    },
    {
        tagName: 'meta',
        name: 'apple-mobile-web-app-capable',
        content: 'yes',
    },
    {
        tagName: 'meta',
        name: 'msapplication-TileImage',
        content: '/img/mstile-150x150.png',
    },
    {
        tagName: 'meta',
        name: 'msapplication-TileColor',
        content: '#fefefe',
    },
]

/** @type {import('@docusaurus/types').Config} */
const config = {
    // required ----------------------------------------------------------------
    title: process.env.SITE_TITLE || 'My Site',
    /* Set the production url of your site here */
    url: process.env.SITE_URL || siteUrl,
    /* Set the /<baseUrl>/ pathname under which your site is served */
    /* For GitHub pages deployment, it is often '/<projectName>/' */
    baseUrl: process.env.BASEPATH_NAME
        ? `/${process.env.BASEPATH_NAME}/`
        : '/',
    // -------------------------------------------------------------------------

    tagline: process.env.TAGLINE || 'A-gebahyo: the rest nowhere.',
    favicon: 'img/favicon.ico',

    // GitHub pages deployment config.
    // If you aren't using GitHub pages, you don't need these.
    organizationName: 'Ningensei848', // Usually your GitHub org/user name.
    projectName: repositoryName, // Usually your repo name.

    onBrokenLinks: 'throw',
    onBrokenMarkdownLinks: 'warn',
    trailingSlash: false,

    // Even if you don't use internationalization, you can use this field to set
    // useful metadata like html lang. For example, if your site is Chinese, you
    // may want to replace "en" with "zh-Hans".
    // i18n: {
    //   defaultLocale: 'en',
    //   locales: ['en'],
    // },

    presets: [
        [
            '@docusaurus/preset-classic',
            /** @type {import('@docusaurus/preset-classic').Options} */
            {
                docs: {
                    path:
                        process.env.NODE_ENV === 'production'
                            ? 'content/docs'
                            : 'content/dev',
                    routeBasePath: '/',
                    sidebarPath: require.resolve('./sidebars.js'),
                    remarkPlugins: [],
                    rehypePlugins: [],
                    // beforeDefaultRemarkPlugins: [remarkOembedderPlugin],
                    // beforeDefaultRehypePlugins: [],
                    // showLastUpdateAuthor: false,
                    showLastUpdateTime: true,
                    breadcrumbs: true,
                    // document versioning
                    // https://docusaurus.io/docs/next/versioning#configuring-versioning-behavior
                    // cf. https://docusaurus.io/docs/next/api/plugins/@docusaurus/plugin-content-docs
                    // lastVersion: 'current',
                    // versions: {
                    //     current: {
                    //         label: '0.0.0',
                    //         path: '0.0.0',
                    //     },
                    // },
                },
                blog: false,
                // blog: {
                //     path: 'content/blogs', // Path to the blog content directory on the filesystem, relative to site dir.
                //     routeBasePath: '/blog',
                //     // Please change this to your repo.
                //     editUrl: `https://github.com/Ningensei848/${repositoryName}/edit/main/`,
                //     showReadingTime: false,
                //     blogTitle: process.env.BLOG_TITLE || 'Blog',
                //     blogDescription:
                //         process.env.BLOG_DESCRIPTION || `Ningensei848's Blog`,
                //     blogSidebarCount: process.env.SIDEBAR_COUNT || 'ALL',
                //     blogSidebarTitle:
                //         process.env.SIDEBAR_TITLE || 'All our posts',
                //     beforeDefaultRemarkPlugins: [remarkOembedderPlugin],
                //     feedOptions: {
                //         type: 'all',
                //         title:
                //             process.env.FEED_TITLE ||
                //             process.env.BLOG_TITLE ||
                //             'Blog',
                //         description:
                //             process.env.FEED_DESCRIPTION ||
                //             process.env.BLOG_DESCRIPTION ||
                //             `Ningensei848's Blog`,
                //         copyright:
                //             process.env.FEED_COPYRIGHT ||
                //             `Copyright © ${username}, ${new Date().getFullYear()}`,
                //         language: process.env.FEED_LANGUAGE || 'ja-JP',
                //     },
                // },
                theme: {
                    customCss: require.resolve('./src/css/custom.css'),
                },
                sitemap: {
                    changefreq: 'daily',
                    priority: 0.5,
                    ignorePatterns: ['/tags/**'],
                    filename: 'sitemap.xml',
                },
            },
        ],
    ],

    themeConfig:
        /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
        ({
            // Replace with your project's social card
            image: 'img/social-card.jpg',
            docs: {
                sidebar: {
                    hideable: true,
                    autoCollapseCategories: true,
                },
            },
            navbar: {
                title:
                    process.env.LOGO_TITLE ||
                    process.env.SITE_TITLE ||
                    'My Site',
                logo: {
                    alt:
                        process.env.LOGO_TITLE ||
                        process.env.SITE_TITLE ||
                        'My Site Logo',
                    src: (() =>
                        `img/logo.${process.env.LOGO_EXTENSION || 'svg'}`)(), // IIFE
                    srcDark: (() =>
                        `img/logo_dark.${
                            process.env.LOGO_EXTENSION || 'svg'
                        }`)(),
                },
                items: [
                    // {
                    //   type: 'docSidebar',
                    //   sidebarId: 'tutorialSidebar',
                    //   position: 'left',
                    //   label: 'Tutorial',
                    // },
                    process.env.NODE_ENV === 'production'
                        ? { to: '/about', label: 'about', position: 'left' }
                        : {
                              to: '/how-to-contribute',
                              label: 'How to contribute',
                              position: 'left',
                          },
                    {
                        href: 'https://twitter.com/A_gebahyo',
                        position: 'right',
                        className: 'header-twitter-link',
                        'aria-label': 'Author on Twitter',
                    },
                    {
                        href: `https://github.com/Ningensei848/${repositoryName}`,
                        position: 'right',
                        className: 'header-github-link',
                        'aria-label': 'GitHub repository',
                    },
                ],
            },
            footer: {
                style: 'dark',
                logo: {
                    alt:
                        process.env.LOGO_TITLE ||
                        process.env.SITE_TITLE ||
                        'My Site Logo',
                    src: (() =>
                        `img/logo-with-title.${
                            process.env.LOGO_EXTENSION || 'svg'
                        }`)(), // IIFE
                    srcDark: (() =>
                        `img/logo-with-title_dark.${
                            process.env.LOGO_EXTENSION || 'svg'
                        }`)(), // IIFE
                    // Logo URL is set to base URL of your site by default (siteConfig.baseUrl).
                    // Although you can specify your own URL for the logo,
                    // if it is an external link, it will open in a new tab.
                    // href: `${siteUrl}/${repositoryName}`,
                    width: 128,
                    height: 128,
                },
                copyright:
                    process.env.FEED_COPYRIGHT ||
                    `Copyright © ${new Date().getFullYear()} ${username}, Built with Docusaurus.`,
            },
            prism: {
                theme: lightCodeTheme,
                darkTheme: darkCodeTheme,
            },
            metadata: [
                {
                    name: 'twitter:title',
                    content: process.env.SITE_TITLE || 'My Site',
                },
                { 'http-equiv': 'content-language', content: 'ja' },
            ],
        }),
    plugins: [
        [
            '@docusaurus/plugin-pwa',
            {
                pwaHead,
                offlineModeActivationStrategies: [
                    'appInstalled',
                    'standalone',
                    'queryString',
                ],
            },
        ],
        // [
        //   require.resolve('@cmfcmf/docusaurus-search-local'),
        //   {
        //     language: ['ja', 'en']
        //   }
        // ],
        [
            // load Adsense, Twitter widget
            `${__dirname}/src/plugins/injectHeadTag`,
            {
                AD_ID: process.env.GOOGLE_ADSENSE_ID || 'ca-pub-xxxxxxxxxx',
                SITE_VERIFY_ID:
                    process.env.GOOGLE_SITE_VERIFICATION ||
                    'googleXXXXXXXXXXXX',
            },
        ],
        // Caution !! Google Tag Manager must always be loaded last -----------
        // Otherwise, the `<script>` will NOT be loaded in the correct position
        // and may NOT be recognized by search console, etc.
        [
            '@docusaurus/plugin-google-tag-manager',
            {
                containerId: process.env.GOOGLE_TAG_MANAGER_ID || 'GTM-XXXXXX',
            },
        ],
        // Do NOT load plugins below ------------------------------------------
    ],
}

module.exports = config
