const express = require('express');
const signInController = require('../controllers/signInController')
const signUpController = require('../controllers/signUpController')
const homePageController = require('../controllers/homePageController')
const forgotPassword = require('../controllers/forgotPassword')
const mainPageController = require('../controllers/mainPageController')
const authController = require('../controllers/authControllers')
const middle = require('../middleware/auth_subs')


const router = express.Router();

router.get('/', homePageController)
router.get('/mainPage', middle, mainPageController)


router.get('/signIn', signInController)
router.get('/signUp', signUpController)
router.get('/forgotPassword', forgotPassword)
router.get('/logOut', authController.logOut)
router.get('/getUser', middle, authController.getUser)
router.get('/getBalance', middle, authController.getBalance)
router.get('/getPackages', authController.getPackages)
router.get('/getPackage', middle, authController.getPackage)
router.post('/api/signUp', authController.signUp)
router.post('/api/signIn', authController.signIn)
router.post('/api/updateUsage', middle, authController.updateUsage)
router.post('/api/forgotPassword', authController.forgotPassword)



module.exports = router