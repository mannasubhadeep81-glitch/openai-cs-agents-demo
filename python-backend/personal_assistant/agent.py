"""General-purpose assistant configuration, kept separate from airline agents.

This module only defines the assistant. It does not expose an API route, invoke
the model, or grant tools/permissions by itself.
"""
from __future__ import annotations

import os

from agents import Agent

DEFAULT_INSTRUCTIONS = """
You are a practical personal AI assistant.
Be accurate, transparent about uncertainty, and concise.
Ask clarifying questions when a request is ambiguous.
Never claim to have performed an action unless a tool result confirms it.
Do not request, reveal, or store API keys, passwords, or other secrets.
You have no tools by default. Do not imply you can access accounts, files,
websites, or external services unless an explicitly configured tool provides
that access. Require user approval before consequential external actions.
"""


def create_personal_assistant() -> Agent:
    """Create an assistant with no tools or external side-effect permissions."""
    model = os.getenv("PERSONAL_ASSISTANT_MODEL")
    kwargs = {
        "name": "Personal Assistant",
        "instructions": DEFAULT_INSTRUCTIONS.strip(),
        "tools": [],
    }
    if model:
        kwargs["model"] = model
    return Agent(**kwargs)
