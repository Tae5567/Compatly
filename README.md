# Compatly

**Design with Confidence, Ship with Certainty.**

Compatly is a design-first CSS compatibility checker that validates web features against Baseline standards before a single line of code is written. Available as both a Figma plugin and web application, Compatly helps designers and developers catch browser compatibility issues early, when they're easiest and cheapest to fix.

## What Problem Does Compatly Solve?

Browser compatibility issues are discovered too late—often in production after designs are implemented. This leads to:
- **Costly rework** when incompatible CSS needs alternatives
- **Delayed launches** while debugging cross-browser issues  
- **Poor user experience** on unsupported browsers
- **Developer frustration** fixing avoidable problems

**Compatly shifts compatibility validation left**—from production to design—catching issues when changes are easy and inexpensive.

---

## ✨ Features

### Figma Plugin

- **Real-Time Design Analysis** - Scan frames, components, or entire pages
- **Instant Compatibility Scores** - Get 0-100 Baseline compatibility ratings
- **Automatic Feature Detection** - Identifies Flexbox, Grid, backdrop-filter, aspect-ratio, and more
- **Smart Warnings** - Alerts for features with limited browser support
- **Auto-Generated CSS** - Copy production-ready code with vendor prefixes
- **Web App Integration** - View detailed reports online

### Web Application

- **CSS Code Analysis** - Paste CSS or upload files for validation
- **Browser Support Charts** - Visual compatibility across Chrome, Firefox, Safari, Edge
- **Status Distribution** - Pie charts showing widely-available vs. limited features
- **Detailed Feature Reports** - Browser versions, MDN links, recommendations
- **AI Assistant** - Chat-style help for understanding compatibility issues
- **Export & Share** - Save reports or share analysis links

---

## 🚀 Quick Start

### Using the Figma Plugin

#### Installation

 **Manual Installation (Development)**
   ```bash
   # Clone the repository
   git clone https://github.com/Tae5567/Compatly-Plugin.git
   cd compatly-plugin
   
   # Install dependencies
   npm install
   
   # Build the plugin
   npm run build
   ```
   
   - In Figma: **Menu** → **Plugins** → **Development** → **Import plugin from manifest**
   - Select the `manifest.json` file

#### Usage

1. **Open your Figma design file**

2. **Select the element(s) you want to analyze**
   - Select a single frame, component, or layer
   - Or select nothing to analyze the entire page

3. **Launch Compatly**
   - **Menu** → **Plugins** → **Compatly**
   - Or use keyboard shortcut (varies by OS)

4. **Click "Analyze Selection"**
   - The plugin will scan your design for CSS features
   - Analysis typically takes 1-3 seconds

5. **Review Results**
   - **Baseline Score**: Overall compatibility rating (0-100)
   - **Detected Features**: List of CSS properties found
   - **Warnings**: Alerts for limited browser support
   - **Browser Support**: Compatibility across major browsers

6. **Take Action**
   - **Copy CSS Code**: Get auto-generated, production-ready CSS
   - **View Full Report**: Open detailed analysis in web app
  

---

### Using the Web App

#### Access

