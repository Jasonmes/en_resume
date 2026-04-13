function escapeHtml(value) {
    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#39;");
}

function renderBadge(text, variant = "default") {
    return `<span class="badge badge-${variant}">${escapeHtml(text)}</span>`;
}

function renderMetric(metric) {
    return `
        <article class="metric-card">
            <div class="metric-value">${escapeHtml(metric.value)}</div>
            <div class="metric-label">${escapeHtml(metric.label)}</div>
        </article>
    `;
}

function renderOptionalParagraph(text, className = "") {
    const value = String(text ?? "").trim();

    if (!value) {
        return "";
    }

    const classAttr = className ? ` class="${className}"` : "";
    return `<p${classAttr}>${escapeHtml(value)}</p>`;
}

function renderHeroFacts(data) {
    const items = [
        data.profile.location,
        data.profile.currentFocus
    ].filter(Boolean);

    if (!items.length) {
        return "";
    }

    return `
        <div class="hero-facts">
            ${items.map(item => `<span class="hero-fact">${escapeHtml(item)}</span>`).join("")}
        </div>
    `;
}

function buildLangToggle() {
    const current = document.body.dataset.lang;
    const languages = [
        { code: "en", label: "EN", url: document.body.dataset.enUrl },
        { code: "zh", label: "中文", url: document.body.dataset.zhUrl },
        { code: "ja", label: "日本語", url: document.body.dataset.jaUrl }
    ].filter(item => item.url);

    return `
        <div class="lang-toggle" role="group" aria-label="Language switch">
            ${languages.map(item => `
                <a href="${escapeHtml(item.url)}" class="lang-pill ${current === item.code ? "active" : ""}">${escapeHtml(item.label)}</a>
            `).join("")}
        </div>
    `;
}

function renderMediaPreview(media, options = {}) {
    if (!media) {
        return "";
    }

    const { limit = 4, variant = "default" } = options;
    const images = (media.images || []).map(item => ({ ...item, kind: "image" }));
    const videos = (media.videos || []).map(item => ({ ...item, kind: "video" }));
    const items = [...images, ...videos];

    if (!items.length) {
        return "";
    }

    const visible = items.slice(0, limit);
    const extra = items.length - visible.length;

    return `
        <div class="media-preview-grid media-preview-grid-${variant}">
            ${visible.map((item, index) => {
                const isLastExtra = extra > 0 && index === visible.length - 1;
                const overlay = isLastExtra ? `<span class="thumb-overlay">+${extra}</span>` : "";
                const inner = item.kind === "image"
                    ? `<img src="${escapeHtml(item.path)}" alt="${escapeHtml(item.caption || "Project image")}">`
                    : `<video muted playsinline preload="metadata">
                            <source src="${escapeHtml(item.path)}" type="${item.path.toLowerCase().endsWith(".mov") ? "video/quicktime" : "video/mp4"}">
                       </video>
                       <span class="video-tag">Video</span>`;

                return `
                    <a class="media-thumb ${item.kind === "video" ? "video" : ""}" href="${escapeHtml(item.path)}" target="_blank" rel="noopener noreferrer">
                        ${inner}
                        ${overlay}
                    </a>
                `;
            }).join("")}
        </div>
    `;
}

function renderProjectVisual(project, ui, options = {}) {
    const { limit = 4, variant = "feature" } = options;

    if (project.media) {
        return `
            <div class="project-visual media-visual project-visual-${variant}">
                <p class="visual-label">${escapeHtml(ui.mediaTitle)}</p>
                ${renderMediaPreview(project.media, { limit, variant })}
            </div>
        `;
    }

    return `
        <div class="project-visual abstract-visual project-visual-${variant}">
            <p class="visual-label">${escapeHtml(ui.stackTitle)}</p>
            <div class="visual-chip-grid">
                ${project.technicalHighlights.slice(0, 8).map(item => `<span class="visual-chip">${escapeHtml(item)}</span>`).join("")}
            </div>
        </div>
    `;
}

