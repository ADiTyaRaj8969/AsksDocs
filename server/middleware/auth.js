import { OAuth2Client } from 'google-auth-library'

// Supports both Google OAuth tokens (GOOGLE_CLIENT_ID) and
// Firebase ID tokens (FIREBASE_PROJECT_ID). Configure whichever you use.
const GOOGLE_CLIENT_ID   = process.env.GOOGLE_CLIENT_ID   || ''
const FIREBASE_PROJECT_ID = process.env.FIREBASE_PROJECT_ID || ''

let googleClient = null
function getGoogleClient() {
  if (!googleClient) googleClient = new OAuth2Client(GOOGLE_CLIENT_ID)
  return googleClient
}

async function verifyGoogleToken(token) {
  const ticket = await getGoogleClient().verifyIdToken({
    idToken:  token,
    audience: GOOGLE_CLIENT_ID,
  })
  const p = ticket.getPayload()
  return { uid: p.sub, email: p.email, name: p.name }
}

async function verifyFirebaseToken(token) {
  // Firebase ID tokens are signed by Google; verify via Google's public certs
  // using the Firebase audience (aud = FIREBASE_PROJECT_ID)
  const client = new OAuth2Client()
  const ticket = await client.verifySignedJwtWithCertsAsync(
    token,
    'https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com',
    FIREBASE_PROJECT_ID,
    ['https://securetoken.google.com/' + FIREBASE_PROJECT_ID],
  )
  const p = ticket.getPayload()
  return { uid: p.sub, email: p.email, name: p.name }
}

/**
 * Express middleware — rejects requests without a valid Bearer token.
 * Set GOOGLE_CLIENT_ID for raw Google OAuth or FIREBASE_PROJECT_ID for Firebase.
 * If neither is set (dev mode), the middleware passes through with a warning.
 */
export async function requireAuth(req, res, next) {
  // Dev pass-through when no auth is configured
  if (!GOOGLE_CLIENT_ID && !FIREBASE_PROJECT_ID) {
    if (process.env.NODE_ENV !== 'production') return next()
    return res.status(500).json({ error: 'Auth not configured on server.' })
  }

  const authHeader = req.headers.authorization || ''
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized — missing token.' })
  }

  try {
    let user
    if (FIREBASE_PROJECT_ID) {
      user = await verifyFirebaseToken(token)
    } else {
      user = await verifyGoogleToken(token)
    }
    req.user = user
    next()
  } catch (err) {
    console.error('[Auth]', err.message)
    res.status(401).json({ error: 'Unauthorized — invalid or expired token.' })
  }
}
