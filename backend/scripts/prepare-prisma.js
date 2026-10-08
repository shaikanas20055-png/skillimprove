const fs = require('fs');
const path = require('path');

const schemaPath = path.join(__dirname, '..', 'prisma', 'schema.prisma');

function preparePrisma() {
  if (!fs.existsSync(schemaPath)) {
    console.warn('[prepare-prisma] schema.prisma not found at:', schemaPath);
    return;
  }

  const databaseUrl = process.env.DATABASE_URL || '';
  let content = fs.readFileSync(schemaPath, 'utf8');

  // Determine target datasource provider based on DATABASE_URL
  let targetProvider = 'sqlite';
  if (databaseUrl.startsWith('postgresql://') || databaseUrl.startsWith('postgres://')) {
    targetProvider = 'postgresql';
  } else if (databaseUrl.startsWith('mysql://')) {
    targetProvider = 'mysql';
  }

  // Replace only the provider inside datasource db { ... } block
  const datasourceBlockRegex = /(datasource\s+db\s*\{[\s\S]*?provider\s*=\s*")([^"]+)("[\s\S]*?\})/;
  const match = content.match(datasourceBlockRegex);

  if (match) {
    const currentProvider = match[2];
    if (currentProvider !== targetProvider) {
      console.log(`[prepare-prisma] Switching Prisma datasource provider from "${currentProvider}" to "${targetProvider}" to match DATABASE_URL.`);
      content = content.replace(datasourceBlockRegex, `$1${targetProvider}$3`);
      fs.writeFileSync(schemaPath, content, 'utf8');
      console.log(`[prepare-prisma] Successfully updated prisma/schema.prisma for ${targetProvider}.`);
    } else {
      console.log(`[prepare-prisma] Prisma datasource provider is already "${targetProvider}".`);
    }
  } else {
    console.warn('[prepare-prisma] Could not locate datasource db provider block in schema.prisma.');
  }
}

preparePrisma();
