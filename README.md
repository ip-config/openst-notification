# OpenST Notification

[![Latest version](https://img.shields.io/npm/v/@openstfoundation/openst-notification.svg?maxAge=3600)][npm]
[![Travis](https://img.shields.io/travis/OpenSTFoundation/openst-notification.svg?maxAge=600)][travis]
[![Downloads per month](https://img.shields.io/npm/dm/@openstfoundation/openst-notification.svg?maxAge=3600)][npm]
[![Gitter](https://img.shields.io/gitter/room/OpenSTFoundation/github.js.svg?maxAge=3600)][gitter]

OpenST Notification helps publish critical events from OpenST Platform and other related packages. All events get published using node EventEmitter and, if configured, events are also published through RabbitMQ, using topic-based exchange.

# Install OpenST Notification

```bash
npm install @openstfoundation/openst-notification --save
```

# Examples:

#### Subscribe to OpenST events published through RabbitMQ:

- Basic example on how to listen a specific event. Arguments passed are:
  - <b>Events</b> [Array] (mandatory) - List of events to subscribe to
  - <b>Options</b> [object] (mandatory) - 
    - <b>queue</b> [string] (optional) - Name of the queue on which you want to receive all your subscribed events. These queues and events, published in them, have TTL of 6 days. If a queue name is not passed, a queue with a unique name is created and is deleted when the subscriber gets disconnected.
    - <b>ackRequired</b> [number] - (optional) - The delivered message needs ack if passed 1 ( default 0 ). if 1 passed and ack not done, message will redeliver.
    - <b>prefetch</b> [number] (optional) - The number of messages released from queue in parallel. In case of ackRequired=1, queue will pause unless delivered messages are acknowledged.
  - <b>Callback</b> [function] (mandatory) - Callback method will be invoked whenever there is a new notification
  
```js
// Config Strategy for openst-notification.
configStrategy = {
	OST_RMQ_USERNAME: 'guest',
	OST_RMQ_PASSWORD: 'guest',
	OST_RMQ_HOST: '127.0.0.1',
	OST_RMQ_PORT: '5672',
	OST_RMQ_HEARTBEATS: '30'
};
// Import the notification module.
const openSTNotification = require('@openstfoundation/openst-notification');
let unAckCount = 0; //Number of unacknowledged messages.

const subscribe = async function() {
  let openSTNotificationInstance = await openSTNotification.getInstance(configStrategy);
  openSTNotificationInstance.subscribeEvent.rabbit(
    ["event.ProposedBrandedToken"],
    {
      queue: 'myQueue',
      ackRequired: 1, // When set to 1, all delivered messages MUST get acknowledge. 
      prefetch:10
    }, 
    function(msgContent){
      // Please make sure to return promise in callback function. 
      // On resolving the promise, the message will get acknowledged.
      // On rejecting the promise, the message will be re-queued (noAck)
      return new Promise(async function(onResolve, onReject) {
        // Incrementing unacknowledged message count.
        unAckCount++;
        console.log('Consumed message -> ', msgContent);
        response = await processMessage(msgContent);
        
        // Complete the task and in the end of all tasks done
        if(response == success){
          // The message MUST be acknowledged here.
          // To acknowledge the message, call onResolve
          // Decrementing unacknowledged message count.
          unAckCount--;
          onResolve();   
        } else {
          //in case of failure to requeue same message.
          onReject();
        }
       
      })
    
    });
};
// Gracefully handle SIGINT, SIGTERM signals.
// Once SIGINT/SIGTERM signal is received, programme will stop consuming new messages. 
// But, the current process MUST handle unacknowledged queued messages.
process.on('SIGINT', function () {
  console.log('Received SIGINT, checking unAckCount.');
  const f = function(){
    if (unAckCount === 0) {
      process.exit(1);
    } else {
      console.log('waiting for open tasks to be done.');
      setTimeout(f, 1000);
    }
  };
  setTimeout(f, 1000);
});

function ostRmqError(err) {
  logger.info('ostRmqError occured.', err);
  process.emit('SIGINT');
}
// Event published from package in case of internal error.
process.on('ost_rmq_error', ostRmqError);
subscribe();
```

- Example on how to listen to multiple events with one subscriber.

```js
// Config Strategy for openst-notification.
configStrategy = {
	OST_RMQ_USERNAME: 'guest',
	OST_RMQ_PASSWORD: 'guest',
	OST_RMQ_HOST: '127.0.0.1',
	OST_RMQ_PORT: '5672',
	OST_RMQ_HEARTBEATS: '30'
};
// Import the notification module.
const openSTNotification = require('@openstfoundation/openst-notification');
const subscribeMultiple = async function() {
  let openSTNotificationInstance = await openSTNotification.getInstance(configStrategy);
  openSTNotificationInstance.subscribeEvent.rabbit(
    ["event.ProposedBrandedToken", "obBoarding.registerBrandedToken"],
    {}, 
    function(msgContent){
      console.log('Consumed message -> ', msgContent)
    });
  };
subscribeMultiple();
```

#### Subscribe to OpenST local events published through EventEmitter:

- Basic example on how to listen a specific event. Arguments passed are:
  - <b>Events</b> (mandatory) - List of events to subscribe to
  - <b>Callback</b> (mandatory) - Callback method will be invoked whenever there is a new notification
  
```js
// Config Strategy for openst-notification.
configStrategy = {
	OST_RMQ_USERNAME: 'guest',
	OST_RMQ_PASSWORD: 'guest',
	OST_RMQ_HOST: '127.0.0.1',
	OST_RMQ_PORT: '5672',
	OST_RMQ_HEARTBEATS: '30'
};
// Import the notification module.
const openSTNotification = require('@openstfoundation/openst-notification');
const subscribeLocal = async function() {
  let openSTNotificationInstance = await openSTNotification.getInstance(configStrategy);
  openSTNotificationInstance.subscribeEvent.local(["event.ProposedBrandedToken"], 
  function(msgContent){
    console.log('Consumed message -> ', msgContent)
  });
  };
subscribeLocal();
```

#### Publish to OpenST Notifications:

- All events are by default published using EventEmitter and if configured, through RabbmitMQ as well.

```js
// Config Strategy for openst-notification.
configStrategy = {
	OST_RMQ_USERNAME: 'guest',
	OST_RMQ_PASSWORD: 'guest',
	OST_RMQ_HOST: '127.0.0.1',
	OST_RMQ_PORT: '5672',
	OST_RMQ_HEARTBEATS: '30'
};
// Import the notification module.
const openSTNotification = require('@openstfoundation/openst-notification');
const publish = async function() {
  let openSTNotificationInstance = await openSTNotification.getInstance(configStrategy);
  openSTNotificationInstance.publishEvent.perform(
    {
      topics:["event.ProposedBrandedToken"], 
      publisher: 'MyPublisher',
      message: {
  	  kind: "event_received",
  	  payload: {
  		event_name: 'ProposedBrandedToken',
  		params: {
  		  //params of the event
  		},
          contract_address: 'contract address',
          chain_id: 'Chain id',
          chain_kind: 'kind of the chain'
  	  }
  	}
    });
};
publish();
```

#### Pause and Restart queue consumption:

- We also support pause and start queue consumption. According to your logical condition, you can fire below events from your process to cancel or restart consumption respectively.

```js

// Config Strategy for openst-notification.
let configStrategy = {
	OST_RMQ_USERNAME: 'guest',
	OST_RMQ_PASSWORD: 'guest',
	OST_RMQ_HOST: '127.0.0.1',
	OST_RMQ_PORT: '5672',
	OST_RMQ_HEARTBEATS: '30'
};
let queueConsumerTag = null;
// Import the notification module.
const openSTNotification = require('@openstfoundation/openst-notification');
const subscribePauseRestartConsume = async function() {
  let openSTNotificationInstance = await openSTNotification.getInstance(configStrategy);
  openSTNotificationInstance.subscribeEvent.rabbit(
    ["event.ProposedBrandedToken", "obBoarding.registerBrandedToken"],
    {}, 
    function(msgContent){
      console.log('Consumed message -> ', msgContent);
      
      if(some_failure_condition){
        process.emit('CANCEL_CONSUME', queueConsumerTag);
      }
      
      if(failure_resolve_detected){
        process.emit('RESUME_CONSUME', queueConsumerTag);
      }
    },
    function(consumerTag) {
      queueConsumerTag = consumerTag;
    }
    );
  };
subscribePauseRestartConsume();
```

For further implementation details, please refer to the [API documentation][api-docs].

[gitter]: https://gitter.im/OpenSTFoundation/SimpleToken
[npm]: https://www.npmjs.com/package/@openstfoundation/openst-notification
[travis]: https://travis-ci.org/OpenSTFoundation/openst-notification
[api-docs]: https://openstfoundation.github.io/openst-notification/
   
