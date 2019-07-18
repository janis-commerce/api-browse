'use strict';

const assert = require('assert');

const sandbox = require('sinon').createSandbox();

const { ApiBrowseData } = require('..');
const { ApiBrowseError } = require('../lib');

describe('Api Browse Data', () => {

	afterEach(() => {
		sandbox.restore();
	});

	describe('Validation', () => {

		it('Should throw if model is not found', () => {

			const getModelInstanceFake = sandbox.stub(ApiBrowseData.prototype, '_getModelInstance');
			getModelInstanceFake.throws('Model does not exist');

			const apiBrowseData = new ApiBrowseData();
			apiBrowseData.entity = 'some-entity';
			apiBrowseData.data = {};
			apiBrowseData.headers = {};

			assert.throws(() => apiBrowseData.validate(), ApiBrowseError);
		});

		it('Should validate if no data is passed', () => {

			const getModelInstanceFake = sandbox.stub(ApiBrowseData.prototype, '_getModelInstance');
			getModelInstanceFake.returns({});

			const apiBrowseData = new ApiBrowseData();
			apiBrowseData.entity = 'some-entity';
			apiBrowseData.data = {};
			apiBrowseData.headers = {};

			const validation = apiBrowseData.validate();

			assert.strictEqual(validation, undefined);
		});

		it('Shouldn\'t thow because of unknown headers', () => {

			const getModelInstanceFake = sandbox.stub(ApiBrowseData.prototype, '_getModelInstance');
			getModelInstanceFake.returns({});

			const apiBrowseData = new ApiBrowseData();
			apiBrowseData.entity = 'some-entity';
			apiBrowseData.data = {};
			apiBrowseData.headers = {
				'x-foo': 'bar'
			};

			const validation = apiBrowseData.validate();

			assert.strictEqual(validation, undefined);
		});

		it('Should set default values if no data is passed', () => {

			const getModelInstanceFake = sandbox.stub(ApiBrowseData.prototype, '_getModelInstance');
			getModelInstanceFake.returns({});

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
		});

		it('Should set default sort direction if only sort field is passed', () => {

			const getModelInstanceFake = sandbox.stub(ApiBrowseData.prototype, '_getModelInstance');
			getModelInstanceFake.returns({});

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
		});

		it('Should throw if sort field is passed and there are no sortable fields', () => {

			const getModelInstanceFake = sandbox.stub(ApiBrowseData.prototype, '_getModelInstance');
			getModelInstanceFake.returns({});

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
		});

		it('Should throw if invalid sort field is passed', () => {

			const getModelInstanceFake = sandbox.stub(ApiBrowseData.prototype, '_getModelInstance');
			getModelInstanceFake.returns({});

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
		});

		it('Should throw if invalid sort direction is passed', () => {

			const getModelInstanceFake = sandbox.stub(ApiBrowseData.prototype, '_getModelInstance');
			getModelInstanceFake.returns({});

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
		});

		it('Should throw if invalid page is passed', () => {

			const getModelInstanceFake = sandbox.stub(ApiBrowseData.prototype, '_getModelInstance');
			getModelInstanceFake.returns({});

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
		});

		it('Should throw if invalid page size is passed', () => {

			const getModelInstanceFake = sandbox.stub(ApiBrowseData.prototype, '_getModelInstance');
			getModelInstanceFake.returns({});

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
		});

		it('Should throw if filter is passed and there are no available filters', () => {

			const getModelInstanceFake = sandbox.stub(ApiBrowseData.prototype, '_getModelInstance');
			getModelInstanceFake.returns({});

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
		});

		it('Should throw if invalid filter is passed', () => {

			const getModelInstanceFake = sandbox.stub(ApiBrowseData.prototype, '_getModelInstance');
			getModelInstanceFake.returns({});

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
		});

		it('Should validate if valid data is passed', () => {

			const getModelInstanceFake = sandbox.stub(ApiBrowseData.prototype, '_getModelInstance');
			getModelInstanceFake.returns({});

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
		});
	});

	describe('Process', () => {

		it('Should throw an internal error if get fails', async () => {

			const getModelInstanceFake = sandbox.stub(ApiBrowseData.prototype, '_getModelInstance');
			getModelInstanceFake.returns({
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

		it('Should pass the default parameters to the model get', async () => {

			const getFake = sandbox.fake.returns([]);
			const getTotalsFake = sandbox.fake.returns({ total: 0 });

			const getModelInstanceFake = sandbox.stub(ApiBrowseData.prototype, '_getModelInstance');
			getModelInstanceFake.returns({
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

		it('Should pass client defined parameters to the model get', async () => {

			const getFake = sandbox.fake.returns([]);
			const getTotalsFake = sandbox.fake.returns({ total: 0 });

			const getModelInstanceFake = sandbox.stub(ApiBrowseData.prototype, '_getModelInstance');
			getModelInstanceFake.returns({
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
			const getTotalsFake = sandbox.fake.returns({ total: 0 });

			const getModelInstanceFake = sandbox.stub(ApiBrowseData.prototype, '_getModelInstance');
			getModelInstanceFake.returns({
				get: getFake,
				getTotals: getTotalsFake
			});

			const apiBrowseData = new ApiBrowseData();
			apiBrowseData.entity = 'some-entity';
			apiBrowseData.data = {};
			apiBrowseData.headers = {};

			apiBrowseData.validate();

			await apiBrowseData.process();

			assert.deepStrictEqual(apiBrowseData.response.body, {
				rows: [],
				total: 0
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
			const getTotalsFake = sandbox.fake.returns({ total: 100 });

			const getModelInstanceFake = sandbox.stub(ApiBrowseData.prototype, '_getModelInstance');
			getModelInstanceFake.returns({
				get: getFake,
				getTotals: getTotalsFake
			});

			const apiBrowseData = new ApiBrowseData();
			apiBrowseData.entity = 'some-entity';
			apiBrowseData.data = {};
			apiBrowseData.headers = {};

			apiBrowseData.validate();

			await apiBrowseData.process();

			assert.deepStrictEqual(apiBrowseData.response.body, {
				rows: [row],
				total: 100
			});

			sandbox.assert.calledOnce(getFake);
			sandbox.assert.calledWithExactly(getFake, {
				page: 1,
				limit: 60
			});
		});

		it('Should return a rows array (formatted) and total rows if passed params do find results', async () => {

			class MyApiBrowseData extends ApiBrowseData {

				formatRows(rows) {
					return rows.map(row => ({ ...row, moreFoo: true }));
				}

			}

			const row = {
				foo: 'bar'
			};

			const getFake = sandbox.fake.returns([row]);
			const getTotalsFake = sandbox.fake.returns({ total: 100 });

			const getModelInstanceFake = sandbox.stub(ApiBrowseData.prototype, '_getModelInstance');
			getModelInstanceFake.returns({
				get: getFake,
				getTotals: getTotalsFake
			});

			const apiBrowseData = new MyApiBrowseData();
			apiBrowseData.entity = 'some-entity';
			apiBrowseData.data = {};
			apiBrowseData.headers = {};

			apiBrowseData.validate();

			await apiBrowseData.process();

			assert.deepStrictEqual(apiBrowseData.response.body, {
				rows: [{
					foo: 'bar',
					moreFoo: true
				}],
				total: 100
			});

			sandbox.assert.calledOnce(getFake);
			sandbox.assert.calledWithExactly(getFake, {
				page: 1,
				limit: 60
			});
		});

	});

});
