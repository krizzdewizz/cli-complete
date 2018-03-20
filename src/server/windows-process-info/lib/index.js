const native = require('./windows_process_info.node');

function getProcessInfo(pid, callback) {
	native.getProcessInfo(pid, callback);
}

module.exports = getProcessInfo;
