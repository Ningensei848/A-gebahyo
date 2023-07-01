import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    Dot,
} from 'recharts'

// 公式でもきちんと型定義していない
// cf. https://github.com/recharts/recharts/blob/7a0950572e89b7bf11d8c44bab6af7b8303e2022/src/cartesian/Line.tsx#L311-L332
type CustomizedDotProps = {
    key?: string
    r?: number
    value?: unknown
    dataKey?: string | number
    cx?: number
    cy?: number
    index?: number
    // data で与えた要素の一つ一つが含まれている
    payload?: { [key: string]: unknown }
}

interface WeightTransitionProps {
    id?: string | number
    width?: string | number
    height?: string | number
    minWidth?: string | number
    minHeight?: string | number
    chartKeywords: string[]
    data: Array<{ [key: string]: string | number }>
}

function VectorizedStar(props: { cx: number; cy: number; color: string }) {
    return (
        <svg
            // xmlns='http://www.w3.org/2000/svg'  // html に埋め込んで使う場合には不要
            x={props.cx - 10}
            y={props.cy - 10}
            width={16}
            height={16}
            fill={props.color}
            viewBox='0 0 24 24'
        >
            <path d='M12 .587l3.668 7.568 8.332 1.151-6.064 5.828 1.48 8.279-7.416-3.967-7.417 3.967 1.481-8.279-6.064-5.828 8.332-1.151z' />
        </svg>
    )
}

function CustomizedDot(props: CustomizedDotProps) {
    const { cx, cy, payload } = props // value はその dot に与えられた値
    const { rank } = payload // payload は value を含む元データの一要素

    // const className = classNames('recharts-line-dot', option ? (option as DotProps).className : '');
    const className = 'recharts-line-dot'

    // rank がそもそも未定義な場合、通常の Dot を返す
    if (!rank) return <Dot {...props} className={className} />

    if (rank == 1) {
        return <VectorizedStar cx={cx} cy={cy} color='goldenrod' />
    } else if (rank == 2) {
        return <VectorizedStar cx={cx} cy={cy} color='silver' />
    } else if (rank == 3) {
        return <VectorizedStar cx={cx} cy={cy} color='chocolate' />
    } else {
        return <Dot {...props} className={className} />
    }
}

export default function WeightTransition(props: WeightTransitionProps) {
    // width, minHeight を変数にすれば、いい感じにサイズ調整ができそう
    const { chartKeywords, data } = props

    return (
        <ResponsiveContainer {...props}>
            <LineChart
                width={500}
                height={300}
                data={data}
                margin={{
                    top: 5,
                    right: 0, // 30,
                    left: -20, // 20,
                    bottom: 5,
                }}
            >
                <CartesianGrid strokeDasharray='3 3' />
                <XAxis dataKey='name' padding={{ left: 30, right: 30 }} />
                <YAxis
                    yAxisId='left'
                    domain={['dataMin - 2', 'dataMax + 2']}
                />
                <YAxis
                    yAxisId='right'
                    // domain={['dataMin - 0.5', 'dataMax + 0.5']}
                    domain={([dataMin, dataMax]) => {
                        const delta = dataMax - dataMin
                        return [dataMin - delta / 4, dataMax + delta / 4]
                    }}
                    orientation='right'
                    unit='%'
                />
                <Tooltip />
                <Legend />
                <Line
                    yAxisId='left'
                    type='monotone'
                    dataKey={chartKeywords[0]}
                    stroke='#8884d8'
                    name='馬体重[kg]'
                    unit='kg'
                    activeDot={{ r: 8 }}
                    connectNulls
                    dot={<CustomizedDot />}
                />
                <Line
                    yAxisId='right'
                    type='monotone'
                    dataKey={chartKeywords[1]}
                    stroke='#82ca9d'
                    name='斤量比率[%]'
                    unit='%'
                    connectNulls
                />
            </LineChart>
        </ResponsiveContainer>
    )
}
