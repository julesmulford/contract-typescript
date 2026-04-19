const path = require('path');
const { Verifier } = require('@pact-foundation/pact');
const { createServer, users } = require('../../src/provider/user-service');

const PORT = 4000;
let server;

beforeAll(() => {
  server = createServer();
  return new Promise((resolve) => server.listen(PORT, resolve));
});

afterAll(() => {
  return new Promise((resolve) => server.close(resolve));
});

const brokerUrl = process.env.PACT_BROKER_BASE_URL;
const pactSource = brokerUrl
  ? {
      pactBrokerUrl: brokerUrl,
      pactBrokerUsername: process.env.PACT_BROKER_USERNAME,
      pactBrokerPassword: process.env.PACT_BROKER_PASSWORD,
    }
  : {
      pactUrls: [path.resolve(process.cwd(), 'pacts', 'UserConsumer-UserService.json')],
    };

describe('UserService — provider verification', () => {
  it('validates all consumer pacts', async () => {
    const verifier = new Verifier({
      provider: 'UserService',
      providerBaseUrl: `http://localhost:${PORT}`,
      ...pactSource,
      logLevel: 'warn',

      // State handlers set up provider state before each interaction is verified.
      stateHandlers: {
        'user 1 exists': async () => {
          users.set(1, { id: 1, name: 'Alice Smith', email: 'alice@example.com', role: 'admin' });
        },
        'user 2 exists': async () => {
          users.set(2, { id: 2, name: 'Bob Jones', email: 'bob@example.com', role: 'user' });
        },
        'user 99 does not exist': async () => {
          users.delete(99);
        },
        'the user service is available': async () => {
          // No specific state setup needed
        },
      },
    });

    await verifier.verifyProvider();
  }, 60000);
});
