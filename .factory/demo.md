# Demo sandbox

Open <https://takeout-photo-metadata-fixer.sociobot.in/demo> or add `?demo=1` to the home URL.

The demo opens directly on a populated inspection screen. Its in-memory sample contains:

- a JPEG with a Google date and Lisbon location;
- a PNG with a Google date and Cornwall location;
- an exact JPEG album copy;
- an unmatched JPEG;
- a matched HEIC file and matched MP4 that are copied unchanged.

The banner remains visible throughout demo mode. **Reset demo** recreates the original sample and options. **Start for real** discards demo state and then loads the real settings namespace.

Demo mode uses memory only. It does not open, read, or write the `takeout-tidy` IndexedDB database or localStorage. The service worker may update the shared static-asset cache, but it never stores selected or sample media.

Claim tests start from `/demo` or `/?demo=1`; see [claims.json](claims.json).
