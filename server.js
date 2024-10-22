require('dotenv').config()
const express = require('express')
const admin = require('firebase-admin')
const serviceAccount = require(process.env.SERVICE_URL)

admin.initializeApp({
	credential: admin.credential.cert(serviceAccount),
	databaseURL: process.env.DB_URL,
})

const app = express()
const PORT = process.env.PORT || 3000

app.get('/users', async (req, res) => {
	const listAllUsers = async nextPageToken => {
		try {
			const listUsersResult = await admin.auth().listUsers(1000, nextPageToken)
			return listUsersResult
		} catch (error) {
			console.error('Error listing users:', error)
			throw error
		}
	}

	let users = []
	let nextPageToken

	do {
		const result = await listAllUsers(nextPageToken)
		users = users.concat(result.users)
		nextPageToken = result.pageToken
	} while (nextPageToken)

	res.json(users)
})

// Маршрут для получения данных пользователя по UID
app.get('/users/:uid', async (req, res) => {
	const { uid } = req.params

	try {
		const userRecord = await admin.auth().getUser(uid)
		res.json(userRecord)
	} catch (error) {
		res.status(404).json({ error: 'User not found' })
	}
})

app.listen(PORT, () => {
	console.log(`Сервер запущен на http://localhost:${PORT}`)
})
