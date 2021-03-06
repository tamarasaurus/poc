const express = require('express')
const session = require('express-session')
const proxy = require('express-http-proxy');
const serveStatic = require('serve-static')

const Auth = require('./auth')
const api_url = '/api/rest/v1/'
const auth = new Auth()
const config = require('../config.json')
const app = express()

app.use(session({
  name: 'token',
  resave: false,
  secure: false,
  saveUninitialized: true,
  secret: 'akeneo',
  cookie: { maxAge: 3600, secure: false, httpOnly: true }
}))

app.use(function setToken (req, res, next) {
  if (req.session.token === undefined) {
   	auth.getBearerToken((err, data) => {
  		req.session.token = data.body.access_token
  		next()
  	})
  } else {
  	next()
  }
})

app.use('/', serveStatic('frontend/build', {'index': ['index.html']}))

app.use('/pim', proxy(config.base_url, {
	filter: function(req, res) {
	    return req.originalUrl.indexOf('/pim') > -1
	 },
	proxyReqOptDecorator: function(proxyReq, srcReq) {
	  const token = srcReq.session.token;
	  proxyReq.headers['Authorization'] = `Bearer ${token}`;
	  return proxyReq;
	}
}));

app.listen(3000)
