-- Adiciona fotos extras ao produto.
--
-- A tabela products tinha uma única coluna `image`, então cada produto só podia
-- ter uma foto. Esta coluna guarda as fotos adicionais (a `image` continua sendo
-- a principal, a que aparece no card do catálogo).
--
-- Rode no Supabase: SQL Editor > New query > cole > Run.
-- É idempotente: pode rodar de novo sem problema.

alter table products
  add column if not exists images jsonb not null default '[]'::jsonb;

-- Garante que o conteúdo é sempre uma lista, nunca objeto ou texto solto.
alter table products drop constraint if exists products_images_is_array;
alter table products add constraint products_images_is_array
  check (jsonb_typeof(images) = 'array');

-- Confere: deve devolver uma linha com jsonb e default '[]'.
select column_name, data_type, column_default
from information_schema.columns
where table_name = 'products' and column_name = 'images';
