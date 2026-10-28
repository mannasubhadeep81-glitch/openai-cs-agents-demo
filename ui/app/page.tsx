"use client";

import { useCallback, useEffect, useState } from "react";
import { AgentPanel } from "@/components/agent-panel";
import { ChatKitPanel } from "@/components/chatkit-panel";
import { PersonalAssistantPanel } from "@/components/personal-assistant-panel";
import type { Agent, AgentEvent, GuardrailCheck } from "@/lib/types";
import { fetchBootstrapState, fetchThreadState } from "@/lib/api";

type ViewMode = "personal" | "airline";

export default function Home() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [events, setEvents] = useState<AgentEvent[]>([]);
  const [currentAgent, setCurrentAgent] = useState<string>("");
  const [guardrails, setGuardrails] = useState<GuardrailCheck[]>([]);
  const [context, setContext] = useState<Record<string, any>>({});
  const [threadId, setThreadId] = useState<string | null>(null);
  const [initialThreadId, setInitialThreadId] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<ViewMode>("personal");

  const normalizeEvents = useCallback((items: AgentEvent[]) => {
    if (!items.length) return items;
    const now = Date.now();
    const latestNonProgress = items
      .filter((e) => e.type !== "progress_update")
      .reduce((max, e) => Math.max(max, e.timestamp.getTime()), 0);
    return items.filter((e) => {
      if (e.type !== "progress_update") return true;
      const ts = e.timestamp.getTime();
      if (latestNonProgress && ts < latestNonProgress) return false;
      if (now - ts > 15000) return false;
      return true;
    });
  }, []);

  const hydrateState = useCallback(async (id: string | null) => {
    if (!id) return;
    const data = await fetchThreadState(id);
    if (!data) return;

    setCurrentAgent(data.current_agent || "");
    setContext(data.context || {});
    if (Array.isArray(data.agents)) setAgents(data.agents);
    if (Array.isArray(data.events)) {
      setEvents(
        data.events.map((e: any) => ({
          ...e,
          timestamp: new Date(e.timestamp ?? Date.now()),
        }))
      );
    }
    if (Array.isArray(data.guardrails)) {
      setGuardrails(
        data.guardrails.map((g: any) => ({
          ...g,
          timestamp: new Date(g.timestamp ?? Date.now()),
        }))
      );
    }
  }, []);

  useEffect(() => {
    if (threadId) void hydrateState(threadId);
  }, [threadId, hydrateState]);

  useEffect(() => {
    (async () => {
      const bootstrap = await fetchBootstrapState();
      if (!bootstrap) return;
      setInitialThreadId(bootstrap.thread_id || null);
      setThreadId(bootstrap.thread_id || null);
      if (bootstrap.current_agent) setCurrentAgent(bootstrap.current_agent);
      if (Array.isArray(bootstrap.agents)) setAgents(bootstrap.agents);
      if (bootstrap.context) setContext(bootstrap.context);
      if (Array.isArray(bootstrap.events)) {
        setEvents(
          normalizeEvents(
            bootstrap.events.map((e: any) => ({
              ...e,
              timestamp: new Date(e.timestamp ?? Date.now()),
            }))
          )
        );
      }
      if (Array.isArray(bootstrap.guardrails)) {
        setGuardrails(
          bootstrap.guardrails.map((g: any) => ({
            ...g,
            timestamp: new Date(g.timestamp ?? Date.now()),
          }))
        );
      }
    })();
  }, [normalizeEvents]);

  const handleThreadChange = useCallback((id: string | null) => {
    setThreadId(id);
  }, []);

  const handleBindThread = useCallback((id: string) => {
    setThreadId(id);
  }, []);

  const handleResponseEnd = useCallback(() => {
    void hydrateState(threadId);
  }, [hydrateState, threadId]);

  const tabClass = (view: ViewMode) =>
    `rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
      activeView === view
        ? "bg-blue-600 text-white"
        : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
    }`;

  return (
    <main className="flex h-screen flex-col gap-2 bg-gray-100 p-2 sm:p-3">
      <header className="flex shrink-0 items-center justify-between gap-3 rounded-xl border border-gray-200 bg-white px-3 py-2 shadow-sm sm:px-4">
        <div>
          <h1 className="text-sm font-bold text-gray-900 sm:text-base">
            AI Assistant Workspace
          </h1>
          <p className="hidden text-xs text-gray-500 sm:block">
            Personal assistant and airline demo
          </p>
        </div>
        <nav aria-label="Choose assistant" className="flex gap-1 rounded-xl bg-gray-50 p-1">
          <button
            type="button"
            className={tabClass("personal")}
            aria-pressed={activeView === "personal"}
            onClick={() => setActiveView("personal")}
          >
            Personal AI
          </button>
          <button
            type="button"
            className={tabClass("airline")}
            aria-pressed={activeView === "airline"}
            onClick={() => setActiveView("airline")}
          >
            Airline Demo
          </button>
        </nav>
      </header>

      {activeView === "personal" ? (
        <div className="min-h-0 flex-1">
          <PersonalAssistantPanel />
        </div>
      ) : (
        <section className="flex min-h-0 flex-1 gap-2 overflow-hidden">
          <AgentPanel
            agents={agents}
            currentAgent={currentAgent}
            events={events}
            guardrails={guardrails}
            context={context}
          />
          <ChatKitPanel
            initialThreadId={initialThreadId}
            onThreadChange={handleThreadChange}
            onResponseEnd={handleResponseEnd}
            onRunnerBindThread={handleBindThread}
          />
        </section>
      )}
    </main>
  );
}
