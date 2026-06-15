#!/usr/bin/env node
// Generates localized markdown source files for new service-area towns
// by adapting the Woodstock template for each service. PVE's HQ references
// (based in Woodstock, business address) are preserved; the target town,
// local context, and internal links are swapped per town.
// Usage: node add-towns.js

const fs = require('fs');
const path = require('path');

const SRC_BASE = '/Users/macmini/Downloads/prosper-valley-seo-pages';
const TEMPLATE_LOCATION = 'woodstock-vt';

const SERVICES = [
  'ev-charger-installation',
  'residential-electrical',
  'commercial-electrical',
  'panel-upgrades',
  'generator-installation',
  'smart-home-lighting',
];

const HQ_DESCRIPTOR = 'Woodstock, VT — our home base in the heart of Windsor County';
const HQ_ADDRESS = '"addressLocality": "Woodstock"';
const AREA_ARRAY = '"Hanover, NH","Lebanon, NH","Woodstock, VT","White River Junction, VT","Hartford, VT","Norwich, VT","Windsor, VT","Quechee, VT","Hartland, VT","Barnard, VT"';

const TOWNS = [
  {
    slug: 'pomfret-vt',
    name: 'Pomfret',
    descriptor: 'just minutes south in the heart of Windsor County',
    localPara: "Pomfret is one of the most scenic rural towns in Windsor County, just north of our Woodstock home base. Its rolling hills, dirt roads, and working farms draw visitors from all over — Cloudland Road and the view across Sleepy Hollow Farm are some of the most photographed spots in Vermont. Pomfret homes range from historic hillside farmhouses to newer country properties, often set well back from the road on private wells. Rural properties like these frequently have long service runs and older wiring, and we know how to work with them.",
    nearby: [['Woodstock, VT', 'woodstock-vt'], ['Barnard, VT', 'barnard-vt'], ['Hartford, VT', 'hartford-vt']],
  },
  {
    slug: 'sharon-vt',
    name: 'Sharon',
    descriptor: 'a short drive south in Windsor County',
    localPara: "Sharon sits along the White River where I-89 runs through the Upper Valley. The town is best known as the birthplace of Joseph Smith, marked by the granite memorial off Route 14, and today Sharon is a mix of riverside homes, hillside farms, and properties strung along the Route 14 corridor. Many Sharon homes are older and rural, on private well and septic, which often means aging electrical systems that benefit from an upgrade. We've worked on properties of every age and type throughout this part of the valley.",
    nearby: [['Norwich, VT', 'norwich-vt'], ['Hartford, VT', 'hartford-vt'], ['White River Junction, VT', 'white-river-junction-vt']],
  },
  {
    slug: 'reading-vt',
    name: 'Reading',
    descriptor: 'just north in the heart of Windsor County',
    localPara: "Reading is a quiet rural town just south of Woodstock, made up of the village of Felchville and the farms and country homes spread across its hills. It's home to the historic Hammond Covered Bridge and the Hall Art Foundation galleries, and like much of this corner of Windsor County, Reading's properties tend to be spread out and on private wells. Older homes here often run on undersized or aging electrical service, and we bring the same careful, code-compliant approach to every one of them.",
    nearby: [['Woodstock, VT', 'woodstock-vt'], ['Windsor, VT', 'windsor-vt'], ['Hartland, VT', 'hartland-vt']],
  },
  {
    slug: 'killington-vt',
    name: 'Killington',
    descriptor: 'just east along the Route 4 corridor',
    localPara: "Killington, west of Woodstock along Route 4, is home to the largest ski resort in the eastern United States — the “Beast of the East.” The local housing reflects that: slope-side condos, ski chalets, and vacation homes that often sit empty for stretches of the season. At elevation along the Route 4 corridor, Killington also sees some of the harshest weather and longest power outages in the region, which makes reliable backup power and remotely monitored electrical systems especially valuable. Whether it's a year-round residence or a second home you visit on weekends, we treat it like our own.",
    nearby: [['Woodstock, VT', 'woodstock-vt'], ['Barnard, VT', 'barnard-vt'], ['Hartland, VT', 'hartland-vt']],
  },
];

function transform(template, town, service) {
  let s = template;

  // 1. Protect HQ references that must stay "Woodstock"
  if (!s.includes(HQ_DESCRIPTOR)) throw new Error(`HQ descriptor not found in ${service}`);
  s = s.split(HQ_DESCRIPTOR).join('@@BASE@@');
  s = s.split(HQ_ADDRESS).join('"addressLocality": "@@HQ@@"');
  s = s.split(AREA_ARRAY).join('@@AREA@@');

  // 2. Global swap of the target town (name + url slug)
  s = s.split('Woodstock').join(town.name);
  s = s.split(TEMPLATE_LOCATION).join(town.slug);

  // 3. Restore protected HQ references
  s = s.split('@@BASE@@').join(`Woodstock, VT — ${town.descriptor}`);
  s = s.split('@@HQ@@').join('Woodstock');
  s = s.split('@@AREA@@').join(AREA_ARRAY);

  // 4. Replace the "Serving X Homeowners and Businesses" body with unique local content
  const localBlock = `${town.localPara}\n\nWe also serve nearby communities: ${town.nearby.map(n => n[0]).join(', ')}, and the rest of the Upper Valley.`;
  const localRe = new RegExp(`(### H2: Serving ${town.name} Homeowners and Businesses\\n\\n)([\\s\\S]*?)(\\n\\n---)`);
  if (!localRe.test(s)) throw new Error(`Local section not found in ${service}/${town.slug}`);
  s = s.replace(localRe, (m, a, b, c) => a + localBlock + c);

  // 5. Rewrite the nearby-town internal linking instructions to match this town
  const navRe = /- "Quechee, VT" → `[^`]+`\n- "Hartland, VT" → `[^`]+`\n- "Barnard, VT" → `[^`]+`/;
  const newLinks = town.nearby.map(n => `- "${n[0]}" → \`/services/${service}/${n[1]}\``).join('\n');
  if (!navRe.test(s)) throw new Error(`Internal link block not found in ${service}/${town.slug}`);
  s = s.replace(navRe, newLinks);

  return s;
}

let count = 0;
for (const service of SERVICES) {
  const templatePath = path.join(SRC_BASE, service, `${TEMPLATE_LOCATION}.md`);
  const template = fs.readFileSync(templatePath, 'utf8');
  for (const town of TOWNS) {
    const out = transform(template, town, service);
    const outPath = path.join(SRC_BASE, service, `${town.slug}.md`);
    fs.writeFileSync(outPath, out, 'utf8');
    console.log(`  ✓ ${service}/${town.slug}.md`);
    count++;
  }
}
console.log(`\nGenerated ${count} markdown files for ${TOWNS.length} new towns.`);
