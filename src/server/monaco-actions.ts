export const MONACO_ACTIONS: { id: string, label: string, unsupported?: boolean }[] = [
    {
        id: 'editor.action.moveCarretLeftAction',
        label: 'Move Caret Left'
    },
    {
        id: 'editor.action.moveCarretRightAction',
        label: 'Move Caret Right'
    },
    {
        id: 'editor.action.transposeLetters',
        label: 'Transpose Letters'
    },
    {
        id: 'editor.action.clipboardCutAction',
        label: 'Cut'
    },
    {
        id: 'editor.action.clipboardCopyAction',
        label: 'Copy',
        unsupported: true
    },
    {
        id: 'editor.action.clipboardPasteAction',
        label: 'Paste'
    },
    {
        id: 'editor.action.clipboardCopyWithSyntaxHighlightingAction',
        label: 'Copy With Syntax Highlighting'
    },
    {
        id: 'editor.action.commentLine',
        label: 'Toggle Line Comment'
    },
    {
        id: 'editor.action.addCommentLine',
        label: 'Add Line Comment'
    },
    {
        id: 'editor.action.removeCommentLine',
        label: 'Remove Line Comment'
    },
    {
        id: 'editor.action.blockComment',
        label: 'Toggle Block Comment',
        unsupported: true
    },
    {
        id: 'editor.action.showContextMenu',
        label: 'Show Editor Context Menu'
    },
    {
        id: 'actions.find',
        label: 'Find'
    },
    {
        id: 'editor.action.nextMatchFindAction',
        label: 'Find Next'
    },
    {
        id: 'editor.action.previousMatchFindAction',
        label: 'Find Previous'
    },
    {
        id: 'editor.action.nextSelectionMatchFindAction',
        label: 'Find Next Selection'
    },
    {
        id: 'editor.action.previousSelectionMatchFindAction',
        label: 'Find Previous Selection'
    },
    {
        id: 'editor.action.startFindReplaceAction',
        label: 'Replace'
    },
    {
        id: 'editor.action.addSelectionToNextFindMatch',
        label: 'Add Selection To Next Find Match'
    },
    {
        id: 'editor.action.addSelectionToPreviousFindMatch',
        label: 'Add Selection To Previous Find Match'
    },
    {
        id: 'editor.action.moveSelectionToNextFindMatch',
        label: 'Move Last Selection To Next Find Match'
    },
    {
        id: 'editor.action.moveSelectionToPreviousFindMatch',
        label: 'Move Last Selection To Previous Find Match'
    },
    {
        id: 'editor.action.selectHighlights',
        label: 'Select All Occurrences of Find Match'
    },
    {
        id: 'editor.action.changeAll',
        label: 'Change All Occurrences'
    },
    {
        id: 'find.history.showNext',
        label: 'Show Next Find Term'
    },
    {
        id: 'find.history.showPrevious',
        label: 'Show Previous Find Term'
    },
    {
        id: 'editor.unfold',
        label: 'Unfold',
        unsupported: true
    },
    {
        id: 'editor.unfoldRecursively',
        label: 'Unfold Recursively',
        unsupported: true
    },
    {
        id: 'editor.fold',
        label: 'Fold',
        unsupported: true
    },
    {
        id: 'editor.foldRecursively',
        label: 'Fold Recursively',
        unsupported: true
    },
    {
        id: 'editor.foldAll',
        label: 'Fold All',
        unsupported: true
    },
    {
        id: 'editor.unfoldAll',
        label: 'Unfold All',
        unsupported: true
    },
    {
        id: 'editor.foldLevel1',
        label: 'Fold Level 1',
        unsupported: true
    },
    {
        id: 'editor.foldLevel2',
        label: 'Fold Level 2',
        unsupported: true
    },
    {
        id: 'editor.foldLevel3',
        label: 'Fold Level 3',
        unsupported: true
    },
    {
        id: 'editor.foldLevel4',
        label: 'Fold Level 4',
        unsupported: true
    },
    {
        id: 'editor.foldLevel5',
        label: 'Fold Level 5',
        unsupported: true
    },
    {
        id: 'editor.foldLevel6',
        label: 'Fold Level 6',
        unsupported: true
    },
    {
        id: 'editor.foldLevel7',
        label: 'Fold Level 7',
        unsupported: true
    },
    {
        id: 'editor.foldLevel8',
        label: 'Fold Level 8',
        unsupported: true
    },
    {
        id: 'editor.foldLevel9',
        label: 'Fold Level 9',
        unsupported: true
    },
    {
        id: 'editor.action.formatDocument',
        label: 'Format Document',
        unsupported: true
    },
    {
        id: 'editor.action.formatSelection',
        label: 'Format Selection',
        unsupported: true
    },
    {
        id: 'editor.action.copyLinesUpAction',
        label: 'Copy Line Up'
    },
    {
        id: 'editor.action.copyLinesDownAction',
        label: 'Copy Line Down'
    },
    {
        id: 'editor.action.moveLinesUpAction',
        label: 'Move Line Up'
    },
    {
        id: 'editor.action.moveLinesDownAction',
        label: 'Move Line Down'
    },
    {
        id: 'editor.action.sortLinesAscending',
        label: 'Sort Lines Ascending'
    },
    {
        id: 'editor.action.sortLinesDescending',
        label: 'Sort Lines Descending'
    },
    {
        id: 'editor.action.trimTrailingWhitespace',
        label: 'Trim Trailing Whitespace'
    },
    {
        id: 'editor.action.deleteLines',
        label: 'Delete Line'
    },
    {
        id: 'editor.action.indentLines',
        label: 'Indent Line'
    },
    {
        id: 'editor.action.outdentLines',
        label: 'Outdent Line'
    },
    {
        id: 'editor.action.insertLineBefore',
        label: 'Insert Line Above'
    },
    {
        id: 'editor.action.insertLineAfter',
        label: 'Insert Line Below'
    },
    {
        id: 'deleteAllLeft',
        label: 'Delete All Left'
    },
    {
        id: 'deleteAllRight',
        label: 'Delete All Right'
    },
    {
        id: 'editor.action.joinLines',
        label: 'Join Lines'
    },
    {
        id: 'editor.action.transpose',
        label: 'Transpose characters around the cursor'
    },
    {
        id: 'editor.action.transformToUppercase',
        label: 'Transform to Uppercase'
    },
    {
        id: 'editor.action.transformToLowercase',
        label: 'Transform to Lowercase'
    },
    {
        id: 'editor.action.insertCursorAbove',
        label: 'Add Cursor Above'
    },
    {
        id: 'editor.action.insertCursorBelow',
        label: 'Add Cursor Below'
    },
    {
        id: 'editor.action.insertCursorAtEndOfEachLineSelected',
        label: 'Add Cursors to Line Ends'
    },
    {
        id: 'editor.action.quickFix',
        label: 'Quick Fix',
        unsupported: true
    },
    {
        id: 'editor.action.smartSelect.grow',
        label: 'Expand Select'
    },
    {
        id: 'editor.action.smartSelect.shrink',
        label: 'Shrink Select'
    },
    {
        id: 'editor.action.toggleHighContrast',
        label: 'Toggle High Contrast Theme',
        unsupported: true
    },
    {
        id: 'editor.action.toggleTabFocusMode',
        label: 'Toggle Tab Key Moves Focus',
        unsupported: true
    },
    {
        id: 'editor.action.gotoLine',
        label: 'Go to Line...'
    },
    {
        id: 'editor.action.quickCommand',
        label: 'Command Palette',
        unsupported: true
    },
    {
        id: 'editor.action.quickOutline',
        label: 'Go to Symbol...',
        unsupported: true
    },
    {
        id: 'editor.action.jumpToBracket',
        label: 'Go to Bracket',
        unsupported: true
    },
    {
        id: 'editor.action.inPlaceReplace.up',
        label: 'Replace with Previous Value'
    },
    {
        id: 'editor.action.inPlaceReplace.down',
        label: 'Replace with Next Value'
    },
    {
        id: 'editor.action.diffReview.next',
        label: 'Go to Next Difference',
        unsupported: true
    },
    {
        id: 'editor.action.diffReview.prev',
        label: 'Go to Previous Difference',
        unsupported: true
    },
    {
        id: 'editor.action.marker.next',
        label: 'Go to Next Error or Warning',
        unsupported: true
    },
    {
        id: 'editor.action.marker.prev',
        label: 'Go to Previous Error or Warning',
        unsupported: true
    },
    {
        id: 'editor.action.showHover',
        label: 'Show Hover',
        unsupported: true
    },
    {
        id: 'editor.action.openLink',
        label: 'Open Link'
    },
    {
        id: 'editor.action.triggerParameterHints',
        label: 'Trigger Parameter Hints',
        unsupported: true
    },
    {
        id: 'editor.action.rename',
        label: 'Rename Symbol',
        unsupported: true
    },
    {
        id: 'editor.action.triggerSuggest',
        label: 'Trigger Suggest'
    },
    {
        id: 'editor.action.showAccessibilityHelp',
        label: 'Show Accessibility Help'
    },
    {
        id: 'editor.action.inspectTokens',
        label: 'Developer: Inspect Tokens',
        unsupported: true
    },
    {
        id: 'editor.action.goToDeclaration',
        label: 'Go to Definition',
        unsupported: true
    },
    {
        id: 'editor.action.openDeclarationToTheSide',
        label: 'Open Definition to the Side',
        unsupported: true
    },
    {
        id: 'editor.action.previewDeclaration',
        label: 'Peek Definition',
        unsupported: true
    },
    {
        id: 'editor.action.goToImplementation',
        label: 'Go to Implementation',
        unsupported: true
    },
    {
        id: 'editor.action.peekImplementation',
        label: 'Peek Implementation',
        unsupported: true
    },
    {
        id: 'editor.action.goToTypeDefinition',
        label: 'Go to Type Definition',
        unsupported: true
    },
    {
        id: 'editor.action.peekTypeDefinition',
        label: 'Peek Type Definition',
        unsupported: true
    },
    {
        id: 'editor.action.referenceSearch.trigger',
        label: 'Find All References',
        unsupported: true
    }
];