function renderFeaturedProject(project, index, ui) {
    const visual = project.media ? renderProjectVisual(project, ui, { limit: 4, variant: "feature" }) : "";

    return `
        <article class="project-card featured-card ${project.media ? "" : "featured-card-text"}" data-reveal style="--delay:${index * 80}ms">
            <div class="project-main">
                <div class="project-order-shell">
                    <div class="project-order">${String(index + 1).padStart(2, "0")}</div>
                </div>
                <div class="project-copy">
                    <div class="project-heading">
                        <div class="project-meta">
                            <span>${escapeHtml(project.period)}</span>
                            <span class="meta-dot"></span>
                            <span>${escapeHtml(project.role)}</span>
                        </div>
                        <h3>${escapeHtml(project.name)}</h3>
                        <div class="badge-row">
                            ${project.badges.map((badge, badgeIndex) => renderBadge(badge, badgeIndex === 0 ? "accent" : "default")).join("")}
                        </div>
                        <p class="project-summary">${escapeHtml(project.summary)}</p>
                    </div>

                    <div class="metric-grid compact">
                        ${project.metrics.map(renderMetric).join("")}
                    </div>

                    <div class="project-split">
                        <div class="project-detail-panel">
                            <p class="section-label">${escapeHtml(ui.detailsTitle)}</p>
                            <ul class="detail-list detail-list-tight">
                                ${project.details.map(item => `<li>${escapeHtml(item)}</li>`).join("")}
                            </ul>
                        </div>

                        <div class="project-side-column">
                            <div class="achievement-box">
                                <p class="section-label">${escapeHtml(ui.impactTitle)}</p>
                                <p>${escapeHtml(project.achievement)}</p>
                            </div>

                            <div class="project-stack-panel">
                                <p class="section-label">${escapeHtml(ui.stackTitle)}</p>
                                <div class="stack-wrap">
                                    ${project.technicalHighlights.map(item => `<span class="stack-pill">${escapeHtml(item)}</span>`).join("")}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            ${visual}
        </article>
    `;
}

function renderArchiveProject(project, index, ui) {
    const hasMedia = Boolean(project.media && ((project.media.images || []).length || (project.media.videos || []).length));

    return `
        <details class="project-card archive-card" data-reveal style="--delay:${index * 60}ms">
            <summary class="archive-summary-row">
                <div class="archive-summary-main">
                    <div class="archive-index">${String(index + 1).padStart(2, "0")}</div>
                    <div class="archive-copy">
                        <div class="project-meta">
                            <span>${escapeHtml(project.period)}</span>
                            <span class="meta-dot"></span>
                            <span>${escapeHtml(project.category)}</span>
                        </div>
                        <h3>${escapeHtml(project.name)}</h3>
                        <p class="archive-summary">${escapeHtml(project.summary)}</p>
                    </div>
                </div>

                <div class="archive-summary-side">
                    ${project.badge ? renderBadge(project.badge, "ghost") : ""}
                    <span class="archive-toggle">${escapeHtml(ui.archiveExpandLabel)}</span>
                </div>
            </summary>

            <div class="archive-panel">
                <div class="archive-panel-copy">
                    <div class="archive-panel-block">
                        <p class="section-label">${escapeHtml(ui.impactTitle)}</p>
                        <p class="archive-impact">${escapeHtml(project.achievement)}</p>
                    </div>

                    <div class="archive-panel-block">
                        <p class="section-label">${escapeHtml(ui.stackTitle)}</p>
                        <div class="stack-wrap compact-stack">
                            ${project.technicalHighlights.map(item => `<span class="stack-pill">${escapeHtml(item)}</span>`).join("")}
                        </div>
                    </div>
                </div>

                ${hasMedia ? renderProjectVisual(project, ui, { limit: 3, variant: "compact" }) : ""}
            </div>
        </details>
    `;
}

