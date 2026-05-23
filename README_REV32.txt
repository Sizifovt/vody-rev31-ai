VODY Rev32 AI-connected package

Change from Rev31:
- Real AI connection remains through /api/vody-answer.
- Answers are forced into separated bullet-like idea lines.
- Front end also converts any accidental solid paragraph into separated idea lines.

Files:
- index.html
- server.js
- package.json
- render.yaml
- README_REV32.txt

Important:
- Do not put the OpenAI API key into index.html.
- Keep OPENAI_API_KEY on Render as an environment variable.
- Render should use Build Command: npm install
- Render should use Start Command: npm start
