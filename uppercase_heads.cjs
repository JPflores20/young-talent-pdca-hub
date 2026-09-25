const fs = require('fs');
const path = require('path');
function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? 
      walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

let changedFiles = 0;
walkDir('src', function(filePath) {
  if (filePath.endsWith('.tsx')) {
    let content = fs.readFileSync(filePath, 'utf8');
    let newContent = content.replace(/<TableHead([^>]*)>([^<]+)<\/TableHead>/g, (match, p1, p2) => {
      // Don't uppercase if there are JSX elements inside (handled by the regex already to some extent since it uses [^<]+)
      // but just to be safe:
      return `<TableHead${p1}>${p2.toUpperCase()}</TableHead>`;
    });
    // Also uppercase <Label> tags just in case
    newContent = newContent.replace(/<Label([^>]*)>([^<]+)<\/Label>/g, (match, p1, p2) => {
      return `<Label${p1}>${p2.toUpperCase()}</Label>`;
    });
    // And StepCard titles? wait, StepCard titles are passed as props: title="PASO 5: ..."
    // Let's only do TableHead and Label for now
    if (content !== newContent) {
      fs.writeFileSync(filePath, newContent, 'utf8');
      changedFiles++;
      console.log('Updated', filePath);
    }
  }
});
console.log('Changed', changedFiles, 'files');
