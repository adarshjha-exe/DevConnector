const validator = require('validator');
function validateSignup(req) {
  if (!req.firstName || !req.lastName) {
    throw new Error('First name and last name are required');
  }
  if (!validator.isEmail(req.email)) {
    throw new Error('Invalid email format');
  }
  if (!validator.isStrongPassword(req.password)) {
    throw new Error('Password is not strong enough');
  }
}

module.exports = {
  validateSignup,
};
