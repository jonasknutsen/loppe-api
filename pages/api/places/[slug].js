import { getDB } from '../../../db'

const { db } = getDB()

export default async function handler (req, res) {
  const {
    query: { slug },
    headers: { apikey },
    method
  } = req
  return new Promise(resolve => {
    if (!apikey || apikey !== process.env.API_KEY) {
      res.status(401).send()
      return resolve()
    }
    switch (method) {
      case 'GET': {
        // place, events
        db.task(async t =>{
          const place = await t.oneOrNone('SELECT * FROM places WHERE slug = $1', [slug])
          if(place) {
            // return t.any('SELECT e.type, e.openingtimes, e.closingtimes, o.name, o.slug from events e INNER JOIN organizers o ON e.organizer = o.id WHERE e.place = $1', place.id);
            return t.batch([
              place,
              t.any('SELECT e.type, e.openingtimes, e.closingtimes, o.name, o.slug from events e INNER JOIN organizers o ON e.organizer = o.id WHERE e.place = $1', place.id),
            ])
          }
          return []
        })
          .then(events => {
            // success
            res.status(200).json(events)
            return resolve()
          })
          .catch(error => {
            // error
            console.error(error)
            res.status(500).send()
            return resolve()
          })
      }
        break
      default: {
        res.setHeader('Allow', 'GET')
        res.status(405).send()
        return resolve()
      }
    }
  })
}
