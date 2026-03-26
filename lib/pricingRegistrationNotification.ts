import type { NormalizedPricingRegistration } from '../src/lib/pricingRegistrationSchema';
import {
  map,
  normaliseBuyerType,
  normaliseMAOI,
  BT_LABELS,
  MAOI_LABELS,
  BT_COLOURS,
  MAOI_COLOURS,
  ALIGNMENT_COLOURS,
  COLOURS,
  type CrmContext,
} from './je-crm-mapper';

type NotificationResult =
  | { status: 'sent' }
  | { status: 'skipped'; reason: string }
  | { status: 'failed'; reason: string };

// ─── HTML Utilities ────────────────────────────────────────────────────────────

function esc(s: string): string {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function pill(label: string, bg: string): string {
  return `<span style="display:inline-block;background:${bg};color:#ffffff;border-radius:20px;padding:3px 10px;font-size:11px;font-weight:700;letter-spacing:0.04em;white-space:nowrap;margin:2px 3px 2px 0;">${esc(label)}</span>`;
}

function kvRow(label: string, value: string): string {
  return `<tr>
    <td style="padding:8px 14px;border-bottom:1px solid #F0F0F0;background:#FAFAFA;font-size:11px;font-weight:600;color:#6B7280;white-space:nowrap;vertical-align:top;width:180px;">${esc(label)}</td>
    <td style="padding:8px 14px;border-bottom:1px solid #F0F0F0;font-size:13px;color:#111120;vertical-align:top;">${value}</td>
  </tr>`;
}

function secLabel(n: number, title: string): string {
  return `<div style="padding:20px 24px 4px;">
    <table cellpadding="0" cellspacing="0" border="0"><tr>
      <td style="font-size:10px;font-weight:700;letter-spacing:0.18em;text-transform:uppercase;color:#F57C00;padding-right:8px;white-space:nowrap;vertical-align:middle;">&sect;${n}</td>
      <td style="font-size:15px;font-weight:700;color:#111120;vertical-align:middle;">${esc(title)}</td>
    </tr></table>
    <div style="height:1px;background:#E5E7EB;margin-top:8px;"></div>
  </div>`;
}

function kvTable(rows: string): string {
  return `<table width="100%" cellpadding="0" cellspacing="0" border="0" style="border:1px solid #E5E7EB;border-radius:10px;overflow:hidden;border-collapse:separate;">${rows}</table>`;
}

// ─── Module Table Renderer ─────────────────────────────────────────────────────

function renderModuleTable(modules: any[]): string {
  if (!modules || modules.length === 0) return '';
  const first = modules[0];
  const hasFormat   = 'format' in first;
  const hasPerEd    = 'perEd' in first;
  const hasScope    = 'scope' in first;
  const hasDiscount = 'discount' in first;

  const th = (t: string) =>
    `<td style="padding:7px 10px;background:#F5F5F5;font-size:11px;font-weight:700;color:#37474F;letter-spacing:0.07em;text-transform:uppercase;border-bottom:2px solid #E0E0E0;">${esc(t)}</td>`;

  let headCols = th('Service');
  if (hasFormat)   headCols += th('Format');
  if (hasScope)    headCols += th('Scope');
  if (hasPerEd)    headCols += th('Per Educator') + th('Group Rate');
  else             headCols += th('Price');
  if (hasDiscount) headCols += th('Volume Discount');

  const bodyRows = modules.map((m: any, i: number) => {
    const bg = i % 2 === 0 ? '#FFFFFF' : '#FAFAFA';
    const td = (v: string) =>
      `<td style="padding:7px 10px;font-size:12px;color:#111120;background:${bg};border-bottom:1px solid #F0F0F0;vertical-align:top;">${esc(v || '—')}</td>`;
    let cols = td(m.name);
    if (hasFormat)   cols += td(m.format ?? '');
    if (hasScope)    cols += td(m.scope ?? '');
    if (hasPerEd)    cols += td(m.perEd ?? '') + td(m.perGroup ?? '');
    else             cols += td(m.price ?? '');
    if (hasDiscount) cols += td(m.discount ?? '');
    return `<tr>${cols}</tr>`;
  }).join('');

  return `<table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;border:1px solid #E0E0E0;border-radius:8px;overflow:hidden;">
    <thead><tr>${headCols}</tr></thead>
    <tbody>${bodyRows}</tbody>
  </table>`;
}

// ─── 8-Section CRM Email Builder ──────────────────────────────────────────────

export function buildCrmIntakeEmail(
  registration: NormalizedPricingRegistration,
  ctx: CrmContext
): string {
  const btColour    = BT_COLOURS[ctx.buyerType.key];
  const maoiColour  = MAOI_COLOURS[ctx.maoi.key];
  const alignColour = ALIGNMENT_COLOURS[ctx.alignment.status];
  const C = COLOURS;

  // §1 Lead Snapshot
  const sec1 = `
  ${secLabel(1, 'Lead Snapshot')}
  <div style="padding:0 24px 16px;">
    <table width="100%" cellpadding="0" cellspacing="0" border="0">
      <tr>
        <td style="width:50%;padding-right:8px;vertical-align:top;">
          <div style="background:#FAFAFA;border:1px solid #E5E7EB;border-radius:10px;padding:12px 16px;margin-bottom:10px;">
            <div style="font-size:10px;text-transform:uppercase;letter-spacing:0.14em;color:#9CA3AF;font-weight:600;">Registration ID</div>
            <div style="margin-top:5px;font-family:monospace;font-size:13px;font-weight:700;color:#F57C00;">${esc(ctx.registrationId)}</div>
          </div>
          <div style="background:#FAFAFA;border:1px solid #E5E7EB;border-radius:10px;padding:12px 16px;">
            <div style="font-size:10px;text-transform:uppercase;letter-spacing:0.14em;color:#9CA3AF;font-weight:600;">Submitted At</div>
            <div style="margin-top:5px;font-size:12px;color:#374151;">${esc(registration.submittedAt)}</div>
          </div>
        </td>
        <td style="width:50%;padding-left:8px;vertical-align:top;">
          <div style="background:#FAFAFA;border:1px solid #E5E7EB;border-radius:10px;padding:12px 16px;margin-bottom:10px;">
            <div style="font-size:10px;text-transform:uppercase;letter-spacing:0.14em;color:#9CA3AF;font-weight:600;margin-bottom:5px;">Lead Status</div>
            ${pill('New', C.green)}
          </div>
          <div style="background:#FAFAFA;border:1px solid #E5E7EB;border-radius:10px;padding:12px 16px;">
            <div style="font-size:10px;text-transform:uppercase;letter-spacing:0.14em;color:#9CA3AF;font-weight:600;margin-bottom:5px;">Alignment</div>
            ${pill(ctx.alignment.label, alignColour)}
          </div>
        </td>
      </tr>
    </table>
    <div style="margin-top:10px;">
      <table cellpadding="0" cellspacing="0" border="0"><tr>
        <td style="padding-right:16px;vertical-align:top;">
          <div style="font-size:10px;text-transform:uppercase;letter-spacing:0.12em;color:#9CA3AF;font-weight:600;margin-bottom:4px;">Buyer Type</div>
          ${pill(ctx.buyerType.label, btColour)}
        </td>
        <td style="vertical-align:top;">
          <div style="font-size:10px;text-transform:uppercase;letter-spacing:0.12em;color:#9CA3AF;font-weight:600;margin-bottom:4px;">Main Area of Interest</div>
          ${pill(ctx.maoi.label, maoiColour)}
        </td>
      </tr></table>
    </div>
  </div>`;

  // §2 Contact Details
  const sec2 = `
  ${secLabel(2, 'Contact Details')}
  <div style="padding:0 24px 16px;">
    ${kvTable(`
      ${kvRow('Full Name', `<strong>${esc(registration.fullName)}</strong>`)}
      ${kvRow('Work Email', `<a href="mailto:${esc(registration.workEmail)}" style="color:#1565C0;text-decoration:none;">${esc(registration.workEmail)}</a>`)}
      ${kvRow('Role / Title', esc(registration.roleTitle))}
      ${kvRow('Organisation', esc(registration.organizationName))}
      ${kvRow('Country / Region', esc(registration.countryRegion))}
      ${registration.phoneWhatsapp ? kvRow('Phone / WhatsApp', esc(registration.phoneWhatsapp)) : ''}
      ${registration.preferredContactMethod ? kvRow('Preferred Contact', esc(registration.preferredContactMethod.replace(/_/g, ' '))) : ''}
    `)}
  </div>`;

  // §3 Buyer Alignment
  const primaryPills   = ctx.primaryMaois.map(k => pill(MAOI_LABELS[k], MAOI_COLOURS[k])).join(' ') || '<em style="color:#9CA3AF;">None defined</em>';
  const secondaryPills = ctx.secondaryMaois.map(k => pill(MAOI_LABELS[k], MAOI_COLOURS[k])).join(' ') || '<em style="color:#9CA3AF;">None defined</em>';

  const sec3 = `
  ${secLabel(3, 'Buyer Alignment')}
  <div style="padding:0 24px 16px;">
    ${kvTable(`
      ${kvRow('Primary Areas', primaryPills)}
      ${kvRow('Secondary Areas', secondaryPills)}
      ${kvRow('Current Selection', pill(ctx.alignment.label, alignColour))}
      ${kvRow('Source Reference', `<span style="font-family:monospace;font-size:11px;color:#6B7280;">${esc(ctx.sourceRef)}</span>`)}
    `)}
  </div>`;

  // §4 Service + Pricing Match
  const service = ctx.service as any;
  const sec4 = `
  ${secLabel(4, 'Service + Pricing Match')}
  <div style="padding:0 24px 16px;">
    <div style="margin-bottom:10px;">
      <span style="font-size:14px;font-weight:700;color:#111120;">${esc(service.label ?? ctx.maoi.label)}</span>
      &nbsp;<span style="font-size:12px;color:#6B7280;">${esc(service.rangeSummary ?? '')}</span>
    </div>
    ${renderModuleTable(service.modules ?? [])}
    ${service.note ? `<div style="margin-top:8px;font-size:12px;color:#6B7280;font-style:italic;padding:8px 12px;background:#FAFAFA;border-radius:6px;border-left:3px solid #E5E7EB;">${esc(service.note)}</div>` : ''}
  </div>`;

  // §5 Recommended Next Step
  const sec5 = `
  ${secLabel(5, 'Recommended Next Step')}
  <div style="padding:0 24px 16px;">
    <div style="border-left:4px solid #F57C00;background:#FFF8F0;border-radius:0 10px 10px 0;padding:14px 18px;margin-bottom:14px;">
      <div style="font-size:10px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:#F57C00;margin-bottom:6px;">CTA</div>
      <div style="font-size:14px;color:#111120;line-height:1.6;">${esc(ctx.cta)}</div>
    </div>
    <div style="font-size:11px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:#9CA3AF;margin-bottom:8px;">Engagement Process</div>
    ${ctx.engagementProcess.map((step, i) =>
      `<div style="font-size:12px;color:#374151;padding:4px 0;"><span style="color:#F57C00;font-weight:700;margin-right:6px;">${i + 1}.</span>${esc(step)}</div>`
    ).join('')}
  </div>`;

  // §6 Notes / Context
  const sec6 = `
  ${secLabel(6, 'Notes / Context')}
  <div style="padding:0 24px 16px;">
    ${kvTable(`
      ${kvRow('Organisation Size', esc(registration.organizationSize || 'Not provided'))}
      ${kvRow('Timeline', esc(registration.timeline || 'Not provided'))}
      ${kvRow('Message / Notes', `<div style="white-space:pre-wrap;line-height:1.6;color:#374151;">${esc(registration.message || 'Not provided')}</div>`)}
    `)}
  </div>`;

  // §7 CRM Tags
  const tagPills = Object.entries(ctx.crmTags)
    .map(([k, v]) =>
      `<span style="display:inline-block;background:#F3F4F6;border:1px solid #E5E7EB;border-radius:6px;padding:3px 8px;font-family:monospace;font-size:10px;color:#374151;margin:2px 3px 2px 0;line-height:1.5;"><span style="color:#9CA3AF;">${esc(k)}:</span>&nbsp;${esc(String(v))}</span>`
    ).join('');

  const sec7 = `
  ${secLabel(7, 'CRM Tags')}
  <div style="padding:0 24px 16px;">
    <div style="background:#FAFAFA;border:1px solid #E5E7EB;border-radius:10px;padding:14px 16px;line-height:2.2;">
      ${tagPills}
    </div>
  </div>`;

  // §8 CRM Fields — Structured Record
  const crmFieldDefs: [string, string][] = [
    ['buyer_type',       ctx.buyerType.key],
    ['buyer_type_label', ctx.buyerType.label],
    ['maoi',             ctx.maoi.key],
    ['maoi_label',       ctx.maoi.label],
    ['alignment',        ctx.alignment.status],
    ['alignment_label',  ctx.alignment.label],
    ['registration_id',  ctx.registrationId],
    ['lead_status',      ctx.crmTags.lead_status ?? 'New'],
    ['pricing_band',     ctx.crmTags.pricing_band ?? ''],
    ['next_step',        ctx.crmTags.next_step ?? ''],
    ['source_ref',       ctx.sourceRef],
    ['submitted_at',     ctx.crmTags.submitted_at ?? registration.submittedAt],
  ];

  const fieldRows = crmFieldDefs.map(([k, v], i) => {
    const bg = i % 2 === 0 ? '#FFFFFF' : '#FAFAFA';
    return `<tr>
      <td style="padding:8px 14px;border-bottom:1px solid #F0F0F0;background:${bg};font-family:monospace;font-size:11px;color:#6B7280;white-space:nowrap;vertical-align:top;width:180px;">${esc(k)}</td>
      <td style="padding:8px 14px;border-bottom:1px solid #F0F0F0;background:${bg};font-size:12px;color:#111120;vertical-align:top;word-break:break-word;">${esc(v)}</td>
    </tr>`;
  }).join('');

  const sec8 = `
  ${secLabel(8, 'CRM Fields &mdash; Structured Record')}
  <div style="padding:0 24px 20px;">
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border:1px solid #E5E7EB;border-radius:10px;overflow:hidden;border-collapse:separate;">
      ${fieldRows}
    </table>
  </div>`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>JE CRM Intake &mdash; ${esc(registration.fullName)}</title>
</head>
<body style="margin:0;padding:0;background:#EFF3F7;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#EFF3F7;padding:28px 0;">
    <tr><td align="center" style="padding:0 16px;">
      <table width="700" cellpadding="0" cellspacing="0" border="0" style="max-width:700px;width:100%;background:#FFFFFF;border-radius:20px;overflow:hidden;border:1px solid #DDE3EA;">

        <!-- Header -->
        <tr>
          <td style="background:#101521;padding:28px 32px 24px;">
            <div style="font-size:10px;font-weight:700;letter-spacing:0.2em;text-transform:uppercase;color:#F57C00;margin-bottom:8px;">INTERNAL CRM INTAKE &middot; PLANS &amp; PRICING</div>
            <div style="font-size:22px;font-weight:700;color:#FFFFFF;line-height:1.3;margin-bottom:6px;">${esc(registration.fullName)}</div>
            <div style="font-size:13px;color:#94A3B8;">${esc(registration.organizationName)} &middot; ${esc(registration.roleTitle)} &middot; ${esc(registration.countryRegion)}</div>
          </td>
        </tr>

        <!-- Body -->
        <tr><td>${sec1}${sec2}${sec3}${sec4}${sec5}${sec6}${sec7}${sec8}</td></tr>

        <!-- Footer -->
        <tr>
          <td style="padding:16px 24px;background:#F8FAFC;border-top:1px solid #E5E7EB;">
            <div style="font-size:11px;color:#9CA3AF;text-align:center;line-height:1.6;">
              Automated intake record &middot; Jurassic English&trade; Plans &amp; Pricing<br>
              Source: JE-BT-MAOI-Alignment-2026 &middot; World Wise Learning Ltd
            </div>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`.trim();
}

// ─── Notification Sender ───────────────────────────────────────────────────────

export async function sendPricingRegistrationNotification(
  registration: NormalizedPricingRegistration
): Promise<NotificationResult> {
  const resendApiKey = process.env.RESEND_API_KEY;
  const notifyEmail =
    process.env.PRICING_NOTIFY_EMAIL ||
    process.env.GET_STARTED_NOTIFY_EMAIL ||
    'info@jurassicenglish.com';
  const fromEmail =
    process.env.PRICING_FROM_EMAIL ||
    process.env.GET_STARTED_FROM_EMAIL ||
    'Jurassic English <onboarding@jurassicenglish.com>';

  if (!resendApiKey) {
    return { status: 'skipped', reason: 'Notification transport is not configured.' };
  }

  const btKey   = normaliseBuyerType(registration.buyerType);
  const maoiKey = normaliseMAOI(registration.interestArea);
  const ctx     = map(btKey, maoiKey);

  const subject = `New Plans & Pricing Registration — ${registration.fullName} | ${registration.organizationName} | ${ctx.buyerType.label}`;
  const html    = buildCrmIntakeEmail(registration, ctx);

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [notifyEmail],
        reply_to: registration.workEmail,
        subject,
        html,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return {
        status: 'failed',
        reason: `Resend request failed: ${response.status} ${errorText}`,
      };
    }

    return { status: 'sent' };
  } catch (error: any) {
    return {
      status: 'failed',
      reason: error?.message || 'Unknown notification transport error.',
    };
  }
}
