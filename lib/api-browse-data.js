'use strict';

const { Controller } = require('@janiscommerce/model-controller');
const { struct } = require('superstruct');

const ApiBrowseError = require('./api-browse-error');
const { Filter, Paging, Sort } = require('./data-helpers');

class ApiBrowseData {

	get pathParameters() {
		return this._pathParameters;
	}

	set pathParameters(pathParameters) {
		this._pathParameters = pathParameters;
	}

	set data(data) {
		this._data = data;
	}

	get data() {
		return this._data;
	}

	set code(code) {
		this._response.code = code;
	}

	get response() {
		return this._response;
	}

	get sortableFields() {
		return [];
	}

	get availableFilters() {
		return [];
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

		this.filter = new Filter(this.data.filters || {}, this.availableFilters);
		this.paging = new Paging(this.headers);
		this.sort = new Sort(this.data, this.sortableFields);

		const browseDataStruct = struct({
			...this.filter.struct(),
			...this.sort.struct()
		}, {
			...this.sort.defaults()
		});

		try {
			this.dataWithDefaults = browseDataStruct(this.data);
		} catch(e) {
			throw new ApiBrowseError(e.message, ApiBrowseError.codes.INVALID_REQUEST_DATA);
		}

		const browseHeadersStruct = struct({
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

			return {
				code: 200,
				body: {
					rows: result,
					total
				}
			};

		} catch(e) {
			this.code = 500;
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
