// Visibility only: the static topic page and its source remain publicly accessible.
(async () => {
  const items = document.querySelectorAll('[data-non-eu-only]');
  if (!items.length) return;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);
  try {
    const response = await fetch('https://ipwho.is/?fields=success,country_code,is_eu', {
      signal: controller.signal,
      credentials: 'omit',
      referrerPolicy: 'no-referrer',
      cache: 'no-store'
    });
    if (!response.ok) return;
    const location = await response.json();
    if (location.success === true && /^[A-Z]{2}$/.test(location.country_code)
        && location.is_eu === false) {
      items.forEach(item => { item.hidden = false; });
    }
  } catch {
    // Keep the item hidden if the country cannot be determined.
  } finally {
    clearTimeout(timeout);
  }
})();
