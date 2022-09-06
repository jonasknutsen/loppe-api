import { getDB } from '../../../db'

const { db } = getDB()

export default async function apiOrganizers (req, res) {
  const {
    body: { name, website, facebook, slug },
    headers: { apikey },
    method
  } = req
  if (!apikey || apikey !== process.env.API_KEY) {
    res.status(401).send()
    return resolve()
  }
  switch (method) {
    case 'GET': {
      const organizers = await db.query('SELECT * FROM organizers ORDER BY name')
      return res.status(200).json({ organizers })
    }
    case 'POST': {
      const { rows } = await db.query('INSERT INTO organizers(name, website, facebook, slug) VALUES ($1, $2, $3, $4) RETURNING *', [name, website, facebook, slug])
      return res.status(200).json({ organizers: rows })
    }
    default: {
      res.setHeader('Allow', 'POST')
        return res.status(405).json({ message: 'Method Not Allowed' })
    }
  }
}
