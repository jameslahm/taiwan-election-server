// Load .env
const dotenv = require('dotenv');
dotenv.config();

// Load data
const data = require('./data');
const fs = require('fs');

const jwt = require('jsonwebtoken');

const authenticate = (req, res, next) => {
	try {
		jwt.verify(req.headers.authorization, app.get('secret'));
		next();
	} catch (e) {
		return res.json({ error: 'invalid token' });
	}
};

const express = require('express');
const app = express();

const multer = require('multer');
const upload = multer({ dest: './static' });

const cors = require('cors');
app.use(cors());

app.set('secret', process.env.SECRET);
const bodyParser = require('body-parser');
app.use(bodyParser.json());

app.use('/static', express.static('static'));

app.post('/login', (req, res) => {
	const username = req.body.username;
	const password = req.body.password;
	if (
		username === process.env.ADMIN_USERNAME &&
		password === process.env.ADMIN_PASSWORD
	) {
		return res.json({
			token: jwt.sign({ username: username }, app.get('secret'), {
				expiresIn: 120 * 60 * 60 * 24,
			}),
		});
	}
});

app.post('/electors', authenticate, (req, res) => {
	const name = req.body.name;
	const enName = req.body.enName;
	const experience = req.body.experience;
	const party = req.body.party;
	const policy = req.body.policy;
	const avatar=req.body.avatar
	const video=req.body.video

	console.log("POST Electors")
	data.push({
		name,
		enName,
		experience,
		party,
		policy,
		avatar,
		video
	});

	fs.writeFileSync('data.json', JSON.stringify(data), 'utf8');
	return res.json(data);
});

app.put('/electors/:id', authenticate, (req, res) => {
	const name = req.body.name;
	const enName = req.body.enName;
	const experience = req.body.experience;
	const party = req.body.party;
	const policy = req.body.policy;
	const avatar = req.body.avatar;
	const video = req.body.video;
	const id = parseInt(req.params.id);
	const i = id >= data.length ? -1 : id;
	if (i !== -1) {
		data[i] = {
			name,
			enName,
			experience,
			party,
			policy,
			avatar,
			video
		};
		fs.writeFileSync('data.json', JSON.stringify(data), 'utf8');
		return res.json(data[i]);
	} else {
		return res.json({
			error: 'not found',
		});
	}
});

app.delete('/electors/:id', authenticate, (req, res) => {
	const id = parseInt(req.params.id);
	const i = id >= data.length ? -1 : id;
	if (i !== -1) {
		const [d] = data.splice(i, 1);
		fs.writeFileSync('data.json', JSON.stringify(data), 'utf8');
		return res.json(d);
	} else {
		return res.json({
			error: 'not found',
		});
	}
});

app.get('/electors', authenticate, (req, res) => {
	return res.json(data);
});

app.get('/electors/:id', authenticate, (req, res) => {
	const id = parseInt(req.params.id);
	const i = id >= data.length ? -1 : id;
	if (i !== -1) {
		return res.json(data[i]);
	} else {
		return res.json({
			error: 'not found',
		});
	}
});

app.post('/upload', authenticate, upload.single('file'), (req, res) => {
	res.json({ url: `static/${req.file.filename}` });
});

app.listen(12345, () => {
	console.log('Listening at http://localhost:12345');
});
