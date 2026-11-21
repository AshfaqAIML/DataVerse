import { bookmarksCrud } from "@/lib/api/crud-configs";
import { crudRoutes } from "@/lib/api/crud";

const routes = crudRoutes(bookmarksCrud);

export const GET = routes.getById;
export const PATCH = routes.update;
export const DELETE = routes.remove;
