export function parseModelEdits(response) {
  const firstBrace = response.indexOf('{');
  const lastBrace = response.lastIndexOf('}');
  if (firstBrace < 0 || lastBrace <= firstBrace) throw new Error('Svaret innehåller inget JSON-objekt.');

  const parsed = JSON.parse(response.slice(firstBrace, lastBrace + 1));
  if (!Array.isArray(parsed.edits) || parsed.edits.length < 1 || parsed.edits.length > 8) {
    throw new Error('JSON måste innehålla 1 till 8 edits.');
  }
  return parsed.edits;
}

export function applyLineEdits(fileContents, edits, allowedPaths) {
  const normalized = edits.map((edit, index) => {
    if (!edit || typeof edit.path !== 'string' || typeof edit.replacement !== 'string') {
      throw new Error(`Edit ${index + 1} saknar path eller replacement.`);
    }
    if (!allowedPaths.includes(edit.path)) throw new Error(`Otillåten fil i edit ${index + 1}: ${edit.path}`);
    if (!Number.isInteger(edit.startLine) || !Number.isInteger(edit.endLine)) {
      throw new Error(`Edit ${index + 1} måste ha heltal för startLine och endLine.`);
    }

    const content = fileContents.get(edit.path);
    if (typeof content !== 'string') throw new Error(`Filen ${edit.path} finns inte.`);
    const lineCount = content.split('\n').length;
    if (edit.startLine < 1 || edit.endLine < edit.startLine || edit.endLine > lineCount) {
      throw new Error(`Edit ${index + 1} har ogiltigt radintervall ${edit.startLine}-${edit.endLine} i ${edit.path} (${lineCount} rader).`);
    }
    if (edit.endLine - edit.startLine + 1 > 200) throw new Error(`Edit ${index + 1} försöker ersätta fler än 200 rader.`);

    return { ...edit, index };
  });

  const grouped = new Map();
  for (const edit of normalized) {
    if (!grouped.has(edit.path)) grouped.set(edit.path, []);
    grouped.get(edit.path).push(edit);
  }

  const result = new Map(fileContents);
  for (const [path, pathEdits] of grouped) {
    const ascending = [...pathEdits].sort((a, b) => a.startLine - b.startLine);
    for (let index = 1; index < ascending.length; index += 1) {
      if (ascending[index].startLine <= ascending[index - 1].endLine) {
        throw new Error(`Överlappande edits i ${path}: ${ascending[index - 1].startLine}-${ascending[index - 1].endLine} och ${ascending[index].startLine}-${ascending[index].endLine}.`);
      }
    }

    const lines = result.get(path).split('\n');
    for (const edit of [...ascending].reverse()) {
      const existing = lines.slice(edit.startLine - 1, edit.endLine).join('\n');
      if (existing === edit.replacement) throw new Error(`Edit ${edit.index + 1} ändrar ingenting i ${path}.`);
      lines.splice(edit.startLine - 1, edit.endLine - edit.startLine + 1, ...edit.replacement.split('\n'));
    }
    result.set(path, lines.join('\n'));
  }

  return { files: result, changedPaths: new Set(grouped.keys()) };
}
