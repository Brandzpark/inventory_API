const resource = (user) => {
  return {
    _id: user?._id,
    firstName: user?.firstName,
    lastName: user?.lastName,
    email: user?.email,
    role: user?.role,
    permissions: user?.permissions,
    image: user?.image ?? null,
  };
};

const logResource = (user) => {
  return {
    _id: user?._id,
    firstName: user?.firstName,
    lastName: user?.lastName,
    email: user?.email,
    role: user?.role,
  };
};
const collection = (users) => {
  return users.map((user) => resource(user));
};

module.exports = {
  resource,
  collection,
  logResource
};
