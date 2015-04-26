'use strict'

var Lab   = require('lab')
var Code  = require('code')

var lab = module.exports.lab = Lab.script()

var describe  = lab.describe
var it        = lab.it
var expect    = Code.expect

var Server      = require('../').server
var NetcatError = require('../').NetcatError

describe('Server', function() {

  describe('interface', function() {
    it('miss port arg should throw', function(done) {
      var throws = function throws () {
        var s = new Server()
      }

      expect(throws).to.throw(NetcatError, 'the port is required')
      done()
    })

    it('pass the port should init the Server', function(done) {
      var s = new Server(3000)
      expect(s).to.be.an.instanceof(Server)
      done()
    })

    it('not using the "new" to init the Server', function(done) {
      var s = Server(3000)
      expect(s).to.be.an.instanceof(Server)
      done()
    })

     it('passing port and host', function(done) {
      var s = Server(3000, 'localhost')
      expect(s).to.be.an.instanceof(Server)
      done()
    })

     it('passing port and an object for the options', function(done) {
      var s = new Server(3000, {timeout: 60000, readEncoding: 'asccii'})
      expect(s).to.be.an.instanceof(Server)
      done()
    })
  })

  describe('test server initiation', function() {
    var server

    it('init', function(done) {
      server = Server(3000)
      server.on('ready', done)
      server.listen()
    })

    it('client on', function(done) {

      server.on('client_on', done)
    })


  })

})