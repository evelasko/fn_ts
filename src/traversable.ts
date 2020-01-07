/* eslint-disable functional/no-expression-statement */
/* eslint-disable @typescript-eslint/no-var-requires */
const fs = require('fs')
const Task = require('data.task')
const futurize = require('futurize').futurize(Task)
import { List, Map } from 'immutable-ext'

const readFile = futurize(fs.readFile)

const files = ['test.json', 'testOut.json']
const res = console.log(files.map(file => readFile(file, 'utf-8')))
// the line above returns a list of tasks
// so we should convert the list of tasks into a task with a list of results:
// [Task] => Task([])
// then instead of calling map, we call traverse (implemented in List)
const filesList = List(['test.json', 'testOut.json'])
const trs = filesList.traverse(Task.of, file => readFile(file, 'utf-8'))
// trasverse returns a task
trs.fork(
    e => console.log(e),
    r => console.log(`Success!!\n${r}`)
)

// ----------------------------------------------------

const httpGet = (path, params): any => Task.of(`${path}/result`)

const mp = Map({ home: '/', about: '/about-us', blog: '/blog' }).traverse(Task.of, route =>
    httpGet(route, {})
)

mp.fork(
    e => console.log(e),
    r => console.log(`Success!!\n${r}`)
)
