const { selectUsers, selectUserByUsername } = require("../models/users.model");

function getUsers(req, res, next) {
    selectUsers()
    .then((users) => res.status(200).send({users}))
    .catch(next);
};

function getUserByUsername(req, res, next) {
    selectUserByUsername(req.params.username)
    .then((user) => {
        if (!user) {
            res.status(404).send({message: "User not found"})
        }else{
            res.status(200).send({user})
        }
    })
    .catch(next);
};

module.exports = { getUsers, getUserByUsername };