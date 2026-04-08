# Seed Demo — Reference Data

Deterministic demo data for the `/seed-demo` skill. Edit this file to change what gets seeded.
The skill reads these tables at invocation time to generate a seeding script.

## People

| Name             | Email              | Role     | Department  | Country | Contract   | Schedule            | Cost       |
| ---------------- | ------------------ | -------- | ----------- | ------- | ---------- | ------------------- | ---------- |
| Sophie Laurent   | sophie@demo.test   | Manager  | Engineering | FR      | Internal   | Full Time           | 7500/month |
| Marc Dubois      | marc@demo.test     | Employee | Engineering | BE      | Internal   | Full Time           | 6000/month |
| Elena Rossi      | elena@demo.test    | Employee | Engineering | IT      | Internal   | Full Time           | 5500/month |
| James Chen       | james@demo.test    | Employee | Engineering | US      | Internal   | Full Time           | 6500/month |
| Priya Sharma     | priya@demo.test    | Employee | Engineering | UK      | Contractor | Half Time - 5d      | 95/hour    |
| Liam O'Brien     | liam@demo.test     | Manager  | Design      | UK      | Internal   | Full Time           | 7000/month |
| Ana Pereira      | ana@demo.test      | Employee | Design      | ES      | Internal   | Full Time           | 5000/month |
| Yuki Tanaka      | yuki@demo.test     | Employee | Design      | FR      | Internal   | Full Time           | 5000/month |
| Thomas Muller    | thomas@demo.test   | Manager  | Sales       | BE      | Internal   | Full Time           | 7500/month |
| Clara Fontaine   | clara@demo.test    | Employee | Sales       | FR      | Internal   | Full Time           | 5000/month |
| Nils Eriksson    | nils@demo.test     | Employee | Sales       | UK      | Contractor | Full Time           | 75/hour    |
| Rachel Adams     | rachel@demo.test   | Manager  | Marketing   | US      | Internal   | Full Time           | 7000/month |
| David Kim        | david@demo.test    | Employee | Marketing   | US      | Internal   | Full Time           | 5000/month |
| Fatima Al-Hassan | fatima@demo.test   | Employee | Marketing   | ES      | Internal   | Half Time - 5d      | 4000/month |
| Oliver Wright    | oliver@demo.test   | Manager  | Operations  | UK      | Internal   | Full Time           | 7000/month |
| Emma Costa       | emma@demo.test     | Employee | Operations  | IT      | Internal   | Full Time           | 4500/month |
| Lucas Bernard    | lucas@demo.test    | Employee | Operations  | FR      | Internal   | Full Time           | 4500/month |
| Sarah Jensen     | sarah@demo.test    | Employee | Engineering | BE      | Internal   | Full Time           | 6000/month |
| Ravi Patel       | ravi@demo.test     | Employee | Engineering | UK      | Contractor | Full Time           | 110/hour   |
| Marie Lefevre    | marie@demo.test    | Employee | Design      | FR      | Internal   | Half Time - 3d - 2d | 4000/month |
| Carlos Ruiz      | carlos@demo.test   | Employee | Sales       | ES      | Contractor | Full Time           | 70/hour    |
| Hannah Schmidt   | hannah@demo.test   | Employee | Marketing   | BE      | Contractor | Full Time           | 65/hour    |
| Noah Takahashi   | noah@demo.test     | Employee | Engineering | FR      | Internal   | Full Time           | 5500/month |
| Isabelle Moreau  | isabelle@demo.test | Employee | Operations  | FR      | Internal   | Full Time           | 4500/month |

## Projects

### Clients

