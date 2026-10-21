-- Novas opcoes de avatar: animais, pessoas e veiculos.
-- Mantem os simbolos antigos validos para nao quebrar avatares ja escolhidos.
alter table public.perfis
  drop constraint if exists perfis_icone_avatar_check;

alter table public.perfis
  add constraint perfis_icone_avatar_check
  check (icone_avatar in (
    '', 'book', 'mic', 'compass', 'vote', 'users', 'sun', 'moon', 'shield', 'home', 'search',
    'cat', 'dog', 'fox', 'rabbit', 'panda', 'frog', 'owl', 'turtle', 'person', 'people',
    'car', 'suv', 'bike', 'motorcycle', 'bus', 'rocket'
  ));
