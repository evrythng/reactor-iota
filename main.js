const { asciiToTrytes } = require('@iota/converter');
const hashJs = require('hash.js');
const jsonSortify = require('json.sortify');
const Mam = require('@iota/mam');

const NODE_ADDRESS = 'https://nodes.devnet.thetangle.org:443';
const DEPTH = 3;
const MWM = 9;
const CONFIRMATION_ACTION_TYPE = '_sentToIOTA';

let action, target;

/**
 * Send the action's SHA 256 hash to IOTA.
 *
 * @returns {Promise} Promise that resolves the message root, and the new MAM state.
 */
const sendToIOTA = () => {
  // Hash the action with SHA256
  const sha256 = hashJs.sha256()
    .update(jsonSortify(action))
    .digest('hex');
  logger.debug(`Action SHA256: ${sha256}`);

  // Use pre-recorded MAM state, else use a new one
  let mamState = Mam.changeMode(Mam.init(NODE_ADDRESS), 'public');
  if(target.customFields && target.customFields.iotaMamState) {
    mamState = target.customFields.iotaMamState;
  }

  // Encode the payload
  try {
    const { root, payload, address } = Mam.create(mamState, asciiToTrytes(sha256));
    return Mam.attach(payload, address, DEPTH, MWM).then(() => {
      logger.debug(`root: ${root}`);
      return { root, mamState };
    });
  } catch (e) {
    return Promise.reject('Failed to create and/or attach: ' + e.message + ' - ' + e.stack);
  }
};

/**
 * Update the target with the IOTA MAM root, if it does not exist, and always update the MAM state.
 *
 * @param {object} data - root and mamState from sendToIOTA().
 * @returns {Promise} Promise that resolves once the target is updated.
 */
const updateTarget = (data) => {
  if (!target.customFields) {
    target.customFields = {};
  }

  const customFields = Object.assign(target.customFields, { iotaMamState: data.mamState });
  if (!target.customFields.iotaRoot) {
    customFields.iotaRoot = data.root;
  }

  if (action.thng) {
    return app.thng(target.id).update({ customFields });
  }

  if (action.collection) {
    return app.collection(target.id).update({ customFields });
  }

  return app.product(target.id).update({ customFields });
};

/**
 * Create a confirmation action containing the original action and the IOTA root
 *
 * @returns {Promise} Promise that resolves to the confirmation action.
 */
const createConfirmation = () => {
  const payload = {
    type: CONFIRMATION_ACTION_TYPE,
    customFields: { originalAction: action, iotaRoot: target.customFields.iotaRoot },
  };

  if (action.thng) {
    payload.thng = action.thng;
  } else if (action.product) {
    payload.product = action.product;
  } else if (action.collection) {
    payload.collection = action.collection;
  }

  return app.action(CONFIRMATION_ACTION_TYPE)
    .create(payload)
    .then(newAction => logger.info(`Confirmation action: ${newAction.id}`));
};

// @filter(onActionCreated) action.customFields.sendToIOTA=true
const onActionCreated = (event) => {
  logger.info(`Sending action ${event.action.id} to IOTA`);

  app.action('all', event.action.id).read()
    .then((res) => {
      action = res;

      if (action.thng) {
        return app.thng(action.thng).read();
      }

      if (action.product) {
        return app.product(action.product).read();
      }

      if (action.collection) {
        return app.collection(action.collection).read();
      }

      throw new Error('No target specified!');
    })
    .then((res) => {
      target = res;
    })
    .then(sendToIOTA)
    .then(updateTarget)
    .then(createConfirmation)
    .catch(err => logger.error(err.message || err.errors[0]))
    .then(done);
};

module.exports = { onActionCreated };
