"""Endpoint behavior tests for the personal assistant API."""
import unittest
from types import SimpleNamespace
from unittest.mock import AsyncMock, patch

from fastapi import HTTPException

from main import PersonalAssistantRequest, personal_assistant_chat


class PersonalAssistantEndpointTests(unittest.IsolatedAsyncioTestCase):
    async def test_returns_model_reply(self):
        with patch("main.Runner.run", new=AsyncMock(
            return_value=SimpleNamespace(final_output="Hello from the assistant.")
        )):
            response = await personal_assistant_chat(
                PersonalAssistantRequest(message="Hello")
            )
        self.assertEqual(response, {"reply": "Hello from the assistant."})

    async def test_rejects_blank_message_without_calling_model(self):
        with patch("main.Runner.run", new=AsyncMock()) as run:
            with self.assertRaises(HTTPException) as caught:
                await personal_assistant_chat(
                    PersonalAssistantRequest(message="   ")
                )
        self.assertEqual(caught.exception.status_code, 422)
        run.assert_not_awaited()

    async def test_hides_provider_error_details(self):
        with patch("main.Runner.run", new=AsyncMock(
            side_effect=RuntimeError("sensitive provider detail")
        )):
            with self.assertRaises(HTTPException) as caught:
                await personal_assistant_chat(
                    PersonalAssistantRequest(message="Hello")
                )
        self.assertEqual(caught.exception.status_code, 503)
        self.assertNotIn("sensitive provider detail", caught.exception.detail)


if __name__ == "__main__":
    unittest.main()
