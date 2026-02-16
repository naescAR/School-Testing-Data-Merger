/* ══════════════════════════════════════════════════════════════
   CONSTANTS & CONFIGURATION
   ══════════════════════════════════════════════════════════════ */

const OUTPUT_HEADERS = [
    'Student Name', 'Student ID', 'Student DOB', 'Grade', 'Enrolled School', 'Test Reason',

    // ── ELA ──
    'ATLAS Grade 3 ELA Interim ELA Scale Score-FALL',
    'ATLAS Grade 3 ELA Interim ELA Performance-FALL',
    'ATLAS Grade 3 ELA Interim ELA Scale Score-Winter',
    'ATLAS Grade 3 ELA Interim ELA Performance-Winter',

    'ATLAS Grade 3 ELA Interim Reading Scale Score-FALL',
    'ATLAS Grade 3 ELA Interim Reading Performance-FALL',
    'ATLAS Grade 3 ELA Interim Reading Scale Score-Winter',
    'ATLAS Grade 3 ELA Interim Reading Performance-Winter',

    'Reading Fundamentals & Vocabulary Reporting Category Scale Score-FALL',
    'Reading Fundamentals & Vocabulary Performance-FALL',
    'Reading Fundamentals & Vocabulary Reporting Category Scale Score-Winter',
    'Reading Fundamentals & Vocabulary Performance-Winter',

    'Reading Informational Text Reporting Category Scale Score-FALL',
    'Reading Informational Text Performance-FALL',
    'Reading Informational Text Reporting Category Scale Score-Winter',
    'Reading Informational Text Performance-Winter',

    'Reading Literary Text Reporting Category Scale Score-FALL',
    'Reading Literary Text Performance-FALL',
    'Reading Literary Text Reporting Category Scale Score-Winter',
    'Reading Literary Text Performance-Winter',

    'Writing and Language Reporting Category Scale Score-FALL',
    'Writing and Language Performance-FALL',
    'Writing and Language Reporting Category Scale Score-Winter',
    'Writing and Language Performance-Winter',

    // ── Science ──
    'ATLAS Grade 3 Science Interim Scale Score-FALL',
    'ATLAS Grade 3 Science Interim Performance-FALL',
    'ATLAS Grade 3 Science Interim Scale Score-WINTER',
    'ATLAS Grade 3 Science Interim Performance-Winter',

    'Earth and Space Science Reporting Category Scale Score-FALL',
    'Earth and Space Science Performance-FALL',
    'Earth and Space Science Reporting Category Scale Score-WINTER',
    'Earth and Space Science Performance-WINTER',

    'Life Science Reporting Category Scale Score-FALL',
    'Life Science Performance-FALL',
    'Life Science Reporting Category Scale Score-WINTER',
    'Life Science Performance-WINTER',

    'Physical Science Reporting Category Scale Score-FALL',
    'Physical Science Performance-FALL',
    'Physical Science Reporting Category Scale Score-WINTER',
    'Physical Science Performance-WINTER',

    // ── Math ──
    'ATLAS Grade 3 Math Interim Scale Score-FALL',
    'ATLAS Grade 3 Math Interim Scale Score Standard Error-FALL',
    'ATLAS Grade 3 Math Interim Reported Quantile® Measure-FALL',
    'ATLAS Grade 3 Math Interim Performance-FALL',
    'ATLAS Grade 3 Math Interim Scale Score-Winter',
    'ATLAS Grade 3 Math Interim Scale Score Standard Error-Winter',
    'ATLAS Grade 3 Math Interim Reported Quantile® Measure-Winter',
    'ATLAS Grade 3 Math Interim Performance-Winter',

    'Computation and Algebraic Reasoning Reporting Category Scale Score-FALL',
    'Computation and Algebraic Reasoning Reporting Category Scale Score Standard Error-FALL',
    'Computation and Algebraic Reasoning Performance-FALL',
    'Computation and Algebraic Reasoning Reporting Category Scale Score-Winter',
    'Computation and Algebraic Reasoning Reporting Category Scale Score Standard Error-Winter',
    'Computation and Algebraic Reasoning Performance-Winter',

    'Geometry and Measurement & Data Analysis Reporting Category Scale Score-FALL',
    'Geometry and Measurement & Data Analysis Reporting Category Scale Score Standard Error-FALL',
    'Geometry and Measurement & Data Analysis Performance-FALL',
    'Geometry and Measurement & Data Analysis Reporting Category Scale Score-Winter',
    'Geometry and Measurement & Data Analysis Reporting Category Scale Score Standard Error-Winter',
    'Geometry and Measurement & Data Analysis Performance-Winter',

    'Number and Place Value Reporting Category Scale Score-FALL',
    'Number and Place Value Reporting Category Scale Score Standard Error-FALL',
    'Number and Place Value Performance-FALL',
    'Number and Place Value Reporting Category Scale Score-Winter',
    'Number and Place Value Reporting Category Scale Score Standard Error-Winter',
    'Number and Place Value Performance-Winter'
];

