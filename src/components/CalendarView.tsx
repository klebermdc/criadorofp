import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { CarouselData } from "@/types/carousel";
import { ChevronLeft, ChevronRight, CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addMonths,
  subMonths,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isToday,
} from "date-fns";
import { ptBR } from "date-fns/locale";

interface CalendarViewProps {
  onEdit: (data: CarouselData) => void;
}

export function CalendarView({ onEdit }: CalendarViewProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [posts, setPosts] = useState<CarouselData[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  useEffect(() => {
    const loadPosts = async () => {
      const { data } = await supabase
        .from("carousels")
        .select("*")
        .order("created_at", { ascending: false });
      if (data) setPosts(data as unknown as CarouselData[]);
    };
    loadPosts();
  }, []);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const getPostsForDate = (date: Date) => {
    return posts.filter((p) => {
      if (p.scheduled_date) {
        return isSameDay(new Date(p.scheduled_date), date);
      }
      if (p.created_at) {
        return isSameDay(new Date(p.created_at), date);
      }
      return false;
    });
  };

  const weekDays = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab"];

  const selectedDayPosts = selectedDate ? getPostsForDate(selectedDate) : [];

  return (
    <div className="h-full flex flex-col lg:flex-row" style={{ backgroundColor: "#0A0A0F" }}>
      {/* Calendar grid */}
      <div className="flex-1 flex flex-col p-6">
        {/* Month navigation */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-white capitalize">
            {format(currentMonth, "MMMM yyyy", { locale: ptBR })}
          </h2>
          <div className="flex gap-1">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
              <ChevronLeft className="h-4 w-4" style={{ color: "#94A3B8" }} />
            </Button>
            <Button variant="ghost" size="sm" className="h-8 text-xs" style={{ color: "#3377AF" }}
              onClick={() => setCurrentMonth(new Date())}>
              Hoje
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
              <ChevronRight className="h-4 w-4" style={{ color: "#94A3B8" }} />
            </Button>
          </div>
        </div>

        {/* Weekday headers */}
        <div className="grid grid-cols-7 gap-1 mb-1">
          {weekDays.map((day) => (
            <div key={day} className="text-center py-2 text-[10px] font-semibold uppercase tracking-wider" style={{ color: "#94A3B8" }}>
              {day}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-1 flex-1">
          {days.map((day) => {
            const dayPosts = getPostsForDate(day);
            const inMonth = isSameMonth(day, currentMonth);
            const today = isToday(day);
            const isSelected = selectedDate && isSameDay(day, selectedDate);

            return (
              <button
                key={day.toISOString()}
                onClick={() => setSelectedDate(day)}
                className="rounded-lg p-1.5 text-left transition-all flex flex-col min-h-[80px] relative"
                style={{
                  backgroundColor: isSelected ? "rgba(51,119,175,0.15)" : today ? "rgba(131,247,20,0.05)" : "#12121A",
                  border: isSelected ? "1px solid #3377AF" : today ? "1px solid rgba(131,247,20,0.2)" : "1px solid rgba(255,255,255,0.04)",
                  opacity: inMonth ? 1 : 0.3,
                }}
              >
                <span
                  className="text-xs font-medium mb-1"
                  style={{
                    color: today ? "#83F714" : inMonth ? "white" : "#94A3B8",
                  }}
                >
                  {format(day, "d")}
                </span>
                {dayPosts.slice(0, 2).map((post) => (
                  <div
                    key={post.id}
                    className="text-[9px] px-1 py-0.5 rounded mb-0.5 truncate cursor-pointer"
                    style={{
                      backgroundColor: post.status === "publicado" ? "rgba(131,247,20,0.15)" : post.status === "agendado" ? "rgba(51,119,175,0.2)" : "rgba(255,255,255,0.06)",
                      color: post.status === "publicado" ? "#83F714" : post.status === "agendado" ? "#3377AF" : "#94A3B8",
                    }}
                    onClick={(e) => { e.stopPropagation(); onEdit(post); }}
                  >
                    {post.topic.slice(0, 15)}
                  </div>
                ))}
                {dayPosts.length > 2 && (
                  <span className="text-[8px]" style={{ color: "#94A3B8" }}>+{dayPosts.length - 2} mais</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Day detail sidebar */}
      <div className="w-full lg:w-72 flex flex-col" style={{ borderLeft: "1px solid rgba(255,255,255,0.08)", backgroundColor: "#0A0A0F" }}>
        <div className="px-4 py-3" style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
          <h3 className="text-sm font-semibold text-white">
            {selectedDate
              ? format(selectedDate, "dd 'de' MMMM", { locale: ptBR })
              : "Selecione um dia"}
          </h3>
        </div>
        <ScrollArea className="flex-1 p-4">
          {selectedDate && selectedDayPosts.length === 0 && (
            <div className="text-center py-12">
              <CalendarDays className="h-8 w-8 mx-auto mb-3" style={{ color: "#94A3B8", opacity: 0.3 }} />
              <p className="text-xs" style={{ color: "#94A3B8" }}>Nenhum post neste dia</p>
            </div>
          )}
          {!selectedDate && (
            <div className="text-center py-12">
              <CalendarDays className="h-8 w-8 mx-auto mb-3" style={{ color: "#94A3B8", opacity: 0.3 }} />
              <p className="text-xs" style={{ color: "#94A3B8" }}>Clique em um dia para ver os posts</p>
            </div>
          )}
          <div className="space-y-2">
            {selectedDayPosts.map((post) => (
              <div
                key={post.id}
                onClick={() => onEdit(post)}
                className="p-3 rounded-lg cursor-pointer transition-all hover:scale-[1.02]"
                style={{ backgroundColor: "#12121A", border: "1px solid rgba(255,255,255,0.06)" }}
              >
                <p className="text-sm font-medium text-white truncate">{post.topic}</p>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full" style={{
                    backgroundColor: post.status === "publicado" ? "rgba(131,247,20,0.15)" : post.status === "agendado" ? "rgba(51,119,175,0.15)" : "rgba(148,163,184,0.15)",
                    color: post.status === "publicado" ? "#83F714" : post.status === "agendado" ? "#3377AF" : "#94A3B8",
                  }}>
                    {post.status === "publicado" ? "Publicado" : post.status === "agendado" ? "Agendado" : "Rascunho"}
                  </span>
                  <span className="text-[10px]" style={{ color: "#94A3B8" }}>{post.slides?.length || 0} slides</span>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
