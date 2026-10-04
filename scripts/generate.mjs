import { mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const ASSETS = path.join(ROOT, 'assets')
const README = path.join(ROOT, 'README.md')
const readJson = (file) => JSON.parse(readFileSync(path.join(ROOT, 'data', file), 'utf8'))

const profile = readJson('profile.json')
const projects = readJson('projects.json')

const MONO = "'JetBrains Mono','Cascadia Code','Fira Code',Consolas,'DejaVu Sans Mono',monospace"
const SANS = "Inter,'Segoe UI',Helvetica,Arial,sans-serif"
const C = {
  comment: '#7d8fa8',
  string: '#10b981',
  keyword: '#60a5fa',
  variable: '#ec4899',
  semi: '#4a5b7a',
  text: '#cbd5e1',
  white: '#ffffff',
}

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

const css = `
  text{font-family:${MONO}}
  .sans{font-family:${SANS}}
  .pulse{animation:pulse 2.4s ease-in-out infinite;transform-box:fill-box;transform-origin:center}
  @keyframes pulse{50%{opacity:.35;transform:scale(1.6)}}
  @media (prefers-reduced-motion:reduce){.pulse{animation:none}}
`

const defs = `
  <linearGradient id="card" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#151e2c"/><stop offset="1" stop-color="#111827"/></linearGradient>
  <linearGradient id="grad" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#3b82f6"/><stop offset="1" stop-color="#06b6d4"/></linearGradient>
  <linearGradient id="icon" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#3b82f6"/><stop offset="1" stop-color="#0891b2"/></linearGradient>
  <linearGradient id="line" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#3b4d69" stop-opacity="0"/><stop offset=".5" stop-color="#3b4d69" stop-opacity=".6"/><stop offset="1" stop-color="#3b4d69" stop-opacity="0"/></linearGradient>
  <linearGradient id="glowline" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#3b82f6" stop-opacity="0"/><stop offset=".35" stop-color="#3b82f6" stop-opacity=".8"/><stop offset=".65" stop-color="#06b6d4" stop-opacity=".8"/><stop offset="1" stop-color="#06b6d4" stop-opacity="0"/></linearGradient>
  <filter id="blur" x="-200%" y="-200%" width="500%" height="500%"><feGaussianBlur stdDeviation="4"/></filter>
`

const svg = (w, h, body) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" fill="none">
<defs>${defs}<style>${css}</style></defs>
${body}
</svg>
`

/** Window chrome matching the site's `.code-block` + `.linux-titlebar`. */
const win = (x, y, w, h, title) => `
<g transform="translate(${x} ${y})">
  <rect x=".5" y=".5" width="${w - 1}" height="${h - 1}" rx="12" fill="url(#card)" stroke="#2d3a54"/>
  <path d="M1 32V13a12 12 0 0 1 12-12h${w - 26}a12 12 0 0 1 12 12v19z" fill="#2c394f"/>
  <path d="M1 32.5h${w - 2}" stroke="#3b4d69"/>
  <text x="14" y="21" font-size="12" fill="#fff">${esc(title)}</text>
  <g transform="translate(${w - 62} 10)">
    <rect width="12" height="12" rx="2" fill="#fbbf24"/><rect x="20" width="12" height="12" rx="2" fill="#10b981"/><rect x="40" width="12" height="12" rx="2" fill="#ef4444"/>
    <g font-size="9" font-weight="700" fill="#0f172a" fill-opacity=".5" text-anchor="middle"><text x="6" y="9.5">−</text><text x="26" y="9.5">□</text><text x="46" y="9.5">×</text></g>
  </g>
</g>`

const write = (file, content) => writeFileSync(path.join(ASSETS, file), content)

const wrap = (text, max) => {
  const lines = []
  let cur = ''
  for (const word of text.split(' ')) {
    if ((cur + ' ' + word).trim().length > max) {
      lines.push(cur)
      cur = word
    } else cur = (cur + ' ' + word).trim()
  }
  lines.push(cur)
  return lines
}

mkdirSync(ASSETS, { recursive: true })

write(
  'header.svg',
  svg(880, 270, `
${win(10, 6, 860, 252, `~/${profile.handle}/README.md`)}
<text x="440" y="94" font-size="15" text-anchor="middle" fill="${C.comment}">// Hey there, I'm</text>
<text class="sans" x="440" y="152" font-size="50" font-weight="700" text-anchor="middle" fill="url(#grad)">${esc(profile.name)}</text>
<text x="440" y="188" font-size="16" text-anchor="middle" fill="${C.keyword}">@${esc(profile.handle)}</text>
<text x="440" y="228" font-size="14" text-anchor="middle" fill="${C.comment}">/* ${esc(profile.tagline)} */</text>
`),
)

const section = (file, title, subtitle) =>
  write(
    `${file}.svg`,
    svg(880, 104, `
<text x="440" y="48" font-size="28" font-weight="700" text-anchor="middle"><tspan fill="${C.comment}">// </tspan><tspan fill="url(#grad)">${esc(title)}</tspan></text>
<text x="440" y="80" font-size="13" text-anchor="middle" fill="${C.comment}">/* ${esc(subtitle)} */</text>
`),
  )

section('title-about', 'About me', 'Get to know me a little more!')
section('title-focus', 'Current focus', 'What I am up to right now')
section('title-stack', 'Tech stack', 'The tools I reach for')
section('title-projects', 'Projects', 'A selection of my most outstanding projects')
section('title-stats', 'Stats & activity', 'Numbers and streaks')

write(
  'divider.svg',
  svg(880, 64, `
<rect x="0" y="31" width="880" height="2" fill="url(#line)"/>
<rect x="290" y="31" width="300" height="2" fill="url(#glowline)"/>
<circle class="pulse" cx="440" cy="32" r="5" fill="#3b82f6" filter="url(#blur)"/>
<circle cx="440" cy="32" r="3" fill="#3b82f6"/>
`),
)

const years = Math.floor((Date.now() - Date.parse(profile.codingSince)) / (365.25 * 86_400_000))
const tile = (x, y, icon, label, value) => `
<g transform="translate(${x} ${y})">
  <rect width="394" height="76" rx="8" fill="#1e293b" fill-opacity=".5"/>
  <text x="197" y="30" font-size="13" text-anchor="middle"><tspan fill="#3b82f6">${esc(icon)} </tspan><tspan fill="${C.text}" font-family="${SANS}">${esc(label)}</tspan></text>
  <text x="197" y="58" font-size="16" text-anchor="middle"><tspan fill="${C.string}">"</tspan><tspan fill="${C.white}">${esc(value)}</tspan><tspan fill="${C.string}">"</tspan><tspan fill="${C.semi}">;</tspan></text>
</g>`

const bioY = 274
write(
  'about.svg',
  svg(880, 346, `
${win(10, 6, 860, 330, '~/about/developer.md')}
${tile(38, 66, '●', 'Role', profile.role)}
${tile(448, 66, '◷', 'Experience', `${years}+ years`)}
${tile(38, 158, '</>', 'Stack', profile.stack)}
${tile(448, 158, '▸', 'Building', profile.building)}
<g font-size="13">
${profile.bio
  .map(
    (line, i) =>
      `<text x="40" y="${bioY + i * 30}" fill="#334155">${i + 1}</text><text x="68" y="${bioY + i * 30}" fill="${C.text}" font-family="${SANS}">${esc(line)}</text>`,
  )
  .join('\n')}
</g>
`),
)

const focusStep = 34
const focusH = 70 + profile.focus.length * focusStep
write(
  'focus.svg',
  svg(880, focusH + 12, `
${win(10, 6, 860, focusH, '~/focus/now.js')}
${profile.focus
  .map(
    (f, i) =>
      `<text x="40" y="${84 + i * focusStep}" font-size="14"><tspan fill="${C.keyword}">const </tspan><tspan fill="${C.variable}">${esc(f.key)}</tspan><tspan fill="${C.white}"> = </tspan><tspan fill="${C.string}">"${esc(f.value)}"</tspan><tspan fill="${C.semi}">;</tspan></text>`,
  )
  .join('\n')}
`),
)

const wrapAt = 44
const maxLines = Math.max(...projects.map((p) => wrap(p.description, wrapAt).length))
const badgeY = 138 + (maxLines - 1) * 20 + 24
const cardH = badgeY + 22 + 30

const badge = (x, y, label) => {
  const w = label.length * 7 + 16
  return {
    w,
    svg: `<g transform="translate(${x} ${y})"><rect width="${w}" height="22" rx="5" stroke="#475569"/><text x="${w / 2}" y="15" font-size="11" text-anchor="middle" fill="${C.text}">${esc(label)}</text></g>`,
  }
}

for (const old of readdirSync(ASSETS).filter((f) => f.startsWith('project-'))) rmSync(path.join(ASSETS, old))

for (const p of projects) {
  const lines = wrap(p.description, wrapAt)
  const b1 = badge(32, badgeY, p.kind)
  const b2 = badge(32 + b1.w + 8, badgeY, p.linkLabel)
  write(
    `project-${p.id}.svg`,
    svg(430, cardH + 4, `
${win(2, 2, 426, cardH, `~/projects/${p.org}/${p.id}.md`)}
<rect x="32" y="64" width="40" height="40" rx="8" fill="url(#icon)"/>
<text class="sans" x="52" y="91" font-size="20" font-weight="700" text-anchor="middle" fill="#fff">${esc(p.name[0])}</text>
<text x="86" y="90" font-size="18" font-weight="700" fill="#fff">${esc(p.name)}</text>
${lines.map((l, i) => `<text x="32" y="${138 + i * 20}" font-size="12.5" fill="${C.text}">${esc(l)}</text>`).join('\n')}
${b1.svg}${b2.svg}
`),
  )
}

const cells = projects.map(
  (p) =>
    `    <td width="50%"><a href="${p.url}"><img src="assets/project-${p.id}.svg" alt="${esc(p.name)}" width="100%"/></a></td>`,
)
const grid = []
for (let i = 0; i < cells.length; i += 2) {
  grid.push(`  <tr>\n${cells[i]}\n${cells[i + 1] ?? '    <td width="50%"></td>'}\n  </tr>`)
}
const block = `<!-- projects:start -->\n<table width="100%">\n${grid.join('\n')}\n</table>\n<!-- projects:end -->`

const readme = readFileSync(README, 'utf8')
const markers = /<!-- projects:start -->[\s\S]*<!-- projects:end -->/
if (!markers.test(readme)) throw new Error('README.md is missing the projects markers')
writeFileSync(README, readme.replace(markers, () => block))

console.log(`Generated ${projects.length} projects`)
