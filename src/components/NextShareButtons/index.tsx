// cf. https://github.com/Bunlong/next-share
import {
    TwitterShareButton,
    TwitterIcon,
    LineShareButton,
    LineIcon,
    FacebookShareButton,
    FacebookIcon,
    WeiboShareButton,
    WeiboIcon,
    PocketShareButton,
    PocketIcon,
    HatenaShareButton,
    HatenaIcon,
    RedditShareButton,
    RedditIcon,
    TelegramShareButton,
    TelegramIcon,
} from 'next-share'

import styles from '@site/src/css/NextShareButtons.module.css'

import { useEffect, useState } from 'react'
import { useDebounce } from '@site/src/libs/debounce'

interface CommonProps {
    url: string
    title: string
}

interface NextShareButtonProps {
    href?: string
    title?: string
}

interface SocialButtonsProps extends NextShareButtonProps {
    onHover: () => void
}

const HashTag = '上馬評で下す'

const IconProps = {
    size: 32,
    round: true,
}

function Facebook(props: CommonProps): JSX.Element {
    return (
        <FacebookShareButton {...props} quote={props.title} hashtag={HashTag}>
            <FacebookIcon {...IconProps} />
        </FacebookShareButton>
    )
}

function Twitter(props: CommonProps): JSX.Element {
    return (
        <TwitterShareButton
            {...props}
            hashtags={[HashTag]}
            related={['A_gebahyo', 'netkeiba']}
        >
            <TwitterIcon {...IconProps} />
        </TwitterShareButton>
    )
}

function Line(props: CommonProps): JSX.Element {
    return (
        <LineShareButton {...props}>
            <LineIcon {...IconProps} />
        </LineShareButton>
    )
}

function Weibo(props: CommonProps): JSX.Element {
    return (
        <WeiboShareButton {...props}>
            <WeiboIcon {...IconProps} />
        </WeiboShareButton>
    )
}

function Pocket(props: CommonProps): JSX.Element {
    return (
        <PocketShareButton {...props}>
            <PocketIcon {...IconProps} />
        </PocketShareButton>
    )
}

function Hatena(props: CommonProps): JSX.Element {
    return (
        <HatenaShareButton {...props}>
            <HatenaIcon {...IconProps} />
        </HatenaShareButton>
    )
}

function Reddit(props: CommonProps): JSX.Element {
    return (
        <RedditShareButton {...props}>
            <RedditIcon {...IconProps} />
        </RedditShareButton>
    )
}

function Telegram(props: CommonProps): JSX.Element {
    return (
        <TelegramShareButton {...props}>
            <TelegramIcon {...IconProps} />
        </TelegramShareButton>
    )
}

function SocialButtons({
    href,
    title,
    onHover: handleEvent,
}: SocialButtonsProps) {
    const common = { url: href, title }

    return (
        <div
            className={styles.SocialButtons}
            onMouseOver={handleEvent}
            onTouchStart={handleEvent}
        >
            <Facebook {...common} />
            <Twitter {...common} />
            <Line {...common} />
            <Weibo {...common} />
            <Pocket {...common} />
            <Hatena {...common} />
            <Reddit {...common} />
            <Telegram {...common} />
        </div>
    )
}

function NextShareButtons({
    href = '',
    title = '',
}: NextShareButtonProps): JSX.Element {
    const [url, setUrl] = useState(href)
    const [subject, setSubject] = useState(title)
    const debounce = useDebounce(200)
    const handleEvent = () =>
        debounce(() => {
            const { origin, pathname, search } = window.location
            const newUrl = [origin, pathname, search].join('')
            if (newUrl !== url) {
                setUrl(newUrl)
            }
        })

    useEffect(() => {
        // title が指定されていないとき， document からページタイトルを持ってくる
        if (document && !title.length) {
            setSubject(document.title)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [url])

    return (
        <SocialButtons
            href={`${url}\n`}
            title={`${subject}\n`}
            onHover={handleEvent}
        />
    )
}

export default NextShareButtons
