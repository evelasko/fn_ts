/* eslint-disable functional/functional-parameters */
import { List, Map } from 'immutable-ext'

import { Semigroup } from './semigroups'

// Monoids are semigroup with a special neutral element

type Monoid<A> = Semigroup<A> & {
    empty: () => Monoid<A>
}

// --------------------------------------------------------------

const Sum = (x?): Monoid<number> => ({
    x,
    concat: ({ x: y }) => Sum(x + y),
    empty: () => Sum(0), // monoid's neutral element that does not affect any computation
    inspect: _ => `Sum(${x})`
})

const resSum = console.log(
    Sum()
        .empty()
        .concat(Sum(1).concat(Sum(2)))
        .inspect()
)

// --------------------------------------------------------------

const All = (x?): Monoid<boolean> => ({
    x,
    concat: ({ x: y }) => All(x && y),
    empty: () => All(true), // monoid's neutral element that does not affect any computation
    inspect: _ => `All(${x})`
})

const resAll = console.log(
    All(true)
        .concat(All(true))
        .concat(All().empty())
        .inspect()
)

// --------------------------------------------------------------
// First cannot be promoted to a monoid because there is no implementation of a neutral type

const First = <A>(x): Semigroup<A> => ({
    x,
    concat: _ => First(x),
    inspect: _ => `First(${x})`
})

// --------------------------------------------------------------

// in the following examples falsy values would throw an error while using the above monoids
// will always return a value
const sum = (xs: number[]): number => xs.reduce((acc, x) => acc + x, 0)
const all = (xs: boolean[]): boolean => xs.reduce((acc, x) => acc && x, true)
const first = (xs: any[]): unknown => xs.reduce((acc, x) => acc)

// --------------------------------------------------------------

const resReg = console.log(
    [Sum(1), Sum(2), Sum(3)].reduce((acc, x) => acc.concat(x), Sum().empty()).inspect()
) // Sum(6)
const resFold = console.log(List.of(Sum(1), Sum(2), Sum(3)).fold(Sum().empty()))