const SHARED_KEYS = ['Student Name', 'Student ID', 'Student DOB', 'Grade', 'Enrolled School', 'Test Reason'];

const VALID_TEST_REASONS = {
    'Fall 2025 - ATLAS Interim': 'fall',
    'Winter 2026 - ATLAS Interim': 'winter'
};

const SUBJECT_SIGNATURES = {
    ela: 'ATLAS Grade 3 ELA Interim',
    science: 'ATLAS Grade 3 Science Interim',
    math: 'ATLAS Grade 3 Math Interim'
};

/* ══════════════════════════════════════════════════════════════
   STATE
   ══════════════════════════════════════════════════════════════ */
const zones = ['ela', 'sci', 'math'];
const zoneLabels = { ela: 'ELA', sci: 'Science', math: 'Math' };
const zoneFiles = { ela: 0, sci: 0, math: 0 };

let uploadQueue = [];
let processedFiles = [];
let isProcessing = false;
let currentMode = 'new'; // 'new' or 'existing'
let existingFile = null;

/* ══════════════════════════════════════════════════════════════
   Mode Selection
   ══════════════════════════════════════════════════════════════ */
function selectMode(mode) {
    currentMode = mode;
    document.getElementById('modeField').value = mode;

    // Toggle UI elements based on mode
    document.getElementById('screenMode').classList.remove('active');
    document.getElementById('screenForm').classList.add('active');

    const existingGroup = document.getElementById('existingUrlGroup');
    const btnContent = document.getElementById('btnContent');

    if (mode === 'existing') {
        existingGroup.style.display = 'block';
        btnContent.textContent = 'Merge & Append to File';
    } else {
        existingGroup.style.display = 'none';
        btnContent.textContent = 'Merge Data';
    }

    // Reset state
    existingFile = null;
    document.getElementById('existingFile').value = '';
    document.getElementById('existingFileName').textContent = '';
}

function showModeScreen() {
    document.getElementById('screenForm').classList.remove('active');
    document.getElementById('screenMode').classList.add('active');
    resetBtn();
}

/* ══════════════════════════════════════════════════════════════
   Drag & Drop Handlers
   ══════════════════════════════════════════════════════════════ */
function handleDrop(e, zone) {
    e.preventDefault();
    const zoneEl = document.getElementById(zone + '-zone');
    zoneEl.classList.remove('drag-over');

    const files = e.dataTransfer.files;
    if (!files || files.length === 0) return;

    const available = 2 - zoneFiles[zone];
    if (available <= 0) return;

    const toAdd = Math.min(files.length, available);
    for (let i = 0; i < toAdd; i++) {
        const slot = zoneFiles[zone];
        const inputId = zone + 'File' + (slot + 1);
        const input = document.getElementById(inputId);

        const dt = new DataTransfer();
        dt.items.add(files[i]);
        input.files = dt.files;

        zoneFiles[zone]++;
    }

    renderZone(zone);
    updateSubmitButton();
}

function triggerBrowse(zone) {
    const slot = zoneFiles[zone];
    if (slot >= 2) return;
    const inputId = zone + 'File' + (slot + 1);
    document.getElementById(inputId).click();
}

function handlePick(input, zone, slotIndex) {
    if (!input.files || input.files.length === 0) return;
    if (zoneFiles[zone] <= slotIndex) {
        zoneFiles[zone] = slotIndex + 1;
    }
    renderZone(zone);
    updateSubmitButton();
}

/* ══════════════════════════════════════════════════════════════
   Existing File Handler
   ══════════════════════════════════════════════════════════════ */
