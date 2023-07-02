import { setTimeout } from 'timers/promises'
import { isObject } from './util'

// load `.env` file -----------------------------------------------------------
// cf. https://github.com/motdotla/dotenv#how-do-i-use-dotenv-with-import
if (process.env.NODE_ENV !== 'production') {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-var-requires
    require('dotenv').config()
}
// ----------------------------------------------------------------------------

const ENDPOINT = process.env.ENDPOINT

const entrypoints = ['entries', 'getRaceDetail', 'getHorseResult']

async function main() {
    await Promise.all(entrypoints.map((entrypoint) => proc(entrypoint)))
    await setTimeout(1000) // sleep 1 sec
    return
}

async function proc(entrypoint: string) {
    const url = `${ENDPOINT}/${entrypoint}`
    const query = new URLSearchParams({
        bonfire: 'lit',
        key: process.env.API_KEY || '',
    })
    const response = await fetch(`${url}?${query.toString()}`)
    const data: unknown = await response.json()

    if (isObject(data)) {
        console.log(JSON.stringify(data, null, '\t'))
    } else {
        console.error(data)
    }
    // finally ...
    return
}

const promise = main()

// Run a `promise`ed processes !
promise
    .then(() => {
        console.log('completed.')
    })
    .catch((error) => {
        console.error(error)
    })
