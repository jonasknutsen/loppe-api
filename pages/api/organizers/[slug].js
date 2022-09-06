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
        // organizers, events
        db.task(async t =>{
          const organizer = await t.oneOrNone('SELECT * FROM organizers WHERE slug = $1', [slug])
          if(organizer) {
            // return t.any('SELECT e.type, e.openingtimes, e.closingtimes, o.name, o.slug from events e INNER JOIN organizers o ON e.organizer = o.id WHERE e.place = $1', place.id);
            return t.batch([
              organizer,
              t.any('SELECT e.type, e.openingtimes, e.closingtimes, p.name, p.slug from events e INNER JOIN places p ON e.place = p.id WHERE e.organizer = $1', organizer.id),
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