Visit **[compatlychecker.netlify.app](https://compatlychecker.netlify.app)**

#### Method 1: Paste CSS Code

1. **Click the CSS input area** or navigate to the main analyzer

2. **Paste your CSS code**
   ```css
   .container {
     display: grid;
     gap: 20px;
     backdrop-filter: blur(10px);
   }
   ```

3. **Click "Analyze CSS"**

4. **Review your results**
   - Compatibility score
   - Browser support charts
   - Feature-by-feature breakdown
   - Recommendations for improvements


#### Method 2: From Figma Plugin

1. **In Figma Plugin**: Click **"View Full Report in Web App"**

2. **Web app opens** with your design data pre-loaded

3. **Explore detailed analysis** with charts and AI assistance

---

## Understanding Your Results

### Baseline Score

Your **Baseline Compatibility Score** (0-100) indicates how compatible your CSS is with modern browsers:

- **90-100**: Excellent! Highly compatible across all browsers
- **75-89**: Good! Minor compatibility considerations
- **50-74**: Fair. Some features need fallbacks
- **Below 50**: Poor. Significant compatibility issues

### Feature Status Indicators

| Status | Meaning | What to Do |
|--------|---------|------------|
| 🟢 **Widely Available** | Supported in all major browsers | Safe to use! |
| 🔵 **Newly Available** | Recently became baseline | Use with recent browser targets |
| 🟡 **Limited** | Partial or emerging support | Provide fallbacks |
| 🔴 **Not Available** | Not in Baseline | Use alternatives |

### Browser Support Charts

The horizontal bar chart shows **minimum browser versions** that support each detected feature:

- **Chrome**: Google Chrome desktop & Android
- **Firefox**: Mozilla Firefox desktop
- **Safari**: Safari on macOS & iOS  
- **Edge**: Microsoft Edge

### Recommendations

For features with limited support, Compatly provides:
- **Fallback suggestions** - Alternative CSS approaches
- **Polyfill options** - JavaScript libraries for compatibility
- **Progressive enhancement** - How to layer support

---

## 🔧 Technical Details

### What Features Does Compatly Detect?

#### In Figma Plugin

- **Flexbox** (Auto Layout) - `display: flex`, `flex-direction`
- **CSS Grid** (Layout Grids) - `display: grid`, `grid-template-columns`
- **Gap** (Item Spacing) - `gap` property
- **Backdrop Filter** (Background Blur) - `backdrop-filter: blur()`
- **Aspect Ratio** - `aspect-ratio` property
- **Border Radius** - `border-radius`
- **Transforms** (Rotation) - `transform: rotate()`
- **Blend Modes** - `mix-blend-mode`
- **Box Shadow** (Multiple) - Multiple `box-shadow` layers

#### In Web App

Detects **all CSS properties** used in your code and validates against Baseline data, including:
- Layout properties (Grid, Flexbox, Positioning)
- Visual effects (Filters, Blend Modes, Masks)
- Typography (Variable Fonts, Font Features)
- Animations & Transitions
- Modern selectors (`:has()`, `:where()`, etc.)
- Custom properties (CSS Variables)
- And many more...

### Data Source

Compatly uses **official Baseline data**  which aggregates compatibility information from:
- MDN Browser Compatibility Data
- W3C Standards
- Can I Use database
- Browser release notes

This ensures **accurate, up-to-date** compatibility information.

### Browser Support Targets

Compatly considers a feature "widely available" when supported in:
- **Chrome/Edge**: Latest 2 major versions
- **Firefox**: Latest 2 major versions  
- **Safari**: Latest 2 major versions (macOS & iOS)

---

## 🎨 Use Cases

### For Designers

✨ **Validate Design Systems**
- Check if design tokens translate to compatible CSS
- Ensure component libraries work across browsers
- Document compatibility requirements for developers

✨ **Design with Constraints**
- Know which visual effects are universally supported
- Choose between similar features based on compatibility
- Create more implementable designs

✨ **Bridge Design-Dev Gap**
- Provide developers with validated CSS from designs
- Reduce back-and-forth about "can we build this?"
- Speed up handoff process

### For Developers

⚡ **Pre-Implementation Validation**
- Check CSS compatibility before writing code
- Identify which features need fallbacks upfront
- Plan progressive enhancement strategies

⚡ **Code Review Assistance**
- Validate pull requests for compatibility issues
- Ensure team follows browser support policies
- Catch issues before they reach production

⚡ **Documentation**
- Generate compatibility reports for projects
- Share browser support status with stakeholders
- Create evidence for technical decisions

### For Teams

🤝 **Shift Left**
- Catch compatibility issues during design
- Reduce expensive post-implementation changes
- Improve collaboration between design and dev

🤝 **Consistent Standards**
- Align on browser support targets
- Document compatibility decisions
- Build institutional knowledge

---

## 🏗️ Architecture

### Tech Stack

#### Figma Plugin
- **TypeScript** - Type-safe plugin development
- **Figma Plugin API** - Native integration
- **Baseline Data** - Local JSON dataset

#### Web Application
- **Next.js 15** (App Router) - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **shadcn/ui** - UI components
- **Netlify** - Hosting & deployment


## 📝 License

MIT License - see [LICENSE](LICENSE) file for details.

---