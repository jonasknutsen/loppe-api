import { getDB } from '../../../../db'

const { db } = getDB()

export default async function handler (req, res) {
  const {
    query: { year },
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
        const first = new Date(year, 1, 1)
        const last = new Date(year, 12, 31, 23, 59)
        db.any('SELECT e.id, e.openingtimes, e.closingtimes, e.facebook, p.name as place, p.slug as place_slug, p.address, p.postcode, p.city, o.name as organizer, o.slug as organizer_slug FROM events e JOIN places p ON e.place = p.id JOIN organizers o ON e.organizer = o.id WHERE $1::date < ANY(openingtimes) AND $2::date > ANY(openingtimes) ORDER BY p.postcode', [first, last])
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
