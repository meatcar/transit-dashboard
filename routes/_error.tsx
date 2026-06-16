import { HttpError } from "fresh";
import type { PageProps } from "fresh";

export default function ErrorPage(props: PageProps) {
  const error = props.error;
  if (error instanceof HttpError && error.status === 404) {
    return (
      <div class="px-4 py-8 mx-auto bg-[#86efac]">
        <div class="max-w-screen-md mx-auto flex flex-col items-center justify-center">
          <h1 class="text-4xl font-bold">404 - Page not found</h1>
          <p class="my-4">The page you were looking for doesn't exist.</p>
          <a href="/" class="underline">Go back home</a>
        </div>
      </div>
    );
  }
  return (
    <div class="px-4 py-8 mx-auto">
      <h1 class="text-4xl font-bold">Something went wrong</h1>
    </div>
  );
}
