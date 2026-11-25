-- Rollback for 20261126000001_holiday_sets_portal_rows.sql (NOT APPLIED).
-- Removes only the two holiday-set rows and their component links; no existing product is touched.
-- If an order, entitlement or other row already references a set (a foreign key), the delete stops with an error and
-- changes nothing: in that case switch the set off instead (update je_commerce.products set active = false where id in
-- ('holiday-reading-set-l1', 'teacher-starter-set')) and keep the row for the record.
do $$
begin
  if to_regclass('je_commerce.products') is null or to_regclass('je_commerce.product_components') is null then
    raise notice 'je_commerce.products not found: nothing to roll back';
    return;
  end if;
  delete from je_commerce.product_components where bundle_id in ('holiday-reading-set-l1', 'teacher-starter-set');
  delete from je_commerce.products where id in ('holiday-reading-set-l1', 'teacher-starter-set');
end
$$;
