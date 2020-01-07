/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable functional/no-return-void */
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable functional/no-expression-statement */
const request = require('request')
const Btoa = require('btoa')
const Task = require('data.task')
import { Container, fromNullable, Left, Right } from '../either'

const authOpts = {
    url: `https://accounts.spotify.com/api/token`,
    method: 'POST',
    headers: {
        Authorization: `Basic ${Btoa(
            '9440d46664db4a048c0267cfa11c5174:cd929eacd67e48878ee8cf8119c45dbd'
        )}`
    },
    form: {
        grant_type: 'client_credentials'
    }
}

const first = <A, B>(xs: string[]): Container<any, B> => fromNullable<any, B>(xs[0])
const eitherToTask = <A, B>(e: Container<A, B>): any => e.fold(Task.of, Task.rejected)

const authCb = (error: unknown, response: unknown, body: any): unknown => {
    return error
        ? console.error('error:', error) // Print the error if one occurred
        : console.log('token:', JSON.parse(body).access_token) // Print the response status code if a response was received
}

const httpGet: (params: any) => any = params =>
    new Task((rej, res) =>
        request(params, (error, response, body) => {
            error ? rej(error) : res(body)
        })
    )

const findArtist = name =>
    httpGet(authOpts)
        .map(JSON.parse)
        .map(result => result.access_token)
        .chain(token =>
            httpGet({
                url: `https://api.spotify.com/v1/search?query=${name}&type=artist`,
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })
        )
        .map(JSON.parse)
        .map(result => result.artists.items)
        .map(result => (result[0] ? Task.of(result[0].id) : Task.rejected('Error*')))

const relatedArtists = id =>
    httpGet(authOpts)
        .map(JSON.parse)
        .map(result => result.access_token)
        .chain(token =>
            httpGet({
                url: `https://api.spotify.com/v1/artists/${id}/related-artists`
            })
        )
        .map(JSON.parse)
        .map(result => (result ? Task.of(result.artists) : Task.rejected('Error**')))

export { Task, findArtist, relatedArtists }
