async function loadResumeData() {
    try {
        const response = await fetch('data/resume.json');
        const data = await response.json();
        renderResume(data);
    } catch (error) {
        console.error('Error loading resume data:', error);
    }
}

function renderResume(data) {
    // Render Personal Info
    const personalInfo = document.getElementById('personal-info');
    const labelMap = {
        name: 'Name',
        age: 'Age',
        nationality: 'Nationality',
        experience: 'Experience',
        positionSought: 'Position',
        email: 'Email',
        phone: 'Phone',
        wechat: 'WeChat',
        telegram: 'Telegram'
    };
    
    personalInfo.innerHTML = Object.entries(data.personalInfo)
        .filter(([key]) => !['avatar', 'qrCode'].includes(key))
        .map(([key, value]) => {
            const label = labelMap[key] || key;
            return `<p><strong>${label}:</strong> ${value}</p>`;
        })
        .join('');

    // Render Visa Info
    const visaInfo = document.getElementById('visa-info');
    visaInfo.innerHTML = `
        <p>${data.workAuthorization.title}:</p>
        <ul>
            ${data.workAuthorization.visas
                .map(visa => `<li>${visa.country}: ${visa.type}</li>`)
                .join('')}
        </ul>
    `;

    // Render Technical Skills
    const technicalSkills = document.getElementById('technical-skills');
    technicalSkills.innerHTML = data.technicalSkills
        .map(skill => `
            <div class="skill-category">
                <h3>${skill.category}</h3>
                <div class="skill-bar">
                    <div class="skill-progress" style="width: ${skill.proficiency || '90'}%"></div>
                </div>
                <p>${skill.skills}</p>
            </div>
        `)
        .join('');

    // Render Languages
    const languages = document.getElementById('languages');
    languages.innerHTML = data.languages
        .map(lang => `<p>${lang.language}: ${lang.level}</p>`)
        .join('');

    // Render Projects
    renderProjects(data);

    // Render Previous Work Experience
    const experience = document.getElementById('professional-experience');
    experience.innerHTML = `
        <h2>Previous Work Experience</h2>
        ${data.previousWork.map(exp => `
            <div class="experience-item">
                <h3>${exp.company} (${exp.period})</h3>
                <h4>${exp.title}</h4>
                <ul>
                    ${exp.responsibilities
                        .map(resp => `<li>${resp}</li>`)
                        .join('')}
                </ul>
            </div>
        `).join('')}
    `;

    // Render Highlights
    const highlights = document.getElementById('highlights');
    highlights.innerHTML = `
        <ul>
            ${data.highlights
                .map(highlight => `<li>${highlight}</li>`)
                .join('')}
        </ul>
    `;

    // Render Personal Statement
    const personalStatement = document.getElementById('personal-statement');
    personalStatement.innerHTML = `
        <p>${data.personalStatement}</p>
        ${data.personalStatementMedia?.active ? `
            <div class="personal-statement-media">
                ${data.personalStatementMedia.images.map(img => `
                    <img src="${img.path}" alt="${img.caption}">
                `).join('')}
            </div>
        ` : ''}
    `;
}

function renderProjects(data) {
    const projects = document.getElementById('projects');
    projects.innerHTML = data.projects
        .map(project => {
            if (project.name === "Professional Statement") {
                return `
                    <div class="professional-statement">
                        <p class="statement-text">${project.details[0]}</p>
                    </div>
                `;
            }

            // 生成项目标签
            const projectTags = project.achievement ? renderProjectTags(project.achievement) : '';

            return `
                <div class="experience-item project-card ${project.details.length === 0 ? 'media-only' : ''}">
                    <h3>${projectTags}${project.name}</h3>
                    ${project.projectLink ? `
                        <div class="project-link">
                            <a href="${project.projectLink.url}" target="_blank" rel="noopener noreferrer">${project.projectLink.text}</a>
                        </div>
                    ` : ''}
                    ${project.details.length > 0 ? `
                        <div class="technical-stack">
                            ${renderTechnicalStack(project.technicalHighlights)}
                        </div>
                        <ul>
                            ${project.details
                                .map(detail => `<li>${detail}</li>`)
                                .join('')}
                            ${project.achievement ? `<li>${renderAchievement(project.achievement)}</li>` : ''}
                        </ul>
                    ` : ''}
                    ${project.hasMedia ? `
                        <div class="media-section">
                            <div class="media-header" onclick="toggleMedia(this)">
                                <span class="media-title">View Project Media</span>
                                <div class="expand-icon">▼</div>
                            </div>
                            <div class="media-content">
                                ${project.media.images && project.media.images.length > 0 ? `
                                    <div class="media-gallery">
                                        ${project.media.images.map(img => `
                                            <div class="media-item">
                                                <img src="${img.path}" alt="${img.caption}"
                                                    onerror="this.onerror=null; this.src='${img.path.toLowerCase()}'">
                                                <p class="caption">${img.caption}</p>
                                            </div>
                                        `).join('')}
                                    </div>
                                ` : ''}
                                ${project.media.videos && project.media.videos.length > 0 ? `
                                    <div class="video-gallery">
                                        ${project.media.videos.map(video => `
                                            <div class="media-item video">
                                                <video controls playsinline>
                                                    <source src="${video.path}" type="${video.path.toLowerCase().endsWith('.mov') ? 'video/quicktime' : 'video/mp4'}">
                                                    <source src="${video.path.toLowerCase()}" type="${video.path.toLowerCase().endsWith('.mov') ? 'video/quicktime' : 'video/mp4'}">
                                                    Your browser does not support this video format.
                                                </video>
                                                <p class="caption">${video.caption}</p>
                                            </div>
                                        `).join('')}
                                    </div>
                                ` : ''}
                            </div>
                        </div>
                    ` : ''}
                </div>
            `;
        })
        .join('');
}

function toggleMedia(header) {
    const mediaSection = header.closest('.media-section');
    const content = mediaSection.querySelector('.media-content');
    const icon = header.querySelector('.expand-icon');
    
    if (content.style.maxHeight) {
        content.style.maxHeight = null;
        icon.style.transform = 'rotate(0deg)';
    } else {
        content.style.maxHeight = content.scrollHeight + "px";
        icon.style.transform = 'rotate(180deg)';
    }
}

function renderTechnicalStack(technicalHighlights) {
    return technicalHighlights.split(', ').map(tech => 
        `<span class="skill-tag">${tech}</span>`
    ).join('');
}

function renderSkills(skills) {
    return skills.map(skill => `
        <div class="skill-category">
            <h3>${skill.category}</h3>
            <div class="skill-bar">
                <div class="skill-progress" style="width: ${skill.proficiency || '90'}%"></div>
            </div>
            <p>${skill.skills}</p>
        </div>
    `).join('');
}

function renderProjectTags(achievement) {
    if (typeof achievement === 'string') return '';
    
    const tags = [];
    if (achievement.isSecret) {
        tags.push('<span class="secret-tag">SECRET</span>');
    }
    if (achievement.isProduction) {
        tags.push('<span class="production-tag">PRODUCTION</span>');
    }
    
    return tags.join(' ');
}

function renderAchievement(achievement) {
    if (typeof achievement === 'string') {
        return `<strong>Achievement:</strong> ${achievement}`;
    }
    
    return `<strong>Achievement:</strong> ${achievement.text}`;
}

// Load resume data when page loads
document.addEventListener('DOMContentLoaded', loadResumeData); 