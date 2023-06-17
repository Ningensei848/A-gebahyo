import React from 'react'
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from 'recharts'

interface WeightTransitionGraphProps {
    id?: string | number
    width?: string | number
    height?: string | number
    minWidth?: string | number
    minHeight?: string | number
    chartKeywords: string[]
    data: Array<{ [key: string]: string | number }>
}

const WeightTransitionGraph: React.FC<WeightTransitionGraphProps> = (
    props,
) => {
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
                    right: 30,
                    left: 20,
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
                    domain={['dataMin - 0.5', 'dataMax + 0.5']}
                    orientation='right'
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

export default WeightTransitionGraph
