# Next.js SaaS App Template

A professional and modern Next.js template for quickly bootstrapping SaaS applications, built with the latest best practices (App Router, TypeScript and Jest).

## 🚀 Features

- **Next.js 14+** with App Router
- Fully typed with **TypeScript**
- State management with **React Context**
- Modern font integration using `next/font`
- Built-in testing with **Jest and React Testing Library**
- Configured CI workflow using **GitHub Actions**

## 📂 Project Structure

```
.
├── app/                     # Next.js App Router
│   ├── api/                 # API Routes
│   ├── layout.tsx           # Global layout
│   └── page.tsx             # Root page
├── src/
│   ├── components/          # UI components
│   └── context/             # Context providers
├── jest.config.ts           # Jest config for UI tests
├── jest.server.config.ts    # Jest config for API tests
└── package.json             # Project dependencies and scripts
```

## 🛠️ Installation

Clone the repository:

```bash
git clone https://github.com/southworks/digital-ocean-saas-starter-kit/
cd application
```

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app running.

## ✅ Testing

Run unit tests:

```bash
npm run test
```

Run server-side tests:

```bash
npm run test:server
```

Run all tests:

```bash
npm run test:all
```

## 🚦 GitHub Actions (CI)

The provided GitHub Actions workflow (`.github/workflows/ci.yml`) will automatically run:

- ESLint checks
- Jest unit and server-side tests
- Application build checks

on every push or pull request to the `main` branch.

## 🌱 Contributing

Contributions are welcome! Feel free to open issues and submit pull requests.
