export const makeFilepath = (
    race_id: string,
    timestamp: string,
    place: string = '',
): string => {
    const date = new Date(timestamp) // UTC
    const parent_dir = date.toLocaleDateString('ja-JP', {
        // convert to JST and format to `YYYY/mm/dd`
        timeZone: 'Asia/Tokyo',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    })

    const target_dir = `${process.cwd()}/content/docs/${parent_dir}`

    return place.length === 0
        ? `${target_dir}/${race_id}.mdx`
        : `${target_dir}/${place}/${race_id}.mdx`
}
