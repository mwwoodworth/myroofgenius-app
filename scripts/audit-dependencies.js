const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

async function auditDependencies() {
  console.log('\uD83D\uDD0D Auditing dependencies...\n');
  console.log('Checking for unused dependencies...');
  try {
    const { stdout } = await execPromise('npx depcheck');
    console.log(stdout || '✅ No unused dependencies found\n');
  } catch (error) {
    console.log('⚠️  Unused dependencies found:', error.stdout);
  }

  console.log('Running security audit...');
  try {
    const { stdout } = await execPromise('npm audit --json');
    const audit = JSON.parse(stdout);
    if (audit.metadata.vulnerabilities.total === 0) {
      console.log('✅ No security vulnerabilities found\n');
    } else {
      console.log(`⚠️  Found ${audit.metadata.vulnerabilities.total} vulnerabilities`);
      console.log(`   High: ${audit.metadata.vulnerabilities.high}`);
      console.log(`   Medium: ${audit.metadata.vulnerabilities.moderate}`);
      console.log(`   Low: ${audit.metadata.vulnerabilities.low}\n`);
    }
  } catch (error) {
    console.error('Error running audit:', error);
  }

  console.log('Checking for outdated packages...');
  try {
    const { stdout } = await execPromise('npm outdated --json');
    const outdated = JSON.parse(stdout || '{}');
    if (Object.keys(outdated).length === 0) {
      console.log('✅ All packages up to date\n');
    } else {
      console.log('⚠️  Outdated packages:');
      Object.entries(outdated).forEach(([pkg, info]) => {
        console.log(`   ${pkg}: ${info.current} → ${info.latest}`);
      });
    }
  } catch (error) {
    console.log('Completed outdated check\n');
  }
}

auditDependencies();
