import express from 'express'
import 'dotenv/config.js'
import cors from 'cors'
import routes from './src/routes/index.js';

const PORT = process.env.PORT;
const app = express();

app.use(cors())
app.use(express.json())
app.use(routes)

app.listen(PORT,()=>
    console.log(`App is Listening at Port ${PORT}`)
)