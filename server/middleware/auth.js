import { OAuth2Client } from 'google-auth-library'

const FIREBASE_PROJECT_ID = process.env.FIREBASE_PROJECT_ID || ''

// Cache certs — Firebase rotates them ~every 24 h
let _certsCache = null
let _certsFetchedAt = 0
async function getFirebaseCerts() {
  const now = Date.now()
  if (!_certsCache || now - _certsFetchedAt > 6 * 60 * 60 * 1000) {
    const res = await fetch(
      'https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com'
    )
    _certsCache = await res.json()
    _certsFetchedAt = now
  }
  return _certsCache
}

async function verifyFirebaseToken(token) {
  const certs = await getFirebaseCerts()
  const client = new OAuth2Client()
  const ticket = await client.verifySignedJwtWithCertsAsync(
    token,
    certs,
    FIREBASE_PROJECT_ID,
    ['https://securetoken.google.com/' + FIREBASE_PROJECT_ID],
  )
  const p = ticket.getPayload()
  return { uid: p.sub, email: p.email, name: p.name }
}

export async function requireAuth(req, res, next) {
  if (!FIREBASE_PROJECT_ID) {
    if (process.env.NODE_ENV !== 'production') return next()
    return res.status(500).json({ error: 'Auth not configured on server.' })
  }

  const authHeader = req.headers.authorization || ''
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null
  if (!token) return res.status(401).json({ error: 'Unauthorized — missing token.' })

  try {
    req.user = await verifyFirebaseToken(token)
    next()
  } catch (err) {
    console.error('[Auth]', err.message)
    res.status(401).json({ error: 'Unauthorized — invalid or expired token.' })
  }
}
