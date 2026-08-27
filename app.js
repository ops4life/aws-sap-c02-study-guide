// Study Guide App
class StudyGuideApp {
    constructor() {
        this.sections = [
            { id: 'section-1', file: '01_Organizational_Complexity.md', title: 'Design Solutions for Organizational Complexity', weight: 26 },
            { id: 'section-2', file: '02_New_Solutions.md', title: 'Design for New Solutions', weight: 29 },
            { id: 'section-3', file: '03_Continuous_Improvement.md', title: 'Continuous Improvement for Existing Solutions', weight: 25 },
            { id: 'section-4', file: '04_Migration_and_Modernization.md', title: 'Accelerate Workload Migration and Modernization', weight: 20 }
        ];

        this.currentSection = null;
        this.currentTopic = null;
        this.sectionData = {};
        this.progress = this.loadProgress();
        this.notes = this.loadNotes();
        this.sidebarCollapsed = this.loadSidebarState();
        this.theme = this.loadTheme();
        this.activeFilter = 'all';

        this.init();
    }

    init() {
        this.applyTheme();
        this.setupEventListeners();
        this.renderSidebar();
        this.updateProgressDashboard();
    }

    setupEventListeners() {
        // Main title click - return to welcome screen
        document.getElementById('main-title').addEventListener('click', () => {
            this.returnToWelcome();
        });

        // Sidebar toggle
        document.getElementById('toggle-sidebar').addEventListener('click', () => {
            this.sidebarCollapsed = !this.sidebarCollapsed;
            this.saveSidebarState();
            this.toggleSidebar();
        });

        // Theme toggle
        document.getElementById('toggle-theme').addEventListener('click', () => {
            this.theme = this.theme === 'dark' ? 'light' : 'dark';
            this.saveTheme();
            this.applyTheme();
        });

        // Notes panel toggle
        document.getElementById('toggle-notes').addEventListener('click', () => {
            document.getElementById('notes-panel').classList.toggle('open');
        });

        document.getElementById('close-notes').addEventListener('click', () => {
            document.getElementById('notes-panel').classList.remove('open');
        });

        // Save notes
        document.getElementById('save-notes').addEventListener('click', () => {
            this.saveCurrentNotes();
            this.updateSidebarProgress();
            this.applyNavFilter();
        });

        // Topic / Section completion checkbox
        document.getElementById('topic-complete-checkbox').addEventListener('change', (e) => {
            if (this.currentSection) {
                if (this.currentTopic) {
                    this.toggleTopicCompletion(this.currentSection, this.currentTopic, e.target.checked);
                } else {
                    this.toggleSectionCompletion(this.currentSection, e.target.checked);
                }
            }
        });

        // Prev/Next topic navigation
        document.getElementById('prev-topic').addEventListener('click', () => this.stepTopic(-1));
        document.getElementById('next-topic').addEventListener('click', () => this.stepTopic(1));

        // Expand / Collapse all
        const expandBtn = document.getElementById('expand-all-sections');
        if (expandBtn) {
            expandBtn.addEventListener('click', () => {
                document.querySelectorAll('.section-header').forEach(h => h.classList.add('expanded'));
                document.querySelectorAll('.topic-list').forEach(l => l.classList.add('expanded'));
            });
        }
        const collapseBtn = document.getElementById('collapse-all-sections');
        if (collapseBtn) {
            collapseBtn.addEventListener('click', () => {
                document.querySelectorAll('.section-header').forEach(h => h.classList.remove('expanded'));
                document.querySelectorAll('.topic-list').forEach(l => l.classList.remove('expanded'));
            });
        }

        // Search
        const searchInput = document.getElementById('search-input');
        searchInput.addEventListener('input', () => this.handleSearchInput());
        searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') this.closeSearchDropdown();
        });
        document.addEventListener('click', (e) => {
            if (!document.getElementById('header-search').contains(e.target)) {
                this.closeSearchDropdown();
            }
        });
    }

    toggleSidebar() {
        const sidebar = document.querySelector('.sidebar');
        if (this.sidebarCollapsed) {
            sidebar.classList.add('collapsed');
        } else {
            sidebar.classList.remove('collapsed');
        }
    }

    // Local Storage Management
    loadProgress() {
        const saved = localStorage.getItem('sapc02-progress');
        return saved ? JSON.parse(saved) : {};
    }

    saveProgress() {
        localStorage.setItem('sapc02-progress', JSON.stringify(this.progress));
        this.updateProgressDashboard();
    }

    loadNotes() {
        const saved = localStorage.getItem('sapc02-notes');
        return saved ? JSON.parse(saved) : {};
    }

    saveNotes() {
        localStorage.setItem('sapc02-notes', JSON.stringify(this.notes));
    }

    loadSidebarState() {
        const saved = localStorage.getItem('sapc02-sidebar-collapsed');
        return saved === 'true';
    }

    saveSidebarState() {
        localStorage.setItem('sapc02-sidebar-collapsed', this.sidebarCollapsed.toString());
    }

    loadTheme() {
        return localStorage.getItem('sapc02-theme') || 'light';
    }

    saveTheme() {
        localStorage.setItem('sapc02-theme', this.theme);
    }

    applyTheme() {
        document.documentElement.setAttribute('data-theme', this.theme);
        document.getElementById('theme-icon-dark').style.display = this.theme === 'dark' ? 'none' : 'block';
        document.getElementById('theme-icon-light').style.display = this.theme === 'dark' ? 'block' : 'none';
    }

    // Render Sidebar Navigation
    async renderSidebar() {
        const nav = document.getElementById('section-nav');
        nav.innerHTML = '';

        for (let i = 0; i < this.sections.length; i++) {
            const section = this.sections[i];

            // Load markdown content
            try {
                const content = await this.loadMarkdownFile(section.file);
                const topics = this.extractTopics(content);
                this.sectionData[section.id] = { content, topics };

                // Create section element
                const sectionEl = this.createSectionElement(section, topics, i + 1);
                nav.appendChild(sectionEl);
            } catch (error) {
                console.error(`Error loading ${section.file}:`, error);
            }
        }

        this.updateProgressDashboard();
        this.renderHomeDashboard();

        // Apply saved sidebar state
        this.toggleSidebar();
    }

    createSectionElement(section, topics, number) {
        const sectionDiv = document.createElement('div');
        sectionDiv.className = 'section-item';
        sectionDiv.dataset.sectionId = section.id;

        const completed = this.getSectionProgress(section.id, topics);
        const isCompleted = completed.completed === completed.total && completed.total > 0;
        const percent = completed.total > 0 ? Math.round((completed.completed / completed.total) * 100) : 0;

        // Section header
        const header = document.createElement('div');
        header.className = `section-header ${isCompleted ? 'completed' : ''}`;
        header.innerHTML = `
            <div class="section-header-top">
                <div class="section-title">
                    <span class="section-number">Domain ${number}</span>
                    <span class="section-weight">${section.weight}%</span>
                </div>
                <div class="section-header-right">
                    <span class="section-progress">${completed.completed}/${completed.total}</span>
                    <span class="expand-icon">›</span>
                </div>
            </div>
            <div class="section-title-text" title="${section.title}">${section.title}</div>
            <div class="section-mini-bar">
                <div class="section-mini-bar-fill" style="width: ${percent}%"></div>
            </div>
        `;

        // Topic list
        const topicList = document.createElement('div');
        topicList.className = 'topic-list';

        topics.forEach(topic => {
            const topicEl = this.createTopicElement(section.id, topic);
            topicList.appendChild(topicEl);
        });

        // Section header click logic
        header.addEventListener('click', (e) => {
            if (e.target.classList.contains('section-title-text')) {
                e.stopPropagation();
                this.loadSection(section.id);
            } else {
                header.classList.toggle('expanded');
                topicList.classList.toggle('expanded');
            }
        });

        sectionDiv.appendChild(header);
        sectionDiv.appendChild(topicList);

        return sectionDiv;
    }

    createTopicElement(sectionId, topic) {
        const topicDiv = document.createElement('div');
        const topicKey = this.getTopicKey(sectionId, topic.subtitle || topic.title);
        const isCompleted = this.progress[topicKey] || false;
        const hasNotes = Boolean(this.notes[topicKey] && this.notes[topicKey].trim().length > 0);

        // Display subtitle if available, otherwise show title
        const displayText = topic.subtitle || topic.title;

        topicDiv.className = `topic-item ${isCompleted ? 'completed' : ''}`;
        topicDiv.dataset.topicKey = topicKey;
        topicDiv.dataset.completed = isCompleted;
        topicDiv.dataset.hasNotes = hasNotes;

        topicDiv.innerHTML = `
            <div class="topic-checkbox" data-topic-key="${topicKey}"></div>
            <span class="topic-title-span">${displayText}</span>
            ${hasNotes ? '<span class="note-badge" title="Has notes">📝</span>' : ''}
        `;

        // Make checkbox clickable to toggle completion
        const checkbox = topicDiv.querySelector('.topic-checkbox');
        checkbox.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent loading the topic
            const currentState = this.progress[topicKey] || false;
            this.progress[topicKey] = !currentState;
            this.saveProgress();
            this.updateSidebarProgress();
            this.renderHomeDashboard();

            // Update the footer checkbox if this topic is currently loaded
            const topicIdentifier = topic.subtitle || topic.title;
            if (this.currentSection === sectionId && this.currentTopic === topicIdentifier) {
                document.getElementById('topic-complete-checkbox').checked = !currentState;
            }
        });

        // Click on topic title/area loads the topic
        topicDiv.addEventListener('click', (e) => {
            this.loadTopic(sectionId, topic, e);
        });

        return topicDiv;
    }

    // Load and Parse Markdown
    async loadMarkdownFile(filename) {
        const response = await fetch(filename);
        if (!response.ok) {
            throw new Error(`Failed to load ${filename}`);
        }
        return await response.text();
    }

    extractTopics(markdown) {
        const topics = [];
        const lines = markdown.split('\n');
        let currentH2 = null;
        let currentH3 = null;
        let content = [];

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];

            if (line.startsWith('## ') && !line.includes('Overview')) {
                // Save previous topic
                if (currentH2) {
                    topics.push({
                        title: currentH2,
                        subtitle: currentH3,
                        content: content.join('\n')
                    });
                }

                // Start new H2 topic
                currentH2 = line.replace('## ', '').trim();
                currentH3 = null;
                content = [line];
            } else if (line.startsWith('### ')) {
                // H3 creates a subtopic
                if (currentH2 && currentH3) {
                    // Save previous subtopic
                    topics.push({
                        title: currentH2,
                        subtitle: currentH3,
                        content: content.join('\n')
                    });
                    content = [];
                }

                currentH3 = line.replace('### ', '').trim();
                content.push(line);
            } else {
                content.push(line);
            }
        }

        // Save last topic
        if (currentH2) {
            topics.push({
                title: currentH2,
                subtitle: currentH3,
                content: content.join('\n')
            });
        }

        return topics;
    }

    // Flatten all topics across sections, in nav order (for prev/next + search)
    flatTopics() {
        const flat = [];
        this.sections.forEach(section => {
            const topics = this.sectionData[section.id]?.topics || [];
            topics.forEach(topic => {
                flat.push({ sectionId: section.id, sectionTitle: section.title, topic });
            });
        });
        return flat;
    }

    findFlatIndex(sectionId, topic) {
        const topicIdentifier = topic.subtitle || topic.title;
        return this.flatTopics().findIndex(f =>
            f.sectionId === sectionId && (f.topic.subtitle || f.topic.title) === topicIdentifier
        );
    }

    stepTopic(delta) {
        const flat = this.flatTopics();
        if (flat.length === 0) return;

        // If on section page without a selected topic
        if (this.currentSection && !this.currentTopic) {
            const sectionTopics = this.sectionData[this.currentSection]?.topics || [];
            if (sectionTopics.length > 0) {
                const targetTopic = delta > 0 ? sectionTopics[0] : sectionTopics[sectionTopics.length - 1];
                this.loadTopic(this.currentSection, targetTopic, null);
            }
            return;
        }

        if (!this.currentSection || !this.currentTopic) return;
        const currentTopicObj = this.sectionData[this.currentSection]?.topics.find(
            t => (t.subtitle || t.title) === this.currentTopic
        );
        if (!currentTopicObj) return;

        const idx = this.findFlatIndex(this.currentSection, currentTopicObj);
        const nextIdx = idx + delta;
        if (nextIdx < 0 || nextIdx >= flat.length) return;

        const next = flat[nextIdx];
        this.loadTopic(next.sectionId, next.topic, null);
    }

    highlightActiveTopic(sectionId, topic) {
        document.querySelectorAll('.topic-item').forEach(el => el.classList.remove('active'));
        const topicIdentifier = topic.subtitle || topic.title;
        document.querySelectorAll('.topic-item').forEach(el => {
            const topicText = el.querySelector('span')?.textContent;
            if (topicText === topicIdentifier) {
                el.classList.add('active');
            }
        });
    }

    updateTopicNavButtons() {
        const flat = this.flatTopics();
        const currentTopicObj = this.sectionData[this.currentSection]?.topics.find(
            t => (t.subtitle || t.title) === this.currentTopic
        );
        const idx = currentTopicObj ? this.findFlatIndex(this.currentSection, currentTopicObj) : -1;

        const prevBtn = document.getElementById('prev-topic');
        const nextBtn = document.getElementById('next-topic');
        prevBtn.disabled = idx <= 0;
        nextBtn.disabled = idx === -1 || idx >= flat.length - 1;
    }

    // Load Topic Content
    loadTopic(sectionId, topic, event) {
        this.currentSection = sectionId;
        this.currentTopic = topic.subtitle || topic.title;

        const section = this.sections.find(s => s.id === sectionId);
        const topicKey = this.getTopicKey(sectionId, topic.subtitle || topic.title);

        // Update breadcrumb with clickable navigation
        const topicDisplay = topic.subtitle || topic.title;
        const breadcrumb = document.getElementById('breadcrumb');
        breadcrumb.innerHTML = `
            <span class="breadcrumb-link" id="breadcrumb-home">Home</span>
            <span class="breadcrumb-separator">›</span>
            <span class="breadcrumb-link" id="breadcrumb-section">${section.title}</span>
            <span class="breadcrumb-separator">›</span>
            <span class="breadcrumb-current">${topicDisplay}</span>
        `;

        // Make "Home" clickable
        document.getElementById('breadcrumb-home').addEventListener('click', () => {
            this.returnToWelcome();
        });

        // Make section name clickable
        document.getElementById('breadcrumb-section').addEventListener('click', () => {
            this.loadSection(sectionId);
        });

        // Render content
        const contentEl = document.getElementById('study-content');
        const html = marked.parse(topic.content);
        contentEl.innerHTML = html;
        this.addCopyButtonsToCodeBlocks(contentEl);

        // Update active state in sidebar
        document.querySelectorAll('.topic-item').forEach(el => el.classList.remove('active'));
        if (event) {
            event.target.closest('.topic-item').classList.add('active');
        } else {
            this.highlightActiveTopic(sectionId, topic);
        }

        // Show topic footer
        const footer = document.getElementById('topic-footer');
        footer.style.display = 'flex';
        const checkboxLabel = footer.querySelector('.checkbox-label');
        if (checkboxLabel) {
            checkboxLabel.style.display = 'inline-flex';
            checkboxLabel.querySelector('span').textContent = 'Mark this topic as completed';
        }
        this.updateTopicNavButtons();

        // Update checkbox
        const checkbox = document.getElementById('topic-complete-checkbox');
        checkbox.checked = this.progress[topicKey] || false;

        // Load notes
        this.loadTopicNotes(topicKey);

        // Scroll to top
        contentEl.scrollTop = 0;
    }

    // Load Section Overview
    loadSection(sectionId) {
        this.currentSection = sectionId;
        this.currentTopic = null;

        const section = this.sections.find(s => s.id === sectionId);
        const sectionContent = this.sectionData[sectionId].content;

        // Update breadcrumb with clickable home
        const breadcrumb = document.getElementById('breadcrumb');
        breadcrumb.innerHTML = `
            <span class="breadcrumb-link" id="breadcrumb-home">Home</span>
            <span class="breadcrumb-separator">›</span>
            <span class="breadcrumb-current">${section.title}</span>
        `;

        // Make "Home" clickable
        document.getElementById('breadcrumb-home').addEventListener('click', () => {
            this.returnToWelcome();
        });

        // Render full section content
        const contentEl = document.getElementById('study-content');
        const html = marked.parse(sectionContent);
        contentEl.innerHTML = html;
        this.addCopyButtonsToCodeBlocks(contentEl);

        // Update active state - remove from topics, add to section
        document.querySelectorAll('.topic-item').forEach(el => el.classList.remove('active'));
        document.querySelectorAll('.section-header').forEach(el => el.classList.remove('active-section'));

        // Find and highlight the active section
        const sectionHeaders = document.querySelectorAll('.section-header');
        const sectionIndex = this.sections.findIndex(s => s.id === sectionId);
        if (sectionHeaders[sectionIndex]) {
            sectionHeaders[sectionIndex].classList.add('active-section');
        }

        // Show topic footer with completion checkbox and navigation buttons (consistent with topic pages)
        const footer = document.getElementById('topic-footer');
        footer.style.display = 'flex';
        const checkboxLabel = footer.querySelector('.checkbox-label');
        if (checkboxLabel) {
            checkboxLabel.style.display = 'inline-flex';
            checkboxLabel.querySelector('span').textContent = 'Mark this section as completed';
        }

        const sectionKey = `section-complete-${sectionId}`;
        const checkbox = document.getElementById('topic-complete-checkbox');
        checkbox.checked = this.progress[sectionKey] || false;

        // Update nav buttons for section view
        const prevBtn = document.getElementById('prev-topic');
        const nextBtn = document.getElementById('next-topic');
        const sectionTopics = this.sectionData[sectionId]?.topics || [];
        const firstTopicOfSection = sectionTopics[0];
        const firstIdx = firstTopicOfSection ? this.findFlatIndex(sectionId, firstTopicOfSection) : -1;

        prevBtn.disabled = firstIdx <= 0;
        nextBtn.disabled = firstIdx === -1;

        // Scroll to top
        contentEl.scrollTop = 0;
    }

    addCopyButtonsToCodeBlocks(container) {
        const codeBlocks = container.querySelectorAll('pre');
        codeBlocks.forEach(pre => {
            if (pre.querySelector('.copy-code-btn')) return;

            pre.style.position = 'relative';

            const copyBtn = document.createElement('button');
            copyBtn.className = 'copy-code-btn';
            copyBtn.innerHTML = `
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                </svg>
                <span>Copy</span>
            `;

            copyBtn.addEventListener('click', async () => {
                const codeText = pre.querySelector('code')?.innerText || pre.innerText;
                try {
                    await navigator.clipboard.writeText(codeText);
                    copyBtn.classList.add('copied');
                    copyBtn.querySelector('span').textContent = 'Copied!';
                    setTimeout(() => {
                        copyBtn.classList.remove('copied');
                        copyBtn.querySelector('span').textContent = 'Copy';
                    }, 2000);
                } catch (err) {
                    console.error('Failed to copy code block: ', err);
                }
            });

            pre.appendChild(copyBtn);
        });
    }

    // Progress Tracking
    toggleSectionCompletion(sectionId, completed) {
        const topics = this.sectionData[sectionId]?.topics || [];
        topics.forEach(topic => {
            const topicIdentifier = topic.subtitle || topic.title;
            const topicKey = this.getTopicKey(sectionId, topicIdentifier);
            this.progress[topicKey] = completed;
        });

        const sectionKey = `section-complete-${sectionId}`;
        this.progress[sectionKey] = completed;
        this.saveProgress();

        // Update sidebar
        this.updateSidebarProgress();
        this.renderHomeDashboard();

        // Auto-advance to first topic of section if marking as complete
        if (completed && topics.length > 0) {
            setTimeout(() => {
                this.loadTopic(sectionId, topics[0], null);
            }, 400);
        }
    }

    toggleTopicCompletion(sectionId, topicTitle, completed) {
        const topicKey = this.getTopicKey(sectionId, topicTitle);
        this.progress[topicKey] = completed;
        this.saveProgress();

        // Update sidebar
        this.updateSidebarProgress();
        this.renderHomeDashboard();

        // Auto-advance to next topic if marking as complete
        if (completed) {
            this.advanceToNextTopic(sectionId, topicTitle);
        }
    }

    // Auto-advance to next topic
    advanceToNextTopic(currentSectionId, currentTopicTitle) {
        const allTopics = this.flatTopics();

        // Find current topic index
        let currentIndex = -1;
        for (let i = 0; i < allTopics.length; i++) {
            const topicIdentifier = allTopics[i].topic.subtitle || allTopics[i].topic.title;
            if (allTopics[i].sectionId === currentSectionId && topicIdentifier === currentTopicTitle) {
                currentIndex = i;
                break;
            }
        }

        // Load next topic if available
        if (currentIndex >= 0 && currentIndex < allTopics.length - 1) {
            const nextTopic = allTopics[currentIndex + 1];

            // Small delay for smooth transition
            setTimeout(() => {
                this.loadTopic(nextTopic.sectionId, nextTopic.topic, null);
                this.highlightActiveTopic(nextTopic.sectionId, nextTopic.topic);
            }, 500);
        }
    }

    getSectionProgress(sectionId, topics) {
        let completed = 0;
        topics.forEach(topic => {
            const topicIdentifier = topic.subtitle || topic.title;
            const topicKey = this.getTopicKey(sectionId, topicIdentifier);
            if (this.progress[topicKey]) {
                completed++;
            }
        });
        return { completed, total: topics.length };
    }

    applyNavFilter() {
        const filter = this.activeFilter;
        document.querySelectorAll('.section-item').forEach(sectionDiv => {
            const topics = sectionDiv.querySelectorAll('.topic-item');
            let visibleCount = 0;

            topics.forEach(topicDiv => {
                const completed = topicDiv.dataset.completed === 'true';
                const hasNotes = topicDiv.dataset.hasNotes === 'true';

                let show = true;
                if (filter === 'todo') show = !completed;
                else if (filter === 'done') show = completed;
                else if (filter === 'notes') show = hasNotes;

                topicDiv.style.display = show ? 'flex' : 'none';
                if (show) visibleCount++;
            });

            // Hide section if no visible topics under current filter
            sectionDiv.style.display = (filter === 'all' || visibleCount > 0) ? 'block' : 'none';
        });
    }

    updateSidebarProgress() {
        // Update topic checkmarks and section progress counts
        Object.keys(this.sectionData).forEach((sectionId, index) => {
            const topics = this.sectionData[sectionId].topics;
            const progress = this.getSectionProgress(sectionId, topics);
            const percent = progress.total > 0 ? Math.round((progress.completed / progress.total) * 100) : 0;

            // Update section progress text & mini bar
            const sectionHeaders = document.querySelectorAll('.section-header');
            const sectionHeader = sectionHeaders[index];
            if (sectionHeader) {
                const progressSpan = sectionHeader.querySelector('.section-progress');
                if (progressSpan) {
                    progressSpan.textContent = `${progress.completed}/${progress.total}`;
                }

                const fillBar = sectionHeader.querySelector('.section-mini-bar-fill');
                if (fillBar) {
                    fillBar.style.width = `${percent}%`;
                }

                // Update completed class on section
                if (progress.completed === progress.total && progress.total > 0) {
                    sectionHeader.classList.add('completed');
                } else {
                    sectionHeader.classList.remove('completed');
                }
            }

            // Update topic checkmarks & note badges
            topics.forEach(topic => {
                const topicIdentifier = topic.subtitle || topic.title;
                const topicKey = this.getTopicKey(sectionId, topicIdentifier);
                const isCompleted = this.progress[topicKey] || false;
                const hasNotes = Boolean(this.notes[topicKey] && this.notes[topicKey].trim().length > 0);

                document.querySelectorAll('.topic-item').forEach(topicEl => {
                    if (topicEl.dataset.topicKey === topicKey) {
                        topicEl.dataset.completed = isCompleted;
                        topicEl.dataset.hasNotes = hasNotes;

                        if (isCompleted) {
                            topicEl.classList.add('completed');
                        } else {
                            topicEl.classList.remove('completed');
                        }

                        let badge = topicEl.querySelector('.note-badge');
                        if (hasNotes && !badge) {
                            badge = document.createElement('span');
                            badge.className = 'note-badge';
                            badge.title = 'Has notes';
                            badge.textContent = '📝';
                            topicEl.appendChild(badge);
                        } else if (!hasNotes && badge) {
                            badge.remove();
                        }
                    }
                });
            });
        });

        this.applyNavFilter();
    }

    updateProgressDashboard() {
        let totalTopics = 0;
        let completedTopics = 0;

        Object.keys(this.sectionData).forEach(sectionId => {
            const topics = this.sectionData[sectionId].topics;
            totalTopics += topics.length;

            topics.forEach(topic => {
                const topicIdentifier = topic.subtitle || topic.title;
                const topicKey = this.getTopicKey(sectionId, topicIdentifier);
                if (this.progress[topicKey]) {
                    completedTopics++;
                }
            });
        });

        const percentage = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;

        // Update circle
        const circle = document.getElementById('progress-circle');
        circle.setAttribute('stroke-dasharray', `${percentage}, 100`);

        // Update text
        document.getElementById('progress-text').textContent = `${percentage}%`;
        document.getElementById('completed-topics').textContent = completedTopics;
        document.getElementById('total-topics').textContent = totalTopics;
    }

    // Home Dashboard
    renderHomeDashboard() {
        const welcome = document.querySelector('.welcome');
        if (!welcome) return; // not on home screen right now

        const existing = welcome.querySelector('.dashboard-grid');
        if (existing) existing.remove();

        const grid = document.createElement('div');
        grid.className = 'dashboard-grid';

        this.sections.forEach((section, i) => {
            const topics = this.sectionData[section.id]?.topics || [];
            const progress = this.getSectionProgress(section.id, topics);
            const percent = progress.total ? Math.round((progress.completed / progress.total) * 100) : 0;
            const isDone = progress.total > 0 && progress.completed === progress.total;
            const resumeLabel = progress.completed === 0 ? 'Start' : (isDone ? 'Review' : 'Continue');

            const card = document.createElement('div');
            card.className = `dashboard-card ${isDone ? 'done' : ''}`;
            card.innerHTML = `
                <div class="dashboard-card-top">
                    <span class="section-number">${i + 1}</span>
                    <span class="dashboard-card-weight">${section.weight}% of exam</span>
                </div>
                <h3 class="dashboard-card-title">${section.title}</h3>
                <div class="dashboard-card-bar"><div class="dashboard-card-bar-inner" style="width:${percent}%"></div></div>
                <div class="dashboard-card-bottom">
                    <span class="dashboard-card-progress">${progress.completed}/${progress.total} topics</span>
                    <span class="dashboard-card-resume">${resumeLabel} →</span>
                </div>
            `;
            card.addEventListener('click', () => {
                const firstIncomplete = topics.find(t => !this.progress[this.getTopicKey(section.id, t.subtitle || t.title)]);
                if (firstIncomplete) {
                    this.loadTopic(section.id, firstIncomplete, null);
                    this.highlightActiveTopic(section.id, firstIncomplete);
                } else if (topics[0]) {
                    this.loadTopic(section.id, topics[0], null);
                    this.highlightActiveTopic(section.id, topics[0]);
                } else {
                    this.loadSection(section.id);
                }
            });
            grid.appendChild(card);
        });

        welcome.appendChild(grid);
    }

    // Search
    handleSearchInput() {
        const query = document.getElementById('search-input').value.trim().toLowerCase();
        const dropdown = document.getElementById('search-dropdown');
        dropdown.innerHTML = '';

        if (query.length < 2) {
            dropdown.classList.remove('open');
            return;
        }

        const queryWords = query.split(/\s+/).filter(w => w.length > 0);
        const results = [];

        this.flatTopics().forEach(f => {
            const topicTitle = (f.topic.subtitle || f.topic.title).toLowerCase();
            const sectionTitle = f.sectionTitle.toLowerCase();
            const contentText = (f.topic.content || '').toLowerCase();
            const topicKey = this.getTopicKey(f.sectionId, f.topic.subtitle || f.topic.title);
            const userNote = (this.notes[topicKey] || '').toLowerCase();

            // Match if all query words match title, section, content, or notes
            const matchesTitle = queryWords.every(w => topicTitle.includes(w) || sectionTitle.includes(w));
            const matchesContent = queryWords.every(w => contentText.includes(w) || topicTitle.includes(w) || sectionTitle.includes(w));
            const matchesNote = queryWords.every(w => userNote.includes(w));

            if (matchesTitle || matchesContent || matchesNote) {
                let snippet = '';
                if (matchesContent && !matchesTitle) {
                    const firstWord = queryWords[0];
                    const idx = contentText.indexOf(firstWord);
                    if (idx !== -1) {
                        const start = Math.max(0, idx - 30);
                        const end = Math.min(contentText.length, idx + 60);
                        snippet = '...' + f.topic.content.substring(start, end).replace(/[\r\n#*`]/g, ' ') + '...';
                    }
                } else if (matchesNote) {
                    snippet = '📝 Note: ' + this.notes[topicKey];
                }

                results.push({
                    sectionId: f.sectionId,
                    sectionTitle: f.sectionTitle,
                    topic: f.topic,
                    snippet: snippet
                });
            }
        });

        const limitedResults = results.slice(0, 10);

        if (limitedResults.length === 0) {
            dropdown.innerHTML = `<div class="search-empty">No matching content found for "${this.escapeHtml(document.getElementById('search-input').value)}"</div>`;
        } else {
            limitedResults.forEach(result => {
                const item = document.createElement('div');
                item.className = 'search-result';
                const label = result.topic.subtitle || result.topic.title;
                item.innerHTML = `
                    <div class="search-result-label">${this.escapeHtml(label)}</div>
                    <div class="search-result-section">${this.escapeHtml(result.sectionTitle)}</div>
                    ${result.snippet ? `<div class="search-result-snippet">${this.escapeHtml(result.snippet)}</div>` : ''}
                `;
                item.addEventListener('click', () => {
                    this.loadTopic(result.sectionId, result.topic, null);
                    this.highlightActiveTopic(result.sectionId, result.topic);
                    this.closeSearchDropdown();
                    document.getElementById('search-input').value = '';
                });
                dropdown.appendChild(item);
            });
        }

        dropdown.classList.add('open');
    }

    closeSearchDropdown() {
        document.getElementById('search-dropdown').classList.remove('open');
    }

    escapeHtml(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    // Notes Management
    loadTopicNotes(topicKey) {
        const notesTextarea = document.getElementById('notes-textarea');
        const notesInfo = document.getElementById('notes-info');

        notesTextarea.value = this.notes[topicKey] || '';
        notesInfo.textContent = `Notes for: ${this.currentTopic}`;
    }

    saveCurrentNotes() {
        if (!this.currentSection || !this.currentTopic) return;

        const topicKey = this.getTopicKey(this.currentSection, this.currentTopic);
        const notesTextarea = document.getElementById('notes-textarea');

        this.notes[topicKey] = notesTextarea.value;
        this.saveNotes();

        // Show feedback
        const btn = document.getElementById('save-notes');
        const originalText = btn.textContent;
        btn.textContent = 'Saved!';
        btn.style.backgroundColor = 'var(--success-color)';

        setTimeout(() => {
            btn.textContent = originalText;
            btn.style.backgroundColor = '';
        }, 2000);
    }

    // Return to Welcome Screen
    returnToWelcome() {
        // Clear current selection
        this.currentSection = null;
        this.currentTopic = null;

        // Update breadcrumb
        document.getElementById('breadcrumb').innerHTML = '<span class="breadcrumb-current">Select a section to begin</span>';

        // Show welcome screen
        const contentEl = document.getElementById('study-content');
        contentEl.innerHTML = `
            <div class="welcome">
                <h2>Welcome to SAP-C02 Study Guide</h2>
                <p>Select a section from the sidebar to start studying. Your progress will be automatically saved.</p>
                <div class="features">
                    <div class="feature">
                        <span class="feature-icon">✓</span>
                        <div>
                            <h3>Track Progress</h3>
                            <p>Mark sections and topics as completed</p>
                        </div>
                    </div>
                    <div class="feature">
                        <span class="feature-icon">📝</span>
                        <div>
                            <h3>Take Notes</h3>
                            <p>Add personal notes to any topic</p>
                        </div>
                    </div>
                    <div class="feature">
                        <span class="feature-icon">📊</span>
                        <div>
                            <h3>Visual Dashboard</h3>
                            <p>See your overall progress at a glance</p>
                        </div>
                    </div>
                </div>
            </div>
        `;
        this.renderHomeDashboard();

        // Hide topic footer
        document.getElementById('topic-footer').style.display = 'none';

        // Close notes panel
        document.getElementById('notes-panel').classList.remove('open');

        // Remove active state from all topics
        document.querySelectorAll('.topic-item').forEach(el => el.classList.remove('active'));
        document.querySelectorAll('.section-header').forEach(el => el.classList.remove('active-section'));

        // Scroll to top
        contentEl.scrollTop = 0;
    }

    // Utility
    getTopicKey(sectionId, topicTitle) {
        return `${sectionId}-${topicTitle.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new StudyGuideApp();
});
