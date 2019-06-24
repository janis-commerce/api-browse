'use strict';

const { APIView } = require('@janiscommerce/api-view');
const { Controller } = require('@janiscommerce/model-controller');
const { struct } = require('superstruct');

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

		this.validateController();
	}

	async process() {

		try {

			const getParams = {
				...this.filter.getParams(this.dataWithDefaults),
				...this.sort.getParams(this.dataWithDefaults),
				...this.paging.getParams(this.headersWithDefaults)
			};

			const result = await this.controller.get(getParams);
			const total = result.length ? await this.controller.getTotals() : 0;

			const rows = this.formatRows ? await this.formatRows(result) : result;

			this.setBody({
				rows,
				total
			});

		} catch(e) {
			throw new ApiBrowseError(e.message, ApiBrowseError.codes.INTERNAL_ERROR);
		}
	}

	validateController() {
		try {
			this.controller = Controller.getInstance(this.entity);
		} catch(e) {
			throw new ApiBrowseError(e.message, ApiBrowseError.codes.INVALID_ENTITY);
		}
	}

}

module.exports = ApiBrowseData;
