"use client";

import { useState, useEffect } from "react";
import { Plus, Check, Trash2, Calendar, Layout, ChevronDown, AlignLeft, Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

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
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      localStorage.setItem("todos", JSON.stringify(todos));
    }
  }, [todos, mounted]);

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

  const deleteTodo = (id: string) => {
    setTodos(todos.filter(t => t.id !== id));
  };

  const getPriorityColor = (p: Priority) => {
    switch (p) {
      case "high": return "bg-red-500/10 text-red-600 dark:text-red-400 border-red-200 dark:border-red-900";
      case "medium": return "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-200 dark:border-yellow-900";
      case "low": return "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-900";
    }
  };

  const pendingCount = todos.filter(t => !t.completed).length;

  const visibleTodos = hideCompleted
    ? todos.filter(t => !t.completed)
    : todos;

  if (!mounted) {
    return null; // Prevents hydration error
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 lg:p-8 selection:bg-primary/20 overflow-hidden">
      <Card className="w-full max-w-4xl h-[90vh] flex flex-col shadow-2xl border-white/20 dark:border-white/10 backdrop-blur-xl bg-card/80">
        <CardHeader className="space-y-1 shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 bg-primary/10 rounded-xl">
                <Layout className="w-6 h-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-2xl font-bold tracking-tight">Tasks</CardTitle>
                <CardDescription>
                  Manage your daily tasks with focus and clarity.
                </CardDescription>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setHideCompleted(!hideCompleted)}
                className={cn(
                  "hidden sm:flex h-8 text-xs font-medium border-primary/20 hover:bg-primary/5",
                  hideCompleted && "bg-primary/10 text-primary border-primary/30"
                )}
              >
                {hideCompleted ? (
                  <>
                    <EyeOff className="w-3.5 h-3.5 mr-1.5" />
                    Show All
                  </>
                ) : (
                  <>
                    <Eye className="w-3.5 h-3.5 mr-1.5" />
                    Hide Done
                  </>
                )}
              </Button>
              <span className="text-sm text-muted-foreground font-medium bg-secondary px-3 py-1 rounded-full border border-border/50">
                {pendingCount} pending
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6 flex-1 flex flex-col min-h-0">
          <form onSubmit={addTodo} className="space-y-4">
            <div className="flex flex-col gap-3">
              <div className="flex gap-3">
                <div className="relative flex-1">
                  <Input
                    placeholder="Add a new task..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    className="h-11 pr-4 border-primary/20 focus-visible:ring-primary/30 transition-all font-medium"
                  />
                </div>
                <Button
                  type="button"
                  draggable={false}
                  onClick={() => setShowDetailsInput(!showDetailsInput)}
                  variant={showDetailsInput ? "secondary" : "outline"}
                  className="h-11 px-3 border-primary/20"
                >
                  <AlignLeft className="w-5 h-5" />
                </Button>
                <Button
                  type="submit"
                  disabled={!input.trim()}
                  className="h-11 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/25 transition-all px-6 shrink-0"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Add Task
                </Button>
              </div>

              {showDetailsInput && (
                <Textarea
                  placeholder="Add details (optional)..."
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  className="min-h-[80px] border-primary/20 resize-none animate-in slide-in-from-top-2 fade-in duration-200"
                />
              )}
            </div>

            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-4">
                <span className="text-sm text-muted-foreground font-medium">Priority:</span>
                <RadioGroup
                  value={priority}
                  onValueChange={(v) => setPriority(v as Priority)}
                  className="flex items-center gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="low" id="low" className="text-blue-500 border-blue-200 dark:border-blue-800" />
                    <Label htmlFor="low" className="text-sm font-normal cursor-pointer">Low</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="medium" id="medium" className="text-yellow-500 border-yellow-200 dark:border-yellow-800" />
                    <Label htmlFor="medium" className="text-sm font-normal cursor-pointer">Medium</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="high" id="high" className="text-red-500 border-red-200 dark:border-red-800" />
                    <Label htmlFor="high" className="text-sm font-normal cursor-pointer">High</Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Mobile toggle button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setHideCompleted(!hideCompleted)}
                className="sm:hidden h-8 w-8 p-0"
              >
                {hideCompleted ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                <span className="sr-only">Toggle completed tasks</span>
              </Button>
            </div>
          </form>

          <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-3">
            {todos.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground/50 space-y-4 min-h-[300px]">
                <div className="w-20 h-20 rounded-full bg-secondary/50 flex items-center justify-center">
                  <Check className="w-10 h-10 opacity-20" />
                </div>
                <p className="text-lg font-medium">No tasks yet. Start by adding one!</p>
              </div>
            ) : visibleTodos.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-48 text-muted-foreground/50 space-y-4">
                <div className="w-16 h-16 rounded-full bg-secondary/30 flex items-center justify-center">
                  <EyeOff className="w-8 h-8 opacity-20" />
                </div>
                <p className="text-sm font-medium">Completed tasks are hidden.</p>
              </div>
            ) : (
              visibleTodos.map((todo) => (
                <Collapsible key={todo.id} className={cn(
                  "group rounded-xl border transition-all duration-300 animate-in slide-in-from-bottom-2 fade-in",
                  todo.completed
                    ? "bg-secondary/30 border-transparent opacity-60"
                    : "bg-card border-border hover:border-primary/30 hover:shadow-md hover:shadow-primary/5"
                )}>
                  <div className="flex items-center gap-4 p-4">
                    <Checkbox
                      checked={todo.completed}
                      onCheckedChange={() => toggleTodo(todo.id)}
                      className="data-[state=checked]:bg-primary data-[state=checked]:border-primary w-6 h-6 transition-transform active:scale-95 shrink-0"
                    />

                    <div className="flex-1 flex flex-col sm:flex-row sm:items-center gap-2 overflow-hidden">
                      <span className={cn(
                        "text-base font-medium transition-all truncate flex-1",
                        todo.completed && "text-muted-foreground line-through decoration-primary/30"
                      )}>
                        {todo.text}
                      </span>
                      <div className="flex items-center gap-3 shrink-0">
                        <Badge variant="outline" className={cn("font-normal border", getPriorityColor(todo.priority))}>
                          {todo.priority.charAt(0).toUpperCase() + todo.priority.slice(1)}
                        </Badge>
                        <span className="text-xs text-muted-foreground flex items-center gap-1 min-w-[80px] justify-end">
                          <Calendar className="w-3 h-3" />
                          {todo.createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      {todo.details && (
                        <CollapsibleTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground hover:text-foreground">
                            <ChevronDown className="w-4 h-4 transition-transform duration-200 group-data-[state=open]:rotate-180" />
                            <span className="sr-only">Toggle details</span>
                          </Button>
                        </CollapsibleTrigger>
                      )}

                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteTodo(todo.id)}
                        className="opacity-0 group-hover:opacity-100 text-destructive/70 hover:text-destructive hover:bg-destructive/10 h-9 w-9 transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span className="sr-only">Delete</span>
                      </Button>
                    </div>
                  </div>

                  {todo.details && (
                    <CollapsibleContent>
                      <div className="px-4 pb-4 pl-14 pt-0">
                        <div className="text-sm text-muted-foreground bg-secondary/50 p-3 rounded-lg border border-border/50">
                          {todo.details}
                        </div>
                      </div>
                    </CollapsibleContent>
                  )}
                </Collapsible>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Background decoration */}
      <div className="fixed inset-0 -z-10 h-full w-full bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>
    </div>
  );
}
