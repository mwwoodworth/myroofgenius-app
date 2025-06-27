# Execution Plan for MyRoofGenius App Sprints

Below we outline each development sprint in the **`/sprints`** directory and detail how to execute it with precision. Each sprint includes requirements parsing, implementation steps (file edits/creations, UI integration, AI logic), testing, and deployment tasks. Throughout, we apply the **Quantum Leap UI System** design standards – using glassmorphism effects, smooth Framer Motion transitions, responsive dark/light themes, and polished Tailwind styling – to ensure a futuristic, AI-native user experience. We also integrate AI features (Claude, OpenAI GPT-4, Google Gemini) per sprint specifications, using environment flags to toggle features as needed.

## Sprint 1: UI Framework Setup & AI Estimator Feature

**Requirements:** Initialize the base project with Tailwind CSS and PostCSS, set up the Quantum Leap design system, and implement the **AI Roof Estimator** module. This includes foundational UI components (buttons, cards, layouts) with glassmorphic styling, and a new Estimator page that allows users to input project data and get AI-generated estimations. Also, establish routing for core pages (Marketplace, Admin Dashboard, Checkout) and ensure the Estimator is gated by a feature flag.

**Implementation Plan:**

* **Tailwind & Theme Configuration:** Install and configure Tailwind CSS and PostCSS (if not already). Define a custom theme in **`tailwind.config.js`** aligning with the Quantum Leap UI palette (e.g. translucent surfaces, vibrant accent colors, dark mode classes). Ensure global styles (perhaps in **`globals.css`** or similar) include a **backdrop-blur** utility for glass effects and CSS variables or classes for light/dark themes. Include motion utility classes or import Framer Motion for later use.

* **Base UI Components:** Create core UI components in **`components/ui/`** (e.g. `Button.tsx`, `Card.tsx`, `Modal.tsx`, etc.) following design standards. For example, a Card component with rounded corners and subtle shadow, and a Button component with primary/secondary variants. Use Tailwind classes and conditional `className` props for dark mode (e.g. toggling text and bg colors). These will be used across pages for consistency.

* **Layout and Navigation:** Implement a site layout in **`app/layout.tsx`** or a main layout component wrapping pages. Include a navigation bar (possibly **`components/Navbar.tsx`**) with links to main sections: Dashboard, Estimator, Marketplace, etc. Ensure the nav and layout adhere to the glassmorphic style (e.g. semi-transparent nav background) and remain responsive. Include any top-level providers (theme context, etc.) if needed.

* **AI Estimator Page:** Create a new page **`app/estimator/page.tsx`** (or `pages/estimator.tsx` in older Next.js structure) that provides an interface for roofing project estimation. This likely includes a form for inputting project details (roof size, materials, location, etc.) and a **“Generate Estimate”** button. When clicked, it should call an AI backend (perhaps an API route or the FastAPI backend) to compute or retrieve an estimate. Integration points:

  * If an AI model is used (OpenAI or Claude), prepare a prompt with the user’s inputs and call the LLM via a backend route or directly from the frontend using the existing LLM wrapper in **`app/lib/llm.ts`**. For example, use the `chat()` or `chatStream()` function which selects the provider based on `LLM_PROVIDER` env var.
  * Alternatively, if the estimator logic is internal (not purely LLM), implement the calculation logic or call a dedicated API endpoint.
  * Display the resulting estimate in a friendly format (perhaps a breakdown of costs, materials, etc.). Use a Card or Modal to show results with animation (e.g. fade-in via Framer Motion).

* **Feature Flag Integration:** Use the environment flag **`ESTIMATOR_ENABLED`** to toggle this page’s availability. For example, in the navigation and routes, only show the Estimator link if `process.env.NEXT_PUBLIC_ESTIMATOR_ENABLED` is true. Also ensure backend routes or API calls related to the estimator check the flag or handle being off. In development, leave it true by default (as provided in **`.env.example`**).

* **Other Core Features Setup:** (If sprint scope includes them) Scaffold **Marketplace**, **Admin**, **Checkout** pages:

  * Marketplace: Create **`app/marketplace/page.tsx`** with a product grid (even if placeholder content initially). Use dummy product data or fetch from Supabase `products` table (as seen in the codebase) and display in a responsive grid of Cards. Include category filters, search bar, etc., as provided in the initial implementation.
  * Admin Dashboard: Possibly a page **`app/dashboard/page.tsx`** or a component **`components/AdminDashboard.tsx`** that shows some summary stats. Integrate any placeholders for now (to be enhanced in later sprints).
  * Checkout: Ensure there is an **`/api/checkout`** route or similar for handling Stripe purchases and a **Checkout** page or modal. Use Stripe public key from env and redirect to Stripe checkout when buying a product (the code for this exists, e.g. the `buyNow` function in Marketplace).
  * Copilot (basic hookup): If an AI Copilot floating widget or panel is part of v1.0, create a minimal **`CopilotPanel`** component (maybe just a chatbot icon or panel that says “AI Assistant Ready”). The full logic will come in Sprint 3, but ensure feature flag **`AI_COPILOT_ENABLED`** exists to toggle it in the UI (for example, conditionally render the panel component in the layout when flag is true).

**Testing & Verification:**

* Run `npm run type-check` and `npm run lint` to ensure the new components and pages have no type or lint errors.
* Launch the dev server and verify the Estimator page UI loads and is styled consistently (glassmorphic input cards, buttons hover effects, etc.). Try toggling dark mode (if supported) to see styles adjust.
* If connected to the AI backend, test a sample estimation to see if a response is returned. If the AI call is not yet implemented (could use a stub), ensure the UI handles that gracefully.
* Check that the feature flags work: set `ESTIMATOR_ENABLED=false` in env and reload – the Estimator page link should hide or redirect to home if accessed.
* All core pages (Marketplace, Admin, etc.) should render without errors. Run `npm test` for any unit tests (add tests for the Estimator logic if applicable).

**Commit & Documentation:**

* Commit with message like `feat(estimator): add AI estimator page and base UI components`.
* Update **README.md** or **docs/changelog.md** with details: e.g., “Added AI Estimator page and integrated base Quantum Leap UI design system.” Include instructions on enabling the Estimator via env flag.
* Push to `main` branch and await code review approval before proceeding.

## Sprint 2: Marketplace, Admin & Checkout Enhancements

**Requirements:** Build out the **Marketplace** product catalog with filtering, searching, and integration to Stripe checkout. Implement the **Admin Dashboard** for administrators to view metrics (with placeholder or real data). Finalize the **Checkout** flow (Stripe payments) and ensure end-to-end integration (including webhooks if any). This sprint focuses on making the core SaaS modules production-ready, with polished UI and no placeholders.

**Implementation Plan:**

* **Marketplace Page Functionality:** Expand **`app/marketplace/page.tsx`** to dynamically load products from the database. The existing code already fetches products from Supabase and applies filters/search/sort; refine this by:

  * Ensuring the Supabase credentials are loaded from env and error handling is in place (as shown in fetchProducts function).
  * Displaying a **loading state** (spinner) while products load, and a **“no results”** message if none match filters.
  * Presenting products in a grid of Cards with consistent styling: use the Card UI component. The code already uses Tailwind classes for a clean grid and animations on hover. We should maintain the glassmorphism theme for the hero section (e.g., the category badges with `bg-white/20 backdrop-blur` are already in place).
  * Implement interactive filters: category sidebar (toggle active category with Tailwind classes for active state), price range slider, sort dropdown. Ensure they update state and trigger re-render of the product grid (the existing `filterAndSortProducts()` covers this).
  * Make sure the **“View Details”** and **“Buy Now”** buttons on each product work. The “Buy Now” should call the checkout API and then redirect to Stripe checkout URL. Verify the API route **`/api/checkout`** exists and handles the Stripe payment intent (likely already implemented since Stripe keys are in env and tests were done).

* **Admin Dashboard:** Create or refine **`app/dashboard/page.tsx`** (or use **`components/AdminDashboard.tsx`** if it exists). This page should present key metrics for admin users in a visually appealing way. For example:

  * Total users, total sales, recent orders, etc., possibly pulled from the database or provided via an admin API.
  * Use cards or charts to display data. If no backend endpoints exist yet for metrics, use placeholders or mock data but structure the components so they can be wired up easily later.
  * Integrate any **Claude-powered insights** if applicable – e.g., an AI summary of platform performance (“Copilot, summarize this week’s sales anomalies”). This could be done by calling the LLM with recent data. If not planned, leave a section for “AI Insights” for future enhancement.
  * Ensure the dashboard is only accessible to admin roles. If authentication is in place, check current user’s email against `ADMIN_EMAILS` env (provided in `.env.example`) and redirect if not admin. If no auth yet, it might be open but we should at least hide sensitive controls.

