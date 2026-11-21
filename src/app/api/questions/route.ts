import { questionsCrud } from "@/lib/api/crud-configs";
import { crudRoutes } from "@/lib/api/crud";

const routes = crudRoutes(questionsCrud);

export const GET = routes.list;
export const POST = routes.create;
