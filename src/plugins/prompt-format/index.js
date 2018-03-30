// @ts-check
const path = require('path');

const ENTITY_MAP = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', '\'': '&#39;', '/': '&#x2F;' };
function htmlEscape(text) {
    return text ? text.replace(/[&<>"'\/]/g, s => ENTITY_MAP[s]) : text;
}

function html(s, color) {
    return `<span style="color:${color}">${htmlEscape(s)}</span>`;
}

function formatCwd(cwd, focus) {
    if (!focus) {
        return cwd;
    }
    const baseName = path.basename(cwd);
    const parent = cwd.substring(0, cwd.length - baseName.length)
    return [
        html(parent, '#888888'),
        html(baseName, '#e600e6')
    ].join('');
}

async function formatPrompt({ procInfo, procIsSelf, focus }) {
    return [
        formatCwd(procInfo.cwd, focus),
        procIsSelf ? undefined : procInfo.title
    ]
        .filter(Boolean)
        .join(' - ');
}

module.exports = {
    formatPrompt
}