* **Checkout Flow:** Finalize integration with Stripe:

  * Ensure **Stripe API keys** are set in the environment and the backend uses them (likely via a FastAPI endpoint or Next API route that the `/api/checkout` calls). The sprint may involve writing a webhook handler for Stripe payments (to confirm orders in the database once paid). If a webhook is needed, set up an endpoint (FastAPI route in `backend/main.py` or Next route under **`app/api/stripe/webhook.ts`**). Use the `STRIPE_WEBHOOK_SECRET` from env for verification.
  * Test a full purchase: clicking **Buy Now** -> calls **`/api/checkout`** -> Stripe Checkout page -> after payment, Stripe redirects to a success page (configure the redirect URL env if needed). Ensure the success page or post-payment state updates the order status in the DB (the seed or backend might have an `orders` table; otherwise, log the event).
  * Add any UI feedback for failed transactions (catch errors in the `buyNow` function and display an alert or toast if the fetch fails).

* **UI/UX Polish:** Apply Quantum Leap design touches:

  * Use **Framer Motion** for subtle animations on marketplace cards (already using `whileHover={{ y: -4 }}` on motion.div for lift effect).
  * Ensure **responsive design**: Test the marketplace and dashboard on mobile screen sizes. For example, the marketplace uses a grid that shifts from 1 column on mobile to 3 on desktop – verify the Tailwind classes (e.g., `grid md:grid-cols-2 lg:grid-cols-3`) achieve this. Fix any overflow or alignment issues.
  * Dark mode: if the design supports a dark theme, ensure text and backgrounds invert appropriately. For instance, the marketplace hero is a gradient on light; in dark mode maybe use a different gradient or adjust text color. Use Tailwind dark: classes or a theme context.
  * Glassmorphism: The marketplace hero already has glassy badges and a translucent product count box. Continue this style in the dashboard – e.g., background panels with slight opacity. Use CSS `backdrop-filter: blur(...)` via Tailwind (`backdrop-blur`) as needed.

**Testing & Verification:**

* Run `npm test` to execute unit tests. Add tests for the product filtering logic (e.g., ensure filtering by category actually returns only those category items).
* Manually exercise the marketplace: try different filters, search terms, and verify the UI updates and no console errors occur. Also test extreme cases (no products, or all products) to see the “no results” message.
* Simulate an admin user: if possible, log in as an admin (or temporarily disable auth) and view the dashboard. Confirm that all cards/components render correctly and any dummy data is shown. No runtime errors in console.
* Perform an end-to-end payment in a test mode (if Stripe keys are test keys). Ensure the payment goes through and the system responds (perhaps check the database for an order entry, or check logs for webhook processing). If live testing isn’t possible, use Stripe CLI or at least verify the network calls to Stripe API are made.
* Check feature flags: toggling `SALES_ENABLED=false` should hide marketplace links or pages, and `MAINTENANCE_MODE=true` should trigger the maintenance behavior (though maintenance mode UI is fully addressed in Sprint 9, we can test the basic toggle now).

**Commit & Documentation:**

* Commit message example: `feat(marketplace): implement product filters and checkout integration`.
* Document in **CHANGELOG**: “Marketplace is now fully functional with search, filters, and Stripe checkout. Admin dashboard initial version added. Feature flags documented for sales and maintenance mode.”
* Push and await approval.

## Sprint 3: AI Copilot Integration (Protective Assistant)

**Requirements:** Deploy the persistent **AI Copilot** across the app – a context-aware AI assistant that guides users, catches errors, and offers suggestions during tasks. Unlike a simple chatbot, this Copilot acts as a “protective intelligence layer” for roofing projects. Key tasks include creating the Copilot engine and context, building UI components for the Copilot panel, integrating with the `/api/copilot` endpoint for AI responses, and enabling voice input and quick actions. Feature flag **`AI_COPILOT_ENABLED`** will toggle the Copilot’s visibility.

**Implementation Plan:**

* **Define Copilot Data Structures:** Create **`types/copilot.ts`** to define interfaces for the Copilot’s context and suggestions. For example, as outlined in the sprint spec:

  * `CopilotContext` – includes user info (role, experience level), current page, maybe current project details, recent actions, etc..
  * `CopilotSuggestion` – represents an AI-generated suggestion or warning, with fields like id, type (warning/tip), priority, message, and optional action handlers.
  * `CopilotState` – to manage the UI state (active/inactive, minimized, list of suggestions, loading status).
    Define these types and export them.

* **Copilot Engine Logic:** Implement the core logic in **`lib/ai/copilot-engine.ts`** (new file). This will monitor user actions and generate suggestions. According to the plan:

  * Build a `CopilotEngine` class that holds the current context and has methods to update context and analyze for risks. For example, when context (like project value or current page) updates, run checks:

    * Pricing anomaly checks: if price per sq ft is too low/high, add a warning suggestion.
    * Missing info checks: e.g., on Estimator page, if an estimate was done but no warranty specified, add a tip.
  * The engine should also fetch more complex **contextual tips** via AI. The plan is to send a prompt with current context to `/api/copilot` (which in turn calls the LLM). Implement a method like `getContextualTips()` that POSTs to `/api/copilot` with a payload including perhaps a prompt template and the context, and gets back an array of suggestions. This implies the backend route will accept a prompt and context and respond with suggestions (we must ensure the backend is implemented – see below).
  * Provide a method `getSuggestions()` that combines the hard-coded risk checks and the AI-driven contextual tips, returns a sorted list of suggestions (maybe sort by priority).
  * Also include a method `recordAction(action, result)` to log user actions in context (limiting to last N actions). This can be called from UI whenever the user does something significant, so the Copilot can adjust its advice.

* **API Endpoint for AI (Copilot):** Ensure the **`app/api/copilot/route.ts`** (Next.js API route) or the FastAPI `backend/services/copilot.py` is implemented to handle requests from the Copilot engine:

  * It should accept a prompt and context, call the appropriate LLM (Claude or GPT-4) with a crafted prompt, and return AI-generated suggestions. For example, it might use the prompt templates defined in **`lib/ai/prompt-templates.ts`** (which we need to create).
  * If not already done, create **`lib/ai/prompt-templates.ts`** to house prompt builder functions. E.g., a `contextualAssistance(context: CopilotContext)` that returns a prompt string guiding the AI to output JSON suggestions based on the given context (ensuring the AI responds in a structured format). The sprint documentation likely outlines prompt content (e.g. “Given the user is on {page} with role {role}, list any potential issues or next-step tips in JSON format.”).
  * The route should call our internal `chat()` function or directly call an appropriate model. We can leverage **`app/lib/llm.ts`** – e.g., call `await chat([...messages])` with a system message containing the prompt. Because the Copilot suggestions need structured output, we might instruct the model accordingly. The route then post-processes the AI’s output into an array of `suggestions` to send back. (If using Claude which can follow complex instructions well, perhaps route chooses Claude by default via `LLM_PROVIDER` or explicit parameter.)
  * Also implement **streaming** if needed: The README notes `/api/copilot` now streams responses. Using Next.js 13’s `Response` streaming or Server-Sent Events can allow the UI to get incremental output. However, since our Copilot returns short suggestions list, streaming may not be crucial unless we also enable a chat interface. We can initially do a single response and expand to streaming if time permits.

* **Copilot Provider & Hook:** Create a React context or hook to manage Copilot state globally:

  * For example, **`components/ai/CopilotProvider.tsx`** that wraps the app (added in `_app.tsx` or layout) when Copilot is enabled. It can initialize a `CopilotEngine` instance (with the appropriate API key or context) and provide functions to update context and retrieve suggestions.
  * Or simpler, write a hook **`hooks/useAICopilot.ts`** to be used by components to access suggestions and trigger the engine. The hook can use `useState` for `CopilotState` and expose methods like `toggleCopilot`, `minimizeCopilot`, `recordUserAction(action)`, etc.
  * Plan for **voice input**: The README mentioned voice input support was added. This likely means using the Web Speech API or a library to convert speech to text for user prompts. Possibly in the Copilot UI, provide a microphone button that, when clicked, starts recording audio and then transcribes to text (could use the browser’s SpeechRecognition). Implement a simple version: if browser supports it, integrate that so the user can speak a question to the Copilot. This text would then be sent to the AI via `/api/copilot`. (Ensure quick action buttons are also supported – e.g., if suggestions include an `action.handler`, those should be wired to perform context-specific tasks.)

