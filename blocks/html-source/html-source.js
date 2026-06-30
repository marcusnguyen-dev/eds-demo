function getRows(block) {
  return [...block.children]
    .map((row) => [...row.children].map((cell) => cell.innerHTML.trim()))
    .filter((cells) => cells.length >= 2);
}

export default function decorate(block) {
  const rows = getRows(block);
  const sourceRow = rows.find(([key]) => key.replace(/<[^>]*>/g, '').trim().toLowerCase() === 'source');
  const source = sourceRow ? sourceRow[1] : block.textContent.trim();

  block.classList.add('html-source-block');
  block.innerHTML = source;
}
