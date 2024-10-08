const chai = require('chai')
const chaiHttp = require('chai-http')
const should = chai.should()
const expect = chai.expect
const server = require('./../../server')

chai.use(chaiHttp)

const users = []
let place = {}
let comment = {}
const tokens = []

describe("create good user, login, place and comment for test",()=>{
    it("create good user",(done) => {
            const goodUser ={
            firstName : "Eric",
            lastName : "Dupond",
            userType:"professional",
            username:"EricLaDébrouille",
            password:"coucou",
            email:"eric.dupond@gmail.com"
        }
        chai.request(server).post('/user').send(goodUser).end((err, res) => {
            res.should.has.status(201)
            users.push(res.body)
            done()
        })
    })
    it("login correct user",(done)=>{
        chai.request(server).post('/login').send({
            username:users[0].username,
            password:"coucou"
        }).end((err,res)=>{
            res.should.has.status(200)
            tokens.push(res.body.token)
            done()
        })
    })
    it("create another good user",(done) => {
            const goodUser ={
            firstName : "Eric",
            lastName : "Dupond",
            userType:"professional",
            username:"EricLeFake",
            password:"coucou",
            email:"eric.fake@gmail.com"
        }
        chai.request(server).post('/user').send(goodUser).end((err, res) => {
            res.should.has.status(201)
            users.push(res.body)
            done()
        })
    })
    it("login correct user",(done)=>{
        chai.request(server).post('/login').send({
            username:users[1].username,
            password:"coucou"
        }).end((err,res)=>{
            res.should.has.status(200)
            tokens.push(res.body.token)
            done()
        })
    })
    it("create a good place",(done) => {
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
        chai.request(server).post('/place').send(goodHotel).auth(tokens[0],{type: 'bearer'}).end((err, res)=>{
            res.should.has.status(201)
            place = {...res.body}
            done()
        })
    })
    it("create a good comment",(done) => {
        const goodComment = {
            comment:"superbe après-midi dans ce lieu",
            note:5,
            dateVisited: new Date()
        }
        chai.request(server).post('/comment').query({place_id : place._id}).auth(tokens[0],{type: 'bearer'}).send(goodComment).end((err, res) => {
            res.should.has.status(201)
            comment = {...res.body}
            done()
        })
    })
})

describe('POST - /like',() => {
    it("add a like to a comment - S",(done)=>{
        chai.request(server).post("/like").query({comment_id:comment._id}).auth(tokens[0],{type: 'bearer'}).end((err, res) => {
            res.should.has.status(201)
            done()
        })
    })
    it("add a like to a comment but user has already liked - E",(done)=>{
        chai.request(server).post("/like").query({comment_id:comment._id}).auth(tokens[0],{type: 'bearer'}).end((err, res) => {
            res.should.has.status(405)
            done()
        })
    })
    it("add a like to a comment but user not authentifiate - E",(done)=>{
        chai.request(server).post("/like").query({comment_id:comment._id}).end((err, res) => {
            res.should.has.status(401)
            done()
        })
    })
    it("add a like to a comment but comment id uncorrect - E",(done)=>{
        chai.request(server).post("/like").query({comment_id:"vkopqre"}).auth(tokens[0],{type: 'bearer'}).end((err, res) => {
            res.should.has.status(405)
            done()
        })
    })
    it("add a like to a comment but comment id missing - E",(done)=>{
        chai.request(server).post("/like").query({comment_id:null}).auth(tokens[0],{type: 'bearer'}).end((err, res) => {
            res.should.has.status(405)
            done()
        })
    })
    it("add a like to a comment but missing query - E",(done)=>{
        chai.request(server).post("/like").auth(tokens[0],{type: 'bearer'}).end((err, res) => {
            res.should.has.status(405)
            done()
        })
    })
})
describe('Delete - /like',() => {
    it("delete a like to a comment but user not authentifiate - E",(done)=>{
        chai.request(server).delete(`/like/${comment._id}`).end((err, res) => {
            res.should.has.status(401)
            done()
        })
    })
    it("delete a like user never like the comment - E",(done)=>{
        chai.request(server).delete(`/like/${comment._id}`).auth(tokens[1],{type: 'bearer'}).end((err, res) => {
            res.should.has.status(404)
            done()
        })
    })
    it("delete a like to a comment but comment id uncorrect - E",(done)=>{
        chai.request(server).delete("/like/feklero").auth(tokens[0],{type: 'bearer'}).end((err, res) => {
            res.should.has.status(405)
            done()
        })
    })
    it("delete a like to a comment but comment id missing - E",(done)=>{
        chai.request(server).delete("/like/").auth(tokens[0],{type: 'bearer'}).end((err, res) => {
            res.should.has.status(404)
            done()
        })
    })
    it("delete a like to a comment - S",(done)=>{
        chai.request(server).delete(`/like/${comment._id}`).auth(tokens[0],{type: 'bearer'}).end((err, res) => {
            res.should.has.status(200)
            done()
        })
    })
})

describe("deleteTheUser",() => {
    it("delete user - S",(done) => {
        chai.request(server).delete(`/user/${users[0]._id}`).auth(tokens[0],{type: 'bearer'}).end((err, res) =>{
            res.should.has.status(200)
            done()
        })
    })
    it("delete user - S",(done) => {
        chai.request(server).delete(`/user/${users[1]._id}`).auth(tokens[1],{type: 'bearer'}).end((err, res) =>{
            res.should.has.status(200)
            done()
        })
    })
})