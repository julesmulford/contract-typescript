const path = require('path');
const { PactV3, MatchersV3 } = require('@pact-foundation/pact');
const { UserClient } = require('../../src/consumer/user-client');

const { like, eachLike, integer, string, regex } = MatchersV3;

const provider = new PactV3({
  consumer: 'UserConsumer',
  provider: 'UserService',
  dir: path.resolve(process.cwd(), 'pacts'),
  logLevel: 'warn',
});

describe('UserConsumer — contract tests', () => {
  describe('GET /users/:id', () => {
    it('returns an existing user', async () => {
      await provider
        .given('user 1 exists')
        .uponReceiving('a request for user 1')
        .withRequest({ method: 'GET', path: '/users/1' })
        .willRespondWith({
          status: 200,
          headers: { 'Content-Type': 'application/json' },
          body: {
            id: integer(1),
            name: string('Alice Smith'),
            email: regex('\\S+@\\S+\\.\\S+', 'alice@example.com'),
            role: string('admin'),
          },
        })
        .executeTest(async (mockserver) => {
          const client = new UserClient(mockserver.url);
          const user = await client.getUser(1);
          expect(user).toMatchObject({ id: 1, name: 'Alice Smith' });
        });
    });

    it('returns 404 for a non-existent user', async () => {
      await provider
        .given('user 99 does not exist')
        .uponReceiving('a request for a missing user')
        .withRequest({ method: 'GET', path: '/users/99' })
        .willRespondWith({
          status: 404,
          body: { error: string('User not found') },
        })
        .executeTest(async (mockserver) => {
          const client = new UserClient(mockserver.url);
          await expect(client.getUser(99)).rejects.toMatchObject({
            response: { status: 404 },
          });
        });
    });
  });

  describe('POST /users', () => {
    it('creates a new user and returns it', async () => {
      await provider
        .given('the user service is available')
        .uponReceiving('a request to create a user')
        .withRequest({
          method: 'POST',
          path: '/users',
          headers: { 'Content-Type': 'application/json' },
          body: { name: 'Carol White', email: 'carol@example.com', role: 'user' },
        })
        .willRespondWith({
          status: 201,
          headers: { 'Content-Type': 'application/json' },
          body: {
            id: integer(3),
            name: string('Carol White'),
            email: string('carol@example.com'),
            role: string('user'),
          },
        })
        .executeTest(async (mockserver) => {
          const client = new UserClient(mockserver.url);
          const user = await client.createUser({
            name: 'Carol White',
            email: 'carol@example.com',
            role: 'user',
          });
          expect(user).toMatchObject({ name: 'Carol White', email: 'carol@example.com' });
          expect(user.id).toBeGreaterThan(0);
        });
    });
  });

  describe('DELETE /users/:id', () => {
    it('deletes an existing user', async () => {
      await provider
        .given('user 2 exists')
        .uponReceiving('a request to delete user 2')
        .withRequest({ method: 'DELETE', path: '/users/2' })
        .willRespondWith({ status: 204 })
        .executeTest(async (mockserver) => {
          const client = new UserClient(mockserver.url);
          const status = await client.deleteUser(2);
          expect(status).toBe(204);
        });
    });
  });
});
