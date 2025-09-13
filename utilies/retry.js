
async function retry(fn, retries = 3, delay = 1000, factor = 2) {
  let attempt = 0;
  while (attempt < retries) {
    try {
      return await fn();
    } catch (err) {
      attempt++;
      if (attempt >= retries) throw err;
      await new Promise(res => setTimeout(res, delay));
      delay *= factor; // exponential backoff
    }
  }
}

module.exports = { retry };
