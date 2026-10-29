#!/usr/bin/env node
import process from "node:process";

const targets = {
  storefront: process.env.STOREFRONT_URL,
  admin: process.env.ADMIN_URL,
  asset: process.env.PRIVATE_ASSET_URL,
};

for (const arg of process.argv.slice(2)) {
  const match = arg.match(/^--(storefront|admin|asset)=(.+)$/);
  if (!match) {
    console.error(`Unknown argument: ${arg}`);
    process.exit(2);
  }
  targets[match[1]] = match[2];
}

const requested = Object.entries(targets).filter(([, url]) => url);

if (requested.length === 0) {
  console.error(
    [
      "Usage: node scripts/security/check-deployed-headers.mjs \\",
      "  --storefront=https://www.forma.example \\",
      "  --admin=https://admin.forma.example \\",
      "  --asset=https://www.forma.example/api/private-assets/<id>",
      "",
      "The same values can be supplied as STOREFRONT_URL, ADMIN_URL, and",
      "PRIVATE_ASSET_URL. At least one target is required.",
    ].join("\n"),
  );
  process.exit(2);
}

const redact = (url) => {
  try {
    const parsed = new URL(url);
    parsed.search = "";
    parsed.hash = "";
    return parsed.toString();
  } catch {
    return "<invalid URL>";
  }
};

let passed = 0;
let failed = 0;

const check = (name, condition, detail) => {
  if (condition) {
    passed += 1;
    console.log(`PASS  ${name}`);
    return;
  }

  failed += 1;
  console.log(`FAIL  ${name}`);
  if (detail) console.log(`      ${detail}`);
  if (process.env.GITHUB_ACTIONS === "true") {
    console.log(
      `::error title=Deployed header check failed::${name}: ${detail ?? ""}`,
    );
  }
};

const header = (headers, name) => headers.get(name)?.trim() ?? "";
const includes = (value, needle) =>
  value.toLowerCase().includes(needle.toLowerCase());

const checkBaseline = (label, headers, { admin = false } = {}) => {
  const csp = header(headers, "content-security-policy");
  const scriptSrc = csp.match(/script-src[^;]*/i)?.[0] ?? "";

  check(`${label}: CSP present`, csp.length > 0);
  check(
    `${label}: CSP default-src 'self'`,
    includes(csp, "default-src 'self'"),
  );
  check(`${label}: CSP object-src 'none'`, includes(csp, "object-src 'none'"));
  check(`${label}: CSP base-uri 'none'`, includes(csp, "base-uri 'none'"));
  check(
    `${label}: CSP form-action 'self'`,
    includes(csp, "form-action 'self'"),
  );
  check(
    `${label}: CSP frame-ancestors 'none'`,
    includes(csp, "frame-ancestors 'none'"),
  );
  check(
    `${label}: CSP upgrade-insecure-requests`,
    includes(csp, "upgrade-insecure-requests"),
  );
  check(
    `${label}: CSP script-src present`,
    scriptSrc.length > 0,
    csp || "missing CSP",
  );

  if (admin) {
    check(
      `${label}: CSP script-src has no unsafe-inline`,
      scriptSrc.length > 0 && !includes(scriptSrc, "'unsafe-inline'"),
      scriptSrc || "missing script-src",
    );
  } else {
    check(
      `${label}: CSP script-src strict-dynamic`,
      includes(scriptSrc, "'strict-dynamic'"),
      scriptSrc || "missing script-src",
    );
    check(
      `${label}: CSP frame-src Stripe`,
      includes(csp, "frame-src https://js.stripe.com"),
    );
  }

  const hsts = header(headers, "strict-transport-security");
  const maxAge = Number(hsts.match(/max-age=(\d+)/i)?.[1] ?? 0);
  check(
    `${label}: HSTS max-age >= 63072000`,
    maxAge >= 63072000,
    hsts || "missing",
  );
  check(
    `${label}: HSTS includeSubDomains`,
    includes(hsts, "includeSubDomains"),
    hsts || "missing",
  );

  check(
    `${label}: X-Content-Type-Options nosniff`,
    header(headers, "x-content-type-options").toLowerCase() === "nosniff",
  );
  check(
    `${label}: Referrer-Policy strict-origin-when-cross-origin`,
    header(headers, "referrer-policy").toLowerCase() ===
      "strict-origin-when-cross-origin",
  );
  check(
    `${label}: Cross-Origin-Opener-Policy same-origin`,
    header(headers, "cross-origin-opener-policy").toLowerCase() ===
      "same-origin",
  );

  const permissions = header(headers, "permissions-policy");
  for (const directive of ["camera=()", "microphone=()", "geolocation=()"]) {
    check(
      `${label}: Permissions-Policy ${directive}`,
      includes(permissions, directive),
      permissions || "missing",
    );
  }
  check(
    `${label}: Permissions-Policy payment`,
    includes(permissions, "payment=(self") &&
      includes(permissions, "https://js.stripe.com"),
    permissions || "missing",
  );
};

const checkAsset = (headers) => {
  const csp = header(headers, "content-security-policy");
  const cache = header(headers, "cache-control");

  check(
    "asset: CSP default-src none",
    includes(csp, "default-src 'none'"),
    csp || "missing",
  );
  check(
    "asset: CSP img-src self",
    includes(csp, "img-src 'self'"),
    csp || "missing",
  );
  check(
    "asset: X-Content-Type-Options nosniff",
    header(headers, "x-content-type-options").toLowerCase() === "nosniff",
  );
  check(
    "asset: Referrer-Policy no-referrer",
    header(headers, "referrer-policy").toLowerCase() === "no-referrer",
  );
  check(
    "asset: Cache-Control private",
    includes(cache, "private"),
    cache || "missing",
  );
  check(
    "asset: Cache-Control no-store",
    includes(cache, "no-store"),
    cache || "missing",
  );
};

const fetchTarget = async (label, url) => {
  const response = await fetch(url, {
    redirect: "follow",
    headers: { "user-agent": "forma-header-check/1.0" },
  });

  check(
    `${label}: HTTP 2xx`,
    response.status >= 200 && response.status < 300,
    `HTTP ${response.status}`,
  );

  const requestedUrl = new URL(url);
  const finalUrl = new URL(response.url);
  check(
    `${label}: no cross-origin redirect`,
    requestedUrl.origin === finalUrl.origin,
    `${requestedUrl.origin} -> ${finalUrl.origin}`,
  );

  return response.headers;
};

for (const [label, url] of requested) {
  console.log(`\n${label}: ${redact(url)}`);
  try {
    const headers = await fetchTarget(label, url);
    if (label === "storefront") checkBaseline("storefront", headers);
    if (label === "admin") checkBaseline("admin", headers, { admin: true });
    if (label === "asset") checkAsset(headers);
  } catch (error) {
    check(`${label}: fetch`, false, error.message);
  }
}

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exitCode = 1;