* **Copilot UI Component:** Build the front-end interface:

  * **`components/ai/AICopilot.tsx`**: a floating panel or sidebar that shows the Copilot suggestions. It could appear as a collapsible widget on the bottom-right (like a chat bubble or an assistant icon). When active, show a panel listing current suggestions/tips.

  * Use a visually distinct style: perhaps a translucent panel (glassmorphic) with an AI icon or avatar. Each suggestion can be shown as a small card or list item, with an icon indicating if it’s a warning (⚠️), tip (💡), etc., and the message text. High-priority warnings might be highlighted in orange/red tint.

  * Include controls: a close/minimize button, and possibly a text input or microphone button for user queries. We want the user to also actively ask the Copilot questions. For now, suggestions are auto-generated, but we can allow a text query that calls `/api/copilot` with that prompt too (maybe not explicitly in scope, but a nice addition).

  * Add transition animations: if the Copilot panel slides in/out or fades, use Framer Motion for mounting/unmounting. E.g., when activated, animate from opacity 0 to 1 and translate up.

  * Ensure responsiveness: On mobile screens, the Copilot might become a full-width bar at bottom or a pop-up modal, since floating panel might not fit well. Use media queries or responsive design to adjust.

  * **Integration in Pages:** Include the Copilot UI in relevant pages:

    * Likely globally via layout: e.g., if `AI_COPILOT_ENABLED=true`, render `<AICopilot />` in the main layout so it’s present on all pages (but can be hidden/minimized until needed).
    * Also, on pages where context is rich (Estimator, Dashboard, etc.), update the Copilot context accordingly. For instance, on Estimator page, after an estimate calculation, call `recordAction('estimate_generated')` and update context with project parameters so the CopilotEngine can analyze for risks (like missing warranty example).
    * On navigation, update context page name (so Copilot knows which page user is on – this was a field in context). Possibly do this via a small effect in each page or a router listener.

* **Claude/OpenAI Integration for Copilot:** The Copilot engine’s AI queries should use the Anthropic Claude API where appropriate, since the prompt and output may be complex. Ensure the **Anthropic API key** is configured (or else it falls back to OpenAI by our `llm.ts` logic). According to `llm.ts`, setting `LLM_PROVIDER='claude'` will route `chat()` to `callClaude()` which uses the Claude model. Since the Copilot is described as Claude-powered in some UI texts, we might choose Claude for these suggestions by default (provided the key is available).

  * Also, test with OpenAI GPT-4 (`openai`) and ensure that works if Claude is not configured (the code warns and falls back).
  * The system should be flexible to use **Gemini** too in future; our `LLMProvider` type and functions already include `callGemini` (Google’s API). No extra work needed aside from ensuring the prompt format is compatible with whichever model.

**Testing & Verification:**

* **Unit Tests:** Write tests for the CopilotEngine’s risk analysis logic. For example, feed it a context with a very low price per sqft and verify that `getSuggestions()` returns a warning about pricing. Also test that adding actions and trimming the recentActions array works.
* **Integration Testing:** In a dev environment, enable `AI_COPILOT_ENABLED=true` and start the app. Verify the Copilot widget appears. Navigate through key pages:

  * On Estimator page, after entering data (or performing an action), see if the Copilot panel updates with any suggestions (it might call the API, so ensure the `/api/copilot` endpoint is running and returns something – even if just a stub suggestion for now). If needed, stub the API to return a dummy suggestion like “👋 Hi, I’m your AI Copilot!” to verify the UI pipeline.
  * Test voice input if implemented: click the mic, speak a question (“What should I watch out for in this estimate?”) and ensure it gets transcribed and sent to the AI, and that a response appears. This might be tricky to automate test, so mostly manual QA.
  * Confirm that suggestions with an attached action (if any) execute properly. For instance, if a suggestion is “Add warranty info” with a handler to navigate to Warranty section, ensure clicking it performs that action (could just console.log in this sprint if full action not ready).
  * Check performance – the Copilot should not freeze the UI. The `analyzeForRisks()` is synchronous for simple checks, but `getContextualTips()` does a fetch; ensure that is async and the UI indicates thinking (maybe set `state.isThinking=true` while awaiting). The README noted streaming and storing chat history in Supabase; if history logging is needed, confirm the backend writes the conversation to the DB (if not implemented yet, plan to add in future).
* **Edge Cases:** Turn off the Copilot feature flag and confirm the widget is completely gone. Turn it on, but with no Anthropic/OpenAI key set, and ensure the system fails gracefully (maybe logs a warning that AI is unavailable, as the code does). Also test with slow network or API error – the CopilotEngine should catch fetch errors and simply return no suggestions (as coded).

**Commit & Documentation:**

* Commit message: `feat(copilot): add AI Copilot engine, UI panel, and Claude integration`.
* Update documentation:

  * In **README.md** (or a dedicated AI features doc), describe how the Copilot works and how to toggle it. Mention that it requires setting `ANTHROPIC_API_KEY` or `OPENAI_API_KEY` and how to select the LLM via `LLM_PROVIDER` env.
  * Add to changelog: “Introduced AI Copilot – an intelligent assistant that monitors user input and provides real-time suggestions and warnings. Copilot can be enabled with `AI_COPILOT_ENABLED` and supports voice input and quick action buttons.”
* Push to main and pause for review before continuing.

## Sprint 4: Augmented Reality Mode & 3D Model Integration

**Requirements:** Implement the **Augmented Reality (AR) feature** that was scaffolded earlier. This involves creating a 3D visualization page (or section) where users can upload or view AR models (e.g., drone scans of roofs) and possibly overlay data. We need to wire up the front-end 3D canvas, integrate it with the backend (Supabase `ar_models` table and `app/api/ar/save-model` route), and ensure everything is behind the **`AR_MODE_ENABLED`** feature flag. The AR interface should align with the app’s design while showcasing advanced graphics (likely using a library like Three.js or a React wrapper like react-three-fiber for WebGL content).

**Implementation Plan:**

* **3D Canvas Page:** Create a new page **`app/ar/page.tsx`** (if not already) that will serve as the AR experience hub. This page might be accessible via a “AR Mode” link in the nav (shown only if `AR_MODE_ENABLED=true`).

  * Use a 3D rendering library: Import **Three.js** or use **react-three-fiber** for ease of integrating with React. If using Three.js directly, we might manage the canvas manually; with react-three-fiber, we can create a `<Canvas>` component and define a scene in JSX.
  * The page could present a canvas where a 3D model of a roof is displayed. Since models are stored in Supabase (likely as URLs to model files or data in `ar_models` table), implement a fetch on page load:

    * Call **`GET /api/ar/save-model`** (which, despite the name, returns models when called with GET). This should retrieve the list of saved AR models (with fields like model\_url, etc.).
    * Pick the latest model or list them for user selection. For simplicity, display the first model in the 3D view. If multiple models exist, show a sidebar or dropdown to choose one.
  * Load the model: If model\_url is a GLTF or similar 3D format, use Three.js loaders (e.g., GLTFLoader) to load it into the scene. If it’s point cloud data or something, use appropriate visualization (maybe a simple geometry).
  * Provide basic controls: Users should be able to orbit/rotate the model, zoom, etc. Three.js orbit controls or react-three-fiber’s controls can be used. Make sure to import any control scripts if needed (like OrbitControls).
  * If this AR feature also overlays data (like highlighting problem areas on the roof), incorporate that logic. Possibly the `DroneScan` metadata (as seen in the API code where it inserts `drone_data`) contains GPS or measurement info. We could parse and visualize it (e.g., mark points of interest on the model).
  * Style the AR page container to be full-screen (taking available viewport) with a dark background (for better visibility of 3D content). You might also include a semi-transparent UI overlay on top of the canvas for any controls or info. Keep the UI minimal to emphasize the AR content.

* **Model Upload Flow:** If users are to upload AR models (perhaps via a drone scan), create a form or button for that:

  * A file input to upload a 3D model file (e.g., `.glb` or `.obj`). When a file is selected, you could upload it to storage (maybe Supabase storage or directly insert an entry in `ar_models` with a URL).
  * Perhaps easier: If the model is small, you could Base64 encode and send via the **`POST /api/ar/save-model`** endpoint. The `DroneScan` type likely includes a `modelUrl` (maybe pointing to a cloud storage location). If we don't implement actual file storage, we might simulate by having a preset model URL.
  * The backend `save-model` route currently just inserts the given URL/metadata into DB. We might need to first upload the file to somewhere accessible (Supabase bucket or S3). This could be done via Supabase Storage JS SDK if configured. Otherwise, skip actual file upload for now and allow admin to pre-populate a model.
  * Ensure to call the POST endpoint with correct data and handle response. On success, perhaps refresh the model list and display the new model.

