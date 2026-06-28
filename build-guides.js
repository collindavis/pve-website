#!/usr/bin/env node
// Generates informational guide pages (topic-cluster content that earns links
// and captures non-local informational intent). Shares the site's nav/footer/
// styling and uses root-absolute extensionless URLs. Usage: node build-guides.js

const fs = require('fs');
const path = require('path');

const OUT_DIR = path.join('/Users/macmini/Sites/PVE', 'guides');
const ORIGIN = 'https://prospervalleyelectric.com';
const today = new Date().toISOString().slice(0, 10);

const GUIDES = [
  {
    slug: 'generator-sizing-vermont',
    title: 'What Size Standby Generator Do You Need for a Vermont Home? | Prosper Valley Electric',
    description: 'How to size a whole-home or essential-circuits standby generator for a Vermont home — common kW sizes, what they power, and how well pumps, heat, and EVs affect the math.',
    h1: 'What Size Standby Generator Do You Need for a Vermont Home?',
    intro: [
      "Vermont winters put real strain on the grid. Ice storms and heavy snow regularly knock out power for hours or days, and homes here often depend on electric well pumps, heat pumps, and freezers full of food. A standby generator solves that — but only if it's sized correctly. Too small and it can't carry your loads; too large and you've overspent.",
      "This guide walks through how generators are sized, the common kW ranges and what they actually run, and the specific things about Vermont homes that change the calculation. When you're ready, a licensed electrician should do a proper load analysis before you buy.",
    ],
    sections: [
      { h: 'Two approaches: whole-home vs. essential circuits', body: [
        '**Essential-circuit (managed) systems** power a chosen set of circuits — typically heat, well pump, refrigerator, and some lighting and outlets. They use a smaller generator and a transfer switch (often with load management) and are the most cost-effective choice for many homes.',
        '**Whole-home systems** run everything automatically, including larger loads, usually with a load-management module that sheds non-essential circuits during peak demand. They cost more but require no thinking during an outage.',
      ]},
      { h: 'Common generator sizes and what they run', body: [
        '**10–14 kW** — Essential circuits for a small-to-mid-size home: heat/boiler controls, well pump, refrigerator, lights, and outlets. A common, economical choice.',
        '**16–20 kW** — Most of a typical Vermont home, including some larger loads, often with load management for the biggest draws.',
        '**22–26 kW** — Whole-home coverage for larger homes or those with electric heat, central AC, or multiple high-draw appliances.',
        '**26 kW and up** — Large or all-electric homes, properties with shops or barns, or homes adding EV charging on top of everything else.',
      ]},
      { h: 'What drives your size the most', body: [
        '**Well pump** — Pumps draw a large surge when they start. Almost every rural Vermont home has one, and it heavily influences sizing.',
        '**Heating system** — A propane or oil boiler needs only modest power for controls and circulators; electric heat or heat pumps need far more.',
        '**Electric range, dryer, and water heater** — Each is a significant 240V load.',
        '**Central AC or multiple mini-splits** — Add meaningful demand if you want them running during an outage.',
        '**EV charging** — A Level 2 charger is a large continuous load; if you want to charge during outages, it changes the math considerably.',
      ]},
      { h: 'Fuel: propane vs. natural gas in Vermont', body: [
        "Most of Vermont — including the Upper Valley — has little or no natural gas service, so the large majority of standby generators here run on **propane**. Sizing interacts with your tank and line: bigger generators burn more fuel per hour, which affects tank size and runtime. We coordinate the electrical side and work with your propane supplier on the fuel connection and line sizing.",
      ]},
    ],
    faq: [
      { q: 'Can I size a generator myself?', a: 'You can get a rough idea from the ranges above, but the surge load from a well pump and the interaction of multiple 240V appliances make a real load analysis worthwhile. It is the difference between a system that carries your home and one that nuisance-trips during an outage.' },
      { q: 'Is a bigger generator always better?', a: 'No. An oversized generator costs more upfront, burns more fuel, and can run inefficiently under light loads. The goal is a unit matched to your actual loads, often with load management rather than brute-force size.' },
      { q: 'Do I need a permit for a standby generator in Vermont?', a: 'Yes. The transfer switch and wiring require an electrical permit, and the work is inspected. We handle the permitting and inspection as part of the installation.' },
      { q: 'What about a second home or camp that sits empty?', a: 'For seasonal and vacation properties, a standby generator with remote monitoring is especially valuable — you get notified of outages and unit status even when you are not there. This is common for ski-area and lakeside properties in our service area.' },
    ],
    relatedLabel: 'Generator Installation',
    relatedService: 'generator-installation',
    relatedTowns: [['woodstock-vt','Woodstock'],['hanover-nh','Hanover'],['lebanon-nh','Lebanon'],['killington-vt','Killington']],
  },
  {
    slug: 'panel-upgrade-cost-vermont',
    title: 'What Does a 200-Amp Panel Upgrade Cost in Vermont? (2026) | Prosper Valley Electric',
    description: 'A plain-English look at electrical panel upgrade costs in Vermont — typical price range for a 200-amp upgrade, what drives the price, signs you need one, and how permits work.',
    h1: 'What Does a 200-Amp Panel Upgrade Cost in Vermont?',
    intro: [
      "If your home still runs on a 60- or 100-amp panel — or a fuse box — you may not be able to safely add an EV charger, heat pump, or addition without upgrading first. A panel upgrade is one of the highest-value electrical investments a Vermont homeowner can make, and it is usually a one-day job.",
      "Costs vary with your existing setup, so treat the figures below as planning ranges, not quotes. A written estimate after an on-site assessment is the only way to know your number.",
    ],
    sections: [
      { h: 'Typical cost range in Vermont', body: [
        'Most residential **200-amp panel upgrades** in the Upper Valley fall in the **$1,500–$3,500** range. Straightforward swaps where the new panel goes in the same location with no service-entrance changes sit at the lower end; jobs that need new service-entrance cable, a new meter socket or mast, or a relocated panel run higher.',
      ]},
      { h: 'What affects the price', body: [
        '**Service-entrance work** — If the wire from the meter to the panel needs replacing, or the meter socket and mast need upgrading, that adds material and labor.',
        '**Panel location and access** — A panel in a finished basement or a tight, hard-to-reach spot takes more time than one on an open wall.',
        '**Overhead vs. underground service** — The two are handled differently and have different costs.',
        '**Circuit count and condition** — Old or unsafe wiring at the panel may need attention as part of the swap.',
        '**Utility coordination** — The power company has to disconnect and reconnect service; we schedule and coordinate that.',
      ]},
      { h: 'Signs your home needs a panel upgrade', body: [
        '**Breakers trip frequently** or the panel feels warm or buzzes.',
        '**A fuse box instead of breakers** — a sign of very old infrastructure and an insurance liability.',
        "**You're adding significant load** — EV charger, hot tub, heat pump, electric range, or an addition.",
        '**The home is 40+ years old** with its original 60- or 100-amp service.',
      ]},
      { h: 'Permits and inspection in Vermont', body: [
        'Panel upgrades require an electrical permit in Vermont, and the finished work is inspected. We handle the permit filing, coordinate the utility disconnect and reconnect, and provide documentation you can give your insurance company. Power is typically off for 4–6 hours during the swap.',
      ]},
    ],
    faq: [
      { q: 'How long does a panel upgrade take?', a: 'Most are completed in a single day, with power off for about 4–6 hours during the swap. We coordinate the utility disconnect and reconnect so you are not managing that yourself.' },
      { q: 'Will a panel upgrade increase my home value?', a: 'Generally yes. A modern 200-amp panel is a selling point, is required by many insurers, and opens the door to EV chargers, heat pumps, and other upgrades buyers look for.' },
      { q: 'Can I add an EV charger at the same time?', a: 'Yes, and it is more efficient to do both at once. We can quote the combined project and coordinate both permits together.' },
      { q: 'Why is my quote higher than the base range?', a: 'Usually service-entrance work (new cable, meter socket, or mast), a relocated panel, or difficult access. A written estimate itemizes exactly what is driving the price.' },
    ],
    relatedLabel: 'Panel Upgrades',
    relatedService: 'panel-upgrades',
    relatedTowns: [['woodstock-vt','Woodstock'],['hartford-vt','Hartford'],['white-river-junction-vt','White River Junction'],['lebanon-nh','Lebanon']],
  },
];

