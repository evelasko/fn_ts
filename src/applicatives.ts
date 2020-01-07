/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable functional/no-expression-statement */
const Task = require('data.task')
/* eslint-disable functional/functional-parameters */
import { List } from 'immutable-ext'

export type fn = (f: unknown) => unknown

export type Applicative<A, B> = {
    ap: <P>(arg: Applicative<P, B>) => Applicative<A, P>
    map: <C>(arg: (a: A) => C) => Applicative<C, B>
    fold: (rightCase: fn, leftCase: fn) => unknown
    inspect: () => Applicative<A, B>
    chain: (arg: <A, B>(_: unknown) => Applicative<A, B>) => Applicative<A, B>
}
const Box = <A, B>(x: A): Applicative<A, B> => ({
    // @ts-ignore
    ap: a => a.map(x),
    map: <C>(f: (a: A) => C) => Box(f(x)),
    fold: (f, g) => f(x),
    inspect: () => {
        const t = console.log(`Box(${x})`)
        return Box(x)
    },
    chain: f => f(x)
})

// ------------------------------------------------

const res1 = console.log(
    Box(x => x + 1)
        .ap(Box(2))
        .inspect()
)

const res2 = console.log(
    Box(x => y => x + y) // curried applicative
        .ap(Box(2)) //- y => Box(2) + y
        .ap(Box(3)) //- Box(2) + Box(5)
        .inspect()
)

const res3 = console.log(
    Box(x => y => ({ x, y }))
        .ap(Box(() => console.log('FNA')))
        .ap(Box(() => console.log('FNB')))
        .map(n => {
            //@ts-ignore
            n.x()
            //@ts-ignore
            n.y()
        })
)

const lift2A = <A, B>(f, fx, fy): Applicative<A, B> => fx.map(f).ap(fy)
const add = x => y => x + y

const resA = console.log(lift2A(add, Box(5), Box(4)).inspect()) //- Box(9)

// ------------------------------------------------

const $ = <B>(selector: string): Applicative<{ selector: string; height: number }, B> =>
    Box({ selector, height: 10 })
const getScreenSize = screen => head => foot => screen - (head.height + foot.height)
const calc = lift2A(getScreenSize(800), $('head'), $('foot'))

const resL = console.log(calc.inspect()) //- Box(780)

// ------------------------------------------------
// TODO List comprehension
// imperative version of list recursion
/*
for(x in xs) {
    for(y in ys) {
        for(z in zs) {
            ...
        }
    }
}
*/
const resList2Deep = console.log(
    List.of(x => y => `${x} - ${y}`)
        .ap(List(['teeshirt', 'sweater']))
        .ap(List(['large', 'medium', 'small']))
)
const resList3Deep = console.log(
    List.of(x => y => z => `${x} - ${y} / ${z}`)
        .ap(List(['teeshirt', 'sweater']))
        .ap(List(['large', 'medium', 'small']))
        .ap(List(['black', 'pink']))
)

// ------------------------------------------------
// TODO List concurrency

const db = {
    find: id =>
        new Task((rej, res) => setTimeout(() => res({ id: id, title: `Project ${id}` }), 100))
}

const reportHeader = (p1, p2): string => `Report: ${p1.title} compared to ${p2.title}`

const nonSeqRes = console.log(
    db
        .find(20)
        .chain(p1 => db.find(8).map(p2 => reportHeader(p1, p2)))
        .fork(
            e => console.log('err', e),
            s => console.log(s)
        )
) //- Report: Project 20 compared to Project 8

// in the past example one task is executed after the other...
// the next example executes both at the same time

Task.of(p1 => p2 => reportHeader(p1, p2))
    .ap(db.find(20))
    .ap(db.find(8))
    .fork(
        e => console.log('err', e),
        s => console.log(s)
    ) //- Report: Project 20 compared to Project 8
