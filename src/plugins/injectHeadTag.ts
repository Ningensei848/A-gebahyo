import { writeFile } from 'node:fs/promises'

import type { LoadContext } from '@docusaurus/types'
import type { PluginOptions } from '@docusaurus/plugin-content-pages'

type CustomOptions = PluginOptions & {
    AD_ID: string
    SITE_VERIFY_ID: string
}

// Set up Twitter for Websites | Docs | Twitter Developer Platform
// cf. https://developer.twitter.com/en/docs/twitter-for-websites/javascript-api/guides/set-up-twitter-for-websites
const twttr = `
<script>
window.twttr = (function(d, s, id) {
  var js, fjs = d.getElementsByTagName(s)[0],
    t = window.twttr || {};
  if (d.getElementById(id)) return t;
  js = d.createElement(s);
  js.id = id;
  js.src = "https://platform.twitter.com/widgets.js";
  fjs.parentNode.insertBefore(js, fjs);

  t._e = [];
  t.ready = function(f) {
    t._e.push(f);
  };

  return t;
}(document, "script", "twitter-wjs"));
</script>
`
    .split('\n')
    .map((line) => line.trim())
    .join('')

const adsense = (id: string) => {
    return {
        tagName: 'script',
        attributes: {
            async: true,
            src: `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${id}`,
            crossorigin: 'anonymous',
        },
    }
}

// options は `docusaurus.config.js` にてオプション引数として指定する
// eslint-disable-next-line @typescript-eslint/require-await
const plugin = async (context: LoadContext, options: CustomOptions) => {
    return {
        name: 'docusaurus-plugin-inject-html-tags',
        injectHtmlTags() {
            return {
                headTags: [
                    `<link rel='preconnect' href='//fonts.gstatic.com' crossOrigin='anonymous' />\n`,
                    adsense(options.AD_ID),
                    `${twttr}\n`,
                ],
            }
        },
        async postBuild({ outDir }) {
            // generate `ads.txt`
            if (options.AD_ID) {
                const pulisherId = options.AD_ID.replace('ca-', '')
                const snipet = `google.com, ${pulisherId}, DIRECT, f08c47fec0942fa0\n`
                await writeFile(`${outDir as string}/ads.txt`, snipet)
            }

            if (options.SITE_VERIFY_ID) {
                const htmlContent = `google-site-verification: ${options.SITE_VERIFY_ID}.html\n`
                await writeFile(
                    `${outDir as string}/${options.SITE_VERIFY_ID}.html`,
                    htmlContent,
                )
            }
            return // complete
        },
    }
}

export default plugin
