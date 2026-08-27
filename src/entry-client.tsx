import { createRoot, hydrateRoot } from "react-dom/client";
import { RouterProvider } from "@tanstack/react-router";
import { getRouter } from "./router";
import "./styles.css";

const router = getRouter();
const rootElement = document.getElementById("root");

if (rootElement) {
  if (rootElement.children.length > 0) {
    hydrateRoot(rootElement, <RouterProvider router={router} />);
  } else {
    createRoot(rootElement).render(<RouterProvider router={router} />);
  }
}
