import { error } from "@sveltejs/kit";
import type { LayoutServerLoad } from "./$types";

export const load: LayoutServerLoad = async ({ locals: { auth } }) => {
  const session = await auth();
  if (!session || !session.user) return error(401, "Unauthorized");
  // @ts-expect-error - cba to fix this for now
  const role = session.user.role;
  const isAdmin = role === "Admin";
  if (!isAdmin) return error(403, "Forbidden");
};
