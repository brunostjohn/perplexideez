import { redirect } from "@sveltejs/kit";
import type { LayoutServerLoad } from "./$types";

export const load: LayoutServerLoad = async ({ locals: { auth } }) => {
  const session = await auth();
  if (!session) {
    return redirect(307, "/auth");
  }

  const { user: { name, email, image } = {} } = session;

  return {
    user: {
      name: name ?? undefined,
      email: email!,
      image: image ?? undefined,
    },
  };
};
