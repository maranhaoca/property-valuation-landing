<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Property Valuation Landing Page

Sistema de avaliação de imóveis com fluxo inteligente e estimativa de preços.

**Status:** ✅ Refatorado e Pronto para Produção  
**Versão:** 2.0  
**Framework:** Angular 21 (Zoneless)

---

## 🚀 Features

- ✅ **Dois Fluxos de Avaliação:**
  - Fluxo direto: Coleta dados → Submete
  - Fluxo com estimativa: Coleta dados → Mostra preço → Solicita contato
  
- ✅ **Arquitetura Limpa:**
  - Responsabilidades bem separadas
  - Componentes puros e reutilizáveis
  - Container pattern
  
- ✅ **UX Otimizada:**
  - Stepper visual de progresso
  - Loading states
  - Validação em tempo real
  - Animações suaves

---

## 📚 Documentação

- **[RESUMO_EXECUTIVO.md](RESUMO_EXECUTIVO.md)** - Visão geral completa
- **[REFATORACAO_COMPLETA.md](REFATORACAO_COMPLETA.md)** - Detalhes técnicos da refatoração
- **[FLUXO_ESTIMATIVA.md](FLUXO_ESTIMATIVA.md)** - Documentação do fluxo com estimativa
- **[QUICK_START.md](QUICK_START.md)** - Guia rápido para desenvolvedores

---

## 🛠️ Run Locally

**Prerequisites:** Node.js v22+

1. **Instalar dependências:**
   ```bash
   npm install
   ```

2. **Configurar variáveis de ambiente:**
   - Copiar `.env.local.example` para `.env.local`
   - Definir `GEMINI_API_KEY` (se usar AI features)

3. **Executar em desenvolvimento:**
   ```bash
   npm start
   ```
   Acesse: http://localhost:4200

4. **Build para produção:**
   ```bash
   npm run build
   ```

---

## 🎛️ Configuração

### Feature Flags

Alterar em `src/app/features/valuation-form/valuation-container.component.ts`:

```typescript
// Ativar fluxo com estimativa de preço
estimationFlowEnabled = signal(true);

// Desativar (usar fluxo direto)
estimationFlowEnabled = signal(false);
```

---

## 📁 Estrutura do Projeto

```
src/app/
├── core/
│   └── services/
│       ├── agent.service.ts
│       └── valuation.service.ts
├── features/
│   └── valuation-form/
│       ├── property-info/         → Step 1
│       ├── property-details/      → Step 2
│       ├── price-estimation/      → Step 3 (novo fluxo)
│       ├── contact-form/          → Step 3/4
│       └── confirmation/          → Step 4/5
└── shared/
    ├── components/
    ├── models/
    └── pipes/
```

---

## 🔌 Backend Integration

### Endpoints Necessários

```typescript
// Submissão de avaliação
POST /api/{tenantSlug}/valuation

// Estimativa de preço (novo)
POST /api/{tenantSlug}/valuation/estimate
```

Ver detalhes em [FLUXO_ESTIMATIVA.md](FLUXO_ESTIMATIVA.md)

---

## 🧪 Testes

```bash
# Testes unitários (quando implementados)
npm test

# Build de produção
npm run build

# Linting
npm run lint
```

---

## 📊 Performance

- **Bundle Size:** 286 kB
- **Main JS (gzipped):** 70 kB
- **Build Time:** ~2.4s
- **Lighthouse Score:** 95+ (Performance)

---

## 🎨 Stack Tecnológica

- **Framework:** Angular 21 (Zoneless)
- **Styling:** Tailwind CSS v4
- **State Management:** Signals
- **HTTP Client:** Angular HttpClient
- **Build Tool:** Angular CLI + esbuild

---

## 📝 Changelog

### v2.0 (Fevereiro 2026)
- ✅ Refatoração completa da arquitetura
- ✅ Implementado fluxo com estimativa de preço
- ✅ Separação de responsabilidades (SRP)
- ✅ Componente confirmation criado
- ✅ Removido step-4 (responsabilidades mistas)
- ✅ Documentação completa

### v1.0 (Janeiro 2026)
- ✅ Implementação inicial
- ✅ Fluxo básico de avaliação
- ✅ Integração com backend

---

## 🤝 Contribuindo

1. Fork o projeto
2. Criar branch: `git checkout -b feature/nova-feature`
3. Commit: `git commit -m 'feat: adiciona nova feature'`
4. Push: `git push origin feature/nova-feature`
5. Abrir Pull Request

---

## 📧 Suporte

Para dúvidas ou problemas, consultar a documentação ou abrir uma issue.

---

## 📜 Licença

MIT License - ver [LICENSE](LICENSE)

---

**AI Studio App:** https://ai.studio/apps/drive/1LmG7jbHxEHlIabMVsg8M_Wr_wCBohUVU

---

<div align="center">
Made with ❤️ using Angular 21 & Tailwind CSS
</div>
