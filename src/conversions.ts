/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable functional/no-expression-statement */
// TODO Type conversions and natural transformation
// F a -> G a
// eslint-disable-next-line @typescript-eslint/no-var-requires
const Task = require('data.task')
import { Box, Container as BoxContainer } from './containers'
import { Container, fromNullable, Left, Right } from './either'

// ------------------------------------------------------------

const eitherToTask = <A, B>(e: Container<A, B>): any => e.fold(Task.of, Task.rejected)
const right2t = eitherToTask(Right(20)).fork(
    e => console.error('err', e),
    r => console.log('res', r)
)
const left2t = eitherToTask(Left('errrr')).fork(
    e => console.error('err', e),
    r => console.log('res', r)
)

// ------------------------------------------------------------

const boxToEitherR = (b: BoxContainer): any => b.fold(x => Right(x))
const toEitherR = console.log(boxToEitherR(Box(100)).inspect()) //- Right(100)

const boxToEitherL = (b: BoxContainer): any => b.fold(x => Left(x))
// the above example would violate the natural transformation law:
// nt(x).map(f) == nt(x.map(f))

// nt(x).map(f)
const law1 = console.log(
    boxToEitherR(Box(100))
        .map(x => x * 2)
        .inspect()
) //- Right(200)
// nt(x.map(f))
const law2 = console.log(boxToEitherR(Box(100).map((x: any) => x * 2)).inspect()) //- Right(200)

// nt(x).map(f)
const badLaw1 = console.log(
    boxToEitherL(Box(100))
        .map(x => x * 2)
        .inspect()
) //- Left(100)
// nt(x.map(f))
const badLaw2 = console.log(boxToEitherL(Box(100).map(x => x * 2)).inspect()) //-Left(200) !!

// ------------------------------------------------------------

const first = (xs: any[]): any => fromNullable(xs[0])

const largeNumbers = (xs: number[]): number[] => xs.filter(x => x > 100)
const larger = (x: number): number => x * 2
// nt(x.map(f))
const appLaw2 = (xs: number[]): any => first(largeNumbers(xs).map(larger))
const transA = console.log(appLaw2([2, 400, 5, 2000]).inspect()) //- Right(800)
// nt(x).map(f)
const appLaw1 = (xs: number[]): any => first(largeNumbers(xs)).map(larger)
const transB = console.log(appLaw1([2, 400, 5, 2000]).inspect()) //- Right(800)

// ------------------------------------------------------------

const fake = (id: string): any => ({ id: id, name: 'user1', best_friend_id: id + 1 })
const db = {
    find: id => new Task((rej, res) => res(id > 2 ? Right(fake(id)) : Left('not found')))
}
const rx = console.log(
    db
        .find(3) // =>> Task(Right(user))
        .chain(eitherToTask) // =>> Task.of(Right(user))
        .chain(user => db.find(user.best_friend_id))
        .chain(eitherToTask)
        .fork(
            e => console.error(e),
            r => console.log('Result: ', r)
        )
)
