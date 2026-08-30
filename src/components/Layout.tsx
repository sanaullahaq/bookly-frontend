import { Outlet } from "react-router-dom";
import NavBar from "./NavBar";

export default function Layout() {
  return (
    <div className="min-h-svh bg-gray-100">
      <NavBar />
      <main className="mx-auto max-w-5xl px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
}

{
  /* <main> is a semantic HTML5 element — it marks the primary content region of a page, distinct from things like navigation, headers, sidebars, or footers. */
  /* <Outlet /> is the placeholder where the matched child route is rendered. */
}
