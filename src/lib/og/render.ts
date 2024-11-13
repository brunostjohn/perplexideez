import satori from "satori";
import { Resvg } from "@resvg/resvg-js";
import { html as toReactNode } from "satori-html";
import { read } from "$app/server";
import { render } from "svelte/server";
import type { Component, ComponentProps, ComponentType, SvelteComponent } from "svelte";
import InterRegular from "$lib/assets/Inter_18pt-Regular.ttf";
import InterSemiBold from "$lib/assets/Inter_18pt-SemiBold.ttf";
import InterBold from "$lib/assets/Inter_18pt-Bold.ttf";

const interRegularData = read(InterRegular).arrayBuffer();
const interSemiBoldData = read(InterSemiBold).arrayBuffer();
const interBoldData = read(InterBold).arrayBuffer();

interface Options<C extends Component, P extends ComponentProps<C>> {
  width: number;
  height: number;
  component: {} extends P
    ? C extends SvelteComponent<any>
      ? ComponentType<C>
      : C
    : C extends SvelteComponent<any>
      ? ComponentType<C>
      : C;
  options?: {} extends P
    ? { props?: Omit<P, "$$slots" | "$$events">; context?: Map<any, any> } | undefined
    : { props: Omit<P, "$$slots" | "$$events">; context?: Map<any, any> };
}

export const componentToPng = async <T extends Component, P extends ComponentProps<T>>({
  component,
  options,
  height,
  width,
}: Options<T, P>) => {
  // @ts-expect-error - this is fine
  const result = render(component, options);
  const markup = toReactNode(`${result.body}${result.head}`);
  const svg = await satori(markup, {
    fonts: [
      {
        name: "Inter",
        data: await interRegularData,
        style: "normal",
        weight: 300,
      },
      {
        name: "Inter",
        data: await interSemiBoldData,
        style: "normal",
        weight: 500,
      },
      {
        name: "Inter",
        data: await interBoldData,
        style: "normal",
        weight: 700,
      },
    ],
    height: +height,
    width: +width,
  });

  const resvg = new Resvg(svg, {
    fitTo: {
      mode: "width",
      value: +width,
    },
  });

  const png = resvg.render();

  return new Response(png.asPng(), {
    headers: {
      "content-type": "image/png",
    },
  });
};