function triggerExistingBrowse() {
    document.getElementById('existingFile').click();
}

function handleExistingPick(input) {
    if (input.files && input.files[0]) {
        existingFile = input.files[0];
        document.getElementById('existingFileName').textContent = 'Selected: ' + existingFile.name;
    } else {
        existingFile = null;
        document.getElementById('existingFileName').textContent = '';
    }
}

/* ══════════════════════════════════════════════════════════════
   Render & UI Updates
   ══════════════════════════════════════════════════════════════ */
function renderZone(zone) {
    const zoneEl = document.getElementById(zone + '-zone');
    const prompt = document.getElementById(zone + '-prompt');
    const fileList = document.getElementById(zone + '-files');
    const addBtn = document.getElementById(zone + '-add');
    const count = zoneFiles[zone];

    fileList.innerHTML = '';
    for (let i = 0; i < count; i++) {
        const input = document.getElementById(zone + 'File' + (i + 1));
        const name = (input.files && input.files[0]) ? input.files[0].name : 'File ' + (i + 1);

        const item = document.createElement('div');
        item.className = 'file-item';

        const nameSpan = document.createElement('span');
        nameSpan.className = 'file-item-name';
        nameSpan.textContent = name;
        item.appendChild(nameSpan);

        const removeBtn = document.createElement('button');
        removeBtn.type = 'button';
        removeBtn.className = 'file-item-remove';
        removeBtn.title = 'Remove';
        removeBtn.textContent = '×';
        removeBtn.addEventListener('click', () => clearSlot(zone, i));
        item.appendChild(removeBtn);

        fileList.appendChild(item);
    }

    if (count > 0) {
        zoneEl.classList.add('has-files');
        prompt.style.display = 'none';
        addBtn.style.display = count < 2 ? '' : 'none';
    } else {
        zoneEl.classList.remove('has-files');
        prompt.style.display = '';
        addBtn.style.display = 'none';
    }
}

function clearSlot(zone, slotIndex) {
    const count = zoneFiles[zone];

    if (count === 2 && slotIndex === 0) {
        const input1 = document.getElementById(zone + 'File1');
        const input2 = document.getElementById(zone + 'File2');
        const dt = new DataTransfer();
        dt.items.add(input2.files[0]);
        input1.files = dt.files;
        input2.value = '';
        zoneFiles[zone] = 1;
    } else if (slotIndex === 0) {
        document.getElementById(zone + 'File1').value = '';
        zoneFiles[zone] = 0;
    } else {
        document.getElementById(zone + 'File2').value = '';
        zoneFiles[zone] = 1;
    }

    renderZone(zone);
    updateSubmitButton();
}

function updateSubmitButton() {
    const btn = document.getElementById('btn');
    const counter = document.getElementById('uploadCounter');

    let totalFiles = 0;
    for (let i = 0; i < zones.length; i++) {
        totalFiles += zoneFiles[zones[i]];
    }

    if (totalFiles === 0) {
        btn.disabled = true;
        counter.innerHTML = 'Upload at least <strong>1 file</strong> to continue';
    } else {
        btn.disabled = false;
        counter.innerHTML = '<strong>' + totalFiles + '</strong> file' +
            (totalFiles > 1 ? 's' : '') + ' ready to merge';
    }
}

/* ══════════════════════════════════════════════════════════════
   Form Handling
   ══════════════════════════════════════════════════════════════ */
function handleForm(e) {
    e.preventDefault();

    uploadQueue = [];
    processedFiles = [];
    const expectedMap = { ela: 'ela', sci: 'science', math: 'math' };

    // 1. Check existing file if mode is existing
    if (currentMode === 'existing') {
        if (!existingFile) {
            showError('Please select an existing spreadsheet to append to.');
            return;
        }
    }

    // 2. Queue files
    for (let z = 0; z < zones.length; z++) {
        const zone = zones[z];
        const count = zoneFiles[zone];
        for (let i = 1; i <= count; i++) {
            const input = document.getElementById(zone + 'File' + i);
            if (input.files && input.files.length > 0) {
                uploadQueue.push({
                    file: input.files[0],
                    subject: expectedMap[zone],
                    label: zoneLabels[zone] + ' File ' + i
                });
            }
        }
    }

    if (uploadQueue.length === 0) {
        showError('Please select at least one file to merge.');
        return;
    }

    // Prepare UI
    const btn = document.getElementById('btn');
    btn.disabled = true;
    btn.style.display = 'none';
    document.getElementById('status').innerHTML = '';
    document.getElementById('progressContainer').classList.add('active');
    updateProgressUI(0, 'Starting process...');

    isProcessing = true;

    // Start Processing
    if (currentMode === 'existing') {
        processExistingFile();
    } else {
        processNextFile(0);
    }
}

