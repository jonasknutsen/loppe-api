import { getDB } from '../../../db'

const { db } = getDB()

export default async function handler (req, res) {
  const {
    query: { id },
    body: { name },
    method
  } = req
  if (!apikey || apikey !== process.env.API_KEY) {
    return res.status(401).send()
  }
  switch (method) {
    case 'DELETE': {
      const { rows } = await db.query('DELETE FROM types WHERE id = $1', [id])
        return res.status(200).json({ types: rows })
    }
    case 'GET': {
      const { rows } = await db.query('SELECT * FROM types WHERE id = $1', [id])
        return res.status(200).json({ types: rows[0] })
    }
    case 'PUT': {
      const { rows } = await db.query('UPDATE types SET name = $1 WHERE id = $2', [name, id])
        return res.status(200).json({ types: rows })
    }
    default: {
      res.setHeader('Allow', 'DELETE, GET, PUT')
        return res.status(405).json({ message: 'Method Not Allowed' })
    }
  }
}