function renderSkillGroup(group) {
    return `
        <article class="skill-card">
            <h4>${escapeHtml(group.category)}</h4>
            <div class="chip-grid">
                ${group.items.map(item => `<span class="chip">${escapeHtml(item)}</span>`).join("")}
            </div>
        </article>
    `;
}

function renderExperienceItem(item, index) {
    return `
        <article class="experience-card" data-reveal style="--delay:${index * 60}ms">
            <div class="experience-head">
                <div>
                    <h3>${escapeHtml(item.company)}</h3>
                    <p class="experience-role">${escapeHtml(item.title)}</p>
                </div>
                <span class="experience-period">${escapeHtml(item.period)}</span>
            </div>
            <ul class="detail-list detail-list-tight">
                ${item.responsibilities.map(line => `<li>${escapeHtml(line)}</li>`).join("")}
            </ul>
        </article>
    `;
}

function renderSidebar(data) {
    return `
        <section class="profile-card" data-reveal>
            <div class="profile-top">
                <div class="avatar-shell">
                    <img src="${escapeHtml(data.profile.avatar)}" alt="${escapeHtml(data.profile.name)}">
                </div>

                <div class="profile-copy">
                    <p class="eyebrow">${escapeHtml(data.profile.alias)}</p>
                    <h2>${escapeHtml(data.profile.name)}</h2>
                    <p class="profile-headline">${escapeHtml(data.profile.headline)}</p>
                    <p class="profile-summary">${escapeHtml(data.profile.summary)}</p>
                </div>
            </div>

            <div class="profile-contact-block">
                <p class="section-label">${escapeHtml(data.ui.contactTitle)}</p>
                <div class="profile-contact-grid">
                    ${Object.entries(data.contact).map(([key, value]) => `
                        <div class="contact-tile contact-tile-${escapeHtml(key)}">
                            <span>${escapeHtml(data.ui.contactLabels[key] || key)}</span>
                            <strong>${escapeHtml(value)}</strong>
                        </div>
                    `).join("")}
                </div>
            </div>
        </section>

        <section class="sidebar-card" data-reveal>
            <div class="sidebar-section">
                <p class="section-label">${escapeHtml(data.ui.focusTitle)}</p>
                <div class="chip-grid">
                    ${data.focus.map(item => `<span class="chip">${escapeHtml(item)}</span>`).join("")}
                </div>
            </div>

            <div class="sidebar-section">
                <p class="section-label">${escapeHtml(data.ui.mobilityTitle)}</p>
                <p class="sidebar-copy">${escapeHtml(data.workAuthorization.title)}</p>
                <ul class="mini-list mini-list-tight">
                    ${data.workAuthorization.visas.map(item => `<li>${escapeHtml(item)}</li>`).join("")}
                </ul>
            </div>
        </section>

        <section class="sidebar-card" data-reveal>
            <p class="section-label">${escapeHtml(data.ui.skillsTitle)}</p>
            <div class="skill-stack">
                ${data.skills.map(renderSkillGroup).join("")}
            </div>
        </section>

        <section class="sidebar-card" data-reveal>
            <div class="sidebar-section">
                <p class="section-label">${escapeHtml(data.ui.languagesTitle)}</p>
                <div class="language-list">
                    ${data.languages.map(item => `
                        <div class="language-row">
                            <span>${escapeHtml(item.language)}</span>
                            <strong>${escapeHtml(item.level)}</strong>
                        </div>
                    `).join("")}
                </div>
            </div>

            <div class="sidebar-section">
                <p class="section-label">${escapeHtml(data.ui.highlightsTitle)}</p>
                <ul class="mini-list">
                    ${data.highlights.map(item => `<li>${escapeHtml(item)}</li>`).join("")}
                </ul>
            </div>
        </section>
    `;
}

