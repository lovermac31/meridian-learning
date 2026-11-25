-- Migration: 20261126000001_holiday_sets_portal_rows.sql   (NOT APPLIED; for Jay's review)
-- Holiday sets, 28 Nov to 6 Dec 2026 (Jay, 25 Nov 2026: "Yes, go ahead with the holiday sets."): the two sets as portal SKUs.
--
-- WHAT THIS DOES: adds two rows to je_commerce.products and links each to the three products inside it (product_components),
-- so a set can be fulfilled and listed in the portal the same way teacher-bundle is. Both rows start active = false, so
-- NOTHING becomes buyable in the portal by running this. The site sells the sets by VietQR and PayPal with Jay checking each
-- payment by hand; the portal is not part of the sale (PORTAL_BUY_FLAGS has no entry for either id, so it is off).
--
-- THE DATES ARE NOT HERE: the portal has no date window. The window (28 Nov 00:00 to 6 Dec 23:59, Vietnam time) is enforced on
-- the site, by src/config/holidaySets.ts (the page after load, api/sample-pack.ts on the server). If these rows are ever
-- switched on (jec_admin_set_product_active), switch them off again on 7 Dec.
--
-- SAFE TO RUN ANYWHERE: if the je_commerce schema is not in this database the block does nothing. It never touches an
-- existing row or price (insert ... on conflict do nothing). Component links are added only for products that exist in the
-- portal (the portal id of the Level 1 Teacher Pack is 'teacher-pack'; see je_commerce_005_seed_products.sql).
-- Prices mirror src/config/holidaySets.ts: 399.000 VND / US$16 and 1.190.000 VND / US$47.
do $$
begin
  if to_regclass('je_commerce.products') is null or to_regclass('je_commerce.product_components') is null then
    raise notice 'je_commerce.products not found: holiday set rows skipped';
    return;
  end if;

  insert into je_commerce.products (id, legacy_ids, title_en, title_vi, price_vnd, price_usd_cents, licence_scope, term, active)
  values
    ('holiday-reading-set-l1', '{}', 'Holiday Reading Set, Level 1', 'Bộ Đọc sách kỳ nghỉ Level 1',  399000, 1600, 'personal',    'perpetual', false),
    ('teacher-starter-set',    '{}', 'Teacher Starter Set',          'Bộ Khởi đầu cho Giáo viên',     1190000, 4700, 'one_teacher', 'perpetual', false)
  on conflict (id) do nothing;

  insert into je_commerce.product_components (bundle_id, component_id)
  select pair.bundle_id, pair.component_id
    from (values
      ('holiday-reading-set-l1', 'parent-pack-l1'),
      ('holiday-reading-set-l1', 'holiday-reading-challenge'),
      ('holiday-reading-set-l1', 'word-fossil-flashcards-l1'),
      ('teacher-starter-set',    'teacher-pack'),
      ('teacher-starter-set',    'thinking-cycle-set'),
      ('teacher-starter-set',    'reasoning-assessment-kit')
    ) as pair(bundle_id, component_id)
   where exists (select 1 from je_commerce.products p where p.id = pair.component_id)
     and exists (select 1 from je_commerce.products p where p.id = pair.bundle_id)
  on conflict do nothing;
end
$$;
