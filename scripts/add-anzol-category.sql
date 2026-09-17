-- Libera a categoria "Anzol" na tabela products.
--
-- A coluna category tem uma CHECK constraint que lista as categorias aceitas.
-- Ela não acompanha o ProductCategory do TypeScript, então toda categoria nova
-- precisa passar por aqui — senão o cadastro falha com:
--   new row for relation "products" violates check constraint "products_category_check"
--
-- Rode no Supabase: SQL Editor > New query > cole > Run.
-- É idempotente: pode rodar de novo sem problema.

alter table products drop constraint if exists products_category_check;

alter table products add constraint products_category_check
  check (category in ('Turbo', 'Reality', 'Shad', 'Anzol'));

-- Confere: deve listar as quatro categorias dentro da definição.
select pg_get_constraintdef(oid) as definicao
from pg_constraint
where conname = 'products_category_check';
