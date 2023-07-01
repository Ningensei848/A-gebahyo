import styles from './styles.module.css'

type WakuColorProps = {
    waku: string | number
    children: React.ReactNode
}

// @see src/components/RankTransition/indx.tsx
const color_code_of_waku = {
    // cf. https://www.jra.go.jp/kouza/yougo/w390.html
    // 1枠＝白、2枠＝黒、3枠＝赤、4枠＝青、5枠＝黄、6枠＝緑、7枠＝橙、8枠＝桃
    1: 'white', // '#c0c0c0'
    2: 'black', // '#0a0017',
    3: 'red', // '#ff0000',
    4: 'blue', // '#1e90ff',
    5: 'yellow', // '#ffd700',
    6: 'green', // '#00ff00',
    7: 'orange', // '#ff8000',
    8: 'pink', // '#ff69b4',
}

export default function WakuColor({
    waku,
    children,
}: WakuColorProps): JSX.Element {
    const color = getStyleColor(waku)
    return <span className={styles[color]}>{children}</span>
}

function getStyleColor(waku: string | number): string {
    const num = typeof waku === 'number' ? waku : parseInt(waku, 10)

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return color_code_of_waku[num]
}
