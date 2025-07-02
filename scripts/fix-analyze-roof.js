const fs = require('fs');
const path = require('path');

// Adjusted path to match current repo structure
const routePath = './app/api/ai/analyze-roof/route.ts';

if (fs.existsSync(routePath)) {
  let content = fs.readFileSync(routePath, 'utf-8');
  
  // Fix common type issues
  content = content.replace(/catch \(error\)/g, 'catch (error: unknown)');
  content = content.replace(/: any/g, ': unknown');
  content = content.replace(/as any/g, 'as unknown');
  
  // Fix FormData handling
  content = content.replace(
    /const formData = await request\.formData\(\)/g,
    'const formData = await request.formData() as FormData'
  );
  
  // Fix error handling pattern
  if (!content.includes('error instanceof Error')) {
    content = content.replace(
      /console\.error\(['"](.+?)['"], error\)/g,
      `console.error('$1', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';`
    );
  }
  
  fs.writeFileSync(routePath, content);
  console.log('✅ Fixed analyze-roof route type issues');
} else {
  console.log('❌ analyze-roof route not found');
}
