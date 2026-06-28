#!/usr/bin/env node
// Generates 60 SEO landing pages from markdown source files
// Usage: node build-seo-pages.js

const fs = require('fs');
const path = require('path');

const SRC_BASE = '/Users/macmini/Downloads/prosper-valley-seo-pages';
const OUT_BASE = '/Users/macmini/Sites/PVE/services';

const SERVICES = [
  'ev-charger-installation',
  'residential-electrical',
  'commercial-electrical',
  'panel-upgrades',
  'generator-installation',
  'smart-home-lighting',
];

const LOCATIONS = [
  'barnard-vt',
  'hanover-nh',
  'hartford-vt',
  'hartland-vt',
  'killington-vt',
  'lebanon-nh',
  'norwich-vt',
  'pomfret-vt',
  'quechee-vt',
  'reading-vt',
  'sharon-vt',
  'white-river-junction-vt',
  'windsor-vt',
  'woodstock-vt',
];

const SERVICE_LABELS = {
  'ev-charger-installation': 'EV Charger Installation',
  'residential-electrical': 'Residential Electrical',
  'commercial-electrical': 'Commercial Electrical',
  'panel-upgrades': 'Panel Upgrades',
  'generator-installation': 'Generator Installation',
  'smart-home-lighting': 'Smart Home & Lighting',
};

// Per-town, truthful, town-specific bonus FAQ. Adds genuinely unique content
// to every page (and a unique FAQPage schema entry), reducing the templated
// overlap between location pages within a service. Service-agnostic so it
// reads naturally across all six service pages for a town.
const TOWN_PROFILES = {
  'woodstock-vt': {
    q: 'Do you work on historic homes in the Woodstock village?',
    a: "Yes. Woodstock's village has many historic homes where wiring has to be updated carefully and to code without compromising the character of the house. We do this kind of work regularly and Woodstock is our home base.",
  },
  'hartford-vt': {
    q: 'Do you cover White River Junction, Wilder, and West Hartford?',
    a: 'Yes. The town of Hartford includes the villages of White River Junction, Wilder, and West Hartford, and we serve all of them — from older downtown buildings to newer homes near the river.',
  },
  'white-river-junction-vt': {
    q: 'Do you work on older downtown and mixed-use buildings in White River Junction?',
    a: "Yes. White River Junction's downtown has a lot of older and mixed-use building stock. We handle the electrical side of renovations, tenant fit-ups, and residential upgrades throughout the village.",
  },
  'norwich-vt': {
    q: 'Do you serve historic and higher-end homes in Norwich?',
    a: 'Yes. Norwich has many well-kept historic and higher-end homes where careful, code-compliant work matters. We bring that standard to every Norwich project.',
  },
  'windsor-vt': {
    q: 'Do you work on older homes in historic downtown Windsor?',
    a: "Yes. Windsor — the “birthplace of Vermont” — has a lot of older housing stock that benefits from panel and wiring upgrades. We assess and modernize these systems safely.",
  },
  'quechee-vt': {
    q: 'Do you service homes and condos in the Quechee Lakes area?',
    a: 'Yes. Quechee has a mix of year-round homes and second homes and condos around Quechee Lakes. We coordinate access with owners and associations as needed.',
  },
  'hartland-vt': {
    q: 'Do you cover all three Hartland villages and the surrounding rural areas?',
    a: 'Yes. We serve Hartland, Hartland Four Corners, and North Hartland, along with the rural properties in between — including homes on long service runs and private wells.',
  },
  'barnard-vt': {
    q: 'Can you reach rural and seasonal homes around Barnard and Silver Lake?',
    a: 'Yes. Barnard is rural with many seasonal and second homes, some on dirt roads near Silver Lake. We handle rural access and long service runs, and we can advise on monitoring for homes that sit empty.',
  },
  'hanover-nh': {
    q: 'Do you work in Dartmouth-area neighborhoods and along Lyme Road and Route 10?',
    a: 'Yes. Hanover ranges from dense neighborhoods near Dartmouth and downtown to homes spread along Lyme Road and Route 10, and we work across all of them.',
  },
  'lebanon-nh': {
    q: 'Do you handle both residential and commercial work in Lebanon?',
    a: 'Yes. Lebanon is a commercial and medical hub as well as a residential community. We work on homes, businesses, and tenant spaces throughout the area.',
  },
  'killington-vt': {
    q: 'Do you service vacation homes, condos, and short-term rentals in Killington?',
    a: 'Yes. A large share of Killington properties are second homes, condos, and rentals that sit empty between visits. We coordinate access with owners and property managers, and we can advise on remotely monitored systems so you know your power and equipment are working even when you are not there.',
  },
  'pomfret-vt': {
    q: "Can you reach homes on Pomfret's back roads and long private drives?",
    a: 'Yes. Much of Pomfret sits along dirt roads and long private driveways, with homes set well back from the road. We handle long service runs and rural access regularly, and it is all factored into the written estimate up front.',
  },
  'reading-vt': {
    q: 'Do you work on older rural homes around Felchville and greater Reading?',
    a: 'Yes. Many Reading homes are older, rural, and on private wells, which often means aging service and undersized wiring. We assess what is there and bring it up to current code safely.',
  },
  'sharon-vt': {
    q: 'Do you serve homes along the Route 14 and White River corridor in Sharon?',
    a: 'Yes. We work throughout Sharon, from riverside homes along Route 14 to hillside properties on well and septic. We are a short drive from our Woodstock base.',
  },
};

// Informational guides linked contextually from matching service pages
const GUIDE_FOR_SERVICE = {
  'generator-installation': { slug: 'generator-sizing-vermont', label: 'What size standby generator do you need for a Vermont home?' },
  'panel-upgrades': { slug: 'panel-upgrade-cost-vermont', label: 'What does a 200-amp panel upgrade cost in Vermont?' },
};

