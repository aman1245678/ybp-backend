import pg from "pg";

const client = new pg.Client({
  connectionString: "postgresql://postgres:aman@localhost:5432/postgres",
});

await client.connect();
const exists = await client.query("SELECT 1 FROM pg_database WHERE datname = 'ybp'");
if (exists.rowCount === 0) {
  await client.query("CREATE DATABASE ybp");
  console.log("Created database ybp");
} else {
  console.log("Database ybp already exists");
}
await client.end();
