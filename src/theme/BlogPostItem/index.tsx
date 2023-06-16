import React from 'react'
import clsx from 'clsx'
import { useBlogPost } from '@docusaurus/theme-common/internal'
import BlogPostItemContainer from '@theme/BlogPostItem/Container'
import BlogPostItemHeader from '@theme/BlogPostItem/Header'
import BlogPostItemContent from '@theme/BlogPostItem/Content'
import BlogPostItemFooter from '@theme/BlogPostItem/Footer'
import type { Props } from '@theme/BlogPostItem'
import { useBaseUrlUtils } from '@docusaurus/useBaseUrl'

export default function BlogPostItem({
    children,
    className,
}: Props): JSX.Element {
    const { withBaseUrl } = useBaseUrlUtils()
    const { isBlogPostPage, assets, frontMatter } = useBlogPost()
    const containerClassName = !isBlogPostPage
        ? 'margin-bottom--xl'
        : undefined
    const image = assets.image ?? frontMatter.image
    return (
        <BlogPostItemContainer className={clsx(containerClassName, className)}>
            <BlogPostItemHeader />
            {/* ----------------------------------------------------------------------------- */}
            {/* Tips: サムネイル等の画像があれば、それも挿入して表示する */}
            {image && (
                <meta
                    itemProp='image'
                    content={withBaseUrl(image, { absolute: true })}
                />
            )}
            {/* ----------------------------------------------------------------------------- */}
            <BlogPostItemContent>{children}</BlogPostItemContent>
            <BlogPostItemFooter />
        </BlogPostItemContainer>
    )
}
