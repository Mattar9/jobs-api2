require('dotenv').config();
require('express-async-errors');
const express = require('express');
const notFoundMiddleware = require('./middleware/not-found');
const errorHandlerMiddleware = require('./middleware/error-handler');
const jobsRoute = require('./routes/jobs');
const authRoute = require('./routes/auth');
const protectedRoute = require('./middleware/authentication');
const helmet = require('helmet');
const xss = require('xss-clean')
const path = require('path')

require('./db/connect');

const app = express();

app.set('trust proxy', 1);

app.use(express.static(path.resolve(__dirname, './client/build')))

app.use(express.json());
// extra packages

// routes
app.use('/api/v1/auth', authRoute);
app.use('/api/v1/jobs', protectedRoute, jobsRoute);

app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, './client/build/index.html'));
})

// error handler
app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);


app.use(helmet())
app.use(xss())

const port = process.env.PORT || 5000;

app.listen(port, () =>
    console.log(`Server is listening on port ${port}...`)
);