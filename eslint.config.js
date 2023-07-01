// Originally, this notation below would be used, but since docusaurus v2.2 is not supported, `commonjs`(require) is used instead.
/*
import { fileURLToPath } from 'url'
import { dirname } from 'path'

import typescriptESlintParser from '@typescript-eslint/parser'
import typescriptESlintPlugin from '@typescript-eslint/eslint-plugin'
import react from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'
import prettier from 'eslint-config-prettier'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
*/

// Workaround: docusaurus v2.2 NOT yet ESM compliant, so adapt to commonjs -------------------------------------------
const typescriptESlintParser = require('@typescript-eslint/parser')
const typescriptESlintPlugin = require('@typescript-eslint/eslint-plugin')
const react = require('eslint-plugin-react')
const reactHooks = require('eslint-plugin-react-hooks')
const prettier = require('eslint-config-prettier')
const js = require('@eslint/js')
// -------------------------------------------------------------------------------------------------------------------

const typescriptParserOptions = {
    // cf. https://github.com/typescript-eslint/typescript-eslint/tree/main/packages/parser
    parser: typescriptESlintParser, // imported from "@typescript-eslint/parser"
    /** @type {import('@typescript-eslint/parser').ParserOptions} */
    parserOptions: {
        tsconfigRootDir: __dirname,
        project: ['./tsconfig.json'],
        ecmaFeatures: {
            jsx: true,
        },
        ecmaVersion: 2022,
    },
    sourceType: 'module',
    globals: {
        React: true,
        JSX: true,
    },
}

// CAUTION: Cascading configuration objects
// > When more than one configuration object matches a given filename,
// > the configuration objects are merged with later objects overriding previous objects when there is a conflict.
// cf. https://eslint.org/docs/latest/user-guide/configuring/configuration-files-new#cascading-configuration-objects
const flatConfig = [
    /** Predefined Configs ----------------------------------------------------------------------------------------- */
    // cf. https://eslint.org/docs/latest/user-guide/configuring/configuration-files-new#using-predefined-configurations
    js.configs.recommended,
    /** ------------------------------------------------------------------------------------------------------------ */
    // If you want to use configuration included in a plugin, you must `import` object and refer to the property as follows:
    // cf. https://eslint.org/docs/latest/user-guide/configuring/configuration-files-new#using-configurations-included-in-plugins
    // typescriptESlintPlugin.configs.recommended, // <--- "plugin:@typescript-eslint/recommended",
    //   typescriptESlintPlugin.configs.recommended-requiring-type-checking,  // <--- "plugin:@typescript-eslint/recommended-requiring-type-checking"
    /** ------------------------------------------------------------------------------------------------------------ */
    prettier, // <--- "prettier"
    /** ------------------------------------------------------------------------------------------------------------ */
    /** Global ignore -----------------------------------------------------------------------------------------------*/
    // cf. https://eslint.org/docs/latest/user-guide/configuring/configuration-files-new#globally-ignoring-files-with-ignores
    // Note: "**/node_modules/**", ".git/**" are default patterns (No need to specify)
    {
        ignores: [
            '.docusaurus/*',
            'build/*',
            '*.config.js',
            'src/**/*.js',
            'src/libs/tweetBot/*',
        ],
    },

    /** ------------------------------------------------------------------------------------------------------------ */
    /** Global Rules ----------------------------------------------------------------------------------------------- */
    // cf. https://eslint.org/docs/latest/user-guide/configuring/configuration-files-new#configuring-rules
    {
        rules: {
            semi: ['error', 'never'], // semi coron は使わない
        },
    },
    /** ------------------------------------------------------------------------------------------------------------ */
    /** languageOptions -------------------------------------------------------------------------------------------- */
    // An object containing settings related to how JavaScript is configured for linting
    // cf. https://eslint.org/docs/latest/user-guide/configuring/configuration-files-new#configuring-language-options
    {
        files: ['src/**/*.js', 'src/**/*.ts', 'src/**/*.tsx'],
        languageOptions: typescriptParserOptions,
        plugins: {
            // cf. https://github.com/typescript-eslint/typescript-eslint/tree/main/packages/eslint-plugin
            '@typescript-eslint': typescriptESlintPlugin,
            // cf. https://github.com/jsx-eslint/eslint-plugin-react
            react: react,
            // cf. https://github.com/facebook/react/tree/main/packages/eslint-plugin-react-hooks
            'react-hooks': reactHooks,
        },
        rules: {
            /** Spread Syntax */
            // cf. https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Operators/Spread_syntax
            ...typescriptESlintPlugin.configs['eslint-recommended']
                .overrides[0].rules,
            ...typescriptESlintPlugin.configs.recommended.rules,
            ...typescriptESlintPlugin.configs[
                'recommended-requiring-type-checking'
            ].rules,
            ...react.configs.recommended.rules,
            ...reactHooks.configs.recommended.rules,
        },
        settings: {
            react: {
                version: '18.0',
            },
        },
    },
    /** ------------------------------------------------------------------------------------------------------------ */
]

module.exports = flatConfig
