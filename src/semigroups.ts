import { Map } from 'immutable-ext'

// Semigroups are types with a concat method that is associative

export type Semigroup<A> = {
    x: A
    // eslint-disable-next-line functional/no-mixed-type
    concat: (arg: Semigroup<A> | unknown) => Semigroup<A>
    inspect: (_?: unknown) => string
}

// --------------------------------------------------------------

const Sum = (x): Semigroup<number> => ({
    x,
    concat: ({ x: y }) => Sum(x + y),
    inspect: _ => `Sum(${x})`
})

const res = console.log(
    Sum(1)
        .concat(Sum(2))
        .inspect()
)

// --------------------------------------------------------------

const All = (x): Semigroup<boolean> => ({
    x,
    concat: ({ x: y }) => All(x && y),
    inspect: _ => `All(${x})`
})

const allFalse = console.log(
    All(true)
        .concat(All(false))
        .inspect()
)
const allTrue = console.log(
    All(true)
        .concat(All(true))
        .inspect()
)

// --------------------------------------------------------------

const First = <A>(x): Semigroup<A> => ({
    x,
    concat: _ => First(x),
    inspect: _ => `First(${x})`
})

const alwaysFirst = console.log(
    First('first')
        .concat('second')
        .concat('third')
        .inspect()
)

// --------------------------------------------------------------

// if a data sctructure is made up of semigroups, then it is a semigroup itself:
const acc1 = Map({ name: First('Nico'), isPaid: All(true), points: Sum(10), friedns: ['Franklin'] })
const acc2 = Map({ name: First('Nico'), isPaid: All(false), points: Sum(2), friends: ['Gatsby'] })

const accResult = console.log(acc1.concat(acc2).toJS())
