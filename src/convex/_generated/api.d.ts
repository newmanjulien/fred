/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as dealDetail from "../dealDetail.js";
import type * as industryInternal from "../industryInternal.js";
import type * as mutations from "../mutations.js";
import type * as myDeals from "../myDeals.js";
import type * as newBusiness from "../newBusiness.js";
import type * as opportunities from "../opportunities.js";
import type * as readModels from "../readModels.js";
import type * as shell from "../shell.js";
import type * as sinceLastMeeting from "../sinceLastMeeting.js";
import type * as validators from "../validators.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  dealDetail: typeof dealDetail;
  industryInternal: typeof industryInternal;
  mutations: typeof mutations;
  myDeals: typeof myDeals;
  newBusiness: typeof newBusiness;
  opportunities: typeof opportunities;
  readModels: typeof readModels;
  shell: typeof shell;
  sinceLastMeeting: typeof sinceLastMeeting;
  validators: typeof validators;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
