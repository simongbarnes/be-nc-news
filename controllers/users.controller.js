const selectUsers = require("../models/users.model");

function getUsers(req, res, next) {
    selectUsers()
    .then((users) => res.status(200).send({users}))
    .catch(next);
};

module.exports = getUsers;