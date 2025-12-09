import "@/styles/globals.css";
import Cursor from "@/components/Cursor";
import { useRouter } from "next/router";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Bob Bass",
  description: "Portfolio for Bob Bass",
};

const navItems = [
  {
    name: "home",
    to: "/",
  },
  {
    name: "tech",
    to: "/tech",
  },
  {
    name: "work",
    to: "/work",
  },
  {
    name: "contact",
    to: "/contact",
  },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { pathname } = router;

  return (
    <>
      <Cursor />
      <nav
        style={{
          background:
            "linear-gradient(to bottom, rgba(0,0,0,0.8), rgba(0,0,0,0.5))",
          backdropFilter: "blur(5px)",
        }}
        className="w-full flex h-24 absolute top-0 left-0 p-8 transition-all z-30 shadow-2xl"
      >
        <div className="flex flex-grow flex-row justify-between mx-auto m-auto">
          {navItems.map((item) => (
            <Link
              href={item.to !== pathname ? item.to : ""}
              key={item.name}
              className={[
                "text-white m-auto text-md transition-all hover:text-lg select-none",
                item.to === pathname && "cursor-default underline",
              ].join(" ")}
            >
              {"//"} {item.name}
            </Link>
          ))}
        </div>
      </nav>

      <div className="transition-all h-screen">
        <main className="w-full h-full flex flex-col p-8 z-20">
          <div className="text-white m-auto flex flex-col md:flex-row">
            {children}
          </div>
        </main>
      </div>
    </>
  );
}
