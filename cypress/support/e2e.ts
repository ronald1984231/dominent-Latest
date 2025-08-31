import "./commands";
import { server } from "../../client/mocks/node";

// Start MSW when Cypress starts
before(() => server.listen());
afterEach(() => server.resetHandlers());
after(() => server.close());
