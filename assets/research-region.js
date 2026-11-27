// Regional wording only; the topic stays visible regardless of location.
(() => {
  const items = Array.from(document.querySelectorAll('[data-non-eu-text]'));
  if (!items.length) return;
  const defaults = items.map(item => item.textContent);
  // EU member states, not all European or Schengen countries.
  const eu = new Set('AT BE BG HR CY CZ DK EE FI FR DE GR HU IE IT LV LT LU MT NL PL PT RO SK SI ES SE'.split(' '));
  let generation = 0;

  async function lookup(url, field) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);
    try {
      const response = await fetch(url, {
        signal: controller.signal,
        credentials: 'omit',
        referrerPolicy: 'no-referrer',
        cache: 'no-store'
      });
      if (!response.ok) throw new Error('Country lookup failed');
      const data = await response.json();
      const country = data[field];
      if (data.success === false || typeof country !== 'string'
          || !/^[A-Z]{2}$/.test(country) || ['XX', 'ZZ'].includes(country)) {
        throw new Error('Country unavailable');
      }
      return country;
    } finally {
      clearTimeout(timeout);
    }
  }

  async function update() {
    const current = ++generation;
    items.forEach((item, index) => { item.textContent = defaults[index]; });
    const providers = [
      ['https://api.country.is/', 'country'],
      ['https://ipwho.is/?fields=success,country_code', 'country_code']
    ];
    for (const [url, field] of providers) {
      try {
        const country = await lookup(url, field);
        if (current !== generation) return;
        items.forEach((item, index) => {
          item.textContent = eu.has(country) ? defaults[index] : item.dataset.nonEuText;
        });
        return;
      } catch {
        // Try the independent fallback; retain neutral wording if both fail.
      }
    }
  }

  window.addEventListener('online', update);
  window.addEventListener('pageshow', event => { if (event.persisted) update(); });
  update();
})();
