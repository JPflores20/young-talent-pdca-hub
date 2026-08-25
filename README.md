# Young Talent PDCA Hub

System/Role: Act as an expert Frontend Developer and UI/UX Designer. Build a modern, responsive web application dashboard using React, TypeScript, Tailwind CSS, and shadcn/ui.

Project Overview: This is an internal web platform for "Young Talents" (interns) at Grupo Modelo to create, track, and manage their PDCA (Plan-Do-Check-Act) and RDA reports. Currently, we are focusing strictly on the PDCA module.

Design System & Branding:

Primary Colors: Royal Blue (Azul Rey), Yellow (Amarillo), and White. Use these strategically for accents, active states, and primary buttons.

UI/UX Vibe: Clean, corporate, intuitive, and highly organized. Use ample whitespace, subtle shadows for cards, and clear visual hierarchies.

Core Features & Layout:

Sidebar/Navigation:

Header: Placeholder for the corporate logo.

Nav Links: "Dashboard", "Mis PDCAs" (Active), "Mis RDAs" (Disabled/Coming Soon).

Footer: User profile snippet with mock data (e.g., "Becario: Ana López", "Ingeniería de Software").

Main View (PDCA List):

Top header with a "Crear Nuevo PDCA" primary button (Royal Blue).

A clean data table or card grid displaying current PDCAs.

Columns/Fields: Título del Proyecto, Área, Fase Actual (Plan, Do, Check, Act - use distinct colored badges for each), and Fecha de Actualización.

PDCA Creation/Detail View (Rendered as a large Modal or separate view):

A horizontal stepper component showing the 4 stages: Plan, Do, Check, Act.

Plan Tab: Form fields for "Definición del Problema", "Análisis de Causa Raíz" (textarea), and an Action Plan table.

Do Tab: A checklist of tasks from the action plan.

Check Tab: Fields to upload evidence and a textarea for "Verificación de Resultados". Include a placeholder for a mock chart.

Act Tab: Textarea for "Estandarización y Cierre".

Bottom action buttons: "Guardar Borrador" and "Avanzar Fase".

Mock Data: Populate the UI with realistic Spanish mock data related to industrial process improvements or software development workflows so the interface looks fully functional.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/75c1f52d-d225-4af4-9a75-9dc19ab73016).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
