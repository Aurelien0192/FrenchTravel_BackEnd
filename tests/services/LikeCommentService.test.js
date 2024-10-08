const chai = require('chai') 
const CommentService = require("../../services/CommentService").CommentServices
const UserService = require('../../services/UserService').UserService
const PlaceService = require('../../services/PlaceService').PlaceService
const LikeCommentService = require('../../services/LikeCommentService').LikeCommentService
let expect = chai.expect

let comment = {}
let place={}
let user = {}

describe('create user, place and comment for test',() => {
    const goodUser ={
        firstName : "Eric",
        lastName : "Dupond",
        userType:"professional",
        username:"EricLaDébrouille",
        password:"coucou",
        email:"eric.dupond@gmail.com"
    }
    it("user creation",(done)=>{
        UserService.addOneUser(goodUser, null, function(err, value){
            user = {...value}
            done()
        })
    })
    it("create a new place - S",(done)=>{
        const goodHotel = {
            name: "Château du Doubs",
            describe : "Super chateau dans le centre du Doubs",
            categorie : "hotel",
            moreInfo:{
                services:"ascensceur"
            },
            street: "2 rue du Moulin Parnet",
            city: "Pontarlier",
            codePostal : "25300",
            country: "France",
            county: "Doubs",
            latCoordinate: 46.907258,
            lonCoordinate:6.3537263
        }
        PlaceService.addOnePlace(goodHotel,user._id, null, function (err, value) {
            expect(value).to.be.a('object')
            expect(value).to.haveOwnProperty('name')
            expect(value['name']).to.be.equal("Château du Doubs")
            place = {...value}
            done()
        })
    })
    it('create a good comment for test',(done) => {
        const goodComment = {
            comment:"superbe après-midi dans ce lieu",
            note:5,
            dateVisited: new Date()
        }
        CommentService.addOneComment(user._id,place._id,goodComment, null, function(err, value){
            expect(value).to.be.a('object')
            expect(value).to.haveOwnProperty("note")
            expect(value["note"]).to.be.equal(5)
            expect(err).to.be.null
            comment = {...value}
            done()
        })
    })
})

describe("addOneLike",() => {
    it(("check user doesn't like this place -S"),(done) => {
        CommentService.findManyComments(null, null,{_id: comment._id}, null,user._id, function(err, value){
            expect(value).to.be.a('object')
            expect(value).to.haveOwnProperty("results")
            expect(value['results']).to.be.an('array')
            expect(value['results'][0]).to.haveOwnProperty('liked')
            expect(value['results'][0]['liked']).to.be.equal(false)
            done()
        })
    })
    it(("add a like with correct user_id and place_id - S"),(done)=>{
        LikeCommentService.addOneLikeOnComment(comment._id,user._id, 0, null, function(err, value){
            expect(value).to.be.a('object')
            expect(value).to.haveOwnProperty('user_id')
            expect(String(value['user_id'])).to.be.equal(String(user._id))
            expect(value).to.haveOwnProperty('comment_id')
            expect(String(value['comment_id'])).to.be.equal(String(comment._id))
            done()
        })
    })
    it(("check number of like update un comment - S"),(done)=>{
        CommentService.findManyComments(null, null, {_id: comment._id}, null, null, function(err, value){
            expect(value).to.be.a('object')
            expect(value).to.haveOwnProperty("results")
            expect(value['results']).to.be.an('array')
            expect(value['results'][0]).to.haveOwnProperty('like')
            expect(value['results'][0]['like']).to.be.equal(1)
            done()
        })
    })
    it(("add a like with uncorrect user_id and correct place_id - E"),(done)=>{
        LikeCommentService.addOneLikeOnComment(comment._id,"djqgoijoibdvs", 0, null, function(err, value){
            expect(err).to.be.a('object')
            expect(err).to.haveOwnProperty('type_error')
            expect(err['type_error']).to.be.equal('no-valid')
            done()
        })
    })
    it(("add a like with missing user_id and correct place_id - E"),(done)=>{
        LikeCommentService.addOneLikeOnComment(comment._id, null, 0, user._id, function(err, value){
            expect(err).to.be.a('object')
            expect(err).to.haveOwnProperty('type_error')
            expect(err['type_error']).to.be.equal('no-valid')
            done()
        })
    })
    it(("add a like with correct user_id and uncorrect place_id - E"),(done)=>{
        LikeCommentService.addOneLikeOnComment("dfvjovejoer",user._id, 0, null, function(err, value){
            expect(err).to.be.a('object')
            expect(err).to.haveOwnProperty('type_error')
            expect(err['type_error']).to.be.equal('no-valid')
            done()
        })
    })
    it(("add a like with correct user_id and missing place_id - E"),(done)=>{
        LikeCommentService.addOneLikeOnComment(null,user._id, 0, null, function(err, value){
            expect(err).to.be.a('object')
            expect(err).to.haveOwnProperty('type_error')
            expect(err['type_error']).to.be.equal('no-valid')
            done()
        })
    })
    it(("add a like with missing user_id and missing place_id - E"),(done)=>{
        LikeCommentService.addOneLikeOnComment(null,null, 0, null, function(err, value){
            expect(err).to.be.a('object')
            expect(err).to.haveOwnProperty('type_error')
            expect(err['type_error']).to.be.equal('no-valid')
            done()
        })
    })
    it(("check user have like this place -S"),(done) => {
        CommentService.findManyComments(null, null,{_id: comment._id}, null,user._id, function(err, value){
            expect(value).to.be.a('object')
            expect(value).to.haveOwnProperty("results")
            expect(value['results']).to.be.an('array')
            expect(value['results'][0]).to.haveOwnProperty('liked')
            expect(value['results'][0]['liked']).to.be.equal(true)
            done()
        })
    })
    it(("add a like with correct user_id and place_id but already like - S"),(done)=>{
        LikeCommentService.addOneLikeOnComment(comment._id,user._id, 0, null, function(err, value){
            expect(err).to.be.a('object')
            expect(err).to.haveOwnProperty('type_error')
            expect(err['type_error']).to.be.equal("no-valid")
            done()
        })
    })
})