function parseMarkdown(src) {
  const meta = {};
  // meta fields
  const metaTitle = src.match(/\*\*Meta Title:\*\* (.+)/);
  const metaDesc = src.match(/\*\*Meta Description:\*\* (.+)/);
  meta.title = metaTitle ? metaTitle[1].trim() : '';
  meta.description = metaDesc ? metaDesc[1].trim() : '';

  // H1
  const h1Match = src.match(/### H1\s*\n+([^\n#-][^\n]+)/);
  meta.h1 = h1Match ? h1Match[1].trim() : '';

  // Opening paragraphs (between ### H1 block and first ### H2:)
  const afterH1 = src.split(/### H1\s*\n/)[1] || '';
  const openingRaw = afterH1.split(/### H2:/)[0] || '';
  // Remove the H1 content line itself and the --- separators
  const openingLines = openingRaw.split('\n').filter(l => l.trim() && l.trim() !== '---' && !l.startsWith('#'));
  meta.opening = openingLines.join('\n').trim();

  // H2 sections (all of them)
  meta.sections = [];
  const h2Regex = /### H2: ([^\n]+)\n([\s\S]*?)(?=### H2:|### Call to Action|## INTERNAL|$)/g;
  let m;
  while ((m = h2Regex.exec(src)) !== null) {
    const sectionTitle = m[1].trim();
    const sectionBody = m[2].trim();
    if (sectionTitle.toLowerCase().includes('frequently asked questions')) {
      // Parse FAQ
      meta.faq = parseFAQ(sectionBody);
    } else {
      meta.sections.push({ title: sectionTitle, body: sectionBody });
    }
  }

  // CTA paragraph
  const ctaMatch = src.match(/### Call to Action\n+([\s\S]*?)(?=\n---|\n##|$)/);
  meta.ctaText = ctaMatch ? ctaMatch[1].replace(/\[REQUEST ESTIMATE NOW\]\([^)]*\)/g, '').trim() : '';

  // Schema JSON-LD blocks
  const schemas = [];
  const jsonMatches = src.matchAll(/```json\n([\s\S]*?)```/g);
  for (const jm of jsonMatches) {
    schemas.push(jm[1].trim());
  }
  meta.schemas = schemas;

  // Internal links: parse "- "text" → /path" lines
  meta.internalLinks = {};
  const ilSection = src.split('## INTERNAL LINKING INSTRUCTIONS')[1] || '';
  const ilEnd = ilSection.split('## SCHEMA')[0] || ilSection;
  const ilRegex = /- "([^"]+)" → `([^`]+)`/g;
  let ilm;
  while ((ilm = ilRegex.exec(ilEnd)) !== null) {
    meta.internalLinks[ilm[1]] = ilm[2];
  }

  return meta;
}

function parseFAQ(body) {
  const faqs = [];
  // Pattern: **Question text**\nAnswer text
  const qRegex = /\*\*([^*]+)\*\*\s*\n([\s\S]*?)(?=\n\*\*|\n---|\n###|$)/g;
  let m;
  while ((m = qRegex.exec(body)) !== null) {
    faqs.push({
      q: m[1].trim(),
      a: m[2].trim(),
    });
  }
  return faqs;
}

function applyInternalLinks(text, links, serviceSlug) {
  let result = text;
  for (const [phrase, href] of Object.entries(links)) {
    // Resolve to root-absolute extensionless URLs (what Cloudflare serves)
    let resolvedHref = href;
    if (href.startsWith('/services/')) {
      const parts = href.replace('/services/', '').split('/');
      if (parts.length === 2) {
        // location page, e.g. /services/ev-charger-installation/woodstock-vt
        resolvedHref = `/services/${parts[0]}/${parts[1]}`;
      } else if (parts.length === 1) {
        // service index link → main site services section
        resolvedHref = `/#services`;
      }
    } else if (href === '/contact') {
      resolvedHref = '/#contact';
    }
    result = result.replace(
      new RegExp(phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'),
      `<a href="${resolvedHref}" style="color:var(--orange);text-decoration:none;border-bottom:1px solid rgba(232,130,12,0.35);transition:border-color 0.2s">${phrase}</a>`
    );
  }
  return result;
}

function renderBody(text, links, serviceSlug) {
  // Convert markdown-ish body to HTML paragraphs
  // Handle bold **text**
  const withLinks = applyInternalLinks(text, links, serviceSlug);
  const lines = withLinks.split('\n');
  const html = [];
  let inList = false;
  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) {
      if (inList) { html.push('</ul>'); inList = false; }
      continue;
    }
    if (line === '---') continue;
    // Bold intro lines like **Wiring & Rewiring** — description
    if (line.startsWith('**') && line.includes('**')) {
      if (inList) { html.push('</ul>'); inList = false; }
      const boldProcessed = line.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
      html.push(`<p class="seo-body-p">${boldProcessed}</p>`);
    } else if (line.startsWith('- ') || line.startsWith('* ')) {
      if (!inList) { html.push('<ul class="seo-list">'); inList = true; }
      html.push(`<li>${line.slice(2).replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')}</li>`);
    } else {
      if (inList) { html.push('</ul>'); inList = false; }
      const processed = line.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
      html.push(`<p class="seo-body-p">${processed}</p>`);
    }
  }
  if (inList) html.push('</ul>');
  return html.join('\n');
}

function generateHTML(meta, serviceSlug, locationSlug) {
  const serviceLabel = SERVICE_LABELS[serviceSlug] || serviceSlug;
  const townLabel = slugToLabel(locationSlug);
  const canonical = `https://prospervalleyelectric.com/services/${serviceSlug}/${locationSlug}`;

  // Append the town-specific bonus FAQ (unique per town) to the visible list
  const profile = TOWN_PROFILES[locationSlug];
  if (profile && meta.faq) {
    meta.faq = meta.faq.concat([{ q: profile.q, a: profile.a }]);
  }

  // Inject the bonus FAQ into the FAQPage JSON-LD, and add a BreadcrumbList schema
  const schemaStrings = meta.schemas.map(s => {
    if (profile && s.includes('"FAQPage"')) {
      try {
        const obj = JSON.parse(s);
        obj.mainEntity.push({
          '@type': 'Question',
          name: profile.q,
          acceptedAnswer: { '@type': 'Answer', text: profile.a },
        });
        return JSON.stringify(obj, null, 2);
      } catch (e) { return s; }
    }
    return s;
  });
  const breadcrumbSchema = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://prospervalleyelectric.com/' },
      { '@type': 'ListItem', position: 2, name: 'Service Areas', item: 'https://prospervalleyelectric.com/service-areas' },
      { '@type': 'ListItem', position: 3, name: `${serviceLabel} in ${townLabel}`, item: canonical },
    ],
  }, null, 2);
  schemaStrings.push(breadcrumbSchema);

  const schemasHTML = schemaStrings.map(s => `<script type="application/ld+json">\n${s}\n</script>`).join('\n');

  // Cross-links to the other services in this same town (internal link mesh)
  const otherServices = SERVICES.filter(s => s !== serviceSlug)
    .map(s => `<a href="/services/${s}/${locationSlug}">${SERVICE_LABELS[s]} in ${townLabel}</a>`)
    .join('');

  const sectionsHTML = meta.sections.map(s => `
    <section class="seo-section">
      <div class="container">
        <h2 class="seo-h2">${escapeHTML(s.title)}</h2>
        <div class="seo-body">
          ${renderBody(s.body, meta.internalLinks, serviceSlug)}
        </div>
      </div>
    </section>`).join('');

  const faqHTML = meta.faq && meta.faq.length ? `
    <section class="seo-faq">
      <div class="container">
        <div class="section-label">Common Questions</div>
        <h2 class="seo-h2">Frequently Asked Questions</h2>
        <div class="faq-list">
          ${meta.faq.map((item, i) => `
          <div class="faq-item" id="faq-${i}">
            <button class="faq-q" onclick="toggleFaq(${i})" aria-expanded="false">
              <span>${escapeHTML(item.q)}</span>
              <svg class="faq-chevron" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path d="M6 9l6 6 6-6"/></svg>
            </button>
            <div class="faq-a" id="faq-a-${i}">
              <p>${escapeHTML(item.a)}</p>
            </div>
          </div>`).join('')}
        </div>
      </div>
    </section>` : '';

  const openingHTML = renderBody(meta.opening, meta.internalLinks, serviceSlug);
  const guide = GUIDE_FOR_SERVICE[serviceSlug];
  const guideLinkHTML = guide
    ? `<a class="guide-link" href="/guides/${guide.slug}"><svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M12 6.5C10.5 5.5 8.5 5 6 5a1 1 0 00-1 1v11a1 1 0 001 1c2.5 0 4.5.5 6 1.5 1.5-1 3.5-1.5 6-1.5a1 1 0 001-1V6a1 1 0 00-1-1c-2.5 0-4.5.5-6 1.5zm0 0V19"/></svg><span>Read our guide: <strong>${escapeHTML(guide.label)}</strong></span></a>`
    : '';

  // Sibling location links for footer
  const siblingLinks = LOCATIONS
    .filter(l => l !== locationSlug)
    .map(l => `<a href="/services/${serviceSlug}/${l}">${slugToLabel(l)}</a>`)
    .join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${escapeHTML(meta.title)}</title>
