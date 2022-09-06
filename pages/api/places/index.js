import { getDB } from '../../../db'

const { db } = getDB()

export default async function apiPlaces (req, res) {
  const {
    body: { name, address, postcode, city, areas, coordinates, slug },
    headers: { apikey },
    method
  } = req
  if (!apikey || apikey !== process.env.API_KEY) {
    return res.status(401).send()
  }
  switch (method) {
    case 'GET': {
      const places = await db.query('SELECT * FROM places ORDER BY name')
      const cities = await db.query('SELECT DISTINCT city FROM places ORDER BY city')
      const cityArray = cities.map(city => { return ( city.city )})
      return res.status(200).json({ places, cities: cityArray })
    }
    case 'POST': {
      const { rows } = await db.query('INSERT INTO places(name, address, postcode, city, areas, coordinates, slug) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *', [name, address, postcode, city, areas, coordinates, slug])
      return res.status(200).json({ places: rows })
    }
    default: {
      res.setHeader('Allow', 'POST')
        return res.status(405).json({ message: 'Method Not Allowed' })
    }
  }
}
