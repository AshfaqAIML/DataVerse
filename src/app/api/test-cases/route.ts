import { testCasesCrud } from "@/lib/api/crud-configs";
import { crudRoutes } from "@/lib/api/crud";

const routes = crudRoutes(testCasesCrud);

export const GET = routes.list;
export const POST = routes.create;
