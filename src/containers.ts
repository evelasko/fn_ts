/* eslint-disable functional/no-expression-statement */
/* eslint-disable functional/functional-parameters */

export type fn = (f: unknown) => unknown

export type Container = {
    map: (arg: fn) => Container
    fold: <A>(arg: fn) => unknown | A
    inspect: () => string
}
export type Contain = (x: unknown) => Container

export const Box: Contain = x => ({
    map: (f: fn) => Box(f(x)),
    fold: (f: fn) => f(x),
    inspect: () => `Box(${x})`
})

// -----------------------------------------------------------

const nextCharforNumberMap: (str: string) => string[] = str =>
    [str]
        .map(s => s.trim())
        .map(s => parseInt(s))
        .map(i => i + 1)
        .map(i => String.fromCharCode(i))
console.log(nextCharforNumberMap('64'))

const nextCharforNumberBox = (str: unknown): Container =>
    Box(str)
        .map((s: string) => s.trim())
        .map((s: string) => parseInt(s))
        .map((i: number) => i + 1)
        .map((i: number) => String.fromCharCode(i))
const boxOfA = nextCharforNumberBox('64')
console.log(boxOfA.inspect())

// -----------------------------------------------------------

const moneyToFloatRegular = (str: string): number => parseFloat(str.replace(/\$/g, ''))
const percentToFloatRegular = (str: string): number => {
    const replaced = str.replace(/\%/g, '')
    const number = parseFloat(replaced)
    return number * 0.01
}
const applyDiscountRegular = (price: string, discount: string): number => {
    const cost = moneyToFloatRegular(price)
    const savings = percentToFloatRegular(discount)
    return cost - cost * savings
}
console.log(applyDiscountRegular('5$', '20%')) // - 4

const moneyToFloatBoxed = (str: string): Container =>
    Box(str.replace(/\$/g, '')).map((f: string): number => parseFloat(f))

const percentToFloatBoxed = (str: string): Container =>
    Box(str.replace(/\%/g, ''))
        .map((s: string) => parseFloat(s))
        .map((n: number) => n * 0.01)

const applyDiscountBoxed = (price: string, discount: string): unknown =>
    moneyToFloatBoxed(price).fold((cost: number) =>
        percentToFloatBoxed(discount).fold((savings: number) => cost - cost * savings)
    )

console.log(applyDiscountBoxed('5$', '20%')) // - 4