<meta name="description" content="${escapeHTML(meta.description)}">
<link rel="canonical" href="https://prospervalleyelectric.com/services/${serviceSlug}/${locationSlug}">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;600;700;800;900&family=Barlow:wght@300;400;500;600&family=DM+Serif+Display:ital@0;1&display=swap" rel="stylesheet">
${schemasHTML}
<style>
  :root {
    --orange: #E8820C;
    --orange-dark: #C46D08;
    --orange-light: #F5A03A;
    --orange-glow: rgba(232,130,12,0.13);
    --charcoal: #181818;
    --charcoal-mid: #222222;
    --charcoal-light: #2C2C2C;
    --charcoal-border: #333333;
    --warm-white: #FAFAF8;
    --gray-100: #F2F1EE;
    --gray-200: #E4E2DC;
    --gray-400: #9A9690;
    --gray-600: #5E5A54;
    --white: #FFFFFF;
    --font-display: 'Barlow Condensed', sans-serif;
    --font-body: 'Barlow', sans-serif;
    --font-serif: 'DM Serif Display', serif;
    --nav-h: 88px;
    --radius: 5px;
    --transition: 0.22s cubic-bezier(0.4, 0, 0.2, 1);
  }
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html { scroll-behavior: smooth; font-size: 16px; }
  body { font-family: var(--font-body); background: var(--warm-white); color: var(--charcoal); -webkit-font-smoothing: antialiased; overflow-x: hidden; }

  /* NAV */
  nav { position: fixed; top: 0; left: 0; right: 0; height: var(--nav-h); background: var(--charcoal); display: flex; align-items: center; justify-content: center; padding: 0 32px; z-index: 1000; border-bottom: 2px solid var(--orange); transition: box-shadow 0.3s, background 0.3s; }
  .nav-inner { width: 100%; max-width: 1120px; display: flex; align-items: center; justify-content: space-between; }
  nav.scrolled { background: rgba(24,24,24,0.97); box-shadow: 0 4px 48px rgba(0,0,0,0.6); backdrop-filter: blur(12px); }
  .nav-logo { display: flex; align-items: center; gap: 14px; text-decoration: none; }
  .nav-logo-img { width: 62px; height: 62px; flex-shrink: 0; border-radius: 50%; object-fit: cover; border: 2px solid rgba(232,130,12,0.35); transition: border-color var(--transition); }
  .nav-logo:hover .nav-logo-img { border-color: var(--orange); }
  .nav-logo-text { font-family: var(--font-display); font-weight: 800; font-size: 1.2rem; letter-spacing: 0.06em; color: var(--white); line-height: 1.1; text-transform: uppercase; }
  .nav-logo-text span { color: var(--orange); display: block; font-size: 1rem; font-weight: 800; letter-spacing: 0.14em; margin-top: 1px; }
  .nav-right { display: flex; align-items: center; gap: 6px; }
  .nav-links { display: flex; align-items: center; gap: 2px; list-style: none; margin-right: 8px; }
  .nav-links a { font-family: var(--font-display); font-weight: 600; font-size: 0.88rem; letter-spacing: 0.1em; text-transform: uppercase; color: rgba(255,255,255,0.65); text-decoration: none; padding: 10px 16px; border-radius: var(--radius); transition: color var(--transition); }
  .nav-links a:hover { color: var(--white); }
  .nav-cta { display: inline-flex; align-items: center; gap: 8px; background: var(--orange); color: var(--white); font-family: var(--font-display); font-weight: 700; font-size: 0.85rem; letter-spacing: 0.1em; text-transform: uppercase; padding: 11px 22px; border-radius: var(--radius); text-decoration: none; transition: background var(--transition), transform var(--transition), box-shadow var(--transition); }
  .nav-cta:hover { background: var(--orange-dark); transform: translateY(-1px); box-shadow: 0 6px 20px rgba(232,130,12,0.4); }
  .hamburger { display: none; flex-direction: column; gap: 5px; cursor: pointer; padding: 8px; background: none; border: none; }
  .hamburger span { display: block; width: 26px; height: 2px; background: var(--white); transition: all 0.3s; transform-origin: center; }
  .hamburger.open span:nth-child(1) { transform: translateY(7px) rotate(45deg); }
  .hamburger.open span:nth-child(2) { opacity: 0; }
  .hamburger.open span:nth-child(3) { transform: translateY(-7px) rotate(-45deg); }
  .mobile-menu { display: none; position: fixed; top: var(--nav-h); left: 0; right: 0; background: rgba(24,24,24,0.98); backdrop-filter: blur(16px); border-top: 1px solid var(--charcoal-light); z-index: 999; padding: 8px 0 24px; }
  .mobile-menu.open { display: block; }
  .mobile-menu a { display: flex; align-items: center; font-family: var(--font-display); font-weight: 700; font-size: 1.4rem; letter-spacing: 0.06em; text-transform: uppercase; color: var(--white); text-decoration: none; padding: 16px 28px; border-bottom: 1px solid var(--charcoal-light); transition: color var(--transition), padding-left var(--transition); }
  .mobile-menu a:hover { color: var(--orange); padding-left: 36px; }

  /* PAGE HERO */
  .page-hero { background: var(--charcoal); padding: calc(var(--nav-h) + 72px) 32px 72px; text-align: center; position: relative; overflow: hidden; }
  .page-hero::before { content: ''; position: absolute; inset: 0; background: radial-gradient(ellipse at center bottom, rgba(232,130,12,0.08) 0%, transparent 65%); pointer-events: none; }
  .page-hero::after { content: ''; position: absolute; bottom: 0; left: 0; right: 0; height: 2px; background: linear-gradient(90deg, transparent, var(--orange), transparent); }
  .hero-breadcrumb { font-family: var(--font-display); font-size: 0.7rem; letter-spacing: 0.2em; text-transform: uppercase; color: rgba(255,255,255,0.3); margin-bottom: 20px; }
  .hero-breadcrumb a { color: rgba(255,255,255,0.4); text-decoration: none; transition: color var(--transition); }
  .hero-breadcrumb a:hover { color: var(--orange); }
  .hero-breadcrumb span { color: rgba(232,130,12,0.6); margin: 0 8px; }
  .page-hero h1 { font-family: var(--font-display); font-weight: 900; font-size: clamp(2.4rem, 6vw, 4.2rem); text-transform: uppercase; color: var(--white); line-height: 0.96; letter-spacing: -0.01em; margin-bottom: 22px; text-wrap: balance; position: relative; }
  .page-hero .hero-sub { font-size: 1.05rem; color: rgba(255,255,255,0.45); max-width: 560px; margin: 0 auto; line-height: 1.65; position: relative; }
  .hero-badge { display: inline-flex; align-items: center; gap: 10px; background: rgba(232,130,12,0.1); border: 1px solid rgba(232,130,12,0.3); color: var(--orange-light); font-family: var(--font-display); font-weight: 700; font-size: 0.7rem; letter-spacing: 0.2em; text-transform: uppercase; padding: 6px 16px; border-radius: 2px; margin-bottom: 28px; position: relative; }
  .hero-badge::before { content: ''; width: 5px; height: 5px; background: var(--orange); border-radius: 50%; animation: blink 2s ease-in-out infinite; }
  @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.2} }

  /* LAYOUT */
  section { padding: 80px 32px; }
  .container { max-width: 1120px; margin: 0 auto; }
  .section-label { font-family: var(--font-display); font-weight: 700; font-size: 0.68rem; letter-spacing: 0.28em; text-transform: uppercase; color: var(--orange); margin-bottom: 14px; display: flex; align-items: center; gap: 12px; }
  .section-label::before { content: ''; display: block; width: 36px; height: 2px; background: var(--orange); flex-shrink: 0; }

  /* INTRO SECTION */
  .seo-intro { background: var(--white); border-bottom: 1px solid var(--gray-200); }
  .seo-intro .container { display: grid; grid-template-columns: 2fr 1fr; gap: 72px; align-items: start; }
  .seo-intro-text { }
  .seo-intro-aside { position: sticky; top: calc(var(--nav-h) + 28px); }
  .aside-card { background: var(--charcoal); border-radius: 8px; overflow: hidden; border: 1px solid var(--charcoal-border); }
  .aside-card-top { background: var(--orange); padding: 28px 28px 24px; position: relative; overflow: hidden; }
  .aside-card-top::before { content: ''; position: absolute; inset: 0; background: repeating-linear-gradient(-55deg, transparent, transparent 18px, rgba(0,0,0,0.04) 18px, rgba(0,0,0,0.04) 19px); }
  .aside-card-top h3 { font-family: var(--font-display); font-weight: 900; font-size: 1.3rem; color: var(--white); letter-spacing: 0.04em; text-transform: uppercase; line-height: 1.2; position: relative; }
  .aside-card-top p { font-size: 0.88rem; color: rgba(255,255,255,0.75); margin-top: 6px; position: relative; line-height: 1.5; }
  .aside-card-body { padding: 24px 28px; }
  .aside-card-body .aside-stat { display: flex; align-items: center; gap: 14px; padding: 14px 0; border-bottom: 1px solid var(--charcoal-border); }
  .aside-card-body .aside-stat:last-child { border-bottom: none; }
  .aside-stat-icon { width: 36px; height: 36px; background: var(--orange-glow); border: 1px solid rgba(232,130,12,0.2); border-radius: 4px; display: flex; align-items: center; justify-content: center; color: var(--orange); flex-shrink: 0; }
  .aside-stat-text { font-size: 0.88rem; color: rgba(255,255,255,0.55); line-height: 1.4; }
  .aside-stat-text strong { color: var(--white); font-weight: 600; display: block; }
  .aside-cta { display: flex; align-items: center; justify-content: center; gap: 8px; background: var(--orange); color: var(--white); font-family: var(--font-display); font-weight: 700; font-size: 0.88rem; letter-spacing: 0.1em; text-transform: uppercase; padding: 16px 24px; text-decoration: none; transition: background var(--transition); margin: 20px 28px 28px; border-radius: var(--radius); }
  .aside-cta:hover { background: var(--orange-dark); }

  /* CONTENT SECTIONS */
  .seo-section { padding: 72px 32px; border-bottom: 1px solid var(--gray-200); background: var(--warm-white); }
  .seo-section:nth-child(even) { background: var(--white); }
  .seo-h2 { font-family: var(--font-display); font-weight: 900; font-size: clamp(1.8rem, 4vw, 2.8rem); text-transform: uppercase; color: var(--charcoal); line-height: 1; letter-spacing: -0.01em; margin-bottom: 28px; text-wrap: balance; }
  .seo-h2::after { content: ''; display: block; width: 48px; height: 3px; background: var(--orange); margin-top: 14px; }
  .seo-body { max-width: 760px; }
  .seo-body-p { font-size: 1.02rem; line-height: 1.8; color: var(--gray-600); margin-bottom: 18px; }
  .seo-body-p strong { color: var(--charcoal); font-weight: 600; }
  .seo-list { list-style: none; margin: 12px 0 18px; display: flex; flex-direction: column; gap: 10px; }
  .seo-list li { display: flex; align-items: flex-start; gap: 12px; font-size: 0.98rem; color: var(--gray-600); line-height: 1.55; }
  .seo-list li::before { content: ''; display: block; width: 6px; height: 6px; background: var(--orange); border-radius: 50%; flex-shrink: 0; margin-top: 7px; }

  /* FAQ */
  .seo-faq { background: var(--charcoal); padding: 80px 32px; }
  .seo-faq .seo-h2 { color: var(--white); }
  .faq-list { max-width: 760px; margin-top: 36px; }
  .faq-item { border-bottom: 1px solid var(--charcoal-border); }
  .faq-q { width: 100%; display: flex; align-items: center; justify-content: space-between; gap: 16px; background: none; border: none; padding: 22px 0; cursor: pointer; text-align: left; font-family: var(--font-body); font-size: 1rem; font-weight: 600; color: var(--white); transition: color var(--transition); }
  .faq-q:hover { color: var(--orange); }
  .faq-q[aria-expanded="true"] { color: var(--orange); }
  .faq-chevron { flex-shrink: 0; transition: transform 0.3s; color: var(--orange); opacity: 0.7; }
  .faq-q[aria-expanded="true"] .faq-chevron { transform: rotate(180deg); }
  .faq-a { display: none; padding: 0 0 22px; }
  .faq-a.open { display: block; }
  .faq-a p { font-size: 0.97rem; line-height: 1.75; color: rgba(255,255,255,0.5); }

  /* CONTEXTUAL GUIDE LINK */
  .guide-link { display: flex; align-items: center; gap: 12px; margin-top: 24px; padding: 16px 20px; background: var(--orange-glow); border: 1px solid rgba(232,130,12,0.25); border-radius: var(--radius); text-decoration: none; color: var(--charcoal); transition: border-color var(--transition), background var(--transition); }
  .guide-link:hover { border-color: var(--orange); background: rgba(232,130,12,0.16); }
  .guide-link svg { color: var(--orange); flex-shrink: 0; }
  .guide-link span { font-size: 0.95rem; line-height: 1.4; color: var(--gray-600); }
  .guide-link strong { color: var(--charcoal); font-weight: 600; }

  /* MORE SERVICES (same-town cross-links) */
  .more-services { background: var(--warm-white); padding: 72px 32px; border-bottom: 1px solid var(--gray-200); }
  .more-services .container { max-width: 1120px; margin: 0 auto; }
  .more-services-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-top: 28px; }
  .more-services-grid a { display: flex; align-items: center; justify-content: space-between; gap: 12px; background: var(--white); border: 1px solid var(--gray-200); border-radius: 6px; padding: 18px 20px; text-decoration: none; color: var(--charcoal); font-family: var(--font-display); font-weight: 700; font-size: 0.98rem; letter-spacing: 0.02em; text-transform: uppercase; line-height: 1.15; transition: transform var(--transition), box-shadow var(--transition), border-color var(--transition); }
  .more-services-grid a::after { content: '→'; color: var(--orange); font-size: 1.1rem; transition: transform var(--transition); }
  .more-services-grid a:hover { transform: translateY(-3px); box-shadow: 0 10px 28px rgba(0,0,0,0.08); border-color: rgba(232,130,12,0.3); }
  .more-services-grid a:hover::after { transform: translateX(3px); }
  @media (max-width: 760px) { .more-services-grid { grid-template-columns: 1fr; } }

  /* CTA BANNER */
  .cta-banner { background: var(--orange); padding: 88px 32px; text-align: center; position: relative; overflow: hidden; }
  .cta-banner::before { content: ''; position: absolute; inset: 0; background: repeating-linear-gradient(-55deg, transparent, transparent 22px, rgba(0,0,0,0.03) 22px, rgba(0,0,0,0.03) 23px); }
  .cta-banner::after { content: ''; position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 800px; height: 400px; background: radial-gradient(ellipse, rgba(255,255,255,0.1) 0%, transparent 65%); pointer-events: none; }
  .cta-banner h2 { font-family: var(--font-display); font-weight: 900; font-size: clamp(2rem, 5vw, 3.5rem); text-transform: uppercase; color: var(--white); letter-spacing: -0.01em; line-height: 1; margin-bottom: 14px; position: relative; z-index: 1; text-wrap: balance; }
  .cta-banner p { color: rgba(255,255,255,0.82); font-size: 1.05rem; margin-bottom: 36px; position: relative; z-index: 1; max-width: 520px; margin-left: auto; margin-right: auto; }
  .btn-dark { display: inline-flex; align-items: center; gap: 10px; background: var(--charcoal); color: var(--white); font-family: var(--font-display); font-weight: 700; font-size: 0.95rem; letter-spacing: 0.1em; text-transform: uppercase; padding: 18px 38px; border: 2px solid var(--charcoal); border-radius: var(--radius); text-decoration: none; transition: background var(--transition), transform var(--transition), box-shadow var(--transition); position: relative; z-index: 1; }
  .btn-dark:hover { background: #0a0a0a; transform: translateY(-2px); box-shadow: 0 10px 28px rgba(0,0,0,0.35); }

  /* FOOTER */
  footer { background: var(--charcoal); color: rgba(255,255,255,0.38); padding: 0 32px 80px; position: relative; }
  footer::before { content: ''; display: block; height: 3px; background: linear-gradient(90deg, var(--orange) 0%, var(--orange-light) 50%, var(--orange) 100%); margin-bottom: 56px; }
  .footer-grid { max-width: 1120px; margin: 0 auto; display: grid; grid-template-columns: 1.6fr 1fr 1fr; gap: 56px; padding-bottom: 40px; border-bottom: 1px solid var(--charcoal-border); margin-bottom: 24px; }
  .footer-brand p { font-size: 0.92rem; line-height: 1.7; margin-top: 16px; max-width: 290px; color: rgba(255,255,255,0.38); }
  .footer-col h4 { font-family: var(--font-display); font-weight: 700; font-size: 0.7rem; letter-spacing: 0.22em; text-transform: uppercase; color: rgba(255,255,255,0.7); margin-bottom: 16px; padding-bottom: 10px; border-bottom: 1px solid var(--charcoal-border); }
  .footer-col a { display: block; font-size: 0.9rem; color: rgba(255,255,255,0.38); text-decoration: none; margin-bottom: 10px; transition: color var(--transition), padding-left var(--transition); }
  .footer-col a:hover { color: var(--orange); padding-left: 4px; }
  .footer-col p { font-size: 0.9rem; line-height: 1.7; }
  .footer-service-areas { max-width: 1120px; margin: 0 auto 32px; }
  .footer-service-areas h4 { font-family: var(--font-display); font-weight: 700; font-size: 0.7rem; letter-spacing: 0.22em; text-transform: uppercase; color: rgba(255,255,255,0.4); margin-bottom: 14px; }
  .footer-area-links { display: flex; flex-wrap: wrap; gap: 8px; }
  .footer-area-links a { font-size: 0.8rem; color: rgba(255,255,255,0.3); text-decoration: none; padding: 4px 10px; border: 1px solid var(--charcoal-border); border-radius: 3px; transition: color var(--transition), border-color var(--transition); }
  .footer-area-links a:hover { color: var(--orange); border-color: rgba(232,130,12,0.4); }
  .footer-bottom { max-width: 1120px; margin: 0 auto; display: flex; justify-content: space-between; align-items: center; font-size: 0.82rem; flex-wrap: wrap; gap: 8px; }
  .footer-bottom span { color: rgba(232,130,12,0.7); }

  /* STICKY MOBILE BAR */
  .sticky-bar { display: none; position: fixed; bottom: 0; left: 0; right: 0; background: rgba(24,24,24,0.97); backdrop-filter: blur(16px); border-top: 2px solid var(--orange); z-index: 900; padding: 12px 16px; padding-bottom: calc(12px + env(safe-area-inset-bottom)); gap: 10px; }
  .sticky-bar a { flex: 1; display: flex; align-items: center; justify-content: center; gap: 8px; font-family: var(--font-display); font-weight: 700; font-size: 0.88rem; letter-spacing: 0.1em; text-transform: uppercase; text-decoration: none; padding: 14px 8px; border-radius: var(--radius); transition: opacity var(--transition); }
  .sticky-call { background: transparent; color: var(--white); border: 1.5px solid rgba(255,255,255,0.2); }
  .sticky-estimate { background: var(--orange); color: var(--white); border: 1.5px solid var(--orange); }

  /* RESPONSIVE */
  @media (max-width: 860px) {
    .nav-links, .nav-cta { display: none; }
    .hamburger { display: flex; }
    .seo-intro .container { grid-template-columns: 1fr; gap: 40px; }
    .seo-intro-aside { position: static; }
    .footer-grid { grid-template-columns: 1fr 1fr; gap: 40px; }
    .sticky-bar { display: flex; }
    body { padding-bottom: calc(80px + env(safe-area-inset-bottom)); }
  }
  @media (max-width: 560px) {
    .footer-grid { grid-template-columns: 1fr; }
    section, .seo-section { padding: 56px 20px; }
    .cta-banner { padding: 64px 20px; }
  }
</style>
</head>
<body>

<nav id="navbar">
  <div class="nav-inner">
    <a class="nav-logo" href="/">
      <img class="nav-logo-img" src="/pve-circle-logo.jpg" alt="Prosper Valley Electric">
      <div class="nav-logo-text">Prosper Valley<span>Electric</span></div>
    </a>
    <div class="nav-right">
      <ul class="nav-links">
        <li><a href="/">Home</a></li>
        <li><a href="/#services">Services</a></li>
        <li><a href="/service-areas">Service Areas</a></li>
        <li><a href="/#about">About</a></li>
      </ul>
      <a class="nav-cta" href="/#contact">
        <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path d="M9 12h6m-3-3v6M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
        Request Estimate
      </a>
    </div>
    <button class="hamburger" id="hamburger" onclick="toggleMenu()" aria-label="Menu">
      <span></span><span></span><span></span>
    </button>
  </div>
</nav>

<div class="mobile-menu" id="mobileMenu">
  <a href="/">Home</a>
  <a href="/#services">Services</a>
  <a href="/service-areas">Service Areas</a>
  <a href="/#about">About</a>
  <a href="/#contact" style="color:var(--orange)">Request Estimate</a>
</div>

<!-- PAGE HERO -->
<div class="page-hero">
  <div class="hero-breadcrumb">
    <a href="/">Prosper Valley Electric</a>
    <span>›</span>
    <a href="/service-areas">${escapeHTML(serviceLabel)}</a>
    <span>›</span>
    ${escapeHTML(slugToLabel(locationSlug))}
  </div>
  <div class="hero-badge">${escapeHTML(serviceLabel)}</div>
  <h1>${escapeHTML(meta.h1)}</h1>
  <p class="hero-sub">Licensed, locally based electricians serving ${escapeHTML(slugToLabel(locationSlug))} and the Upper Valley. Written estimates, proper permits, no surprises.</p>
</div>

<!-- INTRO -->
<section class="seo-intro">
  <div class="container">
    <div class="seo-intro-text">
      <div class="section-label">${escapeHTML(serviceLabel)}</div>
      ${openingHTML}
      ${guideLinkHTML}
    </div>
    <div class="seo-intro-aside">
      <div class="aside-card">
        <div class="aside-card-top">
          <h3>Request a Free Estimate</h3>
          <p>Serving ${escapeHTML(slugToLabel(locationSlug))} and the Upper Valley</p>
        </div>
        <div class="aside-card-body">
          <div class="aside-stat">
            <div class="aside-stat-icon">
              <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24"><path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>
            </div>
            <div class="aside-stat-text"><strong>(802) 234-9636</strong>Call anytime</div>
          </div>
          <div class="aside-stat">
            <div class="aside-stat-icon">
              <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            </div>
            <div class="aside-stat-text"><strong>Licensed in VT & NH</strong>Fully permitted & insured</div>
          </div>
          <div class="aside-stat">
            <div class="aside-stat-icon">
              <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>
            </div>
            <div class="aside-stat-text"><strong>Written Estimates</strong>No surprises on the invoice</div>
          </div>
        </div>
        <a class="aside-cta" href="/#contact">
          Request Estimate
          <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
        </a>
      </div>
    </div>
  </div>
</section>

${sectionsHTML}

${faqHTML}

<!-- MORE SERVICES IN THIS TOWN -->
<section class="more-services">
  <div class="container">
    <div class="section-label">More in ${escapeHTML(townLabel)}</div>
    <h2 class="seo-h2">Our Other Services in ${escapeHTML(townLabel)}</h2>
    <div class="more-services-grid">
      ${otherServices}
    </div>
  </div>
</section>

<!-- CTA BANNER -->
<div class="cta-banner">
  <h2>Ready to Get Started?</h2>
  <p>${escapeHTML(meta.ctaText) || `Prosper Valley Electric serves ${escapeHTML(slugToLabel(locationSlug))} and the surrounding Upper Valley. Locally based, licensed in VT &amp; NH.`}</p>
  <a class="btn-dark" href="/#contact">
    Request Estimate Now
    <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
  </a>
</div>

<footer>
  <div class="footer-grid">
    <div class="footer-brand">
      <div style="font-family:var(--font-display);font-weight:800;font-size:1.2rem;letter-spacing:0.06em;text-transform:uppercase;color:white">Prosper Valley <span style="color:var(--orange)">Electric</span></div>
      <p>Locally owned and operated electrical contractor serving Vermont and New Hampshire. Est. 2020.</p>
    </div>
    <div class="footer-col">
      <h4>Services</h4>
      <a href="/#services">New Construction Wiring</a>
      <a href="/#services">Remodels &amp; Renovations</a>
      <a href="/#services">Generator Installation</a>
      <a href="/#services">EV Chargers</a>
      <a href="/#services">Panel Upgrades</a>
      <a href="/#services">Smart Home &amp; Lighting</a>
    </div>
    <div class="footer-col">
      <h4>Company</h4>
      <a href="/">Home</a>
      <a href="/#about">About Us</a>
      <a href="/#contact">Contact</a>
      <a href="/#contact">Request Estimate</a>
      <h4 style="margin-top:20px">Contact</h4>
      <a href="tel:+18022349636">(802) 234-9636</a>
      <a href="mailto:prospervalleyelectric@gmail.com">prospervalleyelectric@gmail.com</a>
    </div>
  </div>
  <div class="footer-service-areas">
    <h4>${escapeHTML(serviceLabel)} — Other Locations</h4>
    <div class="footer-area-links">
      ${siblingLinks}
    </div>
  </div>
  <div class="footer-bottom">
    <span style="color:rgba(255,255,255,0.28)">&copy; 2025 Prosper Valley Electric. All rights reserved.</span>
    <span>Vermont &amp; New Hampshire</span>
  </div>
</footer>

<div class="sticky-bar" id="stickyBar">
  <a class="sticky-call" href="tel:+18022349636">
    <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>
    Call Now
  </a>
  <a class="sticky-estimate" href="/#contact">
    <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
    Get Estimate
  </a>
</div>

<script>
  // Nav scroll effect
  window.addEventListener('scroll', () => {
    document.getElementById('navbar').classList.toggle('scrolled', window.scrollY > 40);
  });

  // Mobile menu
  function toggleMenu() {
    const btn = document.getElementById('hamburger');
    const menu = document.getElementById('mobileMenu');
    const open = menu.classList.toggle('open');
    btn.classList.toggle('open', open);
    document.body.style.overflow = open ? 'hidden' : '';
  }

  // FAQ accordion
  function toggleFaq(i) {
    const btn = document.querySelector('#faq-' + i + ' .faq-q');
    const ans = document.getElementById('faq-a-' + i);
    const isOpen = ans.classList.toggle('open');
    btn.setAttribute('aria-expanded', isOpen);
  }
</script>
</body>
</html>`;
}

function slugToLabel(slug) {
  const map = {
    'barnard-vt': 'Barnard, VT',
    'hanover-nh': 'Hanover, NH',
    'hartford-vt': 'Hartford, VT',
    'hartland-vt': 'Hartland, VT',
    'killington-vt': 'Killington, VT',
    'lebanon-nh': 'Lebanon, NH',
    'norwich-vt': 'Norwich, VT',
    'pomfret-vt': 'Pomfret, VT',
    'quechee-vt': 'Quechee, VT',
    'reading-vt': 'Reading, VT',
    'sharon-vt': 'Sharon, VT',
    'white-river-junction-vt': 'White River Junction, VT',
    'windsor-vt': 'Windsor, VT',
    'woodstock-vt': 'Woodstock, VT',
  };
  return map[slug] || slug;
}

function escapeHTML(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// Generate all pages
let generated = 0;
let errors = 0;
const pageUrls = [];

for (const service of SERVICES) {
  for (const location of LOCATIONS) {
    const srcFile = path.join(SRC_BASE, service, `${location}.md`);
    if (!fs.existsSync(srcFile)) {
      console.warn(`  MISSING: ${service}/${location}.md`);
      continue;
    }
    try {
      const src = fs.readFileSync(srcFile, 'utf8');
      const meta = parseMarkdown(src);
      const html = generateHTML(meta, service, location);
      const outFile = path.join(OUT_BASE, service, `${location}.html`);
      fs.writeFileSync(outFile, html, 'utf8');
      pageUrls.push(`/services/${service}/${location}`);
      console.log(`  ✓ ${service}/${location}.html`);
      generated++;
    } catch (err) {
      console.error(`  ✗ ${service}/${location}: ${err.message}`);
      errors++;
    }
  }
}

// ── Sitemap ──────────────────────────────────────────────────────────────
const ROOT_OUT = path.join(OUT_BASE, '..');
const ORIGIN = 'https://prospervalleyelectric.com';
const today = new Date().toISOString().slice(0, 10);
// Static + guide pages (priority hints: home highest, then hubs/guides, then locations)
const staticUrls = [
  { loc: '/', priority: '1.0' },
  { loc: '/service-areas', priority: '0.8' },
  { loc: '/guides/generator-sizing-vermont', priority: '0.7' },
  { loc: '/guides/panel-upgrade-cost-vermont', priority: '0.7' },
];
const urlEntries = [
  ...staticUrls,
  ...pageUrls.map(loc => ({ loc, priority: '0.6' })),
].map(u =>
  `  <url>\n    <loc>${ORIGIN}${u.loc}</loc>\n    <lastmod>${today}</lastmod>\n    <priority>${u.priority}</priority>\n  </url>`
).join('\n');
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urlEntries}\n</urlset>\n`;
fs.writeFileSync(path.join(ROOT_OUT, 'sitemap.xml'), sitemap, 'utf8');
console.log(`\n  ✓ sitemap.xml (${staticUrls.length + pageUrls.length} URLs)`);

console.log(`\nDone: ${generated} pages generated, ${errors} errors.`);