function processExistingFile() {
    updateProgressUI(10, 'Reading existing spreadsheet...');
    const reader = new FileReader();
    reader.onload = function (e) {
        try {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            const firstSheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[firstSheetName];
            const json = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

            // Proceed to normal files, passing the existing data
            processNextFile(0, json);
        } catch (err) {
            showError('Failed to parse existing file: ' + err.message);
        }
    };
    reader.onerror = function () {
        showError('Failed to read existing file.');
    };
    reader.readAsArrayBuffer(existingFile);
}

function processNextFile(index, existingData) {
    if (index >= uploadQueue.length) {
        finalizeMerge(existingData);
        return;
    }

    const item = uploadQueue[index];
    // Progress calculation adapted to accommodate existing file step
    const basePct = currentMode === 'existing' ? 20 : 0;
    const itemPct = Math.round((index / uploadQueue.length) * 60);
    const pct = basePct + itemPct;

    updateProgressUI(pct, 'Reading ' + item.label + '...');

    const reader = new FileReader();
    reader.onload = function (e) {
        try {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            const firstSheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[firstSheetName];
            const json = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

            // Processing Logic
            const detection = detectFileType(json);
            if (!detection.valid) {
                throw new Error(detection.message);
            }
            if (item.subject && detection.subject !== item.subject) {
                throw new Error('Wrong file type! Expected ' + item.subject.toUpperCase() + '.');
            }

            processedFiles.push({
                data: json,
                subject: detection.subject,
                season: detection.season
            });

            // Next
            processNextFile(index + 1, existingData);

        } catch (err) {
            showError('Error in ' + item.label + ': ' + err.message);
        }
    };
    reader.onerror = function () {
        showError('Failed to read file ' + item.label);
    };
    reader.readAsArrayBuffer(item.file);
}

function finalizeMerge(existingData) {
    updateProgressUI(80, 'Merging data...');

    setTimeout(function () {
        try {
            const mergedData = mergeData(processedFiles, currentMode, existingData);
            generateAndDownload(mergedData);
        } catch (e) {
            showError('Merge failed: ' + e.message);
        }
    }, 500);
}

function generateAndDownload(data) {
    updateProgressUI(90, 'Applying styles & Generating file...');

    setTimeout(function () {
        try {
            const wb = XLSX.utils.book_new();
            const ws = XLSX.utils.aoa_to_sheet(data);

            applyStyles(ws, data);

            XLSX.utils.book_append_sheet(wb, ws, "Merged Data");

            const filename = currentMode === 'existing'
                ? "Updated_Student_Data.xlsx"
                : "Merged_Student_Data.xlsx";

            XLSX.writeFile(wb, filename);

            updateProgressUI(100, 'Done!');
            setTimeout(showSuccess, 800);
        } catch (e) {
            showError('Export failed: ' + e.message);
        }
    }, 500);
}

/* ══════════════════════════════════════════════════════════════
   Core Logic & Helpers
   ══════════════════════════════════════════════════════════════ */
// ... (Logic functions normalizeHeader, stripSeason, buildOutputMap, detectFileType, mergeData, applyStyles)

function normalizeHeader(h) {
    return (h || '').toString().toLowerCase().replace(/[^a-z0-9]/g, '');
}

const SEASON_REGEX = /[\s\-]*(FALL|Fall|fall|WINTER|Winter|winter)$/i;

function stripSeason(header) {
    return header.replace(SEASON_REGEX, '').trim();
}

function buildOutputMap() {
    const map = {};
    for (const h of OUTPUT_HEADERS) {
        if (SHARED_KEYS.includes(h)) continue;
        const base = stripSeason(h).toLowerCase();
        const isFall = /fall$/i.test(h);
        if (!map[base]) map[base] = {};
        map[base][isFall ? 'fall' : 'winter'] = h;
    }
    return map;
}

