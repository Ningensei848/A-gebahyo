import clsx from 'clsx'

import TagsListInline from '@theme/TagsListInline'
import ReadMoreLink from '@theme/BlogPostItem/Footer/ReadMoreLink'

import EditThisPage from '@site/src/components/EditThisPage'
import NextShare from '@site/src/components/NextShareButtons'

import { useBlogPost } from '@docusaurus/theme-common/internal'

import styles from './styles.module.css'

export default function BlogPostItemFooter(): JSX.Element | null {
    const { metadata, isBlogPostPage } = useBlogPost()
    const { tags, title, editUrl, hasTruncateMarker } = metadata

    // A post is truncated if it's in the "list view" and it has a truncate marker
    const truncatedPost = !isBlogPostPage && hasTruncateMarker

    const tagsExists = tags.length > 0

    const renderFooter = tagsExists || truncatedPost || editUrl

    if (!renderFooter) {
        return null
    }

    return (
        <footer
            className={clsx(
                'row docusaurus-mt-lg',
                isBlogPostPage && styles.blogPostFooterDetailsFull,
            )}
        >
            {tagsExists && (
                <div className={clsx('col', { 'col--9': truncatedPost })}>
                    <TagsListInline tags={tags} />
                </div>
            )}
            {/* ----------------------------------------------------------------- */}
            {/* SNS 等のシェアボタンを設置 */}
            {isBlogPostPage && editUrl && (
                <div className='col col--12'>
                    <div className={clsx('row', styles.blogPostFooter)}>
                        <div className='col col--8 margin-vert--sm'>
                            <NextShare />
                        </div>
                        <div
                            className={clsx(
                                'col',
                                'col--4',
                                'margin-vert--sm',
                                styles.editThisPage,
                            )}
                        >
                            <EditThisPage
                                editUrl={editUrl}
                                text='編集をリクエスト'
                            />
                        </div>
                    </div>
                </div>
            )}
            {/* ----------------------------------------------------------------- */}
            {truncatedPost && (
                <div
                    className={clsx('col text--right', {
                        'col--3': tagsExists,
                    })}
                >
                    <ReadMoreLink
                        blogPostTitle={title}
                        to={metadata.permalink}
                    />
                </div>
            )}
        </footer>
    )
}
