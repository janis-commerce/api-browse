'use strict';

const { APIView } = require('@janiscommerce/api-view');
const { Controller } = require('@janiscommerce/model-controller');

const ApiBrowseError = require('./api-browse-error');

class ApiBrowseFilters extends APIView {

	validate() {
		this.validateController();
	}

	async process() {

		try {

			const filters = await this.getFiltersValues();

			this.setBody({
				filters
			});

		} catch(e) {
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
