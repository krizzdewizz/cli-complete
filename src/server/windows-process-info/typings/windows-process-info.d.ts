declare module 'windows-process-info' {
	export interface ProcessInfo {
		cwd: string,
		title: string,
		commandLine: string,
		error?: string
	}

	export function getProcessInfo(pid: number, callback: (info: ProcessInfo) => void): void;
}
