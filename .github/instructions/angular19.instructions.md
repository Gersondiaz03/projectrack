---
applyTo: "**"
---

- Always prioritize signals first. Ensure that the components and services follow the proper signal pattern, with clear and reactive state changes through Observables or Signals in Angular.

- Assume the frontend is always running on Angular at port 4200, do not create newserver runnings, it is always running if you need to.

- Always use Angular 19 best practices, including the use of modules, components, services, and directives where applicable.

- We are using PrimeNG19, look at the web for documentation and use best practices.

- Always use Angular CLI for project management, including generating components, services, and modules, to maintain consistency.

- Ensure that components focus on a single responsibility; avoid mixing business logic with presentation logic.

- Always separate concerns by keeping HTML, CSS, and TypeScript in their respective files. Keep the templates clean and only bind logic through the component class.

- Use Reactive Forms or Template-Driven Forms for handling user input, with proper validation and error handling.

- Always use Angular’s Dependency Injection (DI) for services and avoid creating tight coupling between components and services.

- Follow the Angular style guide and linting rules to ensure consistent code style and readability.

- Use lazy loading for large modules to optimize the application’s performance and reduce initial load time.

- For state management, prefer using NgRx or Angular Services with Observables or Signals to manage shared application state.

- Use ALWAYS Tailwind CSS v4 for styling and ensure utility-first classes are used consistently.

- Document components, services, and modules with inline comments and maintain a readable code structure.

- Always ensure that the component or file you are working on is functional and error-free before moving to the next one.

- Always use Angular's newest HTML syntax (@if, @for, etc...).

- Remember we have SSR so apply SSR whenever is possible.

- If you are going to create a component, do it with Angular CLI ALWAYS.

- NEVER START ANGULAR SERVER OR NESTJS SERVER, THEY ARE ALWAYS RUNNING.
