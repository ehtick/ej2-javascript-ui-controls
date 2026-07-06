# TypeScript to JSON Metadata Extractor

## 📌 Project Overview

This project extracts **TypeScript** information and converts it into structured **JSON metadata**.

---

## 📁 File Structure

```
.
├── input\        # Paste the .ts source files
│                   
├── ts-to-json.js   # Main conversion script (Node.js)
└── output\    # Generated output. Json for each .ts file
```

---

## 🚀 Steps to Run

1. Copy your TypeScript files into `input\`
2. Open a terminal and navigate to the project directory (for example: `ts-morph`)
3. Install dependencies:
   ```bash
   npm install
   ```
4. Run the conversion script:
   ```bash
   node .\ts-to-json.js
   ```
5. The extracted methods  will be generated in `output\` folder.

---

## ✅ Output

- `methods.json` contains structured JSON metadata extracted from the TypeScript source in `input.ts`.

---

## 🛠️ Requirements

- Node.js

---
