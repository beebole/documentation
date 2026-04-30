---
title: "Feedback Miguel"
---

## Questions

- Main page - only 'project time tracking'? No Planning, no expenses?
- How we handle when planned features have not been developed yet, should we remove them from the doc to be consistent? (Ex: Timesheet timer, custom fields in reports)
- Do we use Potential owners or Assignments?

## General

- There is no Settings > Account but an option Account Settings when clicking on the lower icon with the user's name initials. This is repeated anywhere Settings is mentioned.
- The PLUS button to add employees contains a text. It might be confusing specifying only the Plus sign. This happens multiple times when describing how to add things. It should always be Add [name] Ex: Add Person, Add Task
- Tasks should only be named under the context of Planning. Any reference to "task" as a specificy categorization

## Getting started

### Quickstart

- Under Step 1, confusing usage of projects and tasks. Tasks should always be used in the context of Planning. Users can also track time on tasks, not only projects.
- There is currently no Start timer link in the timesheet
- There is no option Time in Reports. Only folders and reports.
- There is also no option to Group your data.
- Specify that reports can be organized in folders, displayed on the left hand side.

### Key Concepts

- Mention that it is possible to track time on Tasks as well.
- Tags can also be linked to Tasks.

## Configuration

### Work schedules

- A work schedule doesn't need to follow a weekly pattern but any number of days. Keep using weekly schedule as the most common example but provide other examples as 2 weeks or 10 days.
- It is not possible to assign schedules for overlapping periods at the same level (person, tag or organisation).

## Custom fields

- Sort types in alphabetical order to match how they appear in the application, both in the Fields type list and in the step by step instructions.
- Don't use Billable flag as an example of a Boolean custom field. Use Billed instead.

## Account

### Account Settings

- This section is empty. Add an explanation no how to arrive there, which is clicking on the lower button with the user initials and then clicking on Account Settings

## Authentication and Security

- There are no passwords. Security is managed via email pins and passkeys

## Integrations

### Quickbooks online

- Only time entries are imported into QB. Expenses are currently not synched and only handled in Beebole.
- Add a section to import Customers and Items from QB into Beebole when enabling the integration. Enabling the integration also import QB employees in Beebole, similarly to the other integrations.
- When exporting time activities to QB, it is a one-click button. User only selects the period and the integration gets Beebole time entries for that period and automatically creates the Time Activities in QB. Only errors are displayed on the screen. User can go to QB to verify the Time Activities successfully created.
- When importing people, the user needs to select the default role to assign to those people, as for the other integrations.

## BambooHR

- All absences imported from Bamboo are created as paid in Beebole, even if they are defined as unpaid in Bamboo. User needs to replicate the change manually in Beebole once the absence has been created.
