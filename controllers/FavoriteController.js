const FavoriteService = require('../services/FavoriteService').FavoriteService
const responseOfServer = require('../utils/response').responseOfServer

module.exports.FavoriteController = class FavoriteController{

    static addOneFavorite(req, res){
        FavoriteService.addOneFavorite(req.user._id, req.params.id, null, function(err, value){
           responseOfServer(err, value, req, res, true)
        })
    }

    static findManyFavorites(req, res){
        const q ={
            search : req.query.search,
            categorie: req.query.categorie
        }
        FavoriteService.findManyFavorites(req.query.page, req.query.limit, req.query.ids, q, req.user._id, req.query.option, function(err, value){
            responseOfServer(err, value, req, res, false)
        })
    }

    static updateOneFavorite(req, res){
        FavoriteService.updateOneFavorite(req.params.id, req.body, null, function(err, value){
            responseOfServer(err, value, req, res, false)
        })
    }

    static deleteOneFavorite(req, res){
        FavoriteService.deleteOneFavorite(req.params.id, req.user._id, null, function(err, value){
            responseOfServer(err, value, req, res, false)
        })
    }
}