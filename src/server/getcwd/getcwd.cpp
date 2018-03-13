#include "stdafx.h"

#include "q.h"

int err(string msg) {
	cout << "error:" << msg << endl;
	return GetLastError();
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
		auto error = getCwd(pid, cwd);

		if (error.empty()) {
			cout << cwd;
		} else {
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
	auto error = getCwd(pid, cwd);

	if (error.empty()) {
		cout << cwd;
		return 0;
	}

	return err(error);
}