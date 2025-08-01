-- Drop the function if it already exists
drop function if exists update_target_count();

-- Create a function to update the target count
create or replace function update_target_count()
returns trigger as $$
begin
  if tg_op = 'DELETE' then
    update public.target_lists 
    set target_count = (
      select count(*) 
      from public.targets 
      where list_id = old.list_id
    ),
    updated_at = now()
    where id = old.list_id;
    return old;
  else
    update public.target_lists 
    set target_count = (
      select count(*) 
      from public.targets 
      where list_id = new.list_id
    ),
    updated_at = now()
    where id = new.list_id;
    return new;
  end if;
end;
$$ language plpgsql security definer;

-- Drop the trigger if it already exists
drop trigger if exists update_target_count_trigger on public.targets;

-- Create a trigger that calls the function after insert, update, or delete on targets
create trigger update_target_count_trigger
after insert or update or delete on public.targets
for each row execute function update_target_count();

-- Update all existing target lists with the correct count
update public.target_lists tl
set target_count = (
  select count(*) 
  from public.targets t 
  where t.list_id = tl.id
);
