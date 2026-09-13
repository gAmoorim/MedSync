const express = require('express')
const cors = require('cors')
const routers = require('./routers/routers')

const app = express()
const origensPermitidas = (process.env.CORS_ORIGINS || 'http://localhost:5173')
    .split(',')
    .map((origem) => origem.trim())
    .filter(Boolean)

app.use(express.json())
app.use(cors({
    origin: (origem, callback) => {
        if (!origem || origensPermitidas.includes(origem)) return callback(null, true)
        return callback(new Error('Origem não permitida pelo CORS'))
    }
}))
app.use(routers)

module.exports = app
