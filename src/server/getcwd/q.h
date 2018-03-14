#include "stdafx.h"

// credits to:
// https://wj32.org/wp/2009/01/24/howto-get-the-command-line-of-processes/
// https://undocumented.ntinternals.net

typedef struct _Q {
	ULONG                   MaximumLength;
	ULONG                   Length;
	ULONG                   Flags;
	ULONG                   DebugFlags;
	PVOID                   ConsoleHandle;
	ULONG                   ConsoleFlags;
	HANDLE                  StdInputHandle;
	HANDLE                  StdOutputHandle;
	HANDLE                  StdErrorHandle;
	UNICODE_STRING          CurrentDirectoryPath;
	HANDLE                  CurrentDirectoryHandle;
	UNICODE_STRING          DllPath;
	UNICODE_STRING          ImagePathName;
	UNICODE_STRING          CommandLine;
	PVOID                   Environment;
	ULONG                   StartingPositionLeft;
	ULONG                   StartingPositionTop;
	ULONG                   Width;
	ULONG                   Height;
	ULONG                   CharWidth;
	ULONG                   CharHeight;
	ULONG                   ConsoleTextAttributes;
	ULONG                   WindowFlags;
	ULONG                   ShowWindowFlags;
	UNICODE_STRING          WindowTitle;
	UNICODE_STRING          DesktopName;
	UNICODE_STRING          ShellInfo;
	UNICODE_STRING          RuntimeData;
	//	RTL_DRIVE_LETTER_CURDIR DLCurrentDirectory[0x20];
} Q, *PQ;

typedef NTSTATUS(NTAPI *fnNtQueryInformationProcess)(
	IN  HANDLE ProcessHandle,
	IN  PROCESSINFOCLASS ProcessInformationClass,
	OUT PVOID ProcessInformation,
	IN  ULONG ProcessInformationLength,
	OUT PULONG ReturnLength    OPTIONAL
	);

class Handle {
	HANDLE _h;
public:
	Handle(HANDLE h) :_h(h) {}
	~Handle() {
		if (_h) { CloseHandle(_h); }
	}
};

PVOID getPebAddress(HANDLE processHandle)
{
	fnNtQueryInformationProcess fun = (fnNtQueryInformationProcess)GetProcAddress(GetModuleHandle("ntdll.dll"), "NtQueryInformationProcess");
	PROCESS_BASIC_INFORMATION pbi;

	fun(processHandle, ProcessBasicInformation, &pbi, sizeof(pbi), NULL);

	return pbi.PebBaseAddress;
}

#define BUFFER_SIZE 1024

string getCwd(int pid, string &outCwd, string &outTitle) {

	auto processHandle = OpenProcess(PROCESS_QUERY_INFORMATION | PROCESS_VM_READ, FALSE, pid);
	Handle toClose(processHandle);

	if (processHandle == 0)
	{
		return ""; // no error, process not found or not accessible
	}

	auto pebAddress = getPebAddress(processHandle);

	PVOID processParams;
	if (!ReadProcessMemory(processHandle, (PCHAR)pebAddress + offsetof(PEB, ProcessParameters), &processParams, sizeof(PVOID), NULL))
	{
		return "cannot get process parameters";
	}

	// CurrentDirectoryPath
	{
		UNICODE_STRING dirPath;
		if (!ReadProcessMemory(processHandle, (PCHAR)processParams + offsetof(Q, CurrentDirectoryPath), &dirPath, sizeof(dirPath), NULL))
		{
			return "cannot get directory path";
		}

		WCHAR dirPathContents[BUFFER_SIZE];
		if (!ReadProcessMemory(processHandle, dirPath.Buffer, dirPathContents, BUFFER_SIZE, NULL))
		{
			char q[1000];
			sprintf_s(q, 1000, "cannot get directory path contents (%d)", GetLastError());
			return q;
		}

		char buf[BUFFER_SIZE * 2];
		sprintf_s(buf, BUFFER_SIZE * 2, "%.*S\n", dirPath.Length / 2, dirPathContents);

		outCwd = buf;
	}

	// WindowTitle
	{
		UNICODE_STRING title;
		if (!ReadProcessMemory(processHandle, (PCHAR)processParams + offsetof(Q, WindowTitle), &title, sizeof(title), NULL))
		{
			return "cannot get directory path";
		}

		WCHAR titleContents[BUFFER_SIZE];
		if (!ReadProcessMemory(processHandle, title.Buffer, titleContents, BUFFER_SIZE, NULL))
		{
			char q[1000];
			sprintf_s(q, 1000, "cannot get title contents (%d)", GetLastError());
			return q;
		}

		char buf[BUFFER_SIZE * 2];
		sprintf_s(buf, BUFFER_SIZE * 2, "%.*S\n", title.Length / 2, titleContents);

		outTitle = buf;
	}

	return "";
}
