'use strict';

const assert = require('assert');
const { Controller } = require('@janiscommerce/model-controller');

const sandbox = require('sinon').createSandbox();

const { ApiBrowseData } = require('..');
const { ApiBrowseError } = require('../lib');

describe('Api Browse Data', () => {

	afterEach(() => {
		sandbox.restore();
	});

	describe('Path parameter getter and setter', () => {

		it('Should return the set value', () => {

			const pathParameters = {
				foo: 'bar'
			};

			const apiBrowseData = new ApiBrowseData();
			apiBrowseData.pathParameters = pathParameters;

			const apiPathParameters = apiBrowseData.pathParameters;

			assert.deepStrictEqual(apiPathParameters, pathParameters);
		});
	});

	describe('Data getter and setter', () => {

		it('Should return the set value', () => {

			const data = {
				foo: 'bar'
			};

			const apiBrowseData = new ApiBrowseData();
			apiBrowseData.data = data;

			const apiData = apiBrowseData.data;

			assert.deepStrictEqual(apiData, data);
		});
	});

	describe('Code setter and response getter', () => {

		it('Should return the set value', () => {

			const apiBrowseData = new ApiBrowseData();
			apiBrowseData.code = 500;

			const apiResponse = apiBrowseData.response;

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

			const apiBrowseData = new ApiBrowseData();
			apiBrowseData.entity = 'some-entity';
			apiBrowseData.data = {};
			apiBrowseData.headers = {};

			assert.throws(() => apiBrowseData.validate(), ApiBrowseError);

			sandbox.assert.calledOnce(controllerStub);
			sandbox.assert.calledWithExactly(controllerStub, 'some-entity');
		});

		it('Should validate if no data is passed', () => {

			const controllerStub = sandbox.stub(Controller, 'getInstance');
			controllerStub.returns({});

			const apiBrowseData = new ApiBrowseData();
			apiBrowseData.entity = 'some-entity';
			apiBrowseData.data = {};
			apiBrowseData.headers = {};

			const validation = apiBrowseData.validate();

			assert.strictEqual(validation, undefined);

			sandbox.assert.calledOnce(controllerStub);
			sandbox.assert.calledWithExactly(controllerStub, 'some-entity');
		});

		it('Should set default values if no data is passed', () => {

			const controllerStub = sandbox.stub(Controller, 'getInstance');
			controllerStub.returns({});

			const apiBrowseData = new ApiBrowseData();
			apiBrowseData.entity = 'some-entity';
			apiBrowseData.data = {};
			apiBrowseData.headers = {};

			const validation = apiBrowseData.validate();

			assert.strictEqual(validation, undefined);

			assert.deepStrictEqual(apiBrowseData.dataWithDefaults, {});
			assert.deepStrictEqual(apiBrowseData.headersWithDefaults, {
				'x-janis-page': 1,
				'x-janis-page-size': 60
			});

			sandbox.assert.calledOnce(controllerStub);
			sandbox.assert.calledWithExactly(controllerStub, 'some-entity');
		});

		it('Should set default sort direction if only sort field is passed', () => {

			const controllerStub = sandbox.stub(Controller, 'getInstance');
			controllerStub.returns({});

			class MyApiBrowseData extends ApiBrowseData {
				get sortableFields() {
					return ['id'];
				}
			}

			const apiBrowseData = new MyApiBrowseData();
			apiBrowseData.entity = 'some-entity';
			apiBrowseData.data = {};
			apiBrowseData.headers = {};

			const validation = apiBrowseData.validate();

			assert.strictEqual(validation, undefined);

			assert.deepStrictEqual(apiBrowseData.dataWithDefaults, {});
			assert.deepStrictEqual(apiBrowseData.headersWithDefaults, {
				'x-janis-page': 1,
				'x-janis-page-size': 60
			});

			sandbox.assert.calledOnce(controllerStub);
			sandbox.assert.calledWithExactly(controllerStub, 'some-entity');
		});

		it('Should throw if sort field is passed and there are no sortable fields', () => {

			const controllerStub = sandbox.stub(Controller, 'getInstance');
			controllerStub.returns({});

			const apiBrowseData = new ApiBrowseData();
			apiBrowseData.entity = 'some-entity';
			apiBrowseData.data = {
				sortBy: 'id'
			};
			apiBrowseData.headers = {};

			assert.throws(() => apiBrowseData.validate(), err => {
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

			class MyApiBrowseData extends ApiBrowseData {
				get sortableFields() {
					return ['id'];
				}
			}

			const apiBrowseData = new MyApiBrowseData();
			apiBrowseData.entity = 'some-entity';
			apiBrowseData.data = {
				sortBy: 'invalidField'
			};
			apiBrowseData.headers = {};

			assert.throws(() => apiBrowseData.validate(), err => {
				return err instanceof ApiBrowseError
					&& !!err.message.includes('sortBy')
					&& !!err.message.includes('invalidField');
			});

			sandbox.assert.notCalled(controllerStub);
		});

		it('Should throw if invalid sort direction is passed', () => {

			const controllerStub = sandbox.stub(Controller, 'getInstance');
			controllerStub.returns({});

			class MyApiBrowseData extends ApiBrowseData {
				get sortableFields() {
					return ['id'];
				}
			}

			const apiBrowseData = new MyApiBrowseData();
			apiBrowseData.entity = 'some-entity';
			apiBrowseData.data = {
				sortBy: 'id',
				sortDirection: 'unknownValue'
			};
			apiBrowseData.headers = {};

			assert.throws(() => apiBrowseData.validate(), err => {
				return err instanceof ApiBrowseError
					&& !!err.message.includes('sortDirection')
					&& !!err.message.includes('unknownValue');
			});

			sandbox.assert.notCalled(controllerStub);
		});

		it('Should throw if invalid page is passed', () => {

			const controllerStub = sandbox.stub(Controller, 'getInstance');
			controllerStub.returns({});

			const apiBrowseData = new ApiBrowseData();
			apiBrowseData.entity = 'some-entity';
			apiBrowseData.data = {};
			apiBrowseData.headers = {
				'x-janis-page': -10
			};

			assert.throws(() => apiBrowseData.validate(), err => {
				return err instanceof ApiBrowseError
					&& !!err.message.includes('x-janis-page')
					&& !!err.message.includes('-10');
			});

			sandbox.assert.notCalled(controllerStub);
		});

		it('Should throw if invalid page size is passed', () => {

			const controllerStub = sandbox.stub(Controller, 'getInstance');
			controllerStub.returns({});

			const apiBrowseData = new ApiBrowseData();
			apiBrowseData.entity = 'some-entity';
			apiBrowseData.data = {};
			apiBrowseData.headers = {
				'x-janis-page-size': -10
			};

			assert.throws(() => apiBrowseData.validate(), err => {
				return err instanceof ApiBrowseError
					&& !!err.message.includes('x-janis-page-size')
					&& !!err.message.includes('-10');
			});

			sandbox.assert.notCalled(controllerStub);
		});

		it('Should throw if filter is passed and there are no available filters', () => {

			const controllerStub = sandbox.stub(Controller, 'getInstance');
			controllerStub.returns({});

			const apiBrowseData = new ApiBrowseData();
			apiBrowseData.entity = 'some-entity';
			apiBrowseData.data = {
				filters: {
					foo: 'bar'
				}
			};
			apiBrowseData.headers = {};

			assert.throws(() => apiBrowseData.validate(), err => {
				return err instanceof ApiBrowseError
					&& !!err.message.includes('filters')
					&& !!err.message.includes('undefined');
			});

			sandbox.assert.notCalled(controllerStub);
		});

		it('Should throw if invalid filter is passed', () => {

			const controllerStub = sandbox.stub(Controller, 'getInstance');
			controllerStub.returns({});

			class MyApiBrowseData extends ApiBrowseData {
				get availableFilters() {
					return ['id'];
				}
			}

			const apiBrowseData = new MyApiBrowseData();
			apiBrowseData.entity = 'some-entity';
			apiBrowseData.data = {
				filters: {
					foo: 'bar'
				}
			};
			apiBrowseData.headers = {};

			assert.throws(() => apiBrowseData.validate(), err => {
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

			class MyApiBrowseData extends ApiBrowseData {

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

			const apiBrowseData = new MyApiBrowseData();
			apiBrowseData.entity = 'some-entity';
			apiBrowseData.data = {
				filters: {
					id: '10',
					id2: '100'
				},
				sortBy: 'foo',
				sortDirection: 'asc'
			};
			apiBrowseData.headers = {
				'x-janis-page': '3',
				'x-janis-page-size': '20'
			};

			const validation = apiBrowseData.validate();

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

			const apiBrowseData = new ApiBrowseData();
			apiBrowseData.entity = 'some-entity';
			apiBrowseData.data = {};
			apiBrowseData.headers = {};

			apiBrowseData.validate();

			await assert.rejects(() => apiBrowseData.process());
		});

		it('Should pass the default parameters to the controller get', async () => {

			const getFake = sandbox.fake.returns([]);
			const getTotalsFake = sandbox.fake.returns(0);

			const controllerStub = sandbox.stub(Controller, 'getInstance');
			controllerStub.returns({
				get: getFake,
				getTotals: getTotalsFake
			});

			const apiBrowseData = new ApiBrowseData();
			apiBrowseData.entity = 'some-entity';
			apiBrowseData.data = {};
			apiBrowseData.headers = {};

			apiBrowseData.validate();

			await apiBrowseData.process();

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

			class MyApiBrowseData extends ApiBrowseData {

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

			const apiBrowseData = new MyApiBrowseData();
			apiBrowseData.entity = 'some-entity';
			apiBrowseData.data = {
				sortBy: 'foo',
				sortDirection: 'DESC',
				filters: {
					id: '10',
					id2: '100'
				}
			};
			apiBrowseData.headers = {
				'x-janis-page': 2,
				'x-janis-page-size': 20
			};

			apiBrowseData.validate();

			await apiBrowseData.process();

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

			const apiBrowseData = new ApiBrowseData();
			apiBrowseData.entity = 'some-entity';
			apiBrowseData.data = {};
			apiBrowseData.headers = {};

			apiBrowseData.validate();

			const result = await apiBrowseData.process();

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

			const apiBrowseData = new ApiBrowseData();
			apiBrowseData.entity = 'some-entity';
			apiBrowseData.data = {};
			apiBrowseData.headers = {};

			apiBrowseData.validate();

			const result = await apiBrowseData.process();

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
