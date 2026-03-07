# Copilot Instructions - Property Valuation Landing

# Copilot Instructions - Property Valuation Landing

## 🎯 Project Context

This is an Angular 21+ property valuation application with the following stack:
- **Framework**: Angular 21.1 with Standalone Components
- **Language**: TypeScript 5.9 (strict mode)
- **Styling**: Tailwind CSS 4.1
- **Build**: Angular CLI with Vite
- **APIs**: Google GenAI for property estimations
- **State Management**: Angular Signals
- **Forms**: Reactive Forms with FormBuilder

## 📁 Project Structure

```
src/app/
├── core/          # Singleton services, core data models, app-wide utilities
├── features/      # Feature modules (valuation-form, privacy-policy)
└── shared/        # Reusable components, pipes, shared models

docs/
├── backlog.md           # Prioritized product backlog (maintained by @po)
└── features/            # Feature specs — source of truth for all agents
    ├── _TEMPLATE.md     # Template for new features
    └── FEAT-XXX-*.md    # Individual feature files

.github/
├── copilot-instructions.md
└── agents/
    ├── po.agent.md      # Product Owner — requirements & backlog
    ├── ds.agent.md      # Designer — UI/UX & Tailwind
    ├── arq.agent.md     # Architect — Angular architecture
    └── test.agent.md    # Tester — unit & component tests
```

## 🏗️ Architecture & Code Conventions

### Components
- **Always** use standalone components (`standalone: true`)
- **Prefer** signals over traditional properties for reactive state
- **Naming**: `feature-name.component.ts` (kebab-case)
- **One component per file**
- **Reactive Forms**: Use FormBuilder for all forms

**Example:**
```typescript
@Component({
  selector: 'app-property-details',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './property-details.component.html'
})
export class PropertyDetailsComponent {
  readonly propertyData = signal<PropertyData | null>(null);
  readonly isLoading = signal(false);
}
```

### Services
- **Location**: `core/services/`
- **Injection**: `providedIn: 'root'` for singletons
- **Async operations**: Use RxJS Observables
- **Business logic**: Keep in services, NOT in components
- **Error handling**: Always implement robust error handling

### Types & Models
- **Interfaces**: `.interface.ts` files for data contracts
- **Models**: `.model.ts` files for classes with logic
- **Strong typing**: Avoid `any`, use proper types
- **Exports**: Named exports, no default exports

### Styling
- **Framework**: Tailwind CSS (priority)
- **Approach**: Utility classes in templates
- **Custom CSS**: Only when Tailwind utilities are insufficient
- **Complex styles**: Use `@apply` in component styles
- **Responsive**: Mobile-first approach

### Forms
- **Type**: Reactive Forms (NEVER Template Driven)
- **Validation**: Built-in validators + custom validators
- **Custom validators**: Separate files for complex logic
- **Formatting**: Custom pipes (e.g., phone-format, zip-code-format)

## 🎨 UI/UX Standards

### Design Principles
- **Mobile-first**: Design for mobile, enhance for desktop
- **Loading states**: Always show visual feedback during async operations
- **Validation feedback**: Immediate and clear error messages
- **Accessibility**: ARIA labels, keyboard navigation, proper contrast ratios (WCAG 2.1 AA)
- **Responsive**: Use Tailwind responsive utilities (sm, md, lg, xl)

### Color & Theme
- Use Tailwind's configured color palette
- Maintain consistent spacing with Tailwind spacing scale
- Follow established design system

## 🔒 Security Requirements

- **Never** hardcode API keys (use environment variables)
- **Always** validate user inputs (frontend AND backend)
- **Sanitize** data before rendering (prevent XSS)
- **Use HTTPS** for all API calls
- **Avoid** innerHTML unless absolutely necessary (use text content)

## 📋 Code Review Checklist

When reviewing or generating code, ensure:
- ✅ No performance issues (e.g., unnecessary re-renders)
- ✅ No memory leaks (unsubscribed Observables - use takeUntilDestroyed)
- ✅ Accessibility compliance (ARIA, keyboard nav, semantic HTML)
- ✅ Type safety (no `any`, proper interfaces)
- ✅ Naming conventions followed (kebab-case for files, camelCase for variables)
- ✅ Error handling implemented
- ✅ Loading states included

## 🎯 Quality Goals

- **Test Coverage**: 80%+ minimum
- **Bundle Size**: Monitor and optimize
- **Lighthouse Score**: 90+ on all metrics
- **Accessibility**: WCAG 2.1 AA compliance
- **Type Safety**: Strict TypeScript, no `any`

## 📚 Reference Standards

Follow these official guidelines:
- [Angular Style Guide](https://angular.dev/style-guide)
- [RxJS Best Practices](https://rxjs.dev/guide/overview)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

## 🔧 Code Generation Guidelines

### When creating components:
```typescript
// Generate with:
// - Standalone configuration
// - Proper imports (CommonModule, ReactiveFormsModule if needed)
// - Signals for state
// - JSDoc comments
// - Error handling
// - Loading states
```

### When creating services:
```typescript
// Generate with:
// - providedIn: 'root'
// - RxJS Observables for async operations
// - Error handling with catchError
// - TypeScript interfaces for request/response
// - JSDoc documentation
```

### When creating forms:
```typescript
// Generate with:
// - FormBuilder in constructor
// - Typed FormGroup
// - Validators (built-in and custom)
// - Error message handling
// - Submit handler with loading state
```

## 🧪 Testing Standards

- Write unit tests for all services
- Write component tests for critical user flows
- Mock external dependencies
- Use Jasmine/Karma framework
- Follow AAA pattern (Arrange, Act, Assert)

## 🤖 Agent Workflow

This project uses specialized Copilot agents. Each agent has a defined scope — use the right agent for the right task.

| Agent | Trigger | Responsibility |
|-------|---------|----------------|
| `@po` | New feature discussion | Requirements, user stories, backlog |
| `@ds` | UI/UX changes | Templates, Tailwind, accessibility |
| `@arq` | Architecture decisions | Components, services, data models |
| `@test` | Test coverage | Unit tests, component tests |

### Feature Development Flow

```
1. @po  → Discuss & document feature in docs/features/FEAT-XXX.md
2. @arq → Read FEAT-XXX.md → implement architecture (services, models)
3. @ds  → Read FEAT-XXX.md → implement UI (templates, Tailwind)
4. @test → Read FEAT-XXX.md → write unit & component tests
5. @po  → Update docs/backlog.md status to Done
```

### Rules for All Agents
- **Always read** the relevant `docs/features/FEAT-XXX.md` before implementing.
- **Always check** `docs/backlog.md` for priority and context.
- The feature file is the **single source of truth** — if requirements are unclear, ask the developer (do not assume).

---

**Last updated**: 2026-03-06
**Version**: 4.0 - Multi-agent workflow with PO

