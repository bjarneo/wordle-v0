import { Button } from "@/components/ui/button";

export const Header = () => (
  <header className="w-full bg-[#990000] text-white p-4 flex justify-between items-center">
    <h1 className="text-lg font-bold">WØRDLE</h1>
    <Button
      variant="outline"
      className="bg-white text-[#990000] hover:bg-gray-100"
    >
      Sign In
    </Button>
  </header>
);
