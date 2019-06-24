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

	async formatRows(rows) {
		return rows.map(row => ({ ...row, oneMoreField: true }));
	}

}

module.exports = MyApiBrowseData;
```

- API Browse Filters
```js
'use strict';

const { ApiBrowseFilters } = require('@janiscommerce/api-browse');

class MyApiBrowseFilters extends ApiBrowseFilters {

	get getFiltersValues() {
		return {
			someField: {
				options: [
					{ label: 'some.label1', value: 1 },
					{ label: 'some.label2', value: 2 }
				]
			}
		};
	}

}

module.exports = MyApiBrowseFilters;
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