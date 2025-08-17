/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as alex_ai_assessment from "../alex_ai_assessment.js";
import type * as employees from "../employees.js";
import type * as equipment from "../equipment.js";
import type * as invoices from "../invoices.js";
import type * as leads from "../leads.js";
import type * as photos from "../photos.js";
import type * as proposals from "../proposals.js";
import type * as treeScore from "../treeScore.js";
import type * as workOrders from "../workOrders.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  alex_ai_assessment: typeof alex_ai_assessment;
  employees: typeof employees;
  equipment: typeof equipment;
  invoices: typeof invoices;
  leads: typeof leads;
  photos: typeof photos;
  proposals: typeof proposals;
  treeScore: typeof treeScore;
  workOrders: typeof workOrders;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
