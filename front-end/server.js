const serveAlways = require('serve-always');

const express = require('express');

const app = express();
const env = process.env;
const port = env.PORT || 80;

app.get('/.well-known/acme-challenge/:acmeToken', (req, res) => {
  const acmeToken = req.params.acmeToken;
  let acmeKey;

  if (env.ACME_KEY && env.ACME_TOKEN) {
    if (acmeToken === env.ACME_TOKEN) {
      acmeKey = env.ACME_KEY;
    }
  }

  for (const key in env) { // eslint-disable-line no-restricted-syntax
    if (key.startsWith('ACME_TOKEN_')) {
      const num = key.split('ACME_TOKEN_')[1];
      if (acmeToken === env[`ACME_TOKEN_${num}`]) {
        acmeKey = env[`ACME_KEY_${num}`];
      }
    }
  }

  if (acmeKey) res.send(acmeKey);
  else res.status(404).send();
});

/* Redirect http to https */
app.get('*', (req, res, next) => {
  if (req.headers['x-forwarded-proto'] !== 'https' && env.NODE_ENV === 'production') {
    res.redirect(`https://${req.hostname}${req.url}`);
  } else {
    next(); /* Continue to other routes if we're not redirecting */
  }
});

// Serve assets
app.use('/static', express.static('build'));

app.use(serveAlways('build', 'index.html'));

// Start
app.listen(port);
