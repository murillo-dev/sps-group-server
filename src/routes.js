const { Router } = require("express");
jwt = require("jsonwebtoken");

const routes = Router();

let users = [
  {
    name: "admin",
    email: "admin@spsgroup.com.br",
    type: "admin",
    password: "1234"
  }
];

const JWT_SECRET = process.env.JWT_SECRET;

const authenticate = (req, res, next) => {
  const token = req.headers["authorization"];
  if (!token) {
    return res.status(401).send("Token no proporcionado");
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).send("Token inválido");
    }
    req.userId = decoded.id;
    next();
  });
};

routes.post("/login", (req, res) => {
  console.log("Request body:", req.body);
  const { email, password } = req.body;
  const user = users.find((user) => user.email === email && user.password === password);
  if (!user) {
    return res.status(401).send("Credenciais inválidas");
  }
  const token = jwt.sign({ id: user.email }, JWT_SECRET, { expiresIn: "1h" });
  res.json({ token });
});


routes.get("/", (req, res) => {
  res.send("Hello World!");
});

module.exports = routes;
