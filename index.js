const Mam = require('@iota/mam');
const { asciiToTrytes } = require('@iota/converter');
const hashJs = require('hash.js');
const jsonSortify = require('json.sortify');

let mamState = Mam.init('https://nodes.devnet.thetangle.org:443');
mamState = Mam.changeMode(mamState, 'public');

// @filter(onActionCreated) action.customFields.sendToIOTA=true
function onActionCreated(event) {
    sendToIOTA(event)
    .catch(err => logger.error(err.message || err.errors[0]))
    .then(done);
}

function sendToIOTA(event) {
    // Convert event to trytes
    const sha256 = hash(event.action);
    logger.info('SHA of Action -- ' + sha256)
    const trytes = asciiToTrytes(sha256);
    const message = Mam.create(mamState, trytes);
    const action = event.action;

    // Fetch the Thng to see if we have a MAM root
    return app.thng(action.thng).read()
    .then(function (thng) {
      if(thng.customFields.iotaRoot) {
        const root = thng.customFields.iotaRoot;
        logger.info('Found IOTA MAM root -- ' + root);
        message.root = root;
      } else {
        // We did not have a MAM root because this is the first event in the MAM channel
        logger.info('No IOTA MAM root');
      }
      return thng;
    }).then(function(thng) {
      Mam.attach(message.payload, message.address, 3, 9).then(function (){
        if(!thng.customFields.iotaRoot) {
          // Write MAM root to Thng
          return app.thng(action.thng).update({customFields : {'iotaRoot' : message.root}});
        }
      }).catch(error => logger.error(error));
    })
  };

function hash(data) {
  return hashJs.sha256()
    .update(jsonSortify(data))
    .digest('hex');
}

module.exports = {
  onActionCreated
};
