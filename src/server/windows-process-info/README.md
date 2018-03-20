# windows-process-info

Fetch Windows process info like cwd, title, command line using Node.js.

## Usage

Extract a [Release](https://github.com/krizzdewizz/windows-process-info/releases) into the source folder of your project.

```js
if (process.platform === 'win32') {

  const getProcessInfo = require('./windows-process-info');

  getProcessInfo(process.pid, info => console.log(info));
}
```
