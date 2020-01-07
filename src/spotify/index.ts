/* eslint-disable functional/no-return-void */
/* eslint-disable functional/no-expression-statement */
import { findArtist, relatedArtists, Task } from './spotify'

console.log(`\nSPOTIFY\n`)

const argv = new Task((rej, res) => res(process.argv))
const names = argv.map(args => args.slice(2))

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const related = name => findArtist(name).chain(relatedArtists)

const main: (names: string[]) => void = ([name1, name2]) => {
    Task.of(rels1 => rels2 => [rels1, rels2])
        .ap(related(name1))
        .ap(related(name2))
}

console.log(findArtist('Oasis').fork(console.error, console.log))
// names.chain(main).fork(console.error, console.log)
