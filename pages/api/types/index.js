import { getDB } from '../../../db'

const { db } = getDB()

export default async function apiTypes (req, res) {
  const {
    body: { name },
    headers: { apikey },
    method
  } = req
  if (!apikey || apikey !== process.env.API_KEY) {
    return res.status(401).send()
  }
  switch (method) {
    case 'GET': {
      const types = await db.query('SELECT * FROM types')
      return res.status(200).json({ types })
    }
    case 'POST': {
      const { rows } = await db.query('INSERT INTO types(name) VALUES ($1) RETURNING *', [name])
      return res.status(200).json({ types: rows })
    }
    default: {
      res.setHeader('Allow', 'POST')
        return res.status(405).json({ message: 'Method Not Allowed' })
    }
  }
}
