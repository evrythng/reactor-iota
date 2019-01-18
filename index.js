const { asciiToTrytes } = require('@iota/converter');
const hashJs = require('hash.js');
const jsonSortify = require('json.sortify');
const Mam = require('@iota/mam');

const NODE_ADDRESS = 'https://nodes.devnet.thetangle.org:443';
const DEPTH = 3;
const MWM = 9;
const ACTION_TYPE_CONFIRMATION = '_sentToIOTA';

let action, thng;

/**
 * Send the action's SHA 256 hash to IOTA.
 *
 * @returns {Promise} Promise that resolves the Thng, and the new MAM root.
 */
const sendToIOTA = () => {
  // Hash the action with SHA256
  const sha256 = hashJs.sha256()
    .update(jsonSortify(action))
    .digest('hex');
  logger.debug(`Action SHA256: ${sha256}`);

  // Prepare the IOTA payload
  const mamState = Mam.changeMode(Mam.init(NODE_ADDRESS), 'public');
  const message = Mam.create(mamState, asciiToTrytes(sha256));

  // Use pre-recorded MAM root, if any
  if(thng.customFields && thng.customFields.iotaRoot) {
    message.root = thng.customFields.iotaRoot;
  }

  return Mam.attach(message.payload, message.address, DEPTH, MWM)
    .then(() => {
      logger.debug(`MAM root: ${message.root}`);
      return message.root;
    });
};

/**
 * Update the Thng with the IOTA MAM root, if it doesn't already have one.
 *
 * @param {string} iotaRoot - Root address for the MAM.
 * @returns {Promise} Promise that resolves once the Thng is updated.
 */
const updateThngRoot = (iotaRoot) => {
  if (thng.customFields && thng.customFields.iotaRoot) {
    return Promise.resolve(thng);
  }

  const customFields = Object.assign(thng.customFields || {}, { iotaRoot });
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
    type: ACTION_TYPE_CONFIRMATION,
    customFields: { originalAction: action, iotaRoot: thng.customFields.iotaRoot },
  };
  return app.thng(thng.id)
    .action(ACTION_TYPE_CONFIRMATION)
    .create(payload)
    .then(newAction => logger.info(`Confirmation action: ${newAction.id}`));
};

// @filter(onActionCreated) action.customFields.sendToIOTA=true
const onActionCreated = (event) => {
  logger.info(`Sending action ${event.action.id} to IOTA`);

  Promise.all([
    app.action('all', event.action.id).read(),
    app.thng(event.action.thng).read(),
  ])
    .then((results) => {
      action = results[0];
      thng = results[1];
    })
    .then(sendToIOTA)
    .then(updateThngRoot)
    .then(createConfirmation)
    .catch(err => logger.error(err.message || err.errors[0]))
    .then(done);
};

module.exports = { onActionCreated };