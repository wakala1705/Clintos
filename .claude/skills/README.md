# Skills de UX/UI para Clintos — Claude Code

Este paquete contiene 10 skills personalizadas para trabajar en el proyecto Clintos (HIS/eMAR/IREP) desde Claude Code.

## Skills incluidas

| Skill | Uso |
|---|---|
| `nielsen-heuristics-audit` | Auditoría de usabilidad con las 10 heurísticas de Nielsen |
| `wcag-accessibility-audit` | Auditoría de accesibilidad WCAG 2.1 AA |
| `visual-craft-review` | Revisión de craft visual (12 reglas) en UI de alta fidelidad o código frontend |
| `design-decision-log` | Bitácora de decisiones de diseño (case study vivo) |
| `double-diamond-framework` | Guía de proceso de diseño (Discover → Define → Develop → Deliver) |
| `personas-journey-maps` | Construcción de personas, empathy maps, journey maps y storyboards |
| `flow-documentation` | Documentación de flujos de acciones con diagrama Mermaid |
| `feature-documentation` | Documentación funcional de módulos/submódulos |
| `microcopy-ux-writing` | Auditoría y redacción de microcopy (labels, errores, CTAs, empty states) |
| `frontend-design` | Guía de dirección visual para UI nueva o rediseño |

## Instalación en Claude Code

Tienes dos ubicaciones posibles según el alcance que quieras:

### Opción A — Solo para el proyecto Clintos (recomendado)
Copia las carpetas de skills dentro de la raíz de tu proyecto:

```
tu-proyecto-clintos/
└── .claude/
    └── skills/
        ├── nielsen-heuristics-audit/
        │   └── SKILL.md
        ├── wcag-accessibility-audit/
        │   └── SKILL.md
        ├── ... (resto de skills)
```

Desde la raíz del proyecto en terminal:

```bash
mkdir -p .claude/skills
cp -r nielsen-heuristics-audit wcag-accessibility-audit visual-craft-review \
      design-decision-log double-diamond-framework personas-journey-maps \
      flow-documentation feature-documentation microcopy-ux-writing \
      frontend-design .claude/skills/
```

### Opción B — Disponibles en todos tus proyectos
Cópialas en tu carpeta de usuario:

```bash
mkdir -p ~/.claude/skills
cp -r nielsen-heuristics-audit wcag-accessibility-audit visual-craft-review \
      design-decision-log double-diamond-framework personas-journey-maps \
      flow-documentation feature-documentation microcopy-ux-writing \
      frontend-design ~/.claude/skills/
```

## Verificar que se cargaron

En el chat de Claude Code, escribe:

```
/skills
```

Deberías ver las 10 skills en la lista. No necesitas invocarlas manualmente — Claude Code las activa automáticamente cuando tu petición coincide con la descripción de cada una (por ejemplo, pedir "una auditoría WCAG de esta pantalla" activa `wcag-accessibility-audit`).

## Nota

Algunas skills (`flow-documentation`, `nielsen-heuristics-audit`, `visual-craft-review`, `wcag-accessibility-audit`, `microcopy-ux-writing`) incluyen archivos de referencia adicionales dentro de su carpeta, no solo `SKILL.md`. Mantén la estructura de carpetas intacta al copiar.
