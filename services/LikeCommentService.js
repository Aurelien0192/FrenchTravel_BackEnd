const mongoose = require('mongoose')
const CommentService = require('./CommentService').CommentServices
const ErrorGenerator = require('../utils/errorGenerator').errorGenerator
const _ = require('lodash')
const { errorGenerator } = require('../utils/errorGenerator')

const LikeCommentSchema = require('../schemas/LikeComment').LikeCommentSchemas

const LikeComment = mongoose.model('LikeComment',LikeCommentSchema)

module.exports.LikeCommentService = class LikeCommentService{
    static async addOneLikeOnComment(comment_id, user_id, nbOfLike, options, callback){
        if(comment_id && mongoose.isValidObjectId(comment_id) && user_id && mongoose.isValidObjectId(user_id)){
            const newLike = new LikeComment({
                comment_id: new mongoose.Types.ObjectId(comment_id),
                user_id: new mongoose.Types.ObjectId(user_id)
            })
            let errors = newLike.validateSync()
            if(errors){
                const err = ErrorGenerator.generateErrorSchemaValidator(errors)
                callback(err)
            }else{
                try{
                    CommentService.updateOneComment(comment_id,{like: nbOfLike +1},null, function(err, value){
                        if(err){
                            return callback({msg:"une erreur c'est produite lors de la mise à jour du commentaire", type_error:err.type_error})
                        }
                    })
                    await newLike.save()
                    callback(null, newLike.toObject())
                } catch(e){
                    if(e.code === 11000){
                        callback({msg:"vous avez déjà liké ce lieu", type_error:"no-valid"})
                    }else{
                        console.log(e)
                        callback({msg:"erreur lié à la base de donéee", type_error:"error-mongo"})
                    }
                }
            }
        }else{
            callback(errorGenerator.controlIntegrityofID({comment_id, user_id}))
        }
    }

    static async findOneLikeCommentById(likeComment_id, options, callback) {
        if(likeComment_id && mongoose.isValidObjectId(likeComment_id)){
            LikeComment.findById(likeComment_id).then((value) => {
                try{
                    if (value){
                        callback(null, value.toObject())
                    }else{
                        callback({msg:"Aucun like trouvée", fields_with_error: [], fields:"", type_error: "no-found"})
                    }
                }catch(e){
                    console.log(e)
                    callback({msg: "Erreur avec la base de donnée", fields_with_error: [], fields:"", type_error:"error-mongo"})
                }
            }).catch((err) => {
                callback(err)
            })
        }else{
            callback({msg: "Id non conforme", fields_with_error: [], fields:"", type_error: "no-valid"})
        }
    }

    static async deleteOneLikeComment(comment_id, user_id, nbOfLike ,options, callback){
        if(comment_id && mongoose.isValidObjectId(user_id)){
            const userId = new mongoose.Types.ObjectId(user_id)
            await LikeComment.deleteOne({comment_id:comment_id, user_id: user_id}, null, {lean:true}).then((value) => {
                try {
                    if (value.deletedCount>0){
                        try{
                            CommentService.updateOneComment(comment_id,{like: nbOfLike -1},null, function(err, value){
                                if(err){
                                    return callback({msg:"une erreur c'est produite lors de la mise à jour du commentaire", type_error:err.type_error})
                                }
                            })
                            callback(null, value)
                        }catch(e){
                           callback({msg:"erreur lié à la base de donéee", type_error:"error-mongo"}) 
                        }
                    }else{
                        callback({ msg: "Like non trouvé.", fields_with_error: [], fields:"", type_error: "no-found" });
                    }
                }
                catch (e) {  
                    callback(e)
                }
            }).catch((e) => {
                callback({ msg: "Impossible de chercher l'élément.", fields_with_error: [], fields:"", type_error: "error-mongo" });
            })
        }else{
            if(!user_id){
                callback({msg: "user ID is missing", type_error:"no-valid"})
            }else{
                callback({msg: "user ID is uncorrect", type_error:"no-valid"})
            }
        }
    }

    static async deleteManyLikesComments(comments_id, callback){
        if (comments_id && Array.isArray(comments_id) && comments_id.length>0  && comments_id.filter((e) => { return mongoose.isValidObjectId(e) }).length == comments_id.length){
            comments_id = comments_id.map((comment) => {return new mongoose.Types.ObjectId(comment)})
            LikeComment.deleteMany({ comment_id: comments_id}).then((value) => {
                if (value && value.deletedCount !== 0){
                    callback(null, value)
                }else{
                    callback({msg: "Aucun likes trouvés", type_error: "no-found"})
                }
            }).catch((err) => {
                callback({msg:"Erreur avec la base de donnée", type_error: "error-mongo"})
            })
        }
        else if (comments_id && Array.isArray(comments_id) && comments_id.length > 0 && comments_id.filter((e) => { return mongoose.isValidObjectId(e) }).length != comments_id.length) {
            callback({ msg: "Tableau non conforme plusieurs éléments ne sont pas des ObjectId.", type_error: 'no-valid', fields: comments_id.filter((e) => { return !mongoose.isValidObjectId(e) }) });
        }
        else if (comments_id && !Array.isArray(comments_id)) {
            callback({ msg: "L'argement n'est pas un tableau.", type_error: 'no-valid' });

        }
        else {
            
            callback({ msg: "Tableau non conforme.", type_error: 'no-valid' });
        }
    }

}