| Name                 | Category | Parent               | Color  | Billing Rate | Budget Billing | Budget Cost | Budget Hours | Budget Period |
| -------------------- | -------- | -------------------- | ------ | ------------ | -------------- | ----------- | ------------ | ------------- |
| Acme Corp            | Customer | —                    | blue   | —            | —              | —           | —            | —             |
| Website Redesign     | Customer | Acme Corp            | blue   | 150/hour     | 60000          | 35000       | 400          | -3m to +1m    |
| Mobile App           | Customer | Acme Corp            | blue   | 160/hour     | 40000          | 25000       | 250          | -3m to +2w    |
| Greenleaf Industries | Customer | —                    | green  | —            | —              | —           | —            | —             |
| ERP Integration      | Customer | Greenleaf Industries | green  | 175/hour     | 55000          | 32000       | 340          | -3m to +1m    |
| Data Migration       | Customer | Greenleaf Industries | green  | 140/hour     | 15000          | 9000        | 100          | -2m to now    |
| Northstar Financial  | Customer | —                    | purple | —            | —              | —           | —            | —             |
| Dashboard            | Customer | Northstar Financial  | purple | 180/hour     | 35000          | 20000       | 200          | -2m to +1m    |
| Silverline Retail    | Customer | —                    | orange | —            | —              | —           | —            | —             |
| E-commerce Platform  | Customer | Silverline Retail    | orange | 165/hour     | 25000          | 15000       | 150          | -2w to +2m    |

### Activities

| Name           | Category | Parent | Color   |
| -------------- | -------- | ------ | ------- |
| Development    | Activity | —      | indigo  |
| Design         | Activity | —      | pink    |
| Analysis       | Activity | —      | amber   |
| Meeting        | Activity | —      | slate   |
| Sales          | Activity | —      | emerald |
| Administration | Activity | —      | gray    |

## Tasks

| Name                   | Category      | Parent | Status      | Owner          | Assigned To                                 | Start | End | Effort |
| ---------------------- | ------------- | ------ | ----------- | -------------- | ------------------------------------------- | ----- | --- | ------ |
| Requirements Gathering | Main planning | —      | Done        | Sophie Laurent | Marc Dubois, Elena Rossi                    | -3m   | -2m | 80h    |
| UI/UX Design           | Main planning | —      | Done        | Liam O'Brien   | Ana Pereira, Yuki Tanaka                    | -2m   | -1m | 120h   |
| Frontend Development   | Main planning | —      | In progress | Sophie Laurent | James Chen, Sarah Jensen, Noah Takahashi    | -1m   | +1m | 200h   |
| Backend Development    | Main planning | —      | In progress | Sophie Laurent | Marc Dubois, Ravi Patel                     | -1m   | +1m | 160h   |
| QA Testing             | Main planning | —      | Queue       | Sophie Laurent | Elena Rossi, Priya Sharma                   | +2w   | +2m | 60h    |
| App Wireframes         | Main planning | —      | Done        | Liam O'Brien   | Ana Pereira                                 | -3m   | -2m | 40h    |
| App Development        | Main planning | —      | In progress | Sophie Laurent | James Chen, Noah Takahashi                  | -6w   | +2w | 180h   |
| ERP Analysis           | Main planning | —      | Done        | Sophie Laurent | Marc Dubois, Elena Rossi                    | -3m   | -6w | 100h   |
| ERP Implementation     | Main planning | —      | In progress | Sophie Laurent | Marc Dubois, Ravi Patel, Sarah Jensen       | -6w   | +1m | 240h   |
| Data Audit             | Main planning | —      | Done        | Sophie Laurent | Elena Rossi                                 | -2m   | -1m | 40h    |
| Migration Scripts      | Main planning | —      | In progress | Sophie Laurent | Ravi Patel                                  | -1m   | now | 60h    |
| Dashboard Mockups      | Main planning | —      | Done        | Liam O'Brien   | Yuki Tanaka, Marie Lefevre                  | -2m   | -1m | 60h    |
| Dashboard Frontend     | Main planning | —      | In progress | Sophie Laurent | James Chen, Noah Takahashi                  | -3w   | +1m | 120h   |
| Dashboard API          | Main planning | —      | In progress | Sophie Laurent | Sarah Jensen                                | -3w   | +1m | 80h    |
| Platform Architecture  | Main planning | —      | Done        | Sophie Laurent | Marc Dubois                                 | -3m   | -2m | 60h    |
| Platform Core Build    | Main planning | —      | In progress | Sophie Laurent | Marc Dubois, Elena Rossi, Ravi Patel        | -2m   | +2m | 300h   |
| API Spec               | Main planning | —      | Done        | Sophie Laurent | Sarah Jensen                                | -2m   | -1m | 40h    |
| API Implementation     | Main planning | —      | Backlog     | Sophie Laurent | Sarah Jensen, Noah Takahashi                | now   | +2m | 120h   |
| E-commerce Discovery   | Main planning | —      | In progress | Liam O'Brien   | Ana Pereira, Yuki Tanaka                    | -2w   | +2w | 60h    |
| Sales Proposals        | Main planning | —      | In progress | Thomas Muller  | Clara Fontaine, Nils Eriksson, Carlos Ruiz  | -3m   | now | —      |
| Lead Outreach          | Main planning | —      | In progress | Thomas Muller  | Nils Eriksson, Carlos Ruiz                  | -3m   | now | —      |
| Content Calendar       | Main planning | —      | In progress | Rachel Adams   | David Kim, Fatima Al-Hassan, Hannah Schmidt | -3m   | now | —      |
| Team Meetings          | Main planning | —      | In progress | Oliver Wright  | —                                           | -3m   | now | —      |
| Hiring Pipeline        | Main planning | —      | In progress | Oliver Wright  | Emma Costa, Isabelle Moreau                 | -3m   | now | —      |
| Office IT              | Main planning | —      | In progress | Oliver Wright  | Lucas Bernard                               | -3m   | now | —      |

