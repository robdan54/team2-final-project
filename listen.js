const app = require('./app');

// sets the port to listen on if not defined by the environment

const { PORT = 9090 } = process.env;

// opens the server on the defined port

app.listen(PORT, (err) => {
  if (err) throw err;
  console.log(`Listening on ${PORT}...`);
});
