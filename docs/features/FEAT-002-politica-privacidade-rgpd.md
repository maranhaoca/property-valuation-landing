# FEAT-002 — Política de Privacidade RGPD

## 📋 Summary
Página de Política de Privacidade completa e RGPD-compliant, em português de Portugal, para operação a título individual (pessoa singular), cobrindo o tratamento automatizado com Google Gemini.

## 👤 User Story
**As a** utilizador da aplicação de avaliação de imóveis,
**I want to** consultar uma Política de Privacidade clara e completa,
**So that** perceba quais os meus dados pessoais recolhidos, para que fins são usados, com quem são partilhados e como posso exercer os meus direitos ao abrigo do RGPD.

## ✅ Acceptance Criteria
- [ ] A página está disponível em `/privacidade`
- [ ] O documento identifica o responsável pelo tratamento (com placeholders substituíveis: nome, email, morada)
- [ ] São listados todos os dados recolhidos: nome, email, telefone, morada, código postal, tipo de imóvel, área, tipologia, ano de construção, estado de conservação
- [ ] As finalidades de tratamento são explicadas com a respetiva base legal (consentimento para a estimativa, pré-contratual para o contacto)
- [ ] Existe uma secção específica sobre tratamento automatizado/IA (Google Gemini, art.º 22.º RGPD), com aviso de que a estimativa é indicativa e não vinculativa
- [ ] São enumerados os 7 direitos do titular dos dados (acesso, retificação, apagamento, limitação, portabilidade, oposição, retirada do consentimento)
- [ ] Inclui referência à CNPD como autoridade de controlo competente em Portugal, com link
- [ ] Inclui secção de conservação de dados com prazos concretos
- [ ] Inclui secção de segurança (HTTPS, medidas técnicas e organizativas)
- [ ] Inclui secção de cookies (sem cookies de rastreio/publicidade)
- [ ] Inclui secção sobre alterações à política
- [ ] Inclui secção de contacto no final
- [ ] Data de última atualização visível: 8 de março de 2026
- [ ] Acessibilidade: estrutura semântica com headings, links com rel="noopener noreferrer"

## 🚫 Out of Scope
- Banner/modal de consentimento de cookies (feature separada se necessário)
- Formulário de exercício de direitos online (apenas indicação de contacto por email)
- Tradução para outros idiomas
- Registo na CNPD (responsabilidade do operador, fora do âmbito da app)

## 🏗️ Technical Context
- **Affected area**: Página `/privacidade` — componente de política de privacidade já existente
- **New functionality needed**: Nenhuma nova funcionalidade técnica — apenas substituição do conteúdo Lorem Ipsum pelo texto RGPD real
- **Dependencies**: Nenhuma dependência externa nova

## 🎨 UX Notes
- Manter o layout existente: card branco com header roxo (`bg-primary`) e corpo com secções numeradas (`h2`)
- Adicionar um bloco de identificação do responsável no topo do corpo, visualmente destacado (fundo cinza suave, borda), antes da secção 1
- Repetir o bloco de contacto no final (secção 11), com o mesmo estilo destacado
- Links externos (CNPD, Google Privacy Policy) abrem em nova aba
- Texto com `leading-relaxed` para boa legibilidade
- Listas com `list-disc` para os dados recolhidos e direitos
- Termos legais em negrito para facilitar a leitura (base legal, nomes dos direitos)

## 🧪 Testing Notes
- Verificar que a página carrega corretamente em `/privacidade`
- Verificar que todos os links externos funcionam e abrem em nova aba
- Verificar que os placeholders `[NOME DO RESPONSÁVEL]`, `[EMAIL DE CONTACTO]`, `[MORADA]` estão presentes e visíveis para substituição futura
- Verificar estrutura de headings (h1, h2) para acessibilidade

## 📎 References
- RGPD — Regulamento (UE) 2016/679
- Art.º 22.º RGPD (decisões automatizadas)
- [CNPD — Comissão Nacional de Proteção de Dados](https://www.cnpd.pt)
- [Política de Privacidade da Google](https://policies.google.com/privacy)

---
**Status**: Done
**Priority**: High
**Created**: 2026-03-08
**Updated**: 2026-03-08