## Tags

### Department

| Name        | Category   | Tagged Persons                                                                                               |
| ----------- | ---------- | ------------------------------------------------------------------------------------------------------------ |
| Engineering | Department | Sophie Laurent, Marc Dubois, Elena Rossi, James Chen, Priya Sharma, Sarah Jensen, Ravi Patel, Noah Takahashi |
| Design      | Department | Liam O'Brien, Ana Pereira, Yuki Tanaka, Marie Lefevre                                                        |
| Sales       | Department | Thomas Muller, Clara Fontaine, Nils Eriksson, Carlos Ruiz                                                    |
| Marketing   | Department | Rachel Adams, David Kim, Fatima Al-Hassan, Hannah Schmidt                                                    |
| Operations  | Department | Oliver Wright, Emma Costa, Lucas Bernard, Isabelle Moreau                                                    |

### Location

| Name | Category | Tagged Persons                                                                                             |
| ---- | -------- | ---------------------------------------------------------------------------------------------------------- |
| US   | Location | James Chen, Rachel Adams, David Kim                                                                        |
| UK   | Location | Priya Sharma, Nils Eriksson, Oliver Wright, Ravi Patel                                                     |
| BE   | Location | Marc Dubois, Thomas Muller, Sarah Jensen, Hannah Schmidt                                                   |
| FR   | Location | Sophie Laurent, Yuki Tanaka, Clara Fontaine, Lucas Bernard, Marie Lefevre, Noah Takahashi, Isabelle Moreau |
| ES   | Location | Ana Pereira, Fatima Al-Hassan, Carlos Ruiz                                                                 |
| IT   | Location | Elena Rossi, Emma Costa                                                                                    |

### Contract

| Name       | Category | Tagged Persons                                                                                                                                                                                                                                                                 |
| ---------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Internal   | Contract | Sophie Laurent, Marc Dubois, Elena Rossi, James Chen, Liam O'Brien, Ana Pereira, Yuki Tanaka, Thomas Muller, Clara Fontaine, Rachel Adams, David Kim, Fatima Al-Hassan, Oliver Wright, Emma Costa, Lucas Bernard, Sarah Jensen, Marie Lefevre, Noah Takahashi, Isabelle Moreau |
| Contractor | Contract | Priya Sharma, Nils Eriksson, Ravi Patel, Carlos Ruiz, Hannah Schmidt                                                                                                                                                                                                           |

## Custom Fields

### Field Definitions

| Name          | Type | Visibility |
| ------------- | ---- | ---------- |
| Date of Entry | date | persons    |
| Payroll ID    | text | persons    |

