# Groove Morph

A static, playable drum machine built with HTML, CSS, JavaScript and Web Audio.
Licensed under the MIT license; see [LICENSE](LICENSE).

## Play

- Press **Play**, then drag the XY surface: horizontal blends House, Techno,
  Breakbeat and Electro; vertical changes rhythmic complexity.
- Six synthesized instruments: kick, snare, closed hi-hat, open hi-hat, clap and tom.
- BPM: 60–200. Energy controls hit intensity. Pattern changes enter on the next bar.
- **Freeze** repeats the exact current 16-step pattern and velocities from the next
  bar. Controls can prepare a new groove; releasing Freeze applies it on the next
  bar. Tempo remains adjustable.
- Space toggles Play/Stop; F toggles Freeze when focus is outside a form control.
- Slider controls provide keyboard access to both XY axes.
- Playback stops when the tab becomes hidden to avoid bursts after browser throttling.

No sample downloads, runtime packages, tracking, or external fonts.
This is a browser prototype, not a native live-performance audio engine.
MIDI and recording are not included.

## Run locally

Serve this directory with any static HTTP server, for example:

```sh
python -m http.server 8000
```

Open http://localhost:8000. Audio starts only after pressing Play.
Run pattern tests with `npm test` (Node.js 20 or later; no install required).

## GitHub Pages

1. In **Settings → Pages → Build and deployment → Source**, choose **GitHub Actions**.
2. The workflow in `.github/workflows/deploy.yml` runs on pushes to `main`
   and supports manual runs from the Actions tab.
3. It tests the pattern engine, checks JavaScript syntax, and deploys only the
   static site files using official GitHub Actions.
4. Confirm a successful deployment in Actions, then open the environment URL.

Expected project URL: https://stefano-v.github.io/groove-morph/
This URL is not proof of a successful deployment.

Reference: https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages
