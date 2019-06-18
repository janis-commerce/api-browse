'use strict';

const { Controller } = require('@janiscommerce/model-controller');

const ApiBrowseError = require('./api-browse-error');

class ApiBrowseFilters {

	set code(code) {
		this._response.code = code;
	}

	get response() {
		return this._response;
	}

	constructor() {
		this._response = {
			code: undefined,
			body: undefined,
			headers: {},
			cookies: {}
		};
	}

	validate() {
		this.validateController();
	}

	async process() {

		try {

			const filters = await this.getFiltersValues();

			return {
				code: 200,
				body: {
					filters
				}
			};

		} catch(e) {
			this.code = 500;
			throw new ApiBrowseError(e.message, ApiBrowseError.codes.INTERNAL_ERROR);
		}
	}

	async getFiltersValues() {
		throw new Error('Method getFiltersValues should be implemented in your API');
	}

	validateController() {
		try {
			this.controller = Controller.getInstance(this.entity);
		} catch(e) {
			throw new ApiBrowseError(e.message, ApiBrowseError.codes.INVALID_ENTITY);
		}
	}

}

module.exports = ApiBrowseFilters;
