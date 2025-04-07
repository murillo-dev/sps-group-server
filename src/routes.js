const { Router } = require("express");
jwt = require("jsonwebtoken");

const routes = Router();

let users = [
  {
    id: 1,
    name: "admin",
    email: "admin@spsgroup.com.br",
    type: "admin",
    password: "1234"
  }
];

const JWT_SECRET = process.env.JWT_SECRET;

const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(401).send({ message: "Token no proporcionado" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).send({ message: "Token inválido" });
  }
};

routes.post("/login", (req, res) => {
  const { email, password } = req.body;
  const user = users.find((user) => user.email === email && user.password === password);
  if (!user) {
    return res.status(401).send({ message: "Credenciais inválidas" });
  }
  const token = jwt.sign({ id: user.id, type: user.type }, JWT_SECRET, { expiresIn: "1h" });
  res.json({ token });
});

routes.get("/users", authenticate, (req, res) => {
  console.log(req.user);
  if (req.user.type !== "admin") {
    return res.status(403).send({ message: "Acesso negado" });
  }
  res.json(users);
});

routes.post("/users", authenticate, (req, res) => {
  if (req.user.type !== "admin") {
    return res.status(403).send({ message: "Acesso negado" });
  }
  const { name, email, type = "customer", password } = req.body;
  const user = users.find((user) => user.email === email);
  if (user) {
    return res.status(400).send({ message: "El usuario ya existe" });
  }
  const newUser = { id: users.length + 1, name, email, type, password };
  users.push(newUser);
  res.status(201).json(newUser);
});

routes.put("/users/:id", authenticate, (req, res) => {
  if (req.user.type !== "admin") {
    return res.status(403).send({ message: "Acesso negado" });
  }
  const { id } = req.params;
  const { name, email, type, password } = req.body;

  const userIndex = users.findIndex(u => u.id === parseInt(id));
  if (userIndex === -1) {
    return res.status(404).json({ message: 'Usuario no encontrado' });
  }

  users[userIndex] = {
    id: users[userIndex].id,
    name: name ?? users[userIndex].name,
    email: email ?? users[userIndex].email,
    type: type ?? users[userIndex].type,
    password: password ?? users[userIndex].password
  };

  res.json(users[userIndex]);
});

routes.delete("/users/:id", authenticate, (req, res) => {
  if (req.user.type !== "admin") {
    return res.status(403).send({ message: "Acesso negado" });
  }
  const { id } = req.params;
  const userIndex = users.findIndex(u => u.id === parseInt(id));
  if (userIndex === -1) {
    return res.status(404).json({ message: 'Usuario no encontrado' });
  }
  users.splice(userIndex, 1);
  res.status(204).send();
});

routes.get("/users/:id", authenticate, (req, res) => {
  if (req.user.type !== "admin") {
    return res.status(403).send({ message: "Acesso negado" });
  }
  const { id } = req.params;
  const user = users.find(u => u.id === parseInt(id));
  if (!user) {
    return res.status(404).json({ message: 'Usuario no encontrado' });
  }
  res.json(user);
});

routes.get("/", (req, res) => {
  res.send("Hello World!");
});

module.exports = routes;
