const test = require('node:test');
const assert = require('node:assert');

class LocalStorageMock {
  constructor() {
    this.store = {};
  }
  clear() {
    this.store = {};
  }
  getItem(key) {
    return Object.prototype.hasOwnProperty.call(this.store, key)
      ? this.store[key]
      : null;
  }
  setItem(key, value) {
    this.store[key] = String(value);
  }
}

global.localStorage = new LocalStorageMock();

const { currentToken } = require('./app.js');

test('currentToken saves and retrieves expires_in from localStorage', () => {
  const token = { access_token: 'abc', refresh_token: 'def', expires_in: 3600 };
  currentToken.save(token);
  assert.strictEqual(currentToken.expires_in, String(token.expires_in));
  assert.strictEqual(localStorage.getItem('expires_in'), String(token.expires_in));
});
