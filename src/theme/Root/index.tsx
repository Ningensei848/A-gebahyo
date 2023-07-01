import { useTweetEmbed } from '@site/src/libs/twitter'

// Default implementation, that you can customize
// @see cf. https://docusaurus.io/docs/advanced/swizzling#wrapper-your-site-with-root
export default function Root({
    children,
}: {
    children: ChildNode
}): JSX.Element {
    // 埋め込みツイートをアクティベートする（単なる blockquote が tweet widget になる）
    useTweetEmbed()

    return <>{children}</>
}
