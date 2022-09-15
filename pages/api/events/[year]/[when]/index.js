import { getDB } from '../../../../../db'

const { db } = getDB()
import calendar from '../../../../../data/calendar.json'

export default async function handler (req, res) {
  const {
    query: { year, when },
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
        const isWeekNo = !isNaN(when)
        const dates = isWeekNo ? calendar.find(c => c.year === parseInt(year) && c.week === parseInt(when)) : calendar.filter(c => c.year === parseInt(year) && c.season === when)
        const first = isWeekNo ? new Date(dates.start) : new Date(dates[0].start)
        const last = isWeekNo ? new Date(dates.end) : new Date(dates[dates.length - 1].end)
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
