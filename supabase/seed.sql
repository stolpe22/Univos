-- Dados demo para o Supabase LOCAL (npx supabase db reset). Não rode em produção.
-- Usuários de teste: lucas@univos.test, karol@univos.test, joju@univos.test (login por link mágico no Inbucket: http://localhost:54324)

insert into auth.users (id, instance_id, aud, role, email, email_confirmed_at, raw_user_meta_data, created_at, updated_at)
values
  ('00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000000','authenticated','authenticated','lucas@univos.test', now(), '{"name":"Lucas"}', now(), now()),
  ('00000000-0000-0000-0000-000000000002','00000000-0000-0000-0000-000000000000','authenticated','authenticated','karol@univos.test', now(), '{"name":"Karol"}', now(), now()),
  ('00000000-0000-0000-0000-000000000003','00000000-0000-0000-0000-000000000000','authenticated','authenticated','joju@univos.test',  now(), '{"name":"Joju"}',  now(), now());
-- o trigger criar_perfil cria os perfis

update public.perfis set cor = 'blue'   where nome = 'Lucas';
update public.perfis set cor = 'red'    where nome = 'Karol';
update public.perfis set cor = 'purple' where nome = 'Joju';

insert into public.clubes (id, nome, meta_pagina, meta_prazo)
values ('11111111-1111-1111-1111-111111111111', 'Uni-vos', 160, current_date + 6);

insert into public.membros (clube_id, user_id, papel) values
  ('11111111-1111-1111-1111-111111111111','00000000-0000-0000-0000-000000000001','admin'),
  ('11111111-1111-1111-1111-111111111111','00000000-0000-0000-0000-000000000002','membro'),
  ('11111111-1111-1111-1111-111111111111','00000000-0000-0000-0000-000000000003','membro');

insert into public.livros (clube_id, titulo, autor, paginas, status, sugerido_por) values
  ('11111111-1111-1111-1111-111111111111','Freakonomics','Levitt & Dubner',320,'atual','00000000-0000-0000-0000-000000000001'),
  ('11111111-1111-1111-1111-111111111111','Sapiens','Yuval N. Harari',464,'fila','00000000-0000-0000-0000-000000000002'),
  ('11111111-1111-1111-1111-111111111111','O Príncipe','Maquiavel',144,'fila','00000000-0000-0000-0000-000000000003'),
  ('11111111-1111-1111-1111-111111111111','1984','George Orwell',416,'lido','00000000-0000-0000-0000-000000000001');

insert into public.progresso_leitura (livro_id, user_id, pagina)
select l.id, u.id, u.pg from public.livros l,
  (values ('00000000-0000-0000-0000-000000000001'::uuid,140),('00000000-0000-0000-0000-000000000002'::uuid,96),('00000000-0000-0000-0000-000000000003'::uuid,180)) as u(id,pg)
where l.titulo = 'Freakonomics';

insert into public.comentarios (livro_id, user_id, pagina, texto)
select l.id, c.u, c.p, c.t from public.livros l,
  (values ('00000000-0000-0000-0000-000000000002'::uuid,60,'O capítulo dos professores trapaceando é absurdo kkk'),
          ('00000000-0000-0000-0000-000000000003'::uuid,150,'Esse capítulo do aborto e crime dá um debate inteiro.')) as c(u,p,t)
where l.titulo = 'Freakonomics';

insert into public.debates (clube_id, tema, data, formato, status, criado_por) values
  ('11111111-1111-1111-1111-111111111111','Penas mais pesadas para crimes hediondos', now() + interval '7 days','Rodada com FINALIZADO!','agendado','00000000-0000-0000-0000-000000000003'),
  ('11111111-1111-1111-1111-111111111111','Debate do livro: Freakonomics', now() + interval '14 days','Clube do livro','agendado','00000000-0000-0000-0000-000000000001');

insert into public.temas (clube_id, tema, proposto_por) values
  ('11111111-1111-1111-1111-111111111111','Educação sexual nas escolas','00000000-0000-0000-0000-000000000002'),
  ('11111111-1111-1111-1111-111111111111','Pena de morte','00000000-0000-0000-0000-000000000003'),
  ('11111111-1111-1111-1111-111111111111','Legalização das drogas','00000000-0000-0000-0000-000000000001');
