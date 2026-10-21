-- Cada perfil ganha uma cor inicial distribuida entre a paleta e pode escolher
-- um icone para substituir as iniciais do avatar.
alter table public.perfis drop constraint if exists perfis_cor_check;
alter table public.perfis
  add constraint perfis_cor_check
  check (cor in ('blue', 'red', 'purple', 'slate', 'green', 'orange', 'pink', 'teal', 'amber', 'indigo'));

alter table public.perfis
  alter column cor set default (array['blue', 'red', 'purple', 'slate', 'green', 'orange', 'pink', 'teal', 'amber', 'indigo'])[floor(random() * 10)::int + 1],
  add column icone_avatar text not null default ''
    check (icone_avatar in ('', 'book', 'mic', 'compass', 'vote', 'users', 'sun', 'moon', 'shield', 'home', 'search'));

-- Os perfis antigos receberam todos a mesma cor pelo valor padrao anterior.
-- Usa um espalhamento estavel para diferenciar a comunidade sem mudar a cada carga.
update public.perfis
   set cor = (array['blue', 'red', 'purple', 'slate', 'green', 'orange', 'pink', 'teal', 'amber', 'indigo'])[
     mod(hashtextextended(id::text, 0) & 9223372036854775807, 10)::int + 1
   ];