### Field Values

| Person           | Date of Entry | Payroll ID |
| ---------------- | ------------- | ---------- |
| Sophie Laurent   | -2y           | PAY-001    |
| Marc Dubois      | -18m          | PAY-002    |
| Elena Rossi      | -18m          | PAY-003    |
| James Chen       | -1y           | PAY-004    |
| Priya Sharma     | -8m           | PAY-005    |
| Liam O'Brien     | -2y           | PAY-006    |
| Ana Pereira      | -14m          | PAY-007    |
| Yuki Tanaka      | -1y           | PAY-008    |
| Thomas Muller    | -2y           | PAY-009    |
| Clara Fontaine   | -10m          | PAY-010    |
| Nils Eriksson    | -6m           | PAY-011    |
| Rachel Adams     | -18m          | PAY-012    |
| David Kim        | -1y           | PAY-013    |
| Fatima Al-Hassan | -8m           | PAY-014    |
| Oliver Wright    | -2y           | PAY-015    |
| Emma Costa       | -14m          | PAY-016    |
| Lucas Bernard    | -1y           | PAY-017    |
| Sarah Jensen     | -10m          | PAY-018    |
| Ravi Patel       | -4m           | PAY-019    |
| Marie Lefevre    | -6m           | PAY-020    |
| Carlos Ruiz      | -5m           | PAY-021    |
| Hannah Schmidt   | -3m           | PAY-022    |
| Noah Takahashi   | -8m           | PAY-023    |
| Isabelle Moreau  | -6m           | PAY-024    |

## Time Records