function detectFileType(data) {
    if (!data || data.length < 2) {
        return { valid: false, message: 'File is empty (no data rows).' };
    }

    const headers = data[0].map(h => h ? h.toString().trim() : '');
    const headerStr = headers.map(normalizeHeader).join('|||');

    let subject = null;
    const NORM_SIGS = {};
    for (const k in SUBJECT_SIGNATURES) NORM_SIGS[k] = normalizeHeader(SUBJECT_SIGNATURES[k]);

    for (const key in NORM_SIGS) {
        if (headerStr.indexOf(NORM_SIGS[key]) !== -1) {
            subject = key;
            break;
        }
    }

    if (!subject) {
        return {
            valid: false,
            message: 'Could not identify the subject. Expected ELA, Science, or Math headers.'
        };
    }

    let trCol = -1;
    for (let c = 0; c < headers.length; c++) {
        if (normalizeHeader(headers[c]) === 'testreason') {
            trCol = c;
            break;
        }
    }

    if (trCol === -1) {
        return { valid: false, subject, message: 'Could not find a "Test Reason" column.' };
    }

    const testReason = data[1][trCol].toString().trim();
    const season = VALID_TEST_REASONS[testReason] || null;

    if (!season) {
        return {
            valid: false, subject, testReason,
            message: 'Unrecognized Test Reason: "' + testReason + '". Expected "Fall 2025..." or "Winter 2026...".'
        };
    }

    return {
        valid: true, subject, season, testReason,
        message: subject.toUpperCase() + ' — ' + (season === 'fall' ? 'Fall...' : 'Winter...') + ' detected ✓'
    };
}

function mergeData(sources, mode, existingData) {
    const outputMap = buildOutputMap();
    const students = {};
    const studentOrder = [];
    const extraHeaders = [];

    // Load existing data if present
    if (mode === 'existing' && existingData && existingData.length >= 2) {
        const headers = existingData[0];
        let sidCol = -1;
        for (let i = 0; i < headers.length; i++) {
            if (normalizeHeader(headers[i]) === 'studentid') {
                sidCol = i;
                break;
            }
        }

        if (sidCol !== -1) {
            // Identify extra headers first
            for (let i = 0; i < headers.length; i++) {
                const hName = headers[i].toString().trim();
                if (hName && !OUTPUT_HEADERS.includes(hName) && !extraHeaders.includes(hName)) {
                    extraHeaders.push(hName);
                }
            }

            for (let r = 1; r < existingData.length; r++) {
                const row = existingData[r];
                const sid = (row[sidCol] || '').toString().trim();
                if (!sid) continue;

                if (!students[sid]) {
                    students[sid] = {};
                    studentOrder.push(sid);
                }

                for (let c = 0; c < headers.length; c++) {
                    const hName = headers[c].toString().trim();
                    const val = row[c];

                    if (val !== undefined && val !== null && val !== '') {
                        students[sid][hName] = val;
                    }
                }
            }
        }
    }

    // Merge new sources
    for (const source of sources) {
        const data = source.data;
        if (!data || data.length < 2) continue;

        const headers = data[0];
        const season = source.season;
        const colMap = [];
        let idCol = -1;

        for (let c = 0; c < headers.length; c++) {
            const raw = (headers[c] || '').toString().trim();
            if (!raw) { colMap.push(null); continue; }

            const normRaw = normalizeHeader(raw);
            let isShared = false;
            for (const k of SHARED_KEYS) {
                if (normRaw === normalizeHeader(k)) {
                    colMap.push(k);
                    if (k === 'Student ID') idCol = c;
                    isShared = true;
                    break;
                }
            }
            if (isShared) continue;

            const base = stripSeason(raw).toLowerCase();
            if (outputMap[base] && outputMap[base][season]) {
                colMap.push(outputMap[base][season]);
            } else {
                colMap.push(null);
            }
        }

        if (idCol === -1) continue;

        for (let r = 1; r < data.length; r++) {
            const row = data[r];
            if (!row) continue;
            const sid = (row[idCol] || '').toString().trim();
            if (!sid) continue;

            if (!students[sid]) {
                students[sid] = {};
                studentOrder.push(sid);
            }

            for (let c = 0; c < colMap.length; c++) {
                const targetHeader = colMap[c];
                if (!targetHeader) continue;
                const val = row[c];
                if (val !== '' && val !== null && val !== undefined) {
                    students[sid][targetHeader] = val;
                }
            }
        }
    }

    const dataRows = [];
    const finalHeaders = [...OUTPUT_HEADERS, ...extraHeaders];

    for (const sid of studentOrder) {
        const student = students[sid];
        const row = [];
        for (const h of finalHeaders) {
            row.push(student[h] || '');
        }
        dataRows.push(row);
    }

    // Sort
    dataRows.sort((a, b) => {
        const nameA = a[0] ? a[0].toString().toLowerCase() : '';
        const nameB = b[0] ? b[0].toString().toLowerCase() : '';
        if (nameA < nameB) return -1;
        if (nameA > nameB) return 1;
        return 0;
    });

    return [finalHeaders].concat(dataRows);
}

