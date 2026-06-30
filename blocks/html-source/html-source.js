function getRows(block) {
  return [...block.children]
    .map((row) => [...row.children])
    .filter((cells) => cells.length >= 2);
}

function decode(value) {
  const textArea = document.createElement('textarea');
  textArea.innerHTML = value;
  return textArea.value;
}

function getSource(cell) {
  const code = cell.querySelector('code');
  return code ? decode(code.textContent.trim()) : cell.innerHTML.trim();
}

export default function decorate(block) {
  const rows = getRows(block);
  const sourceRow = rows.find(([key]) => key.textContent.trim().toLowerCase() === 'source');
  const source = sourceRow ? getSource(sourceRow[1]) : decode(block.textContent.trim());

  block.classList.add('html-source-block');
  block.innerHTML = source;
}