describe("deleteOneLikeComment",() => {
    it("delete LikeComment with uncorrect user_id - E",(done) =>{
        LikeCommentService.deleteOneLikeComment(comment._id,"dsfoqhjos",1, null, function(err, value){
            expect(err).to.be.a("object")
            expect(err).to.haveOwnProperty("type_error")
            expect(err['type_error']).to.be.equal("no-valid")
            done()
        })
    })
    it("delete LikeComment with missing user_id - E",(done) =>{
        LikeCommentService.deleteOneLikeComment(comment._id, null,1 ,null, function(err, value){
            expect(err).to.be.a("object")
            expect(err).to.haveOwnProperty("type_error")
            expect(err['type_error']).to.be.equal("no-valid")
            done()
        })
    })
    it("delete LikeComment with correc user_id but not exist in database - E",(done) =>{
        LikeCommentService.deleteOneLikeComment(comment._id, place._id,1,null, function(err, value){
            expect(err).to.be.a("object")
            expect(err).to.haveOwnProperty("type_error")
            expect(err['type_error']).to.be.equal("no-found")
            done()
        })
    })
    it("delete LikeComment with correct user_id - S",(done) => {
        LikeCommentService.deleteOneLikeComment(comment._id, user._id,1,null, function(err, value){
            expect(value).to.be.a('object')
            expect(value).to.haveOwnProperty('deletedCount')
            expect(value["deletedCount"]).to.be.equal(1)
            done()
        })
    })
    it(("check number of like update un comment - S"),(done)=>{
        CommentService.findManyComments(null, null, {_id: comment._id}, null, null, function(err, value){
            expect(value).to.be.a('object')
            expect(value).to.haveOwnProperty("results")
            expect(value['results']).to.be.an('array')
            expect(value['results'][0]).to.haveOwnProperty('like')
            expect(value['results'][0]['like']).to.be.equal(0)
            done()
        })
    })
})

describe("delete user",() => {
    it("delete",(done)=>{
        UserService.deleteOneUser(user._id, null, function(err, value){
            expect(value).to.be.a('object')
            expect(value).to.haveOwnProperty('_id')
            expect(String(value['_id'])).to.be.equal(String(user._id))
            expect(err).to.be.null
            done()
        })
    })
})