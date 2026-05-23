VODY Rev33 UI cleanup

Rev33 keeps the Rev32 AI backend connection and changes the interface only.

Implemented:
- rev32 label changed to rev33
- Asking AI appears only inside the answer card while loading
- no external AI status line
- answer idea lines have no bullet dots
- no horizontal divider lines inside answer text
- Related reading heading removed
- answer card links reduced to Web articles | Web images
- long displayed titles shortened at parentheses, e.g. Second law (force and acceleration) -> Second law
- Knowledge map is a visually separated collapsible block
- Knowledge map uses hierarchy by indentation, weight, and italic grandchild rows instead of labels Current topic / Subtopics
- Preset topics is a separate collapsible block
- More is a separate collapsible block
- iPhone-style typography and spacing closer to approved mockup

No API key changes are needed. Deploy by uploading these files over the existing GitHub repository and letting Render auto-deploy.
