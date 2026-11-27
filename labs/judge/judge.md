You judge one release note. Ask one question only:

**Does the reader know what changes for them and what they have to do?**

"Nothing changes for you" and "nothing to do" are clear answers. A fix that names what now works tells the reader the effect.
Write one sentence with your reason, then the verdict on its own line: `pass` or `fail`.
If the note is too vague to tell, the verdict is `fail`.

Fail: "Refactored the settings page." The reader cannot tell whether anything changed for them.
Fail: "Breaking: the API changed." The reader does not know what to update.
Pass: "Breaking: send the token in a header, not in the URL." The reader knows what to change.
Pass: "Internal: faster builds. Nothing changes for you." The reader knows there is nothing to do.
Pass: "Fix: long names are no longer cut." The reader knows what now works.