function applyStyles(ws, data) {
    if (!data || data.length === 0) return;

    const range = XLSX.utils.decode_range(ws['!ref']);
    const numCols = range.e.c + 1;
    const numRows = range.e.r + 1;

    const fallHeaderBg = { rgb: "FDE8D0" };
    const fallDataBg = { rgb: "FFF5EB" };
    const winterHeaderBg = { rgb: "D0E4FD" };
    const winterDataBg = { rgb: "EBF3FF" };
    const sharedHeaderBg = { rgb: "E2E8F0" };

    const colWidths = [];

    for (let C = 0; C < numCols; ++C) {
        const headerVal = (data[0][C] || '').toString();
        const isFall = /[-\s]FALL$/i.test(headerVal);
        const isWinter = /[-\s]WINTER$/i.test(headerVal);
        let maxLen = headerVal.length;

        for (let R = 0; R < numRows; ++R) {
            const cellAddr = XLSX.utils.encode_cell({ c: C, r: R });
            if (!ws[cellAddr]) continue;

            const style = {
                font: { name: "Calibri", sz: 11 },
                border: {
                    top: { style: "thin", color: { auto: 1 } },
                    bottom: { style: "thin", color: { auto: 1 } },
                    left: { style: "thin", color: { auto: 1 } },
                    right: { style: "thin", color: { auto: 1 } }
                }
            };

            if (R === 0) {
                style.font.bold = true;
                style.alignment = { wrapText: true, horizontal: "center", vertical: "center" };
                if (isFall) style.fill = { fgColor: fallHeaderBg };
                else if (isWinter) style.fill = { fgColor: winterHeaderBg };
                else style.fill = { fgColor: sharedHeaderBg };
            } else {
                if (isFall) style.fill = { fgColor: fallDataBg };
                else if (isWinter) style.fill = { fgColor: winterDataBg };
                else style.fill = { fgColor: { rgb: "FFFFFF" } };
            }
            ws[cellAddr].s = style;

            const val = ws[cellAddr].v;
            const valLen = (val ? val.toString().length : 0);
            if (valLen > maxLen) maxLen = valLen;
        }
        colWidths.push({ wch: Math.min(maxLen + 2, 40) }); // slightly wider cap
    }

    ws['!cols'] = colWidths;
    const rowHeights = [{ hpt: 30 }];
    for (let r = 1; r < numRows; r++) rowHeights.push({ hpt: 15 });
    ws['!rows'] = rowHeights;
    ws['!freeze'] = { xSplit: "0", ySplit: "1" };
    ws['!autofilter'] = { ref: ws['!ref'] };
}

