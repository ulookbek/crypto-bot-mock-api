const jsonServer = require("json-server");
const server = jsonServer.create();
const router = jsonServer.router("db.json");
const middlewares = jsonServer.defaults();
const jwt = require("jsonwebtoken");

const userdb = require("./db.json");

const SECRET_KEY = "123456789";
const expiresIn = "1h";

// Создание токена
function createToken(payload) {
	return jwt.sign(payload, SECRET_KEY, { expiresIn });
}

// Проверка, есть ли email и password
function isAuthenticated({ email, password }) {
	return (
		userdb.users.findIndex(
			(user) => user.email === email && user.password === password
		) !== -1
	);
}

server.use(jsonServer.bodyParser);
server.use(middlewares);

// Регистрация нового пользователя
server.post("/auth/signup", (req, res) => {
	const { email, password } = req.body;
	if (!email || !password) {
		res.status(400).json({ error: "Email and password are required" });
		return;
	}

	const userExists = userdb.users.some((user) => user.email === email);
	if (userExists) {
		res.status(409).json({ error: "Email already exists" });
		return;
	}

	const newUser = { id: userdb.users.length + 1, email, password };
	userdb.users.push(newUser);
	const accessToken = createToken({ email, password });
	res.status(201).json({ accessToken });
});

// Вход пользователя
server.post("/auth/signin", (req, res) => {
	const { email, password } = req.body;
	if (isAuthenticated({ email, password })) {
		const accessToken = createToken({ email, password });
		res.status(200).json({ accessToken });
	} else {
		res.status(401).json({ error: "Email or password incorrect" });
	}
});

// Перенаправление других запросов к json-server
server.use(router);

// Запуск сервера
server.listen(3000, () => {
	console.log("Server is running on port 3000");
});
