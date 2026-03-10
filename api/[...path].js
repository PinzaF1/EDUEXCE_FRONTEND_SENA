const DEFAULT_BACKEND_URL = 'https://churnable-nimbly-norbert.ngrok-free.dev'

function buildTargetUrl(req) {
  const baseUrl = (process.env.BACKEND_BASE_URL || DEFAULT_BACKEND_URL).replace(/\/$/, '')
  const pathParts = Array.isArray(req.query.path)
    ? req.query.path
    : req.query.path
      ? [req.query.path]
      : []
  const joinedPath = pathParts.map((p) => encodeURIComponent(p)).join('/')

  const params = new URLSearchParams()
  Object.entries(req.query || {}).forEach(([key, value]) => {
    if (key === 'path') return
    if (Array.isArray(value)) {
      value.forEach((v) => params.append(key, String(v)))
      return
    }
    if (value !== undefined && value !== null) {
      params.append(key, String(value))
    }
  })

  const query = params.toString()
  return `${baseUrl}/${joinedPath}${query ? `?${query}` : ''}`
}

function buildForwardHeaders(req) {
  const headers = {}
  Object.entries(req.headers || {}).forEach(([key, value]) => {
    const lower = key.toLowerCase()
    if (lower === 'host' || lower === 'content-length') return
    if (value !== undefined) headers[key] = value
  })

  // Required by ngrok to bypass browser warning/interstitial on proxied traffic.
  headers['ngrok-skip-browser-warning'] = 'true'
  return headers
}

async function readRequestBody(req) {
  if (req.method === 'GET' || req.method === 'HEAD') return undefined
  const chunks = []
  for await (const chunk of req) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk)
  }
  if (!chunks.length) return undefined
  return Buffer.concat(chunks)
}

export default async function handler(req, res) {
  try {
    const targetUrl = buildTargetUrl(req)
    const body = await readRequestBody(req)

    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 25000)

    let upstream
    try {
      upstream = await fetch(targetUrl, {
        method: req.method,
        headers: buildForwardHeaders(req),
        body,
        redirect: 'follow',
        signal: controller.signal,
      })
    } finally {
      clearTimeout(timeout)
    }

    res.statusCode = upstream.status
    upstream.headers.forEach((value, key) => {
      if (key.toLowerCase() === 'transfer-encoding') return
      res.setHeader(key, value)
    })

    const data = Buffer.from(await upstream.arrayBuffer())
    res.end(data)
  } catch (error) {
    const message = error && error.name === 'AbortError'
      ? 'Proxy timeout to backend'
      : 'Proxy request failed'

    res.statusCode = 502
    res.setHeader('Content-Type', 'application/json')
    res.end(JSON.stringify({
      error: message,
      details: error instanceof Error ? error.message : String(error),
    }))
  }
}
