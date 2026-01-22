"use client";

import { useState, useEffect } from "react";
import { Plus, Check, Trash2, Calendar, Layout, ChevronDown, AlignLeft, Eye, EyeOff, GlassWater, Sun, Moon, GripVertical, Play, Pause, RotateCcw, Volume2, VolumeX, Timer } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useTheme } from "next-themes";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";

type Priority = "low" | "medium" | "high";

interface Todo {
  id: string;
  text: string;
  details?: string;
  completed: boolean;
  priority: Priority;
  createdAt: Date;
}

export default function TodoApp() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [input, setInput] = useState("");
  const [details, setDetails] = useState("");
  const [showDetailsInput, setShowDetailsInput] = useState(false);
  const [priority, setPriority] = useState<Priority>("medium");
  const [mounted, setMounted] = useState(false);
  const [hideCompleted, setHideCompleted] = useState(false);
  const [activeTab, setActiveTab] = useState("all");

  // Water Tracker State
  const [waterCount, setWaterCount] = useState(0);
  const DAILY_GOAL = 5;
  const { theme, setTheme } = useTheme();

  // Timer State
  const [defaultDuration, setDefaultDuration] = useState(25);
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  // Load Todos
  useEffect(() => {
    const savedTodos = localStorage.getItem("todos");
    if (savedTodos) {
      try {
        const parsed = JSON.parse(savedTodos);
        setTodos(parsed.map((t: any) => ({
          ...t,
          createdAt: new Date(t.createdAt)
        })));
      } catch (e) {
        console.error("Failed to load todos", e);
      }
    }

    // Load Water Data
    const savedWater = localStorage.getItem("dailyWater");
    if (savedWater) {
      try {
        const { date, count } = JSON.parse(savedWater);
        const today = new Date().toISOString().split('T')[0];

        if (date === today) {
          setWaterCount(count);
        } else {
          setWaterCount(0);
          localStorage.setItem("dailyWater", JSON.stringify({ date: today, count: 0 }));
        }
      } catch (e) {
        console.error("Failed to load water", e);
      }
    }

    setMounted(true);
  }, []);

  // Save Todos
  useEffect(() => {
    if (mounted) {
      localStorage.setItem("todos", JSON.stringify(todos));
    }
  }, [todos, mounted]);

  // Save Water
  useEffect(() => {
    if (mounted) {
      const today = new Date().toISOString().split('T')[0];
      localStorage.setItem("dailyWater", JSON.stringify({ date: today, count: waterCount }));
    }
  }, [waterCount, mounted]);

  // Timer Logic
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsRunning(false);
      if (!isMuted) {
        playBeep();
      }
    }
    return () => clearInterval(interval);
  }, [isRunning, timeLeft, isMuted]);

  const playBeep = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();

      const playTone = (freq: number, startTime: number, duration: number) => {
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);

        oscillator.type = "sine";
        oscillator.frequency.setValueAtTime(freq, startTime);

        // Soft envelope
        gainNode.gain.setValueAtTime(0, startTime);
        gainNode.gain.linearRampToValueAtTime(0.1, startTime + 0.05);
        gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + duration);

        oscillator.start(startTime);
        oscillator.stop(startTime + duration);
      };

      const now = audioCtx.currentTime;
      playTone(523.25, now, 1.0); // C5
      playTone(659.25, now + 0.1, 0.8); // E5
      playTone(783.99, now + 0.2, 0.6); // G5
    } catch (e) {
      console.error("Audio error", e);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleTimer = () => setIsRunning(!isRunning);
  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(defaultDuration * 60);
  };

  const changeDuration = (mins: number) => {
    setIsRunning(false);
    setDefaultDuration(mins);
    setTimeLeft(mins * 60);
  };

  const addTodo = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim()) return;

    const newTodo: Todo = {
      id: crypto.randomUUID(),
      text: input.trim(),
      details: details.trim() || undefined,
      completed: false,
      priority,
      createdAt: new Date(),
    };

    setTodos([newTodo, ...todos]);
    setInput("");
    setDetails("");
    setShowDetailsInput(false);
    setPriority("medium");
  };

  const toggleTodo = (id: string) => {
    setTodos(todos.map(t =>
      t.id === id ? { ...t, completed: !t.completed } : t
    ));
  };

  const cyclePriority = (id: string, current: Priority) => {
    const sequence: Priority[] = ["low", "medium", "high"];
    const next = sequence[(sequence.indexOf(current) + 1) % sequence.length];
    setTodos(todos.map(t => t.id === id ? { ...t, priority: next } : t));
  };

  const deleteTodo = (id: string) => {
    setTodos(todos.filter(t => t.id !== id));
  };

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const items = Array.from(todos);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setTodos(items);
  };

  const getPriorityColor = (p: Priority) => {
    switch (p) {
      case "high": return "bg-red-500/10 text-red-600 dark:text-red-400 border-red-200 dark:border-red-900";
      case "medium": return "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-200 dark:border-yellow-900";
      case "low": return "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-900";
    }
  };

  const pendingCount = todos.filter(t => !t.completed).length;

  const filteredTodos = todos.filter(t => {
    const matchesPriority = activeTab === "all" || t.priority === activeTab;
    const matchesHide = !hideCompleted || !t.completed;
    return matchesPriority && matchesHide;
  });

  if (!mounted) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 lg:p-8 selection:bg-primary/20 overflow-hidden text-foreground bg-background transition-colors duration-300">
      <Card className="w-full max-w-4xl h-[90vh] flex flex-col shadow-2xl border-white/20 dark:border-zinc-800 backdrop-blur-xl bg-card dark:bg-card/95 overflow-hidden">
        <CardHeader className="space-y-1 shrink-0 pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 bg-primary/10 rounded-xl">
                <Layout className="w-6 h-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-xl font-bold tracking-tight">Tasks</CardTitle>
                <CardDescription className="text-[10px]">
                  Manage your daily tasks with focus and clarity.
                </CardDescription>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Compact Focus Timer in Header */}
              <div className="flex items-center bg-secondary/50 rounded-full border border-border/50 p-0.5 pr-2 gap-1.5 animate-in fade-in zoom-in duration-500">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full text-primary hover:bg-primary/10">
                      <Timer className="w-3.5 h-3.5" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-40 p-2" align="end">
                    <div className="grid grid-cols-2 gap-1">
                      {[5, 15, 25, 45, 60, 90].map((m) => (
                        <Button
                          key={m}
                          variant={defaultDuration === m ? "default" : "ghost"}
                          size="sm"
                          onClick={() => changeDuration(m)}
                          className="h-7 text-[10px] font-bold"
                        >
                          {m}m
                        </Button>
                      ))}
                    </div>
                    <div className="mt-2 flex items-center gap-2">
                      <Input
                        type="number"
                        placeholder="Min"
                        className="h-7 text-[10px] px-2 w-full"
                        onChange={(e) => {
                          const val = parseInt(e.target.value);
                          if (!isNaN(val) && val > 0) changeDuration(val);
                        }}
                      />
                    </div>
                    <div className="border-t mt-2 pt-2 flex justify-between px-1">
                      <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setIsMuted(!isMuted)}>
                        {isMuted ? <VolumeX className="w-3 h-3" /> : <Volume2 className="w-3 h-3" />}
                      </Button>
                      <Button variant="ghost" size="icon" className="h-6 w-6" onClick={resetTimer}>
                        <RotateCcw className="w-3 h-3" />
                      </Button>
                    </div>
                  </PopoverContent>
                </Popover>

                <span className={cn(
                  "text-[11px] font-mono font-bold tabular-nums min-w-[34px]",
                  isRunning && "animate-pulse text-primary"
                )}>
                  {formatTime(timeLeft)}
                </span>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleTimer}
                  className={cn(
                    "h-6 w-6 rounded-full",
                    isRunning ? "text-amber-500 hover:bg-amber-500/10" : "text-primary hover:bg-primary/10"
                  )}
                >
                  {isRunning ? <Pause className="w-3 h-3 fill-current" /> : <Play className="w-3 h-3 fill-current ml-0.5" />}
                </Button>
              </div>

              <div className="flex items-center gap-1.5 hidden sm:flex">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setHideCompleted(!hideCompleted)}
                  className={cn(
                    "h-8 text-[10px] font-medium border-primary/20 hover:bg-primary/5 px-2.5",
                    hideCompleted && "bg-primary/10 text-primary border-primary/30"
                  )}
                >
                  {hideCompleted ? (
                    <><EyeOff className="w-3.5 h-3.5 mr-1.5" /> Show All</>
                  ) : (
                    <><Eye className="w-3.5 h-3.5 mr-1.5" /> Hide Done</>
                  )}
                </Button>
                <span className="text-[10px] text-muted-foreground font-medium bg-secondary px-3 py-1 rounded-full border border-border/50 truncate">
                  {pendingCount} pending
                </span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="h-8 w-8 text-muted-foreground hover:text-foreground"
              >
                <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                <span className="sr-only">Toggle theme</span>
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4 flex-1 flex flex-col min-h-0 pt-0">
          <form onSubmit={addTodo} className="space-y-3 bg-secondary/20 p-4 rounded-xl border border-border/50">
            <div className="flex flex-col gap-3">
              <div className="flex gap-3">
                <div className="relative flex-1">
                  <Input
                    placeholder="Add a new task..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    className="h-10 text-sm pr-4 border-primary/20 focus-visible:ring-primary/30 transition-all bg-card/50"
                  />
                </div>
                <Button
                  type="button"
                  onClick={() => setShowDetailsInput(!showDetailsInput)}
                  variant={showDetailsInput ? "secondary" : "outline"}
                  className="h-10 px-3 border-primary/20"
                >
                  <AlignLeft className="w-4 h-4" />
                </Button>
                <Button
                  type="submit"
                  disabled={!input.trim()}
                  className="h-10 text-sm bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/25 transition-all px-4 shrink-0"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add
                </Button>
              </div>

              {showDetailsInput && (
                <Textarea
                  placeholder="Add details (optional)..."
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  className="min-h-[80px] text-sm border-primary/20 resize-none animate-in slide-in-from-top-2 fade-in duration-200"
                />
              )}
            </div>

            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-4">
                <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Priority:</span>
                <RadioGroup
                  value={priority}
                  onValueChange={(v) => setPriority(v as Priority)}
                  className="flex items-center gap-4"
                >
                  {["low", "medium", "high"].map((p) => (
                    <div key={p} className="flex items-center space-x-2">
                      <RadioGroupItem value={p} id={`new-${p}`} className={cn(
                        "w-4 h-4",
                        p === "low" && "text-blue-500 border-blue-200",
                        p === "medium" && "text-yellow-500 border-yellow-200",
                        p === "high" && "text-red-500 border-red-200"
                      )} />
                      <Label htmlFor={`new-${p}`} className="text-[10px] font-medium cursor-pointer capitalize">{p}</Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            </div>
          </form>








          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4 h-9 p-1 bg-secondary/50">
              <TabsTrigger value="all" className="text-[10px] uppercase font-bold tracking-widest">All</TabsTrigger>
              <TabsTrigger value="low" className="text-[10px] uppercase font-bold tracking-widest">Low</TabsTrigger>
              <TabsTrigger value="medium" className="text-[10px] uppercase font-bold tracking-widest">Medium</TabsTrigger>
              <TabsTrigger value="high" className="text-[10px] uppercase font-bold tracking-widest">High</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar">
            <DragDropContext onDragEnd={onDragEnd}>
              <Droppable droppableId="todos">
                {(provided) => (
                  <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-2">
                    {filteredTodos.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-12 text-muted-foreground/30">
                        <Check className="w-12 h-12 mb-2 opacity-10" />
                        <p className="text-xs font-medium uppercase tracking-widest">No tasks found</p>
                      </div>
                    ) : (
                      filteredTodos.map((todo, index) => (
                        <Draggable key={todo.id} draggableId={todo.id} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              className={cn(
                                "group transition-all duration-200",
                                snapshot.isDragging && "scale-[1.02] shadow-2xl z-50"
                              )}
                            >
                              <Collapsible className={cn(
                                "rounded-xl border transition-all duration-300",
                                todo.completed
                                  ? "bg-secondary/10 border-transparent opacity-50"
                                  : "bg-card border-border hover:border-primary/50 hover:shadow-lg dark:hover:bg-zinc-900"
                              )}>
                                <div className="flex items-center gap-3 p-3">
                                  <div {...provided.dragHandleProps} className="text-muted-foreground/30 hover:text-muted-foreground transition-colors cursor-grab active:cursor-grabbing">
                                    <GripVertical className="w-4 h-4" />
                                  </div>

                                  <Checkbox
                                    checked={todo.completed}
                                    onCheckedChange={() => toggleTodo(todo.id)}
                                    className="data-[state=checked]:bg-primary data-[state=checked]:border-primary w-5 h-5 shrink-0"
                                  />

                                  <div className="flex-1 min-w-0">
                                    <span className={cn(
                                      "text-sm font-medium transition-all block truncate",
                                      todo.completed && "text-muted-foreground line-through decoration-primary/30"
                                    )}>
                                      {todo.text}
                                    </span>
                                  </div>

                                  <div className="flex items-center gap-2 shrink-0">
                                    <Badge
                                      variant="outline"
                                      onClick={() => cyclePriority(todo.id, todo.priority)}
                                      className={cn(
                                        "text-[9px] px-2 py-0 cursor-pointer hover:scale-105 transition-transform active:scale-95 font-bold uppercase tracking-tighter border",
                                        getPriorityColor(todo.priority)
                                      )}
                                    >
                                      {todo.priority}
                                    </Badge>

                                    <div className="flex items-center gap-1">
                                      {todo.details && (
                                        <CollapsibleTrigger asChild>
                                          <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground/50 hover:text-foreground">
                                            <ChevronDown className="w-3.5 h-3.5 transition-transform duration-200 group-data-[state=open]:rotate-180" />
                                          </Button>
                                        </CollapsibleTrigger>
                                      )}
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => deleteTodo(todo.id)}
                                        className="text-destructive/50 hover:text-destructive hover:bg-destructive/10 h-7 w-7 opacity-0 group-hover:opacity-100 transition-all"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </Button>
                                    </div>
                                  </div>
                                </div>

                                {todo.details && (
                                  <CollapsibleContent>
                                    <div className="px-3 pb-3 pl-12 pt-0">
                                      <div className="text-[11px] text-muted-foreground bg-secondary/30 p-2 rounded-lg border border-border/30">
                                        {todo.details}
                                      </div>
                                    </div>
                                  </CollapsibleContent>
                                )}
                              </Collapsible>
                            </div>
                          )}
                        </Draggable>
                      ))
                    )}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          </div>
        </CardContent>

        <CardFooter className="bg-secondary/30 mt-auto border-t flex flex-col sm:flex-row items-center justify-between gap-4 py-2 shrink-0">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-blue-500/10 rounded-lg">
              <GlassWater className="w-3.5 h-3.5 text-blue-500" />
            </div>
            <div>
              <p className="text-[10px] font-semibold">Hydration Tracker</p>
              <p className="text-[10px] text-muted-foreground">{waterCount}/{DAILY_GOAL} glasses today</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {Array.from({ length: DAILY_GOAL }).map((_, i) => (
              <button
                key={i}
                onClick={() => setWaterCount(i + 1)}
                className={cn(
                  "p-1 rounded-md transition-all hover:scale-110 focus:outline-none",
                  i < waterCount
                    ? "text-blue-500 hover:bg-blue-500/10"
                    : "text-muted-foreground/30 hover:text-blue-400 hover:bg-blue-500/5"
                )}
              >
                <GlassWater className={cn("w-4 h-4", i < waterCount && "fill-current")} />
              </button>
            ))}
          </div>
        </CardFooter>
      </Card>

      <div className="fixed inset-0 -z-10 h-full w-full bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>
    </div >
  );
}
