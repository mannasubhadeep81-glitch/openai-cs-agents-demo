"use client";

import { FormEvent, useState } from "react";

type Message = {
  role: "user" | "assistant";
  content: string;
};

export function PersonalAssistantPanel() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function sendMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const message = draft.trim();
    if (!message || loading) return;

    setDraft("");
    setError("");
    setMessages((current) => [...current, { role: "user", content: message }]);
    setLoading(true);

    try {
      const response = await fetch("/personal-assistant/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(
          typeof data.detail === "string"
            ? data.detail
            : "The assistant could not answer. Please try again."
        );
      }
      if (typeof data.reply !== "string") {
        throw new Error("The server returned an unexpected response.");
      }
      setMessages((current) => [
        ...current,
        { role: "assistant", content: data.reply },
      ]);
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "Connection failed. Check that the backend is running."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="mx-auto flex h-full w-full max-w-4xl flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      <header className="border-b border-gray-200 px-5 py-4">
        <h2 className="text-lg font-semibold text-gray-900">Personal AI Assistant</h2>
        <p className="mt-1 text-sm text-gray-500">
          Ask questions, plan projects, or get help with coding and study.
        </p>
      </header>

      <div
        aria-live="polite"
        className="flex-1 space-y-4 overflow-y-auto bg-gray-50 p-4 sm:p-6"
      >
        {messages.length === 0 && (
          <div className="mx-auto mt-8 max-w-lg rounded-xl border border-gray-200 bg-white p-5 text-center">
            <p className="font-medium text-gray-900">What would you like help with?</p>
            <p className="mt-2 text-sm text-gray-500">
              Start with a question. Each message is sent to the backend assistant.
            </p>
          </div>
        )}
        {messages.map((message, index) => (
          <div
            key={`${message.role}-${index}`}
            className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[90%] whitespace-pre-wrap break-words rounded-2xl px-4 py-3 text-sm leading-6 sm:max-w-[80%] ${
                message.role === "user"
                  ? "bg-blue-600 text-white"
                  : "border border-gray-200 bg-white text-gray-800"
              }`}
            >
              {message.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="text-sm text-gray-500" role="status">
            Assistant is thinking…
          </div>
        )}
        {error && (
          <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
            {error}
          </p>
        )}
      </div>

      <form onSubmit={sendMessage} className="flex gap-2 border-t border-gray-200 bg-white p-3 sm:p-4">
        <label className="sr-only" htmlFor="personal-assistant-message">
          Your message
        </label>
        <textarea
          id="personal-assistant-message"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              event.currentTarget.form?.requestSubmit();
            }
          }}
          maxLength={8000}
          rows={2}
          placeholder="Message your assistant…"
          className="min-h-12 flex-1 resize-y rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading || !draft.trim()}
          className="self-end rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Sending…" : "Send"}
        </button>
      </form>
      <p className="px-4 pb-3 text-xs text-gray-500">
        Don’t send passwords, API keys, or other secrets.
      </p>
    </section>
  );
}
