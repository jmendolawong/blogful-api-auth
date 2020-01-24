const knex = require('knex')
const app = require('../src/app')
const helpers = require('./test-helpers')

describe.only('Auth Endpoints', function () {
  let db

  const { testUsers } = helpers.makeArticlesFixtures()
  const testUser = testUsers[0]

  before('make knex instance', () => {
    db = knex({
      client: 'pg',
      connection: process.env.TEST_DB_URL,
    })
    app.set('db', db)
  })

  after('disconnect from db', () => db.destroy())

  before('cleanup', () => helpers.cleanTables(db))

  afterEach('cleanup', () => helpers.cleanTables(db))

  describe(`POST /api/auth/login`, () => {
    beforeEach('insert users', () =>
      helpers.seedUsers(
        db,
        testUsers,
      )
    )

    const requiredFields = ['user_name', 'password']

    requiredFields.forEach(field => {
      const loginAttemptBody = {
        user_name: testUser.user_name,
        password: testUser.password,
      }

      it(`responds 400 required error when ${field} is missing`, () => {
        delete loginAttemptBody[field]

        return supertest(app)
          .post('/api/auth/login')
          .send(loginAttemptBody)
          .expect(400, { error: `Missing ${field} in request body` })
      })
    })

    it(`responds 400 'Invalid user name or password' when no user_name in db`, () => {
      const invalidUser = { user_name: 'badUser', password: 'blank' }
      return supertest(app)
        .post('/api/auth/login')
        .send(invalidUser)
        .expect(400, { error: `Invalid user name or password` })
    })

    it(`responds 400 'Invalid user name or passord' when bad password`, () => {
      const invalidPassword = { user_name: testUsers[0].user_name, password: 'bad' }

      return supertest(app)
        .post('/api/auth/login')
        .send(invalidPassword)
        .expect(400, { error: 'Invalid user name or password' })
    })

  })
})