| Person           | Client              | Activity       | Hours/Day | Days/Week | Period           | Comments                                                    |
| ---------------- | ------------------- | -------------- | --------- | --------- | ---------------- | ----------------------------------------------------------- |
| Marc Dubois      | Website Redesign    | Analysis       | 5         | 4         | -3m to -2m       | Stakeholder interviews, Document requirements, Review specs |
| Marc Dubois      | ERP Integration     | Analysis       | 3         | 3         | -3m to -6w       | System audit, Gap analysis, Vendor calls                    |
| Marc Dubois      | ERP Integration     | Development    | 6         | 5         | -6w to yesterday | Module config, Integration testing, Data mapping            |
| Marc Dubois      | Website Redesign    | Development    | 3         | 3         | -2m to yesterday | Core module, Service layer, DB schema                       |
| Elena Rossi      | Website Redesign    | Analysis       | 4         | 3         | -3m to -2m       | Technical assessment, API review                            |
| Elena Rossi      | ERP Integration     | Analysis       | 4         | 4         | -3m to -6w       | Data flow mapping, Integration specs                        |
| Elena Rossi      | Data Migration      | Development    | 6         | 5         | -2m to -1m       | Schema analysis, Data quality checks, Cleanup scripts       |
| Elena Rossi      | ERP Integration     | Development    | 5         | 4         | -1m to yesterday | ETL pipeline, Data layer                                    |
| James Chen       | Website Redesign    | Development    | 6         | 5         | -1m to yesterday | Component library, Page templates, Responsive layout        |
| James Chen       | Mobile App          | Development    | 3         | 3         | -6w to yesterday | Navigation, Core screens                                    |
| James Chen       | Dashboard           | Development    | 3         | 3         | -3w to yesterday | Chart components, Filter panel                              |
| Sarah Jensen     | Website Redesign    | Development    | 5         | 4         | -1m to yesterday | REST endpoints, Auth middleware                             |
| Sarah Jensen     | Dashboard           | Development    | 4         | 3         | -3w to yesterday | Aggregation queries, API routes                             |
| Sarah Jensen     | ERP Integration     | Analysis       | 5         | 4         | -2m to -1m       | OpenAPI spec, Schema design                                 |
| Ravi Patel       | ERP Integration     | Development    | 5         | 4         | -6w to yesterday | Connector scripts, Sync jobs                                |
| Ravi Patel       | Data Migration      | Development    | 6         | 5         | -1m to yesterday | ETL scripts, Validation                                     |
| Noah Takahashi   | Website Redesign    | Development    | 5         | 4         | -1m to yesterday | Interactive features, Performance                           |
| Noah Takahashi   | Mobile App          | Development    | 4         | 3         | -6w to yesterday | State management, API integration                           |
| Noah Takahashi   | Dashboard           | Development    | 3         | 2         | -3w to yesterday | Data tables, Export feature                                 |
| Priya Sharma     | Website Redesign    | Development    | 2         | 3         | -3m to yesterday | Code review, Documentation                                  |
| Ana Pereira      | Website Redesign    | Design         | 6         | 5         | -2m to -1m       | Wireframes, Visual design, Prototype                        |
| Ana Pereira      | Mobile App          | Design         | 5         | 4         | -3m to -2m       | Mobile flows, App wireframes                                |
| Ana Pereira      | E-commerce Platform | Design         | 5         | 4         | -2w to yesterday | Moodboards, Competitor analysis                             |
| Yuki Tanaka      | Website Redesign    | Design         | 5         | 4         | -2m to -1m       | Design system, Icon set                                     |
| Yuki Tanaka      | Dashboard           | Design         | 6         | 5         | -2m to -1m       | Dashboard layouts, Data viz                                 |
| Yuki Tanaka      | E-commerce Platform | Design         | 4         | 3         | -2w to yesterday | UX research, User flows                                     |
| Marie Lefevre    | Dashboard           | Design         | 3         | 3         | -2m to -1m       | Illustrations, Branding                                     |
| Sophie Laurent   | —                   | Meeting        | 1         | 5         | -3m to yesterday | Standup, Sprint planning                                    |
| Sophie Laurent   | —                   | Administration | 2         | 2         | -3m to yesterday | Candidate review, Interviews                                |
| Liam O'Brien     | —                   | Meeting        | 1         | 5         | -3m to yesterday | Design critique, Standup                                    |
| Thomas Muller    | —                   | Sales          | 4         | 4         | -3m to yesterday | Proposals, Pitch decks, Client calls                        |
| Thomas Muller    | —                   | Sales          | 2         | 3         | -3m to yesterday | Prospecting, Follow-ups                                     |
| Clara Fontaine   | —                   | Sales          | 5         | 4         | -3m to yesterday | RFP responses, Pricing                                      |
| Nils Eriksson    | —                   | Sales          | 5         | 4         | -3m to yesterday | Cold outreach, Demo calls                                   |
| Carlos Ruiz      | —                   | Sales          | 3         | 3         | -3m to yesterday | Account research, Proposals                                 |
| Carlos Ruiz      | —                   | Sales          | 3         | 3         | -3m to yesterday | Pipeline management                                         |
| Rachel Adams     | —                   | Meeting        | 1         | 3         | -3m to yesterday | Marketing sync                                              |
| Rachel Adams     | —                   | Administration | 3         | 4         | -3m to yesterday | Content strategy, Review                                    |
| David Kim        | —                   | Administration | 5         | 5         | -3m to yesterday | Blog posts, Social media, Analytics                         |
| Fatima Al-Hassan | —                   | Administration | 3         | 4         | -3m to yesterday | Copy, Newsletters                                           |
| Hannah Schmidt   | —                   | Administration | 4         | 4         | -3m to yesterday | SEO optimization, Campaigns                                 |
| Oliver Wright    | —                   | Meeting        | 2         | 5         | -3m to yesterday | All-hands, Ops standup                                      |
| Oliver Wright    | —                   | Administration | 3         | 3         | -3m to yesterday | Job postings, Screening                                     |
| Emma Costa       | —                   | Administration | 5         | 4         | -3m to yesterday | Scheduling, Onboarding                                      |
| Isabelle Moreau  | —                   | Administration | 3         | 3         | -3m to yesterday | Background checks, Contracts                                |
| Lucas Bernard    | —                   | Administration | 6         | 5         | -3m to yesterday | IT support, Procurement, Vendor management                  |

> When Client is `—`, the time record only has the Activity project in `projectIds`. When both Client and Activity are present, `projectIds` contains both IDs.
