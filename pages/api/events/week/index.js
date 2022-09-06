import { getDB } from '../../../../db'
import { getMonday, getSunday } from '../../../../utils/formatters'

const { db } = getDB()

export default async function handler (req, res) {
  const {
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
        // events with organizers and places
        db.any('SELECT e.openingtimes, e.closingtimes, p.name as place, p.slug as place_slug, p.address, p.postcode, p.city, p.area, o.name as organizer, o.slug as organizer_slug FROM events e JOIN places p ON e.place = p.id JOIN organizers o ON e.organizer = o.id WHERE $1::date < ANY(openingtimes) AND $2::date > ANY(openingtimes) ORDER BY p.postcode', [getMonday(), getSunday()])
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
