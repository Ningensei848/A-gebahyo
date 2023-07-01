import clsx from 'clsx'

import Translate from '@docusaurus/Translate'
import Heading from '@theme/Heading'
import BrowserOnly from '@docusaurus/BrowserOnly'

import type { Props } from '@theme/NotFound/Content'

export default function NotFoundContent({ className }: Props): JSX.Element {
    return (
        <main className={clsx('container margin-vert--xl', className)}>
            <div className='row'>
                <div className='col col--6 col--offset-3'>
                    <Heading as='h1' className='hero__title'>
                        <Translate
                            id='theme.NotFound.title'
                            description='The title of the 404 page'
                        >
                            Page Not Found
                        </Translate>
                    </Heading>
                    <p>
                        <Translate
                            id='theme.NotFound.p1'
                            description='The first paragraph of the 404 page'
                        >
                            We could not find what you were looking for.
                        </Translate>
                    </p>
                    <p>
                        <Translate
                            id='theme.NotFound.p2'
                            description='The 2nd paragraph of the 404 page'
                        >
                            Please contact the owner of the site that linked
                            you to the original URL and let them know their
                            link is broken.
                        </Translate>
                    </p>
                    <div>
                        <UserFlowToArchivingSite />
                    </div>
                </div>
            </div>
        </main>
    )
}

function UserFlowToArchivingSite(): JSX.Element {
    // cf. https://docusaurus.io/docs/docusaurus-core#browseronly
    return <BrowserOnly>{() => <LinkToArchivingSite />}</BrowserOnly>
}

function LinkToArchivingSite(): JSX.Element {
    const { origin, pathname, search } = window.location
    const url = [origin, pathname, search].join('')

    return (
        <>
            <p>または、各アーカイブサイトをご確認ください:</p>
            <ul>
                <li>
                    <a
                        href={`https://gyo.tc/${url}`}
                        target='_blank'
                        rel='noopener noreferrer'
                    >
                        ウェブ魚拓
                    </a>
                </li>
                <li>
                    <a
                        href={`https://web.archive.org/web/*/${url}`}
                        target='_blank'
                        rel='noopener noreferrer'
                    >
                        Internet Archive
                    </a>
                </li>
                <li>
                    <a
                        href={`https://archive.md/${url}`}
                        target='_blank'
                        rel='noopener noreferrer'
                    >
                        archive.today
                    </a>
                </li>
            </ul>
        </>
    )
}
