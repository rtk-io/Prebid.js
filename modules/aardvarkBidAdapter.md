# Overview

**Module Name**: Aardvark Bidder Adapter
**Module Type**: Bidder Adapter
**Maintainer**: chris@rtk.io

# Description

Module that connects to RTK.io Aardvark endpoint to fetch bids.

# Test Parameters
```
   ``
      var adUnits = [{
        code: 'banner-ad-div',
        mediaTypes: {
          banner: {
            sizes: [[300, 250]],
          },
        },
        bids: [{
          bidder: 'aardvark',
          params: {
            "ai": "yyYC",
            "sc": "UJ6Q"
          }
        }]
      }];
```
