# AI_USAGE.md — Uso de IA no Projeto SRM Credit Engine

## 1. Objetivo do uso de IA

Durante o desenvolvimento do SRM Credit Engine, utilizei IA como apoio técnico para acelerar decisões de arquitetura, revisar pontos do desafio, validar boas práticas e melhorar a documentação da entrega.

A IA não foi usada para substituir entendimento técnico. As decisões finais, execução local, testes, validações no Swagger, ajustes de Git, modelagem financeira e correções de código foram conduzidas manualmente.

---

## 2. Áreas em que a IA foi utilizada

A IA foi utilizada principalmente para:

- revisar a arquitetura backend em NestJS;
- validar a separação entre controller, service, DTOs, database e domínio;
- apoiar decisões sobre precisão financeira com Decimal.js;
- estruturar ADRs;
- revisar README e documentação final;
- gerar ideias para testes unitários e E2E;
- revisar mensagens de commits;
- identificar lacunas de maturidade para nível Pleno/Sênior;
- melhorar a clareza da entrega técnica.

---

## 3. Prompts estratégicos utilizados

### Prompt 1 — Arquitetura backend

"Estou construindo uma API em NestJS para um desafio financeiro de recebíveis. Preciso separar responsabilidades entre camada de apresentação, aplicação, domínio e infraestrutura. Me ajude a validar uma arquitetura simples, limpa e justificável para nível pleno/sênior."

### Prompt 2 — Precisão financeira

"Tenho cálculos financeiros envolvendo valor de face, taxa mensal, prazo e valor presente. Quais riscos existem em usar number em JavaScript e como posso evitar erro de precisão em uma API financeira?"

### Prompt 3 — Transação de liquidação

"Preciso criar uma liquidação de múltiplos recebíveis em uma única operação. Como modelar isso com Prisma transaction, atualização de status, audit log e proteção contra inconsistência?"

### Prompt 4 — Documentação técnica

"Revise meu README de um projeto financeiro com NestJS, PostgreSQL, Prisma, Docker, testes e GitHub Actions. Aponte o que está forte e o que pode bloquear uma avaliação de nível sênior."

### Prompt 5 — Git workflow

"Como organizar commits, branches, pull requests e documentação para que o histórico do repositório conte uma história clara em um desafio técnico?"

---

## 4. Exemplo de sugestão incorreta ou incompleta da IA

Durante o desenvolvimento, a IA sugeriu inicialmente simplificar os cálculos financeiros usando `number` e arredondamento com `toFixed`.

Essa abordagem foi rejeitada porque valores financeiros não devem depender de ponto flutuante nativo do JavaScript. Pequenas diferenças de precisão podem gerar erros em cálculos de desconto, valor presente e liquidação.

A correção aplicada foi utilizar `Decimal.js`, armazenar valores monetários com precisão controlada e documentar a decisão em ADR.

---

## 5. Outro ponto que exigiu revisão humana

Em alguns momentos, a IA sugeriu validações duplicadas entre DTO e Service.

A correção aplicada foi separar melhor as responsabilidades:

- DTO: valida formato, tipo e obrigatoriedade de entrada.
- Service: valida regra de negócio e consistência da operação.

Isso evitou espalhar a mesma regra em vários pontos do código.

---

## 6. Onde a IA ajudou mais

A IA ajudou mais em:

- acelerar a revisão de arquitetura;
- levantar riscos que poderiam passar despercebidos;
- melhorar a clareza da documentação;
- sugerir cenários de teste;
- organizar ideias para ADRs;
- revisar pontos explícitos do enunciado;
- comparar a entrega com critérios de nível Pleno/Sênior.

---

## 7. Onde a IA atrapalhou ou precisou ser limitada

A IA atrapalhou quando trouxe soluções genéricas demais ou sugeriu melhorias que aumentariam o escopo sem necessidade.

Exemplos:

- sugestões de autenticação completa em momento que o foco era fechar o core financeiro;
- sugestões de observabilidade avançada antes de garantir Docker, testes e documentação;
- respostas iniciais sem considerar totalmente o contexto do enunciado.

Nesses casos, filtrei as sugestões e priorizei o que agregava valor direto à entrega.

---

## 8. Decisões finais tomadas manualmente

As decisões finais foram feitas com base no enunciado, execução local e validação prática:

- uso de NestJS e TypeScript;
- uso de Prisma com PostgreSQL;
- uso de Decimal.js para cálculos financeiros;
- uso de transações ACID na liquidação;
- aplicação de optimistic locking;
- padronização de erros com Global Exception Filter;
- uso de correlation ID;
- criação de ADRs;
- configuração de CI/CD;
- criação de Dockerfile;
- configuração de pre-commit hooks;
- criação de tag semântica para release.

---

## 9. Conclusão

A IA foi usada como acelerador de engenharia e revisão crítica, não como substituto da implementação.

O projeto foi validado com execução local, testes automatizados, build, Swagger/OpenAPI, revisão manual de código e versionamento Git.