* **UI Integration & Flag:** Only show the AR page or menu item if `NEXT_PUBLIC_AR_MODE_ENABLED` is true. In the Navbar, add something like:

  ```tsx
  {process.env.NEXT_PUBLIC_AR_MODE_ENABLED === 'true' && <Link href="/ar">AR Mode</Link>}
  ```

  Similarly, protect the `/ar` route on the server side if needed (though not critical).

  * Possibly also conditionally load heavy Three.js scripts only when flag is on (to avoid adding bundle size for all users).
  * If AR is disabled, and someone navigates to `/ar`, you could redirect them or show a “Feature not enabled” message.

* **Styling & Theme:** Even though AR is a very visual feature, keep the surrounding UI elements consistent:

  * Use the app’s fonts and text colors for any overlay text or buttons (like an “Upload Model” button should use our Button component style).
  * If there’s an information panel, give it the glassmorphic background (e.g., overlay white opacity for light mode or black opacity for dark mode).
  * Animate model appearance if possible – for example, fade the model in once loaded (you can achieve this by initially setting model material transparency or scaling from 0).
  * Consider dark mode: likely the 3D view is similar in both, but ensure any UI text (e.g., model names) is visible in dark mode (maybe light text on dark overlay).

**Testing & Verification:**

* **3D Rendering Test:** Manually test loading the page with AR flag on. The canvas should appear and not crash the app. If using known model URL, verify the model shows up in the scene. Check console for Three.js errors (like missing assets or CORS issues if model hosted externally).
* **Interaction:** Try rotating and zooming the model using the controls. Ensure it’s intuitive on both desktop (mouse drag, scroll) and mobile (touch pan/zoom – might require different handling; if orbit controls don’t support touch well, consider adding basic touch events).
* **Data Flow:** If uploading a model, test the upload:

  * Select a file and submit – see that the `POST /api/ar/save-model` is hit and returns success. Then refresh or fetch the models and confirm the new entry is present (maybe verify via Supabase dashboard or by calling GET endpoint).
  * If multiple models, test switching between them in the UI, ensuring each loads correctly.
* **Flag Off Behavior:** Set `AR_MODE_ENABLED=false` and run the app. The AR page link should disappear. If possible, try navigating directly to `/ar` – it should ideally not load the 3D component. (We might add a guard: if flag is false, the page could just render a message or redirect).
* **Performance:** Loading a 3D model can be heavy; monitor the load time. If it’s slow, consider adding a loading spinner or percentage progress while the model loads. Also ensure the rest of the app remains responsive – the AR page is separate, so it shouldn’t affect others unless large scripts are globally loaded. Code splitting the Three.js import might be wise (Next.js dynamic import for the AR component).
* **Compatibility:** Test on different browsers, including a mobile browser if possible, to ensure WebGL runs and the feature doesn’t break the site. If WebGL is not supported, the page should fail gracefully (maybe detect and warn “AR not supported on this device”).

**Commit & Documentation:**

* Commit message: `feat(ar-mode): add AR viewer page with 3D model support`.
* Update docs: Explain the AR feature in README or a doc page – “Users can visualize roof scans in 3D under the new AR Mode (beta). Currently supports viewing models stored in the system. This feature is behind `AR_MODE_ENABLED` flag (off by default).” If special setup is needed (like storing models), mention that.
* Push changes and await review confirmation.

## Sprint 5: AI Tools & Claude Integrations Page

**Requirements:** Add an **AI Tools** page that consolidates various Claude-powered tools and links (as mentioned in updates). This page provides quick access to external AI utilities (project dashboards, forms, photo annotation, etc.), likely via hyperlinks or embedded if possible. We need to create the UI for this **“AI Tools”** hub, ensuring it’s on brand and clearly indicates these are powered by Claude. Additionally, integrate any necessary wrappers or links such that these tools feel part of the product (for example, using `window.open` to launch them or if available, embedding via iframes). This sprint is mostly UI/UX since the tools themselves are external.

**Implementation Plan:**

* **Page Setup:** Create **`app/tools/page.tsx`** (if not already created). From the repository, it appears an AI Tools page exists with a list of tools and descriptions. We will use that as a basis:

  * The page should have a title (e.g., “AI Tools”) and a brief intro paragraph explaining that these one-click tools are powered by Claude and help streamline various tasks.
  * Display a grid of cards, one for each tool. Each card should contain:

    * A title (e.g., "Project Dashboards").
    * A short description of what the tool does (the content from code: “Live job metrics powered by Claude no-code widgets” etc. for dashboards).
    * A button or link to open the tool.
  * You can hardcode or fetch the list of tools. The code snippet suggests an array of tool objects with title, description, url. We can reuse that approach. The URLs are external (`claude.ai/...` links), so we’ll use a simple `onClick={() => window.open(tool.url, '_blank')}` on the button to open in a new tab.
  * Use the UI components: Wrap each tool’s info in our `Card` component for consistent styling, and use our `Button` component for the “Open Tool” action. This ensures proper theming (the code already imported Card and Button at top).
  * Arrange cards in a responsive grid (the snippet uses `md:grid-cols-2 lg:grid-cols-3` which is good for varying screen sizes).

* **Visual Integration:** Since these tools are external, it’s important to brand the page so it feels part of our app:

  * Keep the background and text styles consistent (e.g., in light mode, a neutral background like `bg-bg` and dark text, as shown which likely uses CSS variables for text colors).
  * Possibly include small images or icons for each tool to make the cards more visually appealing. (If available, you might use an icon or emoji as in the code each category in marketplace had an emoji; for tools, maybe a relevant emoji could accompany the title or just rely on text.)
  * Include a Claude logo or mention “Powered by Claude” to clarify the third-party nature. The example text already says “Powered by Claude” in the intro.
  * Add some hover or motion effect: e.g., when hovering a card, slightly raise it (`whileHover={{ y: -4 }}` as used elsewhere) and maybe change the card border color.
  * Dark mode: ensure the Card background and text adjust. If using our Card component, it might already handle theming; if not, use conditional classes. For example, in dark mode, use a darker background for cards and light text.

* **Claude Tools Wrappers:** If any of these tools have available APIs or embed options, consider integrating:

  * For instance, “Smart Intake Forms” might allow embedding a form via an iframe or script. If so, we could embed it directly on our page instead of a link. However, unless specified, we stick to links.
  * Another example: “Photo Annotation” – perhaps could integrate with our app’s file storage (e.g., allow user to upload a photo and then open Claude photo annotation with that photo). This might be complex; likely out of scope unless the sprint doc specified something.
  * The sprint instruction did say “Integrate any referenced Claude, OpenAI, or Gemini tool links or wrappers as real AI-powered tools.” For this page, that mostly means ensure the links are live and not placeholders. So verify each URL:

    * `https://claude.ai/dashboard` etc. If these are real endpoints (perhaps hypothetical in this context), ensure they open. If they were placeholders, replace with actual functional links or implement similar in-house.
    * If possible, test those links – since we can't here, we assume they are correct. Otherwise, coordinate with product team to get the correct URLs for those features.

* **Navigation & Routes:** Add the Tools page to the site’s navigation (maybe under an “AI” menu or main nav). Since this is an end-user page, ensure everyone can access it (no special flag, since it’s part of core offering). If a feature flag was intended, one wasn’t explicitly mentioned for Tools, but if needed, could reuse a general flag or just always enable it as of this sprint.

  * Possibly use the `SALES_ENABLED` or similar, but that’s for marketplace. Since Tools page is likely a permanent feature now, no flag needed unless specified. (The updates in README for 28 Jun say “Added AI Tools page” with no mention of a flag, so it’s just always on.)

**Testing & Verification:**

