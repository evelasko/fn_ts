/* eslint-disable functional/functional-parameters */
export type fn = (f: unknown) => unknown

export type Monad<A, B> = {
    map: <C>(arg: (a: A) => A) => Monad<A, C>
    fold: (rightCase: fn, leftCase: fn) => unknown
    inspect: () => Monad<A, B>
    chain: (arg: <A, B>(_: unknown) => Monad<A, B>) => Monad<A, B>
}
const Box = <A, B>(x: A): Monad<A, B> => ({
    map: <C>(f: (a: A) => C) => Box(f(x)),
    fold: (f, g) => f(x),
    inspect: () => {
        const t = console.log(`Box(${x})`)
        return Box(x)
    },
    chain: f => f(x)
})

const join = <A, B>(m: Monad<A, B>): Monad<A, B> => m.chain(<D, E>(x: Monad<D, E>) => x)

const m = Box(Box(Box(3)))
const res1 = join(m.map(join))
const res2 = join(join(m))

const m1 = console.log(res1.inspect())
const m2 = console.log(res2.inspect())

// join(Box(m)) == join(m.map(Box))...
