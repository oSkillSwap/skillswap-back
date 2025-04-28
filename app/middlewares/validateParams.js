export function validateParams(...keys) {
  return (req, res, next) => {
    for (const key of keys) {
      if (!/^\d+$/.test(req.params[key])) {
        return res.status(400).json({ error: `Paramètre ${key} invalide` });
      }
    }
    next();
  };
}