* Load the Tools page and verify all tool cards render with correct info. Check on various screen widths that the grid wraps properly and all cards are accessible.
* Click each “Open Tool” button and ensure it opens a new browser tab to the correct link. The target sites likely require login or access; as far as our app is concerned, just ensure the call `window.open` executes without being blocked (some browsers might block pop-ups if not actual user event, but since it’s a button click, it should be fine).
* Test in dark mode: the background and cards should adjust to a darker theme. If anything is hard to read (like if we used a fixed light text and the card is also light in dark mode), fix the classes.
* Check for console warnings or errors on the Tools page (should be none, it’s mostly static content).
* Accessibility: since these are external links, maybe add an `aria-label` or at least ensure the button text is clear (“Open Tool” plus context by being inside a card with tool title). Possibly, make the whole card clickable by wrapping in `<a>` tag, but using a Button is fine.
* Content review: Confirm with the team that the descriptions are accurate and succinct. If needed, ask Claude (as per instruction) for copywriting help to polish descriptions. For example, ensure each description is engaging and free of errors. *(This would be done by prompting an AI like Claude for alternate phrasings, but we assume the given ones are fine.)*

**Commit & Documentation:**

* Commit: `feat(tools): add AI Tools page with Claude integrations`.
* Note in the changelog: “Introduced an **AI Tools** page linking to various AI-powered utilities (dashboards, forms, photo annotation, etc.) to extend platform functionality. These tools open in a new tab and are powered by the Claude AI platform.”
* Push to main, wait for review approval as usual.

## Sprint 6: Field Apps Page (Smart Field Utilities)

**Requirements:** Create a **Field Apps** page that showcases “smart” utilities for field crews (e.g. inspection, on-site proposal, real-time punchlist). This is similar in concept to the Tools page but targeted at field operations. It will likely contain quick links to specialized apps or forms (possibly Claude or other AI-assisted tools) that field users can leverage. We need to implement the UI for this page, integrate any links, and ensure consistent style. Also, ensure any mention of these features in the UI (like navigation or homepage) is updated to include Field Apps now available.

**Implementation Plan:**

* **Page Layout:** Add **`app/fieldapps/page.tsx`**. Based on repository, a Field Apps page exists with an array of apps and links. Follow that pattern:

  * Title: “Field Apps” (as an H1) and a brief description “Quick links to Claude-powered utilities for crews and partners.”.
  * Use a grid of Card components for each field app, similar to AI Tools page. Each card has:

    * A title (e.g., "Smart Field Inspection").
    * A description (“Capture photos, annotate issues, and auto-log GPS metadata.”).
    * A button “Open App” that opens the URL (which might be a Claude AI link or perhaps a link to another part of our system).
  * From the code snippet: titles and descriptions are given, with URLs like `claude.ai/inspection`, `claude.ai/proposal`, `claude.ai/punchlist`. Use those or the correct ones if different. These likely correspond to specialized AI tools or dashboards for field tasks.
  * Ensure to import and use the shared UI components (Card, Button) as done on Tools page, for consistency.

* **Punchlist Dashboard Integration:** Notably, one of the Field Apps is **“Real-Time Punchlist Dashboard”**. This likely relates to the earlier mention “Add Claude punch-list to dashboard.” We should interpret this:

  * Possibly, apart from the Field Apps page link (which goes to an external Claude punchlist), the product owners want an **embedded punchlist widget on our internal Admin Dashboard** as well. The example in the prompt suggests a scenario: if a sprint said “Add Claude punch-list to dashboard,” we should “locate `pages/dashboard.tsx`, import the `ClaudePunchList` component, and render it visibly...”
  * To address that: We can create a **`ClaudePunchList`** component that maybe uses an iframe or API to display the punchlist. But since we have a direct link for a punchlist app, perhaps for now, we simply link to it. However, to fulfill the instruction, we’ll integrate it on the dashboard:

    * Add to **Admin Dashboard page** (from Sprint 2) a section for “Punchlist”. For instance, a card or panel that either shows a summary of punchlist items or has a button “Open Punchlist Dashboard” (which opens the Claude link).
    * If there’s an API from Claude for punchlists, we could attempt to fetch data and display inside our app. But more likely, we just embed via iframe or a link due to time.
    * We can wrap the iframe approach behind a component `ClaudePunchList` to keep it modular. Create **`components/ClaudePunchList.tsx`** which returns an `<iframe>` pointing to `https://claude.ai/punchlist` or a similar embed link, styled to occupy a nice area on the dashboard. Or if embedding is not viable (could have CORS issues), then a simpler approach: show a teaser with a button linking out.
    * Given the directive, we’ll at least *show* something on the dashboard. For example, a card titled “AI Punchlist” with a short description and an open button (like on Field Apps page). This ensures the feature is visible internally, not just on the Field Apps external page.
    * Use Tailwind classes and possibly motion to make this element stand out (maybe an icon list of current tasks if we had them).
    * (If a more advanced integration is desired: we could have our Copilot or backend manage a punchlist table and have Claude update it. That would be complex; likely beyond this sprint’s immediate scope. So linking out might suffice for now.)

* **Navigation & Access:** Add the Field Apps page link to the main navigation or somewhere logical:

  * Possibly in the top nav near AI Tools, or under a dropdown if many items. If we have a sidebar or menu component (not explicitly mentioned, but maybe Navbar), include “Field Apps” (visible to all users or maybe only certain roles? Probably all, it’s just quick links).
  * No feature flag for Field Apps is mentioned. We can assume it’s part of core now (since the README update on 1 Jul says added Field Apps page, no flag).
  * Ensure the route is public.

* **Design Consistency:**

  * Mirror the style of the AI Tools page for Field Apps for consistency. E.g., use the same grid layout classes, card spacing, etc.
  * Possibly differentiate by using a different accent color or icon for field apps vs admin tools. But not necessary unless in design guidelines.
  * Each card’s content is already provided, just ensure proper line breaks and text color classes (the code uses `text-text-secondary` for descriptions, likely a CSS variable).
  * Dark mode: as usual, verify that cards and text are legible in dark theme.

**Testing & Verification:**

* Open the Field Apps page in the browser and verify all app entries display correctly.
* Test each “Open App” link:

  * “Smart Field Inspection” -> opens the intended link.
  * “On-Site Proposal Generator” -> opens correct link.
  * “Real-Time Punchlist Dashboard” -> opens correct link.
    If these are placeholders, at least ensure the window opens (even if 404).
* If using an iframe for punchlist in Admin Dashboard:

  * Check that it loads content (if Claude allows embedding – not sure it does; if not, the iframe might not display anything due to X-Frame-Options).
  * If it doesn’t load, adjust strategy (maybe just a link as fallback).
  * Verify it doesn’t break the layout or performance (an idle iframe could be fine, but if heavy, consider lazy loading it only when visible).
* Ensure the Field Apps page and Tools page together don’t clutter the nav. Possibly group under a dropdown “AI” or “Tools” if needed. But since no instruction on grouping, separate links are okay.
* Check responsiveness: On mobile, the Field Apps cards should stack nicely (like 1 column). The text should remain readable (long titles might wrap).
* Check integration with Copilot: Perhaps, the Copilot or AI Board might eventually orchestrate these tools. Not specifically required now, but just ensure the Copilot doesn’t cover the page content if it’s open (the Copilot widget might overlap with these pages; maybe consider offsetting if needed).

**Commit & Documentation:**

* Commit: `feat(field-apps): add Field Apps page with smart inspection, proposal, punchlist links`.
* Document: Note the addition of Field Apps in changelog. E.g., “Added **Field Apps** page to provide field teams with AI-powered utilities (inspection app, proposal generator, and punchlist dashboard). These tools enhance on-site productivity by leveraging AI for quick data capture and generation.”
* After pushing, pause for feedback before next sprint.

## Sprint 7: Dashboard AI Enhancements (Claude Punchlist & Quick Actions)

**Requirements:** Enhance the **Admin Dashboard** (and possibly user dashboard) with embedded AI features: specifically integrating the **Claude-powered Punchlist** widget and other quick-action AI utilities directly into the dashboard UI. This makes the dashboard more interactive and “AI-native” by not just displaying static info but also allowing admins to see and manage project punchlists with AI assistance. Also, incorporate any other AI quick actions (for example, a Claude “task summarizer” or an OpenAI-driven KPI analyzer) as described in the sprint doc.

**Implementation Plan:**

