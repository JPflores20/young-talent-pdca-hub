const assert = require('assert');
try {
  assert.fail('test');
} catch (e) {
  console.log(e.message);
}
