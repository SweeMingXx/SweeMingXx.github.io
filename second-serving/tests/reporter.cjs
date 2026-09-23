// Mirror test output to structured GitHub check annotations for remote diagnostics.
const log=console.log.bind(console), error=console.error.bind(console);
const clean=x=>String(x).replace(/%/g,'%25').replace(/\r/g,'%0D').replace(/\n/g,'%0A');
console.log=(...args)=>{log(...args);if(String(args[0]).startsWith('PASS:'))log('::notice title=Browser verification::'+clean(args.join(' ')))};
console.error=(...args)=>{error(...args);log('::error title=Browser verification failed::'+clean(args.map(x=>x&&x.stack||x).join(' ')))};
