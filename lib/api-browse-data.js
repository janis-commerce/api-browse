'use strict';

const { APIView } = require('@janiscommerce/api-view');
const { struct } = require('superstruct');
const path = require('path');

const ApiBrowseError = require('./api-browse-error');
const { Filter, Paging, Sort } = require('./data-helpers');

class ApiBrowseData extends APIView {

	get sortableFields() {
		return [];
	}

	get availableFilters() {
		return [];
	}

	validate() {

		this.filter = new Filter(this.data.filters || {}, this.availableFilters);
		this.paging = new Paging(this.headers);
		this.sort = new Sort(this.data, this.sortableFields);

		const browseDataStruct = struct({
			...this.filter.struct(),
			...this.sort.struct()
		}, {
			...this.filter.defaults(),
			...this.sort.defaults()
		});

		try {
			this.dataWithDefaults = browseDataStruct(this.data);
		} catch(e) {
			throw new ApiBrowseError(e.message, ApiBrowseError.codes.INVALID_REQUEST_DATA);
		}

		const browseHeadersStruct = struct.interface({
			...this.paging.struct()
		}, {
			...this.paging.defaults()
		});

		try {
			this.headersWithDefaults = browseHeadersStruct(this.headers);
		} catch(e) {
			throw new ApiBrowseError(e.message, ApiBrowseError.codes.INVALID_REQUEST_DATA);
		}

		this._validateModel();
	}

	async process() {

		try {

			const getParams = {
				...this.filter.getParams(this.dataWithDefaults),
				...this.sort.getParams(this.dataWithDefaults),
				...this.paging.getParams(this.headersWithDefaults)
			};

			const result = await this.model.get(getParams);
			const totals = result.length ? await this.model.getTotals() : { total: 0 };

			const { total } = totals;

			const rows = this.formatRows ? await this.formatRows(result) : result;

			this.setBody({
				rows,
				total
			});

		} catch(e) {
			throw new ApiBrowseError(e.message, ApiBrowseError.codes.INTERNAL_ERROR);
		}
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

module.exports = ApiBrowseData;
