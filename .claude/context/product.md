# Beebole — Product Overview

Use this context to understand the Beebole entity model and how concepts relate to each other. For the full capability catalog (machine-readable, ID-keyed, refreshed by `/sync-features`), see `features.md`. App URLs, support email, and source code repo details are in CLAUDE.md.

## Key concepts

The concepts below are listed in roughly the order a new reader builds up the mental model: account → who → work → logging → time off → approval → money → cross-cutting structure → extensibility → permissions.

### Account and people

- **Organisation** — The Beebole account. The organisation holds the default configuration that applies across the account — rates, work schedules, approval rules, custom fields, and so on. These defaults cascade down to projects, people, and other entities (often via tags) and can be overridden at lower levels.
- **Person** — An individual member of the organisation. A person carries a profile, a role, optional manager relationships, and inherits configuration (rates, schedules, allowances, custom fields) from organisation defaults and any tags they belong to. Most per-person settings start as inherited values and are overridden only when needed.

### Work structure

- **Project** — What time is tracked against. Projects form an arbitrarily deep hierarchy: a top-level project can hold sub-projects, which can hold sub-sub-projects, and so on. There is no fixed "Company → Project → Sub-project" structure — the depth and meaning of each level are up to the customer. Use projects to model what work gets done.
- **Project category** — A user-defined dimension that groups top-level projects. Categories are how customers describe the broadest cut of their work — examples include Customers, Activities, Locations, or Service lines. A project belongs to exactly one category.
- **Task** — A planning entity that exists independently of projects. Where projects model the work hours go *into*, tasks model the work *to be done*. A task can optionally be assigned to a project (which lets it inherit project-level attributes such as billing rates and approval rules), and to one or more people. Tasks are presented in two views — **Kanban** (status workflow) and **Gantt** (timeline and capacity) — both backed by the same underlying task entity. Resource planning and task management are two views of one concept, not two separate features.

### Logging time

- **Time entry** — A logged unit of work. Belongs to a person on a specific date, against a project (and optionally a task) — or against an absence type when the entry represents time off. Time entries are the atomic records that all reporting, billing, and cost calculations are built on.
- **Timesheet** — A person's collection of time entries for a given period (typically a week). The timesheet, not the individual time entry, is the unit that gets **submitted** and **approved**.

### Time off

- **Absence type** — A user-defined kind of leave (Vacation, Sick leave, Parental leave, ...). Each absence type controls how that leave behaves: paid or unpaid, tracked in hours or days, accrued automatically or assigned by hand, requiring approval or not.
- **Allowance** — A person's budget for one absence type, scoped to a period. The user-facing label in the app is **allowance** (the term **quota** is internal). An allowance tracks how much has been **Taken**, **Accrued**, and **Available** — the same structure regardless of the absence type.

### Approval

- **Approval workflow** — A sequence of approval stages applied to a submitted timesheet (and to absence requests when their type requires approval). Each stage names who can approve at that step. Workflows can be defined globally or per project, and are often inherited via tags.

### Money

- **Rate** — A billing rate or a cost rate. A rate can be set at the **person**, **project**, **task**, or **tag** level. Beebole resolves the rate for a given time entry by walking from the most specific level to the most general (the **rate cascade**) — a more specific rate overrides a more general one. Rates have effective date ranges and can recur. This is how Beebole turns hours into money on both the revenue and the cost side.
- **Expense type** — A user-defined kind of expense (Travel, Meals, Equipment, ...). Each expense type controls whether entries of that type are amounts or quantities, and whether a billing markup applies on top of cost.
- **Budget** — A spending or effort ceiling defined on a project: in billing currency, in cost currency, or in hours. A budget can be split across people or sub-projects, and can repeat across periods.

### Cross-cutting structure

- **Tag** — A hierarchical label applied to people, projects, and tasks. Use tags to regroup entities across dimensions other than the work hierarchy itself — for example, by team, department, location, or seniority for people; or by phase, market, or risk profile for projects. Tags cascade configuration (rates, schedules, approvals, allowances) to everything beneath them, and a person can belong to multiple independent tag trees. The split between projects and tags: projects describe *what* is worked on; tags describe *who and how* that work is organised.
- **Work schedule** — Defines expected working hours per day across a repeating cycle. The cycle length is configurable in days (default: 7, for a weekly pattern); longer cycles support rotating patterns. Assigned at organisation, tag, or person level.

### Extensibility and access

- **Custom field** — An organisation-defined data field added to people, projects, tasks, or time entries. Custom fields extend Beebole's built-in attributes without code changes and can be used as report dimensions and filters.
- **Role** — A named permission set assigned to people. A role controls what its holders can see and do across the application — both the breadth (e.g. their own data, their team's, the whole organisation) and the depth (read versus modify).
