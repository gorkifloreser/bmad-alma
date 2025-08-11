# Technical Assumptions
**Repository Structure: Monorepo**
*   We will use a monorepo managed with **Turborepo**. This is ideal for a full-stack TypeScript project, as it simplifies code sharing (e.g., for types and validation logic) between the Next.js front-end and the Nest.js back-end.

**Service Architecture: Modular Monolith**
*   The application will be built as a modular monolith to begin with. The back-end (Nest.js) will be well-structured with clear boundaries between modules (e.g., Brand Heart, Offerings, Funnels). This approach provides a simpler development and deployment model initially, while allowing for the potential extraction of modules into separate microservices in the future as the application scales.

**Testing Requirements: Full Testing Pyramid**
*   Our testing strategy will be comprehensive, including:
    *   **Unit Tests:** Jest and React Testing Library (RTL) for the front-end; Jest for the back-end.
    *   **Integration Tests:** Supertest for testing API endpoints on the back-end.
    *   **End-to-End (E2E) Tests:** Cypress for testing critical user flows across the entire application.

**Additional Technical Assumptions and Requests**
*   **Database & Services:** We will leverage Supabase for core services like PostgreSQL database, Authentication, and Storage to accelerate initial development.
*   **Infrastructure as Code (IaC):** Terraform will be used to define and manage our cloud infrastructure, ensuring it is version-controlled and reproducible.
*   **CI/CD:** GitHub Actions will be used to automate our testing and deployment pipelines.
*   **Monitoring & Logging:** Sentry will be used for error monitoring, and Pino for structured logging on the back-end.
