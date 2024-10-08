const express = require("express")
const bodyParser = require("body-parser")
const Logger = require('./utils/logger').logger.pino
const database = require('./middlewares/database')
const loggerHttp = require('./middlewares/loggerHttp')
const multerOneImage = require('./middlewares/multer.config').oneImage
const multerManyImage = require('./middlewares/multer.config').manyImage
const path = require('path')
const session = require('express-session')
require('dotenv').config()

const swaggerJSDoc= require('swagger-jsdoc')
const swaggerUi = require('swagger-ui-express')

//Create express.js app
const app = express()

require("./utils/database")

//configuration Swagger
const swaggerOptions = require('./swagger.json')
const swaggerDocs = swaggerJSDoc(swaggerOptions)
app.use('/api-docs', swaggerUi.serve,swaggerUi.setup(swaggerDocs))

app.use(session({
  secret : process.env.SECRET_COOKIE,
  resave: false,
  saveUninitialized : true,
  cookie : {secure: true}
}))

app.use(bodyParser.json(), loggerHttp.addLogger)

const passport = require("./utils/passport")
app.use(passport.initialize())
app.use(passport.session())

// Import des controllers
const UserControllers = require('./controllers/UserController').UserControllers
const PlaceControllers = require("./controllers/PlaceController").PlaceControllers
const ApiLocationControllers = require("./controllers/ApiLocationController").ApiLocationControllers
const ImageController = require('./controllers/ImageController').ImageController
const CommentController = require('./controllers/CommentController').CommentController
const LikeCommentController = require('./controllers/LikeCommentController').LikeCommentController
const FavoriteController = require('./controllers/FavoriteController').FavoriteController
const FolderController = require('./controllers/FolderController').FolderController

// Import des middlewares
const controleOwner = require('./middlewares/controleOwner')
const controlePlaceExist = require('./middlewares/controlePlaceExist').controlePlaceExist
const controlePlaceExistForFavorite = require('./middlewares/controlePlaceExist').controlePlaceExistForFavorite
const findAllPlaceOfOwner = require('./middlewares/findAllPlacesOfOwner').findAllPlacesOfOwner

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  next();
});

app.use('/data/images',express.static(path.join(__dirname, '/data/images')))
app.use('/data/systemImages',express.static(path.join(__dirname, '/data/systemImages')))

//routes for User

app.post('/login',database.controlsBDD, UserControllers.loginUser)
app.post ('/logout', database.controlsBDD,passport.authenticate('jwt',{session:false}), UserControllers.logoutUser)

app.post('/user', database.controlsBDD, UserControllers.addOneUser)
app.get('/user/:id', database.controlsBDD, passport.authenticate('jwt',{session:false}),UserControllers.findOneUserById)
app.put('/resPassword',database.controlsBDD,UserControllers.resetPassword)
app.put('/user/:id', database.controlsBDD,passport.authenticate('jwt',{session:false}),controleOwner.controleOwner,UserControllers.updateOneUser)
app.put('/profilePhoto/user', database.controlsBDD,passport.authenticate('jwt',{session:false}),ImageController.deleteOneImage,multerOneImage,ImageController.addOneImage,UserControllers.updateUserProfilePhoto)
app.delete('/user/:id', database.controlsBDD,passport.authenticate('jwt',{session:false}),controleOwner.controleOwner,UserControllers.deleteOneUser)

//routes for Place

app.post('/place',database.controlsBDD, passport.authenticate('jwt',{session:false}),ApiLocationControllers.getDataGeocode,PlaceControllers.addOnePlace)
app.put('/place/:id',database.controlsBDD, passport.authenticate('jwt',{session:false}), controleOwner.controleOwnerOfPlace,ApiLocationControllers.getDataGeocode,PlaceControllers.updateOneplace)
app.get('/place/:id',database.controlsBDD,PlaceControllers.FindOnePlaceById)
app.get('/places', database.controlsBDD,PlaceControllers.findManyPlaces)
app.get('/places/random',database.controlsBDD,PlaceControllers.findThreePlacesPerCategoryWithBestNotation)
app.get('/places/suggestions',database.controlsBDD,PlaceControllers.findPlacesNear)
app.delete('/place/:id', database.controlsBDD,passport.authenticate('jwt',{session:false}),controleOwner.controleOwnerOfPlace,PlaceControllers.deleteOnePlace)
app.delete('/places', database.controlsBDD,passport.authenticate('jwt',{session:false}),controleOwner.controleOwnerOfPlaces,PlaceControllers.deleteManyPlaces)

