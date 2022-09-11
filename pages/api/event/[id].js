import { getDB } from '../../../db'

const { db } = getDB()

export default async function handler (req, res) {
  const {
    query: { id },
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
        db.oneOrNone('SELECT e.openingtimes, e.closingtimes, e.facebook, o.name as organizator_name, o.slug as organizator_slug, p.name as place_name, p.address, p.postcode, p.city, p.areas, p.coordinates, p.slug as place_slug FROM events e INNER JOIN organizers o ON e.organizer = o.id INNER JOIN places p ON e.place = p.id WHERE e.id = $1' [id])
          .then(event => {
            // success
            res.status(200).json(event)
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
