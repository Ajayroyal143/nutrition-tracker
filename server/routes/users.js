const router = require('express').Router();
const usersController = require('../controllers/users');
const auth = require('../middleware/auth');

// Public
router.post('/register', usersController.register);
router.post('/login', usersController.login);

// Protected
router.put('/update/:id', auth, usersController.updateProfile);

module.exports = router;
