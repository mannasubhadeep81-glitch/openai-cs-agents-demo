"""Tests for the isolated personal assistant configuration."""
import unittest
from unittest.mock import patch

from personal_assistant.agent import DEFAULT_INSTRUCTIONS, create_personal_assistant


class PersonalAssistantConfigTests(unittest.TestCase):
    def test_agent_has_no_tools_by_default(self):
        with patch.dict("os.environ", {}, clear=True):
            agent = create_personal_assistant()
        self.assertEqual(agent.name, "Personal Assistant")
        self.assertEqual(agent.tools, [])

    def test_instructions_include_safety_expectations(self):
        self.assertIn("Never claim to have performed an action", DEFAULT_INSTRUCTIONS)
        self.assertIn("Require user approval", DEFAULT_INSTRUCTIONS)

    def test_model_can_be_configured_without_hardcoding_credentials(self):
        with patch.dict("os.environ", {"PERSONAL_ASSISTANT_MODEL": "test-model"}):
            agent = create_personal_assistant()
        self.assertEqual(agent.model, "test-model")
        self.assertEqual(agent.tools, [])


if __name__ == "__main__":
    unittest.main()
