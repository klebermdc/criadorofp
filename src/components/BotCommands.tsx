import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { MessageSquare, Bot, Clock, CheckCircle2, AlertCircle, Loader2, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

interface BotCommand {
  id: string;
  source: string;
  command: string;
  args: Record<string, unknown> | null;
  user_id: string | null;
  user_name: string | null;
  status: string;
  result: Record<string, unknown> | null;
  created_at: string;
  processed_at: string | null;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; icon: React.ElementType }> = {
  pending: { label: "Pendente", color: "#eab308", bg: "rgba(234,179,8,0.15)", icon: Clock },
  processing: { label: "Processando", color: "#3b82f6", bg: "rgba(59,130,246,0.15)", icon: Loader2 },
  completed: { label: "Concluido", color: "#22c55e", bg: "rgba(34,197,94,0.15)", icon: CheckCircle2 },
  error: { label: "Erro", color: "#ef4444", bg: "rgba(239,68,68,0.15)", icon: AlertCircle },
};

function sourceIcon(source: string) {
  if (source === "discord") return <MessageSquare className="h-4 w-4" style={{ color: "#5865F2" }} />;
  if (source === "telegram") return <Bot className="h-4 w-4" style={{ color: "#0088cc" }} />;
  return <Bot className="h-4 w-4" style={{ color: "#94A3B8" }} />;
}

function formatTime(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function BotCommands() {
  const [commands, setCommands] = useState<BotCommand[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCommands = async () => {
    try {
      const { data, error: fetchError } = await supabase
        .from("bot_commands" as any)
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);

      if (fetchError) throw fetchError;
      setCommands((data as unknown as BotCommand[]) || []);
      setError(null);
    } catch {
      // Table might not exist yet — show empty state without error
      setCommands([]);
      setError(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCommands();
    const interval = setInterval(fetchCommands, 10000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin" style={{ color: "#3377AF" }} />
      </div>
    );
  }

  if (commands.length === 0 && !error) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-6 px-4">
        <div
          className="w-20 h-20 rounded-2xl flex items-center justify-center"
          style={{ backgroundColor: "rgba(51,119,175,0.15)" }}
        >
          <Bot className="h-10 w-10" style={{ color: "#3377AF" }} />
        </div>
        <div className="text-center max-w-md">
          <h3 className="text-lg font-semibold mb-2" style={{ color: "#E2E8F0" }}>
            Nenhum comando do bot ainda
          </h3>
          <p className="text-sm leading-relaxed" style={{ color: "#94A3B8" }}>
            O bot do Discord monitora comandos na tabela <code className="px-1.5 py-0.5 rounded text-xs" style={{ backgroundColor: "#12121A", color: "#3377AF" }}>bot_commands</code> do Supabase.
          </p>
          <div className="mt-4 p-4 rounded-lg text-left text-sm" style={{ backgroundColor: "#12121A", border: "1px solid rgba(255,255,255,0.08)" }}>
            <p className="font-medium mb-2" style={{ color: "#E2E8F0" }}>Comandos disponiveis:</p>
            <ul className="space-y-1" style={{ color: "#94A3B8" }}>
              <li><code style={{ color: "#3377AF" }}>!criar &lt;tema&gt;</code> - Cria carrossel</li>
              <li><code style={{ color: "#3377AF" }}>!templates</code> - Lista templates</li>
              <li><code style={{ color: "#3377AF" }}>!status</code> - Ver recentes</li>
              <li><code style={{ color: "#3377AF" }}>!publicar &lt;id&gt;</code> - Publica carrossel</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full p-4 gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Bot className="h-5 w-5" style={{ color: "#3377AF" }} />
          <h2 className="text-lg font-semibold" style={{ color: "#E2E8F0" }}>
            Comandos do Bot
          </h2>
          <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: "rgba(51,119,175,0.15)", color: "#3377AF" }}>
            {commands.length}
          </span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={fetchCommands}
          className="gap-1.5 text-xs"
          style={{ color: "#94A3B8" }}
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Atualizar
        </Button>
      </div>

      {error && (
        <div className="p-3 rounded-lg text-sm" style={{ backgroundColor: "rgba(239,68,68,0.1)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.2)" }}>
          {error}
        </div>
      )}

      {/* Commands list */}
      <ScrollArea className="flex-1">
        <div className="space-y-2">
          {commands.map((cmd) => {
            const config = STATUS_CONFIG[cmd.status] || STATUS_CONFIG.pending;
            const StatusIcon = config.icon;

            return (
              <div
                key={cmd.id}
                className="p-3 rounded-lg flex items-center gap-3"
                style={{
                  backgroundColor: "#12121A",
                  border: "1px solid rgba(255,255,255,0.06)",
                }}
              >
                {/* Source icon */}
                <div className="flex-shrink-0">
                  {sourceIcon(cmd.source)}
                </div>

                {/* Command info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <code
                      className="text-sm font-mono truncate"
                      style={{ color: "#E2E8F0" }}
                    >
                      {cmd.command}
                    </code>
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    {cmd.user_name && (
                      <span className="text-xs" style={{ color: "#64748B" }}>
                        {cmd.user_name}
                      </span>
                    )}
                    <span className="text-xs" style={{ color: "#475569" }}>
                      {formatTime(cmd.created_at)}
                    </span>
                  </div>
                </div>

                {/* Status badge */}
                <Badge
                  variant="outline"
                  className="flex-shrink-0 gap-1 text-xs border-0"
                  style={{ backgroundColor: config.bg, color: config.color }}
                >
                  <StatusIcon className={`h-3 w-3 ${cmd.status === "processing" ? "animate-spin" : ""}`} />
                  {config.label}
                </Badge>
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}
