let adminAuth = (req, res, next) => {
  let token = 'xyz';
  let isValid = token === 'xycaz';

  if (!isValid) {
    res.status(401).send('Unauthorised user!!!');
  } else {
    next();
  }
};

let userAuth = (req, res, next) => {
  let token = 'xyz';
  let isValid = token === 'xdyz';

  if (!isValid) {
    res.status(401).send('Unauthorised user!!!');
  } else {
    next();
  }
};

module.exports = {
  adminAuth,
  userAuth,
};
