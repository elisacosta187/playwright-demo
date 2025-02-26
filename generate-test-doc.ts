import * as fs from 'fs';
import * as path from 'path';
import * as util from 'util';

// Promisify filesystem functions
const readdir = util.promisify(fs.readdir);
const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);
const mkdir = util.promisify(fs.mkdir);

// Types for parsed test data
interface Step {
  title: string;
}

interface Hook {
  type: 'beforeAll' | 'beforeEach' | 'afterEach' | 'afterAll';
  steps: Step[];
}

interface Test {
  title: string;
  steps: Step[];
}

interface Describe {
  title: string;
  hooks: Hook[];
  tests: Test[];
}

interface TestFile {
  fileName: string;
  describes: Describe[];
}

// Function to parse test files and extract test information
async function parseTestFile(filePath: string): Promise<TestFile> {
  const fileName = path.basename(filePath);
  const content = await readFile(filePath, 'utf8');
  
  const describes: Describe[] = [];
  let currentDescribe: Describe | null = null;
  let currentTest: Test | null = null;
  let currentHook: Hook | null = null;
  
  // Regular expressions to match describe blocks, test blocks, hooks, and steps
  const describeRegex = /describe\s*\(\s*['"](.+?)['"]|test\.describe\s*\(\s*['"](.+?)['"]/g;
  const testRegex = /test\s*\(\s*['"](.+?)['"]|it\s*\(\s*['"](.+?)['"]/g;
  const hookRegex = /(beforeAll|beforeEach|afterEach|afterAll)\s*\(/g;
  const stepRegex = /step\s*\(\s*['"](.+?)['"]/g;
  
  // Split the content into lines for processing
  const lines = content.split('\n');
  let insideHook = false;
  let insideTest = false;
  let bracketCount = 0;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Count brackets to track scope
    bracketCount += (line.match(/\{/g) || []).length;
    bracketCount -= (line.match(/\}/g) || []).length;
    
    // Check if we've exited a hook or test block
    if (bracketCount === 0) {
      insideHook = false;
      insideTest = false;
      currentHook = null;
      currentTest = null;
    }
    
    // Match describe blocks
    const describeMatch = [...line.matchAll(describeRegex)];
    if (describeMatch.length > 0) {
      const describeTitle = describeMatch[0][1] || describeMatch[0][2];
      currentDescribe = {
        title: describeTitle,
        hooks: [],
        tests: []
      };
      describes.push(currentDescribe);
      continue;
    }
    
    // Match hook blocks
    const hookMatch = [...line.matchAll(hookRegex)];
    if (hookMatch.length > 0 && currentDescribe) {
      const hookType = hookMatch[0][1] as 'beforeAll' | 'beforeEach' | 'afterEach' | 'afterAll';
      currentHook = {
        type: hookType,
        steps: []
      };
      currentDescribe.hooks.push(currentHook);
      insideHook = true;
      insideTest = false;
      continue;
    }
    
    // Match test blocks
    const testMatch = [...line.matchAll(testRegex)];
    if (testMatch.length > 0 && currentDescribe) {
      const testTitle = testMatch[0][1] || testMatch[0][2];
      currentTest = {
        title: testTitle,
        steps: []
      };
      currentDescribe.tests.push(currentTest);
      insideTest = true;
      insideHook = false;
      continue;
    }
    
    // Match steps
    const stepMatch = [...line.matchAll(stepRegex)];
    if (stepMatch.length > 0) {
      const stepTitle = stepMatch[0][1];
      
      if (insideHook && currentHook) {
        currentHook.steps.push({ title: stepTitle });
      } else if (insideTest && currentTest) {
        currentTest.steps.push({ title: stepTitle });
      }
    }
  }
  
  return {
    fileName,
    describes
  };
}

// Function to generate Markdown content from parsed test data
function generateMarkdown(testFile: TestFile): string {
  let markdown = '';
  
  for (const describe of testFile.describes) {
    markdown += `# ${describe.title}\n\n`;
    
    // Get hooks for this describe block
    const beforeAllHooks = describe.hooks.filter(hook => hook.type === 'beforeAll');
    const beforeEachHooks = describe.hooks.filter(hook => hook.type === 'beforeEach');
    const afterEachHooks = describe.hooks.filter(hook => hook.type === 'afterEach');
    const afterAllHooks = describe.hooks.filter(hook => hook.type === 'afterAll');
    
    // Document beforeAll hooks if they exist
    if (beforeAllHooks.length > 0) {
      markdown += `## Setup (beforeAll):\n\n\`\`\`typescript\n`;
      for (const hook of beforeAllHooks) {
        for (const step of hook.steps) {
          markdown += `- '${step.title}'\n`;
        }
      }
      markdown += `\`\`\`\n\n`;
    }
    
    // Generate documentation for each test
    for (const test of describe.tests) {
      markdown += `## ${test.title}\n\n`;
      
      markdown += `### Steps:\n\n\`\`\`typescript\n`;
      
      // Include beforeEach steps first
      if (beforeEachHooks.length > 0) {
        for (const hook of beforeEachHooks) {
          for (const step of hook.steps) {
            markdown += `- '${step.title}'\n`;
          }
        }
      }
      
      // Include test steps
      for (const step of test.steps) {
        markdown += `- '${step.title}'\n`;
      }
      
      // Include afterEach steps
      if (afterEachHooks.length > 0) {
        for (const hook of afterEachHooks) {
          for (const step of hook.steps) {
            markdown += `- '${step.title}'\n`;
          }
        }
      }
      
      markdown += `\`\`\`\n\n`;
    }
    
    // Document afterAll hooks if they exist
    if (afterAllHooks.length > 0) {
      markdown += `## Teardown (afterAll):\n\n\`\`\`typescript\n`;
      for (const hook of afterAllHooks) {
        for (const step of hook.steps) {
          markdown += `- '${step.title}'\n`;
        }
      }
      markdown += `\`\`\`\n\n`;
    }
  }
  
  return markdown;
}

// Main function to process all test files in a directory
async function generateDocumentation(sourceDir: string): Promise<void> {
  // Create the docs directory if it doesn't exist
  const docsDir = path.join(process.cwd(), 'docs');
  try {
    await mkdir(docsDir, { recursive: true });
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code !== 'EEXIST') {
      throw err;
    }
  }
  
  // Get all files in the source directory
  const files = await readdir(sourceDir);
  
  // Filter for Playwright test files
  const testFiles = files.filter(file => 
    file.endsWith('.spec.ts') || 
    file.endsWith('.test.ts')
  );
  
  console.log(`Found ${testFiles.length} test files`);
  
  // Process each test file
  for (const file of testFiles) {
    const filePath = path.join(sourceDir, file);
    
    try {
      // Parse the test file
      const testData = await parseTestFile(filePath);
      
      // Generate Markdown content
      const markdown = generateMarkdown(testData);
      
      // Generate output file name (replace .spec.ts or .test.ts with .md)
      const baseName = path.basename(file).replace(/\.(spec|test)\.ts$/, '');
      const outputPath = path.join(docsDir, `${baseName}.md`);
      
      // Write the Markdown file
      await writeFile(outputPath, markdown);
      
      console.log(`Generated documentation for ${file} -> ${outputPath}`);
    } catch (err) {
      console.error(`Error processing ${file}:`, err);
    }
  }
}

// Usage example (to be executed directly)
const sourceDirectory = process.argv[2] || './tests';

generateDocumentation(sourceDirectory)
  .then(() => console.log('Documentation generation completed!'))
  .catch(err => console.error('Error generating documentation:', err));