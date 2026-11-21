import { testCasesCrud } from "@/lib/api/crud-configs";
import { crudRoutes } from "@/lib/api/crud";

const routes = crudRoutes(testCasesCrud);

export const GET = routes.getById;
export const PATCH = routes.update;
export const DELETE = routes.remove;
