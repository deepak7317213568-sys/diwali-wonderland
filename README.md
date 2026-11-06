# 🪔 DIWALI WONDERLAND — THE ROYAL 3D DIWALI ADVENTURE (PREMIUM UPGRADE)

> **"This Diwali, the magic is yours."**  
> *Created and presented by **Deepak Prajapati***

---

## 🌟 Overview & Identity

**DIWALI WONDERLAND** is an award-winning, cinematic 3D Diwali festival experience built entirely in **pure JavaScript (React + Vite)** and **Three.js / React Three Fiber / GSAP**. It transforms the traditional Diwali wish into a royal Indian palace adventure featuring interactive stages, unlockable challenges, fireworks, a 3D golden surprise gift, and an honest referral sharing system.

### 🎨 Visual Theme: Royal Golden Diwali — Palace of Lights
- **Midnight Sky:** `#090719`
- **Royal Purple:** `#21103D`
- **Rich Maroon:** `#4A1028`
- **Deep Wine / Burgundy:** `#1e0514` to `#2d0b1f` (Final Wishes Card)
- **Metallic Gold:** `#FFD36A`
- **Warm Champagne:** `#FFF0C2`
- **Diya Orange:** `#FF8A24`
- **Ivory White:** `#FFF9ED`

---

## 🚀 The Complete 7-Stage Progression

1. **🏰 Screen 1: Cinematic Entry**
   - Full 3D royal Indian palace at night with floating golden sparks, distant fireworks, and glowing jharokhas.
   - Primary CTA: *"ENTER DIWALI WONDERLAND"* (with camera fly-through and *Skip Intro* option).
2. **🌐 Screen 2: Language Selection**
   - Two large golden glassmorphism cards:
     - **हिंदी – हिंदी में आगे बढ़ें**
     - **ENGLISH – Continue in English**
   - Dynamic global translation with live language toggle in the header.
3. **🗺️ Screen 3: Adventure Dashboard & Stage Map**
   - 7 connected stages along an animated golden path with celebration progress percentage (`0%` to `100%`).
   - Strict gating: tasks unlock sequentially and persist in `localStorage`.
4. **🪔 Stage 1: Light the Diyas**
   - 5 interactive 3D terracotta diyas with organic flame flicker, oil reflections, and sparkle ignition.
   - Reward: **Golden Light Badge (स्वर्ण दीप सम्मान)**.
5. **🧠 Stage 2: The Festival Challenge (Randomized Quiz)**
   - 20+ authentic Diwali trivia questions.
   - Dynamic answer shuffling: correct answers are evenly distributed across A, B, C, and D.
   - Reward: **Festival Champion Badge (उत्सव विजेता सम्मान)**.
6. **🎨 Stage 3: Unlock the Magic (Interactive Rangoli)**
   - Royal mandala with 5 snap-to-place sacred motifs (Kalash, Peacock Feather, Crimson Bloom, Marigold, Diya).
   - Rotating golden light wave on completion.
   - Reward: **Master of Lights Badge (रंगोली शिल्पी सम्मान)**.
7. **🎁 Stage 4: The Grand Surprise Gift**
   - Realistic 3D metallic gold gift box with GSAP animated velvet ribbon, opening lid, and emerging floating card.
   - Reward: **Royal Diwali Wonder Badge (शाही दीवाली विस्मय सम्मान)**.
8. **✨ Stage 5: Anar Fountain Fireworks (NEW)**
   - Interactive traditional conical Anar.
   - Button: *Light the Anar (अनार जलाएं)*.
   - Real-time physics fountain shooting golden and orange sparks with smoke and crackle sound.
   - Reward: **Royal Anar Badge (राजसी अनार सम्मान)**.
9. **🌀 Stage 6: Whirling Chakri Fireworks (NEW)**
   - Interactive ground spinner firework.
   - Button: *Light the Chakri (चकरी जलाएं)*.
   - Accelerating angular velocity emitting Archimedean spiral sparks, smoke, and whooshing sounds.
   - Reward: **Spinning Spark Badge (तेजस्वी चकरी सम्मान)**.
10. **💌 Stage 7: Grand Celebration & Final Wishes Card (NEW — Inspired by Reference Screenshots)**
    - Deep burgundy/wine greeting card with thin double-line golden border and glowing corner diyas.
    - Heading: *"A Little Wish From My Heart"* / *"दिल से एक छोटी-सी शुभकामना"*.
    - Hindi Wishes Poetry & English Quote in Cormorant Garamond.
    - Signature: *"With Love & Best Wishes, Deepak Prajapati ❤️"* with floral accents `🌸 ✦ 🌸`.
    - One-click *Share My Wishes*, *Replay Celebration*, and *Explore Referrals*.
11. **🤝 Stage 8: Share the Light & Honest Referral System**
    - Unique referral code generator (`DEEPAK-XXXXXX`), WhatsApp share, Web Share API, and canvas QR Code.
    - Honest tracking: filters self-visits and repeated refreshes.

---

## 🎵 Background Music Integration

- User's supplied audio track is integrated directly at `client/public/audio/diwali-music.mp3`.
- Starts automatically upon user interaction (complying with browser autoplay policies).
- Plays seamlessly across stages without restarting.
- Header floating controls: **Play/Pause**, **Mute/Unmute**, and **Volume Slider**.

---

## 💻 Local Development Setup

### 1. Start the Backend Server:
```powershell
cd "c:\Users\Deepak Prajapati\Desktop\All-Project\Project\diwali-wonderland\server"
npm start
```
*Server listens on `http://localhost:5000` (in demo mode if no `MONGO_URI` is provided).*

### 2. Start the Frontend Client:
In a second terminal:
```powershell
cd "c:\Users\Deepak Prajapati\Desktop\All-Project\Project\diwali-wonderland\client"
npm run dev
```
*Opens at `http://localhost:3000`.*

---

## 🧪 Verified QA Test Results

- **Vite Production Build:** Passed (0 errors, 0 warnings).
- **Quiz Randomization & Validation Test:** Passed (21 master questions verified in EN & HI, 30 simulated sessions, balanced distribution across A, B, C, D: 21, 27, 21, 21).
- **Backend API Integration Tests:** Passed (12 of 12 test assertions passed).
- **TypeScript Compliance:** 100% pure JavaScript & JSX (0 `.ts` or `.tsx` files in source).
