/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable functional/no-throw-statement */
/* eslint-disable functional/no-conditional-statement */
/* eslint-disable functional/no-expression-statement */
/* eslint-disable functional/functional-parameters */
const Task = require('data.task')
import { task as ftask } from 'folktale/concurrency/task'

const fs = require('fs')

const one = ftask(resolver => resolver.resolve(1))

const t = one.run().listen({
    onCancelled: () => console.log('the task was cancelled'),
    onRejected: e => console.log('something went wrong: ', e),
    onResolved: value => console.log(`The value is ${value}`)
})

const on1 = Task.of(1)
    .map(x => x + 1)
    .chain(x => Task.of(x + 1))
    .fork(
        e => console.log('err', e),
        s => console.log('success', s)
    )

const launchMissiles = (): any =>
    new Task((rej, res) => {
        const c = console.log('launch missiles!')
        res('missile')
    })

const app = launchMissiles().map(x => x + '!')

const exec = app
    .map(x => x + '🚀')
    .fork(
        e => console.log('err ', e),
        x => console.log('success', x)
    )

// --------------------------------------------------------------

// eslint-disable-next-line functional/no-return-void
const regularApp = (): void =>
    fs.readFile('test.json', 'utf-8', (err, contents) => {
        if (err) throw err
        const newContents = contents.replace(/8/g, '6')
        fs.writeFile('testOut.json', newContents, () => {
            if (err) throw err
            return console.log('success')
        })
    })

const readFile = (filename, enc): any =>
    new Task((rej, res) =>
        fs.readFile(filename, enc, (err, contents) => (err ? rej(err) : res(contents)))
    )

const writeFile = (filename, contents): any =>
    new Task((rej, res) =>
        fs.writeFile(filename, contents, err => (err ? rej(err) : res(contents)))
    )

const composedApp = (): any =>
    readFile('test.json', 'utf-8')
        .map(contents => contents.replace(/8/g, '6'))
        .chain(contents => writeFile('testOut.json', contents))

composedApp().fork(
    e => console.log(e),
    x => console.log('success', x)
)

// --------------------------------------------------------------
