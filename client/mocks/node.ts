import { setupServer } from "msw/node";
import { handlers } from "./handlers";

export const server = setupServer(...handlers);

// Start/stop in Cypress lifecycle
before(() => server.listen());
afterEach(() => server.resetHandlers());
after(() => server.close());
