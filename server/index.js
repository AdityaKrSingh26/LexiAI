const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const app = require('./src/app');

dotenv.config();

const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => {
    console.log('Database connected successfully');
})
.catch(err => {
    console.error('Database connection error:', err);
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});