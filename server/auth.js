const config = require('../config.json')
const request = require('request')

module.exports = function() {
	function getClientDetails() {
		return new Buffer(config.client_id + ':' + config.secret).toString('base64')
	}

	function getBearerToken(callback) {
		const basicToken = getClientDetails();

		return request({
			url: config.auth_url,
			method: 'POST',
			json: {
				grant_type: 'password',
				username: config.username,
				password: config.password
			},
			headers: {
				Authorization: `Basic ${basicToken}`
			},
			callback
		})
	}

	return { getBearerToken }
}