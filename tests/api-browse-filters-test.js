'use strict';

const assert = require('assert');

const sandbox = require('sinon').createSandbox();

const { ApiBrowseFilters } = require('..');
const { ApiBrowseError } = require('../lib');

describe('Api Browse Filters', () => {

	afterEach(() => {
		sandbox.restore();
	});

	describe('Validation', () => {

		it('Should throw if model is not found', () => {

			const getModelInstanceFake = sandbox.stub(ApiBrowseFilters.prototype, '_getModelInstance');
			getModelInstanceFake.throws('Model does not exist');

			const apiBrowseFilters = new ApiBrowseFilters();
			apiBrowseFilters.entity = 'some-entity';
			apiBrowseFilters.data = {};
			apiBrowseFilters.headers = {};

			assert.throws(() => apiBrowseFilters.validate(), ApiBrowseError);
		});

		it('Should validate if model is found', () => {

			const getModelInstanceFake = sandbox.stub(ApiBrowseFilters.prototype, '_getModelInstance');
			getModelInstanceFake.returns({});

			const apiBrowseFilters = new ApiBrowseFilters();
			apiBrowseFilters.entity = 'some-entity';
			apiBrowseFilters.data = {};
			apiBrowseFilters.headers = {};

			const validation = apiBrowseFilters.validate();

			assert.strictEqual(validation, undefined);
		});
	});

	describe('Process', () => {

		it('Should throw an internal error if getFiltersValues is not overriden', async () => {

			const getModelInstanceFake = sandbox.stub(ApiBrowseFilters.prototype, '_getModelInstance');
			getModelInstanceFake.returns({});

			const apiBrowseFilters = new ApiBrowseFilters();
			apiBrowseFilters.entity = 'some-entity';
			apiBrowseFilters.data = {};
			apiBrowseFilters.headers = {};

			apiBrowseFilters.validate();

			await assert.rejects(() => apiBrowseFilters.process(), {
				name: 'ApiBrowseError',
				message: 'Method getFiltersValues should be implemented in your API'
			});
		});

		it('Should throw an internal error if getFiltersValues throws', async () => {

			class MyApiBrowseFilters extends ApiBrowseFilters {
				async getFiltersValues() {
					throw new Error('Some custom error');
				}
			}

			const getModelInstanceFake = sandbox.stub(ApiBrowseFilters.prototype, '_getModelInstance');
			getModelInstanceFake.returns({});

			const apiBrowseFilters = new MyApiBrowseFilters();
			apiBrowseFilters.entity = 'some-entity';
			apiBrowseFilters.data = {};
			apiBrowseFilters.headers = {};

			apiBrowseFilters.validate();

			await assert.rejects(() => apiBrowseFilters.process(), {
				name: 'ApiBrowseError',
				message: 'Some custom error'
			});
		});

		it('Should return an object of filters if no errors occur', async () => {

			const theFilters = {
				foo: {
					options: [
						{ value: 1, title: 'Some title' },
						{ value: 2, title: 'Some other title' }
					]
				}
			};

			class MyApiBrowseFilters extends ApiBrowseFilters {
				async getFiltersValues() {
					return theFilters;
				}
			}

			const getModelInstanceFake = sandbox.stub(ApiBrowseFilters.prototype, '_getModelInstance');
			getModelInstanceFake.returns({});

			const apiBrowseFilters = new MyApiBrowseFilters();
			apiBrowseFilters.entity = 'some-entity';
			apiBrowseFilters.data = {};
			apiBrowseFilters.headers = {};

			apiBrowseFilters.validate();

			await apiBrowseFilters.process();

			assert.deepStrictEqual(apiBrowseFilters.response.body, {
				filters: theFilters
			});
		});
	});

});
