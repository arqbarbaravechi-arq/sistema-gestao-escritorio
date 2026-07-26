# Baseline de Produto — Referência

Este repositório implementa o sistema descrito na baseline de produto oficial, congelada antes do início do desenvolvimento. Os documentos completos vivem fora deste repositório (gestão documental do projeto); este arquivo existe para que qualquer pessoa que abra o código encontre o vínculo com a decisão de negócio por trás dele.

## Documentos da Baseline

1. Discovery (entrevista original com a sócia)
2. PRD v2.0 (+ Addendum de Decisões Confirmadas)
3. UX Design v2.0 (+ Addendum de Decisões Confirmadas)
4. Arquitetura Técnica v2.0 (+ Addendum de Decisões Confirmadas)
5. Revisão Crítica v1.0
6. Pré-Mortem v1.0
7. Revisão em Comitê v1.0
8. Análise Competitiva v1.0
9. Baseline Oficial e Change Requests v1.0

## Decisões de negócio já confirmadas (não reabrir sem Change Request)

- **Escopo:** sistema interno do escritório, com arquitetura preparada para eventual transformação em SaaS multi-tenant, sem necessidade de reconstrução.
- **Regra de rodada de revisão (CR-000):** 2 rodadas de revisão por projeto (não por etapa/sub-entrega). Alterações além disso geram novo orçamento (`budget_amendment`), não uma "rodada extra".
- **Capacidade saudável:** 4 projetos simultâneos, tratado como alerta (soft limit), nunca bloqueio.
- **Definição de "atrasado":** etapa cuja data prevista passou sem conclusão, sem tolerância de carência.
- **Financeiro:** somente leitura no MVP — planilha da Juliana permanece fonte de verdade até nova decisão.

## Processo de Change Request

Toda mudança de escopo em relação a este documento segue o template abaixo. Nunca editar as seções acima sem um CR aprovado e registrado.

```
CR-XXX — [Título]
Data:
Solicitado por:
Documento(s) afetado(s):
1. Situação atual:
2. Mudança proposta:
3. Justificativa:
4. Impacto (escopo / prazo / regras de negócio relacionadas):
5. Decisão: [ ] Aprovada [ ] Rejeitada [ ] Adiada
Aprovado por:
Data da decisão:
```

Change Requests aprovados devem ser registrados em `docs/changes/CR-XXX.md`.