function esc(s) { return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
function inline(s) { return s.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>'); }

const STYLE = `
  :root{--orange:#E8820C;--orange-dark:#C46D08;--orange-light:#F5A03A;--orange-glow:rgba(232,130,12,0.13);--charcoal:#181818;--charcoal-mid:#222;--charcoal-light:#2C2C2C;--charcoal-border:#333;--warm-white:#FAFAF8;--gray-200:#E4E2DC;--gray-600:#5E5A54;--white:#fff;--font-display:'Barlow Condensed',sans-serif;--font-body:'Barlow',sans-serif;--nav-h:88px;--radius:5px;--transition:0.22s cubic-bezier(0.4,0,0.2,1)}
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
  html{scroll-behavior:smooth;font-size:16px}
  body{font-family:var(--font-body);background:var(--warm-white);color:var(--charcoal);-webkit-font-smoothing:antialiased;overflow-x:hidden}
  nav{position:fixed;top:0;left:0;right:0;height:var(--nav-h);background:var(--charcoal);display:flex;align-items:center;justify-content:center;padding:0 32px;z-index:1000;border-bottom:2px solid var(--orange)}
  .nav-inner{width:100%;max-width:1120px;display:flex;align-items:center;justify-content:space-between}
  .nav-logo{display:flex;align-items:center;gap:14px;text-decoration:none}
  .nav-logo-img{width:62px;height:62px;border-radius:50%;object-fit:cover;border:2px solid rgba(232,130,12,0.35)}
  .nav-logo-text{font-family:var(--font-display);font-weight:800;font-size:1.2rem;letter-spacing:0.06em;color:var(--white);line-height:1.1;text-transform:uppercase}
  .nav-logo-text span{color:var(--orange);display:block;font-size:1rem;letter-spacing:0.14em}
  .nav-right{display:flex;align-items:center;gap:6px}
  .nav-links{display:flex;gap:2px;list-style:none;margin-right:8px}
  .nav-links a{font-family:var(--font-display);font-weight:600;font-size:0.88rem;letter-spacing:0.1em;text-transform:uppercase;color:rgba(255,255,255,0.65);text-decoration:none;padding:10px 16px;border-radius:var(--radius);transition:color var(--transition)}
  .nav-links a:hover{color:var(--white)}
  .nav-cta{display:inline-flex;align-items:center;gap:8px;background:var(--orange);color:var(--white);font-family:var(--font-display);font-weight:700;font-size:0.85rem;letter-spacing:0.1em;text-transform:uppercase;padding:11px 22px;border-radius:var(--radius);text-decoration:none;transition:background var(--transition)}
  .nav-cta:hover{background:var(--orange-dark)}
  .hamburger{display:none;flex-direction:column;gap:5px;cursor:pointer;padding:8px;background:none;border:none}
  .hamburger span{display:block;width:26px;height:2px;background:var(--white)}
  .page-hero{background:var(--charcoal);padding:calc(var(--nav-h) + 64px) 32px 64px;text-align:center;position:relative;overflow:hidden}
  .page-hero::after{content:'';position:absolute;bottom:0;left:0;right:0;height:2px;background:linear-gradient(90deg,transparent,var(--orange),transparent)}
  .breadcrumb{font-family:var(--font-display);font-size:0.7rem;letter-spacing:0.2em;text-transform:uppercase;color:rgba(255,255,255,0.3);margin-bottom:18px}
  .breadcrumb a{color:rgba(255,255,255,0.4);text-decoration:none}.breadcrumb a:hover{color:var(--orange)}
  .breadcrumb span{color:rgba(232,130,12,0.5);margin:0 8px}
  .badge{display:inline-flex;align-items:center;gap:8px;background:rgba(232,130,12,0.1);border:1px solid rgba(232,130,12,0.3);color:var(--orange-light);font-family:var(--font-display);font-weight:700;font-size:0.7rem;letter-spacing:0.2em;text-transform:uppercase;padding:6px 16px;border-radius:2px;margin-bottom:24px}
  .page-hero h1{font-family:var(--font-display);font-weight:900;font-size:clamp(2.2rem,5.5vw,3.8rem);text-transform:uppercase;color:var(--white);line-height:1;letter-spacing:-0.01em;max-width:880px;margin:0 auto;text-wrap:balance}
  article{max-width:760px;margin:0 auto;padding:64px 32px}
  article .lead{font-size:1.15rem;line-height:1.75;color:var(--charcoal);margin-bottom:20px}
  article p{font-size:1.05rem;line-height:1.8;color:var(--gray-600);margin-bottom:18px}
  article p strong{color:var(--charcoal);font-weight:600}
  article h2{font-family:var(--font-display);font-weight:900;font-size:clamp(1.6rem,3.5vw,2.3rem);text-transform:uppercase;color:var(--charcoal);line-height:1.05;letter-spacing:-0.01em;margin:44px 0 18px}
  article h2::after{content:'';display:block;width:44px;height:3px;background:var(--orange);margin-top:12px}
  .faq{background:var(--charcoal);padding:64px 32px}
  .faq-inner{max-width:760px;margin:0 auto}
  .faq h2{font-family:var(--font-display);font-weight:900;font-size:clamp(1.6rem,3.5vw,2.3rem);text-transform:uppercase;color:var(--white);margin-bottom:24px}
  .faq-item{border-bottom:1px solid var(--charcoal-border);padding:20px 0}
  .faq-item h3{font-family:var(--font-body);font-size:1.05rem;font-weight:600;color:var(--orange);margin-bottom:10px}
  .faq-item p{font-size:0.97rem;line-height:1.75;color:rgba(255,255,255,0.55)}
  .related{background:var(--warm-white);padding:56px 32px;border-bottom:1px solid var(--gray-200)}
  .related-inner{max-width:760px;margin:0 auto}
  .related h2{font-family:var(--font-display);font-weight:800;font-size:1.3rem;text-transform:uppercase;color:var(--charcoal);margin-bottom:18px}
  .related-links{display:flex;flex-wrap:wrap;gap:10px}
  .related-links a{font-family:var(--font-display);font-weight:700;font-size:0.85rem;letter-spacing:0.04em;text-transform:uppercase;color:var(--charcoal);text-decoration:none;background:var(--white);border:1px solid var(--gray-200);border-radius:var(--radius);padding:12px 18px;transition:border-color var(--transition),color var(--transition)}
  .related-links a:hover{color:var(--orange);border-color:rgba(232,130,12,0.4)}
  .cta-banner{background:var(--orange);padding:72px 32px;text-align:center}
  .cta-banner h2{font-family:var(--font-display);font-weight:900;font-size:clamp(1.8rem,4.5vw,3rem);text-transform:uppercase;color:var(--white);line-height:1;margin-bottom:12px}
  .cta-banner p{color:rgba(255,255,255,0.85);font-size:1.05rem;margin-bottom:28px}
  .btn-dark{display:inline-flex;align-items:center;gap:10px;background:var(--charcoal);color:var(--white);font-family:var(--font-display);font-weight:700;font-size:0.95rem;letter-spacing:0.1em;text-transform:uppercase;padding:18px 38px;border-radius:var(--radius);text-decoration:none;transition:background var(--transition)}
  .btn-dark:hover{background:#0a0a0a}
  footer{background:var(--charcoal);color:rgba(255,255,255,0.38);padding:48px 32px;text-align:center;font-size:0.85rem}
  footer a{color:var(--orange);text-decoration:none}
  footer .f-links{margin-bottom:14px;display:flex;gap:18px;justify-content:center;flex-wrap:wrap}
  footer .f-links a{color:rgba(255,255,255,0.5);font-family:var(--font-display);text-transform:uppercase;letter-spacing:0.08em;font-size:0.8rem}
  @media(max-width:760px){.nav-links,.nav-cta{display:none}.hamburger{display:flex}}
`;

function navHTML() {
  return `<nav><div class="nav-inner">
  <a class="nav-logo" href="/"><img class="nav-logo-img" src="/pve-circle-logo.jpg" alt="Prosper Valley Electric"><div class="nav-logo-text">Prosper Valley<span>Electric</span></div></a>
  <div class="nav-right">
    <ul class="nav-links">
      <li><a href="/">Home</a></li>
      <li><a href="/#services">Services</a></li>
      <li><a href="/service-areas">Service Areas</a></li>
      <li><a href="/#about">About</a></li>
    </ul>
    <a class="nav-cta" href="/#contact">Request Estimate</a>
  </div>
  <button class="hamburger" aria-label="Menu" onclick="location.href='/#contact'"><span></span><span></span><span></span></button>
</div></nav>`;
}

function footerHTML() {
  return `<footer>
  <div class="f-links"><a href="/">Home</a><a href="/#services">Services</a><a href="/service-areas">Service Areas</a><a href="/#contact">Contact</a></div>
  <div>Prosper Valley Electric · <a href="tel:+18022349636">(802) 234-9636</a> · Serving Vermont &amp; New Hampshire</div>
  <div style="margin-top:8px;color:rgba(255,255,255,0.28)">&copy; 2025 Prosper Valley Electric. All rights reserved.</div>
</footer>`;
}

function render(g) {
  const canonical = `${ORIGIN}/guides/${g.slug}`;
  const articleSchema = JSON.stringify({
    '@context':'https://schema.org','@type':'Article',
    headline:g.h1,description:g.description,
    author:{'@type':'Organization',name:'Prosper Valley Electric'},
    publisher:{'@type':'Organization',name:'Prosper Valley Electric'},
    datePublished:today,dateModified:today,mainEntityOfPage:canonical,
  },null,2);
  const faqSchema = JSON.stringify({
    '@context':'https://schema.org','@type':'FAQPage',
    mainEntity:g.faq.map(f=>({'@type':'Question',name:f.q,acceptedAnswer:{'@type':'Answer',text:f.a}})),
  },null,2);
  const crumbSchema = JSON.stringify({
    '@context':'https://schema.org','@type':'BreadcrumbList',
    itemListElement:[
      {'@type':'ListItem',position:1,name:'Home',item:ORIGIN+'/'},
      {'@type':'ListItem',position:2,name:'Guides',item:ORIGIN+'/guides/'+g.slug},
      {'@type':'ListItem',position:3,name:g.h1,item:canonical},
    ],
  },null,2);

  const intro = g.intro.map((p,i)=>`<p class="${i===0?'lead':''}">${inline(p)}</p>`).join('\n');
  const sections = g.sections.map(s=>`<h2>${esc(s.h)}</h2>\n${s.body.map(p=>`<p>${inline(p)}</p>`).join('\n')}`).join('\n');
  const faq = g.faq.map(f=>`<div class="faq-item"><h3>${esc(f.q)}</h3><p>${esc(f.a)}</p></div>`).join('\n');
  const related = g.relatedTowns.map(([slug,name])=>`<a href="/services/${g.relatedService}/${slug}">${esc(g.relatedLabel)} in ${esc(name)}</a>`).join('\n');

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${esc(g.title)}</title>
<meta name="description" content="${esc(g.description)}">
<link rel="canonical" href="${canonical}">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;600;700;800;900&family=Barlow:wght@300;400;500;600&display=swap" rel="stylesheet">
<script type="application/ld+json">
${articleSchema}
</script>
<script type="application/ld+json">
${faqSchema}
</script>
<script type="application/ld+json">
${crumbSchema}
</script>
<style>${STYLE}</style>
</head>
<body>
${navHTML()}
<div class="page-hero">
  <div class="breadcrumb"><a href="/">Prosper Valley Electric</a><span>›</span>Guides<span>›</span>${esc(g.relatedLabel)}</div>
  <div class="badge">Guide</div>
  <h1>${esc(g.h1)}</h1>
</div>
<article>
${intro}
${sections}
</article>
<section class="faq"><div class="faq-inner"><h2>Frequently Asked Questions</h2>
${faq}
</div></section>
<section class="related"><div class="related-inner"><h2>${esc(g.relatedLabel)} Near You</h2><div class="related-links">
${related}
</div></div></section>
<div class="cta-banner">
  <h2>Want a Straight Answer for Your Home?</h2>
  <p>We provide written estimates after an on-site assessment — no guesswork.</p>
  <a class="btn-dark" href="/#contact">Request a Free Estimate</a>
</div>
${footerHTML()}
</body>
</html>`;
}

if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });
for (const g of GUIDES) {
  fs.writeFileSync(path.join(OUT_DIR, `${g.slug}.html`), render(g), 'utf8');
  console.log(`  ✓ guides/${g.slug}.html`);
}
console.log(`\nGenerated ${GUIDES.length} guide pages.`);
