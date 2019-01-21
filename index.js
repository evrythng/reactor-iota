const { asciiToTrytes } = require('@iota/converter');
const hashJs = require('hash.js');
const jsonSortify = require('json.sortify');
const Mam = require('@iota/mam');

const NODE_ADDRESS = 'https://nodes.devnet.thetangle.org:443';
const DEPTH = 3;
const MWM = 9;
const CONFIRMATION_ACTION_TYPE = '_sentToIOTA';

let action, thng;

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
  if(thng.customFields && thng.customFields.iotaMamState) {
    mamState = thng.customFields.iotaMamState;
  }
  
  // Encode the payload
  const { root, payload, address } = Mam.create(mamState, asciiToTrytes(sha256));
  return Mam.attach(payload, address, DEPTH, MWM).then(() => {
    logger.debug(`root: ${root}`);
    return { root: root, mamState };
  });
};

/**
 * Update the Thng with the IOTA MAM root, if it does not exist, and always update the MAM state.
 *
 * @param {object} data - root and mamState from sendToIOTA().
 * @returns {Promise} Promise that resolves once the Thng is updated.
 */
const updateThng = (data) => {
  const customFields = Object.assign(thng.customFields || {}, { iotaMamState: data.mamState });
  if (!thng.customFields.iotaRoot) {
    customFields.iotaRoot = data.root;
  }

  return app.thng(thng.id).update({ customFields });
};

/**
 * Create a confirmation action containing the original action and the IOTA root
 *
 * @returns {Promise} Promise that resolves to the confirmation action.
 */
const createConfirmation = () => {
  const payload = {
    thng: thng.id,
    type: CONFIRMATION_ACTION_TYPE,
    customFields: { originalAction: action, iotaRoot: thng.customFields.iotaRoot },
  };
  return app.thng(thng.id)
    .action(CONFIRMATION_ACTION_TYPE)
    .create(payload)
    .then(newAction => logger.info(`Confirmation action: ${newAction.id}`));
};

// @filter(onActionCreated) action.customFields.sendToIOTA=true
const onActionCreated = (event) => {
  logger.info(`Sending action ${event.action.id} to IOTA`);

  Promise.all([
    app.action('all', event.action.id).read(),
    app.thng(event.action.thng).read(),
  ]).then((results) => {
      action = results[0];
      thng = results[1];
    })
    .then(sendToIOTA)
    .then(updateThng)
    .then(createConfirmation)
    .catch(err => logger.error(err.message || err.errors[0]))
    .then(done);
};

module.exports = { onActionCreated };