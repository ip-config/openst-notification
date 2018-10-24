// Load external packages
const chai = require('chai'),
  assert = chai.assert;

// Load notification service
const rootPrefix = '..',
  openSTNotificationKlass = require(rootPrefix + '/index'),
  configStrategy = require(rootPrefix + '/test/config_strategy.json');

require(rootPrefix + '/lib/rabbitmq/connect');
require(rootPrefix + '/services/publish_event');

const getParams = function() {
  return {
    topics: ['events.transfer'],
    message: {
      kind: 'event_received',
      payload: {
        event_name: 'one event of st m',
        params: { id: 'hello...' },
        contract_address: 'address'
      }
    }
  };
};

// Create connection.
const openStNotification = openSTNotificationKlass.getInstance(configStrategy);

describe('Publishing to rabbitMq', async function() {
  it('should return promise', async function() {
    let params = getParams(),
      response = openStNotification.publishEvent.perform(params);

    assert.typeOf(response, 'Promise');
  });

  it('should fail when empty params are passed', async function() {
    let params = {},
      response = await openStNotification.publishEvent.perform(params);

    assert.equal(response.isSuccess(), false);
  });

  it('should fail when no params are passed', async function() {
    let response = await openStNotification.publishEvent.perform();

    assert.equal(response.isSuccess(), false);
  });

  it('should fail when params dont have topics', async function() {
    let params = getParams();
    delete params['topics'];

    let response = await openStNotification.publishEvent.perform(params);

    assert.equal(response.isSuccess(), false);
  });

  it('should fail when params dont have message', async function() {
    let params = getParams();
    delete params['message'];

    let response = await openStNotification.publishEvent.perform(params);
    assert.equal(response.isSuccess(), false);
  });

  it('should fail when params message dont have kind', async function() {
    let params = getParams();
    delete params['message']['kind'];

    let response = await openStNotification.publishEvent.perform(params);
    assert.equal(response.isSuccess(), false);
  });

  it('should fail when params message dont have payload', async function() {
    let params = getParams();
    delete params['message']['payload'];

    let response = await openStNotification.publishEvent.perform(params);
    assert.equal(response.isSuccess(), false);
  });

  it('should fail when params message payload dont have event_name', async function() {
    let params = getParams();
    delete params['message']['payload']['event_name'];

    let response = await openStNotification.publishEvent.perform(params);
    assert.equal(response.isSuccess(), false);
  });

  it('should fail when params message payload dont have params', async function() {
    let params = getParams();
    delete params['message']['payload']['params'];

    let response = await openStNotification.publishEvent.perform(params);
    assert.equal(response.isSuccess(), false);
  });

  it('should fail when params message payload dont have contract_address', async function() {
    let params = getParams();
    delete params['message']['payload']['contract_address'];

    let response = await openStNotification.publishEvent.perform(params);
    assert.equal(response.isSuccess(), false);
  });

  it('should fail when unsupported kind is passed', async function() {
    let params = getParams();
    params['message']['kind'] = 'abcd';

    let response = await openStNotification.publishEvent.perform(params);
    assert.equal(response.isSuccess(), false);
  });
});
