import { BarChart3, TrendingUp, Users, Eye, Heart } from "lucide-react";

export function AnalyticsPlaceholder() {
  const mockStats = [
    { label: "Impressoes", value: "12.4K", icon: Eye, change: "+18%" },
    { label: "Alcance", value: "8.2K", icon: Users, change: "+12%" },
    { label: "Engajamento", value: "4.7%", icon: Heart, change: "+5%" },
    { label: "Crescimento", value: "+340", icon: TrendingUp, change: "+8%" },
  ];

  return (
    <div className="h-full flex flex-col items-center justify-center p-8" style={{ backgroundColor: "#0A0A0F" }}>
      <div className="max-w-lg w-full text-center">
        {/* Icon */}
        <div className="w-24 h-24 rounded-3xl mx-auto mb-8 flex items-center justify-center relative" style={{ background: "linear-gradient(135deg, rgba(51,119,175,0.15), rgba(131,247,20,0.1))" }}>
          <BarChart3 className="h-12 w-12" style={{ color: "#3377AF" }} />
          <div className="absolute -top-1 -right-1 px-2 py-0.5 rounded-full text-[10px] font-bold" style={{ background: "linear-gradient(135deg, #3377AF, #83F714)", color: "#0A0A0F" }}>
            EM BREVE
          </div>
        </div>

        <h2 className="text-2xl font-bold text-white mb-3">Analytics</h2>
        <p className="text-sm mb-8" style={{ color: "#94A3B8" }}>
          Acompanhe o desempenho dos seus carrosseis com metricas detalhadas de alcance, engajamento e crescimento.
        </p>

        {/* Mock stats preview */}
        <div className="grid grid-cols-2 gap-3 mb-8 opacity-50">
          {mockStats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                className="p-4 rounded-xl text-left"
                style={{ backgroundColor: "#12121A", border: "1px solid rgba(255,255,255,0.06)" }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Icon className="h-4 w-4" style={{ color: "#3377AF" }} />
                  <span className="text-[10px] uppercase tracking-wider" style={{ color: "#94A3B8" }}>{stat.label}</span>
                </div>
                <div className="flex items-end gap-2">
                  <span className="text-2xl font-bold text-white">{stat.value}</span>
                  <span className="text-xs font-medium mb-1" style={{ color: "#83F714" }}>{stat.change}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Mock chart bars */}
        <div className="flex items-end justify-center gap-2 h-24 mb-4 opacity-30">
          {[40, 65, 55, 80, 70, 90, 60, 75, 85, 50, 95, 70].map((h, i) => (
            <div
              key={i}
              className="w-6 rounded-t-md"
              style={{
                height: `${h}%`,
                background: `linear-gradient(180deg, #3377AF, ${i % 3 === 0 ? "#83F714" : "#3377AF"})`,
              }}
            />
          ))}
        </div>

        <p className="text-xs" style={{ color: "#94A3B8", opacity: 0.6 }}>
          Esta funcionalidade esta sendo desenvolvida e estara disponivel em breve.
        </p>
      </div>
    </div>
  );
}
