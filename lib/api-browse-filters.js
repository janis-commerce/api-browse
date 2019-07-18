'use strict';

const { APIView } = require('@janiscommerce/api-view');
const path = require('path');

const ApiBrowseError = require('./api-browse-error');

class ApiBrowseFilters extends APIView {

	validate() {
		this._validateModel();
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

	_validateModel() {
		try {
			this.model = this._getModelInstance();
		} catch(e) {
			throw new ApiBrowseError(e.message, ApiBrowseError.codes.INVALID_ENTITY);
		}
	}

	/* istanbul ignore next */
	_getModelInstance() {
		// eslint-disable-next-line global-require, import/no-dynamic-require
		const Model = require(path.join(process.cwd(), process.env.MS_PATH, 'models', this.entity));
		return new Model();
	}

}

module.exports = ApiBrowseFilters;
