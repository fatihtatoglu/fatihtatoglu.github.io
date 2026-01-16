import { corsHeaders, jsonResponse } from "./http/response.js";
import { handleEvent } from "./services/analytics_service.js";
import { handleContact } from "./services/contact_service.js";
import {
  handleGetComments,
  handleGetCounts,
  handlePost,
  isAction,
  toCommentAction
} from "./services/post_service.js";
import { getPathname } from "./http/request.js";

export default {
  async fetch(req, env) {
    try {
      const pathname = getPathname(req);

      if (req.method === "OPTIONS") {
        return new Response(null, { status: 204, headers: corsHeaders(req) });
      }

      if (!pathname) {
        return jsonResponse({ error: "Missing post id" }, 400, req);
      }

      const segments = pathname.split("/");
      const postId = segments[0];
      const action = segments[1];

      if (req.method === "POST" && (pathname === "view" || pathname === "event")) {
        const forcedType = pathname === "view" ? "view" : "";
        return handleEvent(req, env, forcedType);
      }

      if (req.method === "POST" && pathname === "contact") {
        return handleContact(req, env);
      }

      if (req.method === "GET" && segments.length === 1) {
        return handleGetCounts(postId, env, req);
      }

      if (req.method === "GET" && action === "comment" && segments.length === 2) {
        return handleGetComments(postId, env, req);
      }

      if (req.method === "POST" && isAction(action) && segments.length === 2) {
        return handlePost(req, env, postId, action, "");
      }

      if (req.method === "POST" && action === "comment" && segments.length === 4) {
        const commentId = segments[2];
        const commentAction = toCommentAction(segments[3]);
        if (!commentAction) {
          return jsonResponse({ error: "Not found" }, 404, req);
        }
        return handlePost(req, env, postId, commentAction, commentId);
      }

      return jsonResponse({ error: "Not found" }, 404, req);
    } catch (error) {
      return jsonResponse({ error: "Unhandled error", detail: String(error) }, 500, req);
    }
  }
};
