"""Check the Dockerfile's Firebase argument validation using its shell command."""

import os
from pathlib import Path
import subprocess
import unittest


DOCKERFILE = Path(__file__).resolve().parents[1] / "Dockerfile"
FIREBASE_ARGS = (
    "REACT_APP_FIREBASE_API_KEY",
    "REACT_APP_FIREBASE_AUTH_DOMAIN",
    "REACT_APP_FIREBASE_PROJECT_ID",
    "REACT_APP_FIREBASE_STORAGE_BUCKET",
    "REACT_APP_FIREBASE_MESSAGING_SENDER_ID",
    "REACT_APP_FIREBASE_APP_ID",
    "REACT_APP_FIREBASE_VAPID_KEY",
)


class FirebaseBuildArgumentsTest(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        instructions = DOCKERFILE.read_text().splitlines()
        start = next(i for i, line in enumerate(instructions) if line.startswith('RUN : "${REACT_APP_FIREBASE_'))
        lines = []
        for line in instructions[start:]:
            lines.append(line.removeprefix("RUN ") if not lines else line)
            if not line.rstrip().endswith("\\"):
                break
        cls.command = "\n".join(lines)

    def run_validation(self, values):
        env = {key: value for key, value in os.environ.items() if key not in FIREBASE_ARGS}
        env.update(values)
        return subprocess.run(["/bin/sh", "-c", self.command], env=env, capture_output=True, text=True)

    def test_all_values_present(self):
        result = self.run_validation({key: "test-value" for key in FIREBASE_ARGS})
        self.assertEqual(result.returncode, 0, result.stderr)

    def test_each_missing_or_empty_value_fails_without_printing_values(self):
        for key in FIREBASE_ARGS:
            for missing in (True, False):
                with self.subTest(key=key, missing=missing):
                    values = {name: "test-value" for name in FIREBASE_ARGS}
                    if missing:
                        del values[key]
                    else:
                        values[key] = ""
                    result = self.run_validation(values)
                    self.assertNotEqual(result.returncode, 0)
                    self.assertIn(key, result.stderr)
                    self.assertNotIn("test-value", result.stdout + result.stderr)


if __name__ == "__main__":
    unittest.main()