function renderMain(data) {
    return `
        <section class="hero-panel" data-reveal>
            <div class="hero-copy">
                <span class="eyebrow">${escapeHtml(data.profile.experience)}</span>
                <h1>${escapeHtml(data.profile.headline)}</h1>
                ${renderOptionalParagraph(data.profile.summary, "hero-summary")}
                ${renderOptionalParagraph(data.profile.availability, "hero-summary hero-summary-secondary")}
                ${renderHeroFacts(data)}
            </div>
        </section>

        <section class="content-panel" id="featured">
            <div class="section-head" data-reveal>
                <span class="eyebrow">${escapeHtml(data.ui.featuredKicker)}</span>
                <h2>${escapeHtml(data.ui.featuredTitle)}</h2>
                ${renderOptionalParagraph(data.ui.featuredIntro)}
            </div>
            <div class="project-stack">
                ${data.featuredProjects.map((project, index) => renderFeaturedProject(project, index, data.ui)).join("")}
            </div>
        </section>

        <section class="content-panel" id="archive">
            <div class="section-head" data-reveal>
                <span class="eyebrow">${escapeHtml(data.ui.archiveKicker)}</span>
                <h2>${escapeHtml(data.ui.archiveTitle)}</h2>
                ${renderOptionalParagraph(data.ui.archiveIntro)}
            </div>
            <div class="archive-list">
                ${data.projectArchive.map((project, index) => renderArchiveProject(project, index, data.ui)).join("")}
            </div>
        </section>

        <section class="content-panel" id="experience">
            <div class="section-head" data-reveal>
                <span class="eyebrow">${escapeHtml(data.ui.experienceKicker)}</span>
                <h2>${escapeHtml(data.ui.experienceTitle)}</h2>
                ${renderOptionalParagraph(data.ui.experienceIntro)}
            </div>
            <div class="experience-stack">
                ${data.previousWork.map((item, index) => renderExperienceItem(item, index)).join("")}
            </div>
        </section>
    `;
}

function createRevealObserver() {
    const elements = document.querySelectorAll("[data-reveal]");

    if (!("IntersectionObserver" in window)) {
        elements.forEach(element => element.classList.add("is-visible"));
        return;
    }

    const observer = new IntersectionObserver(entries => {
        for (const entry of entries) {
            if (entry.isIntersecting) {
                entry.target.classList.add("is-visible");
                observer.unobserve(entry.target);
            }
        }
    }, { threshold: 0.12 });

    elements.forEach(element => observer.observe(element));
}

function renderResume(data) {
    document.title = data.metaTitle;
    document.documentElement.lang = data.locale;

    const header = document.getElementById("header-root");
    const sidebar = document.getElementById("sidebar-root");
    const main = document.getElementById("main-root");

    header.innerHTML = `
        <div class="header-brand">
            <p class="eyebrow">${escapeHtml(data.ui.headerKicker)}</p>
            <div>
                <strong>${escapeHtml(data.profile.name)}</strong>
                <span>${escapeHtml(data.ui.headerSubline)}</span>
            </div>
        </div>
        <nav class="header-nav">
            <a href="#featured">${escapeHtml(data.ui.navFeatured)}</a>
            <a href="#archive">${escapeHtml(data.ui.navArchive)}</a>
            <a href="#experience">${escapeHtml(data.ui.navExperience)}</a>
        </nav>
        ${buildLangToggle()}
    `;

    sidebar.innerHTML = renderSidebar(data);
    main.innerHTML = renderMain(data);

    createRevealObserver();
}

async function loadResumeData() {
    try {
        const response = await fetch(document.body.dataset.resumeFile);

        if (!response.ok) {
            throw new Error(`Failed to load resume data: ${response.status}`);
        }

        const data = await response.json();
        renderResume(data);
    } catch (error) {
        console.error("Error loading resume data:", error);
    }
}

document.addEventListener("DOMContentLoaded", loadResumeData);
