VODY Rev31 AI-connected package

Files:
- index.html: Rev31 front end. Preset topics still work immediately.
- server.js: Backend endpoint /api/vody-answer. This is the part that talks to OpenAI.
- package.json: Node/Express app definition.
- render.yaml: Optional Render deployment configuration.

Important:
- Do not put the OpenAI API key into index.html.
- Set OPENAI_API_KEY on the server environment.
- Optional: set OPENAI_MODEL. Default is gpt-4.1-mini.

Local test on a computer with Node installed:
1. Open a terminal in this folder.
2. Run: npm install
3. Run, with OPENAI_API_KEY set in your environment: npm start
4. Open: http://localhost:3000

Behavior:
- Stored preset topics use preset answers first.
- New topics call /api/vody-answer.
- If the backend or key is missing, the app shows AI connection failed instead of a fake answer.
