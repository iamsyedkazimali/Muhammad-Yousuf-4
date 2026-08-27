import { createFileRoute, Outlet } from "@tanstack/react-router";

/** Super Admin section root — client rendered because auth lives in localStorage. */
export const Route = createFileRoute("/super-admin")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Platform Control — Super Admin" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: () => <Outlet />,
});
