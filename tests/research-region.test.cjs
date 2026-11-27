const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const script = fs.readFileSync('assets/research-region.js', 'utf8');
const settle = () => new Promise(resolve => setImmediate(resolve));
async function run(responses) {
  const item = {textContent:'Control', dataset:{nonEuText:'High-performance control'}};
  const events = {};
  let calls = 0;
  vm.runInNewContext(script, {
    document:{querySelectorAll:()=>[item]},
    window:{addEventListener:(name,fn)=>{events[name]=fn;}},
    AbortController,setTimeout,clearTimeout,
    fetch:async()=>{
      calls++;
      const data=responses.shift();
      if (data instanceof Error) throw data;
      return {ok:true,json:async()=>data};
    }
  });
  await settle();
  return {item,events,calls};
}
(async()=>{
  for(const country of 'AT BE BG HR CY CZ DK EE FI FR DE GR HU IE IT LV LT LU MT NL PL PT RO SK SI ES SE'.split(' ')) {
    assert.equal((await run([{country}])).item.textContent,'Control',country);
  }
  for(const country of ['HK','CN','US','GB','CH','NO']) {
    assert.equal((await run([{country}])).item.textContent,'High-performance control',country);
  }
  const fallback=await run([Error('timeout'),{success:true,country_code:'HK'}]);
  assert.equal(fallback.item.textContent,'High-performance control');assert.equal(fallback.calls,2);
  assert.equal((await run([{}, {success:true,country_code:'DE'}])).item.textContent,'Control');
  assert.equal((await run([Error('offline'),Error('offline')])).item.textContent,'Control');
  const restored=await run([{country:'HK'},{country:'DE'}]);
  restored.events.pageshow({persisted:true});await settle();
  assert.equal(restored.item.textContent,'Control');
  const online=await run([Error('offline'),Error('offline'),{country:'HK'}]);
  online.events.online();await settle();assert.equal(online.item.textContent,'High-performance control');
  for(const name of ['index.html','biography.html','research.html','research-high-precision-control.html']) {
    const html=fs.readFileSync(name,'utf8');
    assert(html.includes('research-region.js?v=wording-3'));
    assert(!html.includes('data-non-eu-only'));
  }
  console.log('Passed: all 27 EU countries, HK and other non-EU countries, fallback, failures, history restore, reconnection, and page integration.');
})();
