# Trading Simulator Frontend

React + Vite + TypeScript frontend for the Real-Time Trading Simulator. Connects to the SignalR hub and displays real-time price charts.

## Run

From the repository root or this folder:

```bash
cp .env.example .env
npm install
npm run dev
```

Open `http://localhost:5173`. The app connects to the SignalR hub at `VITE_HUB_URL` (default `http://localhost:5001/tradingHub`). Ensure the WebApi is running before opening the app.

## Environment

| Variable       | Description              | Default                          |
|----------------|--------------------------|----------------------------------|
| VITE_HUB_URL   | SignalR hub URL          | http://localhost:5001/tradingHub |

## Scripts

- `npm run dev` — Start dev server (Vite)
- `npm run build` — Build for production
- `npm run preview` — Preview production build
- `npm run lint` — Run ESLint

---

For the base Vite + React template documentation, see the sections below.

---

# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see this [documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules. See the [Vite + React + ESLint documentation](https://eslint.org/docs/latest/use/configure/).