* **Claude Punchlist Component:** Develop **`components/ClaudePunchList.tsx`** as a reusable widget to display a project punchlist (to-do items) with AI capabilities. Key aspects:

  * **UI:** It could be a panel or card on the dashboard showing a list of tasks (each with a description and status). Provide an input box or button to **“Add AI-Suggested Task”** – which triggers Claude to suggest a new punchlist item based on project context.
  * For initial simplicity, we might not have actual project context, so we could dummy some tasks. But aim to wire it up:

    * If the backend or Copilot can return punchlist suggestions, call it. For example, use the Copilot engine or a separate endpoint (maybe reuse `/api/copilot` with a specialized prompt “suggest punchlist for project X”).
    * Alternatively, if Claude offers an API specifically for a “to-do list” (not likely), stick to our own LLM integration.
  * **Data Storage:** Punchlist items could be stored in our database (maybe in a table `punchlist` or as part of projects). If such a table doesn’t exist, we might just manage them in component state for now or use Supabase to create one.

    * If storing, set up a Supabase table `punchlist` (with fields: id, description, status, created\_at, project\_id, etc.). The sprint didn’t explicitly mention setting up such a table, but since AR had `ar_models`, maybe punchlist exists or will be new.
    * Implement basic CRUD: a form to add a new item (manual or AI-suggested), a way to mark complete (checkbox).
    * For AI suggestions: when user clicks “Suggest Task”, call `/api/copilot` with a prompt like “Given project data, suggest any missing tasks.” If Copilot engine is running, maybe it can produce something. Otherwise, have a predefined suggestion for demo.
  * **Integration on Dashboard:** Import this `ClaudePunchList` into **`pages/dashboard.tsx`** and render it prominently. Possibly in a section labeled “📋 Project Punchlist (AI-assisted)”. If the dashboard has multiple tabs or columns, decide where it fits (e.g., alongside other cards or as a full-width section).
  * Style the punchlist with our UI kit: Each task could be displayed in a Card or list group item style (slightly separate from the glass background to stand out). Use checkmark icons or strikethrough text for completed tasks.
  * Animations: Use Framer Motion to animate adding or completing tasks (fade in new tasks, strike-out fading completed ones). This adds to the polished feel.

* **AI Quick Actions:** Identify any other quick actions the sprint might want on the dashboard. Examples could be:

  * “Summarize latest activity” – a button that uses Copilot to generate a short summary of recent events (sales, new users, etc.).
  * “Generate Report” – maybe an action that collates key metrics into a PDF or text summary (LLM could help narrate it).
  * “Ask AI about \[something]” – a small chat input on the dashboard for admins to query the system’s data via AI.
    If the sprint doc lists any, implement accordingly. Possibly none explicitly given beyond punchlist; but since they mention AI Tools and Field Apps separately, maybe not.
    For completeness, we can add one example: a text input at top of dashboard, placeholder “Ask the AI Assistant about your data…”, which when submitted, calls `/api/copilot` with the question and displays the answer in a modal or below. This essentially extends the Copilot but in a dashboard context.
    However, careful not to overlap with the Copilot widget. Perhaps skip if redundant.

* **Feature Flags & Conditional Rendering:** The ClaudePunchList should likely respect the **AI\_COPILOT\_ENABLED** flag or a new flag if intended (but since it’s Claude-powered, using the same flag is reasonable).

  * If `AI_COPILOT_ENABLED` is false, maybe do not show the punchlist (assuming AI suggestions wouldn’t work). But if the punchlist is considered core (with or without AI), we could still show it but without AI suggestions. Given its branding as Claude punchlist, better to hide it behind the AI flag.
  * Also ensure if `MAINTENANCE_MODE` is on, the whole app might show a maintenance message (depending on how that’s implemented), so you might not even get to the dashboard. But if maintenance mode is just a banner, ensure the punchlist doesn’t break anything.

* **Back-End Support:** If needed, implement a basic API for punchlist:

  * Possibly **`app/api/punchlist/route.ts`** or similar to GET/POST tasks from DB. This would involve writing a small Next.js API route that queries the `punchlist` table via Supabase (similar to how AR models route works).
  * For this sprint, if time is short, we might skip real persistence and just simulate, but a real integration would be ideal to “exceed industry standards.”
  * If writing it: on GET, return list of tasks (filter by project if multi-project; if only one global list, just return all). On POST, insert a new task. On PUT/PATCH, update status. These can mirror AR route patterns.
  * Use Supabase client in the API route (like AR does with service role key). The table can be added via a migration or the `schema.sql`.

* **UI Polish on Dashboard:** Along with new widgets, ensure the dashboard UI as a whole remains cohesive:

  * If the dashboard is getting crowded, consider grouping sections or using tabs.
  * The punchlist might scroll if too many items; ensure the card has a max height with scroll for the list, so it doesn’t push down other content too much.
  * The visual style of the punchlist (which is interactive) vs static metrics should be balanced – perhaps place metrics cards in one column and the punchlist (and other AI interactive bits) in another.
  * All new elements should animate in on page load to signal interactivity – e.g., a slight fade-up entrance using Framer Motion for the whole punchlist section.

**Testing & Verification:**

* On an environment with `AI_COPILOT_ENABLED=true`, load the dashboard. Verify the ClaudePunchList component appears. Add a few test tasks (if adding manually via UI) and see that they render in the list.
* Test the AI suggestion flow: Click the “Suggest Task” (if implemented) and watch if an AI response adds a new task. If our API is stubbed or simplistic, you might just fake a suggestion like “Double-check permit approvals” to appear. If integrated with Copilot, ensure the Copilot responds (this might require the Copilot prompt templates to handle punchlist generation – could be something we add: e.g., in `prompt-templates.ts`, a function for `punchlistSuggestion(context)`).
* Mark tasks as done and see that they visually update (e.g., greyed out or moved to a “Completed” sub-list). Confirm that state persists if using DB (refresh page to see if completed status remains).
* Security: If this punchlist is project-specific, consider multi-user aspects – but likely for now, a single admin sees it, so not an issue.
* Test with feature flag off: set `AI_COPILOT_ENABLED=false` and check that the punchlist (and any AI quick actions) do not render on dashboard. The rest of the dashboard should still work. We may also test `MAINTENANCE_MODE=true` (which might redirect to a maintenance page entirely; see Sprint 9 for that behavior).
* Check on mobile: The dashboard, which now has possibly columns, should stack appropriately on small screens. The punchlist might become full width above or below metrics. Ensure the checkboxes or buttons are tap-friendly.

**Commit & Documentation:**

* Commit message: `feat(dashboard): integrate Claude-powered punchlist and AI actions`.
* Update docs: In the changelog or README section for this sprint’s date, note “Enhanced the admin dashboard with AI-powered features. Added a **Punchlist** widget driven by Claude to track tasks and suggestions in real-time, and integrated quick AI actions for admins. These features appear when AI Copilot is enabled.”
* Push changes and pause for review.

## Sprint 8: Marketplace SmartCarousel & UI Overhaul

**Requirements:** Upgrade the **Marketplace** page’s product display using a **SmartCarousel** component for a more dynamic, modern browsing experience. Instead of a static grid for all products, we will implement an interactive carousel (sliding cards) to showcase featured products or categories. Also, this sprint encompasses a general UI/UX overhaul to ensure the entire app meets polished, industry-leading standards (think Linear, Notion, Vercel quality). That means refining spacing, typography, adding micro-interactions, ensuring consistency in dark mode, etc., across the board.

**Implementation Plan:**

* **Implement SmartCarousel Component:** Create a new UI component **`components/ui/SmartCarousel.tsx`**. The goal is to have a reusable carousel that can slide through a list of items (images or JSX content). Key features:

  * Props might include an array of items (each could be a React node or an image URL), `slidesToShow` (how many items visible at once), autoplay settings, etc.
  * Use an existing lightweight carousel library or custom solution. A good approach is integrating **Embla Carousel** (a performant slider) or using pure CSS scroll snap. The example we found from another repo shows using `embla-carousel-react` for a SmartCarousel, with navigation arrows and responsive behavior. We can mimic that:

    * Install `embla-carousel-react` (if not already in package).
    * In our `SmartCarousel.tsx`, use the `useEmblaCarousel` hook to get carousel controls.
    * Render a container with overflow hidden and a track that maps each item to a slide div. Use Embla’s context/ref on the track.
    * Include Prev/Next arrow buttons (SVG icons like ChevronLeft/Right from Lucide, as in the example).
    * Add optional autoplay: use `useEffect` to auto-advance every few seconds if `autoplay` prop true.
    * Make it responsive: use a state for slidesToShow based on window width (example code sets 1 slide on mobile, 2 on small screens, etc.).
    * Style the carousel: perhaps give it a subtle box-shadow (maybe using a computed CSS variable for shadow color to match theme, as the example does with `getTailwindColor` and `hexToRgb` utility). Ensure it looks good on both themes (could use a prop `isDark` if needed to adjust styling, or rely on CSS variables).
    * The component should be generic enough to reuse. We may primarily use it for Marketplace, but potentially elsewhere (maybe home page banners, etc.).

