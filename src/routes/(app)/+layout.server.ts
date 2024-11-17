import { redirect } from "@sveltejs/kit";
import type { LayoutServerLoad } from "./$types";

export const load: LayoutServerLoad = async ({ locals: { auth } }) => {
  const session = await auth();
  if (!session) {
    return redirect(307, "/auth");
  }

  // @ts-expect-error - cba to fix this for now as well
  const { user: { name, email, image, role } = {} } = session;

  return {
    user: {
      name: name ?? undefined,
      email: email!,
      image: image ?? undefined,
      role: (role as string | undefined | null) ?? undefined,
    },
  };
};
