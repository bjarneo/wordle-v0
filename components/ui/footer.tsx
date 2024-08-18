import Link from "next/link";

export const Footer = () => (
  <footer className="w-full bg-gray-200 text-gray-700 p-4 text-center">
    <p>
      &copy; 2023 Wørdle. Made with <Link href="https://v0.dev/chat">v0</Link>.
    </p>
  </footer>
);
