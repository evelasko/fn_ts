/* eslint-disable functional/no-expression-statement */
/* eslint-disable functional/prefer-type-literal */
/* eslint-disable functional/functional-parameters */
// eslint-disable-next-line @typescript-eslint/no-var-requires
const fs = require('fs')
import { prop } from 'ramda'

export type fn = (f: unknown) => unknown

export type Container<A, B> = {
    map: <C>(arg: (a: A) => A) => Container<A, C>
    fold: (rightCase: fn, leftCase: fn) => unknown
    inspect: () => Container<A, B>
    chain: (arg: <A, B>(_: unknown) => Container<A, B>) => Container<A, B>
}
export const Right = <A, B>(x: A): Container<A, B> => ({
    map: <C>(f: (a: A) => C) => Right(f(x)),
    fold: (f, g) => f(x),
    inspect: () => {
        console.log(`Right(${x})`)
        return Right(x)
    },
    chain: f => f(x)
})
export const Left = <A, B>(x: A): Container<A, B> => ({
    map: f => Left(x),
    fold: (f, g) => g(x),
    inspect: () => {
        console.log(`Left(${x})`)
        return Left(x)
    },
    chain: fc => Left(x)
})
export const fromNullable = <A, B>(x: A): Container<A, B> =>
    x != null || undefined ? Right(x) : Left(x)

// -----------------------------------------------------------

const findColorRegular = (name: string): string =>
    ({ red: '#ff4444', blue: '#3b5998', yellow: '#fff68f' }[name])
console.log(findColorRegular('red')) // - ff4444

const findColor = <A, B>(name: string): Container<A, B> =>
    fromNullable({ red: '#ff4444', blue: '#3b5998', yellow: '#fff68f' }[name])

console.log(
    findColor('red')
        .map((s: string) => s.slice(1))
        .fold(
            (e: string) => e.toUpperCase(),
            (c: string) => 'no Color'
        ) // - FF4444
)
console.log(
    findColor('pink')
        .map((s: string) => s.slice(1))
        .fold(
            (e: string) => e.toUpperCase(),
            _ => 'no Color'
        ) // - no color
)
// -----------------------------------------------------------

const getPortRegular = (): number => {
    // eslint-disable-next-line functional/no-try-statement
    try {
        const str = fs.readFileSync('./src/file.json', { encoding: 'utf-8' })
        const config = JSON.parse(str)
        return config.port
    } catch (e) {
        return 3000
    }
}
console.log(getPortRegular())

const tryCatch = <C, F>(f: <D>(arg?: unknown) => D): Container<C, F> => {
    // eslint-disable-next-line functional/no-try-statement
    try {
        return Right(f())
    } catch (e) {
        return Left(e)
    }
}

const getPort = (n: string): any =>
    tryCatch(() => fs.readFileSync('./src/file.json', { encoding: 'utf-8' }))
        .chain((c: string) => tryCatch(() => JSON.parse(c)))
        .map(prop('port'))
        .fold(
            (f: string) => JSON.stringify(f),
            () => n
        )

console.log(getPort('3000'))

// -----------------------------------------------------------

const currentUser = null
const renderPage = (_?: string | null): string => (_ ? `page` : `nothing`)
const showLogin = (_?: string | null): string => (_ ? `login` : `nothing`)

const openSiteRegular = (): unknown => {
    // eslint-disable-next-line functional/no-conditional-statement
    if (currentUser) {
        return renderPage(currentUser)
    } else {
        return showLogin()
    }
}

const openSite = fromNullable(currentUser).fold(showLogin, renderPage)
