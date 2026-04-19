const { Publisher } = require('@pact-foundation/pact');
const path = require('path');
const { version } = require('../package.json');

const brokerUrl = process.env.PACT_BROKER_BASE_URL;
const username = process.env.PACT_BROKER_USERNAME;
const password = process.env.PACT_BROKER_PASSWORD;
const token = process.env.PACT_BROKER_TOKEN;

if (!brokerUrl) {
  console.error('PACT_BROKER_BASE_URL is required');
  process.exit(1);
}

new Publisher({
  pactBroker: brokerUrl,
  ...(token ? { pactBrokerToken: token } : { pactBrokerUsername: username, pactBrokerPassword: password }),
  pactFilesOrDirs: [path.resolve(__dirname, '..', 'pacts')],
  consumerVersion: version,
  tags: ['main'],
})
  .publishPacts()
  .then(() => console.log('Pacts published successfully'))
  .catch((err) => {
    console.error('Failed to publish pacts:', err.message);
    process.exit(1);
  });
