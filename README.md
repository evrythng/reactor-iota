# reactor-iota

This Reactor Extension script is part of
[EVRYTHNG's Blockchain Integration Hub](https://developers.evrythng.com/docs/blockchain-integration-hub).
It can be used to send EVRYTHNG
[actions](https://developers.evrythng.com/reference/actions) to the
[IOTA](https://chrysalis.docs.iota.org/) Distributed Ledger Technology and its networks.

It uses the [IOTA Streams](https://github.com/iotaledger/streams) second layer protocol 
to create chains of messages anchored to the Tangle. 
The [anchors]https://www.npmjs.com/package/@tangle-js/anchors) library 
is used to get access to the IOTA Streams functionality through the abstraction of an anchoring channel. 

## Configure

1.  Deploy this Reactor script in an application within a project, not
    forgetting to specify the `dependencies` in `package.json`.
2.  You can specify a `NODE_ADDRESS`, otherwise `https://chrysalis-nodes.iota.org` will be used (see _Testing_ below).
3.  Ensure that the `CONFIRMATION_ACTION_TYPE` action type exists in the same
    project as the EVRYTHNG application hosting the Reactor script.


## Use

The script will react to actions with a `sendToIOTA=true` custom field
and will create a DLT transaction for the action using the specified
IOTA network address or the Chrysalis mainnet IF's default nodes. 
You can include any extra custom fields that you may
require in addition to the one mentioned here. The target of the original action
can be either a `Thng`, `product`, or `collection`.

Once the script has run, the resulting `channelID`, `seed` and `publicKey` are added
to the target Thng, product, or collection's custom fields under a dictionary named 
`iotaAnchoringChannel`. The `channelID` is the combination of the channel address 
and the initial anchorage (announce message) provided by the anchoring 
channel associated to the target. The `seed` is the secret used to create such a channel 
and to anchor action's hashes. Such seed is used to generate an Ed25519 key pair which 
public key component is stored under the `publicKey` custom field. The public key allows
 to verify the authenticity of the anchored messages when fetched. 

Last but not least, the `iotaAnchoringChannel` dictionary contains the `nextAnchorageID`
member which allows the Reactor script to continue anchoring messages to the same IOTA Streams
channel  (i.e.: in a single chain) on subsequent invocations. This allows the anchoring channel 
to closely resemble the target's action history.


## Testing

Once the script is installed, test it by creating an action with the correct
custom field specified on a `Thng`, `product`, or `collection` in the project's scope,
for example:

```json
{
  "type": "_ItemShipped",
  "thng": "UKn4wYKEYyQnc2aawGhytBfc",
  "customFields": {
    "sendToIOTA": true
  }
}
```

The confirmation action created by the script will contain the channelID, as well as a pointer to the original action that triggered the script:

```json
{
    "type": "_sentToIOTA",
    "id": "VasQR7nVxNMmYMUNxYMwpFap",
    "createdAt": 1626279332221,
    "customFields": {
        "channelID": "5f9bf50c1e569935e8dee6885623b218653bec4974336f35bb496799479f6dbe0000000000000000:0e39dbea0bf5ded36b7ae626",
        "originalAction": {
            "id": "Vw8Qw7Ha7gNsSfg2MNChAqQe",
            "type": "_bottleOpened"
        },
        "publicKey": "5f9bf50c1e569935e8dee6885623b218653bec4974336f35bb496799479f6dbe"
    },
    "timestamp": 1626279332221,
    "location": {
        "latitude": 39.0481,
        "longitude": -77.4728,
        "position": {
            "type": "Point",
            "coordinates": [
                -77.4728,
                39.0481
            ]
        }
    },
    "locationSource": "geoIp",
    "createdByProject": "Vwrya4hYsEXpPxcxtxGEHrHa",
    "createdByApp": "VasP3WkKBDTfT9Ertk4abmQb",
    "thng": "Vw89wM7ntBfq9FVeEy9EYqbm",
    "product": "VRNr4p4ysF5FBFCHMPRNehnh"
}
```

You can also inspect the anchoring channel content by using the [tangle-cli](https://www.npmjs.com/package/@tangle-js/tangle-cli) tool. For instance, 


```console
tcli channel inspect --channelID="0d00913710aa876fadfb7aa3a7c1f99399dea03c442111f82976bf41df9dd0b50000000000000000:99c47f5045a0b27876a68087" --seed=jjfwzxqfmbpqiqrqiyntmdtucqxfgwapzciywutlarkzbixerisfqlxkqsgajvpyofmuktweqltnniup --mainnet
```