//routes for api call
    //routes for geocodes
app.get('/getlocation',database.controlsBDD,passport.authenticate('jwt',{session:false}), ApiLocationControllers.getDataGeocode)


//routes images

app.post('/image',database.controlsBDD,passport.authenticate('jwt',{session:false}),multerOneImage,ImageController.addOneImage)
app.post('/images',database.controlsBDD,passport.authenticate('jwt',{session:false}),multerManyImage,ImageController.addManyImages)
app.get('/images',database.controlsBDD,passport.authenticate('jwt',{session:false}),ImageController.findManyImagesByUserId)
app.delete('/image/:id',database.controlsBDD,passport.authenticate('jwt',{session:false}),controleOwner.controleOwnerOfImage,ImageController.deleteOneImage)

//routes postComment

app.post('/comment',database.controlsBDD,passport.authenticate('jwt',{session:false}),controlePlaceExist,CommentController.addOneComment)
app.post('/responseComment/:id',database.controlsBDD,passport.authenticate('jwt',{session:false}),controleOwner.controleOwnerOfPlaceToRespondAComment, CommentController.addOneResponseComment)
app.get('/comment/:id',database.controlsBDD, CommentController.findOneCommentById)
app.get('/comments',database.controlsBDD, CommentController.findManyComments)
app.get('/commentsByOwner',database.controlsBDD,passport.authenticate('jwt',{session:false}),findAllPlaceOfOwner,CommentController.findManyCommentsByOwnerOfPlace)
app.delete('/comment/:id',database.controlsBDD,passport.authenticate('jwt',{session:false}),controleOwner.controleOwnerOfComment,CommentController.deleteOneCommentById)

//routes likeComment

app.post('/like',database.controlsBDD,passport.authenticate('jwt',{session:false}),LikeCommentController.addOneLikeOnComment)
app.delete('/like/:id',database.controlsBDD,passport.authenticate('jwt',{session:false}),LikeCommentController.deleteOneLikeOnComment)

//route Favorite

app.post('/favorite/:id',database.controlsBDD,passport.authenticate('jwt',{session:false}),controlePlaceExistForFavorite,FavoriteController.addOneFavorite)
app.get('/favorites',database.controlsBDD,passport.authenticate('jwt',{session:false}),FavoriteController.findManyFavorites)
app.put('/favorite/:id',database.controlsBDD,passport.authenticate('jwt',{session:false}),FavoriteController.updateOneFavorite)
app.delete('/favorite/:id',database.controlsBDD,passport.authenticate('jwt',{session:false}),FavoriteController.deleteOneFavorite)

//route Folder

app.post('/folder',database.controlsBDD,passport.authenticate('jwt',{session:false}),FolderController.addOneFolder)
app.get('/folder/:id',database.controlsBDD,passport.authenticate('jwt',{session:false}),FolderController.findOneFolderById)
app.get('/folders',database.controlsBDD,passport.authenticate('jwt',{session:false}),FolderController.findManyFolders)
app.put('/folder/:id',database.controlsBDD,passport.authenticate('jwt',{session:false}),FolderController.updateFolderById)
app.delete('/folder/:id',database.controlsBDD,passport.authenticate('jwt',{session:false}),FolderController.deleteOneFolderById)

app.listen(process.env.PORT, () => {
    Logger.info(`Serveur démarré sur le port ${process.env.PORT}.`)
})

module.exports = app