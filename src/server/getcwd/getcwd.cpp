#include "stdafx.h"

#include "q.h"

string trim(string s) {
	auto str = s.c_str();
	// Trim leading non-letters
	while (!isalnum(*str)) str++;

	// Trim trailing non-letters
	auto end = str + strlen(str) - 1;
	while (end > str && !isalnum(*end)) end--;

	return string(str, end + 1);
}

int err(string msg) {
	cout << "error:" << msg << endl;
	return GetLastError();
}

void writeData(const string &cwd, const string &title) {
	cout << trim(cwd) << "?" << trim(title) << endl;
}

void loop() {
	string line;
	while (1) {
		getline(cin, line);
		if (line.empty()) {
			return; // terminate
		}

		auto pid = atoi(line.c_str());

		string cwd;
		string title;
		auto error = getCwd(pid, cwd, title);

		if (error.empty()) {
			writeData(cwd, title);
		}
		else {
			err(error);
		}
	}
}

int main(int argc, char *argv[]) {
	if (argc < 2) {
		loop();
		return 0;
	}

	auto pid = atoi(argv[1]);

	string cwd;
	string title;
	auto error = getCwd(pid, cwd, title);

	if (error.empty()) {
		writeData(cwd, title);
		return 0;
	}

	return err(error);
}