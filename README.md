

# 🎯 OCR Card Scanner

![Demo](/demo.png)

A modern, privacy-first credit card OCR scanner built with Next.js, React, and WebAssembly. This application processes credit card information entirely in your browser without sending any data to external servers, ensuring complete privacy and security.

## ✨ Features

- **100% Local Processing**: All OCR operations run in the browser - no data leaves your device
- **Real-time Card Detection**: Live camera feed with intelligent card number recognition
- **Modern UI/UX**: Beautiful glass morphism design with smooth animations
- **Privacy by Design**: Card numbers are masked by default with option to reveal
- **Smart Detection Overlay**: Visual feedback with confidence scoring
- **Multi-format Support**: Works with various card layouts and orientations
- **Mobile Responsive**: Optimized for both desktop and mobile devices
- **WebAssembly Powered**: Uses Tesseract.js for high-performance OCR
- **Custom Hooks**: Clean, reusable React hooks architecture

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- NPM or Yarn
- Modern web browser with camera support

### Installation

1. **Clone the repository**

```bash
git clone https://github.com/fariborz0015/ocr-card-scanner.git
cd ocr-card-scanner
```

2. **Install dependencies**

```bash
npm install

```

3. **Run development server**

```bash
npm run dev

```

4. **Open in browser**
   Navigate to `http://localhost:3000` and allow camera permissions

## 🛠️ Technical Architecture

### Stack

- **Frontend**: Next.js 14 with App Router
- **UI Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS with custom animations
- **OCR Engine**: Tesseract.js (WebAssembly)
- **Camera API**: WebRTC getUserMedia
- **State Management**: Custom React hooks
- **Build Tool**: Next.js with Turbopack

### Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── globals.css        # Global styles and animations
│   ├── layout.tsx         # Root layout component
│   └── page.tsx           # Home page
├── components/            # React components
│   └── CardScanner.tsx    # Main scanner component
├── hooks/                 # Custom React hooks
│   ├── useCamera.ts       # Camera management
│   ├── useOCR.ts          # OCR functionality
│   ├── useCardScanner.ts  # Combined scanner logic
│   └── index.ts           # Hook exports
└── lib/
    └── utils.ts           # Utility functions
```

## 🎨 Custom Hooks Architecture

### `useCamera`

Manages camera functionality including:

- Camera permission handling
- Video stream management
- Error handling with fallbacks
- Device detection and settings

### `useOCR`

Handles OCR operations:

- Tesseract.js worker initialization
- Text recognition with confidence scoring
- Error recovery and retry logic
- WebAssembly optimization

### `useCardScanner`

Combines camera and OCR functionality:

- Frame processing pipeline
- Card number extraction and validation
- Real-time detection overlay
- State synchronization

## 🎨 Visual Features

- **Glass Morphism**: Modern blur effects with transparency
- **Animated Background**: Flowing gradient blobs with CSS animations
- **Real-time Overlay**: Dynamic detection frame with confidence indicators
- **Smooth Transitions**: 60fps animations with hardware acceleration
- **Loading States**: Beautiful progress indicators and skeleton screens
- **Dark Theme**: Eye-friendly design optimized for various lighting
- **Responsive Layout**: Adaptive design for all screen sizes

## 🔒 Privacy & Security

- **No Server Communication**: All processing happens locally in your browser
- **No Data Storage**: Card information is never saved or cached
- **Masked Display**: Card numbers are hidden by default
- **Secure Processing**: OCR runs in isolated WebAssembly environment
- **Camera Only**: No access to storage, network, or other device features

## 📱 Browser Compatibility

- ✅ Chrome 80+ (recommended)
- ✅ Firefox 78+
- ✅ Safari 14+
- ✅ Edge 80+
- ✅ Mobile browsers with camera support
- ⚠️ Internet Explorer (not supported)

## 🎯 How It Works

### OCR Pipeline

1. **Camera Initialization**: Request camera access with optimal settings
2. **Frame Capture**: Extract video frames at 1-second intervals
3. **Image Preprocessing**: Convert to grayscale and enhance contrast
4. **Region Extraction**: Focus on card number area for better accuracy
5. **Text Recognition**: Use Tesseract.js to extract text with confidence
6. **Validation**: Verify card number format and display results

### Detection Algorithm

```typescript
// Extract card number region
const cardRegion = extractCardNumberRegion(canvas);

// Preprocess for better OCR accuracy
const processedImage = preprocessImage(cardRegion);

// Recognize text with confidence scoring
const { text, confidence } = await recognizeText(blob);

// Validate card number format
const cardPattern = /(\d{4}\s?\d{4}\s?\d{4}\s?\d{4})/;
if (cardPattern.test(text) && confidence > 60) {
  // Display detected card number
}
```

## 🎨 Customization

### Theme Colors

Modify colors in `globals.css`:

```css
:root {
  --primary-gradient: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  --glass-bg: rgba(255, 255, 255, 0.1);
  --glass-border: rgba(255, 255, 255, 0.2);
}
```

### Animation Speed

Adjust animation durations in Tailwind classes:

```tsx
// Fast animations
className = "transition-all duration-150";

// Slow animations
className = "transition-all duration-500";
```

### OCR Settings

Configure OCR parameters in `useOCR.ts`:

```typescript
const worker = await Tesseract.createWorker("eng", 1, {
  logger: (m) => console.log(m),
  workerPath: "/wasm/worker.min.js",
  corePath: "/wasm/tesseract-core-simd.wasm.js",
});
```

## 🧪 Testing

```bash
# Run type checking
npm run type-check

# Build for production
npm run build

# Start production server
npm start

# Lint code
npm run lint
```

## 📦 Deployment

### Vercel (Recommended)

```bash
npm install -g vercel
vercel deploy
```

### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Tesseract.js**: WebAssembly OCR engine
- **Next.js**: React framework with excellent developer experience
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide React**: Beautiful icon library
- **WebRTC APIs**: Native browser camera access

## 🛣️ Roadmap

- [ ] Support for more card types (ID cards, passports)
- [ ] Batch processing for multiple cards
- [ ] Export functionality (CSV, JSON)
- [ ] Advanced image filters and preprocessing
- [ ] Offline PWA support
- [ ] Multi-language OCR support

## 📞 Support

If you encounter any issues or have suggestions:

1. Check existing [Issues](https://github.com/your-username/ocr-wasm/issues)
2. Create a new issue with detailed description
3. Include browser version and error messages

---

## 👨‍💻 Developer

**Fariborz**

- 🌐 **Website**: [fariborzz.ir](https://fariborzz.ir)
- 💼 **LinkedIn**: [fariborzamm](https://www.linkedin.com/in/fariborzamm)
- 🔗 **GitHub**: [fariborz0015](https://github.com/fariborz0015)

---

<div align="center">
  <p>Built with ❤️ for privacy-conscious developers</p>
  <p>⭐ Star this repository if you found it helpful!</p>
  <p>🔒 Your privacy matters - everything stays local!</p>
</div>
