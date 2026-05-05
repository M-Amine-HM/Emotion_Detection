# Real-Time Emotion Detection

A real-time web app that captures webcam frames, sends them to a FastAPI backend, runs HuggingFace inference, and renders live emotion predictions with confidence scores.

## Tech Stack
- Backend: FastAPI, Hugging Face Inference API, Pillow
- Frontend: React, Vite, Tailwind CSS
- Model: dima806/facial_emotions_image_detection

## How to Run

### Backend
1. `cd backend`
2. `python -m venv .venv`
3. Activate your venv
4. `pip install -r requirements.txt`
5. Set your Hugging Face token (PowerShell): `$env:HF_API_TOKEN="your_token"`
6. `uvicorn main:app --reload --host 0.0.0.0 --port 8000`

### Frontend
1. `cd frontend`
2. `npm install`
3. `npm run dev`

Open `http://localhost:5173` in your browser.

## Screenshot

![Screenshot](./screenshot.png)

## Badges

![FastAPI](https://img.shields.io/badge/FastAPI-009688?logo=fastapi&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite-646CFF?logo=vite&logoColor=white)
![Tailwind](https://img.shields.io/badge/Tailwind_CSS-38B2AC?logo=tailwind-css&logoColor=white)
![HuggingFace](https://img.shields.io/badge/HuggingFace-FFCC4D?logo=huggingface&logoColor=000)
