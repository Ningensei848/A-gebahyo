import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    ResponsiveContainer,
} from 'recharts'

interface RankTransitionProps {
    id: string
    width?: string | number
    height?: string | number
    minWidth?: string | number
    minHeight?: string | number
    data: Array<{
        race_id: string
        rank: number
        rank_at_corner: string
        waku: string
    }>
}

function RankTransition(props: RankTransitionProps): JSX.Element {
    const [values, stroke_color] = getValues(props)
    const race_id_list = Object.keys(values[0]).filter((v) => v !== 'name')

    return (
        <ResponsiveContainer {...props}>
            <LineChart
                width={500}
                height={300}
                data={values}
                margin={{
                    top: 5,
                    right: 10, // 30,
                    left: -20, // 20,
                    bottom: 5,
                }}
            >
                <CartesianGrid strokeDasharray='3 3' fill='whitesmoke' />
                <XAxis dataKey='name' padding={{ left: 30, right: 30 }} />
                <YAxis
                    reversed
                    padding={{ top: 20, bottom: 20 }}
                    // type='category'
                    domain={[1, (dataMax: number) => Math.max(dataMax, 16)]}
                    unit='位'
                />
                {/* TODO: ToolTip をカスタマイズする（どのように？） */}
                {/* <Tooltip /> */}
                {/* <Legend /> */}
                {race_id_list.map((race_id) => (
                    <Line
                        key={race_id}
                        type='monotone'
                        dataKey={race_id}
                        stroke={stroke_color[race_id]}
                        strokeWidth={1.5}
                    />
                ))}
            </LineChart>
        </ResponsiveContainer>
    )
}

type RankValueData =
    | {
          name: string
      }
    | {
          // {race_id: rank } is converted from string to number
          [key: string]: number
      }

type StrokeColor = {
    [key: string]: string
}

const getValues = (
    props: RankTransitionProps,
): [Array<RankValueData>, StrokeColor] => {
    const name_list = ['1c', '2c', '3c', '4c', 'Goal']
    const stroke_color = {}

    const values = name_list.map((name) => {
        return { name }
    })

    props.data.map((item) => {
        const { race_id, rank, rank_at_corner, waku } = item
        stroke_color[race_id] = getWakuColor(waku)
        const corner_rank_list = rank_at_corner.split(/-/)
        corner_rank_list.push(rank.toString())
        const size = corner_rank_list.length

        if (size < 5) {
            // corner_rank_list の先頭に不足分を null で埋める
            // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
            corner_rank_list.unshift(...Array(5 - size).fill(null))
        }

        corner_rank_list.forEach((c_rank, idx) => {
            values[idx][race_id] = parseInt(c_rank, 10)
        })
    })

    // stroke_color ... カラーコードの dict を作る race_id をキーとして waku を値に

    /*
    const values = [
        {
            name: '1c',
            [race_id: string]: rank,
            ...,

        },
        {
            name: '2c',
            [race_id: string]: rank,
            ...,
        }
    ]
    */

    return [values, stroke_color]
}

const color_code_of_waku = {
    1: '#c0c0c0',
    2: '#0a0017',
    3: '#ff0000',
    4: '#1e90ff',
    5: '#ffd700',
    6: '#00ff00',
    7: '#ff8000',
    8: '#ff69b4',
}

const getWakuColor = (waku: string): string =>
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    color_code_of_waku[parseInt(waku, 10)]

export default RankTransition
