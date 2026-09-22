# My College Portfolio

A personal portfolio website built with plain HTML, CSS, and JavaScript — no frameworks, no AI-generated code. Live at **[my-college-portfolio-nu.vercel.app](https://my-college-portfolio-nu.vercel.app)**.

## About

This is Talha Habib's personal portfolio, showcasing projects, skills, and live GitHub activity as a Full-Stack Developer (MERN & Laravel) based in Chitral, Pakistan.

## Features

- **Hero section** — intro, role, and quick social links (GitHub, LinkedIn, Facebook, WhatsApp)
- **About** — short bio and background
- **Live GitHub Activity** — repo count, stars, languages, and followers pulled straight from the GitHub API
- **Services** — Frontend, Backend, and AI Integration
- **Projects** — a grid of linked GitHub repos
- **Languages, Frameworks & Tools** — icon grid of the stack in use
- **Contact form** — powered by [Formspree](https://formspree.io)
- Smooth scroll-reveal animations and a responsive two-column layout

## Tech Stack

| Category | Tools |
|---|---|
| Markup / Styling | HTML5, CSS3 |
| Scripting | Vanilla JavaScript |
| Icons | [Boxicons](https://boxicons.com), [Devicon](https://devicon.dev) |
| Fonts | Google Fonts (Poppins, Inter) |
| Forms | Formspree |
| Hosting | Vercel |

## Project Structure

```
My-College-Portfolio/
├── index.html            # Main page markup
├── style.css              # Core styles
├── script.js               # Scroll-reveal, nav toggle, form handling, etc.
├── github-activity.js       # Fetches and renders live GitHub stats
├── github-activity.css       # Styles for the GitHub activity section
├── favicon.png
├── favicon-64.png
└── t1.png
```

## Running Locally

No build step is required — it's static HTML/CSS/JS.

1. Clone the repo
   ```bash
   git clone https://github.com/TalhaHabib-hub/My-College-Portfolio.git
   cd My-College-Portfolio
   ```
2. Open `index.html` in your browser, or serve it locally:
   ```bash
   npx serve .
   ```

## Setup Notes

- The contact form posts to Formspree — replace `YOUR_FORM_ID` in `index.html` with your own [Formspree](https://formspree.io) endpoint to make it functional.
- The GitHub Activity section fetches data live from the GitHub API for the `TalhaHabib-hub` account — update the username in `github-activity.js` if you fork this for your own use.

## Deployment

Deployed on [Vercel](https://vercel.com) — any static hosting (Netlify, GitHub Pages, etc.) works just as well since there's no backend or build process.

## License

This project is open for reference and learning. Feel free to fork it, but please don't pass it off as your own portfolio.

## Contact

- GitHub: [@TalhaHabib-hub](https://github.com/TalhaHabib-hub)
- LinkedIn: [Talha Habib](https://www.linkedin.com/in/talha-habib-411405410/)