function showSuccess() {
    document.getElementById('progressContainer').classList.remove('active');
    const statusDiv = document.getElementById('status');
    statusDiv.innerHTML = '';

    const resultPanel = document.createElement('div');
    resultPanel.className = 'result-panel';

    const resultHeader = document.createElement('div');
    resultHeader.className = 'result-header';

    const resultCheck = document.createElement('div');
    resultCheck.className = 'result-check';
    resultCheck.textContent = '✅';
    resultHeader.appendChild(resultCheck);

    const resultHeaderText = document.createElement('div');
    resultHeaderText.className = 'result-header-text';

    const h3 = document.createElement('h3');
    h3.textContent = 'Success!';
    resultHeaderText.appendChild(h3);

    const p = document.createElement('p');
    p.textContent = 'Your merged file should begin downloading shortly.';
    resultHeaderText.appendChild(p);

    resultHeader.appendChild(resultHeaderText);
    resultPanel.appendChild(resultHeader);

    const resultActions = document.createElement('div');
    resultActions.className = 'result-actions';
    resultActions.style.justifyContent = 'center';

    const startOverBtn = document.createElement('button');
    startOverBtn.className = 'result-action-btn action-format';
    startOverBtn.style.flex = '0 0 auto';
    startOverBtn.style.minWidth = '120px';
    startOverBtn.addEventListener('click', resetBtn);

    const actionIcon = document.createElement('div');
    actionIcon.className = 'action-icon';
    actionIcon.textContent = '🔄';
    startOverBtn.appendChild(actionIcon);

    const actionLabel = document.createElement('span');
    actionLabel.className = 'action-label';
    actionLabel.textContent = 'Start Over';
    startOverBtn.appendChild(actionLabel);

    resultActions.appendChild(startOverBtn);
    resultPanel.appendChild(resultActions);

    statusDiv.appendChild(resultPanel);
}

function updateProgressUI(pct, text) {
    const fill = document.getElementById('progressFill');
    const textEl = document.getElementById('progressText');
    const pctEl = document.getElementById('progressPercent');
    fill.style.width = pct + '%';
    textEl.textContent = text;
    pctEl.textContent = pct + '%';
}

function showError(msg) {
    isProcessing = false;
    document.getElementById('progressContainer').classList.remove('active');
    const btn = document.getElementById('btn');
    btn.style.display = '';
    btn.disabled = false;
    document.getElementById('status').innerHTML =
        '<span class="status-msg status-error">⚠️&nbsp;' + msg + '</span>';
}

function resetBtn() {
    const btn = document.getElementById('btn');
    btn.disabled = false;
    btn.style.display = '';
    document.getElementById('status').innerHTML = '';
    uploadQueue = [];
    processedFiles = [];
    existingFile = null;
    document.getElementById('existingFile').value = '';
    document.getElementById('existingFileName').textContent = '';
    // We don't clear dropzones to allow reuse if user just wanted to restart
}

/* ══════════════════════════════════════════════════════════════
   Initialization & Event Listeners
   ══════════════════════════════════════════════════════════════ */

if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
        setupEventListeners();
    });
}

function setupEventListeners() {
    // Mode Selection
    const newModeBtn = document.getElementById('mode-card-new');
    if (newModeBtn) newModeBtn.addEventListener('click', () => selectMode('new'));

    const existingModeBtn = document.getElementById('mode-card-existing');
    if (existingModeBtn) existingModeBtn.addEventListener('click', () => selectMode('existing'));

    // Form
    const form = document.getElementById('mergeForm');
    if (form) form.addEventListener('submit', handleForm);

    const backBtn = document.getElementById('btn-back');
    if (backBtn) backBtn.addEventListener('click', showModeScreen);

    // Existing File
    const existingZone = document.getElementById('existing-zone');
    if (existingZone) existingZone.addEventListener('click', triggerExistingBrowse);

    const existingFile = document.getElementById('existingFile');
    if (existingFile) existingFile.addEventListener('change', function () { handleExistingPick(this); });

    // Zones
    ['ela', 'sci', 'math'].forEach(zone => {
        const zoneEl = document.getElementById(zone + '-zone');
        if (zoneEl) {
            zoneEl.addEventListener('dragover', (e) => {
                e.preventDefault();
                zoneEl.classList.add('drag-over');
            });
            zoneEl.addEventListener('dragleave', () => zoneEl.classList.remove('drag-over'));
            zoneEl.addEventListener('drop', (e) => handleDrop(e, zone));
        }

        const file1 = document.getElementById(zone + 'File1');
        if (file1) file1.addEventListener('change', function () { handlePick(this, zone, 0); });

        const file2 = document.getElementById(zone + 'File2');
        if (file2) file2.addEventListener('change', function () { handlePick(this, zone, 1); });

        const prompt = document.getElementById(zone + '-prompt');
        if (prompt) prompt.addEventListener('click', () => triggerBrowse(zone));

        const addBtn = document.getElementById(zone + '-add');
        if (addBtn) addBtn.addEventListener('click', () => triggerBrowse(zone));
    });
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { stripSeason, mergeData, OUTPUT_HEADERS };
}
