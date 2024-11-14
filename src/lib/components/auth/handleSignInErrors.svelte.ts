import { page } from "$app/stores";
import { toast } from "svelte-sonner";
import { fromStore } from "svelte/store";

export const handleSignInErrors = () => {
  $effect(() => {
    const pageStore = fromStore(page);
    const pageUrlParams = pageStore.current.url.searchParams as URLSearchParams;
    const code = pageUrlParams.get("code");
    const error = pageUrlParams.get("error");
    if (code !== "credentials" || !error) return;
    dispatchErrorToast(error as AuthError);
  });
};

type AuthError = "CredentialsSignin";

const dispatchErrorToast = (error: AuthError) => {
  switch (error) {
    case "CredentialsSignin":
      toast.error("Invalid email or password", {
        description: "Please try again.",
      });
      break;
    default:
      break;
  }
};
