# API Browse

[![Build Status](https://travis-ci.org/janis-commerce/api-browse.svg?branch=master)](https://travis-ci.org/janis-commerce/api-browse)
[![Coverage Status](https://coveralls.io/repos/github/janis-commerce/api-browse/badge.svg?branch=master)](https://coveralls.io/github/janis-commerce/api-browse?branch=master)

A package to handle JANIS Views Browse APIs

# Installation

```
npm install @janiscommerce/api-browse
```

# Usage

- API Browse Data
```js
'use strict';

const { ApiBrowseData } = require('@janiscommerce/api-browse');

class MyApiBrowseData extends ApiBrowseData {

	get sortableFields() {
		return [
			'id',
			'status'
		];
	}

	get availableFilters() {
		return [
			'id',
			{
				name: 'status',
				valueMapper: Number
			}
		];
	}

}

module.exports = MyApiBrowseData;
```

- API Browse Filters
```js
'use strict';

const { ApiBrowseFilters } = require('@janiscommerce/api-browse');

(async () => {

	const apiBrowseFilters = new ApiBrowseFilters();

	apiBrowseFilters.pathParameters = {
		entity: 'someEntity'
	};

	await apiBrowseFilters.validate();

	const response = ApiBrowseFilters.process();

	console.log(response);

	/**
	 * Expected output:
	 *
	 * {
	 * 	code: 200,
	 * 	body: {
	 * 		rows: [
	 * 			{ ... }
	 * 		],
	 * 		total: 20
	 * 	}
	 * }
	 *
	 * Or it will throw if an error occurs
	 */

})();
```

# Function minimal configuration

```yml
functions:
  handler: path/to/your.handler
  events:
    - http:
        integration: lambda
        path: view/{entity}/browse/data
        method: GET
        request:
          parameters:
            paths:
              entity: true
```