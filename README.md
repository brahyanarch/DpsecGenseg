Hermanito lindo, crear el archivo .env con lo siguiente.
PORT=3000
JWT_SECRET = 'GENSEG'
POSTGRES_USER="tu usuario"
POSTGRES_PASSWORD="tu password"
POSTGRES_DB="genseg"
DATABASE_URL="postgresql://genseg:123456@localhost:5432/genseg"

## Invitation email configuration

Configure these environment variables to send invitation emails through SMTP:

- `SMTP_HOST`: SMTP server hostname.
- `SMTP_PORT`: SMTP server port.
- `SMTP_SECURE`: `true` for implicit TLS or `false` for STARTTLS/plain connection.
- `SMTP_USER`: SMTP username.
- `SMTP_PASSWORD`: SMTP password.
- `SMTP_FROM`: sender address (optionally a display name and address).
- `INVITATION_ACCEPT_URL`: absolute frontend URL that accepts the `token` query parameter.

Invitation records are committed before the email is sent. If email delivery fails, the API reports a failure while the invitation remains persisted; there is currently no automatic retry.
