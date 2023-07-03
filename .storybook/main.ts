import type { StorybookConfig } from '@storybook/react-webpack5'

const config: StorybookConfig = {
    stories: ['../src/**/*.stories.@(js|jsx|ts|tsx)'],
    staticDirs: ['../static'],
    core: {
        enableCrashReports: true,
        builder: {
            name: '@storybook/builder-webpack5',
            options: {
                fsCache: true,
                lazyCompilation: true,
            },
        },
    },
    addons: [
        '@storybook/addon-links',
        '@storybook/addon-essentials',
        '@storybook/addon-interactions',
    ],
    framework: {
        name: '@storybook/react-webpack5',
        options: {},
    },
    docs: {
        autodocs: 'tag',
    },
}
export default config
