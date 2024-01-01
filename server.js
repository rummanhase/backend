var express = require("express");
var app = express();
const bcrypt = require("bcrypt");
var jwt = require("jsonwebtoken");
var cors = require("cors");
var multer = require("multer"),
  bodyParser = require("body-parser"),
  path = require("path");
const mongoose = require("mongoose");
const connectionString =
  "mongodb+srv://rummanhase:dh8VhWmz5UzXzPBo@cluster0.reh4nzx.mongodb.net/productDB";

mongoose.connect(connectionString, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;

db.on("error", console.error.bind(console, "MongoDB connection error:"));
db.once("open", () => {
  console.log("Connected to MongoDB Atlas");
});
var fs = require("fs");
var product = require("./model/product.js");
var user = require("./model/user.js");

app.use(cors());
app.use(express.static("uploads"));
app.use(bodyParser.json()); // to support JSON-encoded bodies
app.use(
  bodyParser.urlencoded({
    // to support URL-encoded bodies
    extended: false,
  })
);

app.use("/", (req, res, next) => {
  try {
    if (req.path == "/login" || req.path == "/register" || req.path == "/") {
      next();
    } else {
      /* decode jwt token if authorized*/
      jwt.verify(req.headers.token, "shhhhh11111", function (err, decoded) {
        if (decoded && decoded.user) {
          req.user = decoded;
          next();
        } else {
          return res.status(401).json({
            errorMessage: "User unauthorized!",
            status: false,
          });
        }
      });
    }
  } catch (e) {
    res.status(400).json({
      errorMessage: "Something went wrong!",
      status: false,
    });
  }
});

app.get("/", (req, res) => {
  res.status(200).json({
    status: true,
    title: "Apis",
  });
});

app.post("/login", (req, res) => {
  try {
    if (req.body && req.body.username && req.body.password) {
      user.find({ username: req.body.username }, (err, data) => {
        if (data.length > 0) {
          // Correct order: plaintext password first, then hashed password
          if (bcrypt.compareSync(req.body.password, data[0].password)) {
            checkUserAndGenerateToken(data[0], req, res);
          } else {
            res.status(400).json({
              errorMessage: "Username or password is incorrect!",
              status: false,
            });
          }
        } else {
          res.status(400).json({
            errorMessage: "Username or password is incorrect!",
            status: false,
          });
        }
      });
    } else {
      res.status(400).json({
        errorMessage: "Add proper parameters first!",
        status: false,
      });
    }
  } catch (e) {
    res.status(500).json({
      errorMessage: "Internal Server Error",
      status: false,
    });
  }
});

/* register api */
app.post("/register", async (req, res) => {
  try {
    if (req.body && req.body.username && req.body.password) {
      const hashedPassword = await bcrypt.hash(req.body.password, 10);
      user.find({ username: req.body.username }, (err, data) => {
        if (data.length == 0) {
          let User = new user({
            username: req.body.username,
            password: hashedPassword,
            details:[],
            cart: [],
            order_Succes: [],
            order_history: [],
          });
          User.save((err, data) => {
            if (err) {
              res.status(400).json({
                errorMessage: err,
                status: false,
              });
            } else {
              res.status(200).json({
                status: true,
                title: "Registered Successfully.",
              });
            }
          });
        } else {
          res.status(400).json({
            errorMessage: `UserName ${req.body.username} Already Exist!`,
            status: false,
          });
        }
      });
    } else {
      res.status(400).json({
        errorMessage: "Add proper parameter first!",
        status: false,
      });
    }
  } catch (e) {
    res.status(400).json({
      errorMessage: "Something went wrong!",
      status: false,
    });
  }
});


app.post("/updateUser/:username", async (req, res) => {
  try {
    const usernameToUpdate = req.params.username;

    // Find the user by username1q  1  
    const existingUser = await user.findOne({ username: usernameToUpdate });

    if (!existingUser) {
      return res.status(404).json({
        errorMessage: `User with username ${usernameToUpdate} not found.`,
        status: false,
      });
    }

    // Update only the specified fields in the request body
    if (req.body && Object.keys(req.body).length > 0) {
      for (const key in req.body) {
        if (existingUser[key] !== undefined) {
          existingUser[key] = req.body[key];
        }
      }

      // Save the updated user
      await existingUser.save();

      res.status(200).json({
        status: true,
        message: "User updated successfully.",
      });
    } else {
      res.status(400).json({
        errorMessage: "No valid fields provided for update.",
        status: false,
      });
    }
  } catch (e) {
    console.error(e);
    res.status(500).json({
      errorMessage: "Internal Server Error",
      status: false,
    });
  }
});

function checkUserAndGenerateToken(data, req, res) {
  jwt.sign(
    { user: data.username, id: data._id },
    "shhhhh11111",
    { expiresIn: "1d" },
    (err, token) => {
      if (err) {
        res.status(400).json({
          status: false,
          errorMessage: err,
        });
      } else {
        res.json({
          message: "Login Successfully.",
          token: token,
          status: true,
          username: data.username,
          user_id: data._id,
        });
      }
    }
  );
}

app.listen(2000, () => {
  console.log("Server is Runing On port 2000");
});