* **Integrate Carousel in Marketplace:** Modify **`app/marketplace/page.tsx`** to use SmartCarousel for product display:

  * One approach: Replace the “Featured Products” grid (currently showing 2 featured products side by side) with a SmartCarousel showcasing featured items. This carousel could show, say, 3 featured products in a slide, rotating through if more.

    * Gather the featured products list (`filteredProducts.filter(p => p.is_featured)` as in code). Instead of mapping to static elements, pass them as items to SmartCarousel. For example, each item could be the JSX structure currently in the motion.div for a product card etc. We can wrap that JSX in a `<div>` and feed to SmartCarousel.
    * If embla carousel doesn’t allow direct React nodes easily, we may adjust to output a list inside SmartCarousel children. But likely simpler: SmartCarousel accepts `items` prop which can be an array of JSX – so we can compose the card and push into array.
    * Ensure styling: Each slide probably should have a consistent width (maybe 80% of container for one slide visible, or if multiple slides, they’re smaller). Embla will handle some width but we might need CSS to size slides (like `flex: 0 0 auto; width: {100/ slidesToShow}%`).
  * For the main product grid of non-featured products, we have choices:

    * We could also carousel-ize them by categories or just leave them in grid. The prompt specifically says “Replace Marketplace grid with SmartCarousel,” which suggests possibly showing **all products** via carousel instead of the multi-row grid.
    * That might not be ideal if there are many products – a carousel showing dozens of items is unwieldy. Perhaps they mean the featured section or hero section becomes a carousel of highlighted items.
    * Alternatively, could implement a carousel per category: e.g., user selects a category, and then sees a horizontal carousel of those products. But that might complicate filters.
    * A balanced approach: Keep filters and the concept of featured vs normal, but present them in a more interactive way:

      * The “Featured Products” becomes a large carousel at top (maybe full width, with big cards, maybe one at a time or two).
      * The rest of products can remain in a grid or possibly in smaller carousel rows per category (like sectioned by category).
    * If aiming for maximum carousel usage: we could for example remove the static grid and instead have a carousel that can scroll through all filteredProducts. But if 20+ items, that’s not very user-friendly to find specific items.
    * Considering usability, I will implement the carousel for featured items (since that’s a limited subset and draws attention), and maybe leave the standard grid for the bulk list. This satisfies “replace marketplace grid” partially. However, the wording might imply a full overhaul.
    * Perhaps the intention is to create a more visually engaging browsing: e.g., show large cards in a carousel rather than small grid items. If so, we could do it fully:

      * Each product becomes a big slide (with image, name, price, etc.). Then the user scrolls horizontally or via arrows to see the next product. Filters might then just regenerate the carousel items.
      * This is cool but for >10 products might be tedious to scroll one by one.
    * Without clarity, I'll assume improving featured section with carousel is a must, and optionally using smaller carousels for categories if time. We should at least demonstrate replacing some grid with carousel usage as per request.
  * After integrating, remove or refactor the old grid code accordingly. Ensure all necessary imports (SmartCarousel, etc.) are added at top.

* **Global UI Overhaul:** This sprint also calls for final UI polish. Go through the app and refine:

  * **Spacing and Alignment:** Ensure consistent paddings, margins on sections. Check that forms and buttons align nicely on all pages. Possibly adjust some Tailwind classes if things look cramped or too spaced.
  * **Typography:** Make sure heading font sizes and weights are consistent with design system. Possibly adjust some text sizes for better hierarchy (e.g., maybe some h1 should be bigger or a different color for accent).
  * **Dark Mode Audit:** Manually review each page in dark mode. Fix any issues like white backgrounds or unreadable text. For example, the marketplace hero had text-blue-100 on blue background – on dark mode, that might need adjusting to a lighter or different hue. Use Tailwind’s `dark:` variant if needed, or define CSS variables for colors that automatically adjust (if the Quantum Leap design provides them).
  * **Glassmorphism Consistency:** Check that all major container backgrounds use a consistent translucent style where appropriate. For instance, on the landing sections or modals. If some components (like modals or dropdowns) are plain solid, consider adding a slight transparency and blur for effect. Not everywhere, but key places (the marketplace hero did this nicely with the feature badges).
  * **Micro-interactions:** Add any missing Framer Motion touches:

    * Buttons could have a tap animation (like scale 0.98 on press).
    * Links or icons could have hover tooltips or subtle animations.
    * Form inputs might highlight on focus with a shadow.
    * Ensure animations added are not overwhelming but delighting – if anything feels jarring, tone it down (ease-out durations etc.).
  * **Loading and State Feedback:** Ensure all async actions have feedback. e.g., After integrating SmartCarousel, if images take time to load, maybe show a loading state or skeleton. For form submissions (like Estimator or contact form), show a spinner or success message.
  * **Error handling UI:** Check if any error messages are needed and style them (e.g., if API returns an error, show a toast or alert with nice styling).
  * **Consistency:** Look at the design docs (if we had them) to align colors and components. For example, confirm that primary color usage is uniform (the app seems to use blue as primary for buttons and highlights).
  * Possibly involve **Claude for copywriting** a final pass: ensure all visible text (headings, tooltips, descriptions) are crisp and free of typos. If any placeholder text lingers (like “Lorem ipsum” anywhere), replace with real copy. Use a professional tone consistent with brand (the content we saw is already pretty well-written in marketing tone).
  * Check accessibility: color contrast especially in dark mode (blue text on dark background might be low contrast). Adjust if needed to meet standards.

* **Feature Flags Final Check:** Now that all major features are in, confirm that each feature flag works to toggle its feature:

  * `MAINTENANCE_MODE`: likely to be implemented in next sprint, but if not, we should implement it: e.g., if true, maybe the Next.js custom App or server middleware could show a maintenance page. Possibly simpler: in layout, if flag true, display a full-screen notice “We’ll be back soon” and don't show normal content. Implementation:

    * We can create a page **`app/maintenance.tsx`** or a component and if flag is on, render that instead of children. Or use Next.js middleware to rewrite all routes to `/maintenance`. But an easier approach: in `_app` or layout, do:

      ```tsx
      if(process.env.NEXT_PUBLIC_MAINTENANCE_MODE === 'true') {
         return <MaintenancePage />
      } else {
         return <NormalLayout>{children}</NormalLayout>
      }
      ```

      And design `MaintenancePage` to a simple centered message with maybe company logo and a message pulled from env or static “Undergoing maintenance”.
  * `AI_COPILOT_ENABLED`: we tested hiding Copilot and related UI.
  * `AR_MODE_ENABLED`: hide AR nav and content as tested.
  * `ESTIMATOR_ENABLED`: hide estimator page if off.
  * `SALES_ENABLED`: hide marketplace if off. That likely means if false, maybe remove Marketplace from nav and possibly redirect `/marketplace` to home or a disabled message. Could implement that now: e.g., in marketplace page, if flag false, either show “Sales features are disabled” or use Next.js to return notFound.
  * We should ensure these toggles indeed remove UI elements to allow deploying in various configurations easily.

**Testing & Verification:**

* Do a thorough regression test of the entire app as if it’s about to launch:

  * Test all pages (Estimator, Marketplace with new carousel, Admin Dashboard with AI widgets, Tools, Field Apps, AR, Copilot chat, etc.) in both light and dark modes.
  * Test on common browsers and mobile if possible for responsiveness.
  * Simulate different feature flag scenarios:

    * All features on (the default .env should have them on as we saw).
    * Certain features off (e.g., turn off AR and Copilot, see that AR link gone and no Copilot widget; turn off Sales, see marketplace link gone or protected; etc.).
    * Maintenance on: verify maintenance page covers the app.
  * Run `npm run build` to ensure production build passes (sometimes some dev-only code might break in prod).
  * Run `npm test` and `npm run test:e2e` if available, to catch any integration test failures due to UI changes (for example, if tests expected certain text or elements that changed).
  * Fix any found issues promptly: e.g., adjust selectors in tests if needed to match new structure (like if marketplace items moved into carousel, tests might need update to find product links differently).
