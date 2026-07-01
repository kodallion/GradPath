// Auto-generated landing markup. Edit copy here.
export const LANDING_HTML = `<nav class="nav" id="gp-nav">
  <div class="wrap nav-inner">
    <a class="brand" href="/">
      <span class="brand-logo"><svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M22 9 12 5 2 9l10 4 10-4z"/><path d="M6 11.2V16c0 1.1 2.7 2.5 6 2.5s6-1.4 6-2.5v-4.8"/><path d="M22 9v5.5"/></svg></span>
      <span class="brand-name">GradPath</span>
    </a>
    <div class="nav-links">
      <a href="#features">Features</a>
      <a href="#how">How it works</a>
      <a href="#pricing">Pricing</a>
      <a href="#faq">FAQ</a>
    </div>
    <div class="nav-cta">
      <a class="nav-signin" href="/sign-in">Sign in</a>
      <a class="btn btn-primary" href="/sign-up">Get started free</a>
    </div>
    <button class="nav-toggle" id="gp-navToggle" aria-label="Menu"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M3 12h18M3 6h18M3 18h18"/></svg></button>
  </div>
</nav>

<!-- HERO -->
<header class="hero">
  <div class="wrap">
    <div class="hero-copy">
      <span class="eyebrow">For graduate applicants</span>
      <h1>Every application.<br><span class="type-line"><span class="hl-typed" id="gp-typed"></span><span class="caret"></span></span></h1>
      <p class="hero-sub">Track deadlines, manage every task, and get AI feedback on your SOP and CV — all in one workspace built for grad school applicants.</p>
      <div class="hero-ctas">
        <a class="btn btn-primary btn-lg" href="/sign-up">Start for free
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="M13 6l6 6-6 6"/></svg>
        </a>
        <a class="btn btn-ghost btn-lg" href="#how">See how it works</a>
      </div>
      <div class="hero-trust">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="M22 4 12 14.01l-3-3"/></svg>
        Free plan available · No credit card required
      </div>
    </div>

    <!-- Animated hero illustration: dashboard with self-checking tasks -->
    <div class="mock reveal" id="mock">
      <div class="mock-float mock-float-1">
        <span class="mock-float-ico"><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="M22 4 12 14.01l-3-3"/></svg></span>
        <span><span class="ft">SOP reviewed</span><span class="fs">Score 82 · ready</span></span>
      </div>
      <div class="mock-bar"><i></i><i></i><i></i><span class="mock-url">app.gradpath.io/dashboard</span></div>
      <div class="mock-body">
        <div class="mock-side">
          <div class="mock-navitem active"><span class="ic"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg></span> Dashboard</div>
          <div class="mock-navitem"><span class="ic"></span> Applications</div>
          <div class="mock-navitem"><span class="ic"></span> Tasks</div>
          <div class="mock-navitem"><span class="ic"></span> Documents</div>
          <div class="mock-navitem"><span class="ic"></span> AI Review</div>
        </div>
        <div class="mock-main">
          <div class="mock-h">Good evening, Korede</div>
          <div class="mock-hsub">3 applications · 2 deadlines this month</div>
          <div class="mock-stats">
            <div class="mock-stat"><div class="num">3</div><div class="lbl">Active</div></div>
            <div class="mock-stat"><div class="num">12</div><div class="lbl">Tasks done</div></div>
            <div class="mock-stat"><div class="num">8.4</div><div class="lbl">Avg AI score</div></div>
          </div>
          <div class="mock-tasks" id="mockTasks">
            <div class="mock-task"><span class="mock-check"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg></span><span class="mock-tasktext">Draft statement of purpose</span><span class="mock-tasktag">TU Delft</span></div>
            <div class="mock-task"><span class="mock-check"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg></span><span class="mock-tasktext">Request recommendation letter</span><span class="mock-tasktag">ETH Zürich</span></div>
            <div class="mock-task"><span class="mock-check"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg></span><span class="mock-tasktext">Upload transcript</span><span class="mock-tasktag">Toronto</span></div>
            <div class="mock-task"><span class="mock-check"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg></span><span class="mock-tasktext">Run AI review on CV</span><span class="mock-tasktag">TU Delft</span></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</header>

<!-- TRUST -->
<section class="trust">
  <div class="wrap">
    <p class="trust-label reveal">For applicants targeting programs like</p>
    <div class="trust-logos reveal d1">
      <span class="tlogo"><span class="tflag">🇬🇧</span>Leeds</span>
      <span class="tlogo"><span class="tflag">🇳🇱</span>TU Delft</span>
      <span class="tlogo"><span class="tflag">🇬🇧</span>Edinburgh</span>
      <span class="tlogo"><span class="tflag">🇨🇦</span>Toronto</span>
      <span class="tlogo"><span class="tflag">🇨🇭</span>ETH Zürich</span>
    </div>
  </div>
</section>

<!-- FEATURES / BENTO -->
<section class="section" id="features">
  <div class="wrap">
    <div class="section-head">
      <span class="eyebrow reveal">What you get</span>
      <h2 class="reveal d1">Everything you need to apply with confidence</h2>
      <p class="reveal d2">From first shortlist to final submission, GradPath keeps every moving part in one organised, calm workspace.</p>
    </div>
    <div class="bento">
      <!-- Flagship AI row card -->
      <div class="bento-card row c-wide c6 reveal">
        <div class="bento-art">
          <div class="mm">
            <div class="mm-h"><div class="mm-row"><span class="mm-score">82</span><div><div class="mm-t">Statement of Purpose</div><div style="font-size:9.5px;color:var(--muted);margin-top:2px">SOP · Reviewed just now</div></div></div></div>
            <div style="display:flex;gap:6px;margin-bottom:10px"><span class="mm-chip" style="color:var(--green-deep);background:var(--green-wash)">✓ 3 strengths</span><span class="mm-chip" style="color:var(--blue-deep);background:var(--blue-wash)">3 to improve</span></div>
            <div style="display:flex;flex-direction:column;gap:7px"><div class="mm-line"></div><div class="mm-line" style="width:92%"></div><div class="mm-line" style="width:78%;background:linear-gradient(90deg,#CFEBDB,#E6F6EE)"></div></div>
          </div>
        </div>
        <div class="bento-body">
          <div class="tagline">Flagship</div>
          <h3>AI feedback on your SOP &amp; CV</h3>
          <p>Get a clarity score, specific strengths, and concrete improvements on every document — like having an admissions consultant on call, any time of day.</p>
        </div>
      </div>

      <!-- Dashboard -->
      <div class="bento-card c3 reveal d1">
        <div class="bento-art">
          <div class="mm">
            <div class="mm-h"><div class="mm-t">Your applications</div><span class="mm-pill" style="color:var(--blue-deep);background:var(--blue-wash)">3 active</span></div>
            <div class="mm-stats"><div class="mm-stat"><div class="n">3</div><div class="l">Apps</div></div><div class="mm-stat"><div class="n">68%</div><div class="l">Done</div></div><div class="mm-stat"><div class="n">82</div><div class="l">Avg score</div></div></div>
            <div class="mm-app"><span class="flag">🇬🇧</span><div style="flex:1"><div class="uni">Leeds</div><div class="mm-line" style="margin-top:5px;width:70%;background:var(--blue);height:5px"></div></div></div>
          </div>
        </div>
        <div class="bento-body"><h3>One clear dashboard</h3><p>Every application, task and deadline in a single view.</p></div>
      </div>

      <!-- Deadline -->
      <div class="bento-card c3 reveal d2">
        <div class="bento-art">
          <div class="mm">
            <div class="mm-h"><div class="mm-t">October 2026</div><span class="mm-pill" style="color:#fff;background:var(--blue)">12 days left</span></div>
            <div class="mm-cal"><i class="mut"></i><i class="mut"></i><i></i><i></i><i></i><i class="near"></i><i></i><i></i><i></i><i class="near"></i><i></i><i></i><i></i><i></i><i></i><i class="hot"></i><i></i><i></i><i></i><i></i><i></i></div>
          </div>
        </div>
        <div class="bento-body"><h3>Deadline tracking</h3><p>Live countdowns so a deadline never sneaks up on you again.</p></div>
      </div>

      <!-- Tasks -->
      <div class="bento-card c3 reveal d1">
        <div class="bento-art">
          <div class="mm">
            <div class="mm-h"><div class="mm-t">Application tasks</div><span class="mm-pill" style="color:var(--green-deep);background:var(--green-wash)">4/6</span></div>
            <div class="mm-task done"><span class="mm-box on"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg></span><span class="tl"></span></div>
            <div class="mm-task done"><span class="mm-box on"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg></span><span class="tl"></span></div>
            <div class="mm-task"><span class="mm-box"></span><span class="tl"></span></div>
            <div class="mm-task"><span class="mm-box"></span><span class="tl"></span></div>
          </div>
        </div>
        <div class="bento-body"><h3>Smart task lists</h3><p>Auto-generated checklist — SOP, references, transcripts, submit.</p></div>
      </div>

      <!-- Documents -->
      <div class="bento-card c3 reveal d2">
        <div class="bento-art">
          <div class="mm">
            <div class="mm-h"><div class="mm-t">Documents</div><span class="mm-pill" style="color:var(--muted);background:var(--bg-soft)">3 files</span></div>
            <div class="mm-doc"><span class="ico"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/></svg></span><span class="nm">SOP_final.pdf</span><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--green)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg></div>
            <div class="mm-doc"><span class="ico"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/></svg></span><span class="nm">CV_2026.pdf</span><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--green)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg></div>
            <div class="mm-doc"><span class="ico" style="opacity:.5"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/></svg></span><span class="nm" style="color:var(--muted-2)">Transcript</span><span style="font-size:9px;font-weight:700;color:var(--muted-2)">Missing</span></div>
          </div>
        </div>
        <div class="bento-body"><h3>Document hub</h3><p>Keep every file linked to each school — see what's still missing.</p></div>
      </div>
    </div>
  </div>
</section>

<!-- HOW IT WORKS -->
<section class="section soft" id="how">
  <div class="wrap">
    <div class="section-head">
      <span class="eyebrow reveal">How it works</span>
      <h2 class="reveal d1">From overwhelmed to organised in minutes</h2>
    </div>
    <div class="steps">
      <div class="step reveal d1">
        <div class="step-art">
          <div class="mm" style="max-width:230px">
            <div class="mm-h"><div class="mm-t">Add application</div><span class="mm-pill" style="color:#fff;background:var(--blue)">+ New</span></div>
            <div class="mm-app"><span class="flag">🇬🇧</span><div><div class="uni">University of Leeds</div><div style="font-size:9px;color:var(--muted);margin-top:1px">MSc Environmental Science</div></div></div>
          </div>
        </div>
        <div class="step-num"><b>1</b><span>Add schools</span></div>
        <h3>Add your schools</h3>
        <p>Enter each program, country and deadline. GradPath builds a tailored checklist for every one.</p>
      </div>
      <div class="step reveal d2">
        <div class="step-art">
          <div class="mm" style="max-width:230px">
            <div class="mm-row" style="gap:12px"><svg class="ring" viewBox="0 0 36 36"><circle cx="18" cy="18" r="15.5" fill="none" stroke="#EEF0F3" stroke-width="4"/><circle cx="18" cy="18" r="15.5" fill="none" stroke="var(--blue)" stroke-width="4" stroke-linecap="round" stroke-dasharray="97" stroke-dashoffset="31" transform="rotate(-90 18 18)"/></svg><div style="flex:1"><div class="mm-task done"><span class="mm-box on"><svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5"><path d="M20 6 9 17l-5-5"/></svg></span><span class="tl"></span></div><div class="mm-task done"><span class="mm-box on"><svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5"><path d="M20 6 9 17l-5-5"/></svg></span><span class="tl"></span></div><div class="mm-task"><span class="mm-box"></span><span class="tl"></span></div></div></div>
          </div>
        </div>
        <div class="step-num"><b>2</b><span>Track</span></div>
        <h3>Work the checklist</h3>
        <p>Tick off tasks, upload documents, and watch your progress fill as deadlines count down.</p>
      </div>
      <div class="step reveal d3">
        <div class="step-art">
          <div class="mm" style="max-width:230px;text-align:center">
            <div style="display:grid;place-items:center;gap:8px"><span class="mm-score" style="width:60px;height:60px;font-size:24px;border-radius:16px">82</span><div class="mm-t">Ready to submit</div><div style="display:flex;gap:5px"><span class="mm-chip" style="color:var(--green-deep);background:var(--green-wash)">Clarity 8/10</span><span class="mm-chip" style="color:var(--blue-deep);background:var(--blue-wash)">Strength 9/10</span></div></div>
          </div>
        </div>
        <div class="step-num"><b>3</b><span>Polish</span></div>
        <h3>Polish with AI</h3>
        <p>Run your SOP and CV through AI review, apply the feedback, and submit with confidence.</p>
      </div>
    </div>
  </div>
</section>

<!-- AI SPOTLIGHT -->
<section class="section">
  <div class="wrap">
    <div class="spotlight">
      <div class="spot-grid">
        <div>
          <span class="eyebrow">AI document review</span>
          <h2 style="margin-top:16px">Feedback that actually moves the needle</h2>
          <p class="spot-lead">Upload your Statement of Purpose or CV and get structured, specific feedback in seconds — scored, with clear strengths and improvements.</p>
          <ul class="spot-list">
            <li><span class="spot-check"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg></span> A clarity &amp; strength score out of 100</li>
            <li><span class="spot-check"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg></span> Specific strengths worth keeping</li>
            <li><span class="spot-check"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg></span> Concrete improvements, not vague advice</li>
          </ul>
          <a class="btn btn-primary btn-lg" href="/sign-up">Try a free review
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="M13 6l6 6-6 6"/></svg>
          </a>
        </div>
        <div class="review" id="review">
          <div class="rv-score">
            <div class="rv-ring"><svg width="60" height="60"><circle cx="30" cy="30" r="25" fill="none" stroke="#EEF0F3" stroke-width="5"/><circle cx="30" cy="30" r="25" fill="none" stroke="var(--green)" stroke-width="5" stroke-linecap="round" stroke-dasharray="157" stroke-dashoffset="28"/></svg><span class="val">82</span></div>
            <div class="lab"><b>Strong</b><span>out of 100</span></div>
          </div>
          <div class="rv-doc">
            <div class="rv-doc-h"><div><div class="rv-doc-title">Statement of Purpose</div><div class="rv-doc-sub"><span class="rv-badge">SOP</span> v3 · 642 words</div></div><span class="rv-scan"><span class="pulse"></span> Analyzed</span></div>
            <div class="rv-para">
              <div class="rv-row"><span class="rv-l"></span><span class="rv-l" style="flex:.6"></span></div>
              <div class="rv-row"><span class="rv-l g"></span><span class="rv-tag g">✓ Strong hook</span></div>
              <div class="rv-row"><span class="rv-l"></span><span class="rv-l" style="flex:.8"></span></div>
              <div class="rv-row"><span class="rv-l b"></span><span class="rv-tag b">✎ Quantify</span></div>
              <div class="rv-row"><span class="rv-l" style="flex:.7"></span><span class="rv-l"></span></div>
            </div>
          </div>
          <div class="rv-metrics">
            <div class="mh">Score breakdown</div>
            <div class="rv-metric"><div class="ml">Clarity <b>8.5</b></div><div class="rv-mbar"><i style="--w:85%;background:var(--green)"></i></div></div>
            <div class="rv-metric"><div class="ml">Structure <b>7.8</b></div><div class="rv-mbar"><i style="--w:78%;background:var(--blue)"></i></div></div>
            <div class="rv-metric"><div class="ml">Impact <b>9.0</b></div><div class="rv-mbar"><i style="--w:90%;background:var(--green)"></i></div></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- TESTIMONIALS -->
<section class="section soft">
  <div class="wrap">
    <div class="section-head"><h2 class="reveal">From chaos to calm</h2></div>
    <div class="quotes">
      <figure class="quote reveal d1">
        <div class="quote-stars">★★★★★</div>
        <p>"GradPath turned five overwhelming applications into one calm checklist. I stopped living in fear of deadlines."</p>
        <figcaption><span class="quote-av">C</span><div><div class="quote-who">Chiamaka N.</div><div class="quote-role">MSc Public Health, 2026</div></div></figcaption>
      </figure>
      <figure class="quote reveal d2">
        <div class="quote-stars">★★★★★</div>
        <p>"The AI review caught things my professors missed. My SOP went from good to genuinely competitive."</p>
        <figcaption><span class="quote-av">D</span><div><div class="quote-who">Daniel A.</div><div class="quote-role">MEng, admitted to TU Delft</div></div></figcaption>
      </figure>
      <figure class="quote reveal d3">
        <div class="quote-stars">★★★★★</div>
        <p>"I finally stopped missing deadlines. Everything lives in one place now — it's the calm I needed."</p>
        <figcaption><span class="quote-av">F</span><div><div class="quote-who">Funmi O.</div><div class="quote-role">PhD applicant, Ecology</div></div></figcaption>
      </figure>
    </div>
  </div>
</section>

<!-- PRICING -->
<section class="section" id="pricing">
  <div class="wrap">
    <div class="section-head">
      <span class="eyebrow reveal">Pricing</span>
      <h2 class="reveal d1">Start free. Upgrade when you're ready.</h2>
    </div>
    <div class="price-grid">
      <div class="price reveal d1">
        <div class="price-name">Free</div>
        <div class="price-amt">₦0<span>/forever</span></div>
        <div class="price-desc">Everything you need to start applying.</div>
        <ul>
          <li><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg> Up to 5 applications</li>
          <li><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg> 3 AI reviews per day</li>
          <li><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg> Deadline &amp; task tracking</li>
        </ul>
        <a class="btn btn-ghost btn-lg" href="/sign-up">Get started</a>
      </div>
      <div class="price featured reveal d2">
        <span class="price-tag">Coming soon</span>
        <div class="price-name">Pro</div>
        <div class="price-amt">₦5,000<span>/month</span></div>
        <div class="price-desc">For applicants going all in.</div>
        <ul>
          <li><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg> Unlimited applications</li>
          <li><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg> Unlimited AI reviews</li>
          <li><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg> Inline AI rewrites &amp; version history</li>
        </ul>
        <a class="btn btn-primary btn-lg" href="/sign-up">Join waitlist</a>
      </div>
    </div>
  </div>
</section>

<!-- FAQ -->
<section class="section soft" id="faq">
  <div class="wrap">
    <div class="section-head">
      <span class="eyebrow reveal">Questions</span>
      <h2 class="reveal d1">Everything else you might ask</h2>
    </div>
    <div class="faq-list">
      <details class="faq reveal" open><summary>Is the free plan really free?<span class="chev"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg></span></summary><div class="faq-body">Yes. The free plan covers up to 5 applications and 3 AI reviews per day, forever, with no credit card required.</div></details>
      <details class="faq reveal"><summary>How does the AI review work?<span class="chev"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg></span></summary><div class="faq-body">Upload your SOP or CV and GradPath returns a clarity and strength score, specific strengths, and concrete improvements in seconds.</div></details>
      <details class="faq reveal"><summary>Can I cancel Pro anytime?<span class="chev"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg></span></summary><div class="faq-body">Absolutely. Pro will be month-to-month. Cancel anytime and you keep access until the period ends.</div></details>
      <details class="faq reveal"><summary>Is my data private?<span class="chev"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg></span></summary><div class="faq-body">Your documents and applications are private to your account. We never share your details, and documents are only sent for AI review when you request it.</div></details>
    </div>
  </div>
</section>

<!-- FINAL CTA -->
<section class="section">
  <div class="wrap">
    <div class="final">
      <h2>Ready to take control of your applications?</h2>
      <p>Join applicants who turned grad-school chaos into one calm, organised workspace.</p>
      <div class="hero-ctas">
        <a class="btn btn-primary btn-lg" href="/sign-up">Start for free
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="M13 6l6 6-6 6"/></svg>
        </a>
        <a class="btn btn-white btn-lg" href="/sign-in">Sign in</a>
      </div>
    </div>
  </div>
</section>

<!-- FOOTER -->
<footer class="footer">
  <div class="wrap">
    <div class="foot-grid">
      <div class="foot-about">
        <a class="brand" href="/"><span class="brand-logo"><svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M22 9 12 5 2 9l10 4 10-4z"/><path d="M6 11.2V16c0 1.1 2.7 2.5 6 2.5s6-1.4 6-2.5v-4.8"/><path d="M22 9v5.5"/></svg></span><span class="brand-name">GradPath</span></a>
        <p>Every application, one calm place. Built for graduate applicants who want clarity, not chaos.</p>
      </div>
      <div class="foot-col"><h4>Product</h4><a href="#features">Features</a><a href="#how">How it works</a><a href="#pricing">Pricing</a></div>
      <div class="foot-col"><h4>Company</h4><a href="#">About</a><a href="#faq">FAQ</a><a href="#">Contact</a></div>
      <div class="foot-col"><h4>Legal</h4><a href="/privacy">Privacy</a><a href="/terms">Terms</a></div>
    </div>
    <div class="foot-bottom"><span>© 2026 GradPath. All rights reserved.</span><span>Made for applicants, worldwide.</span></div>
  </div>
</footer>`;
