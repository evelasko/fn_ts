/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable functional/functional-parameters */
/* eslint-disable functional/no-expression-statement */
import axios from 'axios'
import { chain, encaseP, fork, FutureInstance, map, mapRej, parallel } from 'fluture'
import { forEach, has, path, prop, slice } from 'ramda'

// eslint-disable-next-line @typescript-eslint/no-var-requires
const Btoa = require('btoa')
const key = '9440d46664db4a048c0267cfa11c5174:cd929eacd67e48878ee8cf8119c45dbd'

const _getToken = encaseP((key: string) =>
    axios({
        url: 'https://accounts.spotify.com/api/token',
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            Authorization: `Basic ${Btoa(key)}`
        },
        data: 'grant_type=client_credentials'
    })
)

const getToken = encaseP(() =>
    axios({
        url: 'https://accounts.spotify.com/api/token',
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            Authorization: `Basic ${Btoa(key)}`
        },
        data: 'grant_type=client_credentials'
    })
)

const findArtist = (name: string): FutureInstance<unknown, unknown[]> =>
    getToken(null)
        .pipe(mapRej(e => `Authorization failed: ${e}`))
        .pipe(map(path(['data', 'access_token'])))
        .pipe(
            chain(token =>
                encaseP(() =>
                    axios({
                        url: `https://api.spotify.com/v1/search?query=${name}&type=artist`,
                        method: 'GET',
                        headers: { Authorization: `Bearer ${token}` }
                    })
                )(token).pipe(mapRej(e => `something went wrong while searching for ${name}: ${e}`))
            )
        )
        .pipe(map(path(['data', 'artists', 'items'])))
// .pipe(map(e => (Array.isArray(e) ? e.map(prop('id')) : null)))

const findRelated = (artists: any[]) =>
    artists.map(artist =>
        getToken(null)
            .pipe(mapRej(e => `Authorization failed: ${e}`))
            .pipe(map(path(['data', 'access_token'])))
            .pipe(
                chain(token =>
                    encaseP(() =>
                        axios({
                            url: `https://api.spotify.com/v1/artists/${artist.id}/related-artists`,
                            method: 'GET',
                            headers: { Authorization: `Bearer ${token}` }
                        })
                    )(token).pipe(
                        mapRej(
                            e =>
                                `something went wrong while searching for related artists of ${name}: ${e}`
                        )
                    )
                )
            )
            .pipe(map(response => Object.assign({}, artist, { related: response.data.artists })))
    )

const findArtistAndRelated = (name: string) => (limit = 3): FutureInstance<unknown, unknown[]> =>
    findArtist(name)
        .pipe(map(slice(0, limit)))
        .pipe(map(findRelated))
        .pipe(chain(parallel(3)))
        .pipe(
            map(artists =>
                artists.map(artist =>
                    Object.assign({}, artist, { related: slice(0, limit, artist.related) })
                )
            )
        )

fork(e => console.error('Error%:', e))(console.log)(
    findArtistAndRelated('Oasis')(5).pipe(
        map(artists =>
            artists.map((artist: any) =>
                Object.assign(
                    {},
                    { name: path(['name'], artist) },
                    {
                        related:
                            has('related', artist) && Array.isArray(artist.related)
                                ? artist.related.map(path(['name']))
                                : null
                    }
                )
            )
        )
    )
)
