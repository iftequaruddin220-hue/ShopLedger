var test = require('node:test');
var assert = require('node:assert');
var dates = require('../lib/dates');
var orders = require('../lib/orders');
var ledger = require('../lib/ledger');

function orderDb() {
  return { orders: [
    { id: 1008, date: '15/03/2022' },
    { id: 1004, date: '30/01/2022' },
    { id: 1001, date: '28/12/2021' }
  ] };
}

function customerDb() {
  return {
    customers: [{
      id: 1,
      name: 'Meera Joshi',
      openingBalance: 450,
      totalBilled: 1982.01,
      totalSettled: 1200,
      balance: 1232.01
    }],
    settlements: [],
    nextSettlementId: 505
  };
}

test('REGRESSION: orders.list sorts mixed DD/MM/YYYY dates newest first', function () {
  var db = orderDb();
  assert.deepEqual(orders.list(db, {}).map(function (order) { return order.id; }), [1008, 1004, 1001]);
});

test('REGRESSION: orders.list applies inclusive YYYY-MM-DD from and to filters', function () {
  var db = orderDb();
  assert.deepEqual(orders.list(db, { from: '2022-01-30' }).map(function (order) { return order.id; }), [1008, 1004]);
  assert.deepEqual(orders.list(db, { to: '2022-01-30' }).map(function (order) { return order.id; }), [1004, 1001]);
  assert.deepEqual(orders.list(db, { from: '2022-01-30', to: '2022-01-30' }).map(function (order) { return order.id; }), [1004]);
});

test('REGRESSION: dates.normalizeDateKey normalizes both formats and rejects invalid dates', function () {
  assert.strictEqual(dates.normalizeDateKey('15/03/2022'), '2022-03-15');
  assert.strictEqual(dates.normalizeDateKey('30/01/2022'), '2022-01-30');
  assert.strictEqual(dates.normalizeDateKey('2022-12-28'), '2022-12-28');
  assert.strictEqual(dates.normalizeDateKey('31/02/2022'), '');
  assert.strictEqual(dates.normalizeDateKey(''), '');
});

test('CURRENT BEHAVIOUR: ledger.recordSettlement updates balance for numeric amount 500', function () {
  var db = customerDb();
  var result = ledger.recordSettlement(db, 1, 500, 'upi', 'test');

  assert.strictEqual(result.ok, true);
  assert.strictEqual(result.customer.totalSettled, 1700);
  assert.strictEqual(result.customer.balance, 732.01);
  assert.strictEqual(result.settlement.amount, 500);
  assert.strictEqual(db.settlements.length, 1);
});

test('REGRESSION: ledger.recordSettlement converts string amount "500" numerically', function () {
  var db = customerDb();
  var result = ledger.recordSettlement(db, 1, '500', 'upi', 'test');

  assert.strictEqual(result.ok, true);
  assert.strictEqual(result.customer.totalSettled, 1700);
  assert.strictEqual(result.customer.balance, 732.01);
  assert.strictEqual(result.settlement.amount, 500);
  assert.strictEqual(db.settlements.length, 1);
});

test('REGRESSION: zero, negative, and non-numeric settlement amounts are rejected unchanged', function () {
  [0, -1, 'not a number'].forEach(function (amount) {
    var db = customerDb();
    var result = ledger.recordSettlement(db, 1, amount, 'upi', 'test');

    assert.strictEqual(result.ok, false);
    assert.strictEqual(result.error, 'Settlement amount must be greater than zero');
    assert.strictEqual(db.customers[0].totalSettled, 1200);
    assert.strictEqual(db.customers[0].balance, 1232.01);
    assert.strictEqual(db.settlements.length, 0);
    assert.strictEqual(db.nextSettlementId, 505);
  });
});

test('REGRESSION: order date sorting/filtering and JSON string settlement arithmetic are correct', function () {
  var failures = [];
  var db = orderDb();
  var checks = [
    {
      name: 'newest-first order IDs',
      actual: orders.list(db, {}).map(function (order) { return order.id; }),
      expected: [1008, 1004, 1001]
    },
    {
      name: 'inclusive from date IDs',
      actual: orders.list(db, { from: '2022-01-30' }).map(function (order) { return order.id; }),
      expected: [1008, 1004]
    },
    {
      name: 'inclusive to date IDs',
      actual: orders.list(db, { to: '2022-01-30' }).map(function (order) { return order.id; }),
      expected: [1004, 1001]
    }
  ];

  checks.forEach(function (check) {
    try {
      assert.deepEqual(check.actual, check.expected);
    } catch (error) {
      failures.push(check.name + ': ' + error.message);
    }
  });

  var settlementDb = customerDb();
  var result = ledger.recordSettlement(settlementDb, 1, '500', 'upi', 'test');
  try {
    assert.strictEqual(result.customer.totalSettled, 1700);
    assert.strictEqual(result.customer.balance, 732.01);
    assert.strictEqual(result.settlement.amount, 500);
  } catch (error) {
    failures.push('numeric settlement and Meera balance: ' + error.message);
  }

  assert.deepEqual(failures, []);
});
