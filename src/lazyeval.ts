/* eslint-disable functional/functional-parameters */
export type fn = (f: unknown) => unknown

export type LazyContainer = {
    map: (arg: fn) => LazyContainer
    fold: (arg: fn) => unknown
    inspect: () => string
}
export type Contain = (x: () => unknown) => LazyContainer

export const LazyBox: Contain = x => ({
    map: (f: fn) => LazyBox(() => f(x())),
    fold: (f: fn) => f(x()),
    inspect: () => `Box(${x})`
})

const lazy = LazyBox(() => '64')
    .map((a: string) => a.trim())
    .map(trimmed => new Number(trimmed))
    .map((number: number) => number + 1)
    .map((x: number) => String.fromCharCode(x))

const resNotCalculatedLazy = console.log(lazy)
const resCalculatedLazy = console.log(lazy.fold((x: string) => x.toLowerCase()))
