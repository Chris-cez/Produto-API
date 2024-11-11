require('dotenv').config();
const cors = require('cors');
const express = require('express');
const bodyParser = require('body-parser');
const { Pool } = require('pg');

const app = express();
const port = 3000;

const corsOptions = {
  origin: '*', // Permitir todas as origens. Para maior segurança, especifique as origens permitidas.
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  preflightContinue: false,
  optionsSuccessStatus: 204
};

app.use(cors(corsOptions));

app.use(bodyParser.json());

console.log(process.env);


const pool = new Pool({
  // user: process.env.PGUSER,
  // host: process.env.PGHOST,
  // database: process.env.PGDATABASE,
  // password: process.env.PGPASSWORD,
  // port: process.env.PGPORT,
  connectionString: process.env.DATABASE_URL
});


pool.connect((err, client, release) => {
  if (err) {
    console.error('Erro ao conectar ao banco de dados:', err.stack);
  } else {
    console.log('Conexão bem-sucedida com o banco de dados');
    release();
  }
});

// Rota para obter todos os produtos
app.get('/produtos', async (req, res) => {
  try {
    console.log(200);
    const result = await pool.query('SELECT * FROM produto');
    res.json(result.rows);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
});

// Rota para obter um produto por ID
app.get('/produtos/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('SELECT * FROM produto WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Produto não encontrado' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Rota para criar um novo produto
app.post('/produtos', async (req, res) => {
  const { descricao, preco, estoque } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO produto (descricao, preco, estoque) VALUES ($1, $2, $3) RETURNING *',
      [descricao, preco, estoque]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Rota para atualizar um produto por ID
app.put('/produtos/:id', async (req, res) => {
  const { id } = req.params;
  const { descricao, preco, estoque } = req.body;
  try {
    const result = await pool.query(
      'UPDATE produto SET descricao = $1, preco = $2, estoque = $3 WHERE id = $4 RETURNING *',
      [descricao, preco, estoque, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Produto não encontrado' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Rota para deletar um produto por ID
app.delete('/produtos/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM produto WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Produto não encontrado' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});
