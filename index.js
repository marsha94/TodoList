import express from "express";
import pg from "pg";
import dotenv from "dotenv";

dotenv.config();
const app = express();
const port = parseInt(process.env.PORT) || 3000;
const { Pool } = pg;

const db = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PW,
  database: process.env.DB_NAME,
  port: parseInt(process.env.DB_PORT),
  ssl: {
    rejectUnauthorized: false,
  },
});

let items = [];

async function getItems() {
  const result = await db.query("SELECT * FROM items ORDER BY id ASC");
  return result.rows;
}

app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

app.get("/", async (req, res) => {
  items = await getItems();
  res.render("index.ejs", {
    listTitle: "Today",
    listItems: items,
  });
});

app.post("/add", async (req, res) => {
  const item = req.body.newItem;
  await db.query("INSERT INTO items (title) VALUES ($1)", [req.body.newItem]);
  res.redirect("/");
});

app.post("/edit", async (req, res) => {
  const item = req.body.updatedItemTitle;
  const id = req.body.updatedItemId;
  await db.query("UPDATE items SET title = $1 WHERE id = $2", [item, id]);
  res.redirect("/");
});

app.post("/delete", async (req, res) => {
  const id = req.body.deleteItemId;
  await db.query("DELETE FROM items WHERE id = $1", [id]);
  res.redirect("/");
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
