require('dotenv').config();
import express from 'express';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import connectDB from './config/connectDB';
import initAPIRoutes from './route/api';
let app = express();

// app.use(cors({ origin: true }));
app.use(
  cors({
    origin: process.env.URL_REACT, //Chỉ định rõ origin của frontend
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true, // Cho phép credentials
  })
);

//config bodyParser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//config cookiesParser
app.use(cookieParser());

initAPIRoutes(app);
connectDB();

app.use((req, res) => {
  return res.send('404 Not Found!');
});

let port = process.env.PORT;
app.listen(port, () => {
  console.log('Server running on port: ' + port);
});
