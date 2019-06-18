'use strict';

const assert = require('assert');
const { Controller } = require('@janiscommerce/model-controller');

const sandbox = require('sinon').createSandbox();

const { ApiBrowseFilters } = require('..');
const { ApiBrowseError } = require('../lib');

describe('Api Browse Filters', () => {

	afterEach(() => {
		sandbox.restore();
	});

	describe('Code setter and response getter', () => {

		it('Should return the set value', () => {

			const apiBrowseFilters = new ApiBrowseFilters();
			apiBrowseFilters.code = 500;

			const apiResponse = apiBrowseFilters.response;

			assert.deepStrictEqual(apiResponse, {
				body: undefined,
				code: 500,
				headers: {},
				cookies: {}
			});
		});
	});

	describe('Validation', () => {

		it('Should throw if controller is not found', () => {

			const controllerStub = sandbox.stub(Controller, 'getInstance');
			controllerStub.throws('Controller does not exist');

			const apiBrowseFilters = new ApiBrowseFilters();
			apiBrowseFilters.entity = 'some-entity';
			apiBrowseFilters.data = {};
			apiBrowseFilters.headers = {};

			assert.throws(() => apiBrowseFilters.validate(), ApiBrowseError);

			sandbox.assert.calledOnce(controllerStub);
			sandbox.assert.calledWithExactly(controllerStub, 'some-entity');
		});

		it('Should validate if controller is found', () => {

			const controllerStub = sandbox.stub(Controller, 'getInstance');
			controllerStub.returns({});

			const apiBrowseFilters = new ApiBrowseFilters();
			apiBrowseFilters.entity = 'some-entity';
			apiBrowseFilters.data = {};
			apiBrowseFilters.headers = {};

			const validation = apiBrowseFilters.validate();

			assert.strictEqual(validation, undefined);

			sandbox.assert.calledOnce(controllerStub);
			sandbox.assert.calledWithExactly(controllerStub, 'some-entity');
		});
	});

	describe('Process', () => {

		it('Should throw an internal error if getFiltersValues is not overriden', async () => {

			const controllerStub = sandbox.stub(Controller, 'getInstance');
			controllerStub.returns({});

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

			const controllerStub = sandbox.stub(Controller, 'getInstance');
			controllerStub.returns({});

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

		it('Should throw an internal error if getFiltersValues throws', async () => {

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

			const controllerStub = sandbox.stub(Controller, 'getInstance');
			controllerStub.returns({});

			const apiBrowseFilters = new MyApiBrowseFilters();
			apiBrowseFilters.entity = 'some-entity';
			apiBrowseFilters.data = {};
			apiBrowseFilters.headers = {};

			apiBrowseFilters.validate();

			const result = await apiBrowseFilters.process();

			assert.deepStrictEqual(result, {
				code: 200,
				body: {
					filters: theFilters
				}
			});
		});
	});

});
