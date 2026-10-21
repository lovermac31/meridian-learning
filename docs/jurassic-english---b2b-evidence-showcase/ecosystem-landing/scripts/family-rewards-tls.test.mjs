// Family Rewards database TLS: proof that db() verifies the Supabase server
// certificate. Needs network access to the Supabase pooler.
// Run: npm run test:family-rewards-tls
//
// The live checks connect as fr_app with a deliberately WRONG password, so no
// secret is involved and nothing is read or written. Only the good-CA check
// reaches authentication (one failed sign-in per run); the others stop at TLS.

import { test } from "node:test";
import assert from "node:assert/strict";
import { X509Certificate } from "node:crypto";
import { rootCertificates } from "node:tls";
import pg from "pg";
import { poolConfig, SUPABASE_ROOT_CA } from "../src/lib/familyRewards/server/dbConfig.ts";

const FINGERPRINT = "80:70:25:AD:50:D4:ED:21:9D:2C:9C:7D:29:9C:00:4F:82:4E:B0:0C:F7:F6:5A:FE:F6:07:D0:7B:72:E6:CA:FA";
const HOST = "aws-1-ap-northeast-2.pooler.supabase.com";
// Same shape as the production value, including the release stopgap parameters.
const WRONG_PASSWORD_URL = `postgres://fr_app.hvuohtenmsqlsqrbgveg:deliberately-wrong-password@${HOST}:5432/postgres?uselibpqcompat=true&sslmode=require`;
const TLS_FAILURE = /SELF_SIGNED_CERT_IN_CHAIN|UNABLE_TO_GET_ISSUER_CERT|UNABLE_TO_VERIFY_LEAF_SIGNATURE|self[- ]signed certificate|unable to get (local )?issuer/i;

/** Connect once and return the error (a connection must not succeed with a wrong password). */
async function connectError(config) {
  const client = new pg.Client({ ...config, connectionTimeoutMillis: 15_000 });
  client.on("error", () => {});
  try {
    await client.connect();
    await client.end();
    return null;
  } catch (error) {
    await client.end().catch(() => {});
    return error;
  }
}

test("committed CA is the Supabase Root 2021 CA", () => {
  const cert = new X509Certificate(SUPABASE_ROOT_CA);
  assert.equal(cert.fingerprint256, FINGERPRINT);
  assert.match(cert.subject, /CN=Supabase Root 2021 CA/);
  assert.equal(cert.subject, cert.issuer);
  assert.ok(cert.ca);
});

test("remote URLs lose every TLS parameter and get CA verification", () => {
  const config = poolConfig(`${WRONG_PASSWORD_URL}&sslrootcert=/tmp/x.crt&ssl=true&application_name=fr`);
  const url = new URL(config.connectionString);
  for (const name of ["ssl", "sslmode", "uselibpqcompat", "sslrootcert"]) assert.equal(url.searchParams.has(name), false, name);
  assert.equal(url.searchParams.get("application_name"), "fr");
  assert.equal(url.hostname, HOST);
  assert.deepEqual(config.ssl, { ca: SUPABASE_ROOT_CA, rejectUnauthorized: true });
});

test("loopback URLs are used as given (local development and the proof suite)", () => {
  for (const host of ["127.0.0.1", "localhost", "[::1]"]) {
    const url = `postgres://fr_app:x@${host}:54329/fr?sslmode=disable`;
    assert.deepEqual(poolConfig(url), { connectionString: url });
  }
});

test("live: with the Supabase CA the TLS handshake succeeds and only the password is refused", async () => {
  const error = await connectError(poolConfig(WRONG_PASSWORD_URL));
  assert.ok(error, "a wrong password must not connect");
  console.info(`  good CA  -> ${error.code ?? ""} ${error.message}`);
  assert.doesNotMatch(error.message, TLS_FAILURE);
  assert.match(error.message, /password authentication failed/i);
});

test("live: with a wrong CA the server certificate is rejected", async () => {
  const wrongCa = rootCertificates.find((pem) => /ISRG Root X1/.test(new X509Certificate(pem).subject)) ?? rootCertificates[0];
  const error = await connectError(poolConfig(WRONG_PASSWORD_URL, wrongCa));
  assert.ok(error, "a wrong CA must not connect");
  console.info(`  wrong CA -> ${error.code ?? ""} ${error.message}`);
  assert.match(`${error.code} ${error.message}`, TLS_FAILURE);
});

test("live: without the CA (the release failure) the server certificate is rejected", async () => {
  const { connectionString } = poolConfig(WRONG_PASSWORD_URL);
  const error = await connectError({ connectionString, ssl: { rejectUnauthorized: true } });
  assert.ok(error, "an untrusted chain must not connect");
  console.info(`  no CA    -> ${error.code ?? ""} ${error.message}`);
  assert.match(`${error.code} ${error.message}`, TLS_FAILURE);
});
