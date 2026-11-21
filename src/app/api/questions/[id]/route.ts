import { questionsCrud } from "@/lib/api/crud-configs";
import { crudRoutes } from "@/lib/api/crud";

const routes = crudRoutes(questionsCrud);

export const GET = routes.getById;
export const PATCH = routes.update;
export const DELETE = routes.remove;
