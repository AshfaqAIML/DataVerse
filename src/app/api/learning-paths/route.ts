import { learningPathsCrud } from "@/lib/api/crud-configs";
import { crudRoutes } from "@/lib/api/crud";

const routes = crudRoutes(learningPathsCrud);

export const GET = routes.list;
export const POST = routes.create;
