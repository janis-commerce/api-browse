'use strict';

const assert = require('assert');
const { Controller } = require('@janiscommerce/model-controller');

const sandbox = require('sinon').createSandbox();

const ApiBrowse = require('..');
const { ApiBrowseError } = require('../lib');

describe('Api Browse', () => {

	afterEach(() => {
		sandbox.restore();
	});

	describe('Path parameter getter and setter', () => {

		it('Should return the set value', () => {

			const pathParameters = {
				foo: 'bar'
			};

			const apiBrowse = new ApiBrowse();
			apiBrowse.pathParameters = pathParameters;

			const apiPathParameters = apiBrowse.pathParameters;

			assert.deepStrictEqual(apiPathParameters, pathParameters);
		});
	});

	describe('Data getter and setter', () => {

		it('Should return the set value', () => {

			const data = {
				foo: 'bar'
			};

			const apiBrowse = new ApiBrowse();
			apiBrowse.data = data;

			const apiData = apiBrowse.data;

			assert.deepStrictEqual(apiData, data);
		});
	});

	describe('Code setter and response getter', () => {

		it('Should return the set value', () => {

			const apiBrowse = new ApiBrowse();
			apiBrowse.code = 500;

			const apiResponse = apiBrowse.response;

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

			const apiBrowse = new ApiBrowse();
			apiBrowse.entity = 'some-entity';
			apiBrowse.data = {};
			apiBrowse.headers = {};

			assert.throws(() => apiBrowse.validate(), ApiBrowseError);

			sandbox.assert.calledOnce(controllerStub);
			sandbox.assert.calledWithExactly(controllerStub, 'some-entity');
		});

		it('Should validate if no data is passed', () => {

			const controllerStub = sandbox.stub(Controller, 'getInstance');
			controllerStub.returns({});

			const apiBrowse = new ApiBrowse();
			apiBrowse.entity = 'some-entity';
			apiBrowse.data = {};
			apiBrowse.headers = {};

			const validation = apiBrowse.validate();

			assert.strictEqual(validation, undefined);

			sandbox.assert.calledOnce(controllerStub);
			sandbox.assert.calledWithExactly(controllerStub, 'some-entity');
		});

		it('Should set default values if no data is passed', () => {

			const controllerStub = sandbox.stub(Controller, 'getInstance');
			controllerStub.returns({});

			const apiBrowse = new ApiBrowse();
			apiBrowse.entity = 'some-entity';
			apiBrowse.data = {};
			apiBrowse.headers = {};

			const validation = apiBrowse.validate();

			assert.strictEqual(validation, undefined);

			assert.deepStrictEqual(apiBrowse.dataWithDefaults, {});
			assert.deepStrictEqual(apiBrowse.headersWithDefaults, {
				'x-janis-page': 1,
				'x-janis-page-size': 60
			});

			sandbox.assert.calledOnce(controllerStub);
			sandbox.assert.calledWithExactly(controllerStub, 'some-entity');
		});

		it('Should set default sort direction if only sort field is passed', () => {

			const controllerStub = sandbox.stub(Controller, 'getInstance');
			controllerStub.returns({});

			class MyApiBrowse extends ApiBrowse {
				get sortableFields() {
					return ['id'];
				}
			}

			const apiBrowse = new MyApiBrowse();
			apiBrowse.entity = 'some-entity';
			apiBrowse.data = {};
			apiBrowse.headers = {};

			const validation = apiBrowse.validate();

			assert.strictEqual(validation, undefined);

			assert.deepStrictEqual(apiBrowse.dataWithDefaults, {});
			assert.deepStrictEqual(apiBrowse.headersWithDefaults, {
				'x-janis-page': 1,
				'x-janis-page-size': 60
			});

			sandbox.assert.calledOnce(controllerStub);
			sandbox.assert.calledWithExactly(controllerStub, 'some-entity');
		});

		it('Should throw if sort field is passed and there are no sortable fields', () => {

			const controllerStub = sandbox.stub(Controller, 'getInstance');
			controllerStub.returns({});

			const apiBrowse = new ApiBrowse();
			apiBrowse.entity = 'some-entity';
			apiBrowse.data = {
				sortBy: 'id'
			};
			apiBrowse.headers = {};

			assert.throws(() => apiBrowse.validate(), err => {
				return err instanceof ApiBrowseError
					&& !!err.message.includes('sortBy')
					&& !!err.message.includes('id')
					&& !!err.message.includes('undefined');
			});

			sandbox.assert.notCalled(controllerStub);
		});

		it('Should throw if invalid sort field is passed', () => {

			const controllerStub = sandbox.stub(Controller, 'getInstance');
			controllerStub.returns({});

			class MyApiBrowse extends ApiBrowse {
				get sortableFields() {
					return ['id'];
				}
			}

			const apiBrowse = new MyApiBrowse();
			apiBrowse.entity = 'some-entity';
			apiBrowse.data = {
				sortBy: 'invalidField'
			};
			apiBrowse.headers = {};

			assert.throws(() => apiBrowse.validate(), err => {
				return err instanceof ApiBrowseError
					&& !!err.message.includes('sortBy')
					&& !!err.message.includes('invalidField');
			});

			sandbox.assert.notCalled(controllerStub);
		});

		it('Should throw if invalid sort direction is passed', () => {

			const controllerStub = sandbox.stub(Controller, 'getInstance');
			controllerStub.returns({});

			class MyApiBrowse extends ApiBrowse {
				get sortableFields() {
					return ['id'];
				}
			}

			const apiBrowse = new MyApiBrowse();
			apiBrowse.entity = 'some-entity';
			apiBrowse.data = {
				sortBy: 'id',
				sortDirection: 'unknownValue'
			};
			apiBrowse.headers = {};

			assert.throws(() => apiBrowse.validate(), err => {
				return err instanceof ApiBrowseError
					&& !!err.message.includes('sortDirection')
					&& !!err.message.includes('unknownValue');
			});

			sandbox.assert.notCalled(controllerStub);
		});

		it('Should throw if invalid page is passed', () => {

			const controllerStub = sandbox.stub(Controller, 'getInstance');
			controllerStub.returns({});

			const apiBrowse = new ApiBrowse();
			apiBrowse.entity = 'some-entity';
			apiBrowse.data = {};
			apiBrowse.headers = {
				'x-janis-page': -10
			};

			assert.throws(() => apiBrowse.validate(), err => {
				return err instanceof ApiBrowseError
					&& !!err.message.includes('x-janis-page')
					&& !!err.message.includes('-10');
			});

			sandbox.assert.notCalled(controllerStub);
		});

		it('Should throw if invalid page size is passed', () => {

			const controllerStub = sandbox.stub(Controller, 'getInstance');
			controllerStub.returns({});

			const apiBrowse = new ApiBrowse();
			apiBrowse.entity = 'some-entity';
			apiBrowse.data = {};
			apiBrowse.headers = {
				'x-janis-page-size': -10
			};

			assert.throws(() => apiBrowse.validate(), err => {
				return err instanceof ApiBrowseError
					&& !!err.message.includes('x-janis-page-size')
					&& !!err.message.includes('-10');
			});

			sandbox.assert.notCalled(controllerStub);
		});

		it('Should throw if filter is passed and there are no available filters', () => {

			const controllerStub = sandbox.stub(Controller, 'getInstance');
			controllerStub.returns({});

			const apiBrowse = new ApiBrowse();
			apiBrowse.entity = 'some-entity';
			apiBrowse.data = {
				filters: {
					foo: 'bar'
				}
			};
			apiBrowse.headers = {};

			assert.throws(() => apiBrowse.validate(), err => {
				return err instanceof ApiBrowseError
					&& !!err.message.includes('filters')
					&& !!err.message.includes('undefined');
			});

			sandbox.assert.notCalled(controllerStub);
		});

		it('Should throw if invalid filter is passed', () => {

			const controllerStub = sandbox.stub(Controller, 'getInstance');
			controllerStub.returns({});

			class MyApiBrowse extends ApiBrowse {
				get availableFilters() {
					return ['id'];
				}
			}

			const apiBrowse = new MyApiBrowse();
			apiBrowse.entity = 'some-entity';
			apiBrowse.data = {
				filters: {
					foo: 'bar'
				}
			};
			apiBrowse.headers = {};

			assert.throws(() => apiBrowse.validate(), err => {
				return err instanceof ApiBrowseError
					&& !!err.message.includes('filters')
					&& !!err.message.includes('id')
					&& !!err.message.includes('filters.foo');
			});

			sandbox.assert.notCalled(controllerStub);
		});

		it('Should validate if valid data is passed', () => {

			const controllerStub = sandbox.stub(Controller, 'getInstance');
			controllerStub.returns({});

			class MyApiBrowse extends ApiBrowse {

				get availableFilters() {
					return [
						'id',
						{
							name: 'id2',
							valueMapper: Number
						}
					];
				}

				get sortableFields() {
					return ['foo'];
				}
			}

			const apiBrowse = new MyApiBrowse();
			apiBrowse.entity = 'some-entity';
			apiBrowse.data = {
				filters: {
					id: '10',
					id2: '100'
				},
				sortBy: 'foo',
				sortDirection: 'asc'
			};
			apiBrowse.headers = {
				'x-janis-page': '3',
				'x-janis-page-size': '20'
			};

			const validation = apiBrowse.validate();

			assert.strictEqual(validation, undefined);

			sandbox.assert.calledOnce(controllerStub);
			sandbox.assert.calledWithExactly(controllerStub, 'some-entity');
		});
	});

	describe('Process', () => {

		it('Should throw an internal error if get fails', async () => {

			const controllerStub = sandbox.stub(Controller, 'getInstance');
			controllerStub.returns({
				get: () => {
					throw new Error('Some internal error');
				}
			});

			const apiBrowse = new ApiBrowse();
			apiBrowse.entity = 'some-entity';
			apiBrowse.data = {};
			apiBrowse.headers = {};

			apiBrowse.validate();

			await assert.rejects(() => apiBrowse.process());
		});

		it('Should pass the default parameters to the controller get', async () => {

			const getFake = sandbox.fake.returns([]);
			const getTotalsFake = sandbox.fake.returns(0);

			const controllerStub = sandbox.stub(Controller, 'getInstance');
			controllerStub.returns({
				get: getFake,
				getTotals: getTotalsFake
			});

			const apiBrowse = new ApiBrowse();
			apiBrowse.entity = 'some-entity';
			apiBrowse.data = {};
			apiBrowse.headers = {};

			apiBrowse.validate();

			await apiBrowse.process();

			sandbox.assert.calledOnce(getFake);
			sandbox.assert.calledWithExactly(getFake, {
				page: 1,
				limit: 60
			});
		});

		it('Should pass client defined parameters to the controller get', async () => {

			const getFake = sandbox.fake.returns([]);
			const getTotalsFake = sandbox.fake.returns(0);

			const controllerStub = sandbox.stub(Controller, 'getInstance');
			controllerStub.returns({
				get: getFake,
				getTotals: getTotalsFake
			});

			class MyApiBrowse extends ApiBrowse {

				get availableFilters() {
					return [
						'id',
						{
							name: 'id2',
							valueMapper: Number
						}
					];
				}

				get sortableFields() {
					return ['foo'];
				}
			}

			const apiBrowse = new MyApiBrowse();
			apiBrowse.entity = 'some-entity';
			apiBrowse.data = {
				sortBy: 'foo',
				sortDirection: 'DESC',
				filters: {
					id: '10',
					id2: '100'
				}
			};
			apiBrowse.headers = {
				'x-janis-page': 2,
				'x-janis-page-size': 20
			};

			apiBrowse.validate();

			await apiBrowse.process();

			sandbox.assert.calledOnce(getFake);
			sandbox.assert.calledWithExactly(getFake, {
				page: 2,
				limit: 20,
				order: {
					foo: 'desc'
				},
				filters: {
					id: '10',
					id2: 100
				}
			});
		});

		it('Should return an empty rows array and zero total rows if passed params do not find any result', async () => {

			const getFake = sandbox.fake.returns([]);
			const getTotalsFake = sandbox.fake.returns(0);

			const controllerStub = sandbox.stub(Controller, 'getInstance');
			controllerStub.returns({
				get: getFake,
				getTotals: getTotalsFake
			});

			const apiBrowse = new ApiBrowse();
			apiBrowse.entity = 'some-entity';
			apiBrowse.data = {};
			apiBrowse.headers = {};

			apiBrowse.validate();

			const result = await apiBrowse.process();

			assert.deepStrictEqual(result, {
				code: 200,
				body: {
					rows: [],
					total: 0
				}
			});

			sandbox.assert.calledOnce(getFake);
			sandbox.assert.calledWithExactly(getFake, {
				page: 1,
				limit: 60
			});
		});

		it('Should return a rows array and total rows if passed params do find results', async () => {

			const row = {
				foo: 'bar'
			};

			const getFake = sandbox.fake.returns([row]);
			const getTotalsFake = sandbox.fake.returns(100);

			const controllerStub = sandbox.stub(Controller, 'getInstance');
			controllerStub.returns({
				get: getFake,
				getTotals: getTotalsFake
			});

			const apiBrowse = new ApiBrowse();
			apiBrowse.entity = 'some-entity';
			apiBrowse.data = {};
			apiBrowse.headers = {};

			apiBrowse.validate();

			const result = await apiBrowse.process();

			assert.deepStrictEqual(result, {
				code: 200,
				body: {
					rows: [row],
					total: 100
				}
			});

			sandbox.assert.calledOnce(getFake);
			sandbox.assert.calledWithExactly(getFake, {
				page: 1,
				limit: 60
			});
		});

	});

});
