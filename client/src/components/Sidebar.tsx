import { Link, useLocation } from "wouter";
import { LayoutDashboard, PlusCircle, Settings, Stethoscope } from "lucide-react";

export function Sidebar() {
  const [location] = useLocation();

  const isActive = (path: string) => location === path;

  const links = [
    { href: "/", label: "Dashboard", icon: LayoutDashboard },
    { href: "/new-case", label: "New Case", icon: PlusCircle },
    { href: "/settings", label: "Settings", icon: Settings },
  ];

  return (
    <div className="w-64 bg-white border-r border-slate-200 flex flex-col h-screen fixed left-0 top-0 z-50 shadow-sm">
      <div className="p-6 flex items-center gap-3 border-b border-slate-100">
        <div className="w-10 h-10 bg-gradient-to-tr from-primary to-blue-400 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
          <Stethoscope size={20} strokeWidth={2.5} />
        </div>
        <div>
          <h1 className="font-display font-bold text-lg leading-tight text-slate-900">Case → Care</h1>
          <p className="text-xs text-slate-500 font-medium">Medical AI Assistant</p>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-2 mt-4">
        {links.map((link) => {
          const Icon = link.icon;
          const active = isActive(link.href);
          
          return (
            <Link key={link.href} href={link.href} className={`
              flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group
              ${active 
                ? "bg-primary text-white shadow-md shadow-blue-500/25 font-semibold" 
                : "text-slate-600 hover:bg-slate-50 hover:text-primary font-medium"}
            `}>
              <Icon 
                size={20} 
                className={active ? "opacity-100" : "opacity-70 group-hover:opacity-100"} 
                strokeWidth={active ? 2.5 : 2}
              />
              {link.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-6 border-t border-slate-100">
        <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
          <h4 className="text-sm font-bold text-blue-900 mb-1">Status</h4>
          <div className="flex items-center gap-2 text-xs text-blue-700">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            System Operational
          </div>
        </div>
      </div>
    </div>
  );
}
