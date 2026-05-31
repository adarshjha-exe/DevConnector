function validateProfileUpdate(req) {
  const ALLOWED_FIELDS = [
    'firstName',
    'lastName',
    'photoUrl',
    'about',
    'skills',
    'gender',
  ];

  const data = req.body;

  const isAllowed = Object.keys(data).every((value) => {
    return ALLOWED_FIELDS.includes(value);
  });
  return isAllowed;
}

module.exports = validateProfileUpdate;
