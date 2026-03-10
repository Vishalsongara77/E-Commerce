const request = require('supertest')
const app = require('../server')

describe('GET /api/health', () => {
  it('returns ok status and message', async () => {
    const response = await request(app).get('/api/health')

    expect(response.statusCode).toBe(200)
    expect(response.body).toEqual(
      expect.objectContaining({
        status: 'OK',
        message: 'Tribal Marketplace API is running'
      })
    )
  })
})
