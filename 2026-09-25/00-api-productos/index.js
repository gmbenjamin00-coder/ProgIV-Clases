import express from "express";
import mysql from "mysql2/promise";

let db = null;

try {
  db = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
  });
  console.log("Conectado a la base de datos");
} catch (e) {
  console.error(e.message);
  process.exit(1);
}
const app = express();
const port = 3000;

// Para interpretar body como JSON
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hola mundo!");
});

// GET para entregar listado de productos
app.get("/productos", async (req, res) => {
  const [productos] = await db.execute("SELECT * FROM productos");

  //console.log(results);
  res.send(productos);
});

// GET para entregar detalle de producto
app.get("/productos/:id", async (req, res) => {
  // Validar id
  const id = Number(req.params.id);

  const [productos] = await db.execute("SELECT * FROM productos WHERE id=?", [
    id,
  ]);

  if (productos.length === 0) {
    return res.status(404).send("Producto no encontrado");
  }

  res.send(productos[0]);
});

// POST para crear producto
app.post("/productos", async (req, res) => {
  // Validar los atributos de body
  const { nombre, cantidad } = req.body;

  const [result] = await db.execute(
    "INSERT INTO productos (nombre, cantidad) VALUES (?,?)",
    [nombre, cantidad],
  );

  // Envio respuesta
  res.status(201).send({ id: result.insertId, nombre, cantidad });
});

// PUT para modificar producto a partir de un id
app.put("/productos/:id", async (req, res) => {
  // Validar id
  const id = Number(req.params.id);
  // Validar el body
  const { nombre, cantidad } = req.body;

  const [UpdateProducto] = await db.execute(
    "UPDATE productos SET nombre = ?, cantidad = ? WHERE id= ?",
    [nombre, cantidad, id],
  );

  //Envío respuesta
  res.status(201).send({ id: UpdateProducto.insertId, id, nombre, cantidad });
});

// DELETE para quitar un producto a partir de un id
app.delete("/productos/:id", async (req, res) => {
  // Validar id
  const id = Number(req.params.id);

  const [DeleteProducto] = await db.execute(
    "DELETE FROM productos WHERE id=?",
    [id],
  );

  //Envío respuesta
  res.status(201).send("Producto eliminado correctamente");
});

app.listen(port, () => {
  console.log(`La aplicación esta funcionando en ${port}`);
});
