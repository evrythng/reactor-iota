# reactor-iota

This Reactor Extension script is part of
[EVRYTHNG's Blockchain Integration Hub](https://developers.evrythng.com/docs/blockchain-integration-hub).
It can be used to send EVRYTHNG
[actions](https://developers.evrythng.com/reference/actions) to the
[IOTA](https://www.iota.org/) Distributed Ledger Technology and its networks.

It uses IOTA's [MAM (Masked Authenticated Messaging)](https://docs.iota.org/)
protocol to create chains of messages.


## Configure

1.  Deploy this Reactor script in an application within a project, not
    forgetting to specify the `dependencies` in `package.json`.
2.  Check the `NODE_ADDRESS` is correct for your usage (see _Testing_ below).
3.  Ensure that the `CONFIRMATION_ACTION_TYPE` action type exists in the same
    project as the EVRYTHNG application hosting the Reactor script.


## Use

The script will react to actions with a `sendToIOTA=true` custom field
and will create a blockchain transaction for the action using the specified
IOTA network address. You can include any extra custom fields that you may
require in addition to the one mentioned here. The target of the original action
can be either a Thng, product, or collection.

Once the script has run, the resulting `iotaRoot` and `iotaMamState` are added
to the target Thng, product, or collection's custom fields. The `iotaRoot` is
the address in the IOTA Tangle where the item's MAM starts, and the 
`iotaMamState` is an opaque object that allows the Reactor script to continue
adding transactions to the same MAM channel (i.e.: in a single chain) on
subsequent invocations. This allows the MAM channel to closly resemble the
target's action history.


## Testing

If you do not currently have a value for `NODE_ADDRESS`, we recommend using the
IOTA devnet for testing transactions:

```
https://nodes.devnet.thetangle.org:443
```

Once the script is installed, test it by creating an action with the correct
custom field specified on a Thng, product, or collection in the project's scope,
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

The resulting action created by the script will contain the MAM root address
from the IOTA API, as well as the original action that triggered the script:

```json
{
  "id": "UqBxr4smwUfQ65wRa5rhekKk",
  "createdAt": 1547819753753,
  "customFields": {
    "iotaRoot": "OTSFLSN99OPPHDRVFGQGOZUHIJU9FWTXTSPAWWYUJUULQIHPKOE9IJVJGIBI9MWFY9PM99JHETBKLGZFO",
    "originalAction": {
      "createdAt": 1547743511700,
      "createdByApp": "UMeapwhwb3KSe2wwRGxPCMdq",
      "createdByProject": "UqAAEK6TKt3MDsRwRmbUcAef",
      "customFields": {
        "sendToIOTA": true
      },
      "id": "UqewKSbEPqnK8Baaa7nEhn3m",
      "location": {
        "latitude": 51.4876,
        "longitude": -0.1694,
        "position": {
          "coordinates": [
            -0.1694,
            51.4876
          ],
          "type": "Point"
        }
      },
      "locationSource": "geoIp",
      "thng": "UMBapwrBURqtVywwamWgmgYa",
      "timestamp": 1547743511700,
      "type": "_ItemShipped"
    }
  },
  "timestamp": 1547819753753,
  "type": "_sentToIOTA",
  "location": {
    "latitude": 51.4876,
    "longitude": -0.1694,
    "position": {
      "type": "Point",
      "coordinates": [
        -0.1694,
        51.4876
      ]
    }
  },
  "locationSource": "geoIp",
  "context": {
    "city": "Chelsea",
    "region": "England",
    "countryCode": "GB",
    "timeZone": "Europe/London"
  },
  "createdByProject": "UqAAEK6TKt3MDsRwRmbUcAef",
  "createdByApp": "UMeapwhwb3KSe2wwRGxPCMdq",
  "thng": "UqVx7dc2adfQqpRRaK69Anxa",
  "product": "UMUEVMrHKn5s4dwww3ykNwgq"
}
```
