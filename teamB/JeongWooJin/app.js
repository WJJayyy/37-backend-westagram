require('dotenv').config();

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const { DataSource } = require('typeorm');

const app = express();
const PORT = process.env.PORT

const appDataSource = new DataSource({
  type: process.env.TYPEORM_CONNECTION,
  host: process.env.TYPEORM_HOST,
  port: process.env.TYPEORM_PORT,
  username: process.env.TYPEORM_USERNAME,
  password: process.env.TYPEORM_PASSWORD,
  database: process.env.TYPEORM_DATABASE
})

appDataSource.initialize()
  .then(() => {
      console.log("Data Source has been initialized!")
  })
  .catch((err) => {
      console.error("Error during Data Source initialization", err)
  appDataSource.destroy()
  })

  app.use(cors());
  app.use(morgan('dev'));
  app.use(express.json());

  //health check
  app.get("/ping", (req,res) => {
    res.status(200).json({"message" : "pong"});
  })

  app.post("/users", async (req, res, next) => {
    const { name, email, profile_image, password } = req.body;

  await appDataSource.query(
    `INSERT INTO users(
      name,
      email,
      profile_image,
      password
    ) VALUES (?, ?, ?, ?);
    `,
    [ name, email, profile_image, password ]
  );

      res.status(201).json({ "message" : "userCreated"});
  })

  app.post("/posts", async (req, res, next) => {
    const { title, content, user_id } = req.body;

  await appDataSource.query(
    `INSERT INTO posts(
      title,
      content,
      user_id
    ) VALUES (?, ?, ?);
    `,
    [ title, content, user_id ]
  );

      res.status(201).json({ "message" : "postCreated"});
  })

app.get('/lookup', async(req, res) => {
  await appDataSource.manager.query(
    `SELECT
        posts.id, posts.title, posts.user_id, posts.content, users.id, users.profile_image
        FROM posts, users
        WHERE posts.user_id = users.id;`
    ,(err, rows) => {
            res.status(200).json({"data":rows});
    })
});



  const start = async () => {
    try {
      app.listen(PORT, () => console.log(`Server is listening on ${PORT}`));
    } catch (err) {
      console.error(err);
    }
  };
  
  start();



