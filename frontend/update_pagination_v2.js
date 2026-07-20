const fs = require('fs');
const path = require('path');

const targetDir = path.join(__dirname, 'src');

function walk(dir, files = []) {
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      walk(fullPath, files);
    } else if (file.endsWith('.jsx') || file.endsWith('.js')) {
      files.push(fullPath);
    }
  }
  return files;
}

const files = walk(targetDir);

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  if (!content.includes('<Pagination')) {
    continue;
  }

  console.log(`Processing: ${file}`);
  let modified = false;

  // 1. Determine which variable to use
  let countVar = 'totalCount';
  if (content.includes('const [totalItems') || content.includes('const [totalItems,')) {
    countVar = 'totalItems';
  } else {
    // If it doesn't have totalCount or totalItems, let's make sure it has totalCount
    if (!content.includes('totalCount') && content.includes('setTotalPages')) {
      content = content.replace(
        /const\s+\[\s*totalPages\s*,\s*setTotalPages\s*\]\s*=\s*useState\(\s*\d+\s*\);/g,
        (match) => {
          return `${match}\n  const [totalCount, setTotalCount] = useState(0);`;
        }
      );
      modified = true;
    }
    // And make sure setTotalCount is set
    if (content.includes('setTotalPages(') && !content.includes('setTotalCount(')) {
      const regex1 = /setTotalPages\(\s*(res|response)\.data\.last_page\s*\|\|\s*1\s*\);/g;
      if (regex1.test(content)) {
        content = content.replace(regex1, (match, p1) => {
          return `${match}\n          setTotalCount(${p1}.data.total || 0);`;
        });
        modified = true;
      }
      const regex2 = /setTotalPages\(\s*(res|response)\.data\.last_page\s*\);/g;
      if (regex2.test(content)) {
        content = content.replace(regex2, (match, p1) => {
          return `${match}\n          setTotalCount(${p1}.data.total || 0);`;
        });
        modified = true;
      }
    }
  }

  // 2. Replace <Pagination ... /> to include totalItems prop
  // Match <Pagination ... /> across multiple lines
  const paginationRegex = /<Pagination([\s\S]*?)\/>/g;
  content = content.replace(paginationRegex, (match, p1) => {
    if (p1.includes('totalItems=')) {
      // Already has it, but let's make sure it uses the correct variable
      if (countVar === 'totalItems' && p1.includes('totalItems={totalCount}')) {
        modified = true;
        return match.replace('totalItems={totalCount}', 'totalItems={totalItems}');
      }
      return match;
    }
    modified = true;
    // Insert totalItems prop
    return `<Pagination${p1} totalItems={${countVar}} />`;
  });

  // 3. Make sure the container wrapper is w-100 and not justify-content-center
  // Search for the wrapper div around <Pagination
  const wrapperRegex = /className=["'][^"']*?justify-content-center[^"']*?["'](\s*>[\s\S]*?<Pagination)/g;
  if (wrapperRegex.test(content)) {
    content = content.replace(wrapperRegex, (match, p1) => {
      modified = true;
      return 'className="mt-4 w-100"' + p1;
    });
  }

  if (modified) {
    fs.writeFileSync(file, content, 'utf8');
    console.log(`Updated: ${file}`);
  }
}
