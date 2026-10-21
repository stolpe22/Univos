-- A terceira posicao representa uma escolha fora de "a favor" e "contra",
-- nao falta de opiniao. Mantem os votos existentes com o novo significado.
alter table public.votos_enquete
  drop constraint if exists votos_enquete_posicao_check;

update public.votos_enquete
   set posicao = 'nenhum_dos_dois'
 where posicao = 'indeciso';

alter table public.votos_enquete
  add constraint votos_enquete_posicao_check
  check (posicao in ('a_favor', 'contra', 'nenhum_dos_dois'));
