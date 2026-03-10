export default function handler(req, res) {
  const debugInfo = {
    url: req.url || 'NO_URL',
    method: req.method || 'NO_METHOD',
    query: req.query ? JSON.stringify(req.query) : 'NO_QUERY_OBJ',
    queryPath: req.query?.path || 'NO_PATH_PARAM',
    allQueryKeys: req.query ? Object.keys(req.query) : [],
    headers: {
      host: req.headers?.host,
      referer: req.headers?.referer,
    },
    timestamp: new Date().toISOString()
  }
  res.status(200).json(debugInfo)
}
