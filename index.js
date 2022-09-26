//Imports
const express = require("express");
const app = express();
const mysql = require("mysql");
const cors = require("cors");
const bcrypt = require("bcrypt");
const saltRounds = 10;

// Conexão com o Banco no Heroku
const db = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "",
  database: "tcc",
});

app.use(express.json());
app.use(cors());

// Cadastro de usuarios com Senha Criptografado
app.post("/register", (req, res) => {
  const user = req.body.user;
  const password = req.body.password;

  db.query("SELECT * FROM users WHERE user = ?", [user], (err, result) => {
    if (err) {
      res.send(err);
    }
    if (result.length == 0) {
      bcrypt.hash(password, saltRounds, (erro, hash) => {
        db.query(
          "INSERT INTO users (user, password) VALUES (?,?)",
          [user, hash],
          (err, result) => {
            if (err) {
              res.send(err);
            }
            res.send({ msg: "Cadastro Realizado!" });
          }
        );
      });
    } else {
      res.send({ msg: "Usuario Ja cadastrado" });
    }
  });
});

// Login com Criptografia
app.post("/login", (req, res) => {
  const user = req.body.user;
  const password = req.body.password;

  db.query("SELECT * FROM users WHERE user = ?", [user], (err, result) => {
    if (err) {
      res.send(err);
    }
    if (result.length > 0) {
      bcrypt.compare(password, result[0].password, (erro, result) => {
        if (result) {
          res.send({
            msg: "Usuario Logado com Sucesso!",
            token: 1,
            user: user,
          });
        } else {
          res.send({
            msg: "Senha Incorreta!",
            token: 0,
          });
        }
      });
    } else {
      res.send({ msg: "Usuario Não Encontrado!" });
    }
  });
});

// Cadastro de Projetos
app.post("/cadproject", (req, res) => {
  const name = req.body.name;
  const budget = req.body.budget;
  const usuario = req.body.user;
  db.query(
    "INSERT INTO projects (name, budget, user) VALUES (?,?,?)",
    [name, budget, usuario],
    (err, result) => {
      if (err) {
        res.send(err);
      }
      res.send({ msg: "Projeto Criado!" });
    }
  );
});

// Pegando os Projetos no banco
app.get("/getprojects", (req, res) => {
  db.query("SELECT * FROM projects", (err, result) => {
    if (err) {
      console.log(err);
    } else {
      res.send(result);
    }
  });
});

// Pegando users
app.get("/getusers", (req, res) => {
  db.query("SELECT * FROM teste", (err, result) => {
    if (err) {
      console.log(err);
    } else {
      res.send(result);
    }
  });
});

// Editando Valores no Banco
app.put("/editproject", (req, res) => {
  const idproject = req.body.id;
  const name = req.body.name;
  const budget = req.body.budget;
  db.query(
    "UPDATE projects SET name = ?, budget = ? WHERE idproject = ?",
    [name, budget, idproject],
    (err, result) => {
      if (err) {
        console.log(err);
      } else {
        res.send(result);
      }
    }
  );
});

// Apagando Valores no Banco
app.delete("/deleteproject/:id", (req, res) => {
  const { id } = req.params;

  db.query("DELETE FROM projects WHERE idproject = ?", [id], (err, result) => {
    if (err) {
      console.log(err);
    } else {
      res.send(result);
    }
  });
});

// Iniciando Server
app.listen(3001, () => {
  console.log("Server Active");
});
