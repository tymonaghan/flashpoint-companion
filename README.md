# Flashpoint Companion

A local browser companion app for playing **Halo: Flashpoint**, the tactical miniatures skirmish game. Built with [React](https://react.dev/), [Chakra UI v3](https://www.chakra-ui.com/), and [Vite](https://vite.dev/).

## Features

### 🔧 Setup Tab
- Configure **Red** and **Blue** fireteams before the game.
- Each team supports up to **4 members**, each with a Name and Unit Type.
- Checking **Legendary** on a member reduces the team's active roster by 1 (e.g. 1 Legendary + 2 Standard = 3 active members).

### ⚔️ Game Tab
- Displays all active members for both fireteams.
- **Activate** each member with a checkbox — once all alive members are activated, the **Next Turn** button appears.
- **Mark Killed** any member to open a casualty report dialog with notes; the opposing team automatically receives 1 point.
- **Scoreboard** at the top tracks each team's kill points and the current turn number.
- **Next Turn** opens a checklist dialog confirming: weapons dropped, shields replenished, and command dice rolled.
- **End Game** displays the winner and a full **After Action Report** (AAR) listing all casualties in order with turn numbers and notes.

### 💬 Ask Tab
- Chat interface powered by **OpenAI GPT-4o-mini**.
- Pre-loaded with a comprehensive Halo: Flashpoint rules system prompt so the assistant can answer rules questions in plain language.
- Enter your OpenAI API key in the UI (used locally, never stored or sent anywhere except the OpenAI API).

## Development

```bash
npm install
npm run dev      # start dev server at http://localhost:5173
npm run build    # production build
npm run lint     # oxlint
```

## Stack

- **React 19** + **TypeScript**
- **Chakra UI v3** (component library)
- **Vite 8** (bundler)
- **OpenAI API** (Ask tab)
