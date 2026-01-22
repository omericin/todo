"use client";

import { useState } from "react";
import { Plus, Check, Trash2, Calendar, Layout } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";

interface Todo {
  id: string;
  text: string;
  completed: boolean;
  createdAt: Date;
}

export default function TodoApp() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [input, setInput] = useState("");

  const addTodo = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim()) return;
    
    const newTodo: Todo = {
      id: crypto.randomUUID(),
      text: input.trim(),
      completed: false,
      createdAt: new Date(),
    };
    
    setTodos([newTodo, ...todos]);
    setInput("");
  };

  const toggleTodo = (id: string) => {
    setTodos(todos.map(t => 
      t.id === id ? { ...t, completed: !t.completed } : t
    ));
  };

  const deleteTodo = (id: string) => {
    setTodos(todos.filter(t => t.id !== id));
  };

  const pendingCount = todos.filter(t => !t.completed).length;

  return (
    <div className="min-h-screen flex items-center justify-center p-4 selection:bg-primary/20">
      <Card className="w-full max-w-md shadow-2xl border-white/20 dark:border-white/10 backdrop-blur-xl bg-card/80">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Layout className="w-6 h-6 text-primary" />
              </div>
              <CardTitle className="text-2xl font-bold tracking-tight">Tasks</CardTitle>
            </div>
            <span className="text-sm text-muted-foreground font-medium bg-secondary px-2.5 py-0.5 rounded-full">
              {pendingCount} pending
            </span>
          </div>
          <CardDescription>
            Manage your daily tasks with focus and clarity.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={addTodo} className="flex gap-2">
            <div className="relative flex-1">
              <Input
                placeholder="Add a new task..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="pr-10 border-primary/20 focus-visible:ring-primary/30 transition-all font-medium"
              />
            </div>
            <Button 
              type="submit" 
              disabled={!input.trim()}
              className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/25 transition-all w-12 px-0 shrink-0"
            >
              <Plus className="w-5 h-5" />
              <span className="sr-only">Add Task</span>
            </Button>
          </form>

          <div className="space-y-3 min-h-[300px] max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
            {todos.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-48 text-muted-foreground/50 space-y-4">
                <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center">
                  <Check className="w-8 h-8 opacity-20" />
                </div>
                <p className="text-sm font-medium">No tasks yet. Start by adding one!</p>
              </div>
            ) : (
              todos.map((todo) => (
                <div
                  key={todo.id}
                  className={cn(
                    "group flex items-center gap-3 p-3 rounded-xl border transition-all duration-300 animate-in slide-in-from-bottom-2 fade-in",
                    todo.completed 
                      ? "bg-secondary/30 border-transparent opacity-60" 
                      : "bg-card border-border hover:border-primary/30 hover:shadow-md hover:shadow-primary/5"
                  )}
                >
                  <Checkbox 
                    checked={todo.completed}
                    onCheckedChange={() => toggleTodo(todo.id)}
                    className="data-[state=checked]:bg-primary data-[state=checked]:border-primary w-5 h-5 transition-transform active:scale-95"
                  />
                  
                  <div className="flex-1 flex flex-col gap-0.5 overflow-hidden">
                    <span className={cn(
                      "text-sm font-medium transition-all truncate",
                      todo.completed && "text-muted-foreground line-through decoration-primary/30"
                    )}>
                      {todo.text}
                    </span>
                    <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {todo.createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteTodo(todo.id)}
                    className="opacity-0 group-hover:opacity-100 text-destructive/70 hover:text-destructive hover:bg-destructive/10 h-8 w-8 ml-auto transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span className="sr-only">Delete</span>
                  </Button>
                </div>
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
