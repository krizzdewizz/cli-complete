// const { remote } = window.require('electron');
// const { processTree } = remote.require('./server/process-tree');

// processTree(pid).then(tree => {
//     console.log('root pid: ', pid);

//     dumpTree(tree);
// });

export function dumpProcessTree(node, depth = 0) {
    console.log(`${'  '.repeat(depth)} -- ${node.name} -- ${node.pid}`);
    const children = node.children;
    if (children) {
        children.forEach(it => dumpProcessTree(it, depth + 1));
    }
}
