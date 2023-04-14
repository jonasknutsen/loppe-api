import { getDB } from '../../../db'

const { db } = getDB()

export default async function handler (req, res) {
  const {
    body: { openingTimes, closingTimes, type, organizer, place, facebookEvent },
    headers: { apikey },
    method
  } = req
  if (!apikey || apikey !== process.env.API_KEY) {
    res.status(401).send()
    return resolve()
  }
  switch (method) {
    case 'GET': {
      const events = await db.query('SELECT * FROM events')
      return res.status(200).json({ events })
    }
    case 'POST': {
      try {
        const openingTimestamps = openingTimes.map(ot => {
          const day = ot.substring(0,2)
          const month = ot.substring(2,4)
          const year = '20' + ot.substring(4,6)
          const hour = ot.substring(6,8)
          const minutes = ot.substring(8,10)
          // return new Date(+year, +month - 1, day, hour, minutes).toISOString()
          return year + '-' + month + '-' + day + ' ' + hour + ':' + minutes + ':00+02'
        })
        const openingInsert = '{"' + openingTimestamps.toString().replace(',', '","') + '"}'
        const closingTimestamps = closingTimes.map(ot => {
          const day = ot.substring(0,2)
          const month = ot.substring(2,4)
          const year = '20' + ot.substring(4,6)
          const hour = ot.substring(6,8)
          const minutes = ot.substring(8,10)
          // return new Date(+year, +month - 1, day, hour, minutes).toISOString()
          return year + '-' + month + '-' + day + ' ' + hour + ':' + minutes + ':00+02'
        })
        const closingInsert = '{"' + closingTimestamps.toString().replace(',', '","') + '"}'
        const rows = await db.query('INSERT INTO events(type, organizer, place, openingtimes, closingtimes, facebook) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *', [type, organizer, place, openingInsert, closingInsert, facebookEvent])
        return res.status(200).json({ events: rows })
      } catch (error) {
        console.error(error)
        return res.status(500).json({ error })
      }
    }
    default: {
      res.setHeader('Allow', 'GET, POST')
        return res.status(405).json({ message: 'Method Not Allowed' })
    }
  }
}