* Specifically for the SmartCarousel:

  * Ensure arrow buttons work to navigate slides. On mobile, test swipe gestures if Embla supports it (it should).
  * If autoplay is enabled, see that it cycles (we might leave autoplay off or on as default depending on design; ensure it doesn't annoy).
  * Verify no layout shift or overflow happens when using carousel (e.g., no horizontal scrollbar if properly contained).
  * Check memory and performance: a carousel with many images should be okay, but just watch that it doesn’t freeze. Embla is efficient, so likely fine.
* Visual QA: Compare the final look and feel with “industry standard” sites. Is the polish there? Are there any rough edges like inconsistent shadows or misaligned buttons? If yes, polish them. Possibly ask a colleague or use an AI to evaluate design (if that was an option).

**Commit & Documentation:**

* Commit: `feat(ui): redesign marketplace with SmartCarousel and finalize UI polish`.

* Documentation: This is a major overhaul, so in the changelog, highlight:

  * “Marketplace page now features an interactive carousel for product browsing, replacing the static grid for a more engaging experience.”
  * “UI/UX refinements across the app: improved dark mode, consistent glassmorphism styling, responsive design perfected, and added micro-interactions for a sleek user experience. The interface now meets top-tier product standards.”
  * Mention that all known issues have been addressed and that the app is ready for launch pending final review.

* Push to main.

## Sprint 9: Final Testing, Maintenance Mode, and Launch Prep

*(Assuming all feature sprints are done, this last “sprint” is about final QA, docs, and deployment readiness.)*

**Requirements:** Conduct a final end-to-end testing pass, implement the **Maintenance Mode** toggle behavior, update documentation (README, docs, changelog) with all recent changes, and ensure the system is ready for production launch. Also perform any performance optimizations or security checks flagged during audit (since an Ops Audit log was mentioned earlier). Essentially, make sure the product is not only feature-complete but also stable and polished for users and easy to maintain for developers.

**Implementation Plan:**

* **Maintenance Mode Implementation:** Ensure that when `MAINTENANCE_MODE=true`, the application displays a maintenance message instead of the usual content:

  * Create a simple **`components/MaintenanceBanner.tsx`** or page that shows a full-screen message, e.g., the company logo and “We’re currently down for maintenance. Please check back soon.” Possibly pull a message from an env var for flexibility.
  * In Next.js, one approach is to add logic in **`app/layout.tsx`** to conditionally render either `<MaintenanceBanner/>` or the normal `{children}`. Because layout wraps all pages, this effectively intercepts all routes.
  * Alternatively, use a **middleware** (if using Next 13 middleware feature) to rewrite all requests to `/maintenance` when flag is on. But simpler is the layout check.
  * Test it by setting the flag and running the app – you should see only the maintenance screen. Make sure to disable any interactive features behind it (the banner likely not interactive except maybe an email or status link).
  * Also ensure to return appropriate HTTP status if needed (503 Service Unavailable) for SEO or monitoring. This can be tricky on frontend; maybe the backend FastAPI can check and if maintenance, refuse connections. But at least the UI indicator is done.

* **Comprehensive Testing:** We have tested each sprint, but now test the product in its entirety:

  * Simulate a fresh user signing up (if auth flows exist, not described here, but ensure nothing broken if there's login).
  * Step through a user journey: e.g., user visits landing (maybe our home page is `app/page.tsx`, ensure it’s informative), goes to Marketplace, filters, buys a product (Stripe test), uses the Estimator tool, etc.
  * Step through an admin journey: admin logs in, sees Dashboard with Copilot suggestions, views punchlist, uses Field Apps and Tools pages, etc.
  * Run all automated tests one more time. If any failing, fix them.
  * Check CI workflows (if any in repo) to ensure they pass (the README shows CI badges, so likely they run lint/build/tests on push – by running locally we emulate that).

* **Performance Optimization:**

  * Build for production (`npm run build`) and analyze if possible. Are bundle sizes reasonable? If any chunk is huge (e.g., maybe Three.js added a lot), consider code splitting or lazy loading that page. Next’s default code splitting might suffice; still, ensure no unnecessary library was imported globally.
  * Images: if any static images or heavy assets, ensure they are optimized (maybe use Next Image component if we had images on pages).
  * Check Lighthouse or Web Vitals if possible to catch any low-hanging issues (like not using proper `<img>` attributes or large layout shifts).
  * Turn on profiling in React DevTools to see if any component is re-rendering excessively or if initial load is slow.
  * If something like Embla carousel or Three.js can be loaded from a CDN or only when needed, do that. (If our AR component loads lots of script, maybe wrap it in dynamic import such that it doesn’t load unless user visits AR page.)
  * Also verify that enabling/disabling features doesn’t leave dead code running. E.g., if Copilot disabled, ensure we’re not still bundling a huge AI lib unnecessarily. This might be fine given flags primarily hide UI, not tree-shake code. But minor concern unless using Next.js `import()` conditionally which is not trivial. Probably acceptable trade-off.

* **Security Review:**

  * Check that API routes validate input (we did for AR and should for others). E.g., the checkout API should only accept valid price IDs and use proper secrets – likely done.
  * Ensure no secret keys leak to client (all sensitive keys like service role or Stripe secret are server-side only). We have separate NEXT\_PUBLIC keys for client which is correct.
  * Sanitize any user-provided content if displayed (not much user input aside from forms; maybe Estimator inputs, but those are numbers).
  * If we added any innerHTML or dangerouslySetHTML (likely not), be cautious of XSS.
  * Consider rate limiting on the AI endpoints since they can be abused. We introduced `RATE_LIMIT_WINDOW` and `RATE_LIMIT_MAX_REQUESTS` in env. If not implemented, perhaps we should quickly implement a simple rate-limit in `/api/copilot` using a global or in-memory store or Redis (since REDIS\_URL is provided). Possibly out of scope to code fully now, but mention it in docs if not done: e.g., “Rate limiting in place for AI API to prevent abuse” (if we implemented).
  * The presence of REDIS\_URL suggests caching; maybe they intended caching AI responses. If easy, we could cache last response for identical prompt to save API usage, but not urgent for launch unless heavy load expected.

* **Documentation & Changelog:** Finalize the documentation:

  * Update **README.md** to reflect the final state (the top already says v1.0.0 features). Perhaps bump version if this completes v1.1 or similar. Summarize new features (Copilot, AR, etc.) in the updates section.
  * Ensure the **docs/feature-flags.md** covers any new flag or usage changes (it already lists them, maybe add note on Maintenance Mode usage now that we implemented it beyond just env).
  * **docs/Executive Update\_UI\_UX & AI-Native System Design** – if this exists as an internal doc (likely it outlines design principles we followed), no need to edit it, but maybe produce a short internal memo summarizing how we applied those guidelines.
  * **docs/BrainOps- ChatGPT Operational Executive** – likely describes how an AI (like us) should operate. We can note in commit or internally that all tasks were executed by following that model.
  * **docs/BrainOps- AI Board Implementation Guide** – if relevant, perhaps the Copilot and multi-LLM integration satisfies part of “AI Board”. If not fully addressed, mention that the system is prepared for AI Board orchestration (we have multi-agent support via `LLM_PROVIDER` and could expand multi-agent workflows).
  * Write or update **CHANGELOG.md** with all notable changes from each sprint (if not already done incrementally). Consolidate them by date.

* **Launch Checklist Review:** Revisit the **launch-checklist.md**:

  * It shows some items pending founder, like providing production API keys, final copy for landing, etc. Ensure those are either done or call them out to the team:

    * Confirm all keys (Stripe, Make.com, Claude, etc.) are set in production environment.
    * Replace any placeholder content on landing page (if a separate landing exists, not explicitly in app code we saw except marketplace hero text which looks fine).
    * The DNS issue from Ops Audit (adding CNAME for www) – ensure that’s done on deployment side.
  * If any item still pending and needs code, handle it. E.g., if final copy for landing wasn’t updated, ask for it and update. Possibly use Claude to refine any marketing text if needed.

**Testing & Launch:**

* Once code is final and docs updated, do one more deployment to a staging environment or use `node .next/standalone/server.js` to simulate production. Browse around to ensure nothing behaves differently in production mode (sometimes issues like casing in imports, etc. can appear).
* Everything should be green on CI.

**Commit & Final Steps:**

* Commit message: `chore(release): final QA fixes, maintenance mode, documentation update`.

* Tag the release if using git tags (maybe v1.1.0 or v1.0.1 depending on versioning).

* Push to main.

* **Pause for Final Review:** At this point, all sprints are completed. The system should reflect a **futuristic, AI-native, visually stunning SaaS platform ready for commercial launch**, meeting or exceeding the polish of top-tier products. We will now await final review and approval from the product owner or AI board (Claude/Operator) before going live.