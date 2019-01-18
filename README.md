# reactor-iota

A Reactor Extension script to send EVRYTHNG actions to the IOTA decentralized 
blockchain network.


## Configure

1. Deploy this Reactor script in an application within that project, not 
   forgetting to specify the `dependencies` in `package.json`.
2. Check the `NODE_ADDRESS` is correct for your usage.
3. Ensure that the `ACTION_TYPE_CONFIRMATION` exists in the same project as the 
   EVRYTHNG application hosting the Reactor script.


## Use

The script will react to actions with a `sendToIOTA=true` custom field 
and will create a blockchain transaction for the action using the specified
IOTA network address. You can include any extra custom fields that you may
require in addition to the one mentioned here.


## Testing

Once the script is installed, test it by creating an action with the correct
custom field specified on a Thng in the project's scope, for example:

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
