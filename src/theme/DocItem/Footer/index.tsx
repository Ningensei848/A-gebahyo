import clsx from 'clsx'

import LastUpdated from '@theme/LastUpdated'
import EditThisPage from '@theme/EditThisPage'

import NextShare from '@site/src/components/NextShareButtons'

import styles from './styles.module.css'

import { ThemeClassNames } from '@docusaurus/theme-common'
import { useDoc } from '@docusaurus/theme-common/internal'

import { type DocContextValue } from '@docusaurus/theme-common/internal'
import TagsListInline, {
    type Props as TagsListInlineProps,
} from '@theme/TagsListInline'

function TagsRow(props: TagsListInlineProps) {
    return (
        <div
            className={clsx(
                ThemeClassNames.docs.docFooterTagsRow,
                'row margin-bottom--sm',
            )}
        >
            <div className='col'>
                <TagsListInline {...props} />
            </div>
        </div>
    )
}

type EditMetaRowProps = Pick<
    DocContextValue['metadata'],
    'editUrl' | 'lastUpdatedAt' | 'lastUpdatedBy' | 'formattedLastUpdatedAt'
>
function EditMetaRow({
    editUrl,
    lastUpdatedAt,
    lastUpdatedBy,
    formattedLastUpdatedAt,
}: EditMetaRowProps) {
    return (
        <div
            className={clsx(ThemeClassNames.docs.docFooterEditMetaRow, 'row')}
        >
            <div className='col'>
                {editUrl && <EditThisPage editUrl={editUrl} />}
            </div>

            <div className={clsx('col', styles.lastUpdated)}>
                {(lastUpdatedAt || lastUpdatedBy) && (
                    <LastUpdated
                        lastUpdatedAt={lastUpdatedAt}
                        formattedLastUpdatedAt={formattedLastUpdatedAt}
                        lastUpdatedBy={lastUpdatedBy}
                    />
                )}
            </div>
        </div>
    )
}

export default function DocItemFooter(): JSX.Element | null {
    const { metadata } = useDoc()
    const {
        editUrl,
        lastUpdatedAt,
        formattedLastUpdatedAt,
        lastUpdatedBy,
        tags,
        // シェアボタンに必要な props を追加 ----------
        title,
        permalink,
        // ---------------------------------------
    } = metadata

    const canDisplayTagsRow = tags.length > 0
    const canDisplayEditMetaRow = !!(editUrl || lastUpdatedAt || lastUpdatedBy)

    const canDisplayFooter = canDisplayTagsRow || canDisplayEditMetaRow

    if (!canDisplayFooter) {
        return null
    }

    return (
        <footer
            className={clsx(
                ThemeClassNames.docs.docFooter,
                'docusaurus-mt-lg',
            )}
        >
            {canDisplayTagsRow && <TagsRow tags={tags} />}
            {/* SNS 等のシェアボタンを設置 */}
            <NextShare href={permalink} title={title} />
            {canDisplayEditMetaRow && (
                <EditMetaRow
                    editUrl={editUrl}
                    lastUpdatedAt={lastUpdatedAt}
                    lastUpdatedBy={lastUpdatedBy}
                    formattedLastUpdatedAt={formattedLastUpdatedAt}
                />
            )}
        </footer>
    )